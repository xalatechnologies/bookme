/**
 * Audit UI State Management Store
 *
 * Manages UI-specific state for audit log pages.
 * Separated from business logic and data fetching.
 * Follows clean architecture principles - UI concerns only.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TAuditView = 'list' | 'timeline' | 'table';
export type TAuditSortBy = 'created_at' | 'action' | 'entity' | 'actor_id';
export type TAuditSortOrder = 'asc' | 'desc';

interface IDateRange {
  readonly startDate: Date | null;
  readonly endDate: Date | null;
}

interface IAuditFilters {
  readonly userIds: readonly string[];
  readonly actions: readonly string[];
  readonly entities: readonly string[];
  readonly severityFilter: readonly string[];
}

interface IAuditUIState {
  // View state
  readonly view: TAuditView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly filters: IAuditFilters;
  readonly dateRange: IDateRange;

  // Sort state
  readonly sortBy: TAuditSortBy;
  readonly sortOrder: TAuditSortOrder;

  // Selection state
  readonly selectedLogIds: readonly string[];

  // Detail view state
  readonly selectedLogId: string | null;
  readonly isDetailsPanelOpen: boolean;

  // Export state
  readonly isExporting: boolean;

  // Pagination state
  readonly currentPage: number;
  readonly itemsPerPage: number;

  // View actions
  readonly setView: (view: TAuditView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  // Search and filter actions
  readonly setSearchTerm: (term: string) => void;
  readonly setFilters: (filters: IAuditFilters) => void;
  readonly toggleUserFilter: (userId: string) => void;
  readonly toggleActionFilter: (action: string) => void;
  readonly toggleEntityFilter: (entity: string) => void;
  readonly toggleSeverityFilter: (severity: string) => void;
  readonly clearFilters: () => void;

  // Date range actions
  readonly setDateRange: (range: IDateRange) => void;
  readonly clearDateRange: () => void;
  readonly setToday: () => void;
  readonly setYesterday: () => void;
  readonly setLast7Days: () => void;
  readonly setLast30Days: () => void;
  readonly setThisWeek: () => void;
  readonly setThisMonth: () => void;
  readonly setCustomRange: (startDate: Date, endDate: Date) => void;

  // Sort actions
  readonly setSortBy: (sortBy: TAuditSortBy) => void;
  readonly setSortOrder: (order: TAuditSortOrder) => void;
  readonly toggleSort: (sortBy: TAuditSortBy) => void;

  // Selection actions
  readonly selectLog: (id: string) => void;
  readonly deselectLog: (id: string) => void;
  readonly toggleLogSelection: (id: string) => void;
  readonly selectAllLogs: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  // Detail view actions
  readonly openDetails: (logId: string) => void;
  readonly closeDetails: () => void;
  readonly toggleDetails: (logId: string) => void;

  // Export actions
  readonly setIsExporting: (isExporting: boolean) => void;
  readonly startExport: () => void;
  readonly finishExport: () => void;

  // Pagination actions
  readonly setCurrentPage: (page: number) => void;
  readonly setItemsPerPage: (itemsPerPage: number) => void;
  readonly nextPage: () => void;
  readonly previousPage: () => void;
  readonly goToFirstPage: () => void;
  readonly goToLastPage: (totalPages: number) => void;

  // Reset actions
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
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
 * Get date range for "yesterday"
 */
const getYesterdayRange = (): IDateRange => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  return {
    startDate: yesterday,
    endDate: endOfYesterday,
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
  view: 'timeline' as TAuditView,
  showFilters: false,
  searchTerm: '',
  filters: {
    userIds: [] as readonly string[],
    actions: [] as readonly string[],
    entities: [] as readonly string[],
    severityFilter: [] as readonly string[],
  },
  dateRange: {
    startDate: null as Date | null,
    endDate: null as Date | null,
  },
  sortBy: 'created_at' as TAuditSortBy,
  sortOrder: 'desc' as TAuditSortOrder,
  selectedLogIds: [] as readonly string[],
  selectedLogId: null as string | null,
  isDetailsPanelOpen: false,
  isExporting: false,
  currentPage: 1,
  itemsPerPage: 50,
};

