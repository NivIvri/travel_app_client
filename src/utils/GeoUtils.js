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
