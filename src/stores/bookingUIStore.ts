/**
 * Booking UI State Management Store
 *
 * Manages UI-specific state for booking management pages.
 * Separated from business logic and data fetching.
 * Follows clean architecture principles - UI concerns only.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export type TBookingView = 'list' | 'calendar' | 'table';
export type TBookingSortBy = 'date' | 'facility' | 'status' | 'created_at' | 'updated_at';
export type TBookingSortOrder = 'asc' | 'desc';
export type TBookingStatus = 'active' | 'paused' | 'cancelled' | 'completed';

interface IDateRange {
  readonly startDate: Date | null;
  readonly endDate: Date | null;
}

interface IBookingUIState {
  // View state
  readonly view: TBookingView;
  readonly showFilters: boolean;
  readonly calendarDate: Date;

  // Search and filter state
  readonly searchTerm: string;
  readonly statusFilter: readonly TBookingStatus[];
  readonly facilityFilter: readonly string[];
  readonly dateRange: IDateRange;

  // Sort state
  readonly sortBy: TBookingSortBy;
  readonly sortOrder: TBookingSortOrder;

  // Selection state
  readonly selectedBookingIds: readonly string[];

  // Modal state
  readonly isCreateModalOpen: boolean;
  readonly isEditModalOpen: boolean;
  readonly isDeleteModalOpen: boolean;
  readonly isDetailsModalOpen: boolean;
  readonly isBatchActionsModalOpen: boolean;
  readonly activeBookingId: string | null;

  // View actions
  readonly setView: (view: TBookingView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;
  readonly setCalendarDate: (date: Date) => void;

  // Search and filter actions
  readonly setSearchTerm: (term: string) => void;
  readonly setStatusFilter: (statuses: readonly TBookingStatus[]) => void;
  readonly toggleStatusFilter: (status: TBookingStatus) => void;
  readonly setFacilityFilter: (facilityIds: readonly string[]) => void;
  readonly toggleFacilityFilter: (facilityId: string) => void;
  readonly setDateRange: (range: IDateRange) => void;
  readonly clearDateRange: () => void;

  // Sort actions
  readonly setSortBy: (sortBy: TBookingSortBy) => void;
  readonly setSortOrder: (order: TBookingSortOrder) => void;
  readonly toggleSort: (sortBy: TBookingSortBy) => void;

  // Selection actions
  readonly selectBooking: (id: string) => void;
  readonly deselectBooking: (id: string) => void;
  readonly toggleBookingSelection: (id: string) => void;
  readonly selectAllBookings: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  // Modal actions
  readonly openCreateModal: () => void;
  readonly closeCreateModal: () => void;
  readonly openEditModal: (bookingId: string) => void;
  readonly closeEditModal: () => void;
  readonly openDeleteModal: (bookingId: string) => void;
  readonly closeDeleteModal: () => void;
  readonly openDetailsModal: (bookingId: string) => void;
  readonly closeDetailsModal: () => void;
  readonly openBatchActionsModal: () => void;
  readonly closeBatchActionsModal: () => void;
  readonly closeAllModals: () => void;

  // Reset actions
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'list' as TBookingView,
  showFilters: false,
  calendarDate: new Date(),
  searchTerm: '',
  statusFilter: [] as readonly TBookingStatus[],
  facilityFilter: [] as readonly string[],
  dateRange: { startDate: null, endDate: null } as IDateRange,
  sortBy: 'date' as TBookingSortBy,
  sortOrder: 'desc' as TBookingSortOrder,
  selectedBookingIds: [] as readonly string[],
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  isDetailsModalOpen: false,
  isBatchActionsModalOpen: false,
  activeBookingId: null,
};

export const useBookingUIStore = create<IBookingUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),
        setShowFilters: (showFilters) => set({ showFilters }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
        setCalendarDate: (calendarDate) => set({ calendarDate }),

        // Search and filter actions
        setSearchTerm: (searchTerm) => set({ searchTerm }),

        setStatusFilter: (statusFilter) => set({ statusFilter }),
        toggleStatusFilter: (status) =>
          set((state) => ({
            statusFilter: state.statusFilter.includes(status)
              ? state.statusFilter.filter((s) => s !== status)
              : [...state.statusFilter, status],
          })),

        setFacilityFilter: (facilityFilter) => set({ facilityFilter }),
        toggleFacilityFilter: (facilityId) =>
          set((state) => ({
            facilityFilter: state.facilityFilter.includes(facilityId)
              ? state.facilityFilter.filter((id) => id !== facilityId)
              : [...state.facilityFilter, facilityId],
          })),

        setDateRange: (dateRange) => set({ dateRange }),
        clearDateRange: () => set({ dateRange: { startDate: null, endDate: null } }),

        // Sort actions
        setSortBy: (sortBy) => set({ sortBy }),
        setSortOrder: (sortOrder) => set({ sortOrder }),
        toggleSort: (sortBy) =>
          set((state) => ({
            sortBy,
            sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
          })),

        // Selection actions
        selectBooking: (id) =>
          set((state) => ({
            selectedBookingIds: [...state.selectedBookingIds, id],
          })),

        deselectBooking: (id) =>
          set((state) => ({
            selectedBookingIds: state.selectedBookingIds.filter((bookingId) => bookingId !== id),
          })),

        toggleBookingSelection: (id) =>
          set((state) => ({
            selectedBookingIds: state.selectedBookingIds.includes(id)
              ? state.selectedBookingIds.filter((bookingId) => bookingId !== id)
              : [...state.selectedBookingIds, id],
          })),

        selectAllBookings: (ids) => set({ selectedBookingIds: ids }),

        clearSelection: () => set({ selectedBookingIds: [] }),

        // Modal actions
        openCreateModal: () => set({ isCreateModalOpen: true, activeBookingId: null }),
        closeCreateModal: () => set({ isCreateModalOpen: false }),

        openEditModal: (bookingId) => set({ isEditModalOpen: true, activeBookingId: bookingId }),
        closeEditModal: () => set({ isEditModalOpen: false, activeBookingId: null }),

        openDeleteModal: (bookingId) => set({ isDeleteModalOpen: true, activeBookingId: bookingId }),
        closeDeleteModal: () => set({ isDeleteModalOpen: false, activeBookingId: null }),

        openDetailsModal: (bookingId) => set({ isDetailsModalOpen: true, activeBookingId: bookingId }),
        closeDetailsModal: () => set({ isDetailsModalOpen: false, activeBookingId: null }),

        openBatchActionsModal: () => set({ isBatchActionsModalOpen: true }),
        closeBatchActionsModal: () => set({ isBatchActionsModalOpen: false }),

        closeAllModals: () =>
          set({
            isCreateModalOpen: false,
            isEditModalOpen: false,
            isDeleteModalOpen: false,
            isDetailsModalOpen: false,
            isBatchActionsModalOpen: false,
            activeBookingId: null,
          }),

        // Reset actions
        resetFilters: () =>
          set({
            searchTerm: '',
            statusFilter: [],
            facilityFilter: [],
            dateRange: { startDate: null, endDate: null },
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'booking-ui-store',
        version: 1,
      }
    ),
    { name: 'BookingUIStore' }
  )
);
