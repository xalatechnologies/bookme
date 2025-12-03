/**
 * Features Barrel Export
 *
 * Central export for all feature-based components
 * Note: Selective exports are used to avoid naming conflicts
 * between feature modules that export constants with identical names.
 */

// Auth
export {
  ProtectedRoute,
  RequireAuth,
  RequireRole,
  RoleGuard,
  AdminOnly,
  StaffOnly,
  OwnerOnly,
  PlatformAdminOnly,
  PermissionGuard,
  CanCreate,
  CanUpdate,
  CanDelete,
  CanManage,
} from './auth';
export type * from './auth/types';

// Bookings
export {
  BookingForm,
  StepByStepBooking,
  RecurringBookingModal,
  BookingCard,
  BookingDetailsPanel,
  RecurringBookingGroup,
  BookingFiltersBar,
} from './bookings';
export type * from './bookings/types';

// Calendar
export {
  EnhancedCalendar,
  FacilityCalendar,
  SimpleCalendar,
  CalendarView,
  CalendarViewSimple,
  EventTooltip,
} from './calendar';
export type * from './calendar/types';

// Dashboard
export * from './dashboard/admin';
export * from './dashboard/user';
export type * from './dashboard/types';

// Facilities
export * from './facilities/components/FacilityCard';
export * from './facilities/components/FacilityDetail/FacilityDetailLayout';
export * from './facilities/components/FacilityImageGallery/GalleryGrid';
export * from './facilities/components/FacilityEditForm/FacilityEditForm';
export * from './facilities/components/FacilityMap/MapContainer';
export type * from './facilities/types';

// Messaging
export {
  MessageInbox,
  MessageThread,
  CreateThreadModal,
} from './messaging';
export type * from './messaging/types';

// Search
export {
  GlobalSearch,
  AdminSearchField,
  UserSearchField,
  SearchFilter,
  SearchFilters,
  ViewHeader,
  ViewModeToggle,
} from './search';
export type * from './search/types';

// Support
export {
  SupportTicketForm,
  SupportTicketList,
} from './support';
export type * from './support/types';