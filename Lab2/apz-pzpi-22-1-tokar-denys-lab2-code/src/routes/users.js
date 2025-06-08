const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, authorizeAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

router.post('/register', async (req, res) => {
  const { username, password, email, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    if (email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }
    }
    const user = new User({
      username,
      password,
      email,
      role: (role && ['user', 'admin'].includes(role) && req.user && req.user.role === 'admin') ? role : 'user'
    });
    const newUser = await user.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token: token,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
        let errors = {};
        Object.keys(err.errors).forEach((key) => { errors[key] = err.errors[key].message; });
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: 'Server error during registration', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', details: err.message });
  }
});

router.post('/register-device', protect, async (req, res) => {
    const { deviceToken } = req.body;
    if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
    }
    try {
        await User.findByIdAndUpdate(req.user.id, { deviceToken });
        res.json({ message: 'Device token registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
    });
});

router.get('/', protect, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getUserMiddleware(req, res, next) {
  let user;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Cannot find user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  req.targetUser = user;
  next();
}

router.get('/:id', protect, getUserMiddleware, (req, res) => {
  if (req.user.role === 'admin' || req.user.id.toString() === req.targetUser.id.toString()) {
    const { password, ...userData } = req.targetUser.toObject();
    res.json(userData);
  } else {
    res.status(403).json({ message: 'Not authorized to view this user' });
  }
});

router.patch('/:id', protect, getUserMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id.toString() !== req.targetUser.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
  }
  if (req.body.role != null && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change user roles.' });
  }
  if (req.body.role != null && req.user.role === 'admin' && ['user', 'admin'].includes(req.body.role)) {
    req.targetUser.role = req.body.role;
  }
  if (req.body.username != null) req.targetUser.username = req.body.username;
  if (req.body.password != null) req.targetUser.password = req.body.password;
  if (req.body.email != null) req.targetUser.email = req.body.email;

  try {
    const updatedUser = await req.targetUser.save();
    const { password, ...userData } = updatedUser.toObject();
    res.json(userData);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Username or email already exists.' });
    if (err.name === 'ValidationError') {
        let errors = {};
        Object.keys(err.errors).forEach((key) => { errors[key] = err.errors[key].message; });
        return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, getUserMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id.toString() !== req.targetUser.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
  }
  if (req.targetUser.role === 'admin' && req.user.id.toString() === req.targetUser.id.toString()) {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
          return res.status(400).json({ message: "Cannot delete the last admin account." });
      }
  }
  try {
    await req.targetUser.deleteOne();
    res.json({ message: 'Deleted User' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;