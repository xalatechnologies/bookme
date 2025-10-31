/**
 * Approvals Management Hook
 *
 * Connects UI components to business logic and data services for approvals management.
 * Provides a clean interface for handling booking approvals/rejections.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback, useState } from 'react';
import {
  useOrgBookings,
  useUpdateBooking,
  type BookingWithDetails,
} from '@/services/supabase/bookings.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import {
  filterBookings,
  sortBookings,
  calculateBookingStats,
  canCancelBooking,
  canModifyBooking,
  type IBookingFilters,
  type IBookingSortConfig,
  type BookingWithFacility,
  type BookingStats,
  type CancellationEligibility,
  type ModificationEligibility,
} from '@/services/business/booking.business.service';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

/**
 * Approval-specific filter state
 */
export interface IApprovalFilters {
  readonly searchTerm?: string;
  readonly statusFilter: readonly BookingStatus[];
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly facilityType?: string;
}

/**
 * Approval action result
 */
export interface IApprovalActionResult {
  readonly success: boolean;
  readonly error?: string;
  readonly bookingId: string;
}

/**
 * Return type for the approvals management hook
 */
export interface IUseApprovalsManagementReturn {
  // Data
  readonly pendingBookings: readonly BookingWithDetails[];
  readonly allBookings: readonly BookingWithDetails[];
  readonly filteredBookings: readonly BookingWithDetails[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly stats: BookingStats;
  readonly pendingCount: number;
  readonly approvedTodayCount: number;
  readonly rejectedTodayCount: number;

  // Filter State
  readonly filters: IApprovalFilters;
  readonly setSearchTerm: (term: string) => void;
  readonly setStatusFilter: (statuses: readonly BookingStatus[]) => void;
  readonly setDateRange: (from: string, to: string) => void;
  readonly clearDateRange: () => void;
  readonly setFacilityType: (type: string) => void;
  readonly resetFilters: () => void;

  // Sort State
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
  readonly setSortBy: (field: string) => void;
  readonly toggleSortOrder: () => void;

  // Approval Actions
  readonly approveBooking: (id: string, reason?: string) => Promise<IApprovalActionResult>;
  readonly rejectBooking: (id: string, reason?: string) => Promise<IApprovalActionResult>;
  readonly batchApprove: (ids: readonly string[]) => Promise<readonly IApprovalActionResult[]>;
  readonly batchReject: (ids: readonly string[]) => Promise<readonly IApprovalActionResult[]>;

  // Validation
  readonly canApprove: (booking: BookingWithDetails) => boolean;
  readonly canReject: (booking: BookingWithDetails) => boolean;
  readonly canCancelBooking: (booking: BookingWithDetails) => CancellationEligibility;
  readonly canModifyBooking: (booking: BookingWithDetails) => ModificationEligibility;
}

/**
 * Hook for managing booking approvals with business logic separation
 *
 * Provides comprehensive approval management functionality including:
 * - Data fetching and caching via React Query
 * - Filtering and sorting of pending approvals
 * - Approve/reject operations with validation
 * - Batch operations for multiple bookings
 * - Statistics and KPI calculations
 *
 * @returns Complete approvals management interface
 *
 * @example
 * ```tsx
 * function ApprovalsPage() {
 *   const {
 *     pendingBookings,
 *     isLoading,
 *     stats,
 *     approveBooking,
 *     rejectBooking,
 *     canApprove,
 *   } = useApprovalsManagement();
 *
 *   const handleApprove = async (bookingId: string) => {
 *     const booking = pendingBookings.find(b => b.id === bookingId);
 *     if (!booking || !canApprove(booking)) {
 *       toast.error('Cannot approve this booking');
 *       return;
 *     }
 *
 *     const result = await approveBooking(bookingId);
 *     if (result.success) {
 *       toast.success('Booking approved successfully');
 *     } else {
 *       toast.error(result.error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <ApprovalStats stats={stats} />
 *       <ApprovalsList bookings={pendingBookings} onApprove={handleApprove} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useApprovalsManagement = (): IUseApprovalsManagementReturn => {
  // Data layer - fetch bookings from Supabase
  const orgId = useOrganizationId();
  const {
    data: allBookings = [],
    isLoading,
    error,
  } = useOrgBookings(orgId);
  const updateBookingMutation = useUpdateBooking();

  // Local filter state
  const [filters, setFilters] = useState<IApprovalFilters>({
    searchTerm: '',
    statusFilter: ['pending'],
    dateFrom: '',
    dateTo: '',
    facilityType: '',
  });

  // Local sort state
  const [sortBy, setSortBy] = useState<string>('starts_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter for pending bookings only
  const pendingBookings = useMemo(
    () => allBookings.filter((booking) => booking.status === 'pending'),
    [allBookings]
  );

  // Apply filters and sorting
  const filteredBookings = useMemo(() => {
    // Map BookingWithDetails to BookingWithFacility for business logic
    const bookingsWithFacility: BookingWithFacility[] = allBookings.map((booking) => ({
      ...booking,
      facilities: booking.facility
        ? {
            name: booking.facility.name,
            facility_type: booking.facility.facility_type,
            address: booking.facility.address,
          }
        : undefined,
    }));

    // Build business logic filters
    const businessFilters: IBookingFilters = {
      searchTerm: filters.searchTerm,
      statusFilter: filters.statusFilter,
      dateRange:
        filters.dateFrom && filters.dateTo
          ? {
              startDate: new Date(filters.dateFrom),
              endDate: new Date(filters.dateTo),
            }
          : undefined,
    };

    // Apply facility type filter
    let filtered = filterBookings(bookingsWithFacility, businessFilters);

    if (filters.facilityType) {
      filtered = filtered.filter(
        (booking) => booking.facilities?.facility_type === filters.facilityType
      );
    }

    // Apply sorting
    const sortConfig: IBookingSortConfig = {
      sortBy: sortBy as any,
      sortOrder,
    };

    return sortBookings(filtered, sortConfig) as readonly BookingWithDetails[];
  }, [allBookings, filters, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => calculateBookingStats(allBookings), [allBookings]);

  const pendingCount = useMemo(
    () => allBookings.filter((b) => b.status === 'pending').length,
    [allBookings]
  );

  const approvedTodayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allBookings.filter((b) => {
      if (b.status !== 'paid' && b.status !== 'awaiting_payment') return false;
      const updatedAt = new Date(b.updated_at);
      return updatedAt >= today;
    }).length;
  }, [allBookings]);

  const rejectedTodayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allBookings.filter((b) => {
      if (b.status !== 'cancelled') return false;
      const updatedAt = new Date(b.updated_at);
      return updatedAt >= today;
    }).length;
  }, [allBookings]);

  // Filter actions
  const setSearchTerm = useCallback((term: string): void => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const setStatusFilter = useCallback((statuses: readonly BookingStatus[]): void => {
    setFilters((prev) => ({ ...prev, statusFilter: statuses }));
  }, []);

  const setDateRange = useCallback((from: string, to: string): void => {
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }, []);

  const clearDateRange = useCallback((): void => {
    setFilters((prev) => ({ ...prev, dateFrom: '', dateTo: '' }));
  }, []);

  const setFacilityType = useCallback((type: string): void => {
    setFilters((prev) => ({ ...prev, facilityType: type }));
  }, []);

  const resetFilters = useCallback((): void => {
    setFilters({
      searchTerm: '',
      statusFilter: ['pending'],
      dateFrom: '',
      dateTo: '',
      facilityType: '',
    });
  }, []);

  // Sort actions
  const toggleSortOrder = useCallback((): void => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Validation functions
  const canApprove = useCallback(
    (booking: BookingWithDetails): boolean => {
      // Can only approve pending bookings
      if (booking.status !== 'pending') return false;

      // Check if booking is in the future
      const startTime = new Date(booking.starts_at);
      const now = new Date();
      if (startTime <= now) return false;

      return true;
    },
    []
  );

  const canReject = useCallback(
    (booking: BookingWithDetails): boolean => {
      // Can only reject pending bookings
      if (booking.status !== 'pending') return false;

      return true;
    },
    []
  );

  // Approval actions
  const approveBooking = useCallback(
    async (id: string, reason?: string): Promise<IApprovalActionResult> => {
      try {
        const booking = allBookings.find((b) => b.id === id);
        if (!booking) {
          return {
            success: false,
            error: 'Booking not found',
            bookingId: id,
          };
        }

        if (!canApprove(booking)) {
          return {
            success: false,
            error: 'Booking cannot be approved at this time',
            bookingId: id,
          };
        }

        const updates: BookingUpdate = {
          status: 'awaiting_payment',
          updated_at: new Date().toISOString(),
          notes: reason ? `Approved: ${reason}` : booking.notes,
        };

        await updateBookingMutation.mutateAsync({ id, updates });

        return {
          success: true,
          bookingId: id,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to approve booking',
          bookingId: id,
        };
      }
    },
    [allBookings, canApprove, updateBookingMutation]
  );

  const rejectBooking = useCallback(
    async (id: string, reason?: string): Promise<IApprovalActionResult> => {
      try {
        const booking = allBookings.find((b) => b.id === id);
        if (!booking) {
          return {
            success: false,
            error: 'Booking not found',
            bookingId: id,
          };
        }

        if (!canReject(booking)) {
          return {
            success: false,
            error: 'Booking cannot be rejected at this time',
            bookingId: id,
          };
        }

        const updates: BookingUpdate = {
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          notes: reason ? `Rejected: ${reason}` : booking.notes,
        };

        await updateBookingMutation.mutateAsync({ id, updates });

        return {
          success: true,
          bookingId: id,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to reject booking',
          bookingId: id,
        };
      }
    },
    [allBookings, canReject, updateBookingMutation]
  );

  const batchApprove = useCallback(
    async (ids: readonly string[]): Promise<readonly IApprovalActionResult[]> => {
      const results = await Promise.all(ids.map((id) => approveBooking(id)));
      return results;
    },
    [approveBooking]
  );

  const batchReject = useCallback(
    async (ids: readonly string[]): Promise<readonly IApprovalActionResult[]> => {
      const results = await Promise.all(ids.map((id) => rejectBooking(id)));
      return results;
    },
    [rejectBooking]
  );

  return {
    // Data
    pendingBookings,
    allBookings,
    filteredBookings,
    isLoading,
    error,

    // Statistics
    stats,
    pendingCount,
    approvedTodayCount,
    rejectedTodayCount,

    // Filter State
    filters,
    setSearchTerm,
    setStatusFilter,
    setDateRange,
    clearDateRange,
    setFacilityType,
    resetFilters,

    // Sort State
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,

    // Approval Actions
    approveBooking,
    rejectBooking,
    batchApprove,
    batchReject,

    // Validation
    canApprove,
    canReject,
    canCancelBooking,
    canModifyBooking,
  };
};
