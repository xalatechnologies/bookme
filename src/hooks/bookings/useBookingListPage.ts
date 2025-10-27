/**
 * Booking List Page Hook
 *
 * Main page-level hook that composes React Query and business logic hooks.
 * Provides complete state and actions for the Bookings page.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserBookings } from '@/services/supabase/bookings.service';
import { useBookingFilters, type BookingFilters } from './useBookingFilters';
import { useBookingStats } from './useBookingStats';
import { useRecurringBookingGroups, useStandaloneBookings, useHasRecurringBookings } from './useRecurringBookingGroups';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];

export interface BookingListPageState {
  // Data
  readonly filteredBookings: ReturnType<typeof useBookingFilters>;
  readonly stats: ReturnType<typeof useBookingStats>;
  readonly recurringGroups: ReturnType<typeof useRecurringBookingGroups>;
  readonly standaloneBookings: ReturnType<typeof useStandaloneBookings>;
  readonly hasRecurringBookings: boolean;

  // Loading states
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;

  // Filter state
  readonly filters: BookingFilters;
  readonly setStatusFilter: (status: BookingStatus | 'all') => void;
  readonly setFacilityFilter: (facilityId: string | undefined) => void;
  readonly setDateRangeFilter: (range: BookingFilters['dateRange']) => void;
  readonly setSearchQuery: (query: string | undefined) => void;
  readonly setSortBy: (sortBy: BookingFilters['sortBy']) => void;
  readonly resetFilters: () => void;

  // View state
  readonly viewMode: 'list' | 'grouped';
  readonly setViewMode: (mode: 'list' | 'grouped') => void;

  // Actions
  readonly refetch: () => void;
}

const defaultFilters: BookingFilters = {
  status: 'all',
  dateRange: 'all',
  sortBy: 'date-asc',
};

/**
 * Main hook for the Bookings page
 *
 * @example
 * ```tsx
 * export const Bookings = (): JSX.Element => {
 *   const {
 *     filteredBookings,
 *     stats,
 *     isLoading,
 *     filters,
 *     setStatusFilter,
 *     setSearchQuery,
 *   } = useBookingListPage();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       <BookingStats stats={stats} />
 *       <BookingFilters
 *         filters={filters}
 *         onStatusChange={setStatusFilter}
 *         onSearchChange={setSearchQuery}
 *       />
 *       <BookingList bookings={filteredBookings} />
 *     </div>
 *   );
 * };
 * ```
 */
export function useBookingListPage(): BookingListPageState {
  const { user } = useAuth();

  console.log('📋 useBookingListPage - Current user:', user?.id, 'User object:', user);

  // Filter state
  const [filters, setFilters] = useState<BookingFilters>(defaultFilters);

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');

  // Fetch bookings using React Query
  const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserBookings(user?.id || '', !!user?.id);

  console.log('📊 Bookings query state:', { isLoading, isError, error, bookingsCount: bookings?.length });

  // Apply filters using business logic hook
  const filteredBookings = useBookingFilters(bookings, filters);

  // Calculate statistics
  const stats = useBookingStats(filteredBookings);

  // Group recurring bookings
  const recurringGroups = useRecurringBookingGroups(filteredBookings);
  const standaloneBookings = useStandaloneBookings(filteredBookings);
  const hasRecurringBookings = useHasRecurringBookings(filteredBookings);

  // Filter setters
  const setStatusFilter = useCallback((status: BookingStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const setFacilityFilter = useCallback((facilityId: string | undefined) => {
    setFilters(prev => ({ ...prev, facilityId }));
  }, []);

  const setDateRangeFilter = useCallback((dateRange: BookingFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);

  const setSearchQuery = useCallback((search: string | undefined) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const setSortBy = useCallback((sortBy: BookingFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    // Data
    filteredBookings,
    stats,
    recurringGroups,
    standaloneBookings,
    hasRecurringBookings,

    // Loading states
    isLoading,
    isError,
    error: error as Error | null,

    // Filter state
    filters,
    setStatusFilter,
    setFacilityFilter,
    setDateRangeFilter,
    setSearchQuery,
    setSortBy,
    resetFilters,

    // View state
    viewMode,
    setViewMode,

    // Actions
    refetch,
  };
}
