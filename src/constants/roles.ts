/**
 * Role System Constants - English Implementation
 *
 * CRITICAL LANGUAGE POLICY:
 * - All role constants, enums, and variables: ENGLISH ONLY
 * - Norwegian labels: via i18n translation keys only
 * - Comments and documentation: English
 *
 * This follows the project requirement: "lets keep english consistent language
 * for our code, comments, enums, roles etc. we will add norwegian as a UI
 * language later and add localization accordingly"
 *
 * @see ROLE_REDESIGN_PLAN_ENGLISH.md for complete role specifications
 * @module constants/roles
 */

import type { Database } from '@/types/database';

/**
 * Organization role type from database (ENGLISH)
 */
export type OrgRole = Database['public']['Enums']['org_role'];

/**
 * Platform role type from database
 */
export type PlatformRole = Database['public']['Enums']['platform_role'];

/**
 * All possible roles in the system (platform + org)
 */
export type SystemRole = PlatformRole | OrgRole;

/**
 * Extended organization role type including all variations
 * Used for comprehensive role checking and permissions
 */
export type ExtendedOrgRole = OrgRole;

/**
 * Platform role constants (ENGLISH)
 */
export const PLATFORM_ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  USER: 'user',
} as const;

/**
 * Organization role constants (ENGLISH)
 *
 * UPDATED: Now uses English role names in code
 * - case_handler (was: saksbehandler)
 * - editor (was: redaktør)
 * - read_only (was: lesetilgang)
 */
export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  CASE_HANDLER: 'case_handler',
  EDITOR: 'editor',
  READ_ONLY: 'read_only',
  CUSTOMER: 'customer',
  STAFF: 'staff', // DEPRECATED - mapped to case_handler
} as const;

/**
 * All system roles combined
 */
export const ALL_ROLES = {
  ...PLATFORM_ROLES,
  ...ORG_ROLES,
} as const;

/**
 * Role hierarchy priority mapping (ENGLISH)
 * Higher numbers indicate higher privilege levels
 *
 * Platform admin has implicit highest priority (handled separately)
 */
export const ROLE_PRIORITY: Readonly<Record<OrgRole, number>> = {
  owner: 100,         // Full organization control
  admin: 80,          // Administrator with full access
  case_handler: 60,   // Main operational role (Norwegian: Saksbehandler)
  editor: 40,         // Content management (Norwegian: Redaktør)
  read_only: 20,      // View-only access (Norwegian: Lesetilgang)
  customer: 10,       // End user
  staff: 60,          // DEPRECATED - maps to case_handler level
} as const;

// Alias for backwards compatibility
export const ROLE_HIERARCHY = ROLE_PRIORITY;

/**
 * i18n Translation Keys for Role Labels
 *
 * Norwegian translations in: locales/no/roles.json
 * English translations in: locales/en/roles.json
 *
 * Usage with react-i18next:
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * const label = t(ROLE_I18N_KEYS[role]);
 * ```
 */
export const ROLE_I18N_KEYS: Readonly<Record<SystemRole, string>> = {
  // Platform roles
  platform_admin: 'roles.platform_admin',
  user: 'roles.user',

  // Org roles (ENGLISH keys)
  owner: 'roles.owner',
  admin: 'roles.admin',
  case_handler: 'roles.case_handler',
  editor: 'roles.editor',
  read_only: 'roles.read_only',
  customer: 'roles.customer',
  staff: 'roles.staff_deprecated',
} as const;

/**
 * i18n Translation Keys for Role Descriptions
 *
 * Usage:
 * ```tsx
 * const description = t(ROLE_DESCRIPTION_I18N_KEYS[role]);
 * ```
 */
export const ROLE_DESCRIPTION_I18N_KEYS: Readonly<Record<SystemRole, string>> = {
  // Platform roles
  platform_admin: 'roles.descriptions.platform_admin',
  user: 'roles.descriptions.user',

  // Org roles
  owner: 'roles.descriptions.owner',
  admin: 'roles.descriptions.admin',
  case_handler: 'roles.descriptions.case_handler',
  editor: 'roles.descriptions.editor',
  read_only: 'roles.descriptions.read_only',
  customer: 'roles.descriptions.customer',
  staff: 'roles.descriptions.staff_deprecated',
} as const;

/**
 * TEMPORARY: Fallback English labels (until i18n is fully implemented)
 * These provide default English labels when i18n is not available
 *
 * @deprecated Use i18n translations instead (t(ROLE_I18N_KEYS[role]))
 */
