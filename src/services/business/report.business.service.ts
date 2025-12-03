/**
 * Report Business Logic Service
 *
 * Contains all business logic related to reporting and analytics operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations for analytics.
 */

import type { Database } from "@/types/database";

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingStatus = Database['public']['Enums']['booking_status'];
type Facility = Database['public']['Tables']['facilities']['Row'];

/**
 * Report type enumeration
 */
export type ReportType =
  | 'revenue'
  | 'bookings'
  | 'utilization'
  | 'users';

/**
 * Time grouping for reports
 */
export type GroupBy = 'day' | 'week' | 'month' | 'year';

/**
 * Date range for report filtering
 */
export interface IDateRange {
  readonly startDate: Date;
  readonly endDate: Date;
}

/**
 * Revenue report data point
 */
export interface IRevenueDataPoint {
  readonly period: string;
  readonly revenue: number;
  readonly bookingCount: number;
  readonly averageValue: number;
  readonly currency: string;
}

/**
 * Revenue report result
 */
export interface IRevenueReport {
  readonly dataPoints: readonly IRevenueDataPoint[];
  readonly totalRevenue: number;
  readonly totalBookings: number;
  readonly averageBookingValue: number;
  readonly growthRate: number;
  readonly currency: string;
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

/**
 * Booking statistics data point
 */
export interface IBookingDataPoint {
  readonly period: string;
  readonly total: number;
  readonly pending: number;
  readonly confirmed: number;
  readonly cancelled: number;
  readonly completed: number;
  readonly conversionRate: number;
}

/**
 * Booking report result
 */
export interface IBookingReport {
  readonly dataPoints: readonly IBookingDataPoint[];
  readonly totalBookings: number;
  readonly statusBreakdown: {
    readonly pending: number;
    readonly confirmed: number;
    readonly cancelled: number;
    readonly completed: number;
  };
  readonly averageConversionRate: number;
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

/**
 * Facility utilization data point
 */
export interface IUtilizationDataPoint {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly totalHours: number;
  readonly bookedHours: number;
  readonly utilizationRate: number;
  readonly bookingCount: number;
  readonly revenue: number;
}

/**
 * Utilization report result
 */
export interface IUtilizationReport {
  readonly dataPoints: readonly IUtilizationDataPoint[];
  readonly overallUtilization: number;
  readonly topFacilities: readonly IUtilizationDataPoint[];
  readonly underutilizedFacilities: readonly IUtilizationDataPoint[];
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

/**
 * User activity data point
 */
export interface IUserActivityDataPoint {
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly bookingCount: number;
  readonly totalSpent: number;
  readonly lastBooking: string;
  readonly isActive: boolean;
}

/**
 * User activity report result
 */
export interface IUserActivityReport {
  readonly dataPoints: readonly IUserActivityDataPoint[];
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly newUsers: number;
  readonly averageBookingsPerUser: number;
  readonly averageSpendPerUser: number;
  readonly periodStart: Date;
  readonly periodEnd: Date;
}

/**
 * Growth calculation result
 */
export interface IGrowthRate {
  readonly currentValue: number;
  readonly previousValue: number;
  readonly growthRate: number;
  readonly growthAmount: number;
  readonly isPositive: boolean;
}

/**
 * Chart data point for visualization
 */
export interface IChartDataPoint {
  readonly label: string;
  readonly value: number;
  readonly formattedValue: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * CSV export data structure
 */
export interface ICSVExportData {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly filename: string;
}

/**
 * Booking with facility for reporting
 */
export interface BookingWithFacility extends Booking {
  readonly facility?: Pick<Facility, 'name' | 'capacity' | 'facility_type'>;
}

/**
 * Generate revenue report for a given period
 *
 * @param bookings - Array of bookings to analyze
 * @param dateRange - Date range for the report
 * @param groupBy - Time grouping (day, week, month, year)
 * @returns Revenue report with data points and totals
 */
export const generateRevenueReport = (
  bookings: readonly BookingWithFacility[],
  dateRange: IDateRange,
  groupBy: GroupBy = 'day'
): IRevenueReport => {
  // Filter bookings within date range and only paid/completed
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.starts_at);
    const isPaid = ['paid', 'completed'].includes(booking.status);
    return (
      bookingDate >= dateRange.startDate &&
      bookingDate <= dateRange.endDate &&
      isPaid
    );
  });

  // Group bookings by period
  const groupedData = new Map<string, BookingWithFacility[]>();

  filteredBookings.forEach((booking) => {
    const period = formatPeriod(new Date(booking.starts_at), groupBy);
    const existing = groupedData.get(period) || [];
    groupedData.set(period, [...existing, booking]);
  });

