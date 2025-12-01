/**
 * Role Helper Utilities
 *
 * Comprehensive utility functions for role checking, permission validation,
 * and RBAC operations with strict type safety.
 *
 * @module shared/utils/role
 */

import {
  ROLE_PRIORITY,
  ROLE_INHERITANCE,
  normalizeRole,
  isValidOrgRole,
  isPlatformRole,
  getRoleLabel,
  type PlatformRole,
  type ExtendedOrgRole,
  type SystemRole,
} from '@/constants/roles';

import type {
  Permission,
  PermissionMatrix,
  RolePermissionMap,
  RoleComparisonResult,
  RoleValidationResult,
  RoleFeatureFlags,
  PermissionScope,
  ResourceType,
  ActionType,
} from '@/types/rbac';

/**
 * Permission matrix for each role
 * Defines what resources and actions each role can perform
 */
const PERMISSION_MATRICES: RolePermissionMap = {
  // Owner has full access to everything
  owner: [
    { resource: 'facilities', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'bookings', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    {
      resource: 'availability_rules',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'blackouts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    {
      resource: 'pricing_rules',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'zones', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reviews', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    {
      resource: 'memberships',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    {
      resource: 'organizations',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'profiles', actions: ['read', 'update', 'manage'] },
    { resource: 'favorites', actions: ['create', 'read', 'delete'] },
    { resource: 'notifications', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read', 'export', 'manage'] },
    { resource: 'billing', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'audit_logs', actions: ['read', 'export', 'manage'] },
    {
      resource: 'support_tickets',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    {
      resource: 'additional_services',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'reports', actions: ['read', 'create', 'export', 'manage'] },
  ],

  // Admin has most permissions except organization deletion and some billing
  admin: [
    { resource: 'facilities', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'bookings', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    {
      resource: 'availability_rules',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'blackouts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    {
      resource: 'pricing_rules',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'zones', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reviews', actions: ['read', 'update', 'delete', 'manage'] },
    { resource: 'memberships', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'organizations', actions: ['read', 'update'] },
    { resource: 'profiles', actions: ['read', 'update'] },
    { resource: 'favorites', actions: ['create', 'read', 'delete'] },
    { resource: 'notifications', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read', 'export'] },
    { resource: 'billing', actions: ['read', 'update'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'audit_logs', actions: ['read', 'export'] },
    { resource: 'support_tickets', actions: ['create', 'read', 'update', 'delete'] },
    {
      resource: 'additional_services',
      actions: ['create', 'read', 'update', 'delete', 'manage'],
    },
    { resource: 'reports', actions: ['read', 'create', 'export'] },
  ],

  // Redaktør (Editor) - Content and facility management
  redaktør: [
    { resource: 'facilities', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'bookings', actions: ['read', 'update'] },
    { resource: 'availability_rules', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'blackouts', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'pricing_rules', actions: ['read', 'update'] },
    { resource: 'zones', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reviews', actions: ['read', 'update', 'delete'] },
    { resource: 'memberships', actions: ['read'] },
    { resource: 'organizations', actions: ['read'] },
    { resource: 'profiles', actions: ['read', 'update'] },
    { resource: 'favorites', actions: ['create', 'read', 'delete'] },
    { resource: 'notifications', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'billing', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'audit_logs', actions: ['read'] },
    { resource: 'support_tickets', actions: ['create', 'read', 'update'] },
    { resource: 'additional_services', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'create'] },
  ],

  // Saksbehandler (Case Handler) - Booking and customer management
  saksbehandler: [
    { resource: 'facilities', actions: ['read'] },
    { resource: 'bookings', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'availability_rules', actions: ['read'] },
    { resource: 'blackouts', actions: ['read', 'create'] },
    { resource: 'pricing_rules', actions: ['read'] },
    { resource: 'zones', actions: ['read'] },
    { resource: 'reviews', actions: ['read', 'update'] },
    { resource: 'memberships', actions: ['read'] },
    { resource: 'organizations', actions: ['read'] },
    { resource: 'profiles', actions: ['read', 'update'] },
    { resource: 'favorites', actions: ['create', 'read', 'delete'] },
    { resource: 'notifications', actions: ['read', 'create'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'billing', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'audit_logs', actions: ['read'] },
    { resource: 'support_tickets', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'additional_services', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['read'] },
  ],

  // Staff - Operational access
  staff: [
    { resource: 'facilities', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'bookings', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'availability_rules', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'blackouts', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'pricing_rules', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'zones', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reviews', actions: ['read', 'delete'] },
    { resource: 'memberships', actions: ['read'] },
    { resource: 'organizations', actions: ['read'] },
    { resource: 'profiles', actions: ['read', 'update'] },
    { resource: 'favorites', actions: ['create', 'read', 'delete'] },
    { resource: 'notifications', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'billing', actions: ['read'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'audit_logs', actions: ['read'] },
    { resource: 'support_tickets', actions: ['create', 'read', 'update'] },
    { resource: 'additional_services', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
  ],

  // Lesetilgang (Read-only) - View access only
  lesetilgang: [
    { resource: 'facilities', actions: ['read'] },
    { resource: 'bookings', actions: ['read'] },
    { resource: 'availability_rules', actions: ['read'] },
    { resource: 'blackouts', actions: ['read'] },
    { resource: 'pricing_rules', actions: ['read'] },
    { resource: 'zones', actions: ['read'] },
    { resource: 'reviews', actions: ['read'] },
    { resource: 'memberships', actions: ['read'] },
    { resource: 'organizations', actions: ['read'] },
    { resource: 'profiles', actions: ['read'] },
    { resource: 'favorites', actions: ['read'] },
    { resource: 'notifications', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'billing', actions: [] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'audit_logs', actions: [] },
    { resource: 'support_tickets', actions: ['create', 'read'] },
    { resource: 'additional_services', actions: ['read'] },
    { resource: 'reports', actions: ['read'] },
  ],

  // Customer - Limited access
  customer: [
    { resource: 'facilities', actions: ['read'] },
    { resource: 'bookings', actions: ['create', 'read', 'update'] },
    { resource: 'availability_rules', actions: ['read'] },
    { resource: 'blackouts', actions: ['read'] },
    { resource: 'pricing_rules', actions: ['read'] },
    { resource: 'zones', actions: ['read'] },
    { resource: 'reviews', actions: ['create', 'read'] },
    { resource: 'memberships', actions: [] },
    { resource: 'organizations', actions: ['read'] },
    { resource: 'profiles', actions: ['read', 'update'] },
    { resource: 'favorites', actions: ['create', 'read', 'delete'] },
    { resource: 'notifications', actions: ['read', 'update'] },
    { resource: 'analytics', actions: [] },
    { resource: 'billing', actions: [] },
    { resource: 'settings', actions: [] },
    { resource: 'audit_logs', actions: [] },
    { resource: 'support_tickets', actions: ['create', 'read'] },
    { resource: 'additional_services', actions: ['read'] },
    { resource: 'reports', actions: [] },
  ],
} as const;

/**
 * Feature flags based on roles
 */
const ROLE_FEATURES: RoleFeatureFlags = {
  analytics_dashboard: {
    key: 'analytics_dashboard',
    name: 'Analytics Dashboard',
    description: 'Access to analytics and reporting dashboard',
    enabledForRoles: ['owner', 'admin', 'redaktør', 'saksbehandler', 'staff', 'lesetilgang'],
    enabled: true,
  },
  billing_management: {
    key: 'billing_management',
    name: 'Billing Management',
    description: 'Manage billing and payment settings',
    enabledForRoles: ['owner', 'admin'],
    enabled: true,
  },
  member_management: {
    key: 'member_management',
    name: 'Member Management',
    description: 'Add, remove, and manage organization members',
    enabledForRoles: ['owner', 'admin'],
    enabled: true,
  },
  facility_management: {
    key: 'facility_management',
    name: 'Facility Management',
    description: 'Create and manage facilities',
    enabledForRoles: ['owner', 'admin', 'redaktør', 'staff'],
    enabled: true,
  },
  booking_management: {
    key: 'booking_management',
    name: 'Booking Management',
    description: 'Manage all bookings',
    enabledForRoles: ['owner', 'admin', 'saksbehandler', 'staff'],
    enabled: true,
  },
  advanced_reporting: {
    key: 'advanced_reporting',
    name: 'Advanced Reporting',
    description: 'Access to advanced reports and data export',
    enabledForRoles: ['owner', 'admin', 'redaktør'],
    enabled: true,
  },
  audit_logs: {
    key: 'audit_logs',
    name: 'Audit Logs',
    description: 'View audit logs and system events',
    enabledForRoles: ['owner', 'admin'],
    enabled: true,
  },
  platform_admin: {
    key: 'platform_admin',
    name: 'Platform Administration',
    description: 'Platform-wide administrative access',
    enabledForRoles: ['platform_admin'],
    enabled: true,
  },
} as const;

/**
 * Check if user has minimum role
 *
 * @param userRole - User's current role
 * @param requiredRole - Minimum required role
 * @param isPlatformAdmin - Whether user is platform admin
 * @returns True if user has sufficient role
 *
 * @example
 * ```typescript
 * hasMinimumRole('staff', 'admin', false) // false
 * hasMinimumRole('admin', 'staff', false) // true
 * hasMinimumRole('customer', 'owner', true) // true (platform admin)
 * ```
 */
export const hasMinimumRole = (
  userRole: ExtendedOrgRole | null,
  requiredRole: ExtendedOrgRole,
  isPlatformAdmin: boolean = false
): boolean => {
  if (isPlatformAdmin) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  if (!normalizedUserRole || !normalizedRequiredRole) {
    return false;
  }

  return ROLE_PRIORITY[normalizedUserRole] >= ROLE_PRIORITY[normalizedRequiredRole];
};

/**
 * Check if user has exact role
 *
 * @param userRole - User's current role
 * @param targetRole - Target role to check
 * @returns True if roles match
 */
export const hasExactRole = (
  userRole: ExtendedOrgRole | null,
  targetRole: ExtendedOrgRole
): boolean => {
  if (!userRole) {
    return false;
  }

  const normalized = normalizeRole(userRole);
  return normalized === targetRole;
};

/**
 * Check if user has any of the specified roles
 *
 * @param userRole - User's current role
 * @param roles - Array of roles to check
 * @param isPlatformAdmin - Whether user is platform admin
 * @returns True if user has any of the roles
 */
export const hasAnyRole = (
  userRole: ExtendedOrgRole | null,
  roles: ReadonlyArray<ExtendedOrgRole>,
  isPlatformAdmin: boolean = false
): boolean => {
  if (isPlatformAdmin) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  return roles.some((role) => hasExactRole(userRole, role));
};

/**
 * Get inherited roles for a role
 *
 * @param role - Role to get inheritance for
 * @returns Array of inherited roles
 */
export const getInheritedRoles = (
  role: ExtendedOrgRole
): ReadonlyArray<ExtendedOrgRole> => {
  return ROLE_INHERITANCE[role] || [];
};

/**
 * Check if user can perform action on resource
 *
 * @param userRole - User's current role
 * @param resource - Resource type
 * @param action - Action type
 * @param isPlatformAdmin - Whether user is platform admin
 * @param scope - Optional permission scope
 * @returns True if action is allowed
 */
export const canPerformAction = (
  userRole: ExtendedOrgRole | null,
  resource: ResourceType,
  action: ActionType,
  isPlatformAdmin: boolean = false,
  scope?: PermissionScope
): boolean => {
  if (isPlatformAdmin) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) {
    return false;
  }

  const permissions = PERMISSION_MATRICES[normalizedRole];
  if (!permissions) {
    return false;
  }

  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) {
    return false;
  }

  const hasAction = resourcePermission.actions.includes(action);

  // Check scope-based conditions if provided
  if (hasAction && resourcePermission.condition && scope) {
    return evaluatePermissionCondition(resourcePermission.condition, scope);
  }

  return hasAction;
};

/**
 * Evaluate permission condition against scope
 *
 * @param condition - Permission condition
 * @param scope - Permission scope
 * @returns True if condition is met
 */
const evaluatePermissionCondition = (
  condition: { type: string; field?: string; value?: unknown },
  scope: PermissionScope
): boolean => {
  switch (condition.type) {
    case 'owner':
      return scope.isOwner === true;
    case 'member':
      return !!scope.userId;
    case 'creator':
      return scope.isOwner === true;
    default:
      return true;
  }
};

/**
 * Get permission matrix for role
 *
 * @param role - Role to get permissions for
 * @returns Permission matrix
 */
export const getPermissionMatrix = (role: ExtendedOrgRole): PermissionMatrix => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? PERMISSION_MATRICES[normalizedRole] : [];
};

/**
 * Get all permissions for role as flat array
 *
 * @param role - Role to get permissions for
 * @returns Array of permissions
 */
export const getAllPermissions = (role: ExtendedOrgRole): ReadonlyArray<Permission> => {
  const matrix = getPermissionMatrix(role);
  return matrix.flatMap((entry) =>
    entry.actions.map((action) => ({ resource: entry.resource, action }))
  );
};

/**
 * Compare two roles
 *
 * @param role1 - First role
 * @param role2 - Second role
 * @returns Comparison result
 */
export const compareRoles = (
  role1: ExtendedOrgRole,
  role2: ExtendedOrgRole
): RoleComparisonResult => {
  const normalized1 = normalizeRole(role1);
  const normalized2 = normalizeRole(role2);

  if (!normalized1 || !normalized2) {
    return {
      role1,
      role2,
      role1IsHigher: false,
      role1IsEqual: false,
      role1IsLower: false,
      priorityDifference: 0,
    };
  }

  const priority1 = ROLE_PRIORITY[normalized1];
  const priority2 = ROLE_PRIORITY[normalized2];
  const difference = priority1 - priority2;

  return {
    role1: normalized1,
    role2: normalized2,
    role1IsHigher: difference > 0,
    role1IsEqual: difference === 0,
    role1IsLower: difference < 0,
    priorityDifference: difference,
  };
};

/**
 * Validate role
 *
 * @param role - Role to validate
 * @returns Validation result
 */
export const validateRole = (role: string): RoleValidationResult => {
  if (isValidOrgRole(role)) {
    return {
      valid: true,
      role: role as ExtendedOrgRole,
    };
  }

  const normalized = normalizeRole(role);
  if (isValidOrgRole(normalized)) {
    return {
      valid: true,
      role: normalized,
    };
  }

  // Provide suggestions for similar roles
  const suggestions: ExtendedOrgRole[] = [];
  const lowerRole = (role as string).toLowerCase();

  if (lowerRole.includes('admin')) {
    suggestions.push('admin');
  }
  if (lowerRole.includes('staff') || lowerRole.includes('employee')) {
    suggestions.push('staff');
  }
  if (lowerRole.includes('owner')) {
    suggestions.push('owner');
  }
  if (lowerRole.includes('customer') || lowerRole.includes('user')) {
    suggestions.push('customer');
  }

  return {
    valid: false,
    error: `Invalid role: ${role}`,
    suggestions: suggestions.length > 0 ? suggestions : ['customer'],
  };
};

/**
 * Check if user has feature access
 *
 * @param userRole - User's current role
 * @param featureKey - Feature key to check
 * @param isPlatformAdmin - Whether user is platform admin
 * @returns True if user has feature access
 */
export const hasFeatureAccess = (
  userRole: ExtendedOrgRole | PlatformRole | null,
  featureKey: string,
  isPlatformAdmin: boolean = false
): boolean => {
  const feature = ROLE_FEATURES[featureKey];
  if (!feature || !feature.enabled) {
    return false;
  }

  if (isPlatformAdmin && isPlatformRole('platform_admin')) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  return feature.enabledForRoles.includes(userRole as ExtendedOrgRole | PlatformRole);
};

/**
 * Get all enabled features for role
 *
 * @param userRole - User's current role
 * @param isPlatformAdmin - Whether user is platform admin
 * @returns Array of enabled feature keys
 */
export const getEnabledFeatures = (
  userRole: ExtendedOrgRole | PlatformRole | null,
  isPlatformAdmin: boolean = false
): ReadonlyArray<string> => {
  if (!userRole && !isPlatformAdmin) {
    return [];
  }

  return Object.entries(ROLE_FEATURES)
    .filter(([, feature]) => hasFeatureAccess(userRole, feature.key, isPlatformAdmin))
    .map(([, feature]) => feature.key);
};

/**
 * Get role priority
 *
 * @param role - Role to get priority for
 * @returns Priority number (higher = more privileges)
 */
export const getRolePriority = (role: ExtendedOrgRole): number => {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_PRIORITY[normalized] : 0;
};

/**
 * Check if role can be assigned by current role
 *
 * @param currentRole - Current user's role
 * @param targetRole - Role to assign
 * @param isPlatformAdmin - Whether current user is platform admin
 * @returns True if assignment is allowed
 */
export const canAssignRole = (
  currentRole: ExtendedOrgRole | null,
  targetRole: ExtendedOrgRole,
  isPlatformAdmin: boolean = false
): boolean => {
  if (isPlatformAdmin) {
    return true;
  }

  if (!currentRole) {
    return false;
  }

  // Only owner and admin can assign roles
  if (!hasMinimumRole(currentRole, 'admin', isPlatformAdmin)) {
    return false;
  }

  // Cannot assign a role higher than or equal to own role (except for owners)
  if (currentRole === 'owner') {
    return true;
  }

  return getRolePriority(currentRole) > getRolePriority(targetRole);
};

/**
 * Get highest role from array of roles
 *
 * @param roles - Array of roles
 * @returns Highest priority role
 */
export const getHighestRole = (
  roles: ReadonlyArray<ExtendedOrgRole>
): ExtendedOrgRole | null => {
  if (roles.length === 0) {
    return null;
  }

  return roles.reduce((highest, current) => {
    const comparison = compareRoles(current, highest);
    return comparison.role1IsHigher ? current : highest;
  });
};

/**
 * Format role for display
 *
 * @param role - Role to format
 * @param locale - Locale for translation
 * @returns Formatted role label
 */
export const formatRole = (role: SystemRole, locale: 'en' | 'no' = 'en'): string => {
  return getRoleLabel(role, locale);
};

/**
 * Get role badge color for UI
 *
 * @param role - Role to get color for
 * @returns Tailwind color class
 */
export const getRoleBadgeColor = (role: ExtendedOrgRole): string => {
  const normalized = normalizeRole(role);
  if (!normalized) {
    return 'bg-gray-500';
  }

  const colorMap: Record<ExtendedOrgRole, string> = {
    owner: 'bg-purple-600',
    admin: 'bg-blue-600',
    redaktør: 'bg-indigo-600',
    saksbehandler: 'bg-cyan-600',
    staff: 'bg-green-600',
    lesetilgang: 'bg-yellow-600',
    customer: 'bg-gray-600',
  };

  return colorMap[normalized] || 'bg-gray-600';
};

/**
 * Export permission matrices for external use
 */
export const getPermissionMatrices = (): RolePermissionMap => {
  return PERMISSION_MATRICES;
};

/**
 * Export feature flags for external use
 */
export const getFeatureFlags = (): RoleFeatureFlags => {
  return ROLE_FEATURES;
};
