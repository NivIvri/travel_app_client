// src/pages/RouteHistory.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import { useAuthStore } from '../store/authStore';
import TripDisplay from '../components/TripDisplay';
import '../style/RouteHistory.css'; 

function RouteHistory() {
  const { 
    savedRoutes, 
    history, 
    deleteSavedRoute, 
    saveRouteFromHistory,
    removeFromHistory,
    setRoute, 
    currentRoute, 
    isLoading, 
    loadUserRoutes 
  } = useRouteStore();
  const { user } = useAuthStore();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'history'
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [saveFormData, setSaveFormData] = useState({ name: '', description: '' });

  const handleViewRoute = (route) => {
    console.log('Viewing route:', route);
    
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

  const handleSaveFromHistory = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setSaveFormData({ 
      name: `${historyItem.destination} ${historyItem.type} route`, 
      description: '' 
    });
    setShowSaveModal(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!saveFormData.name.trim()) {
      alert('Please enter a route name');
      return;
    }

    try {
      await saveRouteFromHistory(selectedHistoryItem, saveFormData.name, saveFormData.description, user.username);
      setShowSaveModal(false);
      setSelectedHistoryItem(null);
      setSaveFormData({ name: '', description: '' });
      alert('Route saved successfully!');
    } catch (error) {
      alert(`Error saving route: ${error.message}`);
    }
  };

  const handleRemoveFromHistory = (historyId) => {
    if (window.confirm('Are you sure you want to remove this from history?')) {
      removeFromHistory(historyId);
      if (selectedRoute && selectedRoute.id === historyId) {
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
        <h1 className="route-history-title">Your Routes</h1>
        <p className="route-history-subtitle">
          Manage your saved routes and view your generation history
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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Saved Routes ({savedRoutes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 History ({history.length})
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-state">
          <p>Loading your routes...</p>
        </div>
      ) : activeTab === 'saved' ? (
        // Saved Routes Tab
        savedRoutes.length === 0 ? (
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
        )
      ) : (
        // History Tab
        history.length === 0 ? (
          <div className="empty-state">
            <p>No route history yet. Generate some routes to see them here!</p>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((historyItem) => (
              <div key={historyItem.id} className="history-item-card">
                <div className="route-header">
                  <h3 className="route-name">
                    {historyItem.destination} {historyItem.type} route
                    {historyItem.isSaved && <span className="saved-badge">💾 Saved</span>}
                  </h3>
                  <div className="route-type">{historyItem.type}</div>
                </div>
                
                <div className="route-details">
                  <p className="route-destination">📍 {historyItem.destination}</p>
                  <p className="route-date">Generated: {formatDate(historyItem.date)}</p>
                </div>
                
                <div className="route-actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewRoute(historyItem)}
                  >
                    👁️ View Full Details
                  </button>
                  {!historyItem.isSaved && (
                    <button 
                      className="save-btn"
                      onClick={() => handleSaveFromHistory(historyItem)}
                    >
                      💾 Save Route
                    </button>
                  )}
                  <button 
                    className="delete-btn"
                    onClick={() => handleRemoveFromHistory(historyItem.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="save-modal">
            <h3>Save Route</h3>
            <form onSubmit={handleSaveSubmit}>
              <div className="form-group">
                <label>Route Name:</label>
                <input
                  type="text"
                  value={saveFormData.name}
                  onChange={(e) => setSaveFormData({...saveFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional):</label>
                <textarea
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData({...saveFormData, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Route</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowSaveModal(false);
                    setSelectedHistoryItem(null);
                    setSaveFormData({ name: '', description: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRoute && currentRoute.destination && currentRoute.type && (
        <div className="selected-route-view">
          <div className="selected-route-header">
            <h3>Viewing: {selectedRoute.name || `${selectedRoute.destination} ${selectedRoute.type} route`}</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedRoute(null)}
            >
              ✕
            </button>
          </div>
          <div className="selected-route-content">
            <TripDisplay showSaveButton={false} showEnrichment={false} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteHistory;
