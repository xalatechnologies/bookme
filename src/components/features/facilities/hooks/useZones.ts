"use client";

// External imports
import { useMemo } from 'react';

// Internal imports
import type { Zone } from '@/types/booking';
import type { Database } from '@/types/database';
import { useFacilityZones } from '@/services/supabase/zones.service';
import { useZoneStore } from '@/stores/zoneStore';

// Type for Supabase zone data
type SupabaseZone = Database['public']['Tables']['zones']['Row'];

interface ZonesState {
  readonly zones: readonly Zone[];
  readonly loading: boolean;
  readonly error: string | null;
}

/**
 * Convert Supabase zone data to the expected Zone type
 */
const convertSupabaseZoneToZone = (supabaseZone: SupabaseZone): Zone => {
  // Create default availability structure
  const defaultAvailability = {
    monday: { start: "08:00", end: "22:00" },
    tuesday: { start: "08:00", end: "22:00" },
    wednesday: { start: "08:00", end: "22:00" },
    thursday: { start: "08:00", end: "22:00" },
    friday: { start: "08:00", end: "22:00" },
    saturday: { start: "09:00", end: "20:00" },
    sunday: { start: "10:00", end: "18:00" }
  };

  return {
    id: supabaseZone.id,
    name: supabaseZone.name,
    facilityId: supabaseZone.facility_id,
    capacity: supabaseZone.capacity,
    pricePerHour: supabaseZone.price_per_hour_cents,
    area: supabaseZone.area_sqm || undefined,
    description: supabaseZone.description || undefined,
    amenities: (supabaseZone.amenities as string[]) || [],
    availability: defaultAvailability
  };
};

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
    
    // Convert Supabase zones to the expected Zone type
    if (supabaseZones) {
      return supabaseZones.map(convertSupabaseZoneToZone);
    }
    
    return [];
  }, [storeZones, supabaseZones]);

  return {
    zones,
    loading: isLoading,
    error: queryError ? 'Failed to fetch zones' : null
  };
};