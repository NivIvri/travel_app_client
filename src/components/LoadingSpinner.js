// src/components/LoadingSpinner.js
import React from 'react';
import '../style/LoadingSpinner.css';

function LoadingSpinner({ message = "Loading your route..." }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

export default LoadingSpinner; 