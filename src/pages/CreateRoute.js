// src/pages/CreateRoute.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import TripDisplay from '../components/TripDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRoute } from '../api/tripApi';
import { getCoordinatesORS } from '../api/tripApi';
import { offsetPoint } from '../utils/GeoUtils'
import '../style/CreateRoute.css'; 


function CreateRoute() {
  const { setRoute, saveRouteToHistory, currentRoute } = useRouteStore();
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setShowResult(false);

  try {
    const orsType = type === "bike" ? "cycling-regular" : "foot-hiking";
    const maxDistance = type === "bike" ? 60 : 15;
    const initialOffset = maxDistance;
    const bearings = [0, 90, 180, 270];
    const offsets = [initialOffset, initialOffset * 0.7, initialOffset * 0.5, initialOffset * 0.3];

    // 1. Get coordinates of destination (e.g., "Tel Aviv")
    const [destLon, destLat] = await getCoordinatesORS(destination);

    let foundRoute = null;
    let error = null;

    for (let offset of offsets) {
      for (let bearing of bearings) {
        const [rawStartLon, rawStartLat] = offsetPoint(destLat, destLon, offset, bearing);
        try {
          const fullRoute = await getRoute(
            [rawStartLon, rawStartLat],
            [destLon, destLat],
            orsType
          );
          const actualDistance = calculateRouteDistance(fullRoute);
          if (actualDistance <= maxDistance) {
            foundRoute = fullRoute;
            break;
          }
        } catch (err) {
          error = err;
        }
      }
      if (foundRoute) break;
    }

    if (!foundRoute) {
      setIsLoading(false);
      alert("Could not find a route within the desired distance. Please try a different location or reduce the distance.");
      return;
    }

    // 4. Cut route into 2 days
    const halfway = Math.floor(foundRoute.length / 2);
    const pathDays = [foundRoute.slice(0, halfway), foundRoute.slice(halfway)];

    // 5. Save to store
    setRoute({
      destination,
      type,
      path: foundRoute,
      pathDays,
    });

    saveRouteToHistory();
    setShowResult(true);
    setIsLoading(false);
  } catch (err) {
    console.error("Error building route:", err);
    setIsLoading(false);
  }
};

  // Helper function to calculate approximate route distance
  function calculateRouteDistance(route) {
    if (!route || route.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      const [lon1, lat1] = route[i - 1];
      const [lon2, lat2] = route[i];
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      total += R * c;
    }
    return total;
  }


  return (
    <div className="futuristic-bg">
      <div className="glass-card">
        <h2 className="neon-title">Plan Your Trip</h2>

        <form onSubmit={handleSubmit} className="futuristic-form">
          {/* Destination input */}
          <input
            type="text"
            placeholder="Enter city or country"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            disabled={isLoading}
          />

          <select value={type} onChange={(e) => setType(e.target.value)} required disabled={isLoading}>
            <option value="">Select trip type</option>
           <option value="hike">hike</option>
        <option value="bike">bike</option>
          </select>

          <button type="submit" className="neon-btn" disabled={isLoading}>
            {isLoading ? 'Creating Trip...' : 'Create Trip'}
          </button>
        </form>
      </div>

      {isLoading && (
        <LoadingSpinner message="Finding the perfect route for you..." />
      )}

  {showResult && currentRoute.destination && currentRoute.type && (
  <>
    <TripDisplay/>
  </>
)}

    </div>
  );
}

export default CreateRoute;
