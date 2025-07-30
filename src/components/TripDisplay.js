// src/components/TripDisplay.js
import React from 'react';
import { useRouteStore } from '../store/routeStore';
import MapWithRoute from '../components/MapWithRoute';
import '../style/TripDisplay.css'; 

function TripDisplay({ destination, type }) {
  const { currentRoute } = useRouteStore();
  return (
    <div className="trip-display glass-card">
      <h3>{destination}</h3>
      <p>Type of trip: <strong>{type}</strong></p>
          <MapWithRoute route={currentRoute.path} />
    </div>
  );
}

export default TripDisplay;
