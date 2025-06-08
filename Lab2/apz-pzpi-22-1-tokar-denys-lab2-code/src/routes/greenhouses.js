const express = require('express');
const router = express.Router();
const Greenhouse = require('../models/AutoGreenhouse');
const User = require('../models/User');
const Log = require('../models/Log');
const { protect, authorizeAdmin, checkGreenhouseOwnerOrAdmin } = require('../middleware/auth');
const { sendPushNotification } = require('../services/pushNotificationService');
const mongoose = require('mongoose');

async function getGreenhouseMiddleware(req, res, next) {
  let greenhouse;
  try {
    const idToFind = req.params.id || req.params.greenhouseId;
    if (!mongoose.Types.ObjectId.isValid(idToFind)) {
        return res.status(400).json({ message: 'Invalid greenhouse ID format' });
    }
    greenhouse = await Greenhouse.findById(idToFind).populate('ownerId', 'username role'); // Додав role
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
    const { name, location } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Greenhouse name is required" });
    }
    const greenhouse = new Greenhouse({ name, location, ownerId: req.user.id });
  try {
    const newGreenhouse = await greenhouse.save();
    res.status(201).json(newGreenhouse);
  } catch (err) {
    if (err.name === 'ValidationError') {
        let errors = {};
        Object.keys(err.errors).forEach((key) => { errors[key] = err.errors[key].message; });
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, (req, res) => {
  res.json(req.greenhouse);
});

router.patch('/:id', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, async (req, res) => {
  if (req.body.name != null) req.greenhouse.name = req.body.name;
  if (req.body.location != null) req.greenhouse.location = req.body.location;

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
    res.json(updatedGreenhouse);
  } catch (err) {
    if (err.name === 'ValidationError') {
        let errors = {};
        Object.keys(err.errors).forEach((key) => { errors[key] = err.errors[key].message; });
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, async (req, res) => {
  try {
    await req.greenhouse.deleteOne();
    res.json({ message: 'Deleted Greenhouse and related data' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:greenhouseId/actions', protect, getGreenhouseMiddleware, checkGreenhouseOwnerOrAdmin, async (req, res) => {
    const { action, deviceId, value } = req.body;
    if (!action) {
        return res.status(400).json({ message: 'Action is required' });
    }
    try {
        const greenhouse = req.greenhouse;
        const commandPayload = { action, targetDevice: deviceId, value, timestamp: new Date() };

        // TODO: Send command to IoT device

        const logMessage = `Manual action: ${action} ${deviceId ? 'on ' + deviceId : ''} ${value ? 'val ' + value : ''} by ${req.user.username} in ${greenhouse.name}`;
        await new Log({ greenhouseId: greenhouse._id, type: 'action', message: logMessage, userId: req.user._id }).save();

        const owner = await User.findById(greenhouse.ownerId);
        if (owner && owner.deviceToken && owner._id.toString() !== req.user._id.toString()) {
            await sendPushNotification(
                owner.deviceToken,
                `Action in ${greenhouse.name}`,
                `Manual action: ${action} performed by ${req.user.username}.`,
                { greenhouseId: greenhouse._id.toString(), action: action }
            );
        }
        res.status(200).json({ message: 'Action command received and logged', command: commandPayload });
    } catch (error) {
        res.status(500).json({ message: 'Server error processing action', details: error.message });
    }
});

module.exports = router;