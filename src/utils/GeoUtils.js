// src/utils/geoUtils.js

/**
 * Calculates a point at a given distance (km) and bearing from a given lat/lon.
 * Returns [lon, lat] in degrees, suitable for ORS or Leaflet.
 */
export function offsetPoint(lat, lon, distanceKm, bearingDegrees) {
  const R = 6371; // Earth's radius in km
  const bearing = (bearingDegrees * Math.PI) / 180;
  const d = distanceKm / R;

  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]; // [lon, lat]
}

/**
 * Optimizes route coordinates for storage by reducing the number of points
 * while maintaining route accuracy. Useful for MongoDB storage limits.
 * @param {Array} coordinates - Array of [lon, lat] coordinate pairs
 * @param {number} maxPoints - Maximum number of points to keep (default: 50)
 * @returns {Array} Optimized coordinate array
 */
export function optimizeRouteForStorage(coordinates, maxPoints = 50) {
  if (!coordinates || coordinates.length <= maxPoints) {
    return coordinates;
  }
  
  // Simple sampling: take every nth point
  const step = Math.floor(coordinates.length / maxPoints);
  const optimized = [];
  
  for (let i = 0; i < coordinates.length; i += step) {
    optimized.push(coordinates[i]);
  }
  
  // Always include the last point
  if (optimized[optimized.length - 1] !== coordinates[coordinates.length - 1]) {
    optimized.push(coordinates[coordinates.length - 1]);
  }
  
  return optimized;
}

/**
 * Calculates the approximate distance of a route in kilometers
 * @param {Array} route - Array of [lon, lat] coordinate pairs
 * @returns {number} Distance in kilometers
 */
export function calculateRouteDistance(route) {
  if (!route || route.length < 2) return 0;
  
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const [lon1, lat1] = route[i - 1];
    const [lon2, lat2] = route[i];
    const R = 6371; // Earth's radius in km
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
