/**
 * Support UI State Management Store
 *
 * Manages UI-specific state for support/ticket management pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TSupportView = 'list' | 'inbox' | 'resolved';
export type TTicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
export type TTicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TSupportSortBy = 'created_at' | 'priority' | 'status' | 'updated_at';
export type TSortOrder = 'asc' | 'desc';

export type TModalType = 'create_ticket' | 'reply' | 'close' | 'escalate' | null;

interface ITicketFilter {
  readonly search: string;
  readonly statuses: readonly TTicketStatus[];
  readonly priorities: readonly TTicketPriority[];
  readonly categories: readonly string[];
}

interface ISupportUIState {
  // View state
  readonly view: TSupportView;
  readonly showFilters: boolean;

  // Filter state
  readonly filters: ITicketFilter;

  // Sort state
  readonly sortBy: TSupportSortBy;
  readonly sortOrder: TSortOrder;

  // Selection state for batch operations
  readonly selectedTicketIds: readonly string[];

  // Modal state
  readonly activeModal: TModalType;
  readonly activeTicketId: string | null;

  // View actions
  readonly setView: (view: TSupportView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  // Filter actions
  readonly setSearchTerm: (term: string) => void;
  readonly setStatusFilter: (statuses: readonly TTicketStatus[]) => void;
  readonly toggleStatusFilter: (status: TTicketStatus) => void;
  readonly setPriorityFilter: (priorities: readonly TTicketPriority[]) => void;
  readonly togglePriorityFilter: (priority: TTicketPriority) => void;
  readonly setCategoryFilter: (categories: readonly string[]) => void;
  readonly toggleCategoryFilter: (category: string) => void;

  // Sort actions
  readonly setSortBy: (sortBy: TSupportSortBy) => void;
  readonly setSortOrder: (order: TSortOrder) => void;
  readonly toggleSort: (sortBy: TSupportSortBy) => void;

  // Selection actions
  readonly selectTicket: (id: string) => void;
  readonly deselectTicket: (id: string) => void;
  readonly toggleTicketSelection: (id: string) => void;
  readonly selectAllTickets: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  // Modal actions
  readonly openModal: (modal: TModalType, ticketId?: string) => void;
  readonly closeModal: () => void;
  readonly setActiveTicketId: (id: string | null) => void;

  // Reset actions
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'inbox' as TSupportView,
  showFilters: false,
  filters: {
    search: '',
    statuses: [] as readonly TTicketStatus[],
    priorities: [] as readonly TTicketPriority[],
    categories: [] as readonly string[],
  },
  sortBy: 'created_at' as TSupportSortBy,
  sortOrder: 'desc' as TSortOrder,
  selectedTicketIds: [] as readonly string[],
  activeModal: null as TModalType,
  activeTicketId: null as string | null,
};

export const useSupportUIStore = create<ISupportUIState>()(
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

        setStatusFilter: (statuses) =>
          set((state) => ({
            filters: { ...state.filters, statuses },
          })),

        toggleStatusFilter: (status) =>
          set((state) => ({
            filters: {
              ...state.filters,
              statuses: state.filters.statuses.includes(status)
                ? state.filters.statuses.filter((s) => s !== status)
                : [...state.filters.statuses, status],
            },
          })),

        setPriorityFilter: (priorities) =>
          set((state) => ({
            filters: { ...state.filters, priorities },
          })),

        togglePriorityFilter: (priority) =>
          set((state) => ({
            filters: {
              ...state.filters,
              priorities: state.filters.priorities.includes(priority)
                ? state.filters.priorities.filter((p) => p !== priority)
                : [...state.filters.priorities, priority],
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
        selectTicket: (id) =>
          set((state) => ({
            selectedTicketIds: [...state.selectedTicketIds, id],
          })),

        deselectTicket: (id) =>
          set((state) => ({
            selectedTicketIds: state.selectedTicketIds.filter((tId) => tId !== id),
          })),

        toggleTicketSelection: (id) =>
          set((state) => ({
            selectedTicketIds: state.selectedTicketIds.includes(id)
              ? state.selectedTicketIds.filter((tId) => tId !== id)
              : [...state.selectedTicketIds, id],
          })),

        selectAllTickets: (ids) => set({ selectedTicketIds: ids }),

        clearSelection: () => set({ selectedTicketIds: [] }),

        // Modal actions
        openModal: (modal, ticketId) =>
          set({
            activeModal: modal,
            activeTicketId: ticketId || null,
          }),

        closeModal: () =>
          set({
            activeModal: null,
            activeTicketId: null,
          }),

        setActiveTicketId: (id) => set({ activeTicketId: id }),

        // Reset actions
        resetFilters: () =>
          set({
            filters: {
              search: '',
              statuses: [],
              priorities: [],
              categories: [],
            },
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'support-ui-store',
        version: 1,
      }
    ),
    { name: 'SupportUIStore' }
  )
);
