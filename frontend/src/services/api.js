import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Replace with your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// User and Driver Authentication
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// User Bookings
export const createBooking = (bookingData) => api.post('/bookings/book', bookingData);
export const getUserBookings = () => api.get('/bookings/bookings/user');
export const rateBooking = (bookingId, rating) => api.post('/bookings/booking/rating', { bookingId, rating });

// Driver Functions
export const registerDriver = (userData) => api.post('/drivers/register', userData);
export const loginDriver = (credentials) => api.post('/drivers/login', credentials);
export const getPendingBookings = () => api.get('/drivers/pending-bookings');
export const acceptJob = (bookingId) => api.post('/drivers/accept-job', { bookingId });
export const getDriverBookings = () => api.get('/drivers/bookings');
export const updateBookingStatus = (bookingId, status) => api.put(`/bookings/bookings/status`, { bookingId, status });
export const updateDriverLocation = (location) => api.post('/drivers/update-location', { location });
export const getTotalEarning = () => api.get('/drivers/total-earning');
export const getDriverStatus = () => api.get('/drivers/status');
export const getAcceptedBookings = () => api.get('/drivers/accepted-bookings');

// Admin Functions
export const getTotalDrivers = () => api.get('/admin/drivers/total');
export const getIdleDrivers = () => api.get('/admin/drivers/idle');
export const getEnRouteDrivers = () => api.get('/admin/drivers/en-route');
export const getTotalBookings = () => api.get('/admin/bookings/total');
export const getPendingBookingsAdmin = () => api.get('/admin/bookings/pending');
export const getAcceptedBookingsAdmin = () => api.get('/admin/bookings/accepted');
export const getCompletedBookings = () => api.get('/admin/bookings/completed');
export const getTotalUsers = () => api.get('/admin/users/total');

// User Dashboard
export const getUserDashboard = () => api.get('/user/dashboard');

// Add this new function for updating live location
export const updateLiveLocation = (latitude, longitude, bookingId) => 
  api.post('/drivers/update-live-location', { latitude, longitude, bookingId });

export const getBookingDetails = (bookingId) => api.get(`/bookings/${bookingId}`);

export default api;
