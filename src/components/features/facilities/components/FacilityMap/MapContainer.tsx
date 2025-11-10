"use client";

// External imports
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapErrorHandling } from '@/hooks/features/facilities';

interface MapContainerProps {
  readonly onMapLoad: (map: mapboxgl.Map) => void;
  readonly onMapError: (error: string) => void;
  readonly onLoadingChange: (loading: boolean) => void;
  readonly mapboxToken: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  onMapLoad,
  onMapError,
  onLoadingChange,
  mapboxToken
}): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Use map error handling hook
  const { parseMapError, validateToken } = useMapErrorHandling();

  const initializeMap = async (): Promise<void> => {
    
    // Wait for next tick to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!mapContainer.current) {
      onMapError('Map container not ready. Please try again.');
      onLoadingChange(false);
      return;
    }

    onLoadingChange(true);
    onMapError('');

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;

      // Validate the access token format using hook (with error handling)
      try {
        validateToken(mapboxToken);
      } catch (validationError) {
        console.warn('Token validation failed:', validationError);
        // Continue anyway as the map might still work
      }

      // Clear any existing map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      // Create new map with error handling
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [10.2045, 59.7464], // Center on Drammen
        zoom: 12,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle successful map load
      map.current.on('load', (): void => {
        if (map.current) {
          onMapLoad(map.current);
        }
        onLoadingChange(false);
      });

      // Handle map errors using hook
      map.current.on('error', (e): void => {
        const errorMessage = parseMapError(e);
        console.error('Mapbox error:', e);
        onMapError(errorMessage);
        onLoadingChange(false);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while initializing map.';
      console.error('Map initialization error:', error);
      onMapError(errorMessage);
      onLoadingChange(false);
    }
  };

  useEffect((): (() => void) => {
    initializeMap();

    // Cleanup function
    return (): void => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Only run once on mount

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg overflow-hidden" 
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};