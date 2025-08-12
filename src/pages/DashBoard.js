// src/pages/Dashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import "../style/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="dashboard-container">
        <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to RoutePlanner</h1>
        <p className="dashboard-subtitle">
          Plan your perfect adventure with intelligent route generation
        </p>
      </div>

      {user && (
        <div className="welcome-message">
          <h2 className="welcome-title">Welcome back, {user.username}!</h2>
          <p className="welcome-text">
            Ready to discover new routes and plan your next adventure?
          </p>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">🗺️</div>
            <h3 className="card-title">Create New Route</h3>
          </div>
          <p className="card-description">
            Generate personalized routes for hiking or biking adventures. 
            Choose from loop trails for hiking or multi-day city-to-city routes for cycling.
          </p>
          <div className="card-actions">
            <button 
              className="card-btn card-btn-primary"
              onClick={() => navigate("/create")}
            >
              🚀 Create Route
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon">📚</div>
            <h3 className="card-title">Route History</h3>
          </div>
          <p className="card-description">
            View and manage your saved routes. Access detailed maps, 
            weather forecasts, and route information for all your adventures.
          </p>
          <div className="card-actions">
            <button 
              className="card-btn card-btn-primary"
              onClick={() => navigate("/history")}
            >
              📖 View History
            </button>
          </div>
        </div>
      </div>

      <div className="feature-highlights">
        <div className="feature-item">
          <div className="feature-icon">🌤️</div>
          <p className="feature-text">3-Day Weather Forecast</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🗺️</div>
          <p className="feature-text">Interactive Route Maps</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📱</div>
          <p className="feature-text">Mobile Responsive</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">💾</div>
          <p className="feature-text">Save & Share Routes</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
