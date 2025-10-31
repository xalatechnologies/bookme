/**
 * Facilities Feature Constants
 * 
 * Centralized constants for facility functionality including:
 * - Status and category mappings
 * - Localization keys
 * - RBAC permissions
 * - Design tokens
 * - Animation settings
 * - Performance configuration
 */

import type { FacilityStatus, FacilityCategory, FacilitySortBy } from './types';

// ============================================================================
// FACILITY STATUS & CATEGORIES
// ============================================================================

/**
 * Facility Status Values
 */
export const FACILITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  PENDING: 'pending',
} as const;

/**
 * Facility Status Variant Mapping
 * Maps facility statuses to StatusBadge variants
 */
export const FACILITY_STATUS_VARIANT = {
  [FACILITY_STATUS.ACTIVE]: 'success',
  [FACILITY_STATUS.INACTIVE]: 'error',
  [FACILITY_STATUS.MAINTENANCE]: 'warning',
  [FACILITY_STATUS.PENDING]: 'pending',
} as const;

/**
 * Facility Categories
 */
export const FACILITY_CATEGORIES: readonly FacilityCategory[] = [
  'sports_hall',
  'meeting_room',
  'outdoor_field',
  'swimming_pool',
  'gym',
  'auditorium',
  'other',
] as const;

/**
 * Facility Sort Options
 */
export const FACILITY_SORT_OPTIONS: readonly FacilitySortBy[] = [
  'name-asc',
  'name-desc',
  'capacity-asc',
  'capacity-desc',
  'price-asc',
  'price-desc',
  'distance',
  'popularity',
] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default Facility Filter Values
 */
export const DEFAULT_FACILITY_FILTERS = {
  CATEGORY: 'all' as FacilityCategory | 'all',
  STATUS: 'all' as FacilityStatus | 'all',
  SEARCH: '',
  SORT_BY: 'name-asc' as FacilitySortBy,
  CAPACITY: { min: 0, max: 1000 },
  PRICE_RANGE: { min: 0, max: 10000 },
  AVAILABILITY: 'all' as 'available' | 'booked' | 'all',
} as const;

/**
 * Default Facility Form Values
 */
export const DEFAULT_FACILITY = {
  NAME: '',
  DESCRIPTION: '',
  CATEGORY: '' as FacilityCategory | '',
  CAPACITY: 10,
  PRICE_PER_HOUR: 500,
  STATUS: 'active' as FacilityStatus,
  AMENITIES: [] as string[],
} as const;

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Facility Validation Rules
 */
export const FACILITY_VALIDATION = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 10000,
  MIN_PRICE: 0,
  MAX_PRICE: 100000,
  MAX_IMAGES: 10,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * Map Configuration
 */
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  MARKER_COLOR: '#3b82f6',
  CLUSTER_RADIUS: 50,
} as const;

/**
 * Gallery Configuration
 */
export const GALLERY_CONFIG = {
  IMAGES_PER_PAGE: 6,
  THUMBNAIL_SIZE: 150,
  FULL_IMAGE_MAX_WIDTH: 1920,
  FULL_IMAGE_MAX_HEIGHT: 1080,
} as const;

/**
 * Display Limits
 */
export const FACILITY_DISPLAY_LIMITS = {
  GRID_ITEMS_PER_PAGE: 12,
  LIST_ITEMS_PER_PAGE: 20,
  RELATED_FACILITIES: 4,
  POPULAR_FACILITIES: 6,
} as const;

// ============================================================================
// LOCALIZATION (i18n)
// ============================================================================

/**
 * Translation Namespace
 */
export const I18N_NAMESPACE = 'facilities' as const;

/**
 * Translation Keys
 */
