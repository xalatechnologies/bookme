"use client";

// External imports
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports - Supabase services
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useFacilityZones } from '@/services/supabase/zones.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import type { Database } from '@/types/database';
import type { Zone } from '@/types/booking';

// Type aliases
type Facility = Database['public']['Tables']['facilities']['Row'];

interface UseCalendarViewProps {
  readonly facilityType?: string;
  readonly location?: string;
  readonly accessibility?: string;
  readonly capacity?: readonly [number, number];
}

interface FacilityWithZones {
  readonly facility: Facility;
  readonly zones: readonly Zone[];
}

interface UseCalendarViewReturn {
  readonly facilitiesWithZones: readonly FacilityWithZones[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly allZones: readonly Zone[];
  readonly navigate: (path: string) => void;
}

export const useCalendarView = ({
  facilityType,
  location,
  accessibility,
  capacity
}: UseCalendarViewProps): UseCalendarViewReturn => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Get organization context
  const orgId = useOrganizationId();

  // Fetch published facilities from Supabase
  const { data: facilities = [], isLoading, error: facilitiesError } = usePublishedFacilities(orgId);

  // Filter facilities based on criteria
  const filteredFacilities = useMemo(() => {
    let filtered = facilities;

    if (facilityType && facilityType !== "all") {
      filtered = filtered.filter(f => f.facility_type === facilityType);
    }

    if (location && location !== "all") {
      filtered = filtered.filter(f => f.area === location);
    }

    if (accessibility && accessibility !== "all") {
      filtered = filtered.filter(f =>
        f.accessibility_features && f.accessibility_features.includes(accessibility)
      );
    }

    if (capacity) {
      filtered = filtered.filter(f =>
        f.capacity && f.capacity >= capacity[0] && f.capacity <= capacity[1]
      );
    }

    return filtered;
  }, [facilityType, location, accessibility, capacity, facilities]);

  // Fetch zones for all filtered facilities
  // Note: This creates multiple queries, one per facility
  // React Query will cache and optimize these queries
  const facilitiesWithZones = useMemo((): readonly FacilityWithZones[] => {
    const results: FacilityWithZones[] = [];

    filteredFacilities.forEach(facility => {
      // Use React Query hook for each facility
      // This will be cached and optimized by React Query
      const { data: zones } = useFacilityZones(facility.id);

      if (zones && zones.length > 0) {
        results.push({
          facility,
          zones: zones as readonly Zone[]
        });
      }
    });

    return results;
  }, [filteredFacilities]);

  // Get all zones from filtered facilities
  const allZones = useMemo((): readonly Zone[] => {
    return facilitiesWithZones.flatMap(item => item.zones);
  }, [facilitiesWithZones]);

  return {
    facilitiesWithZones,
    isLoading,
    error: facilitiesError?.message || error,
    allZones,
    navigate
  };
};
