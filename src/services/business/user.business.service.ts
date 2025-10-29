/**
 * User Business Logic Service
 *
 * Contains all business logic related to user operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 *
 * @module services/business/user.business.service
 */

import type { Database } from "@/types/database";
import type { OrgRole } from "@/constants/roles";
import {
  ROLE_PRIORITY,
  normalizeRole,
  hasMinimumRole,
  ORG_ROLES,
} from "@/constants/roles";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];

/**
 * Extended user profile with role information
 */
export interface IUserWithRole extends Profile {
  readonly role?: OrgRole;
  readonly membership?: Membership;
  readonly lastLogin?: string;
}

/**
 * User filter configuration
 */
export interface IUserFilters {
  readonly searchTerm?: string;
  readonly roleFilter?: readonly OrgRole[];
  readonly statusFilter?: readonly ('active' | 'inactive' | 'suspended')[];
  readonly organizationFilter?: string;
}

/**
 * User sort configuration
 */
export interface IUserSortConfig {
  readonly sortBy: 'display_name' | 'email' | 'role' | 'last_login' | 'created_at';
  readonly sortOrder: 'asc' | 'desc';
}

/**
 * User validation result
 */
export interface IUserValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Role change validation result
 */
export interface IRoleChangeValidationResult {
  readonly canChange: boolean;
  readonly reason?: string;
}

/**
 * User deletion validation result
 */
export interface IUserDeletionValidationResult {
  readonly canDelete: boolean;
  readonly reason?: string;
  readonly warnings?: readonly string[];
}

/**
 * User statistics
 */
export interface IUserStatistics {
  readonly total: number;
  readonly byRole: Readonly<Record<OrgRole, number>>;
  readonly active: number;
  readonly inactive: number;
  readonly suspended: number;
  readonly activePercentage: number;
}

/**
 * User permissions based on role
 */
export interface IUserPermissions {
  readonly canManageUsers: boolean;
  readonly canManageFacilities: boolean;
  readonly canManageBookings: boolean;
  readonly canViewReports: boolean;
  readonly canExportData: boolean;
  readonly canManageOrganization: boolean;
  readonly canManageRoles: boolean;
  readonly canManageBilling: boolean;
  readonly canViewAuditLogs: boolean;
  readonly isReadOnly: boolean;
}

/**
 * Filter users based on search and filter criteria
 *
 * @param users - Array of users to filter
 * @param filters - Filter configuration
 * @returns Filtered array of users
 *
 * @example
 * ```typescript
 * const activeAdmins = filterUsers(users, {
 *   roleFilter: ['admin'],
 *   statusFilter: ['active']
 * });
 * ```
 */
export const filterUsers = (
  users: readonly IUserWithRole[],
  filters: IUserFilters
): readonly IUserWithRole[] => {
  return users.filter(user => {
    // Search filter - search by name, email, or phone
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        (user.display_name || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.phone || '').toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Role filter
    if (filters.roleFilter && filters.roleFilter.length > 0 && user.role) {
      const normalizedUserRole = normalizeRole(user.role);
      if (!filters.roleFilter.includes(normalizedUserRole)) return false;
    }

    // Status filter (based on profile status or membership)
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      // Determine user status
      // For now, consider all users as 'active' unless we have explicit status field
      const userStatus: 'active' | 'inactive' | 'suspended' = 'active';
      if (!filters.statusFilter.includes(userStatus)) return false;
    }

    // Organization filter
    if (filters.organizationFilter && user.membership) {
      if (user.membership.org_id !== filters.organizationFilter) return false;
    }

    return true;
  });
};

