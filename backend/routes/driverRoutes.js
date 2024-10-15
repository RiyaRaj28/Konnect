const express = require('express');
const { registerDriver, loginDriver, acceptJob, updateLocation, getPendingBookings, getTotalEarning, getDriverStatus, getAcceptedBookings } = require('../controllers/driverController');
const { protect, authorizeDriver } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.post('/accept-job', protect, authorizeDriver, acceptJob);
router.post('/update-location', protect, authorizeDriver, updateLocation);
router.get('/pending-bookings', protect, authorizeDriver, getPendingBookings);  // New route
router.get('/total-earning', protect, authorizeDriver, getTotalEarning);  // New route
router.get('/status', protect, authorizeDriver, getDriverStatus);  // New route
router.get('/accepted-bookings', protect, authorizeDriver, getAcceptedBookings);  // New route

module.exports = router;