  // Create data points
  const dataPoints: IRevenueDataPoint[] = [];
  let totalRevenue = 0;
  let totalBookings = 0;

  groupedData.forEach((periodBookings, period) => {
    const revenue = periodBookings.reduce((sum, b) => sum + b.total_cents, 0);
    const count = periodBookings.length;
    const averageValue = count > 0 ? revenue / count : 0;
    const currency = periodBookings[0]?.currency || 'NOK';

    dataPoints.push({
      period,
      revenue,
      bookingCount: count,
      averageValue,
      currency});

    totalRevenue += revenue;
    totalBookings += count;
  });

  // Sort data points by period
  dataPoints.sort((a, b) => a.period.localeCompare(b.period));

  // Calculate average booking value
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Calculate growth rate (compare first half to second half)
  const growthRate = calculatePeriodGrowthRate(dataPoints);

  return {
    dataPoints,
    totalRevenue,
    totalBookings,
    averageBookingValue,
    growthRate,
    currency: filteredBookings[0]?.currency || 'NOK',
    periodStart: dateRange.startDate,
    periodEnd: dateRange.endDate};
};

/**
 * Generate booking statistics report
 *
 * @param bookings - Array of bookings to analyze
 * @param dateRange - Date range for the report
 * @param groupBy - Time grouping (day, week, month, year)
 * @returns Booking statistics report with status breakdown
 */
export const generateBookingReport = (
  bookings: readonly BookingWithFacility[],
  dateRange: IDateRange,
  groupBy: GroupBy = 'day'
): IBookingReport => {
  // Filter bookings within date range
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.starts_at);
    return bookingDate >= dateRange.startDate && bookingDate <= dateRange.endDate;
  });

  // Group bookings by period
  const groupedData = new Map<string, BookingWithFacility[]>();

  filteredBookings.forEach((booking) => {
    const period = formatPeriod(new Date(booking.starts_at), groupBy);
    const existing = groupedData.get(period) || [];
    groupedData.set(period, [...existing, booking]);
  });

  // Create data points
  const dataPoints: IBookingDataPoint[] = [];
  let totalPending = 0;
  let totalConfirmed = 0;
  let totalCancelled = 0;
  let totalCompleted = 0;

  groupedData.forEach((periodBookings, period) => {
    const total = periodBookings.length;
    const pending = periodBookings.filter((b) => b.status === 'pending').length;
    const confirmed = periodBookings.filter((b) =>
      ['awaiting_payment', 'paid'].includes(b.status)
    ).length;
    const cancelled = periodBookings.filter((b) => b.status === 'cancelled').length;
    const completed = periodBookings.filter((b) => b.status === 'completed').length;

    // Conversion rate: (completed + paid) / total
    const converted = completed + periodBookings.filter((b) => b.status === 'paid').length;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    dataPoints.push({
      period,
      total,
      pending,
      confirmed,
      cancelled,
      completed,
      conversionRate});

    totalPending += pending;
    totalConfirmed += confirmed;
    totalCancelled += cancelled;
    totalCompleted += completed;
  });

  // Sort data points by period
  dataPoints.sort((a, b) => a.period.localeCompare(b.period));

  // Calculate average conversion rate
  const averageConversionRate = dataPoints.length > 0
    ? dataPoints.reduce((sum, dp) => sum + dp.conversionRate, 0) / dataPoints.length
    : 0;

  return {
    dataPoints,
    totalBookings: filteredBookings.length,
    statusBreakdown: {
      pending: totalPending,
      confirmed: totalConfirmed,
      cancelled: totalCancelled,
      completed: totalCompleted},
    averageConversionRate,
    periodStart: dateRange.startDate,
    periodEnd: dateRange.endDate};
};

/**
 * Generate facility utilization report
 *
 * @param bookings - Array of bookings to analyze
 * @param facilities - Array of facilities
 * @param dateRange - Date range for the report
 * @returns Utilization report with facility-level data
 */
