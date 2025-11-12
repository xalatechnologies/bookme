/**
 * usePermissions Hook
 *
 * Provides permission checking utilities for the authenticated user.
 * Integrates with RBAC service and auth context.
 *
 * Features:
 * - Check specific permissions
 * - Check organization admin status
 * - Check platform admin status
 * - Get user's organizations
 * - Resource-based permission checks
 *
 * @module hooks/auth/usePermissions
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/contexts/hooks";
import { rbacService, type Permission } from '@/services/supabase/rbac.service';
import type { Database } from '@/types/database';

type OrgRole = Database['public']['Enums']['org_role'];

/**
 * Permissions data returned by the hook
 */
export interface PermissionsData {
  /** Is user a platform admin */
  readonly isPlatformAdmin: boolean;

  /** User's highest role across all organizations */
  readonly highestRole: OrgRole;

  /** List of organization IDs user belongs to */
  readonly organizations: readonly string[];

  /** List of organizations where user is admin */
  readonly adminOrganizations: readonly string[];

  /** List of organizations where user is staff */
  readonly staffOrganizations: readonly string[];
}

/**
 * Hook return type
 */
export interface UsePermissionsReturn {
  /** Permissions data */
  readonly permissions: PermissionsData | undefined;

  /** Loading state */
  readonly loading: boolean;

  /** Error state */
  readonly error: Error | null;

  /**
   * Check if user has a specific permission
   * @param resource - Resource type
   * @param action - Action type
   * @param orgId - Optional organization ID for context
   */
  readonly can: (
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    orgId?: string
  ) => Promise<boolean>;

  /**
   * Check if user is admin of organization
   * @param orgId - Organization ID
   */
  readonly isOrgAdmin: (orgId: string) => Promise<boolean>;

  /**
   * Check if user is staff of organization
   * @param orgId - Organization ID
   */
  readonly isOrgStaff: (orgId: string) => Promise<boolean>;

  /**
   * Check if user can manage a facility
   * @param facilityId - Facility ID
   */
  readonly canManageFacility: (facilityId: string) => Promise<boolean>;

  /**
   * Check if user can view a booking
   * @param bookingId - Booking ID
   */
  readonly canViewBooking: (bookingId: string) => Promise<boolean>;

  /**
   * Check if user can manage a booking
   * @param bookingId - Booking ID
   */
  readonly canManageBooking: (bookingId: string) => Promise<boolean>;

  /**
   * Refresh permissions data
   */
  readonly refetch: () => Promise<void>;
}

/**
 * usePermissions Hook
 *
 * Provides permission checking utilities for the authenticated user.
 *
 * @example
 * ```typescript
 * import { usePermissions } from '@/hooks/auth/usePermissions';
 *
 * function MyComponent() {
 *   const { permissions, can, isOrgAdmin, loading } = usePermissions();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   // Check specific permission
 *   const handleCreate = async () => {
 *     const canCreate = await can('facilities', 'create', orgId);
 *     if (canCreate) {
 *       // Create facility
 *     }
 *   };
 *
 *   // Check org admin
 *   const isAdmin = await isOrgAdmin(orgId);
 *
 *   return (
 *     <div>
 *       {permissions?.isPlatformAdmin && <AdminPanel />}
 *       {isAdmin && <OrgAdminPanel />}
 *     </div>
 *   );
 * }
 * ```
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();

  // Fetch permissions data
  const {
    data: permissions,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async (): Promise<PermissionsData> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const [
        isPlatformAdmin,
        highestRole,
        organizations,
        adminOrganizations,
        staffOrganizations,
      ] = await Promise.all([
        rbacService.isPlatformAdmin(user.id),
        rbacService.getUserHighestRole(user.id),
        rbacService.getUserOrganizations(user.id),
        rbacService.getUserOrganizationsWithRole(user.id, 'admin'),
        rbacService.getUserOrganizationsWithRole(user.id, 'staff'),
      ]);

      return {
        isPlatformAdmin,
        highestRole,
        organizations,
        adminOrganizations,
        staffOrganizations,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Check if user has permission
   */
  const can = async (
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete',
    orgId?: string
  ): Promise<boolean> => {
    if (!user) {
      return false;
    }

    const permission: Permission = { resource, action };
    return rbacService.hasPermission(user.id, permission, orgId);
  };

  /**
   * Check if user is org admin
   */
  const isOrgAdmin = async (orgId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    return rbacService.isOrgAdmin(user.id, orgId);
  };

  /**
   * Check if user is org staff
   */
  const isOrgStaff = async (orgId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    return rbacService.isOrgStaff(user.id, orgId);
  };

  /**
   * Check if user can manage facility
   */
  const canManageFacility = async (facilityId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    return rbacService.canManageFacility(user.id, facilityId);
  };

  /**
   * Check if user can view booking
   */
  const canViewBooking = async (bookingId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    return rbacService.canViewBooking(user.id, bookingId);
  };

  /**
   * Check if user can manage booking
   */
  const canManageBooking = async (bookingId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    return rbacService.canManageBooking(user.id, bookingId);
  };

  /**
   * Refresh permissions
   */
  const handleRefetch = async (): Promise<void> => {
    await refetch();
  };

  return {
    permissions,
    loading,
    error: error as Error | null,
    can,
    isOrgAdmin,
    isOrgStaff,
    canManageFacility,
    canViewBooking,
    canManageBooking,
    refetch: handleRefetch,
  };
};
