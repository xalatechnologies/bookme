/**
 * Auth Business Logic Service
 *
 * Contains all business logic related to authentication and authorization.
 * NO UI logic, NO component dependencies, NO API calls, NO localStorage access.
 * Pure business rules and data transformations.
 *
 * @module services/business/auth
 */

import type { OrgRole, PlatformRole, SystemRole } from '@/constants/roles';
import { ROLE_PRIORITY, ORG_ROLES, PLATFORM_ROLES } from '@/constants/roles';

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly errorsNo: readonly string[];
}

export interface PasswordRequirements {
  readonly minLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumber: boolean;
  readonly requireSpecialChar: boolean;
}

export interface PasswordStrengthResult extends ValidationResult {
  readonly strength: 'weak' | 'medium' | 'strong';
  readonly score: number;
}

export interface RouteAccessResult {
  readonly canAccess: boolean;
  readonly reason?: string;
  readonly reasonNo?: string;
  readonly redirectTo?: string;
}

export interface SessionInfo {
  readonly expiresAt: string;
  readonly issuedAt: string;
}

export interface SanitizedInput {
  readonly email: string;
  readonly password?: string;
  readonly [key: string]: string | undefined;
}

// ============================================================================
// Constants
// ============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
} as const;

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const ADMIN_ROLES: readonly SystemRole[] = [
  PLATFORM_ROLES.PLATFORM_ADMIN,
  ORG_ROLES.OWNER,
  ORG_ROLES.ADMIN,
] as const;

const USER_ROLES: readonly SystemRole[] = [
  ORG_ROLES.CASE_HANDLER,
  ORG_ROLES.EDITOR,
  ORG_ROLES.READ_ONLY,
  ORG_ROLES.CUSTOMER,
] as const;

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validate email format with comprehensive regex
 *
 * Checks for:
 * - Valid email structure
 * - Proper domain format
 * - No invalid characters
 *
 * @param email - Email address to validate
 * @returns Validation result with errors in English and Norwegian
 *
 * @example
 * ```typescript
 * const result = validateEmailFormat('user@example.com');
 * if (result.isValid) {
 *   console.log('Email is valid');
 * } else {
 *   console.log(result.errors); // English errors
 *   console.log(result.errorsNo); // Norwegian errors
 * }
 * ```
 */
export const validateEmailFormat = (email: string): ValidationResult => {
  const errors: string[] = [];
  const errorsNo: string[] = [];

  if (!email) {
    errors.push('Email is required');
    errorsNo.push('E-post er påkrevd');
    return { isValid: false, errors, errorsNo };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    errors.push('Email cannot be empty');
    errorsNo.push('E-post kan ikke være tom');
    return { isValid: false, errors, errorsNo };
  }

  if (trimmedEmail.length > 254) {
    errors.push('Email is too long (max 254 characters)');
    errorsNo.push('E-post er for lang (maks 254 tegn)');
    return { isValid: false, errors, errorsNo };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push('Please provide a valid email address');
    errorsNo.push('Vennligst oppgi en gyldig e-postadresse');
    return { isValid: false, errors, errorsNo };
  }

  // Check for common typos
  const commonTypos = ['.con', '.cmo', '.col', '@gmial', '@yahooo'];
  const hasTypo = commonTypos.some(typo => trimmedEmail.toLowerCase().includes(typo));
  if (hasTypo) {
    errors.push('Email address contains a common typo');
    errorsNo.push('E-postadressen inneholder en vanlig skrivefeil');
    return { isValid: false, errors, errorsNo };
  }

  return { isValid: true, errors: [], errorsNo: [] };
};

// ============================================================================
// Password Validation
// ============================================================================

/**
 * Check password requirements and strength
 *
 * Validates:
 * - Minimum length (8 characters)
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Calculates strength score
 *
 * @param password - Password to validate
 * @returns Password strength result with errors and score
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('MyPass123!');
 * console.log(result.strength); // 'strong'
 * console.log(result.score); // 4
 * console.log(result.isValid); // true
 * ```
 */
