/**
 * RBAC (Role-Based Access Control) Types
 *
 * Comprehensive type definitions for the RBAC system including permissions,
 * feature flags, and role-based utilities.
 *
 * @module types/rbac
 */

import type { Database } from './database';
import type {
  OrgRole,
  PlatformRole,
  ExtendedOrgRole,
  SystemRole,
} from '@/constants/roles';

/**
 * Resource types in the system
 */
export type ResourceType =
  | 'facilities'
  | 'bookings'
  | 'availability_rules'
  | 'blackouts'
  | 'pricing_rules'
  | 'zones'
  | 'reviews'
  | 'memberships'
  | 'organizations'
  | 'profiles'
  | 'favorites'
  | 'notifications'
  | 'analytics'
  | 'billing'
  | 'settings'
  | 'audit_logs'
  | 'support_tickets'
  | 'additional_services'
  | 'reports';

/**
 * Action types for permissions
 */
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export';

/**
 * Permission definition for resource-based access control
 */
export interface Permission {
  readonly resource: ResourceType;
  readonly action: ActionType;
}

/**
 * User role with organization context
 */
export interface UserRole {
  readonly userId: string;
  readonly orgId: string;
  readonly role: OrgRole;
  readonly isPlatformAdmin: boolean;
}

/**
 * Extended user role with all role types
 */
export interface ExtendedUserRole extends Omit<UserRole, 'role'> {
  readonly role: ExtendedOrgRole;
  readonly inheritedRoles: ReadonlyArray<ExtendedOrgRole>;
}

/**
 * Permission check result with context
 */
export interface PermissionCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly role?: ExtendedOrgRole;
  readonly requiredRole?: ExtendedOrgRole;
}

/**
 * Permission matrix entry
 */
export interface PermissionMatrixEntry {
  readonly resource: ResourceType;
  readonly actions: ReadonlyArray<ActionType>;
  readonly condition?: PermissionCondition;
}

/**
 * Permission condition for conditional access
 */
export interface PermissionCondition {
  readonly type: 'owner' | 'member' | 'creator' | 'assigned' | 'public';
  readonly field?: string;
  readonly value?: unknown;
}

/**
 * Complete permission matrix for a role
 */
export type PermissionMatrix = ReadonlyArray<PermissionMatrixEntry>;

/**
 * Role-to-permissions mapping
 */
export type RolePermissionMap = Readonly<
  Record<ExtendedOrgRole, PermissionMatrix>
>;

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly enabledForRoles: ReadonlyArray<ExtendedOrgRole | PlatformRole>;
  readonly enabled: boolean;
}

/**
 * Feature categories
 */
export type FeatureCategory =
  | 'core'
  | 'analytics'
  | 'admin'
  | 'billing'
  | 'advanced'
  | 'experimental';

/**
 * Feature with category
 */
export interface CategorizedFeature extends FeatureFlag {
  readonly category: FeatureCategory;
}

/**
 * Role-based feature flags
 */
export type RoleFeatureFlags = Readonly<Record<string, FeatureFlag>>;

/**
 * Membership with role information
 */
