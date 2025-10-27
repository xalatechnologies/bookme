"use client";

import { useMemo } from "react";
import type { IDashboardData } from "./useDashboardData";

export interface IStatistics {
  readonly totalBookings: number;
  readonly totalRevenue: number;
  readonly averageBookingValue: number;
  readonly growth: number;
  readonly occupancyRate: number;
  readonly activeUsersGrowth: number;
  readonly conversionRate: number;
}

export interface IStatCalculationOptions {
  readonly includeRevenue?: boolean;
  readonly previousPeriodData?: IDashboardData | null;
}

/**
 * Custom hook for calculating statistics from dashboard data
 *
 * This hook applies SOLID principles:
 * - Single Responsibility: Only handles statistical calculations
 * - Open/Closed: Can be extended with new calculation methods without modification
 * - Dependency Inversion: Depends on IDashboardData interface, not concrete implementations
 *
 * @param data - Dashboard data to calculate statistics from
 * @param options - Optional configuration for calculations
 * @returns Calculated statistics object
 */
export const useStatistics = (
  data: IDashboardData | null,
  options: IStatCalculationOptions = {}
): IStatistics => {
  const { includeRevenue = false, previousPeriodData = null } = options;

  const stats = useMemo(() => {
    if (!data) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        growth: 0,
        occupancyRate: 0,
        activeUsersGrowth: 0,
        conversionRate: 0
      };
    }

    // Calculate total bookings
    const totalBookings = data.totalBookings;

    // Calculate revenue (mock calculation - in real app, would come from payment data)
    const totalRevenue = includeRevenue ? totalBookings * 500 : 0; // 500 kr average per booking
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate growth percentage
    let growth = 0;
    if (previousPeriodData && previousPeriodData.totalBookings > 0) {
      growth = ((totalBookings - previousPeriodData.totalBookings) / previousPeriodData.totalBookings) * 100;
    } else {
      // Default growth calculation if no previous period data
      growth = data.todayBookings > 0 ? 10 : 0; // Mock 10% growth
    }

    // Calculate occupancy rate
    const totalCapacity = data.facilities * 10; // Assume 10 slots per facility per day
    const occupancyRate = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;

    // Calculate active users growth
    let activeUsersGrowth = 0;
    if (previousPeriodData && previousPeriodData.activeUsers > 0) {
      activeUsersGrowth = ((data.activeUsers - previousPeriodData.activeUsers) / previousPeriodData.activeUsers) * 100;
    } else {
      activeUsersGrowth = data.activeUsers > 0 ? 15 : 0; // Mock 15% growth
    }

    // Calculate conversion rate (bookings / unique users)
    const conversionRate = data.activeUsers > 0 ? (totalBookings / data.activeUsers) * 100 : 0;

    return {
      totalBookings,
      totalRevenue,
      averageBookingValue,
      growth: Math.round(growth),
      occupancyRate: Math.round(occupancyRate),
      activeUsersGrowth: Math.round(activeUsersGrowth),
      conversionRate: Math.round(conversionRate)
    };
  }, [data, previousPeriodData, includeRevenue]);

  return stats;
};

/**
 * Calculate trend direction based on percentage change
 *
 * @param percentage - The percentage change value
 * @returns Trend direction ('up' | 'down' | 'neutral')
 */
export const calculateTrendDirection = (percentage: number): 'up' | 'down' | 'neutral' => {
  if (percentage > 5) return 'up';
  if (percentage < -5) return 'down';
  return 'neutral';
};

/**
 * Format number with locale-specific formatting
 *
 * @param value - Number to format
 * @param locale - Locale string (default: 'nb-NO')
 * @returns Formatted number string
 */
export const formatNumber = (value: number, locale: string = 'nb-NO'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Format currency with locale-specific formatting
 *
 * @param value - Amount to format
 * @param locale - Locale string (default: 'nb-NO')
 * @param currency - Currency code (default: 'NOK')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  locale: string = 'nb-NO',
  currency: string = 'NOK'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
};
