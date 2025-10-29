/**
 * Report UI State Management Store
 *
 * Manages UI-specific state for reports and analytics pages.
 * Separated from business logic and data fetching.
 * Follows clean architecture principles - UI concerns only.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { ReportType, GroupBy } from '@/services/business/report.business.service';

export type TReportView = 'charts' | 'table' | 'cards';

interface IDateRange {
  readonly startDate: Date | null;
  readonly endDate: Date | null;
}

interface IReportFilters {
  readonly facilityIds: readonly string[];
  readonly statusFilter: readonly string[];
  readonly userIds: readonly string[];
}

interface IReportUIState {
  // Report configuration
  readonly reportType: ReportType;
  readonly dateRange: IDateRange;
  readonly groupBy: GroupBy;
  readonly view: TReportView;

  // Filters
  readonly filters: IReportFilters;
  readonly showFilters: boolean;

  // Display options
  readonly showComparison: boolean;
  readonly comparisonPeriod: 'previous' | 'year_ago' | null;

  // Export state
  readonly isExporting: boolean;
  readonly exportFormat: 'csv' | 'pdf' | null;

  // Modal state
  readonly isDatePickerOpen: boolean;
  readonly isFilterModalOpen: boolean;
  readonly isExportModalOpen: boolean;

  // Report configuration actions
  readonly setReportType: (type: ReportType) => void;
  readonly setDateRange: (range: IDateRange) => void;
  readonly setGroupBy: (groupBy: GroupBy) => void;
  readonly setView: (view: TReportView) => void;

  // Quick date range setters
  readonly setToday: () => void;
  readonly setThisWeek: () => void;
  readonly setThisMonth: () => void;
  readonly setThisYear: () => void;
  readonly setLast30Days: () => void;
  readonly setLast90Days: () => void;
  readonly setCustomRange: (startDate: Date, endDate: Date) => void;

  // Filter actions
  readonly setFilters: (filters: IReportFilters) => void;
  readonly toggleFacilityFilter: (facilityId: string) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly toggleUserFilter: (userId: string) => void;
  readonly clearFilters: () => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  // Display options actions
  readonly setShowComparison: (show: boolean) => void;
  readonly setComparisonPeriod: (period: 'previous' | 'year_ago' | null) => void;

  // Export actions
  readonly setIsExporting: (isExporting: boolean) => void;
  readonly setExportFormat: (format: 'csv' | 'pdf' | null) => void;
  readonly startExport: (format: 'csv' | 'pdf') => void;
  readonly finishExport: () => void;

  // Modal actions
  readonly openDatePicker: () => void;
  readonly closeDatePicker: () => void;
  readonly openFilterModal: () => void;
  readonly closeFilterModal: () => void;
  readonly openExportModal: () => void;
  readonly closeExportModal: () => void;
  readonly closeAllModals: () => void;

  // Reset actions
  readonly resetToDefaults: () => void;
}

/**
 * Get date range for "today"
 */
const getTodayRange = (): IDateRange => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startDate: today,
    endDate: endOfDay,
  };
};

/**
 * Get date range for "this week"
 */
const getThisWeekRange = (): IDateRange => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    startDate: startOfWeek,
    endDate: endOfWeek,
  };
};

/**
 * Get date range for "this month"
 */
const getThisMonthRange = (): IDateRange => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return {
    startDate: startOfMonth,
    endDate: endOfMonth,
  };
};

/**
 * Get date range for "this year"
 */
const getThisYearRange = (): IDateRange => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const endOfYear = new Date(today.getFullYear(), 11, 31);
  endOfYear.setHours(23, 59, 59, 999);

  return {
    startDate: startOfYear,
    endDate: endOfYear,
  };
};

/**
 * Get date range for "last N days"
 */
const getLastNDaysRange = (days: number): IDateRange => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return {
    startDate,
    endDate: today,
  };
};

