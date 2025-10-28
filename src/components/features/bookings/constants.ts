/**
 * Bookings Feature Constants
 * 
 * Centralized constants for booking functionality including:
 * - Status mappings
 * - Actor and activity types
 * - Localization keys
 * - RBAC permissions
 * - Design tokens
 * - Animation settings
 */

import type { ActorType, ActivityType, BookingType } from './types';

// ============================================================================
// BOOKING STATUS
// ============================================================================

/**
 * Booking Status Types
 * Aligned with database enum booking_status
 */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAID: 'paid',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

/**
 * Booking Status Variant Mapping
 * Maps booking statuses to StatusBadge variants
 */
export const BOOKING_STATUS_VARIANT = {
  [BOOKING_STATUS.PENDING]: 'pending',
  [BOOKING_STATUS.APPROVED]: 'success',
  [BOOKING_STATUS.REJECTED]: 'error',
  [BOOKING_STATUS.CANCELLED]: 'error',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.AWAITING_PAYMENT]: 'warning',
  [BOOKING_STATUS.PAID]: 'success',
} as const;

// ============================================================================
// ACTOR & ACTIVITY TYPES
// ============================================================================

/**
 * Actor Types
 * Different actor types for pricing calculation
 */
export const ACTOR_TYPES: readonly ActorType[] = [
  'private-person',
  'lag-foreninger',
  'paraply',
  'private-firma',
  'kommunale-enheter',
] as const;

/**
 * Activity Types
 * Different activity categories for bookings
 */
export const ACTIVITY_TYPES: readonly ActivityType[] = [
  'sport',
  'kultur',
  'møte',
  'arrangement',
  'trening',
  'annet',
] as const;

/**
 * Booking Types
 */
export const BOOKING_TYPES: readonly BookingType[] = [
  'one-time',
  'recurring',
] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default Booking Values
 */
export const DEFAULT_BOOKING = {
  BOOKING_TYPE: 'one-time' as BookingType,
  ATTENDEES: 1,
  PURPOSE: '',
  ADDITIONAL_INFO: '',
  TERMS_ACCEPTED: false,
  ACTIVITY_TYPE: '' as ActivityType | '',
  ACTOR_TYPE: '' as ActorType | '',
} as const;

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Time Slot Configuration
 */
export const TIME_SLOT_CONFIG = {
  DEFAULT_DURATION: 60, // minutes
  MIN_DURATION: 30,
  MAX_DURATION: 480, // 8 hours
  SLOT_INTERVAL: 30, // minutes between start times
} as const;

/**
 * Pricing Configuration
 */
export const PRICING_CONFIG = {
  VAT_RATE: 0.25, // 25% VAT
  DEFAULT_PRICE_PER_HOUR: 500, // NOK
  MIN_PRICE: 0,
  MAX_PRICE: 10000,
} as const;

/**
 * Booking Form Validation
 */
export const VALIDATION = {
  MIN_ATTENDEES: 1,
  MAX_ATTENDEES: 1000,
  MIN_PURPOSE_LENGTH: 3,
  MAX_PURPOSE_LENGTH: 500,
  MAX_ADDITIONAL_INFO_LENGTH: 1000,
} as const;

/**
 * Recurrence Limits
 */
export const RECURRENCE_LIMITS = {
  MAX_OCCURRENCES: 52, // Maximum 1 year of weekly bookings
  MAX_DATE_RANGE_DAYS: 365, // Maximum 1 year date range
} as const;

/**
 * UI Display Limits
 */
export const DISPLAY_LIMITS = {
  MAX_VISIBLE_SLOTS: 10,
  MAX_VISIBLE_BOOKINGS: 20,
  ITEMS_PER_PAGE: 10,
} as const;

// ============================================================================
// LOCALIZATION (i18n)
// ============================================================================

/**
 * Translation Namespace
 * Use 'bookings' namespace for all booking-related translations
 */
export const I18N_NAMESPACE = 'bookings' as const;

/**
 * Translation Keys
 * Centralized translation keys for bookings domain
 * 
 * Usage:
 * const { t } = useTranslation('booking');
 * <h1>{t(BOOKING_I18N_KEYS.TITLE)}</h1>
 */
export const BOOKING_I18N_KEYS = {
  // Page titles
  TITLE: 'title',
  MY_BOOKINGS: 'myBookings.title',
  CREATE_BOOKING: 'create.title',
  BOOKING_DETAILS: 'details.title',
  
  // Status labels
  STATUS: {
    PENDING: 'status.pending',
    APPROVED: 'status.approved',
    REJECTED: 'status.rejected',
    CANCELLED: 'status.cancelled',
    COMPLETED: 'status.completed',
    AWAITING_PAYMENT: 'status.awaitingPayment',
    PAID: 'status.paid',
  },
  
  // Actor types
  ACTOR_TYPE: {
    PRIVATE_PERSON: 'actorType.privatePerson',
    LAG_FORENINGER: 'actorType.lagForeninger',
    PARAPLY: 'actorType.paraply',
    PRIVATE_FIRMA: 'actorType.privateFirma',
    KOMMUNALE_ENHETER: 'actorType.kommunaleEnheter',
  },
  
  // Activity types
  ACTIVITY_TYPE: {
    SPORT: 'activityType.sport',
    KULTUR: 'activityType.kultur',
    MØTE: 'activityType.mote',
    ARRANGEMENT: 'activityType.arrangement',
    TRENING: 'activityType.trening',
    ANNET: 'activityType.annet',
  },
  
  // Form labels
  FORM: {
    PURPOSE: 'form.purpose',
    ATTENDEES: 'form.attendees',
    ACTIVITY_TYPE: 'form.activityType',
    ACTOR_TYPE: 'form.actorType',
    ADDITIONAL_INFO: 'form.additionalInfo',
    TERMS_ACCEPTED: 'form.termsAccepted',
    BOOKING_TYPE: 'form.bookingType',
  },
  
  // Actions
  ACTIONS: {
    CREATE: 'actions.create',
    EDIT: 'actions.edit',
    CANCEL: 'actions.cancel',
    DELETE: 'actions.delete',
    VIEW_DETAILS: 'actions.viewDetails',
    ADD_TO_CART: 'actions.addToCart',
    COMPLETE_BOOKING: 'actions.completeBooking',
  },
  
  // Messages
  MESSAGES: {
    CREATE_SUCCESS: 'messages.createSuccess',
    CREATE_ERROR: 'messages.createError',
    CANCEL_SUCCESS: 'messages.cancelSuccess',
    CANCEL_ERROR: 'messages.cancelError',
    LOADING: 'messages.loading',
    NO_BOOKINGS: 'messages.noBookings',
  },
} as const;

