/**
 * Booking Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for booking management operations.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import {
  useOrgBookings,
  useUpdateBooking,
  useCancelBooking,
  type BookingWithDetails,
} from '@/services/supabase/bookings.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useBookingUIStore, type TBookingView, type TBookingSortBy } from '@/stores/bookingUIStore';
import {
  filterBookings,
  sortBookings,
  calculateBookingStats,
  canCancelBooking,
  canModifyBooking,
  getAllBookingStatuses,
  getUniqueBookingStatuses,
  type IBookingFilters,
  type IBookingSortConfig,
  type BookingWithFacility,
  type BookingStats,
  type CancellationEligibility,
  type ModificationEligibility,
  type BookingStatus,
} from '@/services/business/booking.business.service';
import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export interface IUseBookingManagementReturn {
  // Data
  readonly bookings: readonly BookingWithDetails[];
  readonly filteredBookings: readonly BookingWithDetails[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly stats: BookingStats;
  readonly uniqueStatuses: readonly string[];
  readonly allStatuses: readonly string[];

  // UI State
  readonly view: string;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly statusFilter: readonly string[];
  readonly facilityFilter: readonly string[];
  readonly dateRange: { readonly startDate: Date | null; readonly endDate: Date | null };
  readonly sortBy: string;
  readonly sortOrder: string;
  readonly selectedBookingIds: readonly string[];
  readonly calendarDate: Date;

  // UI Actions
  readonly setView: (view: TBookingView) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly toggleFacilityFilter: (facilityId: string) => void;
  readonly setDateRange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  readonly clearDateRange: () => void;
  readonly toggleSort: (sortBy: TBookingSortBy) => void;
  readonly toggleBookingSelection: (id: string) => void;
  readonly selectAllBookings: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;
  readonly setCalendarDate: (date: Date) => void;

  // Business Operations
  readonly updateBooking: (id: string, updates: BookingUpdate) => Promise<void>;
  readonly cancelBooking: (id: string) => Promise<void>;
  readonly batchCancelBookings: (ids: readonly string[]) => Promise<void>;
  readonly updateBookingStatus: (id: string, status: string) => Promise<void>;
  readonly batchUpdateStatus: (ids: readonly string[], status: string) => Promise<void>;

  // Validation
  readonly canCancelBooking: (booking: Booking) => CancellationEligibility;
  readonly canModifyBooking: (booking: Booking) => ModificationEligibility;
}

/**
 * Hook for managing bookings with business logic separation
 *
 * Provides comprehensive booking management functionality including:
 * - Data fetching and caching via React Query
 * - UI state management via Zustand store
 * - Business logic validation and operations
 * - Filtering, sorting, and search
 * - CRUD operations with optimistic updates
 * - Batch operations for multiple bookings
 *
 * @returns Complete booking management interface
 *
 * @example
 * ```tsx
 * function BookingManagementPage() {
 *   const {
 *     filteredBookings,
 *     isLoading,
 *     stats,
 *     searchTerm,
 *     setSearchTerm,
 *     cancelBooking,
 *     canCancelBooking,
 *   } = useBookingManagement();
 *
 *   const handleCancel = async (bookingId: string) => {
 *     const booking = filteredBookings.find(b => b.id === bookingId);
 *     if (!booking) return;
 *
 *     const eligibility = canCancelBooking(booking);
 *     if (!eligibility.canCancel) {
 *       toast.error(eligibility.reason);
 *       return;
 *     }
 *
 *     await cancelBooking(bookingId);
 *     toast.success('Booking cancelled successfully');
 *   };
 *
 *   return (
 *     <div>
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <BookingStats stats={stats} />
 *       <BookingList bookings={filteredBookings} onCancel={handleCancel} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useBookingManagement = (): IUseBookingManagementReturn => {
  // Data layer - fetch bookings from Supabase
  const orgId = useOrganizationId();
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useOrgBookings(orgId);
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();

  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    showFilters,
    searchTerm,
    statusFilter,
    facilityFilter,
    dateRange,
    sortBy,
    sortOrder,
    selectedBookingIds,
    calendarDate,
    setView,
    toggleFilters,
    setSearchTerm,
    toggleStatusFilter,
    toggleFacilityFilter,
    setDateRange,
    clearDateRange,
    toggleSort,
    toggleBookingSelection,
    selectAllBookings: selectAll,
    clearSelection,
    resetFilters,
    setCalendarDate,
  } = useBookingUIStore();

  // Business logic layer - filtering and sorting
  const filteredBookings = useMemo(() => {
    // Map BookingWithDetails to BookingWithFacility for business logic
    const bookingsWithFacility: BookingWithFacility[] = bookings.map((booking) => ({
      ...booking,
      facilities: booking.facility
        ? {
            name: booking.facility.name,
            facility_type: booking.facility.facility_type,
            address: booking.facility.address,
          }
        : undefined,
    }));

    // Apply business logic filters
    const filters: IBookingFilters = {
      searchTerm,
      statusFilter: statusFilter as readonly BookingStatus[],
      facilityIds: facilityFilter,
      dateRange: dateRange.startDate && dateRange.endDate
        ? {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }
        : undefined,
    };

    const filtered = filterBookings(bookingsWithFacility, filters);

    // Apply business logic sorting
    const sortConfig: IBookingSortConfig = {
      sortBy: sortBy as IBookingSortConfig['sortBy'],
      sortOrder: sortOrder as IBookingSortConfig['sortOrder'],
    };

    return sortBookings(filtered, sortConfig) as readonly BookingWithDetails[];
  }, [bookings, searchTerm, statusFilter, facilityFilter, dateRange, sortBy, sortOrder]);

  // Statistics - calculate from current bookings
  const stats = useMemo(() => calculateBookingStats(bookings), [bookings]);

  // Unique statuses from current bookings
  const uniqueStatuses = useMemo(() => getUniqueBookingStatuses(bookings), [bookings]);

  // All possible statuses
  const allStatuses = useMemo(() => getAllBookingStatuses(), []);

  // Business operations
  const updateBooking = useCallback(
    async (id: string, updates: BookingUpdate): Promise<void> => {
      await updateBookingMutation.mutateAsync({ id, updates });
    },
    [updateBookingMutation]
  );

  const cancelBooking = useCallback(
    async (id: string): Promise<void> => {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const validation = canCancelBooking(booking);
      if (!validation.canCancel) {
        throw new Error(validation.reason || 'Cannot cancel booking');
      }

      await cancelBookingMutation.mutateAsync(id);
    },
    [bookings, cancelBookingMutation]
  );

  const batchCancelBookings = useCallback(
    async (ids: readonly string[]): Promise<void> => {
      const bookingsToCancel = bookings.filter((b) => ids.includes(b.id));

      // Validate all bookings can be cancelled
      for (const booking of bookingsToCancel) {
        const validation = canCancelBooking(booking);
        if (!validation.canCancel) {
          throw new Error(
            `Cannot cancel booking ${booking.id}: ${validation.reason}`
          );
        }
      }

      // Cancel all bookings
      await Promise.all(ids.map((id) => cancelBookingMutation.mutateAsync(id)));
      clearSelection();
    },
    [bookings, cancelBookingMutation, clearSelection]
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: string): Promise<void> => {
      await updateBookingMutation.mutateAsync({
        id,
        updates: { status: status as BookingStatus },
      });
    },
    [updateBookingMutation]
  );

  const batchUpdateStatus = useCallback(
    async (ids: readonly string[], status: string): Promise<void> => {
      await Promise.all(
        ids.map((id) =>
          updateBookingMutation.mutateAsync({
            id,
            updates: { status: status as BookingStatus },
          })
        )
      );
      clearSelection();
    },
    [updateBookingMutation, clearSelection]
  );

  const selectAllBookings = useCallback(() => {
    selectAll(filteredBookings.map((b) => b.id));
  }, [filteredBookings, selectAll]);

  return {
    // Data
    bookings,
    filteredBookings,
    isLoading,
    error,

    // Statistics
    stats,
    uniqueStatuses,
    allStatuses,

    // UI State
    view,
    showFilters,
    searchTerm,
    statusFilter,
    facilityFilter,
    dateRange,
    sortBy,
    sortOrder,
    selectedBookingIds,
    calendarDate,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleStatusFilter,
    toggleFacilityFilter,
    setDateRange,
    clearDateRange,
    toggleSort,
    toggleBookingSelection,
    selectAllBookings,
    clearSelection,
    resetFilters,
    setCalendarDate,

    // Business Operations
    updateBooking,
    cancelBooking,
    batchCancelBookings,
    updateBookingStatus,
    batchUpdateStatus,

    // Validation
    canCancelBooking,
    canModifyBooking,
  };
};
