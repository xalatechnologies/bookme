"use client";

// External imports
import { useMemo } from 'react';

// Internal imports - Supabase services
import {
  useFacility as useSupabaseFacility,
  useFacilityBySlug
} from '@/services/supabase/facilities.service';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

interface FacilityState {
  readonly facility: Facility | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly notFound: boolean;
}

/**
 * Hook to fetch a facility by ID or slug
 * Automatically detects whether the parameter is a UUID or slug
 *
 * @param idOrSlug - Facility ID (UUID) or slug
 * @returns Facility state with loading and error states
 */
export const useFacility = (idOrSlug: string | number): FacilityState => {
  const idOrSlugStr = typeof idOrSlug === 'number' ? idOrSlug.toString() : idOrSlug;

  // Detect if parameter is UUID or slug
  // UUID format: 8-4-4-4-12 hex characters
  const isUUID = useMemo(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(idOrSlugStr);
  }, [idOrSlugStr]);

  // Use appropriate query based on parameter type
  const {
    data: facilityById,
    isLoading: loadingById,
    error: errorById
  } = useSupabaseFacility(idOrSlugStr, isUUID);

  const {
    data: facilityBySlug,
    isLoading: loadingBySlug,
    error: errorBySlug
  } = useFacilityBySlug(idOrSlugStr, !isUUID);

  // Combine results based on which query is active
  const facility = isUUID ? facilityById : facilityBySlug;
  const loading = isUUID ? loadingById : loadingBySlug;
  const error = isUUID ? errorById : errorBySlug;

  return {
    facility: facility || null,
    loading,
    error: error?.message || null,
    notFound: !loading && !facility && !error
  };
};
