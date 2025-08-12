import React, { useEffect, useState } from 'react';
import { getForecastOpenMeteo } from '../api/openMeteo';
import { useRouteStore } from '../store/routeStore';
import '../style/WeatherForecast.css'; 

function WeatherForecast() {
  const [forecast, setForecast] = useState([]);
  const { currentRoute } = useRouteStore();
  
  useEffect(() => {
    console.log('WeatherForecast - currentRoute:', currentRoute);
    console.log('WeatherForecast - currentRoute.path:', currentRoute.path);
    console.log('WeatherForecast - currentRoute.path[0]:', currentRoute.path?.[0]);
    
    if (currentRoute.path && currentRoute.path[0] && currentRoute.path[0][0] && currentRoute.path[0][1]) {
      const [lon, lat] = currentRoute.path[0]; // First point coordinates
      console.log('WeatherForecast - Fetching weather for coordinates:', [lat, lon]);
      getForecastOpenMeteo(lat, lon).then(setForecast).catch(error => {
        console.error('WeatherForecast - Error fetching weather:', error);
      });
    } else {
      console.log('WeatherForecast - No valid path coordinates found');
      console.log('WeatherForecast - Path length:', currentRoute.path?.length);
      console.log('WeatherForecast - First coordinate:', currentRoute.path?.[0]);
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
