/**
 * Group UI State Management Store
 *
 * Manages UI-specific state for group management pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TGroupView = 'list' | 'grid' | 'active' | 'archived';
export type TGroupSortBy = 'name' | 'member_count' | 'status' | 'updated_at' | 'created_at';
export type TGroupSortOrder = 'asc' | 'desc';

interface IGroupUIState {
  // View state
  readonly view: TGroupView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly memberCountRange: { readonly min: number; readonly max: number };
  readonly statusFilter: readonly string[];

  // Sort state
  readonly sortBy: TGroupSortBy;
  readonly sortOrder: TGroupSortOrder;

  // Selection state
  readonly selectedGroupIds: readonly string[];

  // Modal state
  readonly modals: {
    readonly create: boolean;
    readonly edit: boolean;
    readonly invite: boolean;
    readonly leave: boolean;
    readonly delete: boolean;
  };
  readonly activeGroupId: string | null;

  // Actions
  readonly setView: (view: TGroupView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  readonly setSearchTerm: (term: string) => void;
  readonly setMemberCountRange: (range: { readonly min: number; readonly max: number }) => void;
  readonly setStatusFilter: (statuses: readonly string[]) => void;
  readonly toggleStatusFilter: (status: string) => void;

  readonly setSortBy: (sortBy: TGroupSortBy) => void;
  readonly setSortOrder: (order: TGroupSortOrder) => void;
  readonly toggleSort: (sortBy: TGroupSortBy) => void;

  readonly selectGroup: (id: string) => void;
  readonly deselectGroup: (id: string) => void;
  readonly toggleGroupSelection: (id: string) => void;
  readonly selectAllGroups: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  readonly openModal: (modal: keyof IGroupUIState['modals'], groupId?: string) => void;
  readonly closeModal: (modal: keyof IGroupUIState['modals']) => void;
  readonly closeAllModals: () => void;
  readonly setActiveGroupId: (id: string | null) => void;

  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'grid' as TGroupView,
  showFilters: false,
  searchTerm: '',
  memberCountRange: { min: 1, max: 100 } as const,
  statusFilter: [] as readonly string[],
  sortBy: 'name' as TGroupSortBy,
  sortOrder: 'asc' as TGroupSortOrder,
  selectedGroupIds: [] as readonly string[],
  modals: {
    create: false,
    edit: false,
    invite: false,
    leave: false,
    delete: false,
  } as const,
  activeGroupId: null as string | null,
};

export const useGroupUIStore = create<IGroupUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),
        setShowFilters: (showFilters) => set({ showFilters }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

        // Search and filter actions
        setSearchTerm: (searchTerm) => set({ searchTerm }),

        setMemberCountRange: (memberCountRange) => set({ memberCountRange }),

        setStatusFilter: (statusFilter) => set({ statusFilter }),
        toggleStatusFilter: (status) =>
          set((state) => ({
            statusFilter: state.statusFilter.includes(status)
              ? state.statusFilter.filter((s) => s !== status)
              : [...state.statusFilter, status],
          })),

        // Sort actions
        setSortBy: (sortBy) => set({ sortBy }),
        setSortOrder: (sortOrder) => set({ sortOrder }),
        toggleSort: (sortBy) =>
          set((state) => ({
            sortBy,
            sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
          })),

        // Selection actions
        selectGroup: (id) =>
          set((state) => ({
            selectedGroupIds: [...state.selectedGroupIds, id],
          })),

        deselectGroup: (id) =>
          set((state) => ({
            selectedGroupIds: state.selectedGroupIds.filter((gId) => gId !== id),
          })),

        toggleGroupSelection: (id) =>
          set((state) => ({
            selectedGroupIds: state.selectedGroupIds.includes(id)
              ? state.selectedGroupIds.filter((gId) => gId !== id)
              : [...state.selectedGroupIds, id],
          })),

        selectAllGroups: (ids) => set({ selectedGroupIds: ids }),

        clearSelection: () => set({ selectedGroupIds: [] }),

        // Modal actions
        openModal: (modal, groupId) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: true },
            activeGroupId: groupId ?? state.activeGroupId,
          })),

        closeModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: false },
          })),

        closeAllModals: () =>
          set({
            modals: {
              create: false,
              edit: false,
              invite: false,
              leave: false,
              delete: false,
            },
            activeGroupId: null,
          }),

        setActiveGroupId: (activeGroupId) => set({ activeGroupId }),

        // Reset actions
        resetFilters: () =>
          set({
            searchTerm: '',
            memberCountRange: { min: 1, max: 100 },
            statusFilter: [],
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'group-ui-store',
        version: 1,
      }
    ),
    { name: 'GroupUIStore' }
  )
);
