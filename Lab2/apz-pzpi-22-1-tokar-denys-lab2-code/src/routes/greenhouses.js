const express = require('express');
const router = express.Router();
const Greenhouse = require('../models/AutoGreenhouse');
const User = require('../models/User');
const Log = require('../models/Log');
const Sensor = require('../models/Sensor');
const Rule = require('../models/Rule');
const { protect, authorizeAdmin, checkGreenhouseOwnerOrAdmin } = require('../middleware/auth');
const allowedHardwareIds = require('../config/allowedHardwareIds');
const mongoose = require('mongoose');

async function createDefaultSensors(greenhouseId, hardwareId) {
    const defaultSensorTypes = [
        { type: 'temperature', unit: '°C', modelPrefix: 'TEMP' },
        { type: 'humidity', unit: '%', modelPrefix: 'HUM' },
        { type: 'light', unit: 'lux', modelPrefix: 'LIGHT' },
        { type: 'soil_moisture', unit: '%', modelPrefix: 'SOIL' },
    ];
    const createdSensors = [];
    for (const sensorInfo of defaultSensorTypes) {
        const sensorModelId = `${hardwareId}_${sensorInfo.modelPrefix}`;
        let sensor = await Sensor.findOne({ model: sensorModelId, greenhouseId: greenhouseId });
        if (!sensor) {
            sensor = new Sensor({
                type: sensorInfo.type,
                greenhouseId: greenhouseId,
                model: sensorModelId,
                unit: sensorInfo.unit,
                status: 'active',
                isDefault: true
            });
            await sensor.save();
            await new Log({
                            greenhouseId: greenhouseId,
                            type: 'info',
                            message: `Default sensor created. Type: ${sensor.type}, Model: ${sensor.model}` 
                        }).save();
        }
        createdSensors.push(sensor);
    }
    return createdSensors;
}

async function createDefaultRules(greenhouseId, defaultSensors) {
    const rulesToCreate = [];

    const findSensorModelId = (type) => {
        const sensor = defaultSensors.find(s => s.type === type);
        return sensor ? sensor.model : null;
    };

    const tempSensorModelId = findSensorModelId('temperature');
    const humSensorModelId = findSensorModelId('humidity');
    const lightSensorModelId = findSensorModelId('light');
    const soilSensorModelId = findSensorModelId('soil_moisture');

    if (tempSensorModelId) {
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'START_COOLING', threshold: { sensorModelId: tempSensorModelId, operator: '>', value: 28 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'STOP_COOLING',  threshold: { sensorModelId: tempSensorModelId, operator: '<=', value: 25 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'START_HEATING', threshold: { sensorModelId: tempSensorModelId, operator: '<', value: 18 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'STOP_HEATING',  threshold: { sensorModelId: tempSensorModelId, operator: '>=', value: 21 }, status: 'inactive' });
    }
    if (humSensorModelId) {
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'START_VENTILATION', threshold: { sensorModelId: humSensorModelId, operator: '>', value: 75 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'STOP_VENTILATION',  threshold: { sensorModelId: humSensorModelId, operator: '<=', value: 60 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'START_HUMIDIFYING', threshold: { sensorModelId: humSensorModelId, operator: '<', value: 40 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'STOP_HUMIDIFYING',  threshold: { sensorModelId: humSensorModelId, operator: '>=', value: 50 }, status: 'inactive' });
    }
    if (lightSensorModelId) {
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'TURN_ON_LIGHT',  threshold: { sensorModelId: lightSensorModelId, operator: '<', value: 5000 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'TURN_OFF_LIGHT', threshold: { sensorModelId: lightSensorModelId, operator: '>=', value: 10000 }, status: 'inactive' });
    }
    if (soilSensorModelId) {
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'START_WATERING', threshold: { sensorModelId: soilSensorModelId, operator: '<', value: 30 }, status: 'inactive' });
        rulesToCreate.push({ greenhouseId, condition: 'sensor_based', action: 'STOP_WATERING',  threshold: { sensorModelId: soilSensorModelId, operator: '>=', value: 60 }, status: 'inactive' });
    }

    for (const ruleData of rulesToCreate) {
        const existingRule = await Rule.findOne({
            greenhouseId: ruleData.greenhouseId,
            'threshold.sensorModelId': ruleData.threshold.sensorModelId,
            'threshold.operator': ruleData.threshold.operator,
            'threshold.value': ruleData.threshold.value,
            action: ruleData.action
        });
        if (!existingRule) {
            const newRule = new Rule(ruleData);
            await newRule.save();
            await new Log({
                            greenhouseId: greenhouseId,
                            type: 'info',
                            message: `Default rule created: If ${ruleData.threshold.sensorModelId} ${ruleData.threshold.operator} ${ruleData.threshold.value}, then ${ruleData.action}.` // <--- ВИПРАВЛЕНО ПОВІДОМЛЕННЯ
                        }).save();
        }
    }
}

