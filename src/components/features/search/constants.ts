/**
 * Search Domain Constants
 */

export const SEARCH_TYPES = {
  ALL: 'all',
  FACILITIES: 'facilities',
  BOOKINGS: 'bookings',
  USERS: 'users',
} as const;

export const I18N_NAMESPACE = 'search' as const;

export const SEARCH_I18N_KEYS = {
  TITLE: 'title',
  PLACEHOLDER: 'placeholder',
  RESULTS: 'results',
  NO_RESULTS: 'noResults',
  FILTERS: 'filters',
} as const;

export const SEARCH_PERMISSIONS = {
  SEARCH_ALL: ['user', 'facility_manager', 'admin'],
  SEARCH_USERS: ['facility_manager', 'admin'],
  ADVANCED_FILTERS: ['facility_manager', 'admin'],
} as const;

export function hasSearchPermission(
  userRoles: string[],
  requiredPermission: keyof typeof SEARCH_PERMISSIONS
): boolean {
  const allowedRoles = SEARCH_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

export const SEARCH_DESIGN = {
  INPUT: {
    BASE: 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500',
    ICON: 'absolute left-3 top-3 text-gray-400',
  },
  RESULT: {
    CARD: 'bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow',
  },
} as const;

export const SEARCH_ANIMATIONS = {
  DURATION: {
    RESULTS_APPEAR: 200,
  },
} as const;

export const SEARCH_PERFORMANCE = {
  DEBOUNCE_MS: 300,
  MAX_RESULTS: 50,
  CACHE_TIME: 5 * 60 * 1000,
} as const;