export const ROLE_LABELS_EN: Readonly<Record<SystemRole, string>> = {
  // Platform roles
  platform_admin: 'Platform Administrator',
  user: 'User',

  // Org roles (ENGLISH)
  owner: 'Owner',
  admin: 'Administrator',
  case_handler: 'Case Handler',
  editor: 'Editor',
  read_only: 'Read Only',
  customer: 'Customer',
  staff: 'Staff (deprecated)',
} as const;

/**
 * TEMPORARY: Fallback Norwegian labels (until i18n is fully implemented)
 * These provide default Norwegian labels when i18n is not available
 *
 * @deprecated Use i18n translations instead (t(ROLE_I18N_KEYS[role]))
 */
export const ROLE_LABELS_NO: Readonly<Record<SystemRole, string>> = {
  // Platform roles
  platform_admin: 'Plattformadministrator',
  user: 'Bruker',

  // Org roles (Norwegian UI labels)
  owner: 'Eier',
  admin: 'Administrator',
  case_handler: 'Saksbehandler',
  editor: 'Redaktør',
  read_only: 'Lesetilgang',
  customer: 'Kunde',
  staff: 'Ansatt (utgått)',
} as const;

/**
 * Role descriptions in English
 */
export const ROLE_DESCRIPTIONS_EN: Readonly<Record<SystemRole, string>> = {
  // Platform roles
  platform_admin:
    'Full system access across all organizations. Can manage platform settings, users, and all organizational data.',
  user: 'Standard platform user with organization-specific permissions.',

  // Org roles (ENGLISH)
  owner:
    'Full control over the organization. Can manage all settings, members, facilities, bookings, and billing.',
  admin:
    'Administrative access to the organization. Can manage members, facilities, bookings, and most settings.',
  case_handler:
    'Main operational role for handling bookings, customer requests, and operational tasks. Can approve/reject bookings and manage availability.',
  editor:
    'Content management role. Can edit facility descriptions, upload images, manage tags and categories. Cannot handle bookings or manage users.',
  read_only:
    'View-only access to facilities, bookings, and reports. Cannot make any modifications.',
  customer:
    'Standard customer access. Can view facilities, create bookings, and manage own profile.',
  staff:
    'DEPRECATED - This role has been replaced by case_handler. Existing staff users will be migrated automatically.',
} as const;

/**
 * Role descriptions in Norwegian (Bokmål)
 */
export const ROLE_DESCRIPTIONS_NO: Readonly<Record<SystemRole, string>> = {
  // Platform roles
  platform_admin:
    'Full systemtilgang på tvers av alle organisasjoner. Kan administrere plattforminnstillinger, brukere og all organisasjonsdata.',
  user: 'Standard plattformbruker med organisasjonsspesifikke tillatelser.',

  // Org roles (Norwegian UI)
  owner:
    'Full kontroll over organisasjonen. Kan administrere alle innstillinger, medlemmer, fasiliteter, bookinger og fakturering.',
  admin:
    'Administrativ tilgang til organisasjonen. Kan administrere medlemmer, fasiliteter, bookinger og de fleste innstillinger.',
  case_handler:
    'Hovedrolle for drift og saksbehandling. Kan behandle bookinger, kundeforespørsler og operative oppgaver. Kan godkjenne/avvise bookinger og administrere tilgjengelighet.',
  editor:
    'Innholdsadministrasjonsrolle. Kan redigere fasilitetsbeskrivelser, laste opp bilder, administrere tags og kategorier. Kan ikke behandle bookinger eller administrere brukere.',
  read_only:
    'Kun lesetilgang til fasiliteter, bookinger og rapporter. Kan ikke gjøre endringer.',
  customer:
    'Standard kundetilgang. Kan se fasiliteter, opprette bookinger og administrere egen profil.',
  staff:
    'UTGÅTT - Denne rollen er erstattet av saksbehandler. Eksisterende ansatte vil bli migrert automatisk.',
} as const;

/**
 * Role groups for easier categorization
 */
export const ROLE_GROUPS = {
  PLATFORM: [PLATFORM_ROLES.PLATFORM_ADMIN, PLATFORM_ROLES.USER],
  ORG_LEADERSHIP: [ORG_ROLES.OWNER, ORG_ROLES.ADMIN],
  ORG_OPERATIONAL: [ORG_ROLES.CASE_HANDLER], // Main operational staff
  ORG_EDITORIAL: [ORG_ROLES.EDITOR], // Content management
  ORG_LIMITED: [ORG_ROLES.READ_ONLY], // View-only
  ORG_CUSTOMER: [ORG_ROLES.CUSTOMER],
  DEPRECATED: [ORG_ROLES.STAFF],
} as const;

