import React, { useState, useEffect } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, Button } from '@mui/material';
import { getDriverBookings, updateBookingStatus } from '../services/api';

export default function UpdateBookingStatus() {
  const [driverBookings, setDriverBookings] = useState([]);

  useEffect(() => {
    fetchDriverBookings();
  }, []);

  const fetchDriverBookings = async () => {
    try {
      const response = await getDriverBookings();
      setDriverBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching driver bookings:', error);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      fetchDriverBookings(); // Refresh the list after updating status
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Update Booking Status
        </Typography>
        <List sx={{ width: '100%', mt: 2 }}>
          {driverBookings.map((booking) => (
            <ListItem key={booking._id} alignItems="flex-start">
              <ListItemText
                primary={`Booking ID: ${booking._id}`}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      Status: {booking.status}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.primary">
                      Pickup: {booking.pickupLocation.join(', ')}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.primary">
                      Dropoff: {booking.dropoffLocation.join(', ')}
                    </Typography>
                  </React.Fragment>
                }
              />
              {booking.status === 'accepted' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStatus(booking._id, 'completed')}
                >
                  Complete
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}