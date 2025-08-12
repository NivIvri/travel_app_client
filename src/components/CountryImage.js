import React, { useEffect, useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import '../style/CountryImage.css';

function CountryImage() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentRoute } = useRouteStore();

  useEffect(() => {
    if (currentRoute.destination) {
      fetchCountryImage(currentRoute.destination);
    }
  }, [currentRoute.destination]);

  const fetchCountryImage = async (destination) => {
    setLoading(true);
    try {
      // Use Unsplash API to get a representative image of the country/city
      const searchTerm = destination.split(',')[0].trim(); // Get the main location name
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': 'ZOXamX5iKYBY4ngNQ5GbdmRK6GymMjsUXrjF5ETSVF4' // You'll need to get a free API key from Unsplash
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setImageUrl(data.results[0].urls.regular);
        } else {
          // Fallback to a placeholder image
          setImageUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop');
        }
      } else {
        // Fallback to a placeholder image
        setImageUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop');
      }
    } catch (error) {
      console.error('Error fetching country image:', error);
      // Fallback to a placeholder image
      setImageUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="country-image">
        <div className="image-placeholder">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="country-image">
      <h3>Destination Image</h3>
      <img 
        src={imageUrl} 
        alt={`${currentRoute.destination} landscape`}
        className="destination-image"
      />
      <p className="image-caption">{currentRoute.destination}</p>
    </div>
  );
}

export default CountryImage; 