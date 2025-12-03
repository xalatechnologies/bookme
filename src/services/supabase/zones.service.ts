/**
 * Zones Service
 *
 * Handles all zone-related operations with Supabase backend.
 * Zones are bookable areas within facilities.
 *
 * Features:
 * - Type-safe zone operations
 * - React Query integration
 * - Availability checking
 * - Zone-specific pricing and capacity
 */

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases
type Zone = Database['public']['Tables']['zones']['Row'];
type ZoneInsert = Database['public']['Tables']['zones']['Insert'];
type ZoneUpdate = Database['public']['Tables']['zones']['Update'];
type ZoneAvailability = Database['public']['Tables']['zone_availability']['Row'];

/**
 * Zone with availability schedule
 */
export interface ZoneWithAvailability extends Zone {
  readonly availability: readonly ZoneAvailability[];
}

/**
 * Query keys
 */
export const zoneKeys = {
  all: ['zones'] as const,
  lists: () => [...zoneKeys.all, 'list'] as const,
  facilityZones: (facilityId: string) => [...zoneKeys.lists(), 'facility', facilityId] as const,
  facilitiesZones: (facilityIds: readonly string[]) => [...zoneKeys.lists(), 'facilities', ...facilityIds.sort()] as const,
  details: () => [...zoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...zoneKeys.details(), id] as const,
  withAvailability: (id: string) => [...zoneKeys.detail(id), 'availability'] as const};

// ============================================================================
// Service Functions
// ============================================================================

