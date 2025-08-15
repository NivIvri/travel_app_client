// src/components/SavedRoutes.js
import React, { useState, useEffect } from 'react';
import { useRouteStore } from '../store/routeStore';
import { useAuthStore } from '../store/authStore';
import MapWithRoute from './MapWithRoute';
import '../style/SavedRoutes.css';

function SavedRoutes() {
  const { savedRoutes, deleteSavedRoute, setRoute, loadUserRoutes, isLoading } = useRouteStore();
  const { user } = useAuthStore();
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Load user's routes when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadUserRoutes(user.username).catch(error => {
        console.error('Error loading routes:', error);
        alert('Failed to load saved routes');
      });
    }
  }, [user, loadUserRoutes]);

  const handleViewRoute = (route) => {
    setRoute({
      destination: route.destination,
      type: route.type,
      path: route.path,
      pathDays: route.pathDays,
    });
    setSelectedRoute(route);
  };

  const handleDeleteRoute = async (routeId) => {
    if (!user) {
      alert('Please log in to delete routes');
      return;
    }

    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteSavedRoute(routeId, user.username);
        if (selectedRoute && selectedRoute._id === routeId) {
          setSelectedRoute(null);
        }
        alert('Route deleted successfully');
      } catch (error) {
        console.error('Error deleting route:', error);
        alert(`Failed to delete route: ${error.message}`);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="saved-routes-container">
        <h2 className="saved-routes-title">Saved Routes</h2>
        <div className="loading-message">
          <p>Loading your saved routes...</p>
        </div>
      </div>
    );
  }

  // Show login required message
  if (!user) {
    return (
      <div className="saved-routes-container">
        <h2 className="saved-routes-title">Saved Routes</h2>
        <div className="login-required-message">
          <p>Please log in to view your saved routes</p>
        </div>
      </div>
    );
  }

  if (savedRoutes.length === 0) {
    return (
      <div className="saved-routes-container">
        <h2 className="saved-routes-title">Saved Routes</h2>
        <div className="no-routes-message">
          <p>No saved routes yet.</p>
          <p>Create a route and save it to see it here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-routes-container">
      <h2 className="saved-routes-title">Saved Routes</h2>
      
      <div className="saved-routes-grid">
        {savedRoutes.map((route) => (
          <div key={route._id} className="saved-route-card">
            <div className="route-header">
              <h3 className="route-name">{route.name}</h3>
              <div className="route-type">{route.type}</div>
            </div>
            
            <div className="route-details">
              <p className="route-destination">📍 {route.destination}</p>
              <p className="route-description">{route.description?.trim() || '\u00A0'}</p>
              <p className="route-date">Saved: {formatDate(route.createdAt)}</p>
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
                onClick={() => handleDeleteRoute(route._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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

export default SavedRoutes; 