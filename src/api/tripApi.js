import polyline from "@mapbox/polyline";
export async function getRoute(startCoords, endCoords, type = "cycling-regular") {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM4NGM5ZTcxZjUxNjRlYjNhNjE2MmVjODA1YzhlNjRmIiwiaCI6Im11cm11cjY0In0=";
  const url = `https://api.openrouteservice.org/v2/directions/${type}`;

  const body = {
    coordinates: [startCoords, endCoords],
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
