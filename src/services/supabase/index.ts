/**
 * Supabase Services Index
 *
 * Centralized export point for all Supabase services
 */

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
  type FacilityWithZones,
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
  type BookingWithDetails,
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

// Groups
export {
  groupsService,
  groupKeys,
  useUserGroups,
  useGroup,
  useUserInvitations,
  useGroupBookings,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useInviteUser,
  useAcceptInvitation,
  useUpdateMemberRole,
  useRemoveMember,
  type GroupWithMembers,
} from './groups.service';

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
  type RecurringBookingWithOccurrences,
} from './recurring.service';

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
  type ThreadWithDetails,
  type MessageWithDetails,
} from './messages.service';

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
