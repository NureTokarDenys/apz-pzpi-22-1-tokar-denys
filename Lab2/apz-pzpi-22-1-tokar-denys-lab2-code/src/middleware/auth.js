const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Greenhouse = require('../models/AutoGreenhouse');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found for this token' });
            }
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const checkGreenhouseOwnerOrAdmin = async (req, res, next) => {
    try {
        if (req.user && req.user.role === 'admin') {
            return next();
        }
        const greenhouse = req.greenhouse || (req.params.greenhouseId && await Greenhouse.findById(req.params.greenhouseId));

        if (req.params.greenhouseId && !greenhouse) {
            return res.status(404).json({ message: 'Greenhouse not found' });
        }

        if (greenhouse && greenhouse.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'User not authorized to access this greenhouse' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error while checking greenhouse ownership or admin role' });
    }
};

module.exports = { protect, authorizeAdmin, checkGreenhouseOwnerOrAdmin };