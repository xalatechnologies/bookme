/**
 * User Permissions Hook
 *
 * Manages user permissions and access control based on roles.
 * Provides permission checking utilities for routes, actions, and resources.
 * Follows clean architecture principles with business logic separation.
 *
 * @module hooks/features/users/useUserPermissions
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserPermissions, type IUserPermissions } from '@/services/business/user.business.service';
import {
  canAccessAdminRoute,
  canAccessUserRoute,
  hasRolePriority,
  type RouteAccessResult,
} from '@/services/business/auth.business.service';
import {
  hasMinimumRole,
  canManageBookings,
  canEditFacilities,
  canManageUsers,
  canViewReports,
  canExportData,
  canManageMedia,
  hasFullAccess,
  hasReadOnlyAccess,
  isOperationalRole,
  isEditorialRole,
  type OrgRole,
  type SystemRole,
} from '@/constants/roles';

/**
 * Resource types for permission checking
 */
export type TResource =
  | 'users'
  | 'facilities'
  | 'bookings'
  | 'reports'
  | 'organizations'
  | 'media'
  | 'roles'
  | 'billing'
  | 'settings';

/**
 * Action types for permission checking
 */
export type TAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'manage';

/**
 * Route types for permission checking
 */
export type TRouteType = 'admin' | 'user' | 'public';

/**
 * Hook return interface
 */
export interface IUseUserPermissionsReturn {
  // Current user info
  readonly currentUserId: string | null;
  readonly currentUserRole: OrgRole | null;
  readonly isPlatformAdmin: boolean;

  // Permission object
  readonly permissions: IUserPermissions;

  // General permission checks
  readonly hasPermission: (resource: TResource, action: TAction) => boolean;
  readonly canAccessRoute: (routeType: TRouteType, path?: string) => RouteAccessResult;
  readonly hasMinimumRole: (minRole: OrgRole) => boolean;
  readonly hasRolePriority: (requiredRole: OrgRole) => boolean;

  // Specific capability checks
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

  // Role type checks
  readonly hasFullAccess: boolean;
  readonly isOperational: boolean;
  readonly isEditorial: boolean;

  // Resource-specific permission helpers
  readonly canCreateUser: boolean;
  readonly canUpdateUser: (targetUserId: string) => boolean;
  readonly canDeleteUser: (targetUserId: string) => boolean;
  readonly canChangeUserRole: (targetUserId: string, newRole: OrgRole) => boolean;

  readonly canCreateFacility: boolean;
  readonly canUpdateFacility: boolean;
  readonly canDeleteFacility: boolean;

  readonly canCreateBooking: boolean;
  readonly canUpdateBooking: boolean;
  readonly canDeleteBooking: boolean;
  readonly canApproveBooking: boolean;

  readonly canUploadMedia: boolean;
  readonly canDeleteMedia: boolean;
}

/**
 * Hook for managing user permissions with business logic
 *
 * Provides comprehensive permission management including:
 * - Role-based access control (RBAC)
 * - Resource and action permission checks
 * - Route access validation
 * - Hierarchy-based permissions
 * - Specific capability checks for UI components
 *
 * @returns Complete user permissions interface
 *
 * @example
 * ```tsx
 * function UserManagementPage() {
 *   const {
 *     canManageUsers,
 *     canCreateUser,
 *     canDeleteUser,
 *     hasPermission,
 *     canAccessRoute,
 *   } = useUserPermissions();
 *
 *   // Check if user can access this page
 *   useEffect(() => {
 *     const access = canAccessRoute('admin', '/users');
 *     if (!access.canAccess) {
 *       toast.error(access.reason);
 *       navigate(access.redirectTo || '/dashboard');
 *     }
 *   }, [canAccessRoute, navigate]);
 *
 *   if (!canManageUsers) {
 *     return <AccessDenied />;
 *   }
 *
 *   return (
 *     <div>
 *       {canCreateUser && (
 *         <button onClick={handleCreateUser}>Create User</button>
 *       )}
 *       <UserTable
 *         users={users}
 *         canDelete={(user) => canDeleteUser(user.id)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function FacilityEditor() {
 *   const {
 *     canManageFacilities,
 *     canUpdateFacility,
 *     canUploadMedia,
 *   } = useUserPermissions();
 *
 *   if (!canManageFacilities) {
 *     return <AccessDenied />;
 *   }
 *
 *   return (
 *     <form>
 *       <FacilityDetailsSection disabled={!canUpdateFacility} />
 *       {canUploadMedia && <MediaUploadSection />}
 *     </form>
 *   );
 * }
 * ```
 */
