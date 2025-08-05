import React, { useEffect, useState } from 'react';
import { getForecastOpenMeteo } from '../api/openMeteo';
import '../style/WeatherForecast.css'; 
function WeatherForecast({ lat, lon }) {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (lat && lon) {
      getForecastOpenMeteo(lat, lon).then(setForecast);
    }
  }, [lat, lon]);

  if (!forecast.length) return <p>Loading weather forecast...</p>;

  return (
    <div className="weather-forecast">
      <div >3-Day Forecast</div>
      <div>
        {forecast.map((day, index) => (
          <div>
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