export const generateFacilityUtilizationReport = (
  bookings: readonly BookingWithFacility[],
  facilities: readonly Facility[],
  dateRange: IDateRange
): IUtilizationReport => {
  // Filter bookings within date range and not cancelled
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.starts_at);
    return (
      bookingDate >= dateRange.startDate &&
      bookingDate <= dateRange.endDate &&
      !['cancelled', 'expired', 'refunded'].includes(booking.status)
    );
  });

  // Calculate total hours in period (per facility)
  const periodDays = Math.ceil(
    (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const hoursPerDay = 24; // Assuming facilities available 24/7, adjust as needed

  // Group bookings by facility
  const facilityBookings = new Map<string, BookingWithFacility[]>();
  filteredBookings.forEach((booking) => {
    const facilityId = booking.facility_id;
    const existing = facilityBookings.get(facilityId) || [];
    facilityBookings.set(facilityId, [...existing, booking]);
  });

  // Create data points for each facility
  const dataPoints: IUtilizationDataPoint[] = facilities.map((facility) => {
    const bookingsForFacility = facilityBookings.get(facility.id) || [];

    // Calculate booked hours
    const bookedHours = bookingsForFacility.reduce((sum, booking) => {
      const start = new Date(booking.starts_at);
      const end = new Date(booking.ends_at);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const totalHours = periodDays * hoursPerDay;
    const utilizationRate = totalHours > 0 ? (bookedHours / totalHours) * 100 : 0;

    // Calculate revenue
    const revenue = bookingsForFacility
      .filter((b) => ['paid', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + b.total_cents, 0);

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      totalHours,
      bookedHours,
      utilizationRate,
      bookingCount: bookingsForFacility.length,
      revenue};
  });

  // Sort by utilization rate
  const sortedDataPoints = [...dataPoints].sort(
    (a, b) => b.utilizationRate - a.utilizationRate
  );

  // Calculate overall utilization
  const totalBookedHours = dataPoints.reduce((sum, dp) => sum + dp.bookedHours, 0);
  const totalAvailableHours = dataPoints.reduce((sum, dp) => sum + dp.totalHours, 0);
  const overallUtilization = totalAvailableHours > 0
    ? (totalBookedHours / totalAvailableHours) * 100
    : 0;

  // Top 5 facilities
  const topFacilities = sortedDataPoints.slice(0, 5);

  // Underutilized facilities (< 30% utilization)
  const underutilizedFacilities = sortedDataPoints.filter(
    (dp) => dp.utilizationRate < 30
  );

  return {
    dataPoints: sortedDataPoints,
    overallUtilization,
    topFacilities,
    underutilizedFacilities,
    periodStart: dateRange.startDate,
    periodEnd: dateRange.endDate};
};

/**
 * Generate user activity report
 *
 * @param bookings - Array of bookings to analyze
 * @param dateRange - Date range for the report
 * @returns User activity report with engagement metrics
 */
export const generateUserActivityReport = (
  bookings: readonly BookingWithFacility[],
  dateRange: IDateRange
): IUserActivityReport => {
  // Filter bookings within date range
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.starts_at);
    return bookingDate >= dateRange.startDate && bookingDate <= dateRange.endDate;
  });

  // Group bookings by user
  const userBookings = new Map<string, BookingWithFacility[]>();
  filteredBookings.forEach((booking) => {
    const userId = booking.user_id;
    const existing = userBookings.get(userId) || [];
    userBookings.set(userId, [...existing, booking]);
  });

  // Create data points for each user
  const dataPoints: IUserActivityDataPoint[] = [];
  userBookings.forEach((bookingsForUser, userId) => {
    const bookingCount = bookingsForUser.length;

    // Calculate total spent (only paid/completed)
    const totalSpent = bookingsForUser
      .filter((b) => ['paid', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + b.total_cents, 0);

    // Find last booking
    const sortedBookings = [...bookingsForUser].sort(
      (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );
    const lastBooking = sortedBookings[0]?.starts_at || '';

    // Determine if user is active (booked in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isActive = lastBooking ? new Date(lastBooking) >= thirtyDaysAgo : false;

    dataPoints.push({
      userId,
      userName: `User ${userId.slice(0, 8)}`, // Placeholder, should be fetched from user data
      userEmail: '', // Placeholder, should be fetched from user data
      bookingCount,
      totalSpent,
      lastBooking,
      isActive});
  });

  // Sort by booking count
  dataPoints.sort((a, b) => b.bookingCount - a.bookingCount);

  // Calculate metrics
  const totalUsers = dataPoints.length;
  const activeUsers = dataPoints.filter((dp) => dp.isActive).length;

  // New users (users who made their first booking in this period)
  const newUsers = dataPoints.filter((dp) => {
    // This is simplified - in reality, you'd check if first ever booking is in period
    return dp.bookingCount > 0;
  }).length;

  const averageBookingsPerUser = totalUsers > 0
    ? filteredBookings.length / totalUsers
    : 0;

  const totalSpent = dataPoints.reduce((sum, dp) => sum + dp.totalSpent, 0);
  const averageSpendPerUser = totalUsers > 0 ? totalSpent / totalUsers : 0;

  return {
    dataPoints,
    totalUsers,
    activeUsers,
    newUsers,
    averageBookingsPerUser,
    averageSpendPerUser,
    periodStart: dateRange.startDate,
    periodEnd: dateRange.endDate};
};

/**
 * Calculate growth rate between two time periods
 *
 * @param currentValue - Current period value
 * @param previousValue - Previous period value
 * @returns Growth rate calculation
 */
export const calculateGrowthRate = (
  currentValue: number,
  previousValue: number
): IGrowthRate => {
  const growthAmount = currentValue - previousValue;

  // Handle division by zero
  const growthRate = previousValue !== 0
    ? (growthAmount / previousValue) * 100
    : currentValue > 0 ? 100 : 0;

  return {
    currentValue,
    previousValue,
    growthRate,
    growthAmount,
    isPositive: growthAmount >= 0};
};

/**
 * Format report data for chart visualization
 *
 * @param dataPoints - Array of data points with period and value
 * @param valueKey - Key to extract value from data points
 * @param formatValue - Optional formatter function
 * @returns Formatted chart data
 */
export const formatReportData = (
  dataPoints: readonly Record<string, unknown>[],
  valueKey: string,
  formatValue?: (value: number) => string
): readonly IChartDataPoint[] => {
  return dataPoints.map((dataPoint) => {
    const value = Number(dataPoint[valueKey] || 0);
    const label = String(dataPoint.period || dataPoint.label || '');

    const formattedValue = formatValue
      ? formatValue(value)
      : value.toLocaleString('nb-NO');

    return {
      label,
      value,
      formattedValue,
      metadata: dataPoint};
  });
};

/**
 * Export report data to CSV format
 *
 * @param headers - Column headers
 * @param rows - Data rows
 * @param filename - Output filename
 * @returns CSV export data structure
 */
export const exportReportToCSV = (
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
  filename: string
): ICSVExportData => {
  // Convert rows to strings
  const stringRows = rows.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) return '';
      if (typeof cell === 'object') return JSON.stringify(cell);
      return String(cell);
    })
  );

  return {
    headers,
    rows: stringRows,
    filename: `${filename}-${formatDateForFilename(new Date())}.csv`};
};

