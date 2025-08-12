// src/pages/CreateRoute.js
import React, { useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import TripDisplay from '../components/TripDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRoute, getCoordinatesORS } from '../api/tripApi';
// import { offsetPoint } from '../utils/GeoUtils' // Not needed anymore
import '../style/CreateRoute.css';

function CreateRoute() {
  const { setRoute, saveRouteToHistory, currentRoute } = useRouteStore();
  const [destination, setDestination] = useState('');
  const [type, setType] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Helpers --------------------------------------------------------------

  // Haversine distance in KM for [lon,lat]
  function segmentDistanceKm(a, b) {
    const [lon1, lat1] = a;
    const [lon2, lat2] = b;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const la1 = lat1 * Math.PI / 180;
    const la2 = lat2 * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }

  function calculateRouteDistanceKm(coords) {
    if (!coords || coords.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += segmentDistanceKm(coords[i - 1], coords[i]);
    }
    return total;
  }

  // Split a single route into N days by target distance (greedy by cumulative length)
  function splitRouteByDays(coordinates, days) {
    const total = calculateRouteDistanceKm(coordinates);
    if (days <= 1 || total === 0) return [coordinates];

    const targetPerDay = total / days;
    const result = [];
    let dayStartIdx = 0;
    let acc = 0;

    for (let i = 1; i < coordinates.length && result.length < days - 1; i++) {
      acc += segmentDistanceKm(coordinates[i - 1], coordinates[i]);
      if (acc >= targetPerDay) {
        result.push(coordinates.slice(dayStartIdx, i + 1));
        dayStartIdx = i;
        acc = 0;
      }
    }
    // last day
    if (dayStartIdx < coordinates.length - 1) {
      result.push(coordinates.slice(dayStartIdx));
    } else if (result.length < days) {
      result.push([coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]]);
    }
    return result;
  }

  // Try a few loop lengths and pick the first that fits 5–15 km (one API call per try)
  async function getHikeLoopBetween5to15Km(startLon, startLat) {
    const candidatesKm = [10, 12, 8, 14, 6, 5, 15]; // ordered by “likely to succeed”
    for (const lenKm of candidatesKm) {
      try {
        const coords = await getRoute(
          [startLon, startLat],
          null,
          'foot-hiking',
          { round_trip: { length: Math.round(lenKm * 1000), points: 3 } }
        );
        const d = calculateRouteDistanceKm(coords);
        if (d >= 5 && d <= 15) {
          return { coords, km: d };
        }
      } catch (e) {
        // try next length
      }
    }
    throw new Error('Could not generate a loop hike between 5–15 km. Try another location.');
  }

  // For bikes: we’ll build a city-to-city route by picking a start near the destination
  // with one request to ORS, then split into 2 days (~<=60km/day if possible).
  // Strategy: use a small offset circle around destination and pick the first route under ~120km.
  async function getBikeTwoDaysNearDestination(destLon, destLat) {
    // Bearings and offsets (km) to probe a start location near destination
    const bearings = [0, 90, 180, 270, 45, 135, 225, 315];
    const offsetsKm = [60, 45, 35, 25, 15]; // distance from destination to start

    const toLonLatOffset = (lon, lat, km, bearingDeg) => {
      // Simple equirectangular-ish offset (good enough for ~<100km)
      const R = 6371;
      const br = (bearingDeg * Math.PI) / 180;
      const dByR = km / R;
      const lat1 = (lat * Math.PI) / 180;
      const lon1 = (lon * Math.PI) / 180;

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(dByR) + Math.cos(lat1) * Math.sin(dByR) * Math.cos(br)
      );
      const lon2 =
        lon1 +
        Math.atan2(
          Math.sin(br) * Math.sin(dByR) * Math.cos(lat1),
          Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat2)
        );
      return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
    };

    for (const offset of offsetsKm) {
      for (const bearing of bearings) {
        const [startLon, startLat] = toLonLatOffset(destLon, destLat, offset, bearing);
        try {
          const coords = await getRoute([startLon, startLat], [destLon, destLat], 'cycling-regular');
          const totalKm = calculateRouteDistanceKm(coords);
          if (totalKm > 0) {
            // Split into 2 days by distance (aim ~half/half)
            const days = splitRouteByDays(coords, 2);
            const day1 = calculateRouteDistanceKm(days[0]);
            const day2 = calculateRouteDistanceKm(days[1]);
            if (day1 <= 60 + 5 && day2 <= 60 + 5) { // allow small tolerance
              return { coords, days, totalKm };
            }
            // If slightly over, still return first found; else keep searching
            if (totalKm <= 130) {
              return { coords, days, totalKm };
            }
          }
        } catch (e) {
          // try next probe
        }
      }
    }
    throw new Error('Could not find a two-day bike route near destination. Try another place.');
  }

  // --- Submit ---------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResult(false);

    try {
      if (!destination || !type) throw new Error('Please select destination and type.');

      // 1) Geocode destination to [lon, lat]
      const [destLon, destLat] = await getCoordinatesORS(destination);

      let path = null;
      let pathDays = [];

      if (type === 'hike') {
        // One call with ORS round_trip; loop between 5–15km
        const res = await getHikeLoopBetween5to15Km(destLon, destLat);
        path = res.coords;
        pathDays = [res.coords]; // single-day loop
      } else if (type === 'bike') {
        // Find a realistic 2-day route (start near destination), split ~60km/day
        const res = await getBikeTwoDaysNearDestination(destLon, destLat);
        path = res.coords;
        pathDays = res.days;
      } else {
        throw new Error('Unsupported type. Choose "hike" or "bike".');
      }

      if (!path || path.length < 2) {
        throw new Error('No route found. Try a different destination.');
      }

      // 2) Save to store (the server will handle DB save when you call it)
      setRoute({
        destination,
        type,
        path,       // [[lon,lat], ...]
        pathDays,   // [[[lon,lat], ...], ...]
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
                🏔️ Hike
                <div className="route-type-description">
                  Loop trail (5-15km, 1 day)
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
                🚴 Bike
                <div className="route-type-description">
                  City-to-city (2 days, max 60km/day)
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

      {isLoading && <LoadingSpinner message="Finding the perfect route for you..." />}

      {showResult && currentRoute?.destination && currentRoute?.type && (
        <TripDisplay />
      )}
    </div>
  );
}

export default CreateRoute;

