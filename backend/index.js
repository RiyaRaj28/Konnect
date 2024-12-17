console.log('Server starting...');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const connectDB = require('./utils/database');
const { UI } = require('bullmq');
const setupBullDashboard = require('./controllers/bullDashboard');
require('./cron/updateDriverRatings');
const { initializeSocket } = require('./services/socketService');

// Routes
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route working' });
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect Database
console.log("Connecting to MongoDB:", process.env.MONGO_URI);
connectDB();

// Test error route
app.get('/test-error', (req, res, next) => {
  console.log('Test error route hit');
  throw new Error('This is a test error');
});

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

console.log("Setting up Bull Dashboard");
setupBullDashboard(app);

// Handle Errors
app.use((err, req, res, next) => {
  console.error('Error caught in error handling middleware:', err);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// Catch-all route for unhandled requests
app.use('*', (req, res) => {
  console.log('Unhandled route:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
try {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Error starting the server:', error);
  process.exit(1);
}

// Catch unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
