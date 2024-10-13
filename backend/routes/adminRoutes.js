const express = require('express');
const { getDriverStats, getAdminStats, getAllActiveBookings } = require('../controllers/adminController');
const router = express.Router();

router.get('/stats/drivers', getDriverStats);
router.get('/admin-stats', getAdminStats);
router.get('/active-bookings', getAllActiveBookings);

module.exports = router;