async function getGreenhouseMiddleware(req, res, next) {
  let greenhouse;
  try {
    const idToFind = req.params.id || req.params.greenhouseId;
    if (!mongoose.Types.ObjectId.isValid(idToFind)) {
        return res.status(400).json({ message: 'Invalid greenhouse ID format' });
    }
    greenhouse = await Greenhouse.findById(idToFind).populate('ownerId', 'username role');
    if (!greenhouse) {
      return res.status(404).json({ message: 'Cannot find greenhouse' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  req.greenhouse = greenhouse;
  next();
}

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.ownerId = req.user.id;
    }
    const greenhouses = await Greenhouse.find(query).populate('ownerId', 'username');
    res.json(greenhouses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
    const { name, location, hardwareId } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Greenhouse name is required" });
    }
    if (!hardwareId) {
        return res.status(400).json({ message: "hardwareId for the IoT controller is required" });
    }
    if (!allowedHardwareIds.includes(hardwareId)) {
        return res.status(400).json({ message: `Hardware ID '${hardwareId}' is not recognized or not allowed.` });
    }

    try {
        const existingGreenhouseByHwId = await Greenhouse.findOne({ hardwareId: hardwareId });
        if (existingGreenhouseByHwId) {
            return res.status(400).json({ message: "This hardware ID is already registered." });
        }
        const greenhouse = new Greenhouse({ name, location, hardwareId, ownerId: req.user.id });
        const newGreenhouse = await greenhouse.save();
        await new Log({
                          greenhouseId: newGreenhouse._id,
                          type: 'info',
                          message: `The greenhouse '${newGreenhouse.name}' was created.` 
                      }).save();
        const createdSensors = await createDefaultSensors(newGreenhouse._id, newGreenhouse.hardwareId);
        if (createdSensors.length > 0) {
            await createDefaultRules(newGreenhouse._id, createdSensors);
        }
        res.status(201).json(newGreenhouse);
    } catch (err) {
        if (err.name === 'ValidationError' || (err.code === 11000 && err.keyPattern && err.keyPattern.hardwareId)) {
            let errors = {};
            if (err.name === 'ValidationError') Object.keys(err.errors).forEach((key) => { errors[key] = err.errors[key].message; });
            if (err.code === 11000) errors.hardwareId = "This hardware ID is already in use (concurrent request?).";
            return res.status(400).json({ message: "Validation Error or Duplicate Hardware ID", errors });
        }
        console.error("Error creating greenhouse:", err); 
        res.status(500).json({ message: 'Server error creating greenhouse', details: err.message });
    }
});

router.get('/:id', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, (req, res) => {
  res.json(req.greenhouse);
});

router.patch('/:id', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, async (req, res) => {
  const oldHardwareId = req.greenhouse.hardwareId;
  let hardwareIdWasSetOrChanged = false; 

  if (req.body.name != null) req.greenhouse.name = req.body.name;
  if (req.body.location != null) req.greenhouse.location = req.body.location;

  if (req.body.hardwareId != null) { 
     if (!allowedHardwareIds.includes(req.body.hardwareId)) {
          return res.status(400).json({ message: `Hardware ID '${req.body.hardwareId}' is not recognized or not allowed.` });
      }
      if (req.body.hardwareId !== oldHardwareId) { 
          if (req.user.role !== 'admin' && oldHardwareId) {
               return res.status(403).json({ message: "Only admins can change the hardware ID of an existing greenhouse if it was previously set."});
          }
          const existingGreenhouse = await Greenhouse.findOne({ hardwareId: req.body.hardwareId, _id: { $ne: req.greenhouse._id } });
          if (existingGreenhouse) {
              return res.status(400).json({ message: "This hardware ID is already registered to another greenhouse." });
          }
          req.greenhouse.hardwareId = req.body.hardwareId;
          hardwareIdWasSetOrChanged = true;
      }
  }


  if (req.body.ownerId != null && req.user.role === 'admin') {
      if (!mongoose.Types.ObjectId.isValid(req.body.ownerId)) {
          return res.status(400).json({ message: 'Invalid new owner ID format' });
      }
      const newOwner = await User.findById(req.body.ownerId);
      if (!newOwner) return res.status(404).json({ message: 'New owner not found' });
      req.greenhouse.ownerId = req.body.ownerId;
  } else if (req.body.ownerId != null && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change greenhouse ownership.' });
  }
  try {
    const updatedGreenhouse = await req.greenhouse.save();
    if (updatedGreenhouse.hardwareId && hardwareIdWasSetOrChanged) { 
        const createdSensors = await createDefaultSensors(updatedGreenhouse._id, updatedGreenhouse.hardwareId);
        if (createdSensors.length > 0) {
            await createDefaultRules(updatedGreenhouse._id, createdSensors);
        }
    }
    res.json(updatedGreenhouse);
  } catch (err) {
    if (err.name === 'ValidationError' || (err.code === 11000 && err.keyPattern && err.keyPattern.hardwareId)) {
        let errors = {};
        if (err.name === 'ValidationError') Object.keys(err.errors).forEach((key) => { errors[key] = err.errors[key].message; });
        if (err.code === 11000) errors.hardwareId = "This hardware ID is already in use.";
        return res.status(400).json({ message: "Validation Error", errors });
    }
    console.error("Error updating greenhouse:", err); 
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, async (req, res) => {
  try {
    await req.greenhouse.deleteOne();
    res.json({ message: 'Deleted Greenhouse and related data' });
  } catch (err) {
    console.error("Error deleting greenhouse:", err); 
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 