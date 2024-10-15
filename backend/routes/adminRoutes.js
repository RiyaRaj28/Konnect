const express = require('express');
const {
  getTotalBookings,
  getPendingBookings,
  getAcceptedBookings,
  getCompletedBookings,
  getTotalDrivers,
  getIdleDrivers,
  getEnRouteDrivers,
  getTotalUsers,
  isAdmin,

} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
// Apply isAdmin middleware to all routes
router.use(isAdmin);
// router.use(authorizeUser)

router.get('/bookings/total', getTotalBookings);
router.get('/bookings/pending', getPendingBookings);
router.get('/bookings/accepted', getAcceptedBookings);
router.get('/bookings/completed', getCompletedBookings);
router.get('/drivers/total', getTotalDrivers);
router.get('/drivers/idle', getIdleDrivers);
router.get('/drivers/en-route', getEnRouteDrivers);
router.get('/users/total', getTotalUsers);

module.exports = router;