export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  const errors: string[] = [];
  const errorsNo: string[] = [];
  let score = 0;

  if (!password) {
    errors.push('Password is required');
    errorsNo.push('Passord er påkrevd');
    return {
      isValid: false,
      errors,
      errorsNo,
      strength: 'weak',
      score: 0,
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    errorsNo.push(`Passord må være minst ${PASSWORD_REQUIREMENTS.minLength} tegn langt`);
  } else {
    score++;
    if (password.length >= 12) score++; // Extra point for longer passwords
  }

  // Check for uppercase letter
  const hasUpperCase = /[A-Z]/.test(password);
  if (PASSWORD_REQUIREMENTS.requireUppercase && !hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
    errorsNo.push('Passord må inneholde minst én stor bokstav');
  } else if (hasUpperCase) {
    score++;
  }

  // Check for lowercase letter
  const hasLowerCase = /[a-z]/.test(password);
  if (PASSWORD_REQUIREMENTS.requireLowercase && !hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
    errorsNo.push('Passord må inneholde minst én liten bokstav');
  } else if (hasLowerCase) {
    score++;
  }

  // Check for number
  const hasNumber = /[0-9]/.test(password);
  if (PASSWORD_REQUIREMENTS.requireNumber && !hasNumber) {
    errors.push('Password must contain at least one number');
    errorsNo.push('Passord må inneholde minst ett tall');
  } else if (hasNumber) {
    score++;
  }

  // Check for special character (optional but adds to strength)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (hasSpecialChar) {
    score++;
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin123',
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
    errorsNo.push('Passordet er for vanlig. Vennligst velg et sterkere passord');
    score = 0;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorsNo,
    strength,
    score,
  };
};

/**
 * Confirm password matches confirmation
 *
 * @param password - Original password
 * @param confirmPassword - Password confirmation
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validatePasswordMatch('MyPass123', 'MyPass123');
 * console.log(result.isValid); // true
 * ```
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: string[] = [];
  const errorsNo: string[] = [];

  if (!password || !confirmPassword) {
    errors.push('Both password fields are required');
    errorsNo.push('Begge passordfeltene er påkrevd');
    return { isValid: false, errors, errorsNo };
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
    errorsNo.push('Passordene stemmer ikke overens');
    return { isValid: false, errors, errorsNo };
  }

  return { isValid: true, errors: [], errorsNo: [] };
};

// ============================================================================
// Route Access Control
// ============================================================================

/**
 * Check if user role can access admin routes
 *
 * Admin routes are accessible by:
 * - platform_admin
 * - owner
 * - admin
 *
 * @param role - User's role
 * @param isPlatformAdmin - Whether user is a platform admin
 * @returns Access result with reason if denied
 *
 * @example
 * ```typescript
 * const result = canAccessAdminRoute('admin', false);
 * console.log(result.canAccess); // true
 *
 * const result2 = canAccessAdminRoute('customer', false);
 * console.log(result2.canAccess); // false
 * console.log(result2.reason); // 'Insufficient permissions...'
 * ```
 */
export const canAccessAdminRoute = (
  role: SystemRole | null,
  isPlatformAdmin: boolean
): RouteAccessResult => {
  if (isPlatformAdmin) {
    return { canAccess: true };
  }

  if (!role) {
    return {
      canAccess: false,
      reason: 'Authentication required. Please sign in to continue.',
      reasonNo: 'Autentisering påkrevd. Vennligst logg inn for å fortsette.',
      redirectTo: '/login',
    };
  }

  if (ADMIN_ROLES.includes(role)) {
    return { canAccess: true };
  }

  return {
    canAccess: false,
    reason: 'Insufficient permissions. Admin access required.',
    reasonNo: 'Utilstrekkelige tillatelser. Administratortilgang kreves.',
    redirectTo: '/dashboard',
  };
};

