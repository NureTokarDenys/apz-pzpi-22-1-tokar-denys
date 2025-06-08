const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');
const Greenhouse = require('../models/AutoGreenhouse');
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
            select: 'name ownerId'
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
    req.params.id = req.params.greenhouseId; // Для checkGreenhouseOwnerOrAdmin, щоб він міг знайти greenhouse
    const tempGreenhouseForAuth = new Greenhouse({ _id: req.params.greenhouseId, ownerId: null }); 
    req.greenhouse = tempGreenhouseForAuth; // тимчасово для middleware
    
    // Виклик middleware для перевірки прав на теплицю
    checkGreenhouseOwnerOrAdmin(req, res, async () => {
        try {
            const sensors = await Sensor.find({ greenhouseId: req.params.greenhouseId }).populate('greenhouseId', 'name');
            res.json(sensors);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });
});


router.post('/', protect, async (req, res) => {
    const { type, greenhouseId, model, status, unit, lastValue, lastUpdated } = req.body;
    if (!type || !greenhouseId || !unit) {
        return res.status(400).json({ message: "Sensor type, greenhouseId and unit are required" });
    }
    try {
        const greenhouse = await Greenhouse.findById(greenhouseId);
        if (!greenhouse) return res.status(404).json({ message: "Greenhouse not found" });
        if (req.user.role !== 'admin' && greenhouse.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "User not authorized to add sensor to this greenhouse" });
        }
        const sensor = new Sensor({ type, greenhouseId, model, status, unit, lastValue, lastUpdated });
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
    const updatableFields = ['type', 'model', 'status', 'unit', 'lastValue', 'lastUpdated'];
    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) req.sensor[field] = req.body[field];
    });
    if (req.body.greenhouseId && req.user.role === 'admin') {
        const newGreenhouse = await Greenhouse.findById(req.body.greenhouseId);
        if (!newGreenhouse) return res.status(404).json({message: "New greenhouse for sensor not found"});
        req.sensor.greenhouseId = req.body.greenhouseId;
    } else if (req.body.greenhouseId && req.user.role !== 'admin') {
        return res.status(403).json({message: "Only admin can change sensor's greenhouse assignment."})
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
  try {
    await SensorData.deleteMany({ sensorId: req.sensor._id });
    await req.sensor.deleteOne();
    res.json({ message: 'Deleted Sensor and its data' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;