// ============================================================================
// RBAC & PERMISSIONS
// ============================================================================

/**
 * Booking Permissions
 * Required roles/permissions for booking actions
 */
export const BOOKING_PERMISSIONS = {
  // View permissions
  VIEW_OWN: ['user', 'facility_manager', 'admin'], // View own bookings
  VIEW_ALL: ['facility_manager', 'admin'], // View all bookings
  
  // Create permissions
  CREATE_BOOKING: ['user', 'facility_manager', 'admin'], // Create new booking
  CREATE_ON_BEHALF: ['facility_manager', 'admin'], // Create booking for others
  
  // Edit permissions
  EDIT_OWN: ['user', 'facility_manager', 'admin'], // Edit own bookings
  EDIT_ALL: ['facility_manager', 'admin'], // Edit any booking
  
  // Cancel permissions
  CANCEL_OWN: ['user', 'facility_manager', 'admin'], // Cancel own booking
  CANCEL_ALL: ['facility_manager', 'admin'], // Cancel any booking
  
  // Approval permissions
  APPROVE: ['facility_manager', 'admin'], // Approve pending bookings
  REJECT: ['facility_manager', 'admin'], // Reject bookings
  
  // Administrative
  VIEW_STATS: ['facility_manager', 'admin'], // View booking statistics
  EXPORT_DATA: ['facility_manager', 'admin'], // Export booking data
  MANAGE_RECURRING: ['facility_manager', 'admin'], // Manage recurring bookings
} as const;

/**
 * Helper to check if user has permission
 */
export function hasBookingPermission(
  userRoles: string[],
  requiredPermission: keyof typeof BOOKING_PERMISSIONS
): boolean {
  const allowedRoles = BOOKING_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

/**
 * Booking Component Design Tokens
 * Consistent styling across booking components
 */
export const BOOKING_DESIGN = {
  // Card styling
  CARD: {
    BASE: 'rounded-lg border border-gray-200 bg-white shadow-sm',
    HOVER: 'hover:shadow-md transition-shadow',
    PADDING: 'p-4',
  },
  
  // Status colors (matches StatusBadge)
  STATUS_COLORS: {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    AWAITING_PAYMENT: 'bg-orange-100 text-orange-800',
    PAID: 'bg-green-100 text-green-800',
  },
  
  // Typography
  TYPOGRAPHY: {
    TITLE: 'text-2xl font-bold text-gray-900',
    SUBTITLE: 'text-lg font-semibold text-gray-700',
    BODY: 'text-base text-gray-600',
    CAPTION: 'text-sm text-gray-500',
    LABEL: 'text-sm font-medium text-gray-700',
  },
  
  // Spacing
  SPACING: {
    SECTION: 'space-y-6',
    CARD_GRID: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
    FORM: 'space-y-4',
  },
  
  // Buttons
  BUTTON: {
    PRIMARY: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500',
    SECONDARY: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    DANGER: 'bg-red-600 text-white hover:bg-red-700',
    BASE: 'px-4 py-2 rounded-md font-medium transition-colors',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

/**
 * Animation Constants
 * Consistent animations across booking components
 */
export const BOOKING_ANIMATIONS = {
  // Duration (milliseconds)
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Tailwind transition classes
  TRANSITIONS: {
    DEFAULT: 'transition-all duration-300 ease-in-out',
    FAST: 'transition-all duration-150 ease-in-out',
    SLOW: 'transition-all duration-500 ease-in-out',
    COLORS: 'transition-colors duration-300',
    SHADOW: 'transition-shadow duration-300',
  },
  
  // Framer Motion variants
  VARIANTS: {
    FADE_IN: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    SLIDE_UP: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    SCALE: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
    },
  },
  
  // Loading skeleton
  SKELETON: 'animate-pulse bg-gray-200 rounded',
} as const;

// ============================================================================
// PERFORMANCE
// ============================================================================

/**
 * Performance Configuration
 * Settings for optimization
 */
export const BOOKING_PERFORMANCE = {
  // TanStack Query cache times (milliseconds)
  CACHE: {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes
    REFETCH_INTERVAL: 30 * 1000, // 30 seconds for active bookings
  },
  
  // Debounce delays (milliseconds)
  DEBOUNCE: {
    SEARCH: 300,
    FILTER: 200,
    INPUT: 500,
  },
  
  // Pagination
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
    MAX_ITEMS_BEFORE_VIRTUALIZATION: 100,
  },
  
  // Image lazy loading
  IMAGE: {
    LAZY_LOAD_OFFSET: '200px',
  },
} as const;
