/**
 * Calendar Feature Constants
 * 
 * Centralized constants for calendar functionality
 */

// ============================================================================
// TIME SLOT STATUS
// ============================================================================

export const TIME_SLOT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  BUSY: 'busy',
  UNAVAILABLE: 'unavailable',
  SELECTED: 'selected',
  CONFLICT: 'conflict',
} as const;

/**
 * Time Slot Status Colors
 */
export const TIME_SLOT_COLORS = {
  [TIME_SLOT_STATUS.AVAILABLE]: 'bg-green-100 text-green-800 hover:bg-green-200',
  [TIME_SLOT_STATUS.BOOKED]: 'bg-red-100 text-red-800',
  [TIME_SLOT_STATUS.BUSY]: 'bg-red-100 text-red-800',
  [TIME_SLOT_STATUS.UNAVAILABLE]: 'bg-gray-100 text-gray-600',
  [TIME_SLOT_STATUS.SELECTED]: 'bg-blue-500 text-white',
  [TIME_SLOT_STATUS.CONFLICT]: 'bg-orange-100 text-orange-800',
} as const;

// ============================================================================
// CALENDAR CONFIGURATION
// ============================================================================

export const CALENDAR_CONFIG = {
  DAYS_IN_WEEK: 7,
  TIME_SLOT_DURATION: 60, // minutes
  DEFAULT_START_HOUR: 8,
  DEFAULT_END_HOUR: 22,
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
} as const;

export const DEFAULT_OPENING_HOURS = {
  START: '08:00',
  END: '22:00',
} as const;

export const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;

// ============================================================================
// LOCALIZATION (i18n)
// ============================================================================

export const I18N_NAMESPACE = 'calendar' as const;

export const CALENDAR_I18N_KEYS = {
  // Views
  DAY_VIEW: 'views.day',
  WEEK_VIEW: 'views.week',
  MONTH_VIEW: 'views.month',
  
  // Navigation
  PREVIOUS_WEEK: 'navigation.previousWeek',
  NEXT_WEEK: 'navigation.nextWeek',
  TODAY: 'navigation.today',
  
  // Time slots
  STATUS: {
    AVAILABLE: 'status.available',
    BOOKED: 'status.booked',
    BUSY: 'status.busy',
    UNAVAILABLE: 'status.unavailable',
    SELECTED: 'status.selected',
    CONFLICT: 'status.conflict',
  },
  
  // Actions
  ACTIONS: {
    SELECT_SLOT: 'actions.selectSlot',
    CLEAR_SELECTION: 'actions.clearSelection',
    BULK_SELECT: 'actions.bulkSelect',
  },
  
  // Messages
  MESSAGES: {
    NO_AVAILABILITY: 'messages.noAvailability',
    LOADING: 'messages.loading',
    CONFLICT_WARNING: 'messages.conflictWarning',
  },
} as const;

// ============================================================================
// RBAC & PERMISSIONS
// ============================================================================

export const CALENDAR_PERMISSIONS = {
  VIEW_CALENDAR: ['user', 'facility_manager', 'admin'],
  VIEW_ALL_BOOKINGS: ['facility_manager', 'admin'],
  MANAGE_AVAILABILITY: ['facility_manager', 'admin'],
  OVERRIDE_CONFLICTS: ['facility_manager', 'admin'],
} as const;

export function hasCalendarPermission(
  userRoles: string[],
  requiredPermission: keyof typeof CALENDAR_PERMISSIONS
): boolean {
  const allowedRoles = CALENDAR_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const CALENDAR_DESIGN = {
  // Grid layout
  GRID: {
    BASE: 'grid border border-gray-200 rounded-lg overflow-hidden',
    HEADER: 'bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700',
    CELL: 'border-r border-b border-gray-100 p-2 min-h-[60px]',
  },
  
  // Time slots
  SLOT: {
    BASE: 'px-3 py-2 rounded text-sm font-medium transition-all cursor-pointer',
    DISABLED: 'cursor-not-allowed opacity-50',
  },
  
  // Typography
  TYPOGRAPHY: {
    DAY_HEADER: 'text-lg font-bold text-gray-900',
    TIME_LABEL: 'text-sm text-gray-600',
    PRICE: 'text-xs text-gray-500',
  },
  
  // Spacing
  SPACING: {
    GRID_GAP: 'gap-1',
    CELL_PADDING: 'p-2',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const CALENDAR_ANIMATIONS = {
  DURATION: {
    SLOT_TRANSITION: 200,
    VIEW_CHANGE: 300,
  },
  
  TRANSITIONS: {
    SLOT: 'transition-all duration-200 ease-in-out',
    VIEW: 'transition-opacity duration-300',
  },
  
  VARIANTS: {
    SLOT_SELECT: {
      initial: { scale: 1 },
      animate: { scale: 1.05 },
      tap: { scale: 0.95 },
    },
  },
} as const;

// ============================================================================
// PERFORMANCE
// ============================================================================

export const CALENDAR_PERFORMANCE = {
  CACHE: {
    STALE_TIME: 2 * 60 * 1000, // 2 minutes
    CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  },
  
  DEBOUNCE: {
    SLOT_SELECTION: 100,
    VIEW_CHANGE: 200,
  },
  
  VIRTUALIZATION: {
    ENABLE_THRESHOLD: 50, // Virtualize when > 50 slots
  },
} as const;
