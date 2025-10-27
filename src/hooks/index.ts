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
