"use client";

// External imports
import { useMemo } from 'react';

// Internal imports - Supabase services
import {
  useFacility as useSupabaseFacility,
  useFacilityBySlug
} from '@/services/supabase/facilities.service';
import { useLocalFacility } from './useLocalFacility';
import type { Database } from '@/types/database';
import type { IFacility } from '@/stores/facilityStore';

type SupabaseFacility = Database['public']['Tables']['facilities']['Row'];

interface FacilityState {
  readonly facility: SupabaseFacility | null;
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

  // Use local facility as fallback
  const { facility: localFacility, notFound: localNotFound } = useLocalFacility(idOrSlugStr);

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
  const supabaseFacility = isUUID ? facilityById : facilityBySlug;
  const loading = isUUID ? loadingById : loadingBySlug;
  const error = isUUID ? errorById : errorBySlug;

  // Use local facility as fallback if Supabase facility is not found
  // Note: We're only using the local facility as a fallback, but returning it as SupabaseFacility type
  // This is a temporary solution until we fully migrate to Supabase
  const facility = supabaseFacility || (localFacility as unknown as SupabaseFacility) || null;

  return {
    facility,
    loading,
    error: error?.message || null,
    notFound: !loading && !facility && !error && localNotFound
  };
};