/**
 * Recurring Booking Groups Hook
 *
 * Groups recurring bookings together for display.
 * Pure business logic with no side effects.
 */

import { useMemo } from 'react';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

export interface RecurringBookingGroup {
  readonly recurringId: string;
  readonly bookings: BookingWithDetails[];
  readonly facilityName: string;
  readonly zoneName: string | null;
  readonly frequency: 'weekly' | 'biweekly' | 'monthly' | 'unknown';
  readonly nextBooking: BookingWithDetails | null;
  readonly totalBookings: number;
  readonly upcomingCount: number;
  readonly completedCount: number;
}

/**
 * Detect booking frequency based on time intervals
 */
function detectFrequency(bookings: BookingWithDetails[]): 'weekly' | 'biweekly' | 'monthly' | 'unknown' {
  if (bookings.length < 2) return 'unknown';

  // Sort by start time
  const sorted = [...bookings].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Calculate average interval in days
  let totalDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].start_time);
    const curr = new Date(sorted[i].start_time);
    const days = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    totalDays += days;
  }

  const avgDays = totalDays / (sorted.length - 1);

  // Classify based on average interval
  if (avgDays >= 6 && avgDays <= 8) return 'weekly';
  if (avgDays >= 13 && avgDays <= 15) return 'biweekly';
  if (avgDays >= 28 && avgDays <= 32) return 'monthly';

  return 'unknown';
}

/**
 * Group recurring bookings together
 *
 * @example
 * ```tsx
 * const { data: bookings } = useUserBookings(userId);
 * const groups = useRecurringBookingGroups(bookings);
 *
 * return (
 *   <div>
 *     {groups.map(group => (
 *       <RecurringBookingCard key={group.recurringId} group={group} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useRecurringBookingGroups(
  bookings: BookingWithDetails[] | undefined
): RecurringBookingGroup[] {
  return useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    const now = new Date();
    const groups = new Map<string, BookingWithDetails[]>();

    // Group bookings by recurring_booking_id
    bookings.forEach(booking => {
      if (!booking.recurring_booking_id) return;

      const existing = groups.get(booking.recurring_booking_id);
      if (existing) {
        existing.push(booking);
      } else {
        groups.set(booking.recurring_booking_id, [booking]);
      }
    });

    // Transform groups into RecurringBookingGroup objects
    return Array.from(groups.entries()).map(([recurringId, groupBookings]) => {
      // Sort bookings by start time
      const sorted = [...groupBookings].sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

      // Find next upcoming booking
      const nextBooking = sorted.find(b => new Date(b.start_time) >= now) || null;

      // Count upcoming and completed
      const upcomingCount = sorted.filter(b => new Date(b.start_time) >= now).length;
      const completedCount = sorted.filter(b => b.status === 'completed').length;

      // Get facility and zone names from first booking
      const firstBooking = sorted[0];
      const facilityName = firstBooking.facility?.name || 'Unknown Facility';
      const zoneName = firstBooking.zone?.name || null;

      // Detect frequency
      const frequency = detectFrequency(sorted);

      return {
        recurringId,
        bookings: sorted,
        facilityName,
        zoneName,
        frequency,
        nextBooking,
        totalBookings: sorted.length,
        upcomingCount,
        completedCount,
      };
    }).sort((a, b) => {
      // Sort groups by next booking date (groups with upcoming bookings first)
      if (!a.nextBooking && !b.nextBooking) return 0;
      if (!a.nextBooking) return 1;
      if (!b.nextBooking) return -1;

      return new Date(a.nextBooking.start_time).getTime() -
             new Date(b.nextBooking.start_time).getTime();
    });
  }, [bookings]);
}

/**
 * Check if bookings contain any recurring groups
 */
export function useHasRecurringBookings(
  bookings: BookingWithDetails[] | undefined
): boolean {
  return useMemo(() => {
    if (!bookings) return false;
    return bookings.some(b => b.recurring_booking_id !== null);
  }, [bookings]);
}

/**
 * Get standalone (non-recurring) bookings
 */
export function useStandaloneBookings(
  bookings: BookingWithDetails[] | undefined
): BookingWithDetails[] {
  return useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => !b.recurring_booking_id);
  }, [bookings]);
}