export const useUserPermissions = (): IUseUserPermissionsReturn => {
  const { user } = useAuth();

  // Extract user info
  const currentUserId = user?.id || null;
  const currentUserRole = (user?.role as OrgRole) || null;
  const isPlatformAdmin = user?.role === 'platform_admin';

  // Get permissions from business logic
  const permissions = useMemo(
    () => getUserPermissions(currentUserRole),
    [currentUserRole]
  );

  // General permission checks
  const hasPermissionFn = useCallback(
    (resource: TResource, action: TAction): boolean => {
      // Platform admin has all permissions
      if (isPlatformAdmin) return true;

      // Map resource and action to specific permissions
      switch (resource) {
        case 'users':
          return action === 'read' ? true : permissions.canManageUsers;
        case 'facilities':
          return action === 'read' ? true : permissions.canManageFacilities;
        case 'bookings':
          return action === 'read' ? true : permissions.canManageBookings;
        case 'reports':
          return permissions.canViewReports;
        case 'organizations':
          return action === 'read' ? true : permissions.canManageOrganization;
        case 'media':
          return action === 'read' ? true : permissions.canManageFacilities; // Media tied to facilities
        case 'roles':
          return permissions.canManageRoles;
        case 'billing':
          return permissions.canManageBilling;
        case 'settings':
          return permissions.canManageOrganization;
        default:
          return false;
      }
    },
    [isPlatformAdmin, permissions]
  );

  const canAccessRouteFn = useCallback(
    (routeType: TRouteType, path?: string): RouteAccessResult => {
      // Public routes are always accessible
      if (routeType === 'public') {
        return { canAccess: true };
      }

      // Admin routes
      if (routeType === 'admin') {
        return canAccessAdminRoute(currentUserRole as SystemRole, isPlatformAdmin);
      }

      // User routes
      if (routeType === 'user') {
        return canAccessUserRoute(currentUserRole as SystemRole, isPlatformAdmin);
      }

      return {
        canAccess: false,
        reason: 'Unknown route type',
      };
    },
    [currentUserRole, isPlatformAdmin]
  );

  const hasMinimumRoleFn = useCallback(
    (minRole: OrgRole): boolean => {
      return hasMinimumRole(currentUserRole, minRole);
    },
    [currentUserRole]
  );

  const hasRolePriorityFn = useCallback(
    (requiredRole: OrgRole): boolean => {
      return hasRolePriority(currentUserRole, requiredRole, isPlatformAdmin);
    },
    [currentUserRole, isPlatformAdmin]
  );

  // Specific capability checks (from constants/roles.ts)
  const canManageUsersFn = useMemo(
    () => canManageUsers(currentUserRole),
    [currentUserRole]
  );

  const canManageFacilitiesFn = useMemo(
    () => canEditFacilities(currentUserRole),
    [currentUserRole]
  );

  const canManageBookingsFn = useMemo(
    () => canManageBookings(currentUserRole),
    [currentUserRole]
  );

  const canViewReportsFn = useMemo(
    () => canViewReports(currentUserRole),
    [currentUserRole]
  );

  const canExportDataFn = useMemo(
    () => canExportData(currentUserRole),
    [currentUserRole]
  );

  const canManageMediaFn = useMemo(
    () => canManageMedia(currentUserRole),
    [currentUserRole]
  );

  const hasFullAccessFn = useMemo(
    () => hasFullAccess(currentUserRole),
    [currentUserRole]
  );

  const hasReadOnlyAccessFn = useMemo(
    () => hasReadOnlyAccess(currentUserRole),
    [currentUserRole]
  );

  const isOperationalFn = useMemo(
    () => isOperationalRole(currentUserRole),
    [currentUserRole]
  );

  const isEditorialFn = useMemo(
    () => isEditorialRole(currentUserRole),
    [currentUserRole]
  );

  // Resource-specific permission helpers
  const canCreateUserFn = useMemo(
    () => permissions.canManageUsers,
    [permissions]
  );

  const canUpdateUserFn = useCallback(
    (targetUserId: string): boolean => {
      // Can update if can manage users, or updating own profile
      return permissions.canManageUsers || targetUserId === currentUserId;
    },
    [permissions, currentUserId]
  );

  const canDeleteUserFn = useCallback(
    (targetUserId: string): boolean => {
      // Cannot delete yourself
      if (targetUserId === currentUserId) return false;
      // Must have user management permission
      return permissions.canManageUsers;
    },
    [permissions, currentUserId]
  );

  const canChangeUserRoleFn = useCallback(
    (targetUserId: string, newRole: OrgRole): boolean => {
      // Cannot change your own role
      if (targetUserId === currentUserId) return false;
      // Must have role management permission
      if (!permissions.canManageRoles) return false;
      // Must have higher or equal priority than target role
      return hasRolePriorityFn(newRole);
    },
    [permissions, currentUserId, hasRolePriorityFn]
  );

  // Facility permissions
  const canCreateFacilityFn = useMemo(
    () => permissions.canManageFacilities,
    [permissions]
  );

  const canUpdateFacilityFn = useMemo(
    () => permissions.canManageFacilities,
    [permissions]
  );

  const canDeleteFacilityFn = useMemo(
    () => permissions.canManageFacilities && !permissions.isReadOnly,
    [permissions]
  );

  // Booking permissions
  const canCreateBookingFn = useMemo(
    () => permissions.canManageBookings || currentUserRole === 'customer',
    [permissions, currentUserRole]
  );

  const canUpdateBookingFn = useMemo(
    () => permissions.canManageBookings,
    [permissions]
  );

  const canDeleteBookingFn = useMemo(
    () => permissions.canManageBookings && !permissions.isReadOnly,
    [permissions]
  );

  const canApproveBookingFn = useMemo(
    () => permissions.canManageBookings,
    [permissions]
  );

  // Media permissions
  const canUploadMediaFn = useMemo(
    () => canManageMediaFn,
    [canManageMediaFn]
  );

  const canDeleteMediaFn = useMemo(
    () => canManageMediaFn && !permissions.isReadOnly,
    [canManageMediaFn, permissions]
  );

  return {
    // Current user info
    currentUserId,
    currentUserRole,
    isPlatformAdmin,

    // Permission object
    permissions,

    // General permission checks
    hasPermission: hasPermissionFn,
    canAccessRoute: canAccessRouteFn,
    hasMinimumRole: hasMinimumRoleFn,
    hasRolePriority: hasRolePriorityFn,

    // Specific capability checks
    canManageUsers: canManageUsersFn,
    canManageFacilities: canManageFacilitiesFn,
    canManageBookings: canManageBookingsFn,
    canViewReports: canViewReportsFn,
    canExportData: canExportDataFn,
    canManageOrganization: permissions.canManageOrganization,
    canManageRoles: permissions.canManageRoles,
    canManageBilling: permissions.canManageBilling,
    canViewAuditLogs: permissions.canViewAuditLogs,
    isReadOnly: permissions.isReadOnly,

    // Role type checks
    hasFullAccess: hasFullAccessFn,
    isOperational: isOperationalFn,
    isEditorial: isEditorialFn,

    // Resource-specific permission helpers
    canCreateUser: canCreateUserFn,
    canUpdateUser: canUpdateUserFn,
    canDeleteUser: canDeleteUserFn,
    canChangeUserRole: canChangeUserRoleFn,

    canCreateFacility: canCreateFacilityFn,
    canUpdateFacility: canUpdateFacilityFn,
    canDeleteFacility: canDeleteFacilityFn,

    canCreateBooking: canCreateBookingFn,
    canUpdateBooking: canUpdateBookingFn,
    canDeleteBooking: canDeleteBookingFn,
    canApproveBooking: canApproveBookingFn,

    canUploadMedia: canUploadMediaFn,
    canDeleteMedia: canDeleteMediaFn,
  };
};
