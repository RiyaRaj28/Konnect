import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

const DriverHomeScreen = ({ currentBooking }) => {
  useEffect(() => {
    if (currentBooking && currentBooking.status === 'accepted') {
      const watchId = Geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await axios.post('http://localhost:5000/api/drivers/update-live-location', {
              latitude,
              longitude,
              bookingId: currentBooking._id
            });
          } catch (error) {
            console.error('Error updating location:', error);
          }
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
      );

      return () => Geolocation.clearWatch(watchId);
    }
  }, [currentBooking]);

  return (
    <View>
      <Text>Driver Home Screen</Text>
      {/* Other components */}
    </View>
  );
};

export default DriverHomeScreen;
