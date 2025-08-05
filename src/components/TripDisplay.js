
import React from 'react';
import { useRouteStore } from '../store/routeStore';
import MapWithRoute from '../components/MapWithRoute';
import WeatherForecast from '../components/WeatherForecast';
import '../style/TripDisplay.css'; 


function TripDisplay({}) {

  const { currentRoute } = useRouteStore();
    console.log("Route Path:", currentRoute.path[0][0],currentRoute.path[0][1]); // 🧾 מדפיס את כל הנתיב

  return (
    <div className="trip-display">
      <div className='trip-header'>{currentRoute.destination}</div>
      <div>Type of trip: <strong>{currentRoute.type}</strong></div>
          <MapWithRoute route={currentRoute.path} />
          <WeatherForecast lat={currentRoute.path[0][0]} lon={currentRoute.path[0][1]} />
    </div>
  );
}

export default TripDisplay;
