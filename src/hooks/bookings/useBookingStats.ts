/**
 * Booking Statistics Hook
 *
 * Calculates statistics from booking data.
 * Pure business logic with no side effects.
 */

import { useMemo } from 'react';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];

export interface BookingStats {
  readonly total: number;
  readonly pending: number;
  readonly awaitingPayment: number;
  readonly paid: number;
  readonly completed: number;
  readonly cancelled: number;
  readonly expired: number;
  readonly refunded: number;
  readonly upcoming: number;
  readonly past: number;
  readonly totalRevenue: number;
  readonly completedRevenue: number;
  readonly pendingRevenue: number;
}

/**
 * Calculate statistics from bookings
 *
 * @example
 * ```tsx
 * const { data: bookings } = useUserBookings(userId);
 * const stats = useBookingStats(bookings);
 *
 * return (
 *   <div>
 *     <p>Total: {stats.total}</p>
 *     <p>Upcoming: {stats.upcoming}</p>
 *     <p>Revenue: {formatCurrency(stats.totalRevenue)}</p>
 *   </div>
 * );
 * ```
 */
export function useBookingStats(
  bookings: BookingWithDetails[] | undefined
): BookingStats {
  return useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        total: 0,
        pending: 0,
        awaitingPayment: 0,
        paid: 0,
        completed: 0,
        cancelled: 0,
        expired: 0,
        refunded: 0,
        upcoming: 0,
        past: 0,
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
      };
    }

    const now = new Date();

    // Initialize counters
    let pending = 0;
    let awaitingPayment = 0;
    let paid = 0;
    let completed = 0;
    let cancelled = 0;
    let expired = 0;
    let refunded = 0;
    let upcoming = 0;
    let past = 0;
    let totalRevenue = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;

    // Calculate statistics
    bookings.forEach(booking => {
      // Status counts
      switch (booking.status) {
        case 'pending':
          pending++;
          pendingRevenue += booking.total_cents;
          break;
        case 'awaiting_payment':
          awaitingPayment++;
          pendingRevenue += booking.total_cents;
          break;
        case 'paid':
          paid++;
          totalRevenue += booking.total_cents;
          break;
        case 'completed':
          completed++;
          totalRevenue += booking.total_cents;
          completedRevenue += booking.total_cents;
          break;
        case 'cancelled':
          cancelled++;
          break;
        case 'expired':
          expired++;
          break;
        case 'refunded':
          refunded++;
          break;
      }

      // Time-based counts
      const startsAt = new Date(booking.starts_at);
      const endsAt = new Date(booking.ends_at);

      if (startsAt >= now) {
        upcoming++;
      } else if (endsAt < now) {
        past++;
      }
    });

    return {
      total: bookings.length,
      pending,
      awaitingPayment,
      paid,
      completed,
      cancelled,
      expired,
      refunded,
      upcoming,
      past,
      totalRevenue,
      completedRevenue,
      pendingRevenue,
    };
  }, [bookings]);
}

/**
 * Get status-specific statistics
 */
export function useBookingStatusStats(
  bookings: BookingWithDetails[] | undefined,
  status: BookingStatus
): {
  readonly count: number;
  readonly revenue: number;
} {
  return useMemo(() => {
    if (!bookings) {
      return { count: 0, revenue: 0 };
    }

    const filtered = bookings.filter(b => b.status === status);
    const revenue = filtered.reduce((sum, b) => sum + b.total_cents, 0);

    return {
      count: filtered.length,
      revenue,
    };
  }, [bookings, status]);
}
