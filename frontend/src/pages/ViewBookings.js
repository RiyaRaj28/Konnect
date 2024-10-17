import React, { useState, useEffect } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Rating, Link } from '@mui/material';
import { getUserBookings, rateBooking, getDriverById } from '../services/api';
import { Link as RouterLink } from 'react-router-dom';

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getUserBookings();
      // console.log("RESPONSE", response.data.bookings)
      // console.log("DRIVER ID", response.data.bookings[0].driverId._id)
      const bookingsWithDrivers = await Promise.all(
        response.data.bookings.map(async (booking) => {
          if (booking.driverId) {
            // console.log("DRIVER IDDD", booking.driverId._id)
            // console.log("DRIVER NAME", booking.driverId.name)

            try {
              const driverData = await getDriverById(booking.driverId._id);
              // console.log("DRIVER DATA", driverData)
              // console.log("DRIVER DATA", driverData.data._id)
              return { ...booking, driver: driverData };
            } catch (error) {
              console.error(`Error fetching driver ${booking.driverId._id}:`, error);
              return booking;
            }
          }
          return booking;
        })
      );
      setBookings(bookingsWithDrivers);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleRateBooking = async (bookingId, rating) => {
    try {
      await rateBooking(bookingId, rating);
      fetchBookings(); // Refresh bookings after rating
    } catch (error) {
      console.error('Error rating booking:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h1" variant="h5">
        Your Bookings
      </Typography>
      <List sx={{ width: '100%', mt: 2 }}>
        {bookings.map((booking) => (
          <ListItem key={booking._id} alignItems="flex-start">
            <ListItemText
              primary={`Booking ID: ${booking._id}`}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    Status: {booking.status}
                  </Typography>
                  <br />
                  {`Vehicle Type: ${booking.vehicleType}`}
                  <br />
                  {`Estimated Price: $${booking.estimatedPrice}`}
                  <br />
                  {booking.driverId && `Driver: ${booking.driverId.name}`}
                </React.Fragment>
              }
            />
            {booking.status === 'completed' && !booking.rating && (
              <Box>
                <Typography component="legend">Rate this booking</Typography>
                <Rating
                  name={`rating-${booking._id}`}
                  onChange={(event, newValue) => {
                    handleRateBooking(booking._id, newValue);
                  }}
                />
              </Box>
            )}
            {booking.rating && (
              <Box>
                <Typography component="legend">Your rating</Typography>
                <Rating name={`rating-${booking._id}`} value={booking.rating} readOnly />
              </Box>
            )}
            {booking.status === 'accepted' && (
              <Link to={`/booking/${booking._id}`} component={RouterLink}>
                View Booking Details
              </Link>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
