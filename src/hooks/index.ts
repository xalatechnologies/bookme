/**
 * Hooks Index
 *
 * Centralized export point for all custom hooks
 */

// Shared utility hooks
export * from './shared';

// Real-time subscriptions
export {
  useRealtimeBookings,
  useRealtimeUserBookings,
  useRealtimeOrgBookings,
} from './useRealtimeBookings';

export {
  useRealtimeNotifications,
  useRealtimeNotificationCount,
  useRealtimeUrgentNotifications,
  showBrowserNotification,
  requestNotificationPermission,
} from './useRealtimeNotifications';

// Reviews management
export { useReviews } from './useReviews';
export type { Review, ReviewFilter, ReviewSortBy } from './useReviews';

// Re-export existing hooks if any
// export * from './useAvailabilityStatus';
// export * from './useCalendarEnhancements';
// export * from './useCalendarEvents';
// export * from './useCalendarView';
// export * from './useDragSelection';
// export * from './useFacility';
// export * from './useHistory';
// export * from './useOfflineStatus';
// export * from './useSlotSelection';
// export * from './useZones';
