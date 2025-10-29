/**
 * Favorites UI State Management Store
 *
 * Manages UI-specific state for favorites management pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TFavoritesView = 'grid' | 'list';
export type TFavoritesSortBy = 'name' | 'date_added' | 'usage_count';
export type TSortOrder = 'asc' | 'desc';

export type TFavoritesModalType = 'add' | 'remove' | 'manage' | null;

interface IFavoritesFilter {
  readonly search: string;
  readonly facilityTypes: readonly string[];
  readonly categories: readonly string[];
}

interface IFavoritesUIState {
  // View state
  readonly view: TFavoritesView;
  readonly showFilters: boolean;

  // Filter state
  readonly filters: IFavoritesFilter;

  // Sort state
  readonly sortBy: TFavoritesSortBy;
  readonly sortOrder: TSortOrder;

  // Selection state for batch operations
  readonly selectedFavoriteIds: readonly string[];

  // Modal state
  readonly activeModal: TFavoritesModalType;
  readonly activeFavoriteId: string | null;

  // View actions
  readonly setView: (view: TFavoritesView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  // Filter actions
  readonly setSearchTerm: (term: string) => void;
  readonly setFacilityTypeFilter: (types: readonly string[]) => void;
  readonly toggleFacilityTypeFilter: (type: string) => void;
  readonly setCategoryFilter: (categories: readonly string[]) => void;
  readonly toggleCategoryFilter: (category: string) => void;

  // Sort actions
  readonly setSortBy: (sortBy: TFavoritesSortBy) => void;
  readonly setSortOrder: (order: TSortOrder) => void;
  readonly toggleSort: (sortBy: TFavoritesSortBy) => void;

  // Selection actions
  readonly selectFavorite: (id: string) => void;
  readonly deselectFavorite: (id: string) => void;
  readonly toggleFavoriteSelection: (id: string) => void;
  readonly selectAllFavorites: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  // Modal actions
  readonly openModal: (modal: TFavoritesModalType, favoriteId?: string) => void;
  readonly closeModal: () => void;
  readonly setActiveFavoriteId: (id: string | null) => void;

  // Reset actions
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'grid' as TFavoritesView,
  showFilters: false,
  filters: {
    search: '',
    facilityTypes: [] as readonly string[],
    categories: [] as readonly string[],
  },
  sortBy: 'name' as TFavoritesSortBy,
  sortOrder: 'asc' as TSortOrder,
  selectedFavoriteIds: [] as readonly string[],
  activeModal: null as TFavoritesModalType,
  activeFavoriteId: null as string | null,
};

export const useFavoritesUIStore = create<IFavoritesUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),
        setShowFilters: (showFilters) => set({ showFilters }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

        // Filter actions
        setSearchTerm: (search) =>
          set((state) => ({
            filters: { ...state.filters, search },
          })),

        setFacilityTypeFilter: (facilityTypes) =>
          set((state) => ({
            filters: { ...state.filters, facilityTypes },
          })),

        toggleFacilityTypeFilter: (type) =>
          set((state) => ({
            filters: {
              ...state.filters,
              facilityTypes: state.filters.facilityTypes.includes(type)
                ? state.filters.facilityTypes.filter((t) => t !== type)
                : [...state.filters.facilityTypes, type],
            },
          })),

        setCategoryFilter: (categories) =>
          set((state) => ({
            filters: { ...state.filters, categories },
          })),

        toggleCategoryFilter: (category) =>
          set((state) => ({
            filters: {
              ...state.filters,
              categories: state.filters.categories.includes(category)
                ? state.filters.categories.filter((c) => c !== category)
                : [...state.filters.categories, category],
            },
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
        selectFavorite: (id) =>
          set((state) => ({
            selectedFavoriteIds: [...state.selectedFavoriteIds, id],
          })),

        deselectFavorite: (id) =>
          set((state) => ({
            selectedFavoriteIds: state.selectedFavoriteIds.filter((fId) => fId !== id),
          })),

        toggleFavoriteSelection: (id) =>
          set((state) => ({
            selectedFavoriteIds: state.selectedFavoriteIds.includes(id)
              ? state.selectedFavoriteIds.filter((fId) => fId !== id)
              : [...state.selectedFavoriteIds, id],
          })),

        selectAllFavorites: (ids) => set({ selectedFavoriteIds: ids }),

        clearSelection: () => set({ selectedFavoriteIds: [] }),

        // Modal actions
        openModal: (modal, favoriteId) =>
          set({
            activeModal: modal,
            activeFavoriteId: favoriteId || null,
          }),

        closeModal: () =>
          set({
            activeModal: null,
            activeFavoriteId: null,
          }),

        setActiveFavoriteId: (id) => set({ activeFavoriteId: id }),

        // Reset actions
        resetFilters: () =>
          set({
            filters: {
              search: '',
              facilityTypes: [],
              categories: [],
            },
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'favorites-ui-store',
        version: 1,
      }
    ),
    { name: 'FavoritesUIStore' }
  )
);
