/**
 * Facility UI State Management Store
 *
 * Manages UI-specific state for facility management pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TView = 'list' | 'grid' | 'map';
export type TSortBy = 'name' | 'capacity' | 'updated_at' | 'created_at';
export type TSortOrder = 'asc' | 'desc';

interface IFacilityUIState {
  // View state
  readonly view: TView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly statusFilter: readonly string[];
  readonly typeFilter: readonly string[];
  readonly capacityRange: { readonly min: number; readonly max: number };

  // Sort state
  readonly sortBy: TSortBy;
  readonly sortOrder: TSortOrder;

  // Selection state
  readonly selectedFacilityIds: readonly string[];

  // Actions
  readonly setView: (view: TView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  readonly setSearchTerm: (term: string) => void;
  readonly setStatusFilter: (statuses: readonly string[]) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly setTypeFilter: (types: readonly string[]) => void;
  readonly toggleTypeFilter: (type: string) => void;
  readonly setCapacityRange: (range: { readonly min: number; readonly max: number }) => void;

  readonly setSortBy: (sortBy: TSortBy) => void;
  readonly setSortOrder: (order: TSortOrder) => void;
  readonly toggleSort: (sortBy: TSortBy) => void;

  readonly selectFacility: (id: string) => void;
  readonly deselectFacility: (id: string) => void;
  readonly toggleFacilitySelection: (id: string) => void;
  readonly selectAllFacilities: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'grid' as TView,
  showFilters: false,
  searchTerm: '',
  statusFilter: [] as readonly string[],
  typeFilter: [] as readonly string[],
  capacityRange: { min: 0, max: 1000 } as const,
  sortBy: 'name' as TSortBy,
  sortOrder: 'asc' as TSortOrder,
  selectedFacilityIds: [] as readonly string[],
};

export const useFacilityUIStore = create<IFacilityUIState>()(
  devtools(
    (set) => ({
      ...initialState,

      // View actions
      setView: (view) => set({ view }),
      setShowFilters: (showFilters) => set({ showFilters }),
      toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

      // Search and filter actions
      setSearchTerm: (searchTerm) => set({ searchTerm }),

      setStatusFilter: (statusFilter) => set({ statusFilter }),
      toggleStatusFilter: (status) =>
        set((state) => ({
          statusFilter: state.statusFilter.includes(status)
            ? state.statusFilter.filter((s) => s !== status)
            : [...state.statusFilter, status],
        })),

      setTypeFilter: (typeFilter) => set({ typeFilter }),
      toggleTypeFilter: (type) =>
        set((state) => ({
          typeFilter: state.typeFilter.includes(type)
            ? state.typeFilter.filter((t) => t !== type)
            : [...state.typeFilter, type],
        })),

      setCapacityRange: (capacityRange) => set({ capacityRange }),

      // Sort actions
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      toggleSort: (sortBy) =>
        set((state) => ({
          sortBy,
          sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
        })),

      // Selection actions
      selectFacility: (id) =>
        set((state) => ({
          selectedFacilityIds: [...state.selectedFacilityIds, id],
        })),

      deselectFacility: (id) =>
        set((state) => ({
          selectedFacilityIds: state.selectedFacilityIds.filter((fId) => fId !== id),
        })),

      toggleFacilitySelection: (id) =>
        set((state) => ({
          selectedFacilityIds: state.selectedFacilityIds.includes(id)
            ? state.selectedFacilityIds.filter((fId) => fId !== id)
            : [...state.selectedFacilityIds, id],
        })),

      selectAllFacilities: (ids) => set({ selectedFacilityIds: ids }),

      clearSelection: () => set({ selectedFacilityIds: [] }),

      // Reset actions
      resetFilters: () =>
        set({
          searchTerm: '',
          statusFilter: [],
          typeFilter: [],
          capacityRange: { min: 0, max: 1000 },
        }),

      resetAll: () => set(initialState),
    }),
    { name: 'FacilityUIStore' }
  )
);