export const useAuditUIStore = create<IAuditUIState>()(
  devtools(
    (set) => ({
      ...initialState,

      // View actions
      setView: (view) => set({ view }),
      setShowFilters: (showFilters) => set({ showFilters }),
      toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

      // Search and filter actions
      setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),

      setFilters: (filters) => set({ filters, currentPage: 1 }),

      toggleUserFilter: (userId) =>
        set((state) => ({
          filters: {
            ...state.filters,
            userIds: state.filters.userIds.includes(userId)
              ? state.filters.userIds.filter((id) => id !== userId)
              : [...state.filters.userIds, userId],
          },
          currentPage: 1,
        })),

      toggleActionFilter: (action) =>
        set((state) => ({
          filters: {
            ...state.filters,
            actions: state.filters.actions.includes(action)
              ? state.filters.actions.filter((a) => a !== action)
              : [...state.filters.actions, action],
          },
          currentPage: 1,
        })),

      toggleEntityFilter: (entity) =>
        set((state) => ({
          filters: {
            ...state.filters,
            entities: state.filters.entities.includes(entity)
              ? state.filters.entities.filter((e) => e !== entity)
              : [...state.filters.entities, entity],
          },
          currentPage: 1,
        })),

      toggleSeverityFilter: (severity) =>
        set((state) => ({
          filters: {
            ...state.filters,
            severityFilter: state.filters.severityFilter.includes(severity)
              ? state.filters.severityFilter.filter((s) => s !== severity)
              : [...state.filters.severityFilter, severity],
          },
          currentPage: 1,
        })),

      clearFilters: () =>
        set({
          filters: {
            userIds: [],
            actions: [],
            entities: [],
            severityFilter: [],
          },
          currentPage: 1,
        }),

      // Date range actions
      setDateRange: (dateRange) => set({ dateRange, currentPage: 1 }),
      clearDateRange: () =>
        set({
          dateRange: { startDate: null, endDate: null },
          currentPage: 1,
        }),
      setToday: () => set({ dateRange: getTodayRange(), currentPage: 1 }),
      setYesterday: () => set({ dateRange: getYesterdayRange(), currentPage: 1 }),
      setLast7Days: () => set({ dateRange: getLastNDaysRange(7), currentPage: 1 }),
      setLast30Days: () => set({ dateRange: getLastNDaysRange(30), currentPage: 1 }),
      setThisWeek: () => set({ dateRange: getThisWeekRange(), currentPage: 1 }),
      setThisMonth: () => set({ dateRange: getThisMonthRange(), currentPage: 1 }),
      setCustomRange: (startDate, endDate) =>
        set({
          dateRange: { startDate, endDate },
          currentPage: 1,
        }),

      // Sort actions
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      toggleSort: (sortBy) =>
        set((state) => ({
          sortBy,
          sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
        })),

      // Selection actions
      selectLog: (id) =>
        set((state) => ({
          selectedLogIds: [...state.selectedLogIds, id],
        })),

      deselectLog: (id) =>
        set((state) => ({
          selectedLogIds: state.selectedLogIds.filter((logId) => logId !== id),
        })),

      toggleLogSelection: (id) =>
        set((state) => ({
          selectedLogIds: state.selectedLogIds.includes(id)
            ? state.selectedLogIds.filter((logId) => logId !== id)
            : [...state.selectedLogIds, id],
        })),

      selectAllLogs: (ids) => set({ selectedLogIds: ids }),

      clearSelection: () => set({ selectedLogIds: [] }),

      // Detail view actions
      openDetails: (logId) =>
        set({
          selectedLogId: logId,
          isDetailsPanelOpen: true,
        }),

      closeDetails: () =>
        set({
          selectedLogId: null,
          isDetailsPanelOpen: false,
        }),

      toggleDetails: (logId) =>
        set((state) => ({
          selectedLogId: state.selectedLogId === logId ? null : logId,
          isDetailsPanelOpen: state.selectedLogId === logId ? false : true,
        })),

      // Export actions
      setIsExporting: (isExporting) => set({ isExporting }),

      startExport: () => set({ isExporting: true }),

      finishExport: () => set({ isExporting: false }),

      // Pagination actions
      setCurrentPage: (currentPage) => set({ currentPage }),

      setItemsPerPage: (itemsPerPage) =>
        set({
          itemsPerPage,
          currentPage: 1,
        }),

      nextPage: () =>
        set((state) => ({
          currentPage: state.currentPage + 1,
        })),

      previousPage: () =>
        set((state) => ({
          currentPage: Math.max(1, state.currentPage - 1),
        })),

      goToFirstPage: () => set({ currentPage: 1 }),

      goToLastPage: (totalPages) => set({ currentPage: totalPages }),

      // Reset actions
      resetFilters: () =>
        set({
          searchTerm: '',
          filters: {
            userIds: [],
            actions: [],
            entities: [],
            severityFilter: [],
          },
          dateRange: {
            startDate: null,
            endDate: null,
          },
          currentPage: 1,
        }),

      resetAll: () => set(initialState),
    }),
    { name: 'AuditUIStore' }
  )
);
