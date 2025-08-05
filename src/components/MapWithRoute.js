// src/components/MapWithRoute.js
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { useRouteStore } from '../store/routeStore';
import 'leaflet/dist/leaflet.css';

function MapWithRoute({ route }) {
  const { currentRoute } = useRouteStore();
  
  const routeToDisplay = currentRoute.path;
  const pathDays = currentRoute.pathDays;
  console.log(currentRoute,'cc');
  if (!routeToDisplay || routeToDisplay.length === 0) return null;

  const center = [...routeToDisplay[routeToDisplay.length - 1]].reverse(); // Use destination (last point)
  
  // Colors for each day
  const dayColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <MapContainer 
      key={currentRoute.destination} // Force re-render when destination changes
      center={center} 
      zoom={10} 
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Render each day with different color */}
      {pathDays && pathDays.map((dayRoute, index) => (
        <Polyline 
          key={index}
          positions={dayRoute.map(coord => [...coord].reverse())} 
          color={dayColors[index % dayColors.length]}
          weight={3}
        />
      ))}
    </MapContainer>
  );
}

export default MapWithRoute;
