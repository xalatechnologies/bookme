"use client";

// External imports
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  readonly onMapLoad: (map: mapboxgl.Map) => void;
  readonly onMapError: (error: string) => void;
  readonly onLoadingChange: (loading: boolean) => void;
  readonly mapboxToken: string;
}

interface MapContainerReturn {
  readonly mapContainer: React.RefObject<HTMLDivElement>;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  onMapLoad,
  onMapError,
  onLoadingChange,
  mapboxToken
}): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
      
      // Validate the access token format
      if (!mapboxToken || mapboxToken.length < 10) {
        throw new Error('Invalid Mapbox access token. Please check your token.');
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

      // Handle map errors with more specific error messages
      map.current.on('error', (e): void => {
        let errorMessage = 'An error occurred while loading the map.';
        
        if (e.error?.message?.includes('401')) {
          errorMessage = 'Invalid Mapbox access token. Please check your token.';
        } else if (e.error?.message?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (e.error?.message) {
          errorMessage = e.error.message;
        }
        
        onMapError(errorMessage);
        onLoadingChange(false);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while initializing map.';
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