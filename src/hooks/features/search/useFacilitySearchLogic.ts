import { useMemo } from 'react';
import { useIndexPageLogic, IndexPageState } from './useIndexPageLogic';
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

export interface FacilitySearchState extends IndexPageState {
    readonly facilities: Facility[];
    readonly isLoading: boolean;
    readonly totalCount: number;
}

/**
 * Hook that combines index page logic with facility search/filtering
 */
export const useFacilitySearchLogic = (): FacilitySearchState => {
    // Get base index page logic (URL params, filter state, etc.)
    const indexLogic = useIndexPageLogic();
    const { filters } = indexLogic;

    // Get organization ID
    const orgId = useOrganizationId();

    // Fetch facilities
    const { data: facilities = [], isLoading } = usePublishedFacilities(orgId);

    // Apply filters using useMemo for performance
    // This logic is moved from InfiniteScrollFacilities.tsx
    const filteredFacilities = useMemo(() => {
        let filtered = [...facilities];

        if (filters.searchTerm) {
            filtered = filtered.filter(facility =>
                facility.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
                (facility.description && facility.description.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
            );
        }

        if (filters.facilityType && filters.facilityType !== 'all') {
            filtered = filtered.filter(facility =>
                facility.facility_type?.toLowerCase() === filters.facilityType!.toLowerCase()
            );
        }

        if (filters.location && filters.location !== 'all') {
            filtered = filtered.filter(facility => {
                const locationKey = filters.location!.toLowerCase();

                // Map database entity_key to searchable terms
                // Extract the main word from keys like "drammen_sentrum" -> "drammen"
                // or use the full key for single-word locations
                let searchTerm = locationKey;

                // Special mappings for multi-word location keys
                if (locationKey === 'drammen_sentrum') {
                    searchTerm = 'drammen'; // Will match "Drammen Idrettshall", "Drammen Svømmehall"
                } else if (locationKey.includes('_')) {
                    // For other keys with underscores, use the first part
                    searchTerm = locationKey.split('_')[0];
                }

                // Check address
                if (facility.address && facility.address.toLowerCase().includes(searchTerm)) {
                    return true;
                }

                // Check area_description
                if (facility.area_description && facility.area_description.toLowerCase().includes(searchTerm)) {
                    return true;
                }

                // Check if facility name contains the search term
                if (facility.name && facility.name.toLowerCase().includes(searchTerm)) {
                    return true;
                }

                // Also check if facility name starts with the search term
                if (facility.name && facility.name.toLowerCase().startsWith(searchTerm)) {
                    return true;
                }

                return false;
            });
        }

        if (filters.capacity && (filters.capacity[0] > 0 || filters.capacity[1] < 200)) {
            filtered = filtered.filter(facility =>
                facility.capacity && facility.capacity >= filters.capacity![0] && facility.capacity <= filters.capacity![1]
            );
        }

        // Filter by amenity (using accessibility field temporarily)
        if (filters.accessibility && filters.accessibility !== 'all') {
            filtered = filtered.filter(facility => {
                if (!facility.amenities || !Array.isArray(facility.amenities)) {
                    return false;
                }

                const amenityKey = filters.accessibility!.toLowerCase();

                // Check if any facility amenity matches the selected amenity
                return facility.amenities.some((amenity: any) => {
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

    return {
        ...indexLogic,
        facilities: filteredFacilities,
        isLoading,
        totalCount: filteredFacilities.length,
    };
};
