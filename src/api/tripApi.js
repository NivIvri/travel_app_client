import polyline from "@mapbox/polyline";
import { getAuthHeaders, getStoredToken } from "./authApi";
const MAX_POINTS = 200; 
const API_BASE = "http://localhost:5000/api";

// Function to optimize route for storage by reducing coordinate points
function optimizeRouteForStorage(coordinates, maxPoints = 50) {
  if (coordinates.length <= maxPoints) {
    return coordinates;
  }
  
  // Simple sampling: take every nth point
  const step = Math.floor(coordinates.length / maxPoints);
  const optimized = [];
  
  for (let i = 0; i < coordinates.length; i += step) {
    optimized.push(coordinates[i]);
  }
  
  // Always include the last point
  if (optimized[optimized.length - 1] !== coordinates[coordinates.length - 1]) {
    optimized.push(coordinates[coordinates.length - 1]);
  }
  
  return optimized;
}


export async function getRoute(
  startCoords,
  endCoords,
  type = "cycling-regular",
  options = {}
) {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM4NGM5ZTcxZjUxNjRlYjNhNjE2MmVjODA1YzhlNjRmIiwiaCI6Im11cm11cjY0In0=";

  // Validate routing profile
  const validTypes = ["cycling-regular", "foot-hiking", "driving-car", "driving-hgv"];
  if (!validTypes.includes(type)) {
    console.warn(`Invalid routing type: ${type}. Falling back to "cycling-regular".`);
    type = "cycling-regular";
  }

  const url = `https://api.openrouteservice.org/v2/directions/${type}`;

  // If round_trip is requested, ORS expects ONLY the start coordinate.
  const coords = options?.round_trip ? [startCoords] : [startCoords, endCoords];

  const body = {
    coordinates: coords,
    // DO NOT send radiuses here; not needed and can cause 4xx/instability.
    options
  };

  // Simple retry for 429/5xx
  const doFetch = async (attempt = 1) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // retry on rate-limit or server errors
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await new Promise(r => setTimeout(r, 400 * attempt));
        return doFetch(attempt + 1);
      }
      const err = await res.json().catch(() => ({}));
      console.error("ORS error:", err);
      console.error("Request details:", { url, type, body });
      throw new Error("OpenRouteService request failed: " + (err.error?.message || err.message || "Unknown error"));
    }
    return res.json();
  };

  const data = await doFetch();

  // geometry may be an encoded polyline string (routes[0].geometry)
  // or GeoJSON (features[0].geometry.coordinates). Support both.
  const encoded = data?.routes?.[0]?.geometry;
  let coordinates;

  if (typeof encoded === "string") {
    const decoded = polyline.decode(encoded);         // [[lat, lon], ...]
    coordinates = decoded.map(([lat, lon]) => [lon, lat]); // → [[lon, lat], ...]
  } else {
    const gj = data?.features?.[0]?.geometry?.coordinates;
    if (!gj || !Array.isArray(gj)) {
      throw new Error("No geometry found in ORS response");
    }
    coordinates = gj; // already [[lon, lat], ...]
  }

  // Optional: downsample for storage if you have this helper in your codebase
  if (typeof optimizeRouteForStorage === "function") {
    const optimized = optimizeRouteForStorage(coordinates, 50);
    console.log(`Route optimized: ${coordinates.length} → ${optimized.length} points`);
    return optimized;
  }

  return coordinates;
}


export async function getCoordinatesORS(cityName) {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM4NGM5ZTcxZjUxNjRlYjNhNjE2MmVjODA1YzhlNjRmIiwiaCI6Im11cm11cjY0In0=";
  const url = `https://api.openrouteservice.org/geocode/search`;

  const response = await fetch(`${url}?api_key=${apiKey}&text=${encodeURIComponent(cityName)}`);
  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Location not found");
  }

  const [lon, lat] = data.features[0].geometry.coordinates;
  return [lon, lat];
}





// Keep at most N points (greedy)
function thin(coords, maxN = MAX_POINTS) {
  if (!coords || coords.length <= maxN) return coords;
  const step = Math.ceil(coords.length / maxN);
  const out = [];
  for (let i = 0; i < coords.length; i += step) out.push(coords[i]);
  if (out[out.length - 1] !== coords[coords.length - 1]) out.push(coords[coords.length - 1]);
  return out;
}

// Encode [[lon,lat],...] -> polyline string
function encodeLonLat(coords) {
  const thinned = thin(coords);
  return polyline.encode(thinned.map(([lon, lat]) => [lat, lon]));
}

