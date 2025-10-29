/**
 * Dashboard Domain Constants
 * 
 * Configuration and constants for dashboard features
 */

import type { DashboardView } from './types';

/**
 * ============================================================================
 * BUSINESS LOGIC
 * ============================================================================
 */

/**
 * Dashboard Views
 */
export const DASHBOARD_VIEWS: Record<string, DashboardView> = {
  OVERVIEW: 'overview',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
} as const;

/**
 * Alert Types
 */
export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

/**
 * Activity Types
 */
export const ACTIVITY_TYPES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  MESSAGE: 'message',
  SYSTEM: 'system',
} as const;

/**
 * Refresh Intervals (milliseconds)
 */
export const REFRESH_INTERVALS = {
  STATS: 30 * 1000, // 30 seconds
  ALERTS: 60 * 1000, // 1 minute
  ACTIVITY: 15 * 1000, // 15 seconds
} as const;

/**
 * ============================================================================
 * LOCALIZATION (i18n)
 * ============================================================================
 */

export const I18N_NAMESPACE = 'dashboard' as const;

export const DASHBOARD_I18N_KEYS = {
  TITLE: 'title',
  
  ADMIN: {
    TITLE: 'admin.title',
    OVERVIEW: 'admin.overview',
    STATS: 'admin.stats',
    RECENT_BOOKINGS: 'admin.recentBookings',
    ALERTS: 'admin.alerts',
    ANALYTICS: 'admin.analytics',
  },
  
  USER: {
    TITLE: 'user.title',
    WELCOME: 'user.welcome',
    MY_BOOKINGS: 'user.myBookings',
    QUICK_ACTIONS: 'user.quickActions',
    ACTIVITY: 'user.activity',
  },
  
  KPI: {
    TOTAL_BOOKINGS: 'kpi.totalBookings',
    ACTIVE_BOOKINGS: 'kpi.activeBookings',
    REVENUE: 'kpi.revenue',
    USERS: 'kpi.users',
    FACILITIES: 'kpi.facilities',
  },
  
  ACTIONS: {
    REFRESH: 'actions.refresh',
    VIEW_ALL: 'actions.viewAll',
    EXPORT: 'actions.export',
  },
} as const;

/**
 * ============================================================================
 * RBAC & PERMISSIONS
 * ============================================================================
 */

export const DASHBOARD_PERMISSIONS = {
  VIEW_USER_DASHBOARD: ['user', 'facility_manager', 'admin'],
  VIEW_ADMIN_DASHBOARD: ['facility_manager', 'admin'],
  VIEW_ANALYTICS: ['facility_manager', 'admin'],
  VIEW_ALL_BOOKINGS: ['facility_manager', 'admin'],
  VIEW_SYSTEM_ALERTS: ['facility_manager', 'admin'],
  EXPORT_DATA: ['facility_manager', 'admin'],
  MANAGE_USERS: ['admin'],
} as const;

export function hasDashboardPermission(
  userRoles: string[],
  requiredPermission: keyof typeof DASHBOARD_PERMISSIONS
): boolean {
  const allowedRoles = DASHBOARD_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

/**
 * ============================================================================
 * DESIGN TOKENS
 * ============================================================================
 */

export const DASHBOARD_DESIGN = {
  LAYOUT: {
    CONTAINER: 'container mx-auto px-4 py-6',
    GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    SPACING: 'space-y-6',
  },
  
  CARD: {
    BASE: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6',
    HOVER: 'hover:shadow-md transition-shadow',
    BORDER: 'border border-gray-200 dark:border-gray-700',
  },
  
  KPI_CARD: {
    CONTAINER: 'bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm',
    LABEL: 'text-sm font-medium text-gray-600 dark:text-gray-400',
    VALUE: 'text-3xl font-bold text-gray-900 dark:text-white',
    CHANGE_POSITIVE: 'text-green-600 dark:text-green-400',
    CHANGE_NEGATIVE: 'text-red-600 dark:text-red-400',
  },
  
  ALERT_COLORS: {
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  },
  
  ACTIVITY_ICONS: {
    booking: 'text-blue-600',
    payment: 'text-green-600',
    message: 'text-purple-600',
    system: 'text-gray-600',
  },
} as const;

/**
 * ============================================================================
 * ANIMATIONS
 * ============================================================================
 */

export const DASHBOARD_ANIMATIONS = {
  DURATION: {
    CARD_HOVER: 200,
    STAT_UPDATE: 500,
    REFRESH: 300,
  },
  
  TRANSITIONS: {
    DEFAULT: 'transition-all duration-200 ease-in-out',
    SMOOTH: 'transition-all duration-300 ease-in-out',
  },
  
  VARIANTS: {
    cardHover: {
      initial: { scale: 1 },
      hover: { scale: 1.02 },
    },
    statUpdate: {
      initial: { scale: 1 },
      update: { scale: [1, 1.1, 1] },
    },
  },
} as const;

/**
 * ============================================================================
 * PERFORMANCE
 * ============================================================================
 */

export const DASHBOARD_PERFORMANCE = {
  CACHE_TIMES: {
    STATS: 5 * 60 * 1000, // 5 minutes
    ACTIVITY: 2 * 60 * 1000, // 2 minutes
    ALERTS: 3 * 60 * 1000, // 3 minutes
  },
  
  PAGINATION: {
    BOOKINGS_PER_PAGE: 10,
    ACTIVITY_PER_PAGE: 20,
    ALERTS_PER_PAGE: 15,
  },
} as const;
