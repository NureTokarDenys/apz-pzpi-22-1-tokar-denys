const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const Sensor = require('../models/Sensor');
const Greenhouse = require('../models/AutoGreenhouse');
const { protect, authorizeAdmin, checkGreenhouseOwnerOrAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

async function getSensorDataMiddleware(req, res, next) {
    let sensorDataEntry;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid sensor data ID format' });
        }
        sensorDataEntry = await SensorData.findById(req.params.id).populate({
            path: 'sensorId',
            select: 'greenhouseId',
            populate: { path: 'greenhouseId', select: 'ownerId' }
        });
        if (!sensorDataEntry) return res.status(404).json({ message: 'Cannot find sensor data entry' });

        if (req.user.role !== 'admin' && sensorDataEntry.sensorId.greenhouseId.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'User not authorized to access this sensor data' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    req.sensorDataEntry = sensorDataEntry;
    next();
}

router.get('/', protect, async (req, res) => {
    try {
        let sensorIds = [];
        if (req.user.role !== 'admin') {
            const userGreenhouses = await Greenhouse.find({ ownerId: req.user.id }).select('_id');
            const greenhouseIds = userGreenhouses.map(gh => gh._id);
            const userSensors = await Sensor.find({ greenhouseId: { $in: greenhouseIds } }).select('_id');
            sensorIds = userSensors.map(s => s._id);
        } else {
            const allSensors = await Sensor.find().select('_id');
            sensorIds = allSensors.map(s => s._id);
        }
        const sensorData = await SensorData.find({ sensorId: { $in: sensorIds } }).populate('sensorId', 'type model');
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
        const sensorData = await SensorData.find({ sensorId: req.params.sensorId });
        res.json(sensorData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, async (req, res) => {
    const { sensorId, timestamp, value } = req.body;
    if (!sensorId || value === undefined) { // value може бути 0
        return res.status(400).json({ message: "SensorId and value are required" });
    }
    try {
        const sensor = await Sensor.findById(sensorId).populate('greenhouseId', 'ownerId');
        if (!sensor) return res.status(404).json({ message: 'Sensor for data entry not found' });

        // Тут потрібна перевірка, чи цей sensorId належить IoT пристрою,
        // який авторизований надсилати дані, або чи користувач (якщо це ручне додавання) має права.
        // Для простоти, поки що перевіряємо власника теплиці, до якої належить сенсор.
        // В реальності, IoT пристрій матиме свій токен/ключ.
        if (req.user.role !== 'admin' && sensor.greenhouseId.ownerId.toString() !== req.user.id.toString()) {
             // Якщо це запит від IoT, req.user може бути undefined. Потрібен інший механізм автентифікації для IoT.
             // Наразі, припускаємо, що дані додає лише власник/адмін через API, або IoT пристрій (поки без auth).
        }

        const newSensorData = new SensorData({ sensorId, timestamp: timestamp ? new Date(timestamp) : new Date(), value });
        const savedSensorData = await newSensorData.save();
        
        // Оновлення lastValue в сенсорі
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

router.patch('/:id', protect, getSensorDataMiddleware, authorizeAdmin, async (req, res) => { // Тільки адмін може редагувати історію
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

router.delete('/:id', protect, getSensorDataMiddleware, authorizeAdmin, async (req, res) => { // Тільки адмін може видаляти історію
    try {
        await req.sensorDataEntry.deleteOne();
        res.json({ message: 'Deleted Sensor Data' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;