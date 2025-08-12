// src/components/MapWithRoute.js
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { useRouteStore } from '../store/routeStore';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

function MapWithRoute({ route }) {
  const { currentRoute } = useRouteStore();
  const [mapKey, setMapKey] = useState(0);
  
  const routeToDisplay = currentRoute.path;
  const pathDays = currentRoute.pathDays;
  console.log('MapWithRoute - currentRoute:', currentRoute);
  console.log('MapWithRoute - routeToDisplay:', routeToDisplay);
  console.log('MapWithRoute - pathDays:', pathDays);
  
  // Force map re-render when route changes
  useEffect(() => {
    if (currentRoute.path && currentRoute.path.length > 0) {
      setMapKey(prev => prev + 1);
    }
  }, [currentRoute.path, currentRoute.pathDays]);
  
  if (!routeToDisplay || routeToDisplay.length === 0) {
    console.log('MapWithRoute - No route to display');
    return (
      <div style={{ height: "300px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <p>Loading route map...</p>
      </div>
    );
  }

  // Get center from the last point of the route
  const lastPoint = routeToDisplay[routeToDisplay.length - 1];
  if (!lastPoint || !Array.isArray(lastPoint) || lastPoint.length < 2) {
    console.log('MapWithRoute - Invalid last point:', lastPoint);
    return <p>Invalid route data</p>;
  }
  
  const center = [...lastPoint].reverse(); // Use destination (last point) - convert [lon, lat] to [lat, lon]
  
  // Colors for each day
  const dayColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <MapContainer 
      key={`${currentRoute.destination}-${mapKey}`} // Force re-render when route changes
      center={center} 
      zoom={10} 
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Render each day with different color */}
      {pathDays && pathDays.map((dayRoute, index) => {
        if (!dayRoute || !Array.isArray(dayRoute) || dayRoute.length === 0) {
          console.log(`MapWithRoute - Invalid dayRoute for day ${index}:`, dayRoute);
          return null;
        }
        
        const positions = dayRoute.map(coord => {
          if (!Array.isArray(coord) || coord.length < 2) {
            console.log(`MapWithRoute - Invalid coordinate in day ${index}:`, coord);
            return null;
          }
          return [...coord].reverse(); // Convert [lon, lat] to [lat, lon]
        }).filter(Boolean); // Remove null values
        
        if (positions.length === 0) {
          console.log(`MapWithRoute - No valid positions for day ${index}`);
          return null;
        }
        
        return (
          <Polyline 
            key={index}
            positions={positions} 
            color={dayColors[index % dayColors.length]}
            weight={3}
          />
        );
      })}
    </MapContainer>
  );
}

export default MapWithRoute;
