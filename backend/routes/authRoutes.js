const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);
// router.get('/profile', protect, getUserProfile);
// router.put('/profile', protect, updateUserProfile);

// Get current user info (protected route)
// router.get('/me', protect, getCurrentUser);
router.get('/users', getAllUsers);

module.exports = router;
