/**
 * Hooks Index
 *
 * Centralized export point for all custom hooks
 */

// Modal management
export { useModal } from './useModal';
export type { UseModalReturn } from './useModal';

// Real-time subscriptions
export {
  useRealtimeBookings,
  useRealtimeUserBookings,
  useRealtimeOrgBookings,
} from './useRealtimeBookings';

export {
  useRealtimeMessages,
  useRealtimeThreads,
  useRealtimeUnreadCount,
} from './useRealtimeMessages';

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

// Messaging management
export { useMessaging } from './useMessaging';
export type { MessageFilterStatus } from './useMessaging';

// Support tickets management
export { useTickets } from './useTickets';
export type { TicketStatusFilter, TicketPriorityFilter } from './useTickets';

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
