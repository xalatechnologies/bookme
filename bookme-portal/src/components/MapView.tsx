"use client";

// External imports
import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';

// Internal imports
import { coreFacilities } from '@/data/coreFacilities';
import { FacilityFilters } from '@/types/facility';

// Sibling imports
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ViewHeader } from './search/ViewHeader';
import { MapContainer } from './map/MapContainer';
import { MapMarkers } from './map/MapMarkers';

interface MapViewProps {
  readonly facilityType: string;
  readonly location: string;
  readonly viewMode: "grid" | "map" | "calendar" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

// Mapbox public token provided by user
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA';

export const MapView: React.FC<MapViewProps> = ({ facilityType, location, viewMode, setViewMode }): JSX.Element => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Create filters from props
  const filters: FacilityFilters = {
    facilityType: facilityType !== "all" ? facilityType : undefined,
    location: location !== "all" ? location : undefined,
  };

  // Filter facilities based on current filters
  let filteredFacilities = coreFacilities;
  if (filters.facilityType) {
    filteredFacilities = filteredFacilities.filter(f => f.type === filters.facilityType);
  }
  if (filters.location) {
    filteredFacilities = filteredFacilities.filter(f => f.area === filters.location);
  }

  const handleMapLoad = (mapInstance: mapboxgl.Map): void => {
    setMap(mapInstance);
    setIsInitialized(true);
  };

  const handleMapError = (errorMessage: string): void => {
    setError(errorMessage);
    setIsInitialized(false);
  };

  const handleRetry = (): void => {
    setError('');
    setIsInitialized(false);
    window.location.reload();
  };

  const handleMarkerClick = (facility: any): void => {
    console.log('Marker clicked:', facility);
    // Could navigate to facility detail page or show more info
  };

  // Show loading or error overlay inside the card instead of replacing entire component

  return (
    <div className="max-w-7xl mx-auto px-4 my-[12px]">
      <ViewHeader 
        facilityCount={filteredFacilities.length}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredFacilities.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ingen fasiliteter funnet</h3>
            <p className="text-gray-600">Prøv å justere søkekriteriene dine</p>
          </div>
        </Card>
      ) : (
        <Card className="h-[600px] relative overflow-hidden">
          {/* Show loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Laster kart...</h3>
                <p className="text-gray-600">Setter opp kartet og henter fasiliteter</p>
              </div>
            </div>
          )}

          {/* Show error overlay */}
          {error && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Kunne ikke laste kart</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    Prøv igjen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={(): void => setViewMode('grid')}
                    className="w-full"
                  >
                    Gå til rutenettvisning
                  </Button>
                </div>
              </div>
            </div>
          )}

          <MapContainer
            onMapLoad={handleMapLoad}
            onMapError={handleMapError}
            onLoadingChange={setIsLoading}
            mapboxToken={DEFAULT_MAPBOX_TOKEN}
          />
          {isInitialized && (
            <MapMarkers
              map={map}
              facilities={filteredFacilities}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </Card>
      )}
    </div>
  );
};

