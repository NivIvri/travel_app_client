// src/pages/RouteHistory.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import MapWithRoute from '../components/MapWithRoute';
import '../style/RouteHistory.css'; 

function RouteHistory() {
  const { savedRoutes, deleteSavedRoute, setRoute } = useRouteStore();
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleViewRoute = (route) => {
    setRoute({
      destination: route.destination,
      type: route.type,
      path: route.path,
      pathDays: route.pathDays,
    });
    setSelectedRoute(route);
  };

  const handleDeleteRoute = (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteSavedRoute(routeId);
      if (selectedRoute && selectedRoute.id === routeId) {
        setSelectedRoute(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="futuristic-bg">
      <div className="glass-card">
        <div className="neon-title">Your Saved Routes</div>
      </div>
      
      {savedRoutes.length === 0 ? (
        <div className="glass-card">
          <p className="dashboard-text">No saved routes yet. Create a route and save it to see it here!</p>
        </div>
      ) : (
        <div className="saved-routes-grid">
          {savedRoutes.map((route) => (
            <div key={route.id} className="saved-route-card">
              <div className="route-header">
                <h3 className="route-name">{route.name}</h3>
                <div className="route-type">{route.type}</div>
              </div>
              
              <div className="route-details">
                <p className="route-destination">📍 {route.destination}</p>
                {route.description && (
                  <p className="route-description">{route.description}</p>
                )}
                <p className="route-date">Saved: {formatDate(route.date)}</p>
              </div>
              
              <div className="route-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewRoute(route)}
                >
                  👁️ View Route
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteRoute(route.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRoute && (
        <div className="selected-route-view">
          <div className="selected-route-header">
            <h3>Viewing: {selectedRoute.name}</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedRoute(null)}
            >
              ✕
            </button>
          </div>
          <div className="selected-route-content">
            <div className="route-info">
              <p><strong>Destination:</strong> {selectedRoute.destination}</p>
              <p><strong>Type:</strong> {selectedRoute.type}</p>
              {selectedRoute.description && (
                <p><strong>Description:</strong> {selectedRoute.description}</p>
              )}
            </div>
            <MapWithRoute route={selectedRoute.path} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteHistory;
