const express = require('express');
const { registerDriver, loginDriver, acceptJob, updateLocation, getPendingBookings, getTotalEarning, getDriverStatus, getAcceptedBookings, updateLiveLocation, getDriverById, updateDriver } = require('../controllers/driverController');
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
router.post('/update-live-location', protect, authorizeDriver, updateLiveLocation);
router.get('/:id', getDriverById);
router.put('/:id', updateDriver);

module.exports = router;
