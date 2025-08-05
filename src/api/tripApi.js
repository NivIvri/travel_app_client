import polyline from "@mapbox/polyline";

const API_BASE = "http://localhost:5000/api";

export async function getRoute(startCoords, endCoords, type = "cycling-regular") {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM4NGM5ZTcxZjUxNjRlYjNhNjE2MmVjODA1YzhlNjRmIiwiaCI6Im11cm11cjY0In0=";
  const url = `https://api.openrouteservice.org/v2/directions/${type}`;

  const body = {
    coordinates: [startCoords, endCoords],
      radiuses: [1000, 1000] // allow more flexible match to road network
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("ORS error:", errorData);
    throw new Error("OpenRouteService request failed: " + errorData.error?.message);
  }

  const data = await response.json();
  const decoded = polyline.decode(data.routes[0].geometry);
  const coordinates = decoded.map(([lat, lon]) => [lon, lat]);
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

// Server-side route operations
export async function saveRouteToServer(routeData) {
  const response = await fetch(`${API_BASE}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(routeData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

export async function getUserRoutes(username) {
  const response = await fetch(`${API_BASE}/routes?username=${encodeURIComponent(username)}`);
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

export async function deleteRouteFromServer(routeId, username) {
  const response = await fetch(`${API_BASE}/routes/${routeId}?username=${encodeURIComponent(username)}`, {
    method: "DELETE",
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}
