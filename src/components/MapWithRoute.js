// src/components/MapWithRoute.js
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapWithRoute({ route }) {
  if (!route || route.length === 0) return null;

const center = [...route[Math.floor(route.length / 2)]].reverse();
  const polyline = route.map(coord => [...coord].reverse()); // [lat, lon]

  return (
    <MapContainer center={center} zoom={10} style={{ height: "300px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={polyline} color="blue" />
    </MapContainer>
  );
}

export default MapWithRoute;
