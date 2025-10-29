"use client";

import { useState, useEffect, useCallback } from "react";
import { useFacilities } from "@/services/supabase/facilities.service";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useRecurringBookingStore } from "@/stores/recurringBookingStore";

export interface IDashboardData {
  readonly facilities: number;
  readonly publishedFacilities: number;
  readonly todayBookings: number;
  readonly pendingApprovals: number;
  readonly activeUsers: number;
  readonly totalBookings: number;
  readonly cancelledBookings: number;
  readonly draftFacilities: number;
}

interface IUseDashboardDataReturn {
  readonly data: IDashboardData | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
}

/**
 * Custom hook for fetching and managing dashboard data
 *
 * This hook centralizes dashboard data logic following SOLID principles:
 * - Single Responsibility: Only handles dashboard data fetching and state
 * - Interface Segregation: Returns only necessary data and methods
 * - Dependency Inversion: Depends on store abstractions, not implementations
 *
 * @param role - The user role ('admin' | 'user')
 * @returns Dashboard data, loading state, error state, and refetch function
 */
export const useDashboardData = (role: 'admin' | 'user'): IUseDashboardDataReturn => {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get organization context and fetch facilities from Supabase
  const orgId = useOrganizationId();
  const { data: facilities = [], isLoading: facilitiesLoading } = useFacilities(orgId);
  const { bookings } = useRecurringBookingStore();

  const fetchDashboardData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      // Calculate dashboard metrics
      const totalFacilities = facilities.length;
      const publishedFacilities = facilities.filter(f => f.status === "published").length;
      const draftFacilities = facilities.filter(f => f.status === "draft").length;

      // Today's bookings
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(booking =>
        booking.createdAt.includes(today)
      ).length;

      // Pending approvals (count pending occurrences)
      const pendingApprovals = bookings.reduce((count, booking) => {
        const pendingOccurrences = booking.occurrences.filter(occurrence =>
          occurrence.status === "pending"
        ).length;
        return count + pendingOccurrences;
      }, 0);

      // Active users (unique user IDs)
      const activeUsers = new Set(bookings.map(b => b.userId)).size;

      // Total bookings
      const totalBookings = bookings.length;

      // Cancelled bookings
      const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;

      const dashboardData: IDashboardData = {
        facilities: totalFacilities,
        publishedFacilities,
        todayBookings,
        pendingApprovals,
        activeUsers,
        totalBookings,
        cancelledBookings,
        draftFacilities
      };

      setData(dashboardData);
      setLoading(facilitiesLoading);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      setLoading(false);
    }
  }, [facilities, bookings, facilitiesLoading]);

  useEffect(() => {
    // Only fetch dashboard data when facilities are loaded
    if (!facilitiesLoading) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, facilitiesLoading]);

  return {
    data,
    loading: loading || facilitiesLoading,
    error,
    refetch: fetchDashboardData
  };
};
