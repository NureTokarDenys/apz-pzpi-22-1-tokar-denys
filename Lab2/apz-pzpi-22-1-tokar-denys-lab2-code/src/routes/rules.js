const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const Greenhouse = require('../models/AutoGreenhouse');
const { protect, authorizeAdmin, checkGreenhouseOwnerOrAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

async function getRuleMiddleware(req, res, next) {
    let rule;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid rule ID format' });
        }
        rule = await Rule.findById(req.params.id).populate({
            path: 'greenhouseId',
            select: 'name ownerId'
        });
        if (!rule) return res.status(404).json({ message: 'Cannot find rule' });

        if (req.user.role !== 'admin' && rule.greenhouseId.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'User not authorized to access this rule' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    req.rule = rule;
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
    const rules = await Rule.find(query).populate('greenhouseId', 'name');
    res.json(rules);
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
        if (!greenhouse) return res.status(404).json({ message: "Greenhouse not found for rules" });

        if (req.user.role !== 'admin' && greenhouse.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "User not authorized to view rules for this greenhouse" });
        }
        const rules = await Rule.find({ greenhouseId: req.params.greenhouseId });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, async (req, res) => {
    const { greenhouseId, condition, action, schedule, threshold, status } = req.body;
    if (!greenhouseId || !condition || !action) {
        return res.status(400).json({ message: "Greenhouse ID, condition, and action are required" });
    }
    try {
        const greenhouse = await Greenhouse.findById(greenhouseId);
        if (!greenhouse) return res.status(404).json({ message: "Greenhouse not found" });
        if (req.user.role !== 'admin' && greenhouse.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "User not authorized to create rule for this greenhouse" });
        }
        const newRule = new Rule({ greenhouseId, condition, action, schedule, threshold, status });
        const savedRule = await newRule.save();
        res.status(201).json(savedRule);
    } catch (err) {
        if (err.name === 'ValidationError') {
            let errors = {}; Object.keys(err.errors).forEach(key => errors[key] = err.errors[key].message);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', protect, getRuleMiddleware, (req, res) => {
  res.json(req.rule);
});

router.patch('/:id', protect, getRuleMiddleware, async (req, res) => {
  const updatableFields = ['condition', 'action', 'schedule', 'threshold', 'status'];
  updatableFields.forEach(field => {
      if (req.body[field] !== undefined) req.rule[field] = req.body[field];
  });
  try {
    const updatedRule = await req.rule.save();
    res.json(updatedRule);
  } catch (err) {
    if (err.name === 'ValidationError') {
        let errors = {}; Object.keys(err.errors).forEach(key => errors[key] = err.errors[key].message);
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, getRuleMiddleware, async (req, res) => {
  try {
    await req.rule.deleteOne();
    res.json({ message: 'Deleted Rule' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;