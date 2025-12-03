export async function geocodeAddress(address: string) {
  if (!address?.trim()) return null;
  
  // Get the Mapbox token from environment variables
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    console.error('Mapbox token not found in environment variables');
    return null;
  }
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1&country=NO`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data?.features?.[0];
    if (!f?.center) return null;
    const [lng, lat] = f.center;
    return { lat, lng, place: f.place_name as string };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}