import React, { useEffect, useState } from 'react';
import { getForecastOpenMeteo } from '../api/openMeteo';
import { useRouteStore } from '../store/routeStore';
import '../style/WeatherForecast.css'; 

function WeatherForecast() {
  const [forecast, setForecast] = useState([]);
  const { currentRoute } = useRouteStore();
  
  useEffect(() => {
    if (currentRoute.path && currentRoute.path[0] && currentRoute.path[0][0] && currentRoute.path[0][1]) {
      const [lon, lat] = currentRoute.path[0]; // First point coordinates
      getForecastOpenMeteo(lat, lon).then(setForecast);
    }
  }, [currentRoute.path]);

  if (!forecast.length) return <p>Loading weather forecast...</p>;

  return (
    <div className="weather-forecast">
      <div>3-Day Forecast</div>
      <div>
        {forecast.map((day, index) => (
          <div key={index}>
            <strong>{new Date(day.date).toLocaleDateString()}</strong><br />
            🌡️ {day.tempMin}°C – {day.tempMax}°C<br />
            🌧️ {day.precipitation} mm precipitation
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherForecast;
