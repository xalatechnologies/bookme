"use client";

// External imports
import React, { useMemo, useState } from 'react';
import type { Database } from '@/types/database';

// Internal imports
import { usePublishedFacilitiesWithLocationText, useFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useMapOverlay } from '@/hooks/features/facilities';
import { FacilityFilters } from '@/types/facility';

type Facility = Database['public']['Tables']['facilities']['Row'];

// Sibling imports
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ViewHeader } from '@/components/features/search/components/ViewHeader';
import { MapContainer } from '../FacilityMap/MapContainer';
import { MapMarkers } from '../FacilityMap/MapMarkers';

interface MapViewProps {
  readonly facilityType: string;
  readonly location: string;
  readonly viewMode: "grid" | "map" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
  readonly showAllFacilities?: boolean; // New prop to show all facilities in admin
  readonly showHeader?: boolean; // New prop to control header visibility
  readonly onMarkerClick?: (facility: Facility) => void; // New prop for handling marker clicks
}

// Mapbox public token provided by user
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA';

export const MapView: React.FC<MapViewProps> = ({
  facilityType,
  location,
  viewMode,
  setViewMode,
  showAllFacilities = false, // Default to false for backward compatibility
  showHeader = true, // Default to true for backward compatibility
  onMarkerClick // New prop for handling marker clicks
}): JSX.Element => {
  // Use map overlay hook
  const {
    map,
    error,
    isInitialized,
    handleMapLoad,
    handleMapError,
    handleRetry,
    handleMarkerClick: handleMarkerClickInternal
  } = useMapOverlay();

  const orgId = useOrganizationId();
  // Use facilities with location text for map display
  const { data: publishedFacilities = [], isLoading: loadingPublished } = usePublishedFacilitiesWithLocationText(orgId);
  const { data: allFacilities = [], isLoading: loadingAll } = useFacilities(orgId, showAllFacilities);

  const facilities = showAllFacilities ? allFacilities : publishedFacilities;
  const isLoading = showAllFacilities ? loadingAll : loadingPublished;

  // Loading state for the map container
  const [mapLoading, setMapLoading] = useState<boolean>(false);

  // Create filters from props
  const filters: FacilityFilters = {
    facilityType: facilityType !== "all" ? facilityType : undefined,
    location: location !== "all" ? location : undefined,
  };

  // Filter facilities based on current filters
  const filteredFacilities = useMemo(() => {
    let filtered = [...facilities];
    if (filters.facilityType) {
      filtered = filtered.filter(f => f.facility_type === filters.facilityType);
    }
    if (filters.location) {
      // Filter by address since there's no area field in the database
      filtered = filtered.filter(f => 
        f.address && f.address.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    return filtered;
  }, [facilities, filters.facilityType, filters.location]);

  return (
    <div className="max-w-7xl mx-auto px-4 my-[12px]">
      {showHeader && (
        <ViewHeader 
          facilityCount={filteredFacilities.length}
          isLoading={isLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {filteredFacilities.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ingen fasiliteter funnet</h3>
            <p className="text-gray-600">Prøv å justere søkekriteriene dine</p>
          </div>
        </Card>
      ) : (
        <Card className={`h-[600px] relative overflow-hidden ${!showHeader ? 'mt-4' : ''}`}>
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
            onLoadingChange={setMapLoading}
            mapboxToken={DEFAULT_MAPBOX_TOKEN}
          />
          {isInitialized && map && (
            <MapMarkers
              map={map}
              facilities={filteredFacilities}
              onMarkerClick={(facility) => handleMarkerClickInternal(facility, onMarkerClick)}
            />
          )}

        </Card>
      )}
    </div>
  );
};