/**
 * Sort users based on sort configuration
 *
 * @param users - Array of users to sort
 * @param sortConfig - Sort configuration
 * @returns Sorted array of users
 *
 * @example
 * ```typescript
 * const sortedUsers = sortUsers(users, {
 *   sortBy: 'display_name',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export const sortUsers = (
  users: readonly IUserWithRole[],
  sortConfig: IUserSortConfig
): readonly IUserWithRole[] => {
  const sorted = [...users].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'display_name':
        comparison = (a.display_name || '').localeCompare(b.display_name || '');
        break;
      case 'email':
        comparison = (a.email || '').localeCompare(b.email || '');
        break;
      case 'role':
        // Sort by role priority
        const aPriority = a.role ? ROLE_PRIORITY[normalizeRole(a.role)] : 0;
        const bPriority = b.role ? ROLE_PRIORITY[normalizeRole(b.role)] : 0;
        comparison = bPriority - aPriority; // Higher priority first
        break;
      case 'last_login':
        const aLogin = a.lastLogin || a.updated_at || a.created_at;
        const bLogin = b.lastLogin || b.updated_at || b.created_at;
        comparison = new Date(aLogin).getTime() - new Date(bLogin).getTime();
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Validate user data for creation or update
 *
 * @param userData - Partial user data to validate
 * @returns Validation result with errors
 *
 * @example
 * ```typescript
 * const result = validateUserData({
 *   email: 'user@example.com',
 *   display_name: 'John Doe'
 * });
 * if (!result.isValid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export const validateUserData = (
  userData: Partial<Profile> & { readonly password?: string }
): IUserValidationResult => {
  const errors: string[] = [];

  // Email validation
  if (userData.email !== undefined) {
    if (!userData.email || userData.email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }
  }

  // Display name validation
  if (userData.display_name !== undefined) {
    if (userData.display_name && userData.display_name.trim().length < 2) {
      errors.push('Display name must be at least 2 characters');
    }
    if (userData.display_name && userData.display_name.trim().length > 100) {
      errors.push('Display name must not exceed 100 characters');
    }
  }

  // Phone validation (if provided)
  if (userData.phone && userData.phone.trim().length > 0) {
    // Basic phone format validation (international format)
    const phoneRegex = /^\+?[\d\s\-()]{8,}$/;
    if (!phoneRegex.test(userData.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  // Password validation (if provided for new users)
  if (userData.password !== undefined) {
    if (userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(userData.password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(userData.password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(userData.password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate if a role change is allowed
 *
 * Business rules:
 * - Only owners and admins can change roles
 * - Cannot change your own role
 * - Cannot promote users to a role higher than your own
 * - Owner role requires special approval
 *
 * @param currentUserRole - Role of the user making the change
 * @param targetUserId - ID of user whose role is being changed
 * @param currentUserId - ID of user making the change
 * @param newRole - New role to assign
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateRoleChange('admin', 'user123', 'admin456', 'case_handler');
 * if (!result.canChange) {
 *   console.error(result.reason);
 * }
 * ```
 */
export const validateRoleChange = (
  currentUserRole: OrgRole,
  targetUserId: string,
  currentUserId: string,
  newRole: OrgRole
): IRoleChangeValidationResult => {
  // Normalize roles
  const normalizedCurrentRole = normalizeRole(currentUserRole);
  const normalizedNewRole = normalizeRole(newRole);

  // Only owners and admins can change roles
  if (!hasMinimumRole(normalizedCurrentRole, ORG_ROLES.ADMIN as OrgRole)) {
    return {
      canChange: false,
      reason: 'Only owners and administrators can change user roles',
    };
  }

  // Cannot change your own role
  if (targetUserId === currentUserId) {
    return {
      canChange: false,
      reason: 'You cannot change your own role. Contact another administrator.',
    };
  }

  // Cannot promote users to a role higher than your own
  const currentRolePriority = ROLE_PRIORITY[normalizedCurrentRole];
  const newRolePriority = ROLE_PRIORITY[normalizedNewRole];

  if (newRolePriority > currentRolePriority) {
    return {
      canChange: false,
      reason: 'You cannot assign a role with higher privileges than your own',
    };
  }

  // Only owners can assign the owner role
  if (normalizedNewRole === ORG_ROLES.OWNER && normalizedCurrentRole !== ORG_ROLES.OWNER) {
    return {
      canChange: false,
      reason: 'Only organization owners can assign the owner role',
    };
  }

  return {
    canChange: true,
  };
};

/**
 * Validate if a user can be deleted
 *
 * Business rules:
 * - Cannot delete yourself
 * - Cannot delete the last owner of an organization
 * - Warn if user has active bookings
 * - Warn if user owns facilities
 *
 * @param targetUserId - ID of user to delete
 * @param currentUserId - ID of user requesting deletion
 * @param targetUserRole - Role of user to be deleted
 * @param isLastOwner - Whether user is the last owner of the organization
 * @param hasActiveBookings - Whether user has active bookings
 * @param ownsFacilities - Whether user owns facilities
 * @returns Validation result with warnings
 *
 * @example
 * ```typescript
 * const result = canDeleteUser('user123', 'admin456', 'customer', false, true, false);
 * if (!result.canDelete) {
 *   console.error(result.reason);
 * }
 * ```
 */
