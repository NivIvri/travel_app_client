// src/pages/CreateRoute.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import TripDisplay from '../components/TripDisplay';
import { getRoute } from '../api/tripApi';
import { getCoordinatesORS } from '../api/tripApi';
import { offsetPoint } from '../utils/GeoUtils'
import '../style/CreateRoute.css'; 


function CreateRoute() {
  const { setRoute, saveRouteToHistory, currentRoute } = useRouteStore();
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');
  const [showResult, setShowResult] = useState(false);


  
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const orsType = type === "bike" ? "cycling-regular" : "foot-hiking";
    const distanceKm = type === "bike" ? 60 : 15;

    // 1. Get coordinates of destination (e.g., "Tel Aviv")
    const [destLon, destLat] = await getCoordinatesORS(destination);

    // 2. Create a fake start point X km north (bearing = 0)
    const [rawStartLon, rawStartLat] = offsetPoint(destLat, destLon, distanceKm, 0);

    // 3. Ask ORS to build the route (it will adjust the point as needed)
    const fullRoute = await getRoute(
      [rawStartLon, rawStartLat],
      [destLon, destLat],
      orsType
    );

    // 4. Cut route into 2 days
    const halfway = Math.floor(fullRoute.length / 2);
    const pathDays = [fullRoute.slice(0, halfway), fullRoute.slice(halfway)];

    // 5. Save to store
    setRoute({
      destination,
      type,
      path: fullRoute,
      pathDays,
    });

    saveRouteToHistory();
    setShowResult(true);
  } catch (err) {
    console.error("❌ Error building route:", err);
  }
};



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
          />

          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select trip type</option>
           <option value="hike">hike</option>
        <option value="bike">bike</option>
          </select>

          <button type="submit" className="neon-btn">Create Trip</button>
        </form>
      </div>

  {showResult && currentRoute.destination && currentRoute.type && (
  <>
    <TripDisplay/>
  </>
)}

    </div>
  );
}

export default CreateRoute;
