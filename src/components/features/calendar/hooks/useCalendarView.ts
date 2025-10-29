"use client";

// External imports
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports
import { useFacilityStore, type IFacility } from '@/stores/facilityStore';
import { useFacilityZones } from '@/services/supabase/zones.service';
import type { Zone } from '@/types/booking';

interface UseCalendarViewProps {
  readonly facilityType?: string;
  readonly location?: string;
  readonly accessibility?: string;
  readonly capacity?: readonly [number, number];
}

interface FacilityWithZones {
  readonly facility: IFacility;
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

  const { getPublishedFacilities } = useFacilityStore();
  const facilities = getPublishedFacilities();

  // Filter facilities based on criteria
  const filteredFacilities = useMemo(() => {
    let filtered = facilities;

    if (facilityType && facilityType !== "all") {
      filtered = filtered.filter(f => f.type === facilityType);
    }

    if (location && location !== "all") {
      filtered = filtered.filter(f => f.area === location);
    }

    if (accessibility && accessibility !== "all") {
      filtered = filtered.filter(f =>
        f.accessibilityFeatures && f.accessibilityFeatures.includes(accessibility)
      );
    }

    if (capacity) {
      filtered = filtered.filter(f =>
        f.capacity >= capacity[0] && f.capacity <= capacity[1]
      );
    }

    return filtered;
  }, [facilityType, location, accessibility, capacity, facilities]);

  // Fetch zones for all filtered facilities
  // Note: This creates multiple queries, one per facility
  // For better performance, consider batching or caching
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

  // Determine loading state from facilities query
  const isLoading = facilities.length === 0;

  return {
    facilitiesWithZones,
    isLoading,
    error,
    allZones,
    navigate
  };
};
