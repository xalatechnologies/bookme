/**
 * User UI State Management Store
 *
 * Manages UI-specific state for user management pages.
 * Separated from business logic and data fetching.
 *
 * @module stores/userUIStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrgRole } from '@/constants/roles';

export type TUserView = 'list' | 'grid' | 'table';
export type TUserSortBy = 'display_name' | 'email' | 'role' | 'last_login' | 'created_at';
export type TUserSortOrder = 'asc' | 'desc';
export type TUserStatus = 'active' | 'inactive' | 'suspended';

interface IUserUIState {
  // View state
  readonly view: TUserView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly roleFilter: readonly OrgRole[];
  readonly statusFilter: readonly TUserStatus[];
  readonly organizationFilter: string | null;

  // Sort state
  readonly sortBy: TUserSortBy;
  readonly sortOrder: TUserSortOrder;

  // Selection state
  readonly selectedUserIds: readonly string[];

  // Modal state
  readonly showUserEditor: boolean;
  readonly editingUserId: string | null;

  // Actions - View
  readonly setView: (view: TUserView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  // Actions - Search and Filter
  readonly setSearchTerm: (term: string) => void;
  readonly setRoleFilter: (roles: readonly OrgRole[]) => void;
  readonly toggleRoleFilter: (role: OrgRole) => void;
  readonly setStatusFilter: (statuses: readonly TUserStatus[]) => void;
  readonly toggleStatusFilter: (status: TUserStatus) => void;
  readonly setOrganizationFilter: (orgId: string | null) => void;

  // Actions - Sort
  readonly setSortBy: (sortBy: TUserSortBy) => void;
  readonly setSortOrder: (order: TUserSortOrder) => void;
  readonly toggleSort: (sortBy: TUserSortBy) => void;

  // Actions - Selection
  readonly selectUser: (id: string) => void;
  readonly deselectUser: (id: string) => void;
  readonly toggleUserSelection: (id: string) => void;
  readonly selectAllUsers: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  // Actions - Modal
  readonly openUserEditor: (userId?: string) => void;
  readonly closeUserEditor: () => void;

  // Actions - Reset
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'table' as TUserView,
  showFilters: false,
  searchTerm: '',
  roleFilter: [] as readonly OrgRole[],
  statusFilter: [] as readonly TUserStatus[],
  organizationFilter: null,
  sortBy: 'display_name' as TUserSortBy,
  sortOrder: 'asc' as TUserSortOrder,
  selectedUserIds: [] as readonly string[],
  showUserEditor: false,
  editingUserId: null,
};

export const useUserUIStore = create<IUserUIState>()(
  devtools(
    (set) => ({
      ...initialState,

      // View actions
      setView: (view) => set({ view }),
      setShowFilters: (showFilters) => set({ showFilters }),
      toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

      // Search and filter actions
      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setRoleFilter: (roleFilter) => set({ roleFilter }),
      toggleRoleFilter: (role) =>
        set((state) => ({
          roleFilter: state.roleFilter.includes(role)
            ? state.roleFilter.filter((r) => r !== role)
            : [...state.roleFilter, role],
        })),

      setStatusFilter: (statusFilter) => set({ statusFilter }),
      toggleStatusFilter: (status) =>
        set((state) => ({
          statusFilter: state.statusFilter.includes(status)
            ? state.statusFilter.filter((s) => s !== status)
            : [...state.statusFilter, status],
        })),

      setOrganizationFilter: (organizationFilter) => set({ organizationFilter }),

      // Sort actions
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      toggleSort: (sortBy) =>
        set((state) => ({
          sortBy,
          sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
        })),

      // Selection actions
      selectUser: (id) =>
        set((state) => ({
          selectedUserIds: [...state.selectedUserIds, id],
        })),

      deselectUser: (id) =>
        set((state) => ({
          selectedUserIds: state.selectedUserIds.filter((userId) => userId !== id),
        })),

      toggleUserSelection: (id) =>
        set((state) => ({
          selectedUserIds: state.selectedUserIds.includes(id)
            ? state.selectedUserIds.filter((userId) => userId !== id)
            : [...state.selectedUserIds, id],
        })),

      selectAllUsers: (ids) => set({ selectedUserIds: ids }),

      clearSelection: () => set({ selectedUserIds: [] }),

      // Modal actions
      openUserEditor: (userId) =>
        set({
          showUserEditor: true,
          editingUserId: userId || null,
        }),

      closeUserEditor: () =>
        set({
          showUserEditor: false,
          editingUserId: null,
        }),

      // Reset actions
      resetFilters: () =>
        set({
          searchTerm: '',
          roleFilter: [],
          statusFilter: [],
          organizationFilter: null,
        }),

      resetAll: () => set(initialState),
    }),
    { name: 'UserUIStore' }
  )
);
