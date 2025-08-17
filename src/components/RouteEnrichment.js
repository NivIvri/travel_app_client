import React, { useState, useEffect } from 'react';
import { getRouteEnrichment } from '../api/tripApi';
import { useRouteStore } from '../store/routeStore';
import '../style/RouteEnrichment.css';

function RouteEnrichment() {
  const { currentRoute } = useRouteStore();
  const [enrichment, setEnrichment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentRoute?.destination && currentRoute?.path?.length > 0) {
      setIsLoading(true);
      setError(null);
      
      // Fire enrichment request in background
      getRouteEnrichment(currentRoute)
        .then(data => {
          setEnrichment(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Enrichment failed:', err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [currentRoute?.destination, currentRoute?.path]);

  if (!currentRoute?.destination) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="enrichment-panel">
        <div className="enrichment-header">
          <h3>Route Insights</h3>
          <div className="enriching-indicator">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Enriching...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !enrichment) {
    return (
      <div className="enrichment-panel">
        <div className="enrichment-header">
          <h3>Route Insights</h3>
        </div>
        <div className="enrichment-fallback">
          <p>No enrichment available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enrichment-panel">
      <div className="enrichment-header">
        <h3>Route Insights</h3>
        <span className="enrichment-subtitle">{enrichment.title}</span>
      </div>
      
      <div className="enrichment-content">
        {enrichment.overview && (
          <div className="enrichment-section">
            <h4>📖 Overview</h4>
            <p>{enrichment.overview}</p>
          </div>
        )}

        {enrichment.bestWindows?.length > 0 && (
          <div className="enrichment-section">
            <h4>⏰ Best Windows</h4>
            <ul>
              {enrichment.bestWindows.map((window, index) => (
                <li key={index}>{window}</li>
              ))}
            </ul>
          </div>
        )}

        {enrichment.segments?.length > 0 && (
          <div className="enrichment-section">
            <h4>🗺️ Route Segments</h4>
            {enrichment.segments.map((segment, index) => (
              <div key={index} className="segment-item">
                <h5>{segment.name}</h5>
                <p>{segment.description}</p>
                <div className="segment-meta">
                  <span className={`difficulty ${segment.difficulty}`}>
                    {segment.difficulty}
                  </span>
                  {segment.highlights?.length > 0 && (
                    <div className="highlights">
                      {segment.highlights.map((highlight, hIndex) => (
                        <span key={hIndex} className="highlight-tag">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {enrichment.pois?.length > 0 && (
          <div className="enrichment-section">
            <h4>📍 Points of Interest</h4>
            {enrichment.pois.map((poi, index) => (
              <div key={index} className="poi-item">
                <h5>{poi.name}</h5>
                <p>{poi.description}</p>
                <span className="poi-type">{poi.type}</span>
              </div>
            ))}
          </div>
        )}

        {enrichment.safety_tips?.length > 0 && (
          <div className="enrichment-section">
            <h4>⚠️ Safety Tips</h4>
            <ul>
              {enrichment.safety_tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {enrichment.gear_checklist?.length > 0 && (
          <div className="enrichment-section">
            <h4>🎒 Gear Checklist</h4>
            <ul>
              {enrichment.gear_checklist.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {enrichment.food_stops?.length > 0 && (
          <div className="enrichment-section">
            <h4>🍽️ Food Stops</h4>
            {enrichment.food_stops.map((stop, index) => (
              <div key={index} className="food-stop-item">
                <h5>{stop.name}</h5>
                <p>{stop.description}</p>
                <span className="food-type">{stop.type}</span>
              </div>
            ))}
          </div>
        )}

        {enrichment.photo_spots?.length > 0 && (
          <div className="enrichment-section">
            <h4>📸 Photo Spots</h4>
            {enrichment.photo_spots.map((spot, index) => (
              <div key={index} className="photo-spot-item">
                <h5>{spot.name}</h5>
                <p>{spot.description}</p>
                {spot.best_time && (
                  <span className="best-time">Best: {spot.best_time}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteEnrichment;
