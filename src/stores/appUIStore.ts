/**
 * Application Global UI Store
 *
 * Consolidates all admin and global UI state into a single store.
 * Replaces: settingsUIStore, reportUIStore, auditUIStore, userUIStore
 *
 * **Phase 7:** Store Consolidation - Created as part of reducing 23 stores to 9
 *
 * Sections:
 * - Settings: Application settings UI state
 * - Reports: Reporting and analytics UI state
 * - Audit: Audit log viewing UI state
 * - Users: User management UI state
 * - Global: Sidebar, notifications, theme
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

/**
 * Settings section state
 */
export interface ISettingsState {
  readonly activeSection: string;
  readonly unsavedChanges: boolean;
  readonly isSaving: boolean;
  readonly saveSuccess: boolean;
  readonly saveError: string | null;
  readonly validationErrors: Record<string, string[]>;
  readonly modals: {
    readonly saveConfirmation: boolean;
    readonly discardChanges: boolean;
    readonly testEmail: boolean;
    readonly testPayment: boolean;
  };
  readonly collapsedSections: readonly string[];
}

/**
 * Reports section state
 */
export interface IReportsState {
  readonly reportType: string; // 'revenue' | 'bookings' | 'utilization' | 'user_activity'
  readonly dateRange: {
    readonly startDate: Date | null;
    readonly endDate: Date | null;
  };
  readonly groupBy: string; // 'day' | 'week' | 'month' | 'year'
  readonly view: string; // 'charts' | 'table' | 'cards'
  readonly filters: {
    readonly facilityIds: readonly string[];
    readonly statusFilter: readonly string[];
    readonly userIds: readonly string[];
  };
  readonly showFilters: boolean;
  readonly showComparison: boolean;
  readonly comparisonPeriod: 'previous' | 'year_ago' | null;
  readonly isExporting: boolean;
  readonly exportFormat: 'csv' | 'pdf' | null;
  readonly isDatePickerOpen: boolean;
  readonly isFilterModalOpen: boolean;
  readonly isExportModalOpen: boolean;
}

/**
 * Audit section state
 */
export interface IAuditState {
  readonly view: string; // 'list' | 'timeline' | 'table'
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly filters: {
    readonly userIds: readonly string[];
    readonly actions: readonly string[];
    readonly entities: readonly string[];
    readonly severityFilter: readonly string[];
  };
  readonly dateRange: {
    readonly startDate: Date | null;
    readonly endDate: Date | null;
  };
  readonly sortBy: string; // 'created_at' | 'action' | 'entity' | 'actor_id'
  readonly sortOrder: 'asc' | 'desc';
  readonly selectedLogIds: readonly string[];
  readonly selectedLogId: string | null;
  readonly isDetailsPanelOpen: boolean;
  readonly isExporting: boolean;
  readonly currentPage: number;
  readonly itemsPerPage: number;
}

/**
 * User management state
 */
export interface IUsersState {
  readonly view: string; // 'list' | 'grid' | 'table'
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly roleFilter: readonly string[];
  readonly statusFilter: readonly string[]; // 'active' | 'inactive' | 'suspended'
  readonly organizationFilter: string | null;
  readonly sortBy: string; // 'display_name' | 'email' | 'role' | 'last_login' | 'created_at'
  readonly sortOrder: 'asc' | 'desc';
  readonly selectedUserIds: readonly string[];
  readonly showUserEditor: boolean;
  readonly editingUserId: string | null;
}

/**
 * Complete app UI state
 */
export interface IAppUIState {
  // Sections
  readonly settings: ISettingsState;
  readonly reports: IReportsState;
  readonly audit: IAuditState;
  readonly users: IUsersState;

  // Global UI
  readonly sidebarCollapsed: boolean;
  readonly notificationsPanelOpen: boolean;
  readonly theme: 'light' | 'dark' | 'system';

