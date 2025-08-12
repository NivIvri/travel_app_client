// src/pages/RouteHistory.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import { useAuthStore } from '../store/authStore';
import TripDisplay from '../components/TripDisplay';
import '../style/RouteHistory.css'; 

function RouteHistory() {
  const { savedRoutes, deleteSavedRoute, setRoute, currentRoute, isLoading, loadUserRoutes } = useRouteStore();
  const { user } = useAuthStore();
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleViewRoute = (route) => {
    console.log('Viewing route:', route);
    console.log('Route date fields:', {
      date: route.date,
      createdAt: route.createdAt,
      savedAt: route.savedAt,
      _id: route._id
    });
    
    // Small delay to ensure data is processed
    setTimeout(() => {
      // Set the route in the store so TripDisplay can access it
      setRoute({
        destination: route.destination,
        type: route.type,
        path: route.path,
        pathDays: route.pathDays,
      });
      setSelectedRoute(route);
    }, 100);
  };

  const handleDeleteRoute = (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      deleteSavedRoute(routeId, user.username);
      if (selectedRoute && (selectedRoute._id === routeId || selectedRoute.id === routeId)) {
        setSelectedRoute(null);
      }
    }
  };

  const formatDate = (dateString, objectId) => {
    if (!dateString) {
      // Try to extract date from MongoDB ObjectId if available
      if (objectId && objectId.length === 24) {
        try {
          const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
          const date = new Date(timestamp);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (error) {
          console.error('Error extracting date from ObjectId:', error);
        }
      }
      return 'Date not available';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'Date not available';
    }
  };

  return (
    <div className="route-history-container">
      <div className="route-history-header">
        <h1 className="route-history-title">Your Saved Routes</h1>
        <p className="route-history-subtitle">
          Manage and view all your adventure routes
        </p>
        {user && (
          <button 
            className="refresh-btn"
            onClick={() => loadUserRoutes(user.username)}
            disabled={isLoading}
          >
            🔄 Refresh Routes
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="loading-state">
          <p>Loading your saved routes...</p>
        </div>
      ) : savedRoutes.length === 0 ? (
        <div className="empty-state">
          <p>No saved routes yet. Create a route and save it to see it here!</p>
        </div>
      ) : (
        <div className="saved-routes-grid">
          {savedRoutes.map((route) => (
            <div key={route._id || route.id} className="saved-route-card">
              <div className="route-header">
                <h3 className="route-name">{route.name}</h3>
                <div className="route-type">{route.type}</div>
              </div>
              
                             <div className="route-details">
                 <p className="route-destination">📍 {route.destination}</p>
                 {route.description && (
                   <p className="route-description">{route.description}</p>
                 )}
                 <p className="route-date">Saved: {formatDate(route.date || route.createdAt || route.savedAt, route._id)}</p>
               </div>
              
              <div className="route-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewRoute(route)}
                >
                  👁️ View Full Details
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteRoute(route._id || route.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRoute && currentRoute.destination && currentRoute.type && (
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
            {/* Use the complete TripDisplay component to show all details, but hide save button */}
            <TripDisplay showSaveButton={false} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteHistory;
