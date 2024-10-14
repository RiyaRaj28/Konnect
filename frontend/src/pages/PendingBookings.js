import React, { useState, useEffect } from 'react';
import { getPendingBookings } from '../services/api';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@/components/ui';

export default function PendingBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const response = await getPendingBookings();
        if (response.data && response.data.success) {
          setPendingBookings(response.data.data);
        } else {
          setError('Failed to fetch pending bookings');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pending bookings');
        setLoading(false);
      }
    };

    fetchPendingBookings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent>
        <Typography variant="h5" component="h2" className="mb-4">
          Pending Bookings
        </Typography>
        {pendingBookings.length === 0 ? (
          <Typography>No pending bookings</Typography>
        ) : (
          <List>
            {pendingBookings.map((booking, index) => (
              <React.Fragment key={booking.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={`Booking ID: ${booking.id}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          User: {booking.userName} ({booking.userEmail})
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Vehicle Type: {booking.vehicleType}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Estimated Price: ${booking.estimatedPrice.toFixed(2)}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Pickup: {booking.pickupLocation.join(', ')}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Dropoff: {booking.dropoffLocation.join(', ')}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}