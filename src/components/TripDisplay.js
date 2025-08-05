
import React from 'react';
import { useRouteStore } from '../store/routeStore';
import MapWithRoute from '../components/MapWithRoute';
import WeatherForecast from '../components/WeatherForecast';
import SaveRoute from '../components/SaveRoute';
import '../style/TripDisplay.css'; 


function TripDisplay({}) {

  const { currentRoute } = useRouteStore();
    console.log("Route Path:", currentRoute.path[0][0],currentRoute.path[0][1]); // 🧾 מדפיס את כל הנתיב

  return (
    <div className="trip-display">
      <div className='trip-title'>{currentRoute.destination}</div>
      <div>Type of trip: <strong>{currentRoute.type}</strong></div>
          <MapWithRoute />
          <WeatherForecast />
          <SaveRoute />
    </div>
  );
}

export default TripDisplay;
