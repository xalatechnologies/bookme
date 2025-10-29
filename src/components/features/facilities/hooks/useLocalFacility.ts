"use client";

// Internal imports
import { useMemo } from 'react';
import { useFacilityStore } from '@/stores/facilityStore';
import type { IFacility } from '@/stores/facilityStore';

interface FacilityState {
  readonly facility: IFacility | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly notFound: boolean;
}

/**
 * Hook to fetch a facility from local store
 *
 * @param id - Facility ID
 * @returns Facility state with loading and error states
 */
export const useLocalFacility = (id: string): FacilityState => {
  const { getFacilityById } = useFacilityStore();

  // Get facility from store
  const facility = useMemo(() => {
    return getFacilityById(id) || null;
  }, [getFacilityById, id]);

  return {
    facility,
    loading: false, // Local store is synchronous
    error: null, // No network errors with local store
    notFound: !facility
  };
};