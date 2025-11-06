/**
 * Facilities Service
 *
 * Handles all facility-related operations with Supabase backend.
 * Provides CRUD operations and React Query hooks for facilities.
 *
 * Features:
 * - Type-safe operations with generated database types
 * - React Query integration for caching and real-time updates
 * - Support for zones and availability
 * - Organization-scoped queries
 * - Optimistic updates
 *
 * Usage:
 * ```tsx
 * import { useFacilities, useCreateFacility } from '@/services/supabase/facilities.service';
 *
 * function FacilityList() {
 *   const { data: facilities, isLoading } = useFacilities(orgId);
 *   const createFacility = useCreateFacility();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return <div>{facilities?.map(f => <FacilityCard key={f.id} facility={f} />)}</div>;
 * }
 * ```
 */

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases for convenience
type Facility = Database['public']['Tables']['facilities']['Row'];
type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];
type Zone = Database['public']['Tables']['zones']['Row'];

/**
 * Facility with zones included
 */
export interface FacilityWithZones extends Facility {
  readonly zones: readonly Zone[];
}

/**
 * Query keys for React Query
 * Consistent key structure for caching and invalidation
 */
export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (orgId: string) => [...facilityKeys.lists(), orgId] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
  withZones: (id: string) => [...facilityKeys.detail(id), 'zones'] as const,
  published: (orgId: string) => [...facilityKeys.list(orgId), 'published'] as const,
};

// ============================================================================
// Service Functions (Direct Supabase calls)
// ============================================================================

/**
 * Get all facilities for an organization
 */