export async function saveRouteToServer(routeData) {
  // Optimize route data before saving to server
  const optimizedRouteData = {
    ...routeData,
    path: optimizeRouteForStorage(routeData.path, 50),
    pathDays: routeData.pathDays ? routeData.pathDays.map(day => optimizeRouteForStorage(day, 50)) : []
  };
  
  console.log(`Route data optimized for storage: ${JSON.stringify(optimizedRouteData).length} characters`);
  
  // Encode coordinates as polyline strings for storage
  const encodeLonLat = (coords) => {
    if (!coords || !Array.isArray(coords)) return "";
    return polyline.encode(coords.map(([lon, lat]) => [lat, lon]));
  };

  const thin = (coords, max) => {
    if (!coords || coords.length <= max) return coords;
    const step = Math.floor(coords.length / max);
    const thinned = [];
    for (let i = 0; i < coords.length; i += step) thinned.push(coords[i]);
    if (thinned[thinned.length - 1] !== coords[coords.length - 1]) {
      thinned.push(coords[coords.length - 1]);
    }
    return thinned;
  };

  const pathEncoded = encodeLonLat(thin(optimizedRouteData.path, 200));
  const pathDaysEncoded = (optimizedRouteData.pathDays || []).map(d => encodeLonLat(thin(d, 200)));

  const payload = {
    name: routeData.name,
    description: routeData.description,
    destination: routeData.destination,
    type: routeData.type,
    pathEncoded,
    pathDaysEncoded,
    savedAt: new Date().toISOString(), // Add timestamp
    // Optional metadata – distance per day, etc.
  };

  const json = JSON.stringify(payload);
  console.log(`Route payload size: ${json.length} chars`);

  // Use authentication headers
  const headers = getAuthHeaders();

  // Simple retry for 429/5xx; handle 413 by thinning harder
  const postOnce = async (body) => {
    const res = await fetch(`${API_BASE}/routes`, { method: "POST", headers, body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.message || `${res.status} ${res.statusText}`;
      const err = new Error(msg); err.status = res.status; err.data = data; throw err;
    }
    return data;
  };

  try {
    return await postOnce(json);
  } catch (e) {
    if (e.status === 413) {
      console.warn("413 Payload Too Large – thinning more and retrying…");
      // Thin more aggressively and retry once
      const pathEncoded2 = encodeLonLat(thin(routeData.path, 100));
      const pathDaysEncoded2 = (routeData.pathDays || []).map(d => encodeLonLat(thin(d, 100)));
      const body2 = JSON.stringify({ ...payload, pathEncoded: pathEncoded2, pathDaysEncoded: pathDaysEncoded2 });
      return await postOnce(body2);
    }
    if (e.status === 429 || e.status >= 500) {
      console.warn(`${e.status} – retrying once…`);
      await new Promise(r => setTimeout(r, 600));
      return await postOnce(json);
    }
    throw e;
  }
}

// Server-side route operations
export async function saveRouteToServer1(routeData) {
  // Optimize route data before saving to server
  const optimizedRouteData = {
    ...routeData,
    path: optimizeRouteForStorage(routeData.path, 50),
    pathDays: routeData.pathDays ? routeData.pathDays.map(day => optimizeRouteForStorage(day, 50)) : []
  };
  
  console.log(`Route data optimized for storage: ${JSON.stringify(optimizedRouteData).length} characters`);
  
  const response = await fetch(`${API_BASE}/routes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(optimizedRouteData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

export async function getUserRoutes(username) {
  const response = await fetch(`${API_BASE}/routes?username=${encodeURIComponent(username)}`, {
    headers: getAuthHeaders()
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  console.log('Raw server response:', data);
  console.log('Number of routes returned:', Array.isArray(data) ? data.length : 'Not an array');
  
  // Handle different response formats
  let routesArray = data;
  if (data.routes && Array.isArray(data.routes)) {
    routesArray = data.routes;
    console.log('Found routes in data.routes property');
  } else if (data.route && Array.isArray(data.route)) {
    routesArray = data.route;
    console.log('Found routes in data.route property');
  } else if (!Array.isArray(data)) {
    console.error('Unexpected server response format:', data);
    return [];
  }
  
  // Decode polyline strings back to coordinate arrays
  const decodedRoutes = routesArray.map(route => {
    const decodedRoute = { ...route };
    
    console.log('Decoding route:', route.name, 'pathEncoded:', route.pathEncoded ? 'exists' : 'missing');
    
    // Decode path if it's encoded
    if (route.pathEncoded) {
      try {
        const decoded = polyline.decode(route.pathEncoded);
        decodedRoute.path = decoded.map(([lat, lon]) => [lon, lat]);
        console.log('Successfully decoded path with', decodedRoute.path.length, 'points');
      } catch (error) {
        console.error('Error decoding path:', error);
        decodedRoute.path = [];
      }
    }
    
    // Decode pathDays if they're encoded
    if (route.pathDaysEncoded && Array.isArray(route.pathDaysEncoded)) {
      try {
        decodedRoute.pathDays = route.pathDaysEncoded.map(encodedDay => {
          const decoded = polyline.decode(encodedDay);
          return decoded.map(([lat, lon]) => [lon, lat]);
        });
        console.log('Successfully decoded pathDays with', decodedRoute.pathDays.length, 'days');
      } catch (error) {
        console.error('Error decoding pathDays:', error);
        decodedRoute.pathDays = [];
      }
    }
    
    return decodedRoute;
  });
  
  console.log('Final decoded routes:', decodedRoutes.length);
  return decodedRoutes;
}

export async function deleteRouteFromServer(routeId, username) {
  const response = await fetch(`${API_BASE}/routes/${routeId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}
