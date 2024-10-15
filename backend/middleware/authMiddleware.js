const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

exports.protect = async (req, res, next) => {
  let token;
  // console.log('Headers:', req.headers);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // console.log('Extracted token:', token);
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('Decoded token:', decoded);

      // Check if the decoded token has a 'type' field
      if (!decoded.type) {
        return res.status(401).json({ message: 'Not authorized, invalid token structureee' });
      }

      // Attach user or driver to the request based on token type
      if (decoded.type === 'user') {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
      } else if (decoded.type === 'driver') {
        const driver = await Driver.findById(decoded.id).select('-password');
        if (!driver) {
          return res.status(401).json({ message: 'Not authorized, driver not found' });
        }
        req.driver = driver;
      } else {
        return res.status(401).json({ message: 'Not authorized, invalid token type' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.authorizeUser = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. User authorization required.' });
  }
};

exports.authorizeDriver = (req, res, next) => {
  if (req.driver) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Driver authorization required.' });
  }
};