/**
 * Cart UI State Management Store
 *
 * Manages UI-specific state for shopping cart pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TCartView = 'list' | 'summary';
export type TCartSortBy = 'date' | 'facility' | 'price' | 'duration';
export type TCartSortOrder = 'asc' | 'desc';
export type TCheckoutStep = 'review' | 'payment' | 'confirmation';

interface ICartUIState {
  // View state
  readonly view: TCartView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly facilityFilter: readonly string[];
  readonly dateFilter: string | null;

  // Sort state
  readonly sortBy: TCartSortBy;
  readonly sortOrder: TCartSortOrder;

  // Selection state
  readonly selectedItemIds: readonly string[];

  // Checkout state
  readonly checkoutStep: TCheckoutStep;

  // Modal state
  readonly modals: {
    readonly checkout: boolean;
    readonly remove: boolean;
    readonly clear: boolean;
  };
  readonly activeItemId: string | null;

  // Actions
  readonly setView: (view: TCartView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  readonly setSearchTerm: (term: string) => void;
  readonly setFacilityFilter: (facilities: readonly string[]) => void;
  readonly toggleFacilityFilter: (facility: string) => void;
  readonly setDateFilter: (date: string | null) => void;

  readonly setSortBy: (sortBy: TCartSortBy) => void;
  readonly setSortOrder: (order: TCartSortOrder) => void;
  readonly toggleSort: (sortBy: TCartSortBy) => void;

  readonly selectItem: (id: string) => void;
  readonly deselectItem: (id: string) => void;
  readonly toggleItemSelection: (id: string) => void;
  readonly selectAllItems: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  readonly setCheckoutStep: (step: TCheckoutStep) => void;
  readonly nextCheckoutStep: () => void;
  readonly previousCheckoutStep: () => void;
  readonly resetCheckout: () => void;

  readonly openModal: (modal: keyof ICartUIState['modals'], itemId?: string) => void;
  readonly closeModal: (modal: keyof ICartUIState['modals']) => void;
  readonly closeAllModals: () => void;
  readonly setActiveItemId: (id: string | null) => void;

  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'list' as TCartView,
  showFilters: false,
  searchTerm: '',
  facilityFilter: [] as readonly string[],
  dateFilter: null as string | null,
  sortBy: 'date' as TCartSortBy,
  sortOrder: 'desc' as TCartSortOrder,
  selectedItemIds: [] as readonly string[],
  checkoutStep: 'review' as TCheckoutStep,
  modals: {
    checkout: false,
    remove: false,
    clear: false,
  } as const,
  activeItemId: null as string | null,
};

export const useCartUIStore = create<ICartUIState>()(
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

        setFacilityFilter: (facilityFilter) => set({ facilityFilter }),
        toggleFacilityFilter: (facility) =>
          set((state) => ({
            facilityFilter: state.facilityFilter.includes(facility)
              ? state.facilityFilter.filter((f) => f !== facility)
              : [...state.facilityFilter, facility],
          })),

        setDateFilter: (dateFilter) => set({ dateFilter }),

        // Sort actions
        setSortBy: (sortBy) => set({ sortBy }),
        setSortOrder: (sortOrder) => set({ sortOrder }),
        toggleSort: (sortBy) =>
          set((state) => ({
            sortBy,
            sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
          })),

        // Selection actions
        selectItem: (id) =>
          set((state) => ({
            selectedItemIds: [...state.selectedItemIds, id],
          })),

        deselectItem: (id) =>
          set((state) => ({
            selectedItemIds: state.selectedItemIds.filter((iId) => iId !== id),
          })),

        toggleItemSelection: (id) =>
          set((state) => ({
            selectedItemIds: state.selectedItemIds.includes(id)
              ? state.selectedItemIds.filter((iId) => iId !== id)
              : [...state.selectedItemIds, id],
          })),

        selectAllItems: (ids) => set({ selectedItemIds: ids }),

        clearSelection: () => set({ selectedItemIds: [] }),

        // Checkout actions
        setCheckoutStep: (checkoutStep) => set({ checkoutStep }),

        nextCheckoutStep: () =>
          set((state) => {
            const steps: TCheckoutStep[] = ['review', 'payment', 'confirmation'];
            const currentIndex = steps.indexOf(state.checkoutStep);
            const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
            return { checkoutStep: steps[nextIndex] };
          }),

        previousCheckoutStep: () =>
          set((state) => {
            const steps: TCheckoutStep[] = ['review', 'payment', 'confirmation'];
            const currentIndex = steps.indexOf(state.checkoutStep);
            const prevIndex = Math.max(currentIndex - 1, 0);
            return { checkoutStep: steps[prevIndex] };
          }),

        resetCheckout: () => set({ checkoutStep: 'review' }),

        // Modal actions
        openModal: (modal, itemId) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: true },
            activeItemId: itemId ?? state.activeItemId,
          })),

        closeModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: false },
          })),

        closeAllModals: () =>
          set({
            modals: {
              checkout: false,
              remove: false,
              clear: false,
            },
            activeItemId: null,
          }),

        setActiveItemId: (activeItemId) => set({ activeItemId }),

        // Reset actions
        resetFilters: () =>
          set({
            searchTerm: '',
            facilityFilter: [],
            dateFilter: null,
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'cart-ui-store',
        version: 1,
      }
    ),
    { name: 'CartUIStore' }
  )
);
