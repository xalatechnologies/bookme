"use client";

// External imports
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Internal imports
import type { Facility } from '@/data/coreFacilities';

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

export const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  facilities,
  onMarkerClick
}): JSX.Element => {
  const markersRef = useRef<readonly mapboxgl.Marker[]>([]);

  const createMarkerElement = (facility: Facility): HTMLDivElement => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = `
      <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors">
        <span class="text-xs font-bold">${facility.capacity}</span>
      </div>
    `;
    
    // Add click handler
    markerElement.addEventListener('click', (): void => {
      if (onMarkerClick) {
        onMarkerClick(facility);
      }
    });

    return markerElement;
  };

  const createPopupContent = (facility: Facility): string => {
    return `
      <div class="p-3 min-w-[200px]">
        <h3 class="font-bold text-lg mb-2">${facility.name}</h3>
        <p class="text-gray-600 mb-2">${facility.address}</p>
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-500">Kapasitet: ${facility.capacity}</span>
          <span class="font-semibold text-blue-600">${facility.pricePerHour} kr/t</span>
        </div>
        <div class="mt-2">
          <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${facility.type}</span>
        </div>
      </div>
    `;
  };

  const addMarkersToMap = (): void => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker): void => {
      marker.remove();
    });

    // Create new markers
    const newMarkers = facilities.map((facility): mapboxgl.Marker => {
      const markerElement = createMarkerElement(facility);
      const popupContent = createPopupContent(facility);
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([facility.coordinates.lng, facility.coordinates.lat])
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
