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
    new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  );

  // Calculate average interval in days
  let totalDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].starts_at);
    const curr = new Date(sorted[i].starts_at);
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
 * Generate a group ID for bookings that should be grouped but don't have a recurring_booking_id
 */
function generateGroupId(booking: BookingWithDetails): string {
  // For bookings with recurring_booking_id, use that
  if (booking.recurring_booking_id) {
    return booking.recurring_booking_id;
  }
  
  // For bookings marked as recurring but without a recurring_booking_id,
  // create a group ID based on facility, purpose, and time pattern
  if (booking.is_recurring) {
    const facilityId = booking.facility_id || 'unknown';
    const purpose = booking.notes || 'unknown';
    const startTime = new Date(booking.starts_at).toTimeString().substring(0, 5);
    const endTime = new Date(booking.ends_at).toTimeString().substring(0, 5);
    
    return `generated_group_${facilityId}_${purpose}_${startTime}_${endTime}`;
  }
  
  // For non-recurring bookings, return the booking ID to keep them separate
  return booking.id;
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

    // Group bookings by recurring_booking_id or generated group ID
    bookings.forEach(booking => {
      // Only group bookings that are marked as recurring or have a recurring_booking_id
      if (booking.is_recurring || booking.recurring_booking_id) {
        const groupId = generateGroupId(booking);
        
        const existing = groups.get(groupId);
        if (existing) {
          existing.push(booking);
        } else {
          groups.set(groupId, [booking]);
        }
      }
    });

    // Transform groups into RecurringBookingGroup objects
    return Array.from(groups.entries()).map(([recurringId, groupBookings]) => {
      // Sort bookings by start time
      const sorted = [...groupBookings].sort((a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      );

      // Find next upcoming booking
      const nextBooking = sorted.find(b => new Date(b.starts_at) >= now) || null;

      // Count upcoming and completed
      const upcomingCount = sorted.filter(b => new Date(b.starts_at) >= now).length;
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

      return new Date(a.nextBooking.starts_at).getTime() -
             new Date(b.nextBooking.starts_at).getTime();
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
    return bookings.some(b => b.is_recurring || b.recurring_booking_id !== null);
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
    return bookings.filter(b => !b.is_recurring && !b.recurring_booking_id);
  }, [bookings]);
}