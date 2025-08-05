// src/api/openMeteo.js
import axios from 'axios';

export const getForecastOpenMeteo = async (lat, lon) => {
  const url = `https://api.open-meteo.com/v1/forecast`;
  try {
    const response = await axios.get(url, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'auto',
      },
    });

    const daily = response.data.daily;
    const forecast = daily.time.map((date, index) => ({
      date,
      tempMax: daily.temperature_2m_max[index],
      tempMin: daily.temperature_2m_min[index],
      precipitation: daily.precipitation_sum[index],
    })).slice(0, 3);

    return forecast;

  } catch (error) {
    console.error('Failed to fetch weather forecast:', error);
    return [];
  }
};