/**
 * Check if user role can access user routes
 *
 * User routes are accessible by all authenticated users including:
 * - All admin roles
 * - case_handler
 * - editor
 * - read_only
 * - customer
 *
 * @param role - User's role
 * @param isPlatformAdmin - Whether user is a platform admin
 * @returns Access result with reason if denied
 *
 * @example
 * ```typescript
 * const result = canAccessUserRoute('customer', false);
 * console.log(result.canAccess); // true
 *
 * const result2 = canAccessUserRoute(null, false);
 * console.log(result2.canAccess); // false
 * ```
 */
export const canAccessUserRoute = (
  role: SystemRole | null,
  isPlatformAdmin: boolean
): RouteAccessResult => {
  if (isPlatformAdmin) {
    return { canAccess: true };
  }

  if (!role) {
    return {
      canAccess: false,
      reason: 'Authentication required. Please sign in to continue.',
      reasonNo: 'Autentisering påkrevd. Vennligst logg inn for å fortsette.',
      redirectTo: '/login',
    };
  }

  // All authenticated users with valid roles can access user routes
  if ([...ADMIN_ROLES, ...USER_ROLES].includes(role)) {
    return { canAccess: true };
  }

  return {
    canAccess: false,
    reason: 'Invalid user role. Please contact support.',
    reasonNo: 'Ugyldig brukerrolle. Vennligst kontakt support.',
    redirectTo: '/login',
  };
};

// ============================================================================
// Session Management
// ============================================================================

/**
 * Check if session timestamp is expired
 *
 * @param expiresAt - Session expiration timestamp (ISO 8601)
 * @param currentTime - Current time (defaults to now)
 * @returns True if session is expired
 *
 * @example
 * ```typescript
 * const expiresAt = '2025-10-30T12:00:00Z';
 * const isExpired = isSessionExpired(expiresAt);
 * console.log(isExpired); // true or false based on current time
 * ```
 */
export const isSessionExpired = (
  expiresAt: string,
  currentTime: Date = new Date()
): boolean => {
  try {
    const expirationDate = new Date(expiresAt);
    return currentTime.getTime() >= expirationDate.getTime();
  } catch (error) {
    // Invalid date format, consider as expired
    return true;
  }
};

/**
 * Calculate session expiration time
 *
 * @param issuedAt - Session issued timestamp (ISO 8601)
 * @param durationMs - Session duration in milliseconds (defaults to 24 hours)
 * @returns Session expiration timestamp
 *
 * @example
 * ```typescript
 * const issuedAt = '2025-10-29T12:00:00Z';
 * const expiresAt = calculateSessionExpiration(issuedAt);
 * console.log(expiresAt); // ISO 8601 timestamp 24 hours later
 * ```
 */
export const calculateSessionExpiration = (
  issuedAt: string,
  durationMs: number = SESSION_DURATION_MS
): string => {
  try {
    const issuedDate = new Date(issuedAt);
    const expirationDate = new Date(issuedDate.getTime() + durationMs);
    return expirationDate.toISOString();
  } catch (error) {
    // Invalid date, return current time + duration
    const now = new Date();
    const expirationDate = new Date(now.getTime() + durationMs);
    return expirationDate.toISOString();
  }
};

/**
 * Get remaining session time in minutes
 *
 * @param expiresAt - Session expiration timestamp (ISO 8601)
 * @param currentTime - Current time (defaults to now)
 * @returns Remaining time in minutes (0 if expired)
 *
 * @example
 * ```typescript
 * const expiresAt = '2025-10-29T13:00:00Z';
 * const remaining = getRemainingSessionTime(expiresAt);
 * console.log(remaining); // Number of minutes remaining
 * ```
 */