export const FACILITY_I18N_KEYS = {
  // Page titles
  TITLE: 'title',
  ALL_FACILITIES: 'allFacilities.title',
  FACILITY_DETAILS: 'details.title',
  CREATE_FACILITY: 'create.title',
  EDIT_FACILITY: 'edit.title',
  
  // Status labels
  STATUS: {
    ACTIVE: 'status.active',
    INACTIVE: 'status.inactive',
    MAINTENANCE: 'status.maintenance',
    PENDING: 'status.pending',
  },
  
  // Category labels
  CATEGORY: {
    SPORTS_HALL: 'category.sportsHall',
    MEETING_ROOM: 'category.meetingRoom',
    OUTDOOR_FIELD: 'category.outdoorField',
    SWIMMING_POOL: 'category.swimmingPool',
    GYM: 'category.gym',
    AUDITORIUM: 'category.auditorium',
    OTHER: 'category.other',
  },
  
  // Form labels
  FORM: {
    NAME: 'form.name',
    DESCRIPTION: 'form.description',
    CATEGORY: 'form.category',
    CAPACITY: 'form.capacity',
    PRICE: 'form.price',
    STATUS: 'form.status',
    AMENITIES: 'form.amenities',
    LOCATION: 'form.location',
    IMAGES: 'form.images',
    OPENING_HOURS: 'form.openingHours',
  },
  
  // Actions
  ACTIONS: {
    CREATE: 'actions.create',
    EDIT: 'actions.edit',
    DELETE: 'actions.delete',
    VIEW_DETAILS: 'actions.viewDetails',
    BOOK_NOW: 'actions.bookNow',
    ADD_TO_FAVORITES: 'actions.addToFavorites',
    SHARE: 'actions.share',
    UPLOAD_IMAGE: 'actions.uploadImage',
  },
  
  // Filter labels
  FILTERS: {
    ALL: 'filters.all',
    CATEGORY: 'filters.category',
    STATUS: 'filters.status',
    CAPACITY: 'filters.capacity',
    PRICE_RANGE: 'filters.priceRange',
    SEARCH: 'filters.search',
    SORT_BY: 'filters.sortBy',
  },
  
  // Messages
  MESSAGES: {
    CREATE_SUCCESS: 'messages.createSuccess',
    CREATE_ERROR: 'messages.createError',
    UPDATE_SUCCESS: 'messages.updateSuccess',
    UPDATE_ERROR: 'messages.updateError',
    DELETE_SUCCESS: 'messages.deleteSuccess',
    DELETE_ERROR: 'messages.deleteError',
    LOADING: 'messages.loading',
    NO_FACILITIES: 'messages.noFacilities',
    NO_RESULTS: 'messages.noResults',
  },
} as const;

// ============================================================================
// RBAC & PERMISSIONS
// ============================================================================

/**
 * Facility Permissions
 */
export const FACILITY_PERMISSIONS = {
  // View permissions
  VIEW_ALL: ['user', 'facility_manager', 'admin'],
  VIEW_DETAILS: ['user', 'facility_manager', 'admin'],
  VIEW_INACTIVE: ['facility_manager', 'admin'],
  
  // Create permissions
  CREATE: ['facility_manager', 'admin'],
  CREATE_BULK: ['admin'],
  
  // Edit permissions
  EDIT: ['facility_manager', 'admin'],
  EDIT_STATUS: ['facility_manager', 'admin'],
  EDIT_PRICING: ['facility_manager', 'admin'],
  
  // Delete permissions
  DELETE: ['admin'],
  DELETE_BULK: ['admin'],
  
  // Media permissions
  UPLOAD_IMAGES: ['facility_manager', 'admin'],
  DELETE_IMAGES: ['facility_manager', 'admin'],
  
  // Administrative
  MANAGE_AMENITIES: ['facility_manager', 'admin'],
  MANAGE_ZONES: ['facility_manager', 'admin'],
  VIEW_STATS: ['facility_manager', 'admin'],
  EXPORT_DATA: ['facility_manager', 'admin'],
} as const;

/**
 * Helper to check if user has facility permission
 */
