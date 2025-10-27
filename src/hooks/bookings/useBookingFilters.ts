/**
 * Booking Filters Hook
 *
 * Filters and sorts bookings based on various criteria.
 * Pure business logic with no side effects.
 */

import { useMemo } from 'react';
import type { Database } from '@/types/database';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

type BookingStatus = Database['public']['Enums']['booking_status'];

export interface BookingFilters {
  status?: BookingStatus | 'all';
  facilityId?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'past' | 'upcoming';
  search?: string;
  sortBy?: 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'created';
}

/**
 * Filter and sort bookings based on provided criteria
 *
 * @example
 * ```tsx
 * const { data: bookings } = useUserBookings(userId);
 * const filtered = useBookingFilters(bookings, {
 *   status: 'paid',
 *   dateRange: 'upcoming',
 *   sortBy: 'date-asc'
 * });
 * ```
 */
export function useBookingFilters(
  bookings: BookingWithDetails[] | undefined,
  filters: BookingFilters
): BookingWithDetails[] {
  return useMemo(() => {
    if (!bookings) return [];

    let result = [...bookings];
    const now = new Date();

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(b => b.status === filters.status);
    }

    // Facility filter
    if (filters.facilityId) {
      result = result.filter(b => b.facility_id === filters.facilityId);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      switch (filters.dateRange) {
        case 'today': {
          const today = now.toDateString();
          result = result.filter(b =>
            new Date(b.start_time).toDateString() === today
          );
          break;
        }
        case 'week': {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          result = result.filter(b => {
            const startTime = new Date(b.start_time);
            return startTime >= now && startTime <= weekFromNow;
          });
          break;
        }
        case 'month': {
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          result = result.filter(b => {
            const startTime = new Date(b.start_time);
            return startTime.getMonth() === currentMonth &&
                   startTime.getFullYear() === currentYear;
          });
          break;
        }
        case 'past': {
          result = result.filter(b => new Date(b.end_time) < now);
          break;
        }
        case 'upcoming': {
          result = result.filter(b => new Date(b.start_time) >= now);
          break;
        }
      }
    }

    // Search filter (facility name or booking ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(b => {
        const facilityName = b.facility?.name?.toLowerCase() || '';
        const bookingId = b.id.toLowerCase();
        return facilityName.includes(searchLower) || bookingId.includes(searchLower);
      });
    }

    // Sorting
    switch (filters.sortBy) {
      case 'date-asc':
        result.sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        break;
      case 'date-desc':
        result.sort((a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        break;
      case 'price-asc':
        result.sort((a, b) => a.total_price_cents - b.total_price_cents);
        break;
      case 'price-desc':
        result.sort((a, b) => b.total_price_cents - a.total_price_cents);
        break;
      case 'created':
        result.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        // Default: sort by start time ascending
        result.sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
    }

    return result;
  }, [bookings, filters]);
}