  // Settings Actions
  readonly setSettingsSection: (section: string) => void;
  readonly setSettingsUnsavedChanges: (hasChanges: boolean) => void;
  readonly setSettingsIsSaving: (saving: boolean) => void;
  readonly setSettingsSaveSuccess: (success: boolean) => void;
  readonly setSettingsSaveError: (error: string | null) => void;
  readonly setSettingsValidationErrors: (errors: Record<string, string[]>) => void;
  readonly clearSettingsValidationErrors: () => void;
  readonly openSettingsModal: (modal: keyof ISettingsState['modals']) => void;
  readonly closeSettingsModal: (modal: keyof ISettingsState['modals']) => void;
  readonly toggleSettingsSection: (section: string) => void;

  // Reports Actions
  readonly setReportType: (type: string) => void;
  readonly setReportDateRange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  readonly setReportGroupBy: (groupBy: string) => void;
  readonly setReportView: (view: string) => void;
  readonly setReportFilters: (filters: { facilityIds: readonly string[]; statusFilter: readonly string[]; userIds: readonly string[] }) => void;
  readonly toggleReportFacilityFilter: (facilityId: string) => void;
  readonly toggleReportStatusFilter: (status: string) => void;
  readonly toggleReportUserFilter: (userId: string) => void;
  readonly clearReportFilters: () => void;
  readonly toggleReportFilters: () => void;
  readonly setReportToday: () => void;
  readonly setReportThisWeek: () => void;
  readonly setReportThisMonth: () => void;
  readonly setReportThisYear: () => void;
  readonly setReportLast30Days: () => void;
  readonly setReportLast90Days: () => void;
  readonly setReportShowComparison: (show: boolean) => void;
  readonly setReportComparisonPeriod: (period: 'previous' | 'year_ago' | null) => void;
  readonly setReportIsExporting: (isExporting: boolean) => void;
  readonly startReportExport: (format: 'csv' | 'pdf') => void;
  readonly finishReportExport: () => void;
  readonly openReportDatePicker: () => void;
  readonly closeReportDatePicker: () => void;
  readonly openReportFilterModal: () => void;
  readonly closeReportFilterModal: () => void;
  readonly openReportExportModal: () => void;
  readonly closeReportExportModal: () => void;
  readonly resetReportToDefaults: () => void;

  // Audit Actions
  readonly setAuditView: (view: string) => void;
  readonly toggleAuditFilters: () => void;
  readonly setAuditSearchTerm: (term: string) => void;
  readonly toggleAuditUserFilter: (userId: string) => void;
  readonly toggleAuditActionFilter: (action: string) => void;
  readonly toggleAuditEntityFilter: (entity: string) => void;
  readonly toggleAuditSeverityFilter: (severity: string) => void;
  readonly clearAuditFilters: () => void;
  readonly setAuditDateRange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  readonly clearAuditDateRange: () => void;
  readonly setAuditToday: () => void;
  readonly setAuditYesterday: () => void;
  readonly setAuditLast7Days: () => void;
  readonly setAuditLast30Days: () => void;
  readonly setAuditThisWeek: () => void;
  readonly setAuditThisMonth: () => void;
  readonly setAuditSortBy: (sortBy: string) => void;
  readonly toggleAuditSort: (sortBy: string) => void;
  readonly toggleAuditLogSelection: (id: string) => void;
  readonly selectAllAuditLogs: (ids: readonly string[]) => void;
  readonly clearAuditSelection: () => void;
  readonly openAuditDetails: (logId: string) => void;
  readonly closeAuditDetails: () => void;
  readonly setAuditIsExporting: (isExporting: boolean) => void;
  readonly setAuditPage: (page: number) => void;
  readonly setAuditItemsPerPage: (items: number) => void;
  readonly resetAuditFilters: () => void;

