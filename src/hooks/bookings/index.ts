/**
 * Booking Hooks
 *
 * Centralized exports for all booking-related hooks.
 */

// Page-level hook (main export)
export { useBookingListPage } from './useBookingListPage';
export type { BookingListPageState } from './useBookingListPage';

// Business logic hooks (can be used independently)
export { useBookingFilters } from './useBookingFilters';
export type { BookingFilters } from './useBookingFilters';

export { useBookingStats, useBookingStatusStats } from './useBookingStats';
export type { BookingStats } from './useBookingStats';

export {
  useRecurringBookingGroups,
  useHasRecurringBookings,
  useStandaloneBookings,
} from './useRecurringBookingGroups';
export type { RecurringBookingGroup } from './useRecurringBookingGroups';
