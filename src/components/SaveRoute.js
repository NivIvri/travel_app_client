// src/components/SaveRoute.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import { useAuthStore } from '../store/authStore';
import '../style/SaveRoute.css';

function SaveRoute() {
  const { currentRoute, saveRouteWithDetails } = useRouteStore();
  const { user } = useAuthStore();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to save routes');
      return;
    }

    if (!routeName.trim()) {
      alert('Please enter a route name');
      return;
    }

    setIsSaving(true);
    try {
      await saveRouteWithDetails(routeName.trim(), description.trim(), user.username);
      setRouteName('');
      setDescription('');
      setShowSaveForm(false);
      alert('Route saved successfully!');
    } catch (error) {
      console.error('Error saving route:', error);
      alert(`Failed to save route: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setRouteName('');
    setDescription('');
    setShowSaveForm(false);
  };

  // Don't show save button if no route is available
  if (!currentRoute.destination || !currentRoute.path.length) {
    return null;
  }

  // Don't show save button if user is not logged in
  if (!user) {
    return (
      <div className="save-route-container">
        <div className="login-required">
          <p>Please log in to save routes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="save-route-container">
      {!showSaveForm ? (
        <button 
          className="save-route-btn"
          onClick={() => setShowSaveForm(true)}
        >
          💾 Save Route
        </button>
      ) : (
        <div className="save-route-form">
          <h3>Save Your Route</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="routeName">Route Name *</label>
              <input
                id="routeName"
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g., Weekend Hike to Tel Aviv"
                required
                disabled={isSaving}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about your route..."
                rows="3"
                disabled={isSaving}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={isSaving || !routeName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Route'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SaveRoute; 