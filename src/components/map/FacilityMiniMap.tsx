"use client";

// External imports
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

// Internal imports
import type { IFacility } from '@/stores/facilityStore';

interface FacilityMiniMapProps {
  readonly facility: IFacility;
  readonly mapboxToken: string;
}

export const FacilityMiniMap: React.FC<FacilityMiniMapProps> = ({
  facility,
  mapboxToken
}): JSX.Element => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Generate static map URL using Mapbox Static Images API
  // Use a larger size to ensure good quality at different heights
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+2563eb(${facility.coordinates.lng},${facility.coordinates.lat})/${facility.coordinates.lng},${facility.coordinates.lat},14,0/400x400@2x?access_token=${mapboxToken}`;

  const handleImageLoad = (): void => {
    setImageLoaded(true);
  };

  const handleImageError = (): void => {
    setImageError(true);
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600 font-medium">{facility.name}</p>
          <p className="text-xs text-gray-500 truncate px-2">{facility.address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Laster kart...</p>
          </div>
        </div>
      )}

      {/* Static map image */}
      <img
        src={staticMapUrl}
        alt={`Kart for ${facility.name}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />

      {/* Overlay to show facility name on hover */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="font-medium truncate">{facility.name}</p>
        <p className="text-gray-300 truncate">{facility.address}</p>
      </div>
    </div>
  );
};
