// src/pages/RouteHistory.js
import React from 'react';
import { useRouteStore } from '../store/routeStore';
import TripDisplay from '../components/TripDisplay';
import '../style/RouteHistory.css'; 
function RouteHistory() {
  const history = useRouteStore((state) => state.history);

  return (
    <div className="futuristic-bg">
      <div className="glass-card">
        <div className="neon-title">Your Trip History</div>
        </div>
        {history.length === 0 ? (
          <p className="dashboard-text">No routes yet. Go plan your first trip!</p>
        ) : (
          <div className="trip-list">
            {history.map((route, index) => (
              <TripDisplay
                key={index}
                destination={route.destination}
                type={route.type}
              />
            ))}
          </div>
        )}
    </div>
  );
}

export default RouteHistory;