  // Users Actions
  readonly setUsersView: (view: string) => void;
  readonly toggleUsersFilters: () => void;
  readonly setUsersSearchTerm: (term: string) => void;
  readonly setUsersRoleFilter: (roles: readonly string[]) => void;
  readonly toggleUsersRoleFilter: (role: string) => void;
  readonly setUsersStatusFilter: (statuses: readonly string[]) => void;
  readonly toggleUsersStatusFilter: (status: string) => void;
  readonly setUsersOrganizationFilter: (orgId: string | null) => void;
  readonly setUsersSortBy: (sortBy: string) => void;
  readonly setUsersSortOrder: (order: 'asc' | 'desc') => void;
  readonly toggleUsersSort: (sortBy: string) => void;
  readonly toggleUsersSelection: (id: string) => void;
  readonly selectAllUsers: (ids: readonly string[]) => void;
  readonly clearUsersSelection: () => void;
  readonly openUsersEditor: (userId?: string) => void;
  readonly closeUsersEditor: () => void;
  readonly resetUsersFilters: () => void;

  // Global Actions
  readonly toggleSidebar: () => void;
  readonly setSidebarCollapsed: (collapsed: boolean) => void;
  readonly toggleNotificationsPanel: () => void;
  readonly setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAppUIStore = create<IAppUIState>()(
  devtools(
    persist(
      (set) => ({
        // ========================================================================
        // Initial State
        // ========================================================================

        settings: {
          activeSection: 'general',
          unsavedChanges: false,
          isSaving: false,
          saveSuccess: false,
          saveError: null,
          validationErrors: {},
          modals: {
            saveConfirmation: false,
            discardChanges: false,
            testEmail: false,
            testPayment: false,
          },
          collapsedSections: [],
        },

        reports: {
          reportType: 'revenue',
          dateRange: { startDate: null, endDate: null },
          groupBy: 'day',
          view: 'charts',
          filters: {
            facilityIds: [],
            statusFilter: [],
            userIds: [],
          },
          showFilters: false,
          showComparison: false,
          comparisonPeriod: null,
          isExporting: false,
          exportFormat: null,
          isDatePickerOpen: false,
          isFilterModalOpen: false,
          isExportModalOpen: false,
        },

        audit: {
          view: 'table',
          showFilters: false,
          searchTerm: '',
          filters: {
            userIds: [],
            actions: [],
            entities: [],
            severityFilter: [],
          },
          dateRange: { startDate: null, endDate: null },
          sortBy: 'created_at',
          sortOrder: 'desc',
          selectedLogIds: [],
          selectedLogId: null,
          isDetailsPanelOpen: false,
          isExporting: false,
          currentPage: 1,
          itemsPerPage: 25,
        },

        users: {
          view: 'table',
          showFilters: false,
          searchTerm: '',
          roleFilter: [],
          statusFilter: [],
          organizationFilter: null,
          sortBy: 'display_name',
          sortOrder: 'asc',
          selectedUserIds: [],
          showUserEditor: false,
          editingUserId: null,
        },

        sidebarCollapsed: false,
        notificationsPanelOpen: false,
        theme: 'system',

        // ========================================================================
        // Settings Actions
        // ========================================================================

        setSettingsSection: (section) =>
          set((state) => ({
            settings: { ...state.settings, activeSection: section },
          })),

        setSettingsUnsavedChanges: (hasChanges) =>
          set((state) => ({
            settings: { ...state.settings, unsavedChanges: hasChanges },
          })),

        setSettingsIsSaving: (saving) =>
          set((state) => ({
            settings: { ...state.settings, isSaving: saving },
          })),

        setSettingsSaveSuccess: (success) =>
          set((state) => ({
            settings: { ...state.settings, saveSuccess: success },
          })),

        setSettingsSaveError: (error) =>
          set((state) => ({
            settings: { ...state.settings, saveError: error },
          })),

        setSettingsValidationErrors: (errors) =>
          set((state) => ({
            settings: { ...state.settings, validationErrors: errors },
          })),

        clearSettingsValidationErrors: () =>
          set((state) => ({
            settings: { ...state.settings, validationErrors: {} },
          })),

        openSettingsModal: (modal) =>
          set((state) => ({
            settings: {
              ...state.settings,
              modals: { ...state.settings.modals, [modal]: true },
            },
          })),

        closeSettingsModal: (modal) =>
          set((state) => ({
            settings: {
              ...state.settings,
              modals: { ...state.settings.modals, [modal]: false },
            },
          })),

        toggleSettingsSection: (section) =>
          set((state) => ({
            settings: {
              ...state.settings,
              collapsedSections: state.settings.collapsedSections.includes(section)
                ? state.settings.collapsedSections.filter((s) => s !== section)
                : [...state.settings.collapsedSections, section],
            },
          })),

        // ========================================================================
        // Reports Actions
        // ========================================================================

        setReportType: (type) =>
          set((state) => ({
            reports: { ...state.reports, reportType: type },
          })),

        setReportDateRange: (range) =>
          set((state) => ({
            reports: { ...state.reports, dateRange: range },
          })),

        setReportGroupBy: (groupBy) =>
          set((state) => ({
            reports: { ...state.reports, groupBy },
          })),

        setReportView: (view) =>
          set((state) => ({
            reports: { ...state.reports, view },
          })),

        setReportFilters: (filters) =>
          set((state) => ({
            reports: { ...state.reports, filters },
          })),

        toggleReportFacilityFilter: (facilityId) =>
          set((state) => ({
            reports: {
              ...state.reports,
              filters: {
                ...state.reports.filters,
                facilityIds: state.reports.filters.facilityIds.includes(facilityId)
                  ? state.reports.filters.facilityIds.filter((id) => id !== facilityId)
                  : [...state.reports.filters.facilityIds, facilityId],
              },
            },
          })),

        toggleReportStatusFilter: (status) =>
          set((state) => ({
            reports: {
              ...state.reports,
              filters: {
                ...state.reports.filters,
                statusFilter: state.reports.filters.statusFilter.includes(status)
                  ? state.reports.filters.statusFilter.filter((s) => s !== status)
                  : [...state.reports.filters.statusFilter, status],
              },
            },
          })),

        toggleReportUserFilter: (userId) =>
          set((state) => ({
            reports: {
              ...state.reports,
              filters: {
                ...state.reports.filters,
                userIds: state.reports.filters.userIds.includes(userId)
                  ? state.reports.filters.userIds.filter((id) => id !== userId)
                  : [...state.reports.filters.userIds, userId],
              },
            },
          })),

        clearReportFilters: () =>
          set((state) => ({
            reports: {
              ...state.reports,
              filters: {
                facilityIds: [],
                statusFilter: [],
                userIds: [],
              },
            },
          })),

        toggleReportFilters: () =>
          set((state) => ({
            reports: { ...state.reports, showFilters: !state.reports.showFilters },
          })),

        setReportToday: () =>
          set((state) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return {
              reports: {
                ...state.reports,
                dateRange: { startDate: today, endDate: today },
              },
            };
          }),

        setReportThisWeek: () =>
          set((state) => {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return {
              reports: {
                ...state.reports,
                dateRange: { startDate: startOfWeek, endDate: today },
              },
            };
          }),

        setReportThisMonth: () =>
          set((state) => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return {
              reports: {
                ...state.reports,
                dateRange: { startDate: startOfMonth, endDate: today },
              },
            };
          }),

        setReportThisYear: () =>
          set((state) => {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            return {
              reports: {
                ...state.reports,
                dateRange: { startDate: startOfYear, endDate: today },
              },
            };
          }),

        setReportLast30Days: () =>
          set((state) => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return {
              reports: {
                ...state.reports,
                dateRange: { startDate: thirtyDaysAgo, endDate: today },
              },
            };
          }),

        setReportLast90Days: () =>
          set((state) => {
            const today = new Date();
            const ninetyDaysAgo = new Date(today);
            ninetyDaysAgo.setDate(today.getDate() - 90);
            return {
              reports: {
                ...state.reports,
                dateRange: { startDate: ninetyDaysAgo, endDate: today },
              },
            };
          }),

        setReportShowComparison: (show) =>
          set((state) => ({
            reports: { ...state.reports, showComparison: show },
          })),

        setReportComparisonPeriod: (period) =>
          set((state) => ({
            reports: { ...state.reports, comparisonPeriod: period },
          })),

        setReportIsExporting: (isExporting) =>
          set((state) => ({
            reports: { ...state.reports, isExporting },
          })),

        startReportExport: (format) =>
          set((state) => ({
            reports: {
              ...state.reports,
              isExporting: true,
              exportFormat: format,
            },
          })),

        finishReportExport: () =>
          set((state) => ({
            reports: {
              ...state.reports,
              isExporting: false,
              exportFormat: null,
            },
          })),

        openReportDatePicker: () =>
          set((state) => ({
            reports: { ...state.reports, isDatePickerOpen: true },
          })),

        closeReportDatePicker: () =>
          set((state) => ({
            reports: { ...state.reports, isDatePickerOpen: false },
          })),

        openReportFilterModal: () =>
          set((state) => ({
            reports: { ...state.reports, isFilterModalOpen: true },
          })),

        closeReportFilterModal: () =>
          set((state) => ({
            reports: { ...state.reports, isFilterModalOpen: false },
          })),

        openReportExportModal: () =>
          set((state) => ({
            reports: { ...state.reports, isExportModalOpen: true },
          })),

        closeReportExportModal: () =>
          set((state) => ({
            reports: { ...state.reports, isExportModalOpen: false },
          })),

        resetReportToDefaults: () =>
          set((state) => ({
            reports: {
              reportType: 'revenue',
              dateRange: { startDate: null, endDate: null },
              groupBy: 'day',
              view: 'charts',
              filters: {
                facilityIds: [],
                statusFilter: [],
                userIds: [],
              },
              showFilters: false,
              showComparison: false,
              comparisonPeriod: null,
              isExporting: false,
              exportFormat: null,
              isDatePickerOpen: false,
              isFilterModalOpen: false,
              isExportModalOpen: false,
            },
          })),

        // ========================================================================
        // Audit Actions
        // ========================================================================

        setAuditView: (view) =>
          set((state) => ({
            audit: { ...state.audit, view },
          })),

        toggleAuditFilters: () =>
          set((state) => ({
            audit: { ...state.audit, showFilters: !state.audit.showFilters },
          })),

        setAuditSearchTerm: (term) =>
          set((state) => ({
            audit: { ...state.audit, searchTerm: term },
          })),

        toggleAuditUserFilter: (userId) =>
          set((state) => ({
            audit: {
              ...state.audit,
              filters: {
                ...state.audit.filters,
                userIds: state.audit.filters.userIds.includes(userId)
                  ? state.audit.filters.userIds.filter((id) => id !== userId)
                  : [...state.audit.filters.userIds, userId],
              },
            },
          })),

        toggleAuditActionFilter: (action) =>
          set((state) => ({
            audit: {
              ...state.audit,
              filters: {
                ...state.audit.filters,
                actions: state.audit.filters.actions.includes(action)
                  ? state.audit.filters.actions.filter((a) => a !== action)
                  : [...state.audit.filters.actions, action],
              },
            },
          })),

        toggleAuditEntityFilter: (entity) =>
          set((state) => ({
            audit: {
              ...state.audit,
              filters: {
                ...state.audit.filters,
                entities: state.audit.filters.entities.includes(entity)
                  ? state.audit.filters.entities.filter((e) => e !== entity)
                  : [...state.audit.filters.entities, entity],
              },
            },
          })),

        toggleAuditSeverityFilter: (severity) =>
          set((state) => ({
            audit: {
              ...state.audit,
              filters: {
                ...state.audit.filters,
                severityFilter: state.audit.filters.severityFilter.includes(severity)
                  ? state.audit.filters.severityFilter.filter((s) => s !== severity)
                  : [...state.audit.filters.severityFilter, severity],
              },
            },
          })),

        clearAuditFilters: () =>
          set((state) => ({
            audit: {
              ...state.audit,
              filters: {
                userIds: [],
                actions: [],
                entities: [],
                severityFilter: [],
              },
            },
          })),

        setAuditDateRange: (range) =>
          set((state) => ({
            audit: { ...state.audit, dateRange: range },
          })),

        clearAuditDateRange: () =>
          set((state) => ({
            audit: { ...state.audit, dateRange: { startDate: null, endDate: null } },
          })),

        setAuditToday: () =>
          set((state) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return {
              audit: {
                ...state.audit,
                dateRange: { startDate: today, endDate: today },
              },
            };
          }),

        setAuditYesterday: () =>
          set((state) => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            return {
              audit: {
                ...state.audit,
                dateRange: { startDate: yesterday, endDate: yesterday },
              },
            };
          }),

