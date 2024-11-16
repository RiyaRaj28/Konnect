import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { createControlComponent } from "@react-leaflet/core";
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RoutingMachine = createControlComponent(({ pickup, dropoff, waypoints }) => {
  // Format waypoints as a string: "lon1,lat1;lon2,lat2;lon3,lat3"
  const waypointsString = [
    `${pickup[0]},${pickup[1]}`,
    ...waypoints.map(wp => `${wp[0]},${wp[1]}`),
    `${dropoff[0]},${dropoff[1]}`
  ].join(';');

  const instance = L.Routing.control({
    waypoints: [
      L.latLng(pickup[1], pickup[0]),
      ...waypoints.map(wp => L.latLng(wp[1], wp[0])),
      L.latLng(dropoff[1], dropoff[0])
    ],
    router: new L.Routing.OSRMv1({
      serviceUrl: `https://router.project-osrm.org/route/v1/`,
      profile: 'driving',
      // Use the formatted waypoints string
      routingOptions: {
        alternatives: true,
        steps: true
      }
    }),
    lineOptions: {
      styles: [{ color: "#6FA1EC", weight: 4 }]
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false
  });

  // Log the formatted waypoints string for debugging
  console.log("Formatted waypoints:", waypointsString);

  instance.on('routingerror', function(e) {
    console.error('Routing error:', e.error);
  });

  return instance;
});

const UpdateMapView = ({ driverLocation, pickup, dropoff }) => {
  const map = useMap();
  useEffect(() => {
    if (driverLocation) {
      console.log("DRIVER LOCATION", driverLocation)
      map.fitBounds([
        [pickup[1], pickup[0]],
        [driverLocation.latitude, driverLocation.longitude],
        [dropoff[1], dropoff[0]]
      ]);
    }
  }, [driverLocation, map, pickup, dropoff]);
  return null;
};


const LiveTracking = ({ bookingId, pickup, dropoff }) => {
    console.log("hellooo")
    console.log("BOOKING ID", bookingId)
  console.log('Booking ID from live tracking:', bookingId);
  const [driverLocation, setDriverLocation] = useState(null);
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    console.log("SOCKET", socket)

    socket.emit('joinBooking', bookingId);
    console.log('Booking ID from live tracking from live tracking component:', bookingId);
    // console.log("LOCATION", location)

    socket.on('driverLocationUpdate', (location) => {
      setDriverLocation(location);
      console.log('Driver Location from socket:', location);
      setWaypoints(prevWaypoints => [...prevWaypoints, [location.longitude, location.latitude]]);
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);


  console.log('Pickup from live tracking:', pickup);
  console.log('Dropoff from live tracking:', dropoff);
  console.log('Driver Location from live tracking:', driverLocation);

  if (!driverLocation) {
    return <div>Waiting for driver location...</div>;
  }

  return (
    <MapContainer 
      center={[pickup[1], pickup[0]]} 
      zoom={13} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[pickup[1], pickup[0]]} />
      <Marker position={[dropoff[1], dropoff[0]]} />
      {driverLocation && (
        <Marker position={[driverLocation.latitude, driverLocation.longitude]} />
      )}
      <RoutingMachine pickup={pickup} dropoff={dropoff} waypoints={waypoints} />
      <UpdateMapView driverLocation={driverLocation} pickup={pickup} dropoff={dropoff} />
    </MapContainer>
  );
};

export default LiveTracking;
// 
