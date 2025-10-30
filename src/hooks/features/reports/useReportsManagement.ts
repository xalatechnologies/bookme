/**
 * Reports Management Hook
 *
 * Connects UI components to business logic and data services for analytics.
 * Provides a clean interface for report generation and data visualization.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/clients/supabase';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useAppUIStore } from '@/stores/appUIStore';
import {
  generateRevenueReport,
  generateBookingReport,
  generateFacilityUtilizationReport,
  generateUserActivityReport,
  calculateGrowthRate,
  formatReportData,
  exportReportToCSV,
  generateCSVContent,
  formatCurrency,
  formatPercentage,
  formatDateNorwegian,
  type IRevenueReport,
  type IBookingReport,
  type IUtilizationReport,
  type IUserActivityReport,
  type IChartDataPoint,
  type ICSVExportData,
  type ReportType,
  type GroupBy,
  type BookingWithFacility,
} from '@/services/business/report.business.service';
import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Facility = Database['public']['Tables']['facilities']['Row'];

export interface IUseReportsManagementReturn {
  // Data
  readonly bookings: readonly BookingWithFacility[];
  readonly facilities: readonly Facility[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Reports
  readonly revenueReport: IRevenueReport | null;
  readonly bookingReport: IBookingReport | null;
  readonly utilizationReport: IUtilizationReport | null;
  readonly userActivityReport: IUserActivityReport | null;

  // Current report data
  readonly currentReport:
    | IRevenueReport
    | IBookingReport
    | IUtilizationReport
    | IUserActivityReport
    | null;

  // Chart data
  readonly chartData: readonly IChartDataPoint[];

  // UI State
  readonly reportType: ReportType;
  readonly dateRange: {
    readonly startDate: Date | null;
    readonly endDate: Date | null;
  };
  readonly groupBy: GroupBy;
  readonly view: string;
  readonly showFilters: boolean;
  readonly filters: {
    readonly facilityIds: readonly string[];
    readonly statusFilter: readonly string[];
    readonly userIds: readonly string[];
  };

  // UI Actions
  readonly setReportType: (type: ReportType) => void;
  readonly setDateRange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  readonly setGroupBy: (groupBy: GroupBy) => void;
  readonly setView: (view: string) => void;
  readonly toggleFilters: () => void;
  readonly clearFilters: () => void;

  // Quick date range actions
  readonly setToday: () => void;
  readonly setThisWeek: () => void;
  readonly setThisMonth: () => void;
  readonly setThisYear: () => void;
  readonly setLast30Days: () => void;
  readonly setLast90Days: () => void;

  // Export actions
  readonly exportToCSV: () => void;
  readonly exportToPDF: () => void;

  // Formatting utilities
  readonly formatCurrency: (cents: number) => string;
  readonly formatPercentage: (value: number) => string;
  readonly formatDate: (date: Date) => string;
}

/**
 * Fetch bookings with facility details for reports
 */
