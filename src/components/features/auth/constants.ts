/**
 * Auth Domain Constants
 * 
 * Configuration and constants for authentication
 */

import type { AuthProvider, UserRole } from './types';

/**
 * ============================================================================
 * BUSINESS LOGIC
 * ============================================================================
 */

/**
 * Authentication Providers
 */
export const AUTH_PROVIDERS: Record<string, AuthProvider> = {
  EMAIL: 'email',
  GOOGLE: 'google',
  GITHUB: 'github',
} as const;

/**
 * User Roles
 */
export const USER_ROLES: Record<string, UserRole> = {
  USER: 'user',
  FACILITY_MANAGER: 'facility_manager',
  ADMIN: 'admin',
} as const;

/**
 * Password Requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false,
} as const;

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  TOKEN_EXPIRY_HOURS: 24,
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
  REMEMBER_ME_DAYS: 90,
  IDLE_TIMEOUT_MINUTES: 30,
} as const;

/**
 * ============================================================================
 * LOCALIZATION (i18n)
 * ============================================================================
 */

/**
 * Translation Namespace
 */
export const I18N_NAMESPACE = 'auth' as const;

/**
 * Translation Keys
 */
export const AUTH_I18N_KEYS = {
  TITLE: 'title',
  
  LOGIN: {
    TITLE: 'login.title',
    EMAIL: 'login.email',
    PASSWORD: 'login.password',
    REMEMBER_ME: 'login.rememberMe',
    SUBMIT: 'login.submit',
    FORGOT_PASSWORD: 'login.forgotPassword',
    NO_ACCOUNT: 'login.noAccount',
    SIGN_UP: 'login.signUp',
  },
  
  SIGNUP: {
    TITLE: 'signup.title',
    NAME: 'signup.name',
    EMAIL: 'signup.email',
    PASSWORD: 'signup.password',
    CONFIRM_PASSWORD: 'signup.confirmPassword',
    ACCEPT_TERMS: 'signup.acceptTerms',
    SUBMIT: 'signup.submit',
    HAVE_ACCOUNT: 'signup.haveAccount',
    LOGIN: 'signup.login',
  },
  
  RESET: {
    TITLE: 'reset.title',
    EMAIL: 'reset.email',
    SUBMIT: 'reset.submit',
    BACK_TO_LOGIN: 'reset.backToLogin',
    SUCCESS: 'reset.success',
  },
  
  ERRORS: {
    INVALID_CREDENTIALS: 'errors.invalidCredentials',
    EMAIL_NOT_VERIFIED: 'errors.emailNotVerified',
    ACCOUNT_LOCKED: 'errors.accountLocked',
    WEAK_PASSWORD: 'errors.weakPassword',
    EMAIL_IN_USE: 'errors.emailInUse',
    NETWORK_ERROR: 'errors.networkError',
  },
  
  MESSAGES: {
    LOGIN_SUCCESS: 'messages.loginSuccess',
    SIGNUP_SUCCESS: 'messages.signupSuccess',
    LOGOUT_SUCCESS: 'messages.logoutSuccess',
    PASSWORD_RESET_SENT: 'messages.passwordResetSent',
  },
} as const;

/**
 * ============================================================================
 * RBAC & PERMISSIONS
 * ============================================================================
 */

/**
 * Auth Permissions
 */
export const AUTH_PERMISSIONS = {
  LOGIN: ['user', 'facility_manager', 'admin'],
  SIGNUP: ['user', 'facility_manager', 'admin'],
  RESET_PASSWORD: ['user', 'facility_manager', 'admin'],
  CHANGE_PASSWORD: ['user', 'facility_manager', 'admin'],
  MANAGE_USERS: ['admin'],
  MANAGE_ROLES: ['admin'],
  VIEW_AUDIT_LOG: ['facility_manager', 'admin'],
} as const;

/**
 * Role Hierarchy (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  facility_manager: 2,
  admin: 3,
} as const;

/**
 * Helper: Check if user has permission
 */
export function hasAuthPermission(
  userRoles: string[],
  requiredPermission: keyof typeof AUTH_PERMISSIONS
): boolean {
  const allowedRoles = AUTH_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

/**
 * Helper: Check if user has minimum role
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * ============================================================================
 * DESIGN TOKENS
 * ============================================================================
 */

export const AUTH_DESIGN = {
  FORM: {
    CONTAINER: 'w-full max-w-md mx-auto',
    CARD: 'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8',
    SPACING: 'space-y-6',
  },
  
  INPUT: {
    BASE: 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
    ERROR: 'border-red-500 focus:ring-red-500',
    SUCCESS: 'border-green-500 focus:ring-green-500',
  },
  
  BUTTON: {
    PRIMARY: 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors',
    SECONDARY: 'w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors',
    DANGER: 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors',
  },
  
  PROVIDER_BUTTON: {
    GOOGLE: 'w-full border border-gray-300 hover:bg-gray-50 py-3 rounded-lg transition-colors flex items-center justify-center gap-2',
    GITHUB: 'w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2',
  },
  
  TYPOGRAPHY: {
    TITLE: 'text-3xl font-bold text-gray-900 dark:text-white text-center',
    SUBTITLE: 'text-sm text-gray-600 dark:text-gray-400 text-center',
    LABEL: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    ERROR: 'text-sm text-red-600 dark:text-red-400',
    LINK: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium',
  },
  
  ROLE_COLORS: {
    user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    facility_manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
} as const;

/**
 * ============================================================================
 * ANIMATIONS
 * ============================================================================
 */

export const AUTH_ANIMATIONS = {
  DURATION: {
    FORM_SUBMIT: 200,
    ERROR_SHAKE: 400,
    SUCCESS_FADE: 300,
    MODAL_ENTER: 200,
  },
  
  TRANSITIONS: {
    DEFAULT: 'transition-all duration-200 ease-in-out',
    SMOOTH: 'transition-all duration-300 ease-in-out',
    SPRING: 'transition-all duration-200 ease-spring',
  },
  
  VARIANTS: {
    fadeIn: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    shake: {
      initial: { x: 0 },
      animate: { x: [-10, 10, -10, 10, 0] },
    },
  },
} as const;

/**
 * ============================================================================
 * PERFORMANCE
 * ============================================================================
 */

export const AUTH_PERFORMANCE = {
  CACHE_TIMES: {
    USER_SESSION: 5 * 60 * 1000, // 5 minutes
    USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  },
  
  DEBOUNCE: {
    EMAIL_VALIDATION: 300,
    PASSWORD_STRENGTH: 200,
  },
  
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
  },
} as const;
