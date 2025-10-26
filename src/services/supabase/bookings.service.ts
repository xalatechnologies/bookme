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

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases
type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
type Facility = Database['public']['Tables']['facilities']['Row'];
type Zone = Database['public']['Tables']['zones']['Row'];

/**
 * Booking with related data
 */
export interface BookingWithDetails extends Booking {
  readonly facility?: Facility;
  readonly zone?: Zone | null;
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
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as BookingWithDetails[];
  },

  /**
   * Fetch bookings for an organization
   */
  async getOrgBookings(orgId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities!inner (*)
      `)
      .eq('facility.org_id', orgId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data as BookingWithDetails[];
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
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('end_time', endDate);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

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
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data;
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
   * Check availability for a time slot
   * Uses RPC function from backend
   */
  async checkAvailability(params: AvailabilityParams): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_availability', {
      p_facility_id: params.facilityId,
      p_zone_id: params.zoneId || null,
      p_start_time: params.startTime,
      p_end_time: params.endTime,
    });

    if (error) {
      console.error('Availability check error:', error);
      throw error;
    }

    return data as boolean;
  },

  /**
   * Get upcoming bookings for a user
   */
  async getUpcoming(userId: string, limit = 10): Promise<BookingWithDetails[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('user_id', userId)
      .gte('start_time', now)
      .in('status', ['pending', 'awaiting_payment', 'paid'])
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as BookingWithDetails[];
  },

  /**
   * Get past bookings for a user
   */
  async getPast(userId: string, limit = 20): Promise<BookingWithDetails[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('user_id', userId)
      .lt('end_time', now)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as BookingWithDetails[];
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
    mutationFn: bookingsService.create,
    onSuccess: (newBooking) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });

      // Add to cache
      queryClient.setQueryData(bookingKeys.detail(newBooking.id), newBooking);
    },
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
export const useCancelBooking = (): UseMutationResult<Booking, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsService.cancel,
    onSuccess: (cancelledBooking, id) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });

      // Update cache
      queryClient.setQueryData(bookingKeys.detail(id), cancelledBooking);
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
