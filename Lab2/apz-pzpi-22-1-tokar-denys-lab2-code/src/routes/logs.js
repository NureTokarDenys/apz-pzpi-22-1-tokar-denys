const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const Greenhouse = require('../models/AutoGreenhouse');
const { protect, authorizeAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

async function getLogMiddleware(req, res, next) {
    let logEntry;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid log ID format' });
        }
        logEntry = await Log.findById(req.params.id).populate({
            path: 'greenhouseId',
            select: 'name ownerId'
        });
        if (!logEntry) return res.status(404).json({ message: 'Cannot find log entry' });

        if (req.user.role !== 'admin' && (!logEntry.greenhouseId || logEntry.greenhouseId.ownerId.toString() !== req.user.id.toString())) {
             if(logEntry.greenhouseId) // Тільки якщо лог прив'язаний до теплиці
                return res.status(403).json({ message: 'User not authorized to access this log' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    req.logEntry = logEntry;
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
    const logs = await Log.find(query).populate('greenhouseId', 'name').populate('userId', 'username').sort({timestamp: -1}).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/greenhouse/:greenhouseId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.greenhouseId)) {
            return res.status(400).json({ message: 'Invalid greenhouse ID format' });
        }
        const greenhouse = await Greenhouse.findById(req.params.greenhouseId);
        if (!greenhouse) return res.status(404).json({ message: "Greenhouse not found for logs" });

        if (req.user.role !== 'admin' && greenhouse.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "User not authorized to view logs for this greenhouse" });
        }
        const logs = await Log.find({ greenhouseId: req.params.greenhouseId }).populate('userId', 'username').sort({timestamp: -1}).limit(500);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, authorizeAdmin, async (req, res) => {
    const { greenhouseId, type, message, timestamp, userId } = req.body;
    if(!message) return res.status(400).json({message: "Message is required"});

    const newLog = new Log({ greenhouseId, type, message, timestamp: timestamp ? new Date(timestamp) : new Date(), userId });
    try {
      const savedLog = await newLog.save();
      res.status(201).json(savedLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', protect, getLogMiddleware, (req, res) => {
  res.json(req.logEntry);
});

router.delete('/:id', protect, getLogMiddleware, authorizeAdmin, async (req, res) => {
  try {
    await req.logEntry.deleteOne();
    res.json({ message: 'Deleted Log' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;