export const facilitiesService = {
  /**
   * Fetch all facilities for an organization
   * @param orgId - Organization ID
   * @returns Array of facilities
   */
  async getAll(orgId: string): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch only published facilities (for public view)
   * @param orgId - Organization ID
   * @returns Array of published facilities
   */
  async getPublished(orgId: string): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'published')
      .order('rating', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single facility by ID
   * @param id - Facility ID
   * @returns Facility or throws error
   */
  async getById(id: string): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch facility with its zones
   * @param id - Facility ID
   * @returns Facility with zones array
   */
  async getWithZones(id: string): Promise<FacilityWithZones> {
    const { data, error } = await supabase
      .from('facilities')
      .select(`
        *,
        zones (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as FacilityWithZones;
  },

  /**
   * Create a new facility
   * @param facility - Facility data to insert
   * @returns Created facility
   */
  async create(facility: FacilityInsert): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .insert(facility)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing facility
   * @param id - Facility ID
   * @param updates - Partial facility data to update
   * @returns Updated facility
   */
  async update(id: string, updates: FacilityUpdate): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a facility
   * @param id - Facility ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get facility by slug (SEO-friendly URL)
   * @param slug - Facility slug (e.g., 'drammen-idrettshall')
   * @returns Facility or null
   */
  async getBySlug(slug: string): Promise<Facility | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle(); // Use maybeSingle() to avoid 406 errors

    if (error) {
      console.error('Error fetching facility by slug:', error);
      throw error;
    }

    return data;
  },

  /**
   * Search facilities by name or description
   * @param orgId - Organization ID
   * @param query - Search query
   * @returns Array of matching facilities
   */
  async search(orgId: string, query: string): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('org_id', orgId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  /**
   * Fetch facility availability
   * @param facilityId - Facility ID
   * @returns Array of availability records
   */
  async getAvailability(facilityId: string): Promise<Database['public']['Tables']['facility_availability']['Row'][]> {
    const { data, error } = await supabase
      .from('facility_availability')
      .select('*')
      .eq('facility_id', facilityId)
      .order('day_of_week');

    if (error) throw error;
    return data;
  },

  /**
   * Update facility availability
   * @param facilityId - Facility ID
   * @param availability - Array of availability records
   */
  async updateAvailability(facilityId: string, availability: Database['public']['Tables']['facility_availability']['Row'][]): Promise<void> {
    // First delete existing availability for this facility
    const { error: deleteError } = await supabase
      .from('facility_availability')
      .delete()
      .eq('facility_id', facilityId);

    if (deleteError) throw deleteError;

    // Then insert new availability records
    if (availability.length > 0) {
      const { error: insertError } = await supabase
        .from('facility_availability')
        .insert(availability.map(item => ({
          ...item,
          facility_id: facilityId
        })));

      if (insertError) throw insertError;
    }
  },

};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all facilities for an organization
 *
 * @param orgId - Organization ID
 * @param enabled - Whether to enable the query (default: true if orgId exists)
 * @returns React Query result with facilities array
 *
 * @example
 * ```tsx
 * function FacilityList({ orgId }: { orgId: string }) {
 *   const { data: facilities, isLoading, error } = useFacilities(orgId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return <div>{facilities?.map(f => <FacilityCard key={f.id} facility={f} />)}</div>;
 * }
 * ```
 */
export const useFacilities = (
  orgId: string,
  enabled = true
): UseQueryResult<Facility[], Error> => {
  return useQuery({
    queryKey: facilityKeys.list(orgId),
    queryFn: () => facilitiesService.getAll(orgId),
    enabled: !!orgId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch published facilities only
 *
 * @param orgId - Organization ID
 * @returns React Query result with published facilities
 */
export const usePublishedFacilities = (
  orgId: string
): UseQueryResult<Facility[], Error> => {
  return useQuery({
    queryKey: facilityKeys.published(orgId),
    queryFn: () => facilitiesService.getPublished(orgId),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes (public data changes less frequently)
  });
};

/**
 * Hook to fetch a single facility
 *
 * @param id - Facility ID
 * @param enabled - Whether to enable the query
 * @returns React Query result with facility
 *
 * @example
 * ```tsx
 * function FacilityDetail({ id }: { id: string }) {
 *   const { data: facility, isLoading } = useFacility(id);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!facility) return <NotFound />;
 *
 *   return <FacilityCard facility={facility} />;
 * }
 * ```
 */
export const useFacility = (
  id: string,
  enabled = true
): UseQueryResult<Facility, Error> => {
  return useQuery({
    queryKey: facilityKeys.detail(id),
    queryFn: () => facilitiesService.getById(id),
    enabled: !!id && enabled,
  });
};

/**
 * Hook to fetch facility by slug (SEO-friendly URL)
 *
 * @param slug - Facility slug (e.g., 'drammen-idrettshall')
 * @param enabled - Enable/disable query
 * @returns React Query result with facility
 *
 * @example
 * ```tsx
 * function FacilityDetailPage() {
 *   const { slug } = useParams();
 *   const { data: facility, isLoading, error } = useFacilityBySlug(slug);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error || !facility) return <NotFound />;
 *
 *   return <FacilityDetail facility={facility} />;
 * }
 * ```
 */
export const useFacilityBySlug = (
  slug: string,
  enabled = true
): UseQueryResult<Facility | null, Error> => {
  return useQuery({
    queryKey: [...facilityKeys.all, 'slug', slug],
    queryFn: () => facilitiesService.getBySlug(slug),
    enabled: !!slug && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - facilities don't change often
  });
};

/**
 * Hook to fetch facility with zones
 *
 * @param id - Facility ID
 * @returns React Query result with facility and zones
 *
 * @example
 * ```tsx
 * function FacilityWithZonesView({ id }: { id: string }) {
 *   const { data: facility, isLoading } = useFacilityWithZones(id);
 *
 *   return (
 *     <div>
 *       <h1>{facility?.name}</h1>
 *       <h2>Zones:</h2>
 *       {facility?.zones.map(zone => <ZoneCard key={zone.id} zone={zone} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export const useFacilityWithZones = (
  id: string
): UseQueryResult<FacilityWithZones, Error> => {
  return useQuery({
    queryKey: facilityKeys.withZones(id),
    queryFn: () => facilitiesService.getWithZones(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch facility availability
 *
 * @param facilityId - Facility ID
 * @returns React Query result with availability array
 */
export const useFacilityAvailability = (
  facilityId: string
): UseQueryResult<Database['public']['Tables']['facility_availability']['Row'][], Error> => {
  return useQuery({
    queryKey: [...facilityKeys.detail(facilityId), 'availability'],
    queryFn: () => facilitiesService.getAvailability(facilityId),
    enabled: !!facilityId,
  });
};

/**
 * Hook to create a facility
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * function CreateFacilityForm() {
 *   const createFacility = useCreateFacility();
 *
 *   const handleSubmit = (data: FacilityInsert) => {
 *     createFacility.mutate(data, {
 *       onSuccess: (facility) => {
 *         toast.success('Facility created!');
 *         navigate(`/facilities/${facility.id}`);
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       }
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useCreateFacility = (): UseMutationResult<
  Facility,
  Error,
  FacilityInsert
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.create,
    onSuccess: (newFacility) => {
      // Invalidate all facility lists
      queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });

      // Optimistically add to cache
      queryClient.setQueryData(
        facilityKeys.detail(newFacility.id),
        newFacility
      );
    },
  });
};

/**
 * Hook to update a facility
 *
 * @returns Mutation object
 *
 * @example
 * ```tsx
 * function EditFacilityForm({ facility }: { facility: Facility }) {
 *   const updateFacility = useUpdateFacility();
 *
 *   const handleSubmit = (updates: FacilityUpdate) => {
 *     updateFacility.mutate({ id: facility.id, updates }, {
 *       onSuccess: () => toast.success('Updated!'),
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useUpdateFacility = (): UseMutationResult<
  Facility,
  Error,
  { id: string; updates: FacilityUpdate }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => facilitiesService.update(id, updates),
    onSuccess: (updatedFacility, { id }) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });

      // Update detail cache
      queryClient.setQueryData(
        facilityKeys.detail(id),
        updatedFacility
      );

      // Invalidate zones if they might be affected
      queryClient.invalidateQueries({ queryKey: facilityKeys.withZones(id) });
    },
  });
};

/**
 * Hook to update facility availability
 *
 * @returns Mutation object
 */
export const useUpdateFacilityAvailability = (): UseMutationResult<
  void,
  Error,
  { facilityId: string; availability: Database['public']['Tables']['facility_availability']['Row'][] }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ facilityId, availability }) => 
      facilitiesService.updateAvailability(facilityId, availability),
    onSuccess: (_, { facilityId }) => {
      // Invalidate availability cache
      queryClient.invalidateQueries({ 
        queryKey: [...facilityKeys.detail(facilityId), 'availability'] 
      });
    },
  });
};

/**
 * Hook to delete a facility
 *
 * @returns Mutation object
 *
 * @example
 * ```tsx
 * function DeleteFacilityButton({ id }: { id: string }) {
 *   const deleteFacility = useDeleteFacility();
 *
 *   const handleDelete = () => {
 *     if (confirm('Are you sure?')) {
 *       deleteFacility.mutate(id, {
 *         onSuccess: () => {
 *           toast.success('Deleted!');
 *           navigate('/facilities');
 *         }
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 * ```
 */
export const useDeleteFacility = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.delete,
    onSuccess: (_, id) => {
      // Invalidate all facility queries
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });

      // Remove from cache
      queryClient.removeQueries({ queryKey: facilityKeys.detail(id) });
    },
  });
};

/**
 * Hook to search facilities
 *
 * @param orgId - Organization ID
 * @param query - Search query
 * @param enabled - Whether to enable the search
 * @returns React Query result with search results
 */
export const useSearchFacilities = (
  orgId: string,
  query: string,
  enabled = true
): UseQueryResult<Facility[], Error> => {
  return useQuery({
    queryKey: [...facilityKeys.list(orgId), 'search', query],
    queryFn: () => facilitiesService.search(orgId, query),
    enabled: !!orgId && !!query && query.length >= 2 && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
