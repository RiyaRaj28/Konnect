import React, { useState, useEffect } from 'react';
import { getPendingBookings } from '../services/api';

export default function PendingBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const response = await getPendingBookings();
        console.log("Full API response:", response);
        
        if (response && response.success) {
          console.log("Pending bookings data:", response.data);
          setPendingBookings(response.data || []);
        } else {
          console.error("API request was not successful:", response);
          setError('Failed to fetch pending bookings');
        }
      } catch (err) {
        console.error("Error in fetchPendingBookings:", err);
        setError('Failed to fetch pending bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBookings();
  }, []);

  console.log("Current pendingBookings state:", pendingBookings);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Pending Bookings</h2>
        {pendingBookings.length === 0 ? (
          <p>No pending bookings</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pendingBookings.map((booking) => (
              <li key={booking.id} className="py-4">
                <div className="flex flex-col space-y-1">
                  <p className="font-semibold">Booking ID: {booking.id}</p>
                  <p>User: {booking.userName} ({booking.userEmail})</p>
                  <p>Vehicle Type: {booking.vehicleType}</p>
                  <p>Estimated Price: ${booking.estimatedPrice.toFixed(2)}</p>
                  <p>Pickup: {booking.pickupLocation.join(', ')}</p>
                  <p>Dropoff: {booking.dropoffLocation.join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}