const initialState = {
  reportType: 'revenue' as ReportType,
  dateRange: getThisMonthRange(),
  groupBy: 'day' as GroupBy,
  view: 'charts' as TReportView,
  filters: {
    facilityIds: [] as readonly string[],
    statusFilter: [] as readonly string[],
    userIds: [] as readonly string[],
  },
  showFilters: false,
  showComparison: false,
  comparisonPeriod: null as 'previous' | 'year_ago' | null,
  isExporting: false,
  exportFormat: null as 'csv' | 'pdf' | null,
  isDatePickerOpen: false,
  isFilterModalOpen: false,
  isExportModalOpen: false,
};

export const useReportUIStore = create<IReportUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Report configuration actions
        setReportType: (reportType) => set({ reportType }),
        setDateRange: (dateRange) => set({ dateRange }),
        setGroupBy: (groupBy) => set({ groupBy }),
        setView: (view) => set({ view }),

        // Quick date range setters
        setToday: () => set({ dateRange: getTodayRange() }),
        setThisWeek: () => set({ dateRange: getThisWeekRange() }),
        setThisMonth: () => set({ dateRange: getThisMonthRange() }),
        setThisYear: () => set({ dateRange: getThisYearRange() }),
        setLast30Days: () => set({ dateRange: getLastNDaysRange(30) }),
        setLast90Days: () => set({ dateRange: getLastNDaysRange(90) }),
        setCustomRange: (startDate, endDate) =>
          set({ dateRange: { startDate, endDate } }),

        // Filter actions
        setFilters: (filters) => set({ filters }),

        toggleFacilityFilter: (facilityId) =>
          set((state) => ({
            filters: {
              ...state.filters,
              facilityIds: state.filters.facilityIds.includes(facilityId)
                ? state.filters.facilityIds.filter((id) => id !== facilityId)
                : [...state.filters.facilityIds, facilityId],
            },
          })),

        toggleStatusFilter: (status) =>
          set((state) => ({
            filters: {
              ...state.filters,
              statusFilter: state.filters.statusFilter.includes(status)
                ? state.filters.statusFilter.filter((s) => s !== status)
                : [...state.filters.statusFilter, status],
            },
          })),

        toggleUserFilter: (userId) =>
          set((state) => ({
            filters: {
              ...state.filters,
              userIds: state.filters.userIds.includes(userId)
                ? state.filters.userIds.filter((id) => id !== userId)
                : [...state.filters.userIds, userId],
            },
          })),

        clearFilters: () =>
          set({
            filters: {
              facilityIds: [],
              statusFilter: [],
              userIds: [],
            },
          }),

        setShowFilters: (showFilters) => set({ showFilters }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

        // Display options actions
        setShowComparison: (showComparison) => set({ showComparison }),
        setComparisonPeriod: (comparisonPeriod) => set({ comparisonPeriod }),

        // Export actions
        setIsExporting: (isExporting) => set({ isExporting }),
        setExportFormat: (exportFormat) => set({ exportFormat }),

        startExport: (format) =>
          set({
            isExporting: true,
            exportFormat: format,
            isExportModalOpen: false,
          }),

        finishExport: () =>
          set({
            isExporting: false,
            exportFormat: null,
          }),

        // Modal actions
        openDatePicker: () => set({ isDatePickerOpen: true }),
        closeDatePicker: () => set({ isDatePickerOpen: false }),

        openFilterModal: () => set({ isFilterModalOpen: true }),
        closeFilterModal: () => set({ isFilterModalOpen: false }),

        openExportModal: () => set({ isExportModalOpen: true }),
        closeExportModal: () => set({ isExportModalOpen: false }),

        closeAllModals: () =>
          set({
            isDatePickerOpen: false,
            isFilterModalOpen: false,
            isExportModalOpen: false,
          }),

        // Reset actions
        resetToDefaults: () => set(initialState),
      }),
      {
        name: 'report-ui-store',
        version: 1,
        partialize: (state) => ({
          reportType: state.reportType,
          groupBy: state.groupBy,
          view: state.view,
          showComparison: state.showComparison,
          comparisonPeriod: state.comparisonPeriod,
        }),
      }
    ),
    { name: 'ReportUIStore' }
  )
);
