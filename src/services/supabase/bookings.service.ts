/**
 * Bookings Service
 *
 * Handles all booking-related operations with Supabase backend.
 * Provides CRUD operations and React Query hooks for bookings.
 *
 * Features:
 * - Type-safe booking operations
 * - React Query integration with caching
 * - Support for zones and facilities
 * - Availability checking
 * - Booking lifecycle management
 * - Organization and user-scoped queries
 */

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases
type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
type Facility = Database['public']['Tables']['facilities']['Row'];
type Zone = Database['public']['Tables']['zones']['Row'];
type UserProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * Booking with related data
 */
export interface BookingWithDetails extends Booking {
  readonly facility?: Facility;
  readonly zone?: Zone | null;
  readonly user_profile?: UserProfile | null;
}

/**
 * Availability check parameters
 */
export interface AvailabilityParams {
  readonly facilityId: string;
  readonly zoneId?: string | null;
  readonly startTime: string;
  readonly endTime: string;
}

/**
 * Query keys for React Query
 */
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...bookingKeys.lists(), filters] as const,
  userBookings: (userId: string) => [...bookingKeys.lists(), 'user', userId] as const,
  orgBookings: (orgId: string) => [...bookingKeys.lists(), 'org', orgId] as const,
  facilityBookings: (facilityId: string) => [...bookingKeys.lists(), 'facility', facilityId] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// ============================================================================
// Service Functions
// ============================================================================