export const zonesService = {
  /**
   * Fetch all zones for a facility
   */
  async getByFacility(facilityId: string): Promise<Zone[]> {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch zones for multiple facilities
   */
  async getByFacilities(facilityIds: readonly string[]): Promise<Zone[]> {
    if (facilityIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .in('facility_id', facilityIds)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single zone by ID
   */
  async getById(id: string): Promise<Zone> {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch zone with availability schedule
   */
  async getWithAvailability(id: string): Promise<ZoneWithAvailability> {
    const { data, error } = await supabase
      .from('zones')
      .select(`
        *,
        availability:zone_availability (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ZoneWithAvailability;
  },

  /**
   * Create a new zone
   */
  async create(zone: ZoneInsert): Promise<Zone> {
    const { data, error } = await supabase
      .from('zones')
      .insert(zone)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a zone
   */
  async update(id: string, updates: ZoneUpdate): Promise<Zone> {
    const { data, error } = await supabase
      .from('zones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a zone (soft delete by setting status)
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('zones')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Check if a zone is available for booking
   */
  async checkAvailability(
    zoneId: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_zone_available', {
      p_zone_id: zoneId,
      p_start_time: startTime,
      p_end_time: endTime});

    if (error) {
      console.error('Zone availability check error:', error);
      throw error;
    }

    return data as boolean;
  },

  /**
   * Get zone availability for a specific date
   */
  async getAvailabilityForDate(zoneId: string, date: string): Promise<ZoneAvailability[]> {
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday

    const { data, error } = await supabase
      .from('zone_availability')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('day_of_week', dayOfWeek);

    if (error) throw error;
    return data;
  }};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch zones for a facility
 *
 * @example
 * ```tsx
 * function FacilityZones({ facilityId }: { facilityId: string }) {
 *   const { data: zones, isLoading } = useFacilityZones(facilityId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       {zones?.map(zone => (
 *         <ZoneCard key={zone.id} zone={zone} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useFacilityZones = (
  facilityId: string,
  enabled = true
): UseQueryResult<Zone[], Error> => {
  return useQuery({
    queryKey: zoneKeys.facilityZones(facilityId),
    queryFn: () => zonesService.getByFacility(facilityId),
    enabled: !!facilityId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch zones for multiple facilities
 */
export const useFacilitiesZones = (
  facilityIds: readonly string[],
  enabled = true
): UseQueryResult<Zone[], Error> => {
  return useQuery({
    queryKey: zoneKeys.facilitiesZones(facilityIds),
    queryFn: () => zonesService.getByFacilities(facilityIds),
    enabled: facilityIds.length > 0 && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single zone
 */
export const useZone = (
  id: string,
  enabled = true
): UseQueryResult<Zone, Error> => {
  return useQuery({
    queryKey: zoneKeys.detail(id),
    queryFn: () => zonesService.getById(id),
    enabled: !!id && enabled});
};

/**
 * Hook to fetch zone with availability
 *
 * @example
 * ```tsx
 * function ZoneDetails({ zoneId }: { zoneId: string }) {
 *   const { data: zone } = useZoneWithAvailability(zoneId);
 *
 *   return (
 *     <div>
 *       <h2>{zone?.name}</h2>
 *       <h3>Available:</h3>
 *       <ul>
 *         {zone?.availability.map(slot => (
 *           <li key={slot.id}>
 *             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.day_of_week]}:
 *             {slot.starts_time} - {slot.ends_time}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export const useZoneWithAvailability = (
  id: string,
  enabled = true
): UseQueryResult<ZoneWithAvailability, Error> => {
  return useQuery({
    queryKey: zoneKeys.withAvailability(id),
    queryFn: () => zonesService.getWithAvailability(id),
    enabled: !!id && enabled});
};

/**
 * Hook to create a zone
 *
 * @example
 * ```tsx
 * function CreateZoneForm({ facilityId }: { facilityId: string }) {
 *   const createZone = useCreateZone();
 *
 *   const handleSubmit = (data: ZoneInsert) => {
 *     createZone.mutate(data, {
 *       onSuccess: () => toast.success('Zone created!'),
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useCreateZone = (): UseMutationResult<Zone, Error, ZoneInsert> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: zonesService.create,
    onSuccess: (newZone) => {
      // Invalidate facility zones list
      queryClient.invalidateQueries({
        queryKey: zoneKeys.facilityZones(newZone.facility_id)});

      // Add to cache
      queryClient.setQueryData(zoneKeys.detail(newZone.id), newZone);
    }});
};

/**
 * Hook to update a zone
 */
export const useUpdateZone = (): UseMutationResult<
  Zone,
  Error,
  { id: string; updates: ZoneUpdate }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => zonesService.update(id, updates),
    onSuccess: (updatedZone, { id }) => {
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: zoneKeys.facilityZones(updatedZone.facility_id)});

      // Update cache
      queryClient.setQueryData(zoneKeys.detail(id), updatedZone);
      queryClient.invalidateQueries({ queryKey: zoneKeys.withAvailability(id) });
    }});
};

/**
 * Hook to delete a zone
 */
export const useDeleteZone = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: zonesService.delete,
    onSuccess: (_, id) => {
      // Invalidate all zone queries
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });

      // Remove from cache
      queryClient.removeQueries({ queryKey: zoneKeys.detail(id) });
    }});
};

/**
 * Hook to check zone availability
 *
 * @example
 * ```tsx
 * function ZoneAvailabilityChecker({ zoneId, startTime, endTime }) {
 *   const { data: isAvailable, isLoading } = useCheckZoneAvailability(
 *     zoneId,
 *     startTime,
 *     endTime
 *   );
 *
 *   if (isLoading) return <span>Checking...</span>;
 *
 *   return (
 *     <span className={isAvailable ? 'text-green-600' : 'text-red-600'}>
 *       {isAvailable ? 'Available' : 'Not available'}
 *     </span>
 *   );
 * }
 * ```
 */
export const useCheckZoneAvailability = (
  zoneId: string,
  startTime: string,
  endTime: string,
  enabled = true
): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: ['zone-availability', zoneId, startTime, endTime],
    queryFn: () => zonesService.checkAvailability(zoneId, startTime, endTime),
    enabled: !!zoneId && !!startTime && !!endTime && enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to get zone availability for a date
 */
export const useZoneAvailabilityForDate = (
  zoneId: string,
  date: string,
  enabled = true
): UseQueryResult<ZoneAvailability[], Error> => {
  return useQuery({
    queryKey: ['zone-availability-date', zoneId, date],
    queryFn: () => zonesService.getAvailabilityForDate(zoneId, date),
    enabled: !!zoneId && !!date && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