const fetchReportBookings = async (orgId: string): Promise<BookingWithFacility[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      facility:facilities!inner (
        name,
        capacity,
        facility_type
      )
    `
    )
    .eq('facility.org_id', orgId)
    .order('starts_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings for reports:', error);
    throw error;
  }

  return data as BookingWithFacility[];
};

/**
 * Fetch facilities for utilization reports
 */
const fetchFacilities = async (orgId: string): Promise<Facility[]> => {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('org_id', orgId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }

  return data;
};

/**
 * Hook for managing reports and analytics
 *
 * Provides comprehensive reporting functionality including:
 * - Multiple report types (revenue, bookings, utilization, users)
 * - Date range selection with quick presets
 * - Data grouping (day, week, month, year)
 * - Chart data formatting for visualizations
 * - CSV and PDF export capabilities
 * - Real-time data updates via React Query
 *
 * @returns Complete reports management interface
 *
 * @example
 * ```tsx
 * function ReportsPage() {
 *   const {
 *     revenueReport,
 *     chartData,
 *     reportType,
 *     setReportType,
 *     setThisMonth,
 *     exportToCSV,
 *     formatCurrency,
 *   } = useReportsManagement();
 *
 *   return (
 *     <div>
 *       <ReportTypeSelector value={reportType} onChange={setReportType} />
 *       <DateRangeButtons onThisMonth={setThisMonth} />
 *       <Chart data={chartData} />
 *       {revenueReport && (
 *         <RevenueStats
 *           total={formatCurrency(revenueReport.totalRevenue)}
 *           growth={revenueReport.growthRate}
 *         />
 *       )}
 *       <Button onClick={exportToCSV}>Export CSV</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useReportsManagement = (): IUseReportsManagementReturn => {
  // Data layer - fetch bookings and facilities
  const orgId = useOrganizationId();

  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useQuery({
    queryKey: ['reports', 'bookings', orgId],
    queryFn: () => fetchReportBookings(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: facilities = [],
    isLoading: isLoadingFacilities,
    error: facilitiesError,
  } = useQuery({
    queryKey: ['reports', 'facilities', orgId],
    queryFn: () => fetchFacilities(orgId),
    enabled: !!orgId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const isLoading = isLoadingBookings || isLoadingFacilities;
  const error = bookingsError || facilitiesError;

  // UI state layer - appUIStore reports section
  const appUIStore = useAppUIStore();
  const {
    reportType,
    dateRange,
    groupBy,
    view,
    showFilters,
    filters,
  } = appUIStore.reports;

  // Actions from appUIStore with report prefix
  const setReportType = appUIStore.setReportType;
  const setDateRange = appUIStore.setReportDateRange;
  const setGroupBy = appUIStore.setReportGroupBy;
  const setView = appUIStore.setReportView;
  const toggleFilters = appUIStore.toggleReportFilters;
  const clearFilters = appUIStore.clearReportFilters;
  const setToday = appUIStore.setReportToday;
  const setThisWeek = appUIStore.setReportThisWeek;
  const setThisMonth = appUIStore.setReportThisMonth;
  const setThisYear = appUIStore.setReportThisYear;
  const setLast30Days = appUIStore.setReportLast30Days;
  const setLast90Days = appUIStore.setReportLast90Days;

  // Apply filters to bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Facility filter
    if (filters.facilityIds.length > 0) {
      filtered = filtered.filter((b) => filters.facilityIds.includes(b.facility_id));
    }

    // Status filter
    if (filters.statusFilter.length > 0) {
      filtered = filtered.filter((b) => filters.statusFilter.includes(b.status));
    }

    // User filter
    if (filters.userIds.length > 0) {
      filtered = filtered.filter((b) => filters.userIds.includes(b.user_id));
    }

    return filtered;
  }, [bookings, filters]);

  // Generate reports based on current configuration
  const revenueReport = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;

    return generateRevenueReport(
      filteredBookings,
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      groupBy
    );
  }, [filteredBookings, dateRange, groupBy]);

  const bookingReport = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;

    return generateBookingReport(
      filteredBookings,
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      groupBy
    );
  }, [filteredBookings, dateRange, groupBy]);

  const utilizationReport = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;

    return generateFacilityUtilizationReport(
      filteredBookings,
      facilities,
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }
    );
  }, [filteredBookings, facilities, dateRange]);

  const userActivityReport = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return null;

    return generateUserActivityReport(
      filteredBookings,
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }
    );
  }, [filteredBookings, dateRange]);

  // Get current report based on report type
  const currentReport = useMemo(() => {
    switch (reportType) {
      case 'revenue':
        return revenueReport;
      case 'bookings':
        return bookingReport;
      case 'utilization':
        return utilizationReport;
      case 'users':
        return userActivityReport;
      default:
        return null;
    }
  }, [reportType, revenueReport, bookingReport, utilizationReport, userActivityReport]);

  // Format chart data based on report type
  const chartData = useMemo(() => {
    if (!currentReport) return [];

    switch (reportType) {
      case 'revenue':
        if (!revenueReport) return [];
        return formatReportData(
          revenueReport.dataPoints,
          'revenue',
          (value) => formatCurrency(value)
        );

      case 'bookings':
        if (!bookingReport) return [];
        return formatReportData(bookingReport.dataPoints, 'total');

      case 'utilization':
        if (!utilizationReport) return [];
        return formatReportData(
          utilizationReport.dataPoints,
          'utilizationRate',
          (value) => formatPercentage(value)
        );

      case 'users':
        if (!userActivityReport) return [];
        return formatReportData(userActivityReport.dataPoints, 'bookingCount');

      default:
        return [];
    }
  }, [reportType, currentReport, revenueReport, bookingReport, utilizationReport, userActivityReport]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!currentReport) {
      console.warn('No report data to export');
      return;
    }

    let csvData: ICSVExportData;

    switch (reportType) {
      case 'revenue':
        if (!revenueReport) return;
        csvData = exportReportToCSV(
          ['Period', 'Revenue', 'Bookings', 'Average Value'],
          revenueReport.dataPoints.map((dp) => [
            dp.period,
            formatCurrency(dp.revenue),
            dp.bookingCount,
            formatCurrency(dp.averageValue),
          ]),
          'revenue-report'
        );
        break;

      case 'bookings':
        if (!bookingReport) return;
        csvData = exportReportToCSV(
          ['Period', 'Total', 'Pending', 'Confirmed', 'Cancelled', 'Completed', 'Conversion Rate'],
          bookingReport.dataPoints.map((dp) => [
            dp.period,
            dp.total,
            dp.pending,
            dp.confirmed,
            dp.cancelled,
            dp.completed,
            formatPercentage(dp.conversionRate),
          ]),
          'booking-report'
        );
        break;

      case 'utilization':
        if (!utilizationReport) return;
        csvData = exportReportToCSV(
          ['Facility', 'Utilization Rate', 'Booked Hours', 'Total Hours', 'Bookings', 'Revenue'],
          utilizationReport.dataPoints.map((dp) => [
            dp.facilityName,
            formatPercentage(dp.utilizationRate),
            dp.bookedHours.toFixed(1),
            dp.totalHours.toFixed(1),
            dp.bookingCount,
            formatCurrency(dp.revenue),
          ]),
          'utilization-report'
        );
        break;

      case 'users':
        if (!userActivityReport) return;
        csvData = exportReportToCSV(
          ['User ID', 'User Name', 'Bookings', 'Total Spent', 'Last Booking', 'Status'],
          userActivityReport.dataPoints.map((dp) => [
            dp.userId,
            dp.userName,
            dp.bookingCount,
            formatCurrency(dp.totalSpent),
            dp.lastBooking,
            dp.isActive ? 'Active' : 'Inactive',
          ]),
          'user-activity-report'
        );
        break;

      default:
        return;
    }

    // Generate CSV content and trigger download
    const csvContent = generateCSVContent(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = csvData.filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [reportType, currentReport, revenueReport, bookingReport, utilizationReport, userActivityReport]);

  // Export to PDF (placeholder - would need PDF library)
  const exportToPDF = useCallback(() => {
    if (!currentReport) {
      console.warn('No report data to export');
      return;
    }

    // This is a placeholder - in production, you'd use a library like jsPDF or react-pdf
    console.log('PDF export would be implemented here');
    alert('PDF export functionality would be implemented with a PDF generation library');
  }, [currentReport]);

  // Formatting utilities with Norwegian locale
  const formatCurrencyNOK = useCallback((cents: number): string => {
    return formatCurrency(cents, 'NOK');
  }, []);

  const formatPercentageValue = useCallback((value: number): string => {
    return formatPercentage(value);
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return formatDateNorwegian(date);
  }, []);

  return {
    // Data
    bookings: filteredBookings,
    facilities,
    isLoading,
    error,

    // Reports
    revenueReport,
    bookingReport,
    utilizationReport,
    userActivityReport,

    // Current report data
    currentReport,

    // Chart data
    chartData,

    // UI State
    reportType,
    dateRange,
    groupBy,
    view,
    showFilters,
    filters,

    // UI Actions
    setReportType,
    setDateRange,
    setGroupBy,
    setView,
    toggleFilters,
    clearFilters,

    // Quick date range actions
    setToday,
    setThisWeek,
    setThisMonth,
    setThisYear,
    setLast30Days,
    setLast90Days,

    // Export actions
    exportToCSV,
    exportToPDF,

    // Formatting utilities
    formatCurrency: formatCurrencyNOK,
    formatPercentage: formatPercentageValue,
    formatDate,
  };
};