        setAuditLast7Days: () =>
          set((state) => {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return {
              audit: {
                ...state.audit,
                dateRange: { startDate: sevenDaysAgo, endDate: today },
              },
            };
          }),

        setAuditLast30Days: () =>
          set((state) => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return {
              audit: {
                ...state.audit,
                dateRange: { startDate: thirtyDaysAgo, endDate: today },
              },
            };
          }),

        setAuditThisWeek: () =>
          set((state) => {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return {
              audit: {
                ...state.audit,
                dateRange: { startDate: startOfWeek, endDate: today },
              },
            };
          }),

        setAuditThisMonth: () =>
          set((state) => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return {
              audit: {
                ...state.audit,
                dateRange: { startDate: startOfMonth, endDate: today },
              },
            };
          }),

        setAuditSortBy: (sortBy) =>
          set((state) => ({
            audit: { ...state.audit, sortBy },
          })),

        toggleAuditSort: (sortBy) =>
          set((state) => ({
            audit: {
              ...state.audit,
              sortBy,
              sortOrder:
                state.audit.sortBy === sortBy
                  ? state.audit.sortOrder === 'asc'
                    ? 'desc'
                    : 'asc'
                  : 'asc',
            },
          })),

        toggleAuditLogSelection: (id) =>
          set((state) => ({
            audit: {
              ...state.audit,
              selectedLogIds: state.audit.selectedLogIds.includes(id)
                ? state.audit.selectedLogIds.filter((logId) => logId !== id)
                : [...state.audit.selectedLogIds, id],
            },
          })),

        selectAllAuditLogs: (ids) =>
          set((state) => ({
            audit: { ...state.audit, selectedLogIds: ids },
          })),

        clearAuditSelection: () =>
          set((state) => ({
            audit: { ...state.audit, selectedLogIds: [] },
          })),

        openAuditDetails: (logId) =>
          set((state) => ({
            audit: {
              ...state.audit,
              selectedLogId: logId,
              isDetailsPanelOpen: true,
            },
          })),

        closeAuditDetails: () =>
          set((state) => ({
            audit: {
              ...state.audit,
              selectedLogId: null,
              isDetailsPanelOpen: false,
            },
          })),

        setAuditIsExporting: (isExporting) =>
          set((state) => ({
            audit: { ...state.audit, isExporting },
          })),

        setAuditPage: (page) =>
          set((state) => ({
            audit: { ...state.audit, currentPage: page },
          })),

        setAuditItemsPerPage: (items) =>
          set((state) => ({
            audit: { ...state.audit, itemsPerPage: items, currentPage: 1 },
          })),

        resetAuditFilters: () =>
          set((state) => ({
            audit: {
              ...state.audit,
              filters: {
                userIds: [],
                actions: [],
                entities: [],
                severityFilter: [],
              },
              searchTerm: '',
              dateRange: { startDate: null, endDate: null },
              selectedLogIds: [],
            },
          })),

        // ========================================================================
        // Users Actions
        // ========================================================================

        setUsersView: (view) =>
          set((state) => ({
            users: { ...state.users, view },
          })),

        toggleUsersFilters: () =>
          set((state) => ({
            users: { ...state.users, showFilters: !state.users.showFilters },
          })),

        setUsersSearchTerm: (term) =>
          set((state) => ({
            users: { ...state.users, searchTerm: term },
          })),

        setUsersRoleFilter: (roles) =>
          set((state) => ({
            users: { ...state.users, roleFilter: roles },
          })),

        toggleUsersRoleFilter: (role) =>
          set((state) => ({
            users: {
              ...state.users,
              roleFilter: state.users.roleFilter.includes(role)
                ? state.users.roleFilter.filter((r) => r !== role)
                : [...state.users.roleFilter, role],
            },
          })),

        setUsersStatusFilter: (statuses) =>
          set((state) => ({
            users: { ...state.users, statusFilter: statuses },
          })),

        toggleUsersStatusFilter: (status) =>
          set((state) => ({
            users: {
              ...state.users,
              statusFilter: state.users.statusFilter.includes(status)
                ? state.users.statusFilter.filter((s) => s !== status)
                : [...state.users.statusFilter, status],
            },
          })),

        setUsersOrganizationFilter: (orgId) =>
          set((state) => ({
            users: { ...state.users, organizationFilter: orgId },
          })),

        setUsersSortBy: (sortBy) =>
          set((state) => ({
            users: { ...state.users, sortBy },
          })),

        setUsersSortOrder: (order) =>
          set((state) => ({
            users: { ...state.users, sortOrder: order },
          })),

        toggleUsersSort: (sortBy) =>
          set((state) => ({
            users: {
              ...state.users,
              sortBy,
              sortOrder:
                state.users.sortBy === sortBy
                  ? state.users.sortOrder === 'asc'
                    ? 'desc'
                    : 'asc'
                  : 'asc',
            },
          })),

        toggleUsersSelection: (id) =>
          set((state) => ({
            users: {
              ...state.users,
              selectedUserIds: state.users.selectedUserIds.includes(id)
                ? state.users.selectedUserIds.filter((uid) => uid !== id)
                : [...state.users.selectedUserIds, id],
            },
          })),

        selectAllUsers: (ids) =>
          set((state) => ({
            users: { ...state.users, selectedUserIds: ids },
          })),

        clearUsersSelection: () =>
          set((state) => ({
            users: { ...state.users, selectedUserIds: [] },
          })),

        openUsersEditor: (userId) =>
          set((state) => ({
            users: {
              ...state.users,
              showUserEditor: true,
              editingUserId: userId || null,
            },
          })),

        closeUsersEditor: () =>
          set((state) => ({
            users: {
              ...state.users,
              showUserEditor: false,
              editingUserId: null,
            },
          })),

        resetUsersFilters: () =>
          set((state) => ({
            users: {
              ...state.users,
              searchTerm: '',
              roleFilter: [],
              statusFilter: [],
              organizationFilter: null,
              selectedUserIds: [],
            },
          })),

        // ========================================================================
        // Global Actions
        // ========================================================================

        toggleSidebar: () =>
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          })),

        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),

        toggleNotificationsPanel: () =>
          set((state) => ({
            notificationsPanelOpen: !state.notificationsPanelOpen,
          })),

        setTheme: (theme) =>
          set({ theme }),
      }),
      {
        name: 'app-ui-store',
        version: 1,
        // Only persist user preferences, not temporary UI state
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          settings: state.settings,
        }),
      }
    ),
    { name: 'AppUIStore' }
  )
);

/**
 * Export type for external usage
 */
export type AppUIStore = typeof useAppUIStore;