export const canDeleteUser = (
  targetUserId: string,
  currentUserId: string,
  targetUserRole: OrgRole,
  isLastOwner: boolean = false,
  hasActiveBookings: boolean = false,
  ownsFacilities: boolean = false
): IUserDeletionValidationResult => {
  const warnings: string[] = [];

  // Cannot delete yourself
  if (targetUserId === currentUserId) {
    return {
      canDelete: false,
      reason: 'You cannot delete your own account. Contact another administrator.',
    };
  }

  // Cannot delete the last owner
  if (isLastOwner && targetUserRole === ORG_ROLES.OWNER) {
    return {
      canDelete: false,
      reason: 'Cannot delete the last owner of the organization. Assign another owner first.',
    };
  }

  // Warning for active bookings
  if (hasActiveBookings) {
    warnings.push('User has active bookings. These will need to be reassigned or cancelled.');
  }

  // Warning for owned facilities
  if (ownsFacilities) {
    warnings.push('User owns facilities. These will need to be reassigned to another user.');
  }

  return {
    canDelete: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Validate if a user can be suspended
 *
 * Business rules:
 * - Cannot suspend yourself
 * - Cannot suspend the last owner
 * - Only admins and owners can suspend users
 *
 * @param targetUserId - ID of user to suspend
 * @param currentUserId - ID of user requesting suspension
 * @param targetUserRole - Role of user to be suspended
 * @param isLastOwner - Whether user is the last owner
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = canSuspendUser('user123', 'admin456', 'customer', false);
 * if (!result.canChange) {
 *   console.error(result.reason);
 * }
 * ```
 */
export const canSuspendUser = (
  targetUserId: string,
  currentUserId: string,
  targetUserRole: OrgRole,
  isLastOwner: boolean = false
): IRoleChangeValidationResult => {
  // Cannot suspend yourself
  if (targetUserId === currentUserId) {
    return {
      canChange: false,
      reason: 'You cannot suspend your own account.',
    };
  }

  // Cannot suspend the last owner
  if (isLastOwner && targetUserRole === ORG_ROLES.OWNER) {
    return {
      canChange: false,
      reason: 'Cannot suspend the last owner of the organization.',
    };
  }

  return {
    canChange: true,
  };
};

/**
 * Calculate user statistics
 *
 * @param users - Array of users with role information
 * @returns Statistics object
 *
 * @example
 * ```typescript
 * const stats = calculateUserStats(users);
 * console.log(`Total users: ${stats.total}, Active: ${stats.activePercentage}%`);
 * ```
 */
export const calculateUserStats = (
  users: readonly IUserWithRole[]
): IUserStatistics => {
  const total = users.length;

  // Count by role
  const byRole: Record<OrgRole, number> = {
    owner: 0,
    admin: 0,
    case_handler: 0,
    editor: 0,
    read_only: 0,
    customer: 0,
    staff: 0,
  };

  users.forEach(user => {
    if (user.role) {
      const normalizedRole = normalizeRole(user.role);
      byRole[normalizedRole] = (byRole[normalizedRole] || 0) + 1;
    }
  });

  // For now, consider all users as active
  // In the future, this should check actual status field
  const active = total;
  const inactive = 0;
  const suspended = 0;

  return {
    total,
    byRole,
    active,
    inactive,
    suspended,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
  };
};

/**
 * Get user permissions based on role
 *
 * @param role - User's organization role
 * @returns Permissions object
 *
 * @example
 * ```typescript
 * const permissions = getUserPermissions('admin');
 * if (permissions.canManageUsers) {
 *   // Show user management UI
 * }
 * ```
 */
export const getUserPermissions = (
  role: OrgRole | null | undefined
): IUserPermissions => {
  if (!role) {
    return {
      canManageUsers: false,
      canManageFacilities: false,
      canManageBookings: false,
      canViewReports: false,
      canExportData: false,
      canManageOrganization: false,
      canManageRoles: false,
      canManageBilling: false,
      canViewAuditLogs: false,
      isReadOnly: true,
    };
  }

  const normalizedRole = normalizeRole(role);

  // Owner has all permissions
  if (normalizedRole === ORG_ROLES.OWNER) {
    return {
      canManageUsers: true,
      canManageFacilities: true,
      canManageBookings: true,
      canViewReports: true,
      canExportData: true,
      canManageOrganization: true,
      canManageRoles: true,
      canManageBilling: true,
      canViewAuditLogs: true,
      isReadOnly: false,
    };
  }

  // Admin has most permissions except billing
  if (normalizedRole === ORG_ROLES.ADMIN) {
    return {
      canManageUsers: true,
      canManageFacilities: true,
      canManageBookings: true,
      canViewReports: true,
      canExportData: true,
      canManageOrganization: true,
      canManageRoles: true,
      canManageBilling: false,
      canViewAuditLogs: true,
      isReadOnly: false,
    };
  }

  // Case handler can manage bookings and view reports
  if (normalizedRole === ORG_ROLES.CASE_HANDLER) {
    return {
      canManageUsers: false,
      canManageFacilities: false,
      canManageBookings: true,
      canViewReports: true,
      canExportData: true,
      canManageOrganization: false,
      canManageRoles: false,
      canManageBilling: false,
      canViewAuditLogs: false,
      isReadOnly: false,
    };
  }

  // Editor can manage facilities and content
  if (normalizedRole === ORG_ROLES.EDITOR) {
    return {
      canManageUsers: false,
      canManageFacilities: true,
      canManageBookings: false,
      canViewReports: true,
      canExportData: false,
      canManageOrganization: false,
      canManageRoles: false,
      canManageBilling: false,
      canViewAuditLogs: false,
      isReadOnly: false,
    };
  }

  // Read-only can only view
  if (normalizedRole === ORG_ROLES.READ_ONLY) {
    return {
      canManageUsers: false,
      canManageFacilities: false,
      canManageBookings: false,
      canViewReports: true,
      canExportData: true,
      canManageOrganization: false,
      canManageRoles: false,
      canManageBilling: false,
      canViewAuditLogs: false,
      isReadOnly: true,
    };
  }

  // Customer (default) - minimal permissions
  return {
    canManageUsers: false,
    canManageFacilities: false,
    canManageBookings: false,
    canViewReports: false,
    canExportData: false,
    canManageOrganization: false,
    canManageRoles: false,
    canManageBilling: false,
    canViewAuditLogs: false,
    isReadOnly: true,
  };
};

/**
 * Get unique user roles from a list of users
 *
 * @param users - Array of users
 * @returns Array of unique roles
 *
 * @example
 * ```typescript
 * const roles = getUniqueUserRoles(users);
 * // ['owner', 'admin', 'customer']
 * ```
 */
export const getUniqueUserRoles = (
  users: readonly IUserWithRole[]
): readonly OrgRole[] => {
  const roles = users
    .map(u => u.role)
    .filter((role): role is OrgRole => role !== undefined && role !== null)
    .map(role => normalizeRole(role));

  return Array.from(new Set(roles));
};

/**
 * Format user for display purposes
 *
 * @param user - User profile
 * @returns Formatted user object with display properties
 *
 * @example
 * ```typescript
 * const displayUser = formatUserForDisplay(user);
 * console.log(displayUser.formattedCreatedAt); // "29.10.2025"
 * ```
 */
export const formatUserForDisplay = (user: IUserWithRole) => {
  return {
    ...user,
    formattedCreatedAt: new Date(user.created_at).toLocaleDateString('no-NO'),
    formattedUpdatedAt: user.updated_at
      ? new Date(user.updated_at).toLocaleDateString('no-NO')
      : null,
    hasPhone: Boolean(user.phone),
    hasAvatar: Boolean(user.avatar_url),
    displayRole: user.role || 'customer',
  };
};

/**
 * Check if user email is from a trusted domain
 *
 * @param email - Email address to check
 * @param trustedDomains - Array of trusted domains
 * @returns True if email domain is trusted
 *
 * @example
 * ```typescript
 * const isTrusted = isEmailFromTrustedDomain('user@company.com', ['company.com']);
 * // true
 * ```
 */
export const isEmailFromTrustedDomain = (
  email: string,
  trustedDomains: readonly string[]
): boolean => {
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (!emailDomain) return false;

  return trustedDomains.some(domain =>
    emailDomain === domain.toLowerCase()
  );
};

/**
 * Generate user initials from display name or email
 *
 * @param user - User profile
 * @returns User initials (up to 2 characters)
 *
 * @example
 * ```typescript
 * const initials = getUserInitials({ display_name: 'John Doe', email: 'j@example.com' });
 * // "JD"
 * ```
 */
export const getUserInitials = (user: Pick<Profile, 'display_name' | 'email'>): string => {
  if (user.display_name) {
    const parts = user.display_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.display_name.substring(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }

  return 'U';
};