/**
 * Generate CSV content from export data
 *
 * @param exportData - CSV export data structure
 * @returns CSV content as string
 */
export const generateCSVContent = (exportData: ICSVExportData): string => {
  const csvLines: string[] = [];

  // Add headers
  csvLines.push(exportData.headers.map((h) => `"${h}"`).join(','));

  // Add rows
  exportData.rows.forEach((row) => {
    csvLines.push(row.map((cell) => `"${cell}"`).join(','));
  });

  return csvLines.join('\n');
};

/**
 * Format currency value for display
 *
 * @param cents - Amount in cents
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (cents: number, currency: string = 'NOK'): string => {
  const amount = cents / 100;
  return `${amount.toLocaleString('nb-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2})} ${currency}`;
};

/**
 * Format percentage value for display
 *
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date for Norwegian locale
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateNorwegian = (date: Date): string => {
  return date.toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'});
};

/**
 * Format period based on grouping
 *
 * @param date - Date to format
 * @param groupBy - Grouping type
 * @returns Formatted period string
 */
export const formatPeriod = (date: Date, groupBy: GroupBy): string => {
  switch (groupBy) {
    case 'day':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'week':
      return `${date.getFullYear()}-W${getWeekNumber(date)}`;
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case 'year':
      return String(date.getFullYear());
  }
};

/**
 * Get ISO week number
 *
 * @param date - Date to get week number for
 * @returns Week number
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Format date for filename (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns Formatted date string for filename
 */
const formatDateForFilename = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Calculate growth rate from data points (first half vs second half)
 *
 * @param dataPoints - Array of data points with revenue
 * @returns Growth rate percentage
 */
const calculatePeriodGrowthRate = (
  dataPoints: readonly IRevenueDataPoint[]
): number => {
  if (dataPoints.length < 2) return 0;

  const midpoint = Math.floor(dataPoints.length / 2);
  const firstHalf = dataPoints.slice(0, midpoint);
  const secondHalf = dataPoints.slice(midpoint);

  const firstHalfRevenue = firstHalf.reduce((sum, dp) => sum + dp.revenue, 0);
  const secondHalfRevenue = secondHalf.reduce((sum, dp) => sum + dp.revenue, 0);

  if (firstHalfRevenue === 0) return secondHalfRevenue > 0 ? 100 : 0;

  return ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;
};
