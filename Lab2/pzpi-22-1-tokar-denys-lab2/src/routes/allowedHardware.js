const express = require('express');
const router = express.Router();
const AllowedHardware = require('../models/AllowedHardware');
const Greenhouse = require('../models/AutoGreenhouse'); // Для оновлення isAssigned
const { protect, authorizeAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Middleware для отримання ID за параметром (для DRY)
async function getAllowedHardwareEntry(req, res, next) {
    let entry;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid AllowedHardware entry ID format' });
        }
        entry = await AllowedHardware.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'AllowedHardware entry not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    req.allowedHardwareEntry = entry;
    next();
}


// GET /api/allowed-hardware - Отримати всі дозволені Hardware ID
router.get('/', protect, async (req, res) => {
    try {
        const ids = await AllowedHardware.find().sort({ hardwareId: 1 });
        res.json(ids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/allowed-hardware - Додати новий Hardware ID до списку дозволених
router.post('/', protect, authorizeAdmin, async (req, res) => {
    const { hardwareId, description } = req.body;
    if (!hardwareId) {
        return res.status(400).json({ message: "hardwareId is required" });
    }
    try {
        const existingId = await AllowedHardware.findOne({ hardwareId });
        if (existingId) {
            return res.status(400).json({ message: "This hardwareId already exists in the allowed list." });
        }
        const newAllowedId = new AllowedHardware({ hardwareId, description });
        await newAllowedId.save();
        res.status(201).json(newAllowedId);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This hardwareId already exists (concurrent request?)." });
        }
        res.status(500).json({ message: error.message });
    }
});

// GET /api/allowed-hardware/:id - Отримати один запис (не дуже потрібно для фронтенду, але для повноти CRUD)
router.get('/:id', protect, authorizeAdmin, getAllowedHardwareEntry, (req, res) => {
    res.json(req.allowedHardwareEntry);
});


// PATCH /api/allowed-hardware/:id - Оновити опис дозволеного Hardware ID
router.patch('/:id', protect, authorizeAdmin, getAllowedHardwareEntry, async (req, res) => {
    const { hardwareId, description } = req.body;

    if (hardwareId && hardwareId !== req.allowedHardwareEntry.hardwareId) {
        // Перевірка, чи новий hardwareId вже існує (окрім поточного запису)
        const existingId = await AllowedHardware.findOne({ hardwareId: hardwareId, _id: { $ne: req.params.id } });
        if (existingId) {
            return res.status(400).json({ message: "This new hardwareId already exists in the allowed list." });
        }
        // Перевірка, чи старий ID не прив'язаний до теплиці, якщо його змінюють
        if (req.allowedHardwareEntry.isAssigned) {
            return res.status(400).json({ message: `Cannot change hardwareId '${req.allowedHardwareEntry.hardwareId}' because it is currently assigned to a greenhouse. Unassign it first or delete the greenhouse.` });
        }
        req.allowedHardwareEntry.hardwareId = hardwareId;
    }

    if (description !== undefined) {
        req.allowedHardwareEntry.description = description;
    }

    try {
        const updatedEntry = await req.allowedHardwareEntry.save();
        res.json(updatedEntry);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "This hardwareId already exists (concurrent request?)." });
        }
        res.status(500).json({ message: error.message });
    }
});


// DELETE /api/allowed-hardware/:id - Видалити Hardware ID зі списку дозволених
router.delete('/:id', protect, authorizeAdmin, getAllowedHardwareEntry, async (req, res) => {
    try {
        // Перевірка, чи ID не прив'язаний до теплиці
        if (req.allowedHardwareEntry.isAssigned) {
            const greenhouse = await Greenhouse.findById(req.allowedHardwareEntry.assignedGreenhouseId);
            return res.status(400).json({ message: `Cannot delete hardwareId '${req.allowedHardwareEntry.hardwareId}' because it is currently assigned to greenhouse '${greenhouse ? greenhouse.name : req.allowedHardwareEntry.assignedGreenhouseId}'. Unassign it first or delete the greenhouse.` });
        }
        await req.allowedHardwareEntry.deleteOne();
        res.json({ message: "Allowed hardwareId deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;