/**
 * Role inheritance mapping (ENGLISH)
 * Defines which roles inherit permissions from other roles
 *
 * @example
 * ```typescript
 * // Owner inherits all permissions from admin, case_handler, etc.
 * ROLE_INHERITANCE.owner // ['admin', 'case_handler', 'editor', 'read_only', 'customer']
 * ```
 */
export const ROLE_INHERITANCE: Readonly<Record<OrgRole, ReadonlyArray<OrgRole>>> = {
  owner: ['admin', 'case_handler', 'editor', 'read_only', 'customer', 'staff'],
  admin: ['case_handler', 'editor', 'read_only', 'customer', 'staff'],
  case_handler: ['read_only', 'customer'],
  editor: ['read_only', 'customer'],
  read_only: ['customer'],
  customer: [],
  staff: ['read_only', 'customer'], // Deprecated but maintained
} as const;

/**
 * Backwards compatibility mapping
 * Maps deprecated 'staff' role to 'case_handler'
 */
export const ROLE_COMPATIBILITY_MAP: Readonly<Record<string, OrgRole>> = {
  staff: 'case_handler',
  employee: 'case_handler',
  worker: 'case_handler',
  member: 'customer',
  // Add Norwegian role name mappings for transition period
  saksbehandler: 'case_handler',
  redaktør: 'editor',
  lesetilgang: 'read_only',
} as const;

/**
 * Role badge color variants for UI
 * Used for visual differentiation in badges, tags, etc.
 */
export const ROLE_BADGE_VARIANTS: Record<
  OrgRole,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  owner: 'primary', // Purple/blue
  admin: 'secondary', // Blue
  case_handler: 'success', // Green
  editor: 'warning', // Yellow
  read_only: 'default', // Gray
  customer: 'default', // Default
  staff: 'warning', // Yellow (deprecated)
};

// ============================================
// Type Guards and Validation Functions
// ============================================

/**
 * Check if a role is a platform role
 *
 * @param role - Role to check
 * @returns True if platform role
 */
export const isPlatformRole = (role: string): role is PlatformRole => {
  return role === PLATFORM_ROLES.PLATFORM_ADMIN || role === PLATFORM_ROLES.USER;
};

/**
 * Check if a role is an organization role
 *
 * @param role - Role to check
 * @returns True if organization role
 */
export const isOrgRole = (role: string): role is OrgRole => {
  return Object.values(ORG_ROLES).includes(role as OrgRole);
};

/**
 * Check if a role exists in the system
 *
 * @param role - Role to check
 * @returns True if role exists
 */
export const isValidRole = (role: string): role is SystemRole => {
  return Object.values(ALL_ROLES).includes(role as SystemRole);
};

/**
 * Type guard to check if a string is a valid OrgRole
 */
export function isValidOrgRole(role: string): role is OrgRole {
  return role in ROLE_PRIORITY;
}

/**
 * Normalize a role (handles backwards compatibility)
 * Maps deprecated roles and Norwegian names to English equivalents
 *
 * @param role - Role to normalize
 * @returns Normalized role or original if no mapping exists
 */
export const normalizeRole = (role: string): OrgRole => {
  const roleKey = typeof role === 'string' ? role.toLowerCase() : '';
  const mapped = ROLE_COMPATIBILITY_MAP[roleKey];
  return mapped || (role as OrgRole);
};

// ============================================
// Role Comparison and Hierarchy Functions
// ============================================

/**
 * Check if a role has minimum required priority
 *
 * @param userRole - The user's current role
 * @param minRole - The minimum required role
 * @returns true if user role meets or exceeds minimum
 *
 * @example
 * ```ts
 * hasMinimumRole('admin', 'case_handler') // true (80 >= 60)
 * hasMinimumRole('editor', 'admin')       // false (40 < 80)
 * ```
 */
export function hasMinimumRole(
  userRole: OrgRole | null | undefined,
  minRole: OrgRole
): boolean {
  if (!userRole) return false;

  // Normalize deprecated roles
  const normalizedRole = normalizeRole(userRole);

  return ROLE_PRIORITY[normalizedRole] >= ROLE_PRIORITY[minRole];
}

/**
 * Check if a role is exactly the specified role
 *
 * @param userRole - The user's current role
 * @param targetRole - The target role to match
 * @returns true if roles match exactly
 */
export function isExactRole(
  userRole: OrgRole | null | undefined,
  targetRole: OrgRole
): boolean {
  if (!userRole) return false;

  // Normalize both roles for comparison
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedTargetRole = normalizeRole(targetRole);

  return normalizedUserRole === normalizedTargetRole;
}

