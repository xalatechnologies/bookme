import { useMemo } from 'react';
import { useFacilityZones } from '@/services/supabase/zones.service';
import { useZoneStore } from '@/stores/zoneStore';
import type { Zone } from '@/types/booking';

export interface UseFacilityZoneDataProps {
  readonly facilityId: string;
}

export interface UseFacilityZoneDataReturn {
  readonly zones: readonly Zone[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

/**
 * Custom hook for fetching and managing facility zone data
 * Combines Supabase data with store data, prioritizing store
 */
export const useFacilityZoneData = ({
  facilityId
}: UseFacilityZoneDataProps): UseFacilityZoneDataReturn => {
  const { getZonesForFacility } = useZoneStore();
  const { data: supabaseZones, isLoading, error } = useFacilityZones(facilityId);

  // Prioritize store zones, fallback to Supabase zones
  const zones = useMemo((): readonly Zone[] => {
    const storeZones = getZonesForFacility(facilityId);
    return storeZones.length > 0 ? storeZones : (supabaseZones || []);
  }, [facilityId, getZonesForFacility, supabaseZones]);

  return {
    zones,
    isLoading,
    error: error as Error | null
  };
};
