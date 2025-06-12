const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');
const Greenhouse = require('../models/AutoGreenhouse');
const SensorData = require('../models/SensorData');
const { protect, authorizeAdmin, checkGreenhouseOwnerOrAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

async function getSensorMiddleware(req, res, next) {
    let sensor;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid sensor ID format' });
        }
        sensor = await Sensor.findById(req.params.id).populate({
            path: 'greenhouseId',
            select: 'name ownerId hardwareId'
        });
        if (!sensor) return res.status(404).json({ message: 'Cannot find sensor' });

        if (req.user.role !== 'admin' && sensor.greenhouseId.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'User not authorized to access this sensor' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    req.sensor = sensor;
    next();
}

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
        const userGreenhouses = await Greenhouse.find({ ownerId: req.user.id }).select('_id');
        const greenhouseIds = userGreenhouses.map(gh => gh._id);
        query.greenhouseId = { $in: greenhouseIds };
    }
    const sensors = await Sensor.find(query).populate('greenhouseId', 'name');
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/greenhouse/:greenhouseId', protect, async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.greenhouseId)) {
            return res.status(400).json({ message: 'Invalid greenhouse ID format' });
        }
        const greenhouse = await Greenhouse.findById(req.params.greenhouseId);
        if (!greenhouse) {
            return res.status(404).json({ message: "Greenhouse not found" });
        }
        req.greenhouse = greenhouse; // Встановлюємо для checkGreenhouseOwnerOrAdmin
        checkGreenhouseOwnerOrAdmin(req, res, async () => {
            const sensors = await Sensor.find({ greenhouseId: req.params.greenhouseId }).populate('greenhouseId', 'name');
            res.json(sensors);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, async (req, res) => {
    const { type, greenhouseId, model, status, unit } = req.body;
    if (!type || !greenhouseId || !unit || !model) {
        return res.status(400).json({ message: "Sensor type, greenhouseId, model and unit are required" });
    }
    try {
        const greenhouse = await Greenhouse.findById(greenhouseId);
        if (!greenhouse) return res.status(404).json({ message: "Greenhouse not found" });
        if (req.user.role !== 'admin' && greenhouse.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "User not authorized to add sensor to this greenhouse" });
        }
        const existingSensorWithModel = await Sensor.findOne({ model: model, greenhouseId: greenhouseId });
        if (existingSensorWithModel) {
            return res.status(400).json({ message: `Sensor with model ID '${model}' already exists in this greenhouse.` });
        }
        const sensor = new Sensor({ type, greenhouseId, model, status, unit, isDefault: false }); // Не дефолтний
        const newSensor = await sensor.save();
        res.status(201).json(newSensor);
    } catch (err) {
        if (err.name === 'ValidationError') {
            let errors = {}; Object.keys(err.errors).forEach(key => errors[key] = err.errors[key].message);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', protect, getSensorMiddleware, (req, res) => {
  res.json(req.sensor);
});

router.patch('/:id', protect, getSensorMiddleware, async (req, res) => {
    const updatableFields = ['type', 'status', 'unit']; // Model не має змінюватися для існуючого сенсора
    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) req.sensor[field] = req.body[field];
    });
     if (req.body.model && req.body.model !== req.sensor.model && req.user.role === 'admin') {
        const existingSensorWithModel = await Sensor.findOne({ model: req.body.model, greenhouseId: req.sensor.greenhouseId, _id: { $ne: req.sensor._id } });
        if (existingSensorWithModel) {
            return res.status(400).json({ message: `Sensor with model ID '${req.body.model}' already exists in this greenhouse.` });
        }
        req.sensor.model = req.body.model;
    } else if (req.body.model && req.body.model !== req.sensor.model) {
         return res.status(403).json({ message: "Only admins can change the model ID of a sensor."});
    }

  try {
    const updatedSensor = await req.sensor.save();
    res.json(updatedSensor);
  } catch (err) {
    if (err.name === 'ValidationError') {
        let errors = {}; Object.keys(err.errors).forEach(key => errors[key] = err.errors[key].message);
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, getSensorMiddleware, async (req, res) => {
  if (req.sensor.isDefault && req.user.role !== 'admin') {
      return res.status(403).json({message: "Default sensors can only be deleted by an admin."});
  }
  try {
    await SensorData.deleteMany({ sensorId: req.sensor._id });
    await req.sensor.deleteOne();
    res.json({ message: 'Deleted Sensor and its data' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;