"use client";

// External imports
import { useMemo } from 'react';

// Internal imports
import type { Zone } from '@/types/booking';
import { useFacilityZones } from '@/services/supabase/zones.service';
import { useZoneStore } from '@/stores/zoneStore';

interface ZonesState {
  readonly zones: readonly Zone[];
  readonly loading: boolean;
  readonly error: string | null;
}

/**
 * Hook to fetch zones for a facility
 *
 * Prioritizes zones from the store (for immediate access),
 * then falls back to fetching from Supabase.
 *
 * @param facilityId - The facility ID to fetch zones for
 * @returns Zones state with zones array, loading status, and error
 */
export const useZones = (facilityId: string | number): ZonesState => {
  const { getZonesForFacility: storeGetZonesForFacility } = useZoneStore();

  // Convert facilityId to string
  const facilityIdStr = typeof facilityId === 'number' ? facilityId.toString() : facilityId;

  // Fetch zones from Supabase using React Query
  const { data: supabaseZones, isLoading, error: queryError } = useFacilityZones(facilityIdStr);

  // Get zones from store (local state)
  const storeZones = storeGetZonesForFacility(facilityIdStr);

  // Prioritize store zones for immediate display, fallback to Supabase data
  const zones = useMemo(() => {
    if (storeZones.length > 0) {
      return storeZones;
    }
    return (supabaseZones as readonly Zone[]) || [];
  }, [storeZones, supabaseZones]);

  return {
    zones,
    loading: isLoading,
    error: queryError ? 'Failed to fetch zones' : null
  };
};
