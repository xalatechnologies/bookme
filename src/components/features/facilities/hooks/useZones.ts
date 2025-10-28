"use client";

// External imports
import { useState, useEffect } from 'react';

// Internal imports
import type { Zone } from '@/types/booking';
import { getZonesForFacility } from '@/data/zones/dummyZones';
import { useZoneStore } from '@/stores/zoneStore';

interface ZonesState {
  readonly zones: readonly Zone[];
  readonly loading: boolean;
  readonly error: string | null;
}

export const useZones = (facilityId: string | number): ZonesState => {
  const [state, setState] = useState<ZonesState>({
    zones: [],
    loading: true,
    error: null
  });

  const { getZonesForFacility: storeGetZonesForFacility } = useZoneStore();

  useEffect(() => {
    const fetchZones = async (): Promise<void> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get zones for the facility from store first, then fallback to dummy data
        const facilityIdStr = typeof facilityId === 'number' ? facilityId.toString() : facilityId;
        let zones = storeGetZonesForFacility(facilityIdStr);
        
        // If no zones in store, use dummy data
        if (zones.length === 0) {
          const dummyZones = getZonesForFacility(facilityIdStr);
          zones = dummyZones;
        }

        setState({
          zones,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          zones: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    };

    if (facilityId) {
      fetchZones();
    }
  }, [facilityId, storeGetZonesForFacility]);

  return state;
};