export interface MembershipWithRole {
  readonly id: string;
  readonly userId: string;
  readonly orgId: string;
  readonly role: OrgRole;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

/**
 * Role transition definition
 */
export interface RoleTransition {
  readonly fromRole: ExtendedOrgRole;
  readonly toRole: ExtendedOrgRole;
  readonly allowed: boolean;
  readonly requiresApproval: boolean;
  readonly approverRole?: ExtendedOrgRole;
}

/**
 * Role transition matrix
 */
export type RoleTransitionMatrix = ReadonlyArray<RoleTransition>;

/**
 * Permission scope
 */
export interface PermissionScope {
  readonly orgId?: string;
  readonly facilityId?: string;
  readonly userId?: string;
  readonly isOwner?: boolean;
}

/**
 * Role assignment request
 */
export interface RoleAssignmentRequest {
  readonly userId: string;
  readonly orgId: string;
  readonly role: OrgRole;
  readonly requestedBy: string;
  readonly reason?: string;
}

/**
 * Role assignment result
 */
export interface RoleAssignmentResult {
  readonly success: boolean;
  readonly membership?: MembershipWithRole;
  readonly error?: string;
}

/**
 * Role comparison result
 */
export interface RoleComparisonResult {
  readonly role1: ExtendedOrgRole;
  readonly role2: ExtendedOrgRole;
  readonly role1IsHigher: boolean;
  readonly role1IsEqual: boolean;
  readonly role1IsLower: boolean;
  readonly priorityDifference: number;
}

/**
 * Role validation result
 */
export interface RoleValidationResult {
  readonly valid: boolean;
  readonly role?: ExtendedOrgRole;
  readonly error?: string;
  readonly suggestions?: ReadonlyArray<ExtendedOrgRole>;
}

/**
 * Access control context
 */
export interface AccessControlContext {
  readonly userId: string;
  readonly orgId?: string;
  readonly role?: ExtendedOrgRole;
  readonly isPlatformAdmin: boolean;
  readonly permissions: PermissionMatrix;
  readonly features: ReadonlyArray<string>;
}

/**
 * Role hierarchy level
 */
export type RoleHierarchyLevel =
  | 'platform'
  | 'organization'
  | 'leadership'
  | 'staff'
  | 'limited'
  | 'customer';

/**
 * Role hierarchy node
 */
export interface RoleHierarchyNode {
  readonly role: ExtendedOrgRole | PlatformRole;
  readonly level: RoleHierarchyLevel;
  readonly priority: number;
  readonly parent?: ExtendedOrgRole | PlatformRole;
  readonly children: ReadonlyArray<ExtendedOrgRole | PlatformRole>;
}

/**
 * Complete role hierarchy
 */
export type RoleHierarchy = ReadonlyArray<RoleHierarchyNode>;

/**
 * Permission audit log entry
 */
export interface PermissionAuditLog {
  readonly id: string;
  readonly userId: string;
  readonly orgId?: string;
  readonly permission: Permission;
  readonly granted: boolean;
  readonly role: ExtendedOrgRole;
  readonly timestamp: string;
  readonly context?: Record<string, unknown>;
}

/**
 * Role statistics
 */
export interface RoleStatistics {
  readonly role: ExtendedOrgRole;
  readonly userCount: number;
  readonly orgCount: number;
  readonly averagePermissions: number;
  readonly mostCommonPermissions: ReadonlyArray<Permission>;
}

/**
 * Type guard for Permission
 */
export const isPermission = (value: unknown): value is Permission => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'resource' in value &&
    'action' in value &&
    typeof (value as Permission).resource === 'string' &&
    typeof (value as Permission).action === 'string'
  );
};

/**
 * Type guard for UserRole
 */
export const isUserRole = (value: unknown): value is UserRole => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'orgId' in value &&
    'role' in value &&
    'isPlatformAdmin' in value &&
    typeof (value as UserRole).userId === 'string' &&
    typeof (value as UserRole).orgId === 'string' &&
    typeof (value as UserRole).role === 'string' &&
    typeof (value as UserRole).isPlatformAdmin === 'boolean'
  );
};

/**
 * Type guard for PermissionCheckResult
 */
export const isPermissionCheckResult = (
  value: unknown
): value is PermissionCheckResult => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'allowed' in value &&
    typeof (value as PermissionCheckResult).allowed === 'boolean'
  );
};

/**
 * Create permission object
 */
export const createPermission = (
  resource: ResourceType,
  action: ActionType
): Permission => {
  return { resource, action } as const;
};

/**
 * Create user role object
 */
export const createUserRole = (
  userId: string,
  orgId: string,
  role: OrgRole,
  isPlatformAdmin: boolean = false
): UserRole => {
  return { userId, orgId, role, isPlatformAdmin } as const;
};

/**
 * Create extended user role object
 */
export const createExtendedUserRole = (
  userId: string,
  orgId: string,
  role: ExtendedOrgRole,
  isPlatformAdmin: boolean = false,
  inheritedRoles: ReadonlyArray<ExtendedOrgRole> = []
): ExtendedUserRole => {
  return { userId, orgId, role, isPlatformAdmin, inheritedRoles } as const;
};
