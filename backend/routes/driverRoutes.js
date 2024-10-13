const express = require('express');
const { registerDriver, loginDriver, acceptJob, updateLocation } = require('../controllers/driverController');
const { protect, authorizeDriver } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.post('/accept-job', protect, authorizeDriver, acceptJob);  // Protected route
router.post('/update-location', protect, authorizeDriver, updateLocation);  // Protected route

module.exports = router;
