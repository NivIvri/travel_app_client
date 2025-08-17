// src/pages/CreateRoute.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import TripDisplay from '../components/TripDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAuthHeaders } from '../api/authApi';
import '../style/CreateRoute.css';

const API_BASE = "http://localhost:5000/api";

function CreateRoute() {
  const { setRoute, saveRouteToHistory, currentRoute } = useRouteStore();
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Submit ---------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResult(false);

    try {
      if (!destination || !type) throw new Error('Please select destination and type.');

      // Call backend to generate route
      const response = await fetch(`${API_BASE}/generate-route`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...getAuthHeaders() 
        },
        body: JSON.stringify({ destination, type })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate route. Please try again.');
      }

      // Save to store
      setRoute({
        destination: data.destination,
        type: data.type,
        path: data.path,       // [[lon,lat], ...]
        pathDays: data.pathDays,   // [[[lon,lat], ...], ...]
      });
      
      saveRouteToHistory();
      setShowResult(true);
    } catch (err) {
      console.error('Create route error:', err);
      alert(err.message || 'Failed to create route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render --------------------------------------------------------------

  return (
    <div className="create-route-container">
      <div className="create-route-header">
        <h1 className="create-route-title">Plan Your Adventure</h1>
        <p className="create-route-subtitle">
          Generate personalized routes for your next hiking or biking adventure
        </p>
      </div>

      <div className="create-route-content">
        {/* Left Side - Form */}
        <div className="form-section">
          <div className="form-card">
            <div className="form-card-header">
              <h2>Create New Route</h2>
              <p>Fill in the details below to generate your perfect adventure</p>
            </div>

            <form onSubmit={handleSubmit} className="create-route-form">
              <div className="form-group">
                <label className="form-label">Destination</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter city or country (e.g., Paris, France)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trip Type</label>
                <div className="trip-type-options">
                  <div className="trip-type-option">
                    <input
                      type="radio"
                      id="hike"
                      name="type"
                      value="hike"
                      checked={type === 'hike'}
                      onChange={(e) => setType(e.target.value)}
                      disabled={isLoading}
                    />
                    <label htmlFor="hike" className="trip-type-label">
                      <div className="trip-type-icon">🏔️</div>
                      <div className="trip-type-content">
                        <div className="trip-type-name">Hike</div>
                        <div className="route-type-description">
                          Loop trail (5-15km, 1 day)
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="trip-type-option">
                    <input
                      type="radio"
                      id="bike"
                      name="type"
                      value="bike"
                      checked={type === 'bike'}
                      onChange={(e) => setType(e.target.value)}
                      disabled={isLoading}
                    />
                    <label htmlFor="bike" className="trip-type-label">
                      <div className="trip-type-icon">🚴</div>
                      <div className="trip-type-content">
                        <div className="trip-type-name">Bike</div>
                        <div className="route-type-description">
                          City-to-city (2 days, max 60km/day)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className={`generate-btn ${isLoading ? 'loading' : ''}`} 
                disabled={isLoading}
              >
                {isLoading ? 'Creating Route...' : 'Generate Route'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Result */}
        <div className="result-section">
          {isLoading && (
            <div className="loading-card">
              <LoadingSpinner message="Finding the perfect route for you..." />
            </div>
          )}

          {showResult && currentRoute?.destination && currentRoute?.type && (
            <div className="result-card">
              <TripDisplay />
            </div>
          )}

          {!isLoading && !showResult && (
            <div className="empty-state-card">
              <div className="empty-state-icon">🗺️</div>
              <h3>Ready to Explore?</h3>
              <p>Fill out the form on the left to generate your personalized adventure route</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRoute;

