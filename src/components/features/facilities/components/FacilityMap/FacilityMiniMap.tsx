import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { geocodeAddress } from '@/lib/geocode';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.MAPBOX_TOKEN || 'pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA';

type Props = {
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  height?: number;
  width?: number;
};

const FacilityMiniMap = ({ address, lat, lng, height = 160, width = 200 }: Props) => {
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
    new mapboxgl.Marker().setLngLat([coords.lng, coords.lat]).addTo(map);
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