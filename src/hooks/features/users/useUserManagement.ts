/**
 * User Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for user management operations.
 * Follows clean architecture principles with proper layer separation.
 *
 * @module hooks/features/users/useUserManagement
 */

import { useMemo, useCallback } from 'react';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useAuth } from "@/contexts/hooks";
import { useAppUIStore } from '@/stores/appUIStore';
import {
  filterUsers,
  sortUsers,
  calculateUserStats,
  getUniqueUserRoles,
  canDeleteUser,
  canSuspendUser,
  validateRoleChange,
  type IUserWithRole,
  type IUserFilters,
  type IUserSortConfig,
  type IUserStatistics,
  type IUserDeletionValidationResult,
  type IRoleChangeValidationResult,
} from '@/services/business/user.business.service';
import type { OrgRole } from '@/constants/roles';



/**
 * Hook return interface
 */
export interface IUseUserManagementReturn {
  // Data
  readonly users: readonly IUserWithRole[];
  readonly filteredUsers: readonly IUserWithRole[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly stats: IUserStatistics;
  readonly uniqueRoles: readonly OrgRole[];

  // UI State
  readonly view: string;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly roleFilter: readonly OrgRole[];
  readonly statusFilter: readonly string[];
  readonly sortBy: string;
  readonly sortOrder: string;
  readonly selectedUserIds: readonly string[];

  // UI Actions
  readonly setView: (view: string) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleRoleFilter: (role: OrgRole) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly toggleSort: (sortBy: string) => void;
  readonly toggleUserSelection: (id: string) => void;
  readonly selectAllUsers: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;

  // Business Operations
  readonly deleteUser: (id: string) => Promise<void>;
  readonly batchDeleteUsers: (ids: readonly string[]) => Promise<void>;
  readonly updateUserRole: (id: string, role: OrgRole) => Promise<void>;
  readonly batchUpdateRole: (ids: readonly string[], role: OrgRole) => Promise<void>;
  readonly suspendUser: (id: string) => Promise<void>;
  readonly activateUser: (id: string) => Promise<void>;

  // Validation
  readonly canDeleteUser: (user: IUserWithRole) => IUserDeletionValidationResult;
  readonly canSuspendUser: (user: IUserWithRole) => IRoleChangeValidationResult;
  readonly canChangeRole: (targetUser: IUserWithRole, newRole: OrgRole) => IRoleChangeValidationResult;
}

/**
 * Hook for managing users with business logic separation
 *
 * Provides comprehensive user management including:
 * - User list with filtering and sorting
 * - Role-based operations validation
 * - Batch operations support
 * - User statistics and analytics
 * - Permission-based access control
 *
 * @returns Complete user management interface
 *
 * @example
 * ```tsx
 * function UserManagementPage() {
 *   const {
 *     filteredUsers,
 *     isLoading,
 *     stats,
 *     searchTerm,
 *     setSearchTerm,
 *     updateUserRole,
 *     deleteUser,
 *     canDeleteUser,
 *     canChangeRole,
 *   } = useUserManagement();
 *
 *   const handleRoleChange = async (userId: string, newRole: OrgRole) => {
 *     const user = filteredUsers.find(u => u.id === userId);
 *     if (!user) return;
 *
 *     const validation = canChangeRole(user, newRole);
 *     if (!validation.canChange) {
 *       toast.error(validation.reason);
 *       return;
 *     }
 *
 *     await updateUserRole(userId, newRole);
 *     toast.success('Role updated successfully');
 *   };
 *
 *   return (
 *     <div>
 *       <UserStats stats={stats} />
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <UserTable
 *         users={filteredUsers}
 *         onRoleChange={handleRoleChange}
 *         onDelete={deleteUser}
 *         canDeleteUser={canDeleteUser}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserManagement = (): IUseUserManagementReturn => {
  // Data layer - TODO: Connect to actual Supabase hooks when available
  const { user: currentUser } = useAuth();

  // Placeholder data layer - replace with actual hooks
  const users: readonly IUserWithRole[] = []; // TODO: useUsers(orgId)
  const isLoading = false; // TODO: from useUsers
  const error = null; // TODO: from useUsers

  // Placeholder mutations - replace with actual hooks
  const deleteUserMutation = {
    mutateAsync: async (id: string): Promise<void> => {
      // TODO: Connect to actual delete mutation
      console.log('Delete user:', id);
    },
  };

  const updateUserMutation = {
    mutateAsync: async (params: { id: string; data: Record<string, unknown> }): Promise<void> => {
      // TODO: Connect to actual update mutation
      console.log('Update user:', params);
    },
  };

  // UI state layer - appUIStore users section
  const appUIStore = useAppUIStore();
  const {
    view,
    showFilters,
    searchTerm,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    selectedUserIds,
  } = appUIStore.users;

  // Actions from appUIStore with users prefix
  const setView = appUIStore.setUsersView;
  const toggleFilters = appUIStore.toggleUsersFilters;
  const setSearchTerm = appUIStore.setUsersSearchTerm;
  const toggleRoleFilter = appUIStore.toggleUsersRoleFilter;
  const toggleStatusFilter = appUIStore.toggleUsersStatusFilter;
  const resetFilters = appUIStore.resetUsersFilters;

  // Business logic layer - filtering and sorting
  const filteredUsers = useMemo(() => {
    const filters: IUserFilters = {
      searchTerm,
      roleFilter: roleFilter as readonly OrgRole[],
      statusFilter: statusFilter as readonly ('active' | 'inactive' | 'suspended')[],
    };

    const filtered = filterUsers(users, filters);

    const sortConfig: IUserSortConfig = {
      sortBy: sortBy as IUserSortConfig['sortBy'],
      sortOrder: sortOrder as IUserSortConfig['sortOrder'],
    };

    return sortUsers(filtered, sortConfig);
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => calculateUserStats(users), [users]);
  const uniqueRoles = useMemo(() => getUniqueUserRoles(users), [users]);

  // Validation helpers
  const canDeleteUserFn = useCallback(
    (user: IUserWithRole): IUserDeletionValidationResult => {
      if (!currentUser?.id || !user.role) {
        return {
          canDelete: false,
          reason: 'Insufficient information to validate deletion',
        };
      }

      // Check if user is the last owner
      const isLastOwner = user.role === 'owner' && stats.byRole.owner === 1;

      // TODO: Check for active bookings and owned facilities from data layer
      const hasActiveBookings = false;
      const ownsFacilities = false;

      return canDeleteUser(
        user.id,
        currentUser.id,
        user.role,
        isLastOwner,
        hasActiveBookings,
        ownsFacilities
      );
    },
    [currentUser, stats]
  );

  const canSuspendUserFn = useCallback(
    (user: IUserWithRole): IRoleChangeValidationResult => {
      if (!currentUser?.id || !user.role) {
        return {
          canChange: false,
          reason: 'Insufficient information to validate suspension',
        };
      }

      const isLastOwner = user.role === 'owner' && stats.byRole.owner === 1;

      return canSuspendUser(user.id, currentUser.id, user.role, isLastOwner);
    },
    [currentUser, stats]
  );

  const canChangeRoleFn = useCallback(
    (targetUser: IUserWithRole, newRole: OrgRole): IRoleChangeValidationResult => {
      if (!currentUser?.id || !currentUser.role || !targetUser.role) {
        return {
          canChange: false,
          reason: 'Insufficient information to validate role change',
        };
      }

      return validateRoleChange(
        currentUser.role as OrgRole,
        targetUser.id,
        currentUser.id,
        newRole
      );
    },
    [currentUser]
  );

  // Business operations
  const deleteUserFn = useCallback(
    async (id: string): Promise<void> => {
      const user = users.find((u) => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }

      const validation = canDeleteUserFn(user);
      if (!validation.canDelete) {
        throw new Error(validation.reason || 'Cannot delete user');
      }

      if (validation.warnings && validation.warnings.length > 0) {
        const confirmed = window.confirm(
          `${validation.warnings.join('\n')}\n\nAre you sure you want to delete this user?`
        );
        if (!confirmed) return;
      }

      await deleteUserMutation.mutateAsync(id);
    },
    [users, canDeleteUserFn, deleteUserMutation]
  );

  const batchDeleteUsers = useCallback(
    async (ids: readonly string[]): Promise<void> => {
      const usersToDelete = users.filter((u) => ids.includes(u.id));

      // Validate each user
      for (const user of usersToDelete) {
        const validation = canDeleteUserFn(user);
        if (!validation.canDelete) {
          throw new Error(
            `Cannot delete user ${user.display_name || user.email}: ${validation.reason}`
          );
        }
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete ${ids.length} user(s)?`
      );
      if (!confirmed) return;

      await Promise.all(ids.map((id) => deleteUserMutation.mutateAsync(id)));
      clearSelection();
    },
    [users, canDeleteUserFn, deleteUserMutation, clearSelection]
  );

  const updateUserRoleFn = useCallback(
    async (id: string, role: OrgRole): Promise<void> => {
      const user = users.find((u) => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }

      const validation = canChangeRoleFn(user, role);
      if (!validation.canChange) {
        throw new Error(validation.reason || 'Cannot change user role');
      }

      await updateUserMutation.mutateAsync({
        id,
        data: { role },
      });
    },
    [users, canChangeRoleFn, updateUserMutation]
  );

  const batchUpdateRole = useCallback(
    async (ids: readonly string[], role: OrgRole): Promise<void> => {
      const usersToUpdate = users.filter((u) => ids.includes(u.id));

      // Validate each user
      for (const user of usersToUpdate) {
        const validation = canChangeRoleFn(user, role);
        if (!validation.canChange) {
          throw new Error(
            `Cannot change role for ${user.display_name || user.email}: ${validation.reason}`
          );
        }
      }

      await Promise.all(
        ids.map((id) =>
          updateUserMutation.mutateAsync({
            id,
            data: { role },
          })
        )
      );
      clearSelection();
    },
    [users, canChangeRoleFn, updateUserMutation, clearSelection]
  );

  const suspendUserFn = useCallback(
    async (id: string): Promise<void> => {
      const user = users.find((u) => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }

      const validation = canSuspendUserFn(user);
      if (!validation.canChange) {
        throw new Error(validation.reason || 'Cannot suspend user');
      }

      await updateUserMutation.mutateAsync({
        id,
        data: { status: 'suspended' },
      });
    },
    [users, canSuspendUserFn, updateUserMutation]
  );

  const activateUserFn = useCallback(
    async (id: string): Promise<void> => {
      await updateUserMutation.mutateAsync({
        id,
        data: { status: 'active' },
      });
    },
    [updateUserMutation]
  );

  const selectAllUsersFn = useCallback(() => {
    selectAll(filteredUsers.map((u) => u.id));
  }, [filteredUsers, selectAll]);

  return {
    // Data
    users,
    filteredUsers,
    isLoading,
    error,

    // Statistics
    stats,
    uniqueRoles,

    // UI State
    view,
    showFilters,
    searchTerm,
    roleFilter,
    statusFilter: statusFilter as readonly string[],
    sortBy,
    sortOrder,
    selectedUserIds,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleRoleFilter,
    toggleStatusFilter: toggleStatusFilter as (status: string) => void,
    toggleSort,
    toggleUserSelection,
    selectAllUsers: selectAllUsersFn,
    clearSelection,
    resetFilters,

    // Business Operations
    deleteUser: deleteUserFn,
    batchDeleteUsers,
    updateUserRole: updateUserRoleFn,
    batchUpdateRole,
    suspendUser: suspendUserFn,
    activateUser: activateUserFn,

    // Validation
    canDeleteUser: canDeleteUserFn,
    canSuspendUser: canSuspendUserFn,
    canChangeRole: canChangeRoleFn,
  };
};
