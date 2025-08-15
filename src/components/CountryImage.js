import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouteStore } from '../store/routeStore';
import '../style/CountryImage.css';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&auto=format';

function CountryImage() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { currentRoute } = useRouteStore();
  const abortRef = useRef(null);

  // Prefer the first part before a comma (e.g., "Tbilisi, Georgia" -> "Tbilisi")
  const searchTerm = useMemo(() => {
    const d = (currentRoute?.destination || '').trim();
    if (!d) return '';
    return d.split(',')[0].trim();
  }, [currentRoute?.destination]);

  useEffect(() => {
    if (!searchTerm) {
      setImageUrl(FALLBACK_IMG);
      setLoading(false);
      return;
    }

    // Cancel previous request if destination changes fast
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchImage = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        // ✅ Option A (simplest): put client_id in the URL
        const accessKey = 'Mssv5tehcdJe8a83NZyTSADTEBAt389atlq3YBRABoA'
        if (!accessKey) {
          throw new Error('Missing Unsplash access key (VITE_UNSPLASH_ACCESS_KEY / REACT_APP_UNSPLASH_ACCESS_KEY)');
        }

        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchTerm
        )}&per_page=1&orientation=landscape&client_id=${accessKey}`;

        // ✅ Option B (equivalent): use header instead of client_id param
        // const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`;
        // const headers = { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' };

        const res = await fetch(url, {
          // headers,
          signal: controller.signal
        });

        if (!res.ok) {
          // 401 usually means invalid access key / wrong Authorization format
          if (res.status === 401) {
            throw new Error('Unsplash 401: Invalid access key or Authorization format');
          }
          throw new Error(`Unsplash error: ${res.status}`);
        }

        const data = await res.json();
        if (data?.results?.length) {
          setImageUrl(data.results[0].urls?.regular || FALLBACK_IMG);
        } else {
          setImageUrl(FALLBACK_IMG);
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // request was cancelled
        console.error('Error fetching Unsplash image:', err);
        setErrorMsg('Could not load image (using fallback).');
        setImageUrl(FALLBACK_IMG);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => controller.abort();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="country-image">
        <div className="image-placeholder">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="country-image">
      <div className="country-image-title">Destination Image</div>
      {errorMsg && <small style={{ opacity: 0.7 }}>{errorMsg}</small>}
      <img
        src={imageUrl}
        alt={`${currentRoute?.destination || 'Destination'} landscape`}
        className="destination-image"
        loading="lazy"
      />
      <p className="image-caption">{currentRoute?.destination}</p>
    </div>
  );
}

export default CountryImage;
