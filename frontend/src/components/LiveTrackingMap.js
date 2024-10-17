import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const UpdateMapView = ({ driverLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (driverLocation) {
      map.setView([driverLocation.latitude, driverLocation.longitude], 15);
    }
  }, [driverLocation, map]);
  return null;
};

const LiveTrackingMap = ({ bookingId }) => {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:5000'); // Replace with your backend URL

    socket.emit('joinBooking', bookingId);

    socket.on('driverLocationUpdate', (location) => {
      setDriverLocation(location);
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  if (!driverLocation) {
    return <div>Waiting for driver location...</div>;
  }

  return (
    <MapContainer 
      center={[driverLocation.latitude, driverLocation.longitude]} 
      zoom={15} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[driverLocation.latitude, driverLocation.longitude]} />
      <UpdateMapView driverLocation={driverLocation} />
    </MapContainer>
  );
};

export default LiveTrackingMap;
