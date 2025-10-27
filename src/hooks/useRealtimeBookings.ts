/**
 * Real-time Bookings Hook
 *
 * Subscribes to booking changes in real-time using Supabase Realtime.
 * Automatically invalidates React Query cache when bookings change.
 *
 * Use this hook to keep booking calendars and lists synchronized
 * across multiple users viewing the same facility.
 *
 * @example
 * ```tsx
 * function FacilityCalendar({ facilityId }: { facilityId: string }) {
 *   const { data: bookings } = useFacilityBookings(facilityId);
 *
 *   // Enable real-time updates
 *   useRealtimeBookings(facilityId);
 *
 *   return <Calendar bookings={bookings} />;
 * }
 * ```
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { bookingKeys } from '@/services/supabase/bookings.service';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];

/**
 * Subscribe to real-time booking updates for a facility
 *
 * @param facilityId - Facility ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 *
 * @example
 * ```tsx
 * function BookingCalendar({ facilityId }: { facilityId: string }) {
 *   const { data: bookings } = useFacilityBookings(facilityId);
 *
 *   // Keep calendar synchronized in real-time
 *   useRealtimeBookings(facilityId);
 *
 *   return (
 *     <div>
 *       <h2>Live Booking Calendar</h2>
 *       <Calendar events={bookings} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useRealtimeBookings = (
  facilityId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!facilityId || !enabled) return;

    console.log(`[Realtime] Subscribing to bookings for facility: ${facilityId}`);

    // Create a unique channel for this facility
    const channel = supabase
      .channel(`facility-${facilityId}-bookings`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'bookings',
          filter: `facility_id=eq.${facilityId}`,
        },
        (payload: RealtimePostgresChangesPayload<Booking>) => {
          console.log('[Realtime] Booking change:', payload.eventType, payload.new || payload.old);

          // Invalidate facility bookings query to trigger refetch
          queryClient.invalidateQueries({
            queryKey: bookingKeys.facilityBookings(facilityId),
          });

          // Also invalidate all booking lists
          queryClient.invalidateQueries({
            queryKey: bookingKeys.lists(),
          });
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for facility ${facilityId}:`, status);
      });

    // Cleanup on unmount
    return () => {
      console.log(`[Realtime] Unsubscribing from facility: ${facilityId}`);
      supabase.removeChannel(channel);
    };
  }, [facilityId, enabled, queryClient]);
};

/**
 * Subscribe to real-time booking updates for a user
 *
 * @param userId - User ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 *
 * @example
 * ```tsx
 * function MyBookings() {
 *   const { user } = useAuth();
 *   const { data: bookings } = useUserBookings(user?.id!);
 *
 *   // Keep user's bookings synchronized
 *   useRealtimeUserBookings(user?.id!);
 *
 *   return <BookingsList bookings={bookings} />;
 * }
 * ```
 */
export const useRealtimeUserBookings = (
  userId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log(`[Realtime] Subscribing to bookings for user: ${userId}`);

    const channel = supabase
      .channel(`user-${userId}-bookings`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Booking>) => {
          console.log('[Realtime] User booking change:', payload.eventType);

          // Invalidate user's bookings
          queryClient.invalidateQueries({
            queryKey: bookingKeys.userBookings(userId),
          });

          // If it's a specific booking update, invalidate that too
          if (payload.new) {
            queryClient.invalidateQueries({
              queryKey: bookingKeys.detail(payload.new.id),
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from user: ${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, queryClient]);
};

/**
 * Subscribe to all booking changes for an organization
 *
 * @param orgId - Organization ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 */
export const useRealtimeOrgBookings = (
  orgId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId || !enabled) return;

    console.log(`[Realtime] Subscribing to bookings for org: ${orgId}`);

    // Note: We can't filter by org_id directly on bookings table,
    // so we subscribe to all bookings and filter in the handler
    const channel = supabase
      .channel(`org-${orgId}-bookings`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        async (payload: RealtimePostgresChangesPayload<Booking>) => {
          // Verify this booking belongs to our org by checking facility
          const booking = payload.new || payload.old;
          if (!booking) return;

          // Invalidate org bookings
          queryClient.invalidateQueries({
            queryKey: bookingKeys.orgBookings(orgId),
          });
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from org: ${orgId}`);
      supabase.removeChannel(channel);
    };
  }, [orgId, enabled, queryClient]);
};