export const getRemainingSessionTime = (
  expiresAt: string,
  currentTime: Date = new Date()
): number => {
  try {
    const expirationDate = new Date(expiresAt);
    const remainingMs = expirationDate.getTime() - currentTime.getTime();
    if (remainingMs <= 0) return 0;
    return Math.floor(remainingMs / (60 * 1000)); // Convert to minutes
  } catch (error) {
    return 0;
  }
};

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize user input for login/registration
 *
 * Trims whitespace and removes potentially harmful characters.
 * Does NOT modify passwords (they should remain as-is for validation).
 *
 * @param input - Raw user input
 * @returns Sanitized input
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeUserInput({
 *   email: '  user@example.com  ',
 *   password: 'MyPass123',
 * });
 * console.log(sanitized.email); // 'user@example.com'
 * console.log(sanitized.password); // 'MyPass123' (unchanged)
 * ```
 */
export const sanitizeUserInput = (input: {
  readonly email: string;
  readonly password?: string;
  readonly [key: string]: string | undefined;
}): SanitizedInput => {
  const sanitized: { [key: string]: string | undefined } = {};

  // Sanitize email (trim and lowercase)
  if (input.email) {
    sanitized.email = input.email.trim().toLowerCase();
  } else {
    sanitized.email = '';
  }

  // Keep password as-is (no trimming or modification)
  if (input.password !== undefined) {
    sanitized.password = input.password;
  }

  // Sanitize other string fields (trim only)
  Object.keys(input).forEach(key => {
    if (key !== 'email' && key !== 'password' && input[key]) {
      const value = input[key];
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      }
    }
  });

  return sanitized as SanitizedInput;
};

// ============================================================================
// Password Requirements
// ============================================================================

/**
 * Generate password requirement messages
 *
 * Returns human-readable password requirements in English and Norwegian.
 *
 * @returns Password requirement messages
 *
 * @example
 * ```typescript
 * const requirements = generatePasswordRequirements();
 * console.log(requirements.en); // English requirements
 * console.log(requirements.no); // Norwegian requirements
 * ```
 */
export const generatePasswordRequirements = (): {
  readonly en: readonly string[];
  readonly no: readonly string[];
} => {
  const en: string[] = [];
  const no: string[] = [];

  en.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  no.push(`Minst ${PASSWORD_REQUIREMENTS.minLength} tegn langt`);

  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    en.push('Contains at least one uppercase letter (A-Z)');
    no.push('Inneholder minst én stor bokstav (A-Å)');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    en.push('Contains at least one lowercase letter (a-z)');
    no.push('Inneholder minst én liten bokstav (a-å)');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber) {
    en.push('Contains at least one number (0-9)');
    no.push('Inneholder minst ett tall (0-9)');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar) {
    en.push('Contains at least one special character (!@#$%^&*)');
    no.push('Inneholder minst ett spesialtegn (!@#$%^&*)');
  }

  return { en, no };
};

// ============================================================================
// Role Comparison
// ============================================================================

/**
 * Check if a role has sufficient priority for an action
 *
 * @param userRole - User's current role
 * @param requiredRole - Required role for the action
 * @param isPlatformAdmin - Whether user is a platform admin
 * @returns True if user has sufficient priority
 *
 * @example
 * ```typescript
 * const canEdit = hasRolePriority('admin', 'editor', false);
 * console.log(canEdit); // true (admin > editor)
 *
 * const canDelete = hasRolePriority('editor', 'admin', false);
 * console.log(canDelete); // false (editor < admin)
 * ```
 */
export const hasRolePriority = (
  userRole: OrgRole | null,
  requiredRole: OrgRole,
  isPlatformAdmin: boolean
): boolean => {
  // Platform admin has highest priority
  if (isPlatformAdmin) return true;

  // No role means no access
  if (!userRole) return false;

  // Get priorities (default to 0 if role not found)
  const userPriority = ROLE_PRIORITY[userRole] ?? 0;
  const requiredPriority = ROLE_PRIORITY[requiredRole] ?? 0;

  return userPriority >= requiredPriority;
};

/**
 * Get role priority level
 *
 * @param role - Role to check
 * @returns Priority level (0-100)
 *
 * @example
 * ```typescript
 * const priority = getRolePriority('admin');
 * console.log(priority); // 80
 * ```
 */
export const getRolePriority = (role: OrgRole): number => {
  return ROLE_PRIORITY[role] ?? 0;
};