/**
 * Get all roles that are equal or lower than the specified role
 * Used for role selection dropdowns
 *
 * @param maxRole - The maximum role level
 * @returns Array of roles equal or lower in hierarchy
 *
 * @example
 * ```ts
 * getAvailableRoles('admin')
 * // Returns: ['admin', 'case_handler', 'editor', 'read_only', 'customer']
 * ```
 */
export function getAvailableRoles(maxRole: OrgRole): OrgRole[] {
  const maxPriority = ROLE_PRIORITY[maxRole];

  return Object.entries(ROLE_PRIORITY)
    .filter(([role, priority]) => {
      // Exclude deprecated 'staff' from selection
      if (role === 'staff') return false;
      return priority <= maxPriority;
    })
    .sort(([, a], [, b]) => b - a) // Sort by priority descending
    .map(([role]) => role as OrgRole);
}

// ============================================
// Localization Helper Functions
// ============================================

/**
 * Get role label by locale
 *
 * TEMPORARY: Uses fallback constants until i18n is implemented
 * TODO: Replace with proper i18n translations
 *
 * @param role - Role to get label for
 * @param locale - Locale ('en' or 'no')
 * @returns Localized role label
 */
export const getRoleLabel = (role: SystemRole, locale: 'en' | 'no' = 'en'): string => {
  return locale === 'no' ? ROLE_LABELS_NO[role] : ROLE_LABELS_EN[role];
};

/**
 * Get role description by locale
 *
 * TEMPORARY: Uses fallback constants until i18n is implemented
 * TODO: Replace with proper i18n translations
 *
 * @param role - Role to get description for
 * @param locale - Locale ('en' or 'no')
 * @returns Localized role description
 */
export const getRoleDescription = (
  role: SystemRole,
  locale: 'en' | 'no' = 'en'
): string => {
  return locale === 'no' ? ROLE_DESCRIPTIONS_NO[role] : ROLE_DESCRIPTIONS_EN[role];
};

/**
 * Get all roles for a specific group
 *
 * @param group - Role group key
 * @returns Array of roles in the group
 */
export const getRolesByGroup = (
  group: keyof typeof ROLE_GROUPS
): ReadonlyArray<string> => {
  return ROLE_GROUPS[group];
};

// ============================================
// Permission Helper Functions (ENGLISH)
// ============================================

/**
 * Resource types for permission checking (ENGLISH)
 */
export const RESOURCES = {
  FACILITIES: 'facilities',
  BOOKINGS: 'bookings',
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  REPORTS: 'reports',
  MEDIA: 'media',
  TAGS: 'tags',
  CATEGORIES: 'categories',
  AVAILABILITY_RULES: 'availability_rules',
  REVIEWS: 'reviews',
  ROLES: 'roles',
  BILLING: 'billing',
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

/**
 * Action types for permission checking (ENGLISH)
 */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  ASSIGN: 'assign',
  VIEW: 'view',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

/**
 * Permission type combining resource and action
 */
export interface Permission {
  resource: Resource;
  action: Action;
}

// ============================================
// Role Capability Checks (ENGLISH)
// ============================================

/**
 * Check if a role can manage bookings
 */
export function canManageBookings(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return ['owner', 'admin', 'case_handler'].includes(normalizedRole);
}

/**
 * Check if a role can edit facilities
 */
export function canEditFacilities(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return ['owner', 'admin', 'editor'].includes(normalizedRole);
}

/**
 * Check if a role can manage users
 */
export function canManageUsers(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return ['owner', 'admin'].includes(normalizedRole);
}

/**
 * Check if a role can view reports
 */
export function canViewReports(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return normalizedRole !== 'customer';
}

/**
 * Check if a role can export data
 */
export function canExportData(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return ['owner', 'admin', 'case_handler', 'read_only'].includes(normalizedRole);
}

/**
 * Check if a role can manage media
 */
export function canManageMedia(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return ['owner', 'admin', 'editor'].includes(normalizedRole);
}

/**
 * Check if a role has full access
 */
export function hasFullAccess(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return ['owner', 'admin'].includes(normalizedRole);
}

/**
 * Check if a role has read-only access
 */
export function hasReadOnlyAccess(role: OrgRole | null | undefined): boolean {
  return role === 'read_only';
}

/**
 * Check if a role is operational (handles bookings)
 */
export function isOperationalRole(role: OrgRole | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'case_handler';
}

/**
 * Check if a role is editorial (content management)
 */
export function isEditorialRole(role: OrgRole | null | undefined): boolean {
  return role === 'editor';
}

/**
 * Check if a role is deprecated
 */
export function isDeprecatedRole(role: OrgRole | null | undefined): boolean {
  return role === 'staff';
}