export function hasFacilityPermission(
  userRoles: string[],
  requiredPermission: keyof typeof FACILITY_PERMISSIONS
): boolean {
  const allowedRoles = FACILITY_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

/**
 * Facility Component Design Tokens
 */
export const FACILITY_DESIGN = {
  // Card styling
  CARD: {
    BASE: 'rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm',
    HOVER: 'hover:shadow-lg transition-shadow cursor-pointer',
    PADDING: 'p-4',
    IMAGE_HEIGHT: 'h-48',
  },
  
  // Status colors
  STATUS_COLORS: {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    PENDING: 'bg-blue-100 text-blue-800',
  },
  
  // Category colors
  CATEGORY_COLORS: {
    SPORTS_HALL: 'bg-blue-100 text-blue-800',
    MEETING_ROOM: 'bg-purple-100 text-purple-800',
    OUTDOOR_FIELD: 'bg-green-100 text-green-800',
    SWIMMING_POOL: 'bg-cyan-100 text-cyan-800',
    GYM: 'bg-orange-100 text-orange-800',
    AUDITORIUM: 'bg-pink-100 text-pink-800',
    OTHER: 'bg-gray-100 text-gray-800',
  },
  
  // Typography
  TYPOGRAPHY: {
    TITLE: 'text-2xl font-bold text-gray-900',
    SUBTITLE: 'text-lg font-semibold text-gray-700',
    BODY: 'text-base text-gray-600',
    CAPTION: 'text-sm text-gray-500',
    LABEL: 'text-sm font-medium text-gray-700',
    PRICE: 'text-xl font-bold text-blue-600',
  },
  
  // Spacing
  SPACING: {
    SECTION: 'space-y-6',
    GRID: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
    DETAIL: 'space-y-4',
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
 */
export const FACILITY_ANIMATIONS = {
  // Duration (milliseconds)
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    IMAGE_LOAD: 400,
  },
  
  // Tailwind transition classes
  TRANSITIONS: {
    DEFAULT: 'transition-all duration-300 ease-in-out',
    FAST: 'transition-all duration-150 ease-in-out',
    SLOW: 'transition-all duration-500 ease-in-out',
    COLORS: 'transition-colors duration-300',
    SHADOW: 'transition-shadow duration-300',
    TRANSFORM: 'transition-transform duration-300',
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
    CARD_HOVER: {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
    },
  },
  
  // Loading skeleton
  SKELETON: 'animate-pulse bg-gray-200 rounded',
  
  // Image loading
  IMAGE_LOADING: 'animate-pulse bg-gray-300',
} as const;

// ============================================================================
// PERFORMANCE
// ============================================================================

/**
 * Performance Configuration
 */
export const FACILITY_PERFORMANCE = {
  // TanStack Query cache times (milliseconds)
  CACHE: {
    STALE_TIME: 10 * 60 * 1000, // 10 minutes (facilities change less frequently)
    CACHE_TIME: 30 * 60 * 1000, // 30 minutes
    REFETCH_INTERVAL: false, // No auto-refetch for facilities
  },
  
  // Debounce delays (milliseconds)
  DEBOUNCE: {
    SEARCH: 300,
    FILTER: 200,
    INPUT: 500,
  },
  
  // Pagination
  PAGINATION: {
    ITEMS_PER_PAGE: 12,
    MAX_ITEMS_BEFORE_VIRTUALIZATION: 100,
  },
  
  // Image optimization
  IMAGE: {
    LAZY_LOAD_OFFSET: '200px',
    THUMBNAIL_SIZE: 300,
    MEDIUM_SIZE: 800,
    LARGE_SIZE: 1920,
    QUALITY: 85,
  },
  
  // Map performance
  MAP: {
    CLUSTER_THRESHOLD: 50, // Start clustering when > 50 facilities
    DEBOUNCE_ZOOM: 300,
    DEBOUNCE_DRAG: 200,
  },
} as const;
