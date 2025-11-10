import { useEffect, useMemo, useRef, useState } from 'react';
import { mapboxgl } from '@/lib/clients/mapbox';
import { geocodeAddress } from '@/lib/geocode';

// Remove duplicate imports
// import { useEffect, useRef } from 'react';
// import mapboxgl from 'mapbox-gl';

// Remove the hardcoded token line
// mapboxgl.accessToken = import.meta.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA';

type Props = {
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  height?: number;
  width?: number;
};

const FacilityMiniMap = ({ address, lat, lng, height = 310, width = 310 }: Props) => {
  const containerId = useMemo(
    () => `mini-map-${(address ?? `${lat}-${lng}` ?? Math.random()).replace(/\s+/g, '-')}`,
    [address, lat, lng]
  );
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat: lat!, lng: lng! } : null
  );

  useEffect(() => {
    let dead = false;
    if (!coords && address) {
      geocodeAddress(address).then(r => {
        if (!dead && r) setCoords({ lat: r.lat, lng: r.lng });
      });
    }
    return () => { dead = true; };
  }, [address, coords]);

  useEffect(() => {
    if (!coords) return;
    if (mapRef.current) mapRef.current.remove();

    const map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coords.lng, coords.lat],
      zoom: 14,
      interactive: false
    });
    
    // Create a larger black marker using SVG (increased from default size)
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="black"/>
        <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="white"/>
      </svg>
    `;
    
    new mapboxgl.Marker(markerElement)
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);
      
    mapRef.current = map;

    return () => map.remove();
  }, [containerId, coords]);

  return (
    <div
      id={containerId}
      style={{ width, height }}
      className="rounded-md overflow-hidden border"
    />
  );
};

// Export both default and named for compatibility
export default FacilityMiniMap;
export { FacilityMiniMap };