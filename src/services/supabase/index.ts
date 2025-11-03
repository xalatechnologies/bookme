/**
 * Supabase Services Index
 *
 * Centralized export point for all Supabase services
 */

// ============================================================================
// Core Infrastructure
// ============================================================================

export { supabase, isAuthenticated, getCurrentUserId, getCurrentUserOrgId } from './client';

export type {
  Database,
  Tables,
  Insertable,
  Updatable,
  Enums,
  ServiceResponse,
  PaginatedResponse,
  PaginationParams,
  DateRangeFilter,
  SortParams,
  // Entity types
  Booking,
  BookingInsert,
  BookingUpdate,
  Facility,
  FacilityInsert,
  FacilityUpdate,
  Zone,
  ZoneInsert,
  ZoneUpdate,
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  AdditionalService,
  BookingService,
  Favorite,
  Review,
  Message,
  MessageThread,
  Notification,
  RecurringBooking,
  Group,
  GroupMember,
  // Enum types
  BookingStatus,
  FacilityStatus,
  UserRole,
  PaymentStatus,
  NotificationType,
  // Extended types
  BookingWithDetails,
  FacilityWithZones,
  UserProfileWithOrg,
  ReviewWithDetails,
  MessageWithSender,
  ThreadWithDetails,
  GroupWithMembers,
  RecurringBookingWithOccurrences,
  // Filter types
  BookingFilters,
  FacilityFilters,
  UserFilters,
  MessageFilters,
  NotificationFilters,
} from './types';

export {
  ServiceError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  DatabaseError,
  RateLimitError,
  NetworkError,
  TransactionError,
  TimeoutError,
  handleSupabaseError,
  isServiceError,
  getErrorMessage,
  logError,
} from './errors';

export { BaseService } from './base.service';

// ============================================================================
// Authentication
// ============================================================================

export {
  authService,
  AuthService,
  type SignUpParams,
  type SignInParams,
  type ResetPasswordParams,
  type UpdatePasswordParams,
  type UpdateProfileParams,
  type AuthResponse,
} from './auth.service';

// ============================================================================
// Core Domain Services
// ============================================================================

// Users
export {
  usersService,
  UsersService,
  type UserSearchParams,
  type UpdateUserRoleParams,
  type UserPreferences,
} from './users.service';

// Organizations
export {
  organizationsService,
  OrganizationsService,
  type OrganizationWithDetails,
  type OrganizationSettings,
  type OrganizationStats,
} from './organizations.service';

// Facilities
export {
  facilitiesService,
  facilityKeys,
  useFacilities,
  usePublishedFacilities,
  useFacility,
  useFacilityWithZones,
  useCreateFacility,
  useUpdateFacility,
  useDeleteFacility,
  useSearchFacilities,
} from './facilities.service';

// Bookings
export {
  bookingsService,
  bookingKeys,
  useUserBookings,
  useOrgBookings,
  useFacilityBookings,
  useBooking,
  useUpcomingBookings,
  usePastBookings,
  useCreateBooking,
  useUpdateBooking,
  useCancelBooking,
  useCheckAvailability,
  type AvailabilityParams,
} from './bookings.service';

// Zones
export {
  zonesService,
  zoneKeys,
  useFacilityZones,
  useZone,
  useZoneWithAvailability,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useCheckZoneAvailability,
  useZoneAvailabilityForDate,
  type ZoneWithAvailability,
} from './zones.service';

// ============================================================================
// Feature Services
// ============================================================================

// Cart
export {
  cartService,
  CartService,
  type CartItem,
  type CartItemService,
  type CartItemWithDetails,
  type Cart,
  type CartSummary,
  type AddToCartParams,
} from './cart.service';

// Favorites
export {
  favoritesService,
  favoriteKeys,
  useFavorites,
  useIsFavorite,
  useAddFavorite,
  useRemoveFavorite,
  useToggleFavorite,
  type FavoriteWithFacility,
} from './favorites.service';

// Reviews
export {
  reviewsService,
  ReviewsService,
  type CreateReviewParams,
  type UpdateReviewParams,
  type ReviewFilters,
  type FacilityRatingStats,
} from './reviews.service';

// Messages
export {
  messagesService,
  messageKeys,
  useUserThreads,
  useThread,
  useThreadMessages,
  useUnreadCount,
  useMessageTemplates,
  useCreateThread,
  useSendMessage,
  useMarkAsRead,
  useUploadAttachment,
  type MessageWithDetails,
} from './messages.service';

// Recurring Bookings
export {
  recurringService,
  recurringKeys,
  useUserRecurring,
  useRecurringBooking,
  useRecurringOccurrences,
  usePendingOccurrences,
  useCreateRecurring,
  useUpdateRecurring,
  usePauseRecurring,
  useResumeRecurring,
  useCancelRecurring,
  useConfirmOccurrence,
  useSkipOccurrence,
  useCancelOccurrence,
} from './recurring.service';

// Support Tickets
export {
  supportService,
  supportKeys,
  useUserTickets,
  useOrgTickets,
  useTicket,
  useTicketMessages,
  useOpenTickets,
  useClosedTickets,
  useCreateTicket,
  useUpdateTicketStatus,
  useUpdateTicket,
  useAssignTicket,
  useAddTicketMessage,
  useCloseTicket,
  useReopenTicket,
  type TicketWithMessages,
} from './support.service';

// Notifications
export {
  notificationsService,
  notificationKeys,
  useNotifications,
  useUnreadNotifications,
  useUnreadNotificationCount,
  useNotificationsByType,
  useUrgentNotifications,
  useCreateNotification,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from './notifications.service';
