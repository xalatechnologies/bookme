"use client";

// External imports
import React, { useMemo } from 'react';
import type { FacilityWithCoords, FacilityFilters } from '@/types/facility';

// Internal imports
import { usePublishedFacilitiesWithCoords, useFacilitiesWithCoords } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useMapOverlay } from '@/hooks/features/facilities';
import { MAPBOX_TOKEN } from '@/lib/clients/mapbox';

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
  readonly onMarkerClick?: (facility: FacilityWithCoords) => void; // New prop for handling marker clicks
  readonly filters?: FacilityFilters; // Optional filters object for advanced filtering
}

export const MapView: React.FC<MapViewProps> = ({
  facilityType,
  location,
  viewMode,
  setViewMode,
  showAllFacilities = false, // Default to false for backward compatibility
  showHeader = true, // Default to true for backward compatibility
  onMarkerClick, // New prop for handling marker clicks
  filters // Accept filters prop
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
  // Use facilities with coordinates for map display
  const { data: publishedFacilities = [], isLoading: loadingPublished } = usePublishedFacilitiesWithCoords(orgId);
  const { data: allFacilities = [], isLoading: loadingAll } = useFacilitiesWithCoords(orgId, showAllFacilities);

  const facilities = showAllFacilities ? allFacilities : publishedFacilities;
  const isLoading = showAllFacilities ? loadingAll : loadingPublished;

  // Filter facilities based on current filters
  const filteredFacilities = useMemo(() => {
    let filtered = [...facilities];
    
    // ALWAYS use filters prop if provided, regardless of whether it's empty
    // This ensures we respect when NO filters are active (show all)
    const activeFilters = filters;
    
    // Only apply filtering if filters object has actual filter properties
    const hasActiveFilters = activeFilters && Object.keys(activeFilters).length > 0;
    
    if (!hasActiveFilters) {
      // No filters active - show all facilities
      return filtered;
    }
    
    // Filter by facility type
    if (activeFilters.facilityType) {
      filtered = filtered.filter(f => f.facility_type === activeFilters.facilityType);
    }
    
    // Filter by location/address
    if (activeFilters.location) {
      filtered = filtered.filter(f => {
        const locationKey = activeFilters.location!.toLowerCase();
        
        // Map database entity_key to searchable terms
        let searchTerm = locationKey;
        
        // Special mappings for multi-word location keys
        if (locationKey === 'drammen_sentrum') {
          searchTerm = 'drammen';
        } else if (locationKey.includes('_')) {
          searchTerm = locationKey.split('_')[0];
        }
        
        // Check address
        if (f.address && f.address.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Check area_description
        if ((f as any).area_description && (f as any).area_description.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Check if facility name contains the search term
        if (f.name && f.name.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Also check if facility name starts with the search term
        if (f.name && f.name.toLowerCase().startsWith(searchTerm)) {
          return true;
        }
        
        return false;
      });
    }
    
    // Filter by search term
    if (activeFilters.searchTerm) {
      const searchLower = activeFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchLower) ||
        (f.description && f.description.toLowerCase().includes(searchLower)) ||
        (f.address && f.address.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by capacity range
    if (activeFilters.capacity && activeFilters.capacity.length === 2) {
      filtered = filtered.filter(f =>
        f.capacity && f.capacity >= activeFilters.capacity![0] && f.capacity <= activeFilters.capacity![1]
      );
    }
    
    // Filter by amenities (this is separate from individual amenities filter below)
    if (activeFilters.amenities && activeFilters.amenities.length > 0) {
      filtered = filtered.filter(f => {
        const facilityAmenities = Array.isArray(f.amenities) 
          ? f.amenities 
          : typeof f.amenities === 'object' && f.amenities !== null
            ? Object.values(f.amenities)
            : [];
        return activeFilters.amenities!.every(amenity =>
          facilityAmenities.some((a: any) => 
            typeof a === 'string' && a.toLowerCase().includes(amenity.toLowerCase())
          )
        );
      });
    }
    
    // Filter by single amenity (using accessibility field temporarily)
    if (activeFilters.accessibility && activeFilters.accessibility !== 'all') {
      filtered = filtered.filter(f => {
        if (!f.amenities || !Array.isArray(f.amenities)) {
          return false;
        }
        
        const amenityKey = activeFilters.accessibility!.toLowerCase();
        
        // Check if any facility amenity matches the selected amenity
        return (f.amenities as any[]).some((amenity: any) => {
          if (typeof amenity !== 'string') return false;
          
          // Match by key (e.g., 'wifi', 'parking')
          if (amenity.toLowerCase() === amenityKey) {
            return true;
          }
          
          // Also match by partial name (e.g., 'WiFi' contains 'wifi')
          return amenity.toLowerCase().includes(amenityKey);
        });
      });
    }
    
    return filtered;
  }, [facilities, filters]);

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
            onLoadingChange={() => {}} // We're not using this in MapContainer
            mapboxToken={MAPBOX_TOKEN}
          />
          {isInitialized && map && (
            <MapMarkers
              map={map}
              facilities={filteredFacilities}
              onMarkerClick={(facility) => {
                handleMarkerClickInternal(facility, onMarkerClick);
              }}
            />
          )}

        </Card>
      )}
    </div>
  );
};
