
import React from 'react';
import { useRouteStore } from '../store/routeStore';
import MapWithRoute from '../components/MapWithRoute';
import WeatherForecast from '../components/WeatherForecast';
import SaveRoute from '../components/SaveRoute';
import CountryImage from '../components/CountryImage';
import RouteEnrichment from '../components/RouteEnrichment';
import { calculateRouteDistance } from '../utils/GeoUtils';
import '../style/TripDisplay.css'; 


function TripDisplay({ showSaveButton = true, showEnrichment = true }) {
  const { currentRoute } = useRouteStore();
  


  const getTripDescription = () => {
    if (currentRoute.type === "bike") {
      return "2-day city-to-city bike trip (max 60km per day)";
    } else if (currentRoute.type === "hike") {
      return "1-day loop hike (5-15km)";
    }
    return "Trip";
  };

  return (
    <div className="trip-display">
      <div className='trip-title'>{currentRoute.destination}</div>
      <div className="trip-type">
        <strong>{currentRoute.type.toUpperCase()}</strong> - {getTripDescription()}
      </div>
      
      {/* Country Image */}
      <div className="country-image">
        <CountryImage />
      </div>
      
      <div className="trip-content">
        {/* Route Information */}
        <div className="trip-section route-info">
          <h3 className="section-title">Route Details</h3>
          {currentRoute.pathDays && currentRoute.pathDays.map((dayRoute, index) => (
            <div key={index} className="day-route">
              <h4>Day {index + 1}</h4>
              <p>Distance: <strong>{calculateRouteDistance(dayRoute).toFixed(1)} km</strong></p>
              {currentRoute.type === "bike" && (
                <p>Route: {index === 0 ? "Start city" : "Day 1 end"} → {index === 0 ? "Day 1 end" : "Destination"}</p>
              )}
              {currentRoute.type === "hike" && (
                <p>Route: Loop trail starting and ending at {currentRoute.destination}</p>
              )}
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="trip-section map-section">
          <h3 className="section-title">Route Map</h3>
          <div className="map-container">
            <MapWithRoute />
          </div>
        </div>
      </div>

      {/* Weather Forecast - Smaller and below */}
      <div className="trip-section weather-section-compact">
        <h3 className="section-title">3-Day Weather Forecast</h3>
        <WeatherForecast />
      </div>

             {/* LLM Enrichment */}
       {showEnrichment && <RouteEnrichment />}

      {/* Save Route - Only show if showSaveButton is true */}
      {showSaveButton && (
        <div className="save-section">
          <SaveRoute />
        </div>
      )}
    </div>
  );
}

export default TripDisplay;
