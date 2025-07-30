// src/pages/CreateRoute.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import { useNavigate } from 'react-router-dom';
import TripDisplay from '../components/TripDisplay';
import MapWithRoute from '../components/MapWithRoute';
import { getRoute } from '../api/tripApi';
import '../style/CreateRoute.css'; 

function CreateRoute() {
  const { setRoute, saveRouteToHistory, currentRoute } = useRouteStore();
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');
  const [showResult, setShowResult] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // NEED TO CONVERT THE TEXT TO COORD
    const orsType = type === "bike" ? "cycling-regular" : "foot-hiking";

    const route = await getRoute( 
      [34.8760, 32.2400], 
      [34.7818, 32.0853],
      orsType
    );
    setRoute({ destination, type, path: route });
    saveRouteToHistory(destination, type);
    setShowResult(true);
  } catch (err) {
    console.error(" Error fetching route:", err);
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
    <TripDisplay
      destination={currentRoute.destination}
      type={currentRoute.type}
    />
  </>
)}

    </div>
  );
}

export default CreateRoute;
