/**
 * useRole Hook
 *
 * Provides role checking utilities for the authenticated user.
 * Simpler alternative to usePermissions for basic role checks.
 *
 * Features:
 * - Check user's role in organization
 * - Check if user has minimum role
 * - Quick role-based conditionals
 *
 * @module hooks/auth/useRole
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/contexts/hooks";
import { rbacService } from '@/services/supabase/rbac.service';
import type { Database } from '@/types/database';

type OrgRole = Database['public']['Enums']['org_role'];

/**
 * Hook return type
 */
export interface UseRoleReturn {
  /** User's role in the specified organization */
  readonly role: OrgRole | null;

  /** Loading state */
  readonly loading: boolean;

  /** Error state */
  readonly error: Error | null;

  /** Is user platform admin */
  readonly isPlatformAdmin: boolean;

  /** Is user organization owner */
  readonly isOwner: boolean;

  /** Is user organization admin */
  readonly isAdmin: boolean;

  /** Is user organization staff */
  readonly isStaff: boolean;

  /** Is user regular customer */
  readonly isCustomer: boolean;

  /**
   * Check if user has at least the specified role
   * @param minRole - Minimum required role
   */
  readonly hasMinimumRole: (minRole: OrgRole) => boolean;

  /**
   * Refresh role data
   */
  readonly refetch: () => Promise<void>;
}

/**
 * Role priority mapping for comparison
 */
const ROLE_PRIORITY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  staff: 2,
  customer: 1,
};

/**
 * useRole Hook
 *
 * Provides role checking utilities for a specific organization.
 *
 * @param orgId - Organization ID to check role for
 * @returns Role checking utilities
 *
 * @example
 * ```typescript
 * import { useRole } from '@/hooks/auth/useRole';
 *
 * function OrganizationPage({ orgId }: { orgId: string }) {
 *   const {
 *     role,
 *     isAdmin,
 *     isStaff,
 *     hasMinimumRole,
 *     loading
 *   } = useRole(orgId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>Your role: {role}</p>
 *       {isAdmin && <AdminPanel />}
 *       {hasMinimumRole('staff') && <StaffPanel />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useRole = (orgId?: string): UseRoleReturn => {
  const { user, currentOrgId } = useAuth();

  // Use provided orgId or fall back to current org from context
  const targetOrgId = orgId || currentOrgId;

  // Fetch user's role
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['role', user?.id, targetOrgId],
    queryFn: async (): Promise<{
      role: OrgRole | null;
      isPlatformAdmin: boolean;
    }> => {
      if (!user) {
        return { role: null, isPlatformAdmin: false };
      }

      const [role, isPlatformAdmin] = await Promise.all([
        targetOrgId
          ? rbacService.getUserRole(user.id, targetOrgId)
          : rbacService.getUserHighestRole(user.id),
        rbacService.isPlatformAdmin(user.id),
      ]);

      return {
        role: role || 'customer',
        isPlatformAdmin,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const role = data?.role || null;
  const isPlatformAdmin = data?.isPlatformAdmin || false;

  /**
   * Check if user has minimum role
   */
  const hasMinimumRole = (minRole: OrgRole): boolean => {
    if (!role) {
      return false;
    }

    if (isPlatformAdmin) {
      return true; // Platform admin has all roles
    }

    return ROLE_PRIORITY[role] >= ROLE_PRIORITY[minRole];
  };

  /**
   * Refresh role data
   */
  const handleRefetch = async (): Promise<void> => {
    await refetch();
  };

  return {
    role,
    loading,
    error: error as Error | null,
    isPlatformAdmin,
    isOwner: role === 'owner' || isPlatformAdmin,
    isAdmin: hasMinimumRole('admin') || isPlatformAdmin,
    isStaff: hasMinimumRole('staff') || isPlatformAdmin,
    isCustomer: role === 'customer',
    hasMinimumRole,
    refetch: handleRefetch,
  };
};

/**
 * useRoles Hook
 *
 * Get user's roles across multiple organizations.
 *
 * @param orgIds - Array of organization IDs
 * @returns Map of organization IDs to roles
 *
 * @example
 * ```typescript
 * import { useRoles } from '@/hooks/auth/useRole';
 *
 * function MultiOrgComponent({ orgIds }: { orgIds: string[] }) {
 *   const { roles, loading } = useRoles(orgIds);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {orgIds.map(orgId => (
 *         <div key={orgId}>
 *           Org {orgId}: {roles[orgId]}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useRoles = (
  orgIds: string[]
): {
  roles: Record<string, OrgRole | null>;
  loading: boolean;
  error: Error | null;
} => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['roles', user?.id, orgIds.sort().join(',')],
    queryFn: async (): Promise<Record<string, OrgRole | null>> => {
      if (!user) {
        return {};
      }

      const roles = await Promise.all(
        orgIds.map(async (orgId) => {
          const role = await rbacService.getUserRole(user.id, orgId);
          return [orgId, role] as const;
        })
      );

      return Object.fromEntries(roles);
    },
    enabled: !!user && orgIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    roles: data || {},
    loading: isLoading,
    error: error as Error | null,
  };
};
