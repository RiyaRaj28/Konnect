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

// useEffect(() => {
//   const fetchPendingBookings = async () => {
//     try {
//       const response = await getPendingBookings();
//       // Handle the response data
//     } catch (error) {
//       // Handle any errors
//     }
//   };

//   fetchPendingBookings();
// }, []);

// User and Driver Authentication
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// User Bookings
export const createBooking = (bookingData) => api.post('/bookings/book', bookingData);
export const getUserBookings = () => api.get('/bookings/user');
export const rateBooking = (bookingId, rating) => api.post(`/booking/${bookingId}/rate`, { rating });

// Driver Functions
export const registerDriver = (userData) => api.post('/drivers/register', userData);
export const loginDriver = (credentials) => api.post('/drivers/login', credentials);
export const getPendingBookings = () => api.get('/drivers/pending-bookings');
export const acceptJob = (bookingId) => api.post('/drivers/accept-job', { bookingId });
export const getDriverBookings = () => api.get('/drivers/bookings');
export const updateBookingStatus = (bookingId, status) => api.put(`/bookings/status`, { bookingId, status });
export const updateDriverLocation = (location) => api.post('/drivers/update-location', { location });

export default api;