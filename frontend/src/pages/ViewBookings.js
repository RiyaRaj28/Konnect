import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, Button, Rating } from '@mui/material';
import { getUserBookings, rateBooking } from '../services/api';

export default function ViewBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getUserBookings();
      setBookings(response.data.bookings);
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
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
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
