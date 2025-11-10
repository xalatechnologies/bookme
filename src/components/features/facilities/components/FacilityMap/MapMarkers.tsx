"use client";

// External imports
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Internal imports
import type { FacilityWithCoords } from '@/types/facility';
import { geocodeAddress } from '@/lib/geocode';
import { facilitiesService } from '@/services/supabase/facilities.service';

interface MapMarkersProps {
  readonly map: mapboxgl.Map | null;
  readonly facilities: readonly FacilityWithCoords[];
  readonly onMarkerClick?: (facility: FacilityWithCoords) => void;
}

// Function to normalize facility with geocoding fallback
async function normalizeFacility(facility: FacilityWithCoords): Promise<FacilityWithCoords> {
  // If we already have valid coordinates, return as is
  if (Number.isFinite(facility.lat) && Number.isFinite(facility.lng)) {
    return facility;
  }
  
  // If we have an address, try to geocode it
  if (facility.address) {
    const result = await geocodeAddress(facility.address);
    if (result) {
      // Save the coordinates to the database for better performance next time
      try {
        await facilitiesService.saveCoords(facility.id, result.lat, result.lng);
      } catch (error) {
        console.warn('Failed to save coordinates to database:', error);
      }
      
      return { 
        ...facility, 
        lat: result.lat, 
        lng: result.lng 
      };
    }
  }
  
  // Return facility as is if we can't geocode
  return facility;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  facilities,
  onMarkerClick
}): JSX.Element => {
  const markersRef = useRef<readonly mapboxgl.Marker[]>([]);

  const createMarkerElement = (facility: FacilityWithCoords): HTMLDivElement => {
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

  const createPopupContent = (facility: FacilityWithCoords): string => {
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

  const addMarkersToMap = async (): Promise<void> => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker): void => {
      marker.remove();
    });

    // Normalize all facilities with geocoding fallback
    const enrichedFacilities = await Promise.all(
      facilities.map(normalizeFacility)
    );

    // Filter facilities to only include those with valid coordinates
    // Using numeric checks instead of truthy checks
    const facilitiesWithCoordinates = enrichedFacilities.filter(facility => {
      return Number.isFinite(facility.lat) && Number.isFinite(facility.lng);
    });

    // Create new markers
    const newMarkers = facilitiesWithCoordinates.map((facility): mapboxgl.Marker => {
      // This should not happen due to the filter above, but just in case
      if (!Number.isFinite(facility.lat) || !Number.isFinite(facility.lng)) {
        throw new Error(`Failed to extract valid coordinates for facility ${facility.id}`);
      }
      
      const markerElement = createMarkerElement(facility);
      const popupContent = createPopupContent(facility);
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat([facility.lng!, facility.lat!]) // We know these are valid numbers due to the filter
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