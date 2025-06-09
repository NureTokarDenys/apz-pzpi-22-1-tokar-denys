const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const Sensor = require('../models/Sensor');
const Greenhouse = require('../models/AutoGreenhouse');
const { protect, authorizeAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

async function getSensorDataMiddleware(req, res, next) {
    let sensorDataEntry;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid sensor data ID format' });
        }
        sensorDataEntry = await SensorData.findById(req.params.id).populate({
            path: 'sensorId',
            select: 'greenhouseId model type',
            populate: { path: 'greenhouseId', select: 'ownerId' }
        });
        if (!sensorDataEntry) return res.status(404).json({ message: 'Cannot find sensor data entry' });

        if (req.user.role !== 'admin' && (!sensorDataEntry.sensorId || !sensorDataEntry.sensorId.greenhouseId || sensorDataEntry.sensorId.greenhouseId.ownerId.toString() !== req.user.id.toString())) {
            return res.status(403).json({ message: 'User not authorized to access this sensor data' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    req.sensorDataEntry = sensorDataEntry;
    next();
}

router.get('/', protect, authorizeAdmin, async (req, res) => {
    try {
        const sensorData = await SensorData.find().populate({
            path: 'sensorId',
            select: 'model type greenhouseId',
            populate: { path: 'greenhouseId', select: 'name' }
        }).sort({timestamp: -1}).limit(1000); // Обмеження для адміна
        res.json(sensorData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/sensor/:sensorId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.sensorId)) {
            return res.status(400).json({ message: 'Invalid sensor ID format' });
        }
        const sensor = await Sensor.findById(req.params.sensorId).populate('greenhouseId', 'ownerId');
        if (!sensor) return res.status(404).json({ message: 'Sensor not found' });

        if (req.user.role !== 'admin' && sensor.greenhouseId.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'User not authorized to access data for this sensor' });
        }
        const limit = parseInt(req.query.limit) || 200; // Обмеження кількості записів
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const sensorData = await SensorData.find({ sensorId: req.params.sensorId })
            .sort({timestamp: -1})
            .skip(skip)
            .limit(limit);
        const total = await SensorData.countDocuments({ sensorId: req.params.sensorId });
        res.json({data: sensorData, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorizeAdmin, async (req, res) => {
    const { sensorId, timestamp, value } = req.body;
    if (!sensorId || value === undefined) {
        return res.status(400).json({ message: "SensorId and value are required" });
    }
    try {
        const sensor = await Sensor.findById(sensorId);
        if (!sensor) return res.status(404).json({ message: 'Sensor for data entry not found' });

        const newSensorData = new SensorData({ sensorId, timestamp: timestamp ? new Date(timestamp) : new Date(), value });
        const savedSensorData = await newSensorData.save();
        sensor.lastValue = value;
        sensor.lastUpdated = savedSensorData.timestamp;
        await sensor.save();
        res.status(201).json(savedSensorData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', protect, getSensorDataMiddleware, (req, res) => {
    res.json(req.sensorDataEntry);
});

router.patch('/:id', protect, getSensorDataMiddleware, authorizeAdmin, async (req, res) => {
    if (req.body.sensorId != null) req.sensorDataEntry.sensorId = req.body.sensorId;
    if (req.body.timestamp != null) req.sensorDataEntry.timestamp = new Date(req.body.timestamp);
    if(req.body.value !== undefined) req.sensorDataEntry.value = req.body.value;
    try {
      const updatedSensorData = await req.sensorDataEntry.save();
      res.json(updatedSensorData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', protect, getSensorDataMiddleware, authorizeAdmin, async (req, res) => {
    try {
        await req.sensorDataEntry.deleteOne();
        res.json({ message: 'Deleted Sensor Data' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;