export const bookingsService = {
  /**
   * Fetch bookings for a specific user
   */
  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('user_id', userId)
      .order('starts_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching bookings:', error);
      throw error;
    }

    return data as BookingWithDetails[];
  },

  /**
   * Fetch bookings for an organization
   */
  async getOrgBookings(orgId: string): Promise<BookingWithDetails[]> {
    // First get the bookings with facility information
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities!inner (*)
      `)
      .eq('facility.org_id', orgId)
      .order('starts_at', { ascending: false });

    if (bookingsError) throw bookingsError;
    
    // If no bookings, return early
    if (!bookings || bookings.length === 0) {
      return [];
    }
    
    // Get unique user IDs from the bookings
    const userIds = [...new Set(bookings.map(booking => booking.user_id))];
    
    // Get user profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);
    
    if (profilesError) throw profilesError;
    
    // Create a map of user profiles for quick lookup
    const profileMap = new Map(profiles.map(profile => [profile.user_id, profile]));
    
    // Combine bookings with their user profiles
    const bookingsWithProfiles = bookings.map(booking => ({
      ...booking,
      user_profile: profileMap.get(booking.user_id) || null
    }));
    
    return bookingsWithProfiles as BookingWithDetails[];
  },

  /**
   * Fetch bookings for a specific facility
   */
  async getFacilityBookings(
    facilityId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Booking[]> {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('facility_id', facilityId)
      .in('status', ['pending', 'awaiting_payment', 'paid', 'completed']);

    if (startDate) {
      query = query.gte('starts_at', startDate);
    }
    if (endDate) {
      query = query.lte('ends_at', endDate);
    }

    const { data, error } = await query.order('starts_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single booking by ID
   */
  async getById(id: string): Promise<BookingWithDetails> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BookingWithDetails;
  },

  /**
   * Create a new booking
   */
  async create(booking: BookingInsert): Promise<Booking> {
    console.log('Supabase client available:', !!supabase);
    console.log('Attempting to create booking:', booking);
    
    // Validate that no fields contain invalid UUIDs
    for (const [key, value] of Object.entries(booking)) {
      if (typeof value === 'string' && value.length > 0) {
        // Check if this might be a UUID field with an invalid value
        if (key.includes('id') && value.length > 10 && !value.includes('-')) {
          console.warn(`Potential invalid UUID in field ${key}:`, value);
        }
      }
    }
    
    try {
      console.log('Executing Supabase insert...');
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      
      console.log('Supabase insert result:', { data, error });
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Booking created successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception in bookingsService.create:', error);
      throw error;
    }
  },

  /**
   * Update an existing booking
   */
  async update(id: string, updates: BookingUpdate): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cancel a booking
   */
  async cancel(id: string, reason?: string): Promise<Booking> {
    const updates: BookingUpdate = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    return this.update(id, updates);
  },

  /**
   * Delete a booking
   */
  async delete(id: string): Promise<void> {
    // First verify the booking exists and belongs to the current user
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch booking: ${fetchError.message}`);
    }

    // Check if booking belongs to current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || booking.user_id !== user.id) {
      throw new Error('Not authorized to delete this booking');
    }

    // For cancelled bookings, use the specific RPC function to avoid trigger issues
    if (booking.status === 'cancelled') {
      const { error: rpcError } = await supabase.rpc('delete_cancelled_booking' as any, { p_booking: id });
      if (rpcError) {
        throw new Error(`Failed to delete cancelled booking: ${rpcError.message}`);
      }
      return;
    }

    // For other bookings, use the standard delete
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Failed to delete booking: ${deleteError.message}`);
    }
  },

  /**
   * Get upcoming bookings for a user
   */
  async getUpcoming(userId: string, limit = 10): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('user_id', userId)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as BookingWithDetails[];
  },

  /**
   * Get past bookings for a user
   */
  async getPast(userId: string, limit = 20): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('user_id', userId)
      .lt('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as BookingWithDetails[];
  },

  /**
   * Check availability for a time slot
   * Uses RPC function from backend
   */
  async checkAvailability(params: AvailabilityParams): Promise<boolean> {
    // Using has_overlap function with negation to check availability
    const { data, error } = await supabase.rpc('has_overlap', {
      p_facility: params.facilityId,
      p_starts: params.startTime,
      p_ends: params.endTime,
    });

    if (error) {
      console.error('Availability check error:', error);
      throw error;
    }

    // has_overlap returns true if there's an overlap, so we negate it
    return !data;
  },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch user's bookings
 *
 * @example
 * ```tsx
 * function MyBookings() {
 *   const { user } = useAuth();
 *   const { data: bookings, isLoading } = useUserBookings(user?.id!);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       {bookings?.map(booking => (
 *         <BookingCard key={booking.id} booking={booking} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserBookings = (
  userId: string,
  enabled = true
): UseQueryResult<BookingWithDetails[], Error> => {
  return useQuery({
    queryKey: bookingKeys.userBookings(userId),
    queryFn: () => bookingsService.getUserBookings(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch organization bookings
 */
export const useOrgBookings = (
  orgId: string,
  enabled = true
): UseQueryResult<BookingWithDetails[], Error> => {
  return useQuery({
    queryKey: bookingKeys.orgBookings(orgId),
    queryFn: () => bookingsService.getOrgBookings(orgId),
    enabled: !!orgId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch facility bookings
 */
export const useFacilityBookings = (
  facilityId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
): UseQueryResult<Booking[], Error> => {
  return useQuery({
    queryKey: bookingKeys.facilityBookings(facilityId),
    queryFn: () => bookingsService.getFacilityBookings(facilityId, startDate, endDate),
    enabled: !!facilityId && enabled,
    staleTime: 30 * 1000, // 30 seconds (bookings change frequently)
  });
};

/**
 * Hook to fetch a single booking
 */
export const useBooking = (
  id: string,
  enabled = true
): UseQueryResult<BookingWithDetails, Error> => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsService.getById(id),
    enabled: !!id && enabled,
  });
};

/**
 * Hook to fetch upcoming bookings
 */
export const useUpcomingBookings = (
  userId: string,
  limit = 10
): UseQueryResult<BookingWithDetails[], Error> => {
  return useQuery({
    queryKey: [...bookingKeys.userBookings(userId), 'upcoming'],
    queryFn: () => bookingsService.getUpcoming(userId, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch past bookings
 */
export const usePastBookings = (
  userId: string,
  limit = 20
): UseQueryResult<BookingWithDetails[], Error> => {
  return useQuery({
    queryKey: [...bookingKeys.userBookings(userId), 'past'],
    queryFn: () => bookingsService.getPast(userId, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes (past data changes less)
  });
};

/**
 * Hook to create a booking
 *
 * @example
 * ```tsx
 * function BookingForm() {
 *   const createBooking = useCreateBooking();
 *
 *   const handleSubmit = (data: BookingInsert) => {
 *     createBooking.mutate(data, {
 *       onSuccess: (booking) => {
 *         toast.success('Booking created!');
 *         navigate(`/bookings/${booking.id}`);
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
export const useCreateBooking = (): UseMutationResult<
  Booking,
  Error,
  BookingInsert
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      console.log('Creating booking with data:', booking);
      try {
        const result = await bookingsService.create(booking);
        console.log('Booking created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error in bookingsService.create:', error);
        throw error;
      }
    },
    onSuccess: (newBooking) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });

      // Add to cache
      queryClient.setQueryData(bookingKeys.detail(newBooking.id), newBooking);
    },
    onError: (error) => {
      console.error('useCreateBooking mutation error:', error);
    }
  });
};

/**
 * Hook to update a booking
 */
export const useUpdateBooking = (): UseMutationResult<
  Booking,
  Error,
  { id: string; updates: BookingUpdate }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => bookingsService.update(id, updates),
    onSuccess: (updatedBooking, { id }) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      
      // Specifically invalidate user bookings lists to ensure UI updates
      queryClient.invalidateQueries({ queryKey: bookingKeys.userBookings(updatedBooking.user_id) });
      
      // Also invalidate org bookings to ensure admin UI updates
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'bookings' && 
                 query.queryKey[1] === 'list' && 
                 query.queryKey[2] === 'org';
        }
      });

      // Update cache
      queryClient.setQueryData(bookingKeys.detail(id), updatedBooking);
    },
  });
};

/**
 * Hook to cancel a booking
 *
 * @example
 * ```tsx
 * function CancelButton({ bookingId }: { bookingId: string }) {
 *   const cancelBooking = useCancelBooking();
 *
 *   const handleCancel = () => {
 *     if (confirm('Cancel this booking?')) {
 *       cancelBooking.mutate(bookingId, {
 *         onSuccess: () => toast.success('Booking cancelled'),
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handleCancel}>Cancel Booking</button>;
 * }
 * ```
 */
export const useCancelBooking = (): UseMutationResult<Booking, Error, { id: string; reason?: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => bookingsService.cancel(id, reason),
    onSuccess: (cancelledBooking, { id }) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      
      // Specifically invalidate user bookings lists to ensure UI updates
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      
      // Also invalidate all user bookings queries to ensure the list updates
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'bookings' && 
                 query.queryKey[1] === 'list' && 
                 query.queryKey[2] === 'user';
        }
      });

      // Update cache
      queryClient.setQueryData(bookingKeys.detail(id), cancelledBooking);
    },
  });
};

/**
 * Hook to delete a booking
 *
 * @example
 * ```tsx
 * function DeleteButton({ bookingId }: { bookingId: string }) {
 *   const deleteBooking = useDeleteBooking();
 *
 *   const handleDelete = () => {
 *     if (confirm('Permanently delete this booking?')) {
 *       deleteBooking.mutate(bookingId, {
 *         onSuccess: () => toast.success('Booking deleted'),
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>Delete Booking</button>;
 * }
 * ```
 */
export const useDeleteBooking = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsService.delete(id),
    onSuccess: (_, bookingId) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      
      // Specifically invalidate user bookings lists to ensure UI updates
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      
      // Remove specific booking from cache
      queryClient.removeQueries({ queryKey: bookingKeys.detail(bookingId) });
      
      // Also invalidate all user bookings queries to ensure the list updates
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'bookings' && 
                 query.queryKey[1] === 'list' && 
                 query.queryKey[2] === 'user';
        }
      });
    },
  });
};

/**
 * Hook to check availability
 *
 * @example
 * ```tsx
 * function AvailabilityChecker() {
 *   const [params, setParams] = useState<AvailabilityParams>(...);
 *   const { data: isAvailable, isLoading } = useCheckAvailability(params);
 *
 *   return (
 *     <div>
 *       {isLoading ? 'Checking...' : isAvailable ? 'Available' : 'Not available'}
 *     </div>
 *   );
 * }
 * ```
 */
export const useCheckAvailability = (
  params: AvailabilityParams,
  enabled = true
): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => bookingsService.checkAvailability(params),
    enabled: !!params.facilityId && !!params.startTime && !!params.endTime && enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
  });
};

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
