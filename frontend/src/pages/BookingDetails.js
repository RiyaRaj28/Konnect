import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';
import { getBookingDetails } from '../services/api';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  console.log('Booking ID from booking details:', bookingId);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await getBookingDetails(bookingId);
        console.log('Booking details from getBookingDetails api:', response.data.booking);
        setBooking(response.data.booking);  // Assuming the API returns { booking: {...} }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  console.log('Booking details from booking details page only booking:', booking);

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Booking Details</h1>
      <p>Status: {booking.status}</p>
      <p>Pickup: {booking.pickupLocation.join(', ')}</p>
      <p>Dropoff: {booking.dropoffLocation.join(', ')}</p>
      <p>Vehicle Type: {booking.vehicleType}</p>
      <p>Estimated Price: ${booking.estimatedPrice}</p>
      {booking.driver && (
        <p>Driver: {booking.driver.name} ({booking.driver.vehicleType})</p>
      )}
      {booking.status === 'accepted' && (
        <>
          <h2>Live Tracking</h2>
          <LiveTracking 
            bookingId={booking._id} 
            pickup={booking.pickupLocation}
            dropoff={booking.dropoffLocation}
          />
        </>
      )}
    </div>
  );
};

export default BookingDetails;
