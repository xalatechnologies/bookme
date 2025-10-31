"use client";

// External imports
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Internal imports
import type { Database } from '@/types/database';

// Type from Supabase
type Facility = Database['public']['Tables']['facilities']['Row'];

// Type for location coordinates
interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface FacilityLocation {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly lat: number;
  readonly lng: number;
  readonly type: string;
  readonly capacity: number;
  readonly pricePerHour: number;
}

interface MapMarkersProps {
  readonly map: mapboxgl.Map | null;
  readonly facilities: readonly Facility[];
  readonly onMarkerClick?: (facility: Facility) => void;
}

interface MapMarkersReturn {
  readonly markers: readonly mapboxgl.Marker[];
}

// Type guard to check if location has coordinates
const hasCoordinates = (location: unknown): location is LocationCoordinates => {
  return (
    location !== null &&
    typeof location === 'object' &&
    'lat' in location &&
    'lng' in location &&
    typeof (location as LocationCoordinates).lat === 'number' &&
    typeof (location as LocationCoordinates).lng === 'number'
  );
};

export const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  facilities,
  onMarkerClick
}): JSX.Element => {
  const markersRef = useRef<readonly mapboxgl.Marker[]>([]);

  const createMarkerElement = (facility: Facility): HTMLDivElement => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    // Create a location icon marker with black color, no white border, matching exactly the style used in list view (Mapbox pin)
    markerElement.innerHTML = `
      <div class="text-gray-800 cursor-pointer hover:text-black transition-colors" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#000000">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2" fill="white"/>
        </svg>
      </div>
    `;
    
    // Add click handler - only open popup, don't navigate directly
    markerElement.addEventListener('click', (e): void => {
      // Prevent default to avoid immediate navigation
      e.preventDefault();
      // Let Mapbox handle the popup opening automatically
      if (onMarkerClick) {
        onMarkerClick(facility);
      }
    });

    return markerElement;
  };

  const createPopupContent = (facility: Facility): string => {
    // Get the first image or use a placeholder
    const images = facility.images as string[] | null;
    const imageUrl = images && images.length > 0 
      ? images[0] 
      : '/placeholder.svg';
      
    // Simplified popup content with only name and image, entire popup is clickable
    return `
      <div style="min-width: 200px; padding: 12px;" onclick="window.location.href='/facilities/${facility.id}'" style="cursor: pointer;">
        <div style="margin-bottom: 8px;">
          <img src="${imageUrl}" alt="${facility.name}" style="width: 100%; height: 128px; object-fit: cover; border-radius: 4px;" onerror="this.src='/placeholder.svg'">
        </div>
        <h3 style="font-weight: bold; font-size: 16px; margin: 0;">${facility.name}</h3>
      </div>
    `;
  };

  const addMarkersToMap = (): void => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker): void => {
      marker.remove();
    });

    // Filter facilities to only include those with valid coordinates
    const facilitiesWithCoordinates = facilities.filter(facility => 
      hasCoordinates(facility.location)
    );

    // Create new markers
    const newMarkers = facilitiesWithCoordinates.map((facility): mapboxgl.Marker => {
      const markerElement = createMarkerElement(facility);
      const popupContent = createPopupContent(facility);
      
      // Extract coordinates safely
      const location = facility.location as LocationCoordinates;
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map);

      return marker;
    });

    markersRef.current = newMarkers;
  };

  useEffect((): void => {
    addMarkersToMap();
  }, [map, facilities]);

  // Cleanup markers when component unmounts
  useEffect((): (() => void) => {
    return (): void => {
      markersRef.current.forEach((marker): void => {
        marker.remove();
      });
    };
  }, []);

  return <></>; // This component doesn't render anything directly
};