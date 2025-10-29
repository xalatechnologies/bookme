/**
 * Audit Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for audit log management operations.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useAuditUIStore } from '@/stores/auditUIStore';
import {
  filterAuditLogs,
  sortAuditLogs,
  formatAuditEntry,
  groupAuditLogsByDate,
  getUniqueActions,
  getUniqueEntities,
  getUniqueUsers,
  calculateAuditStats,
  exportAuditLogsToCSV,
  generateAuditCSVContent,
  type IAuditFilters,
  type IAuditSortConfig,
  type IFormattedAuditEntry,
  type IGroupedAuditEntries,
  type IAuditStats,
} from '@/services/business/audit.business.service';

type AuditEvent = Database['public']['Tables']['audit_events']['Row'];

export interface IUseAuditManagementReturn {
  // Data
  readonly auditLogs: readonly AuditEvent[];
  readonly filteredLogs: readonly IFormattedAuditEntry[];
  readonly groupedLogs: readonly IGroupedAuditEntries[];
  readonly paginatedLogs: readonly IFormattedAuditEntry[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly stats: IAuditStats;
  readonly uniqueActions: readonly string[];
  readonly uniqueEntities: readonly string[];
  readonly uniqueUsers: readonly string[];

  // Pagination
  readonly totalItems: number;
  readonly totalPages: number;
  readonly currentPage: number;
  readonly itemsPerPage: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;

  // UI State
  readonly view: string;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly filters: {
    readonly userIds: readonly string[];
    readonly actions: readonly string[];
    readonly entities: readonly string[];
    readonly severityFilter: readonly string[];
  };
  readonly dateRange: { readonly startDate: Date | null; readonly endDate: Date | null };
  readonly sortBy: string;
  readonly sortOrder: string;
  readonly selectedLogIds: readonly string[];
  readonly selectedLogId: string | null;
  readonly isDetailsPanelOpen: boolean;
  readonly isExporting: boolean;

  // UI Actions
  readonly setView: (view: any) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleUserFilter: (userId: string) => void;
  readonly toggleActionFilter: (action: string) => void;
  readonly toggleEntityFilter: (entity: string) => void;
  readonly toggleSeverityFilter: (severity: string) => void;
  readonly clearFilters: () => void;
  readonly setDateRange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  readonly clearDateRange: () => void;
  readonly setToday: () => void;
  readonly setYesterday: () => void;
  readonly setLast7Days: () => void;
  readonly setLast30Days: () => void;
  readonly setThisWeek: () => void;
  readonly setThisMonth: () => void;
  readonly toggleSort: (sortBy: any) => void;
  readonly toggleLogSelection: (id: string) => void;
  readonly selectAllLogs: () => void;
  readonly clearSelection: () => void;
  readonly openDetails: (logId: string) => void;
  readonly closeDetails: () => void;
  readonly resetFilters: () => void;

  // Pagination Actions
  readonly setCurrentPage: (page: number) => void;
  readonly setItemsPerPage: (itemsPerPage: number) => void;
  readonly nextPage: () => void;
  readonly previousPage: () => void;
  readonly goToFirstPage: () => void;
  readonly goToLastPage: () => void;

  // Export Operations
  readonly exportToCSV: () => void;
  readonly downloadCSV: (filename: string, content: string) => void;
}

/**
 * Query key for audit logs
 */
const auditKeys = {
  all: ['auditLogs'] as const,
  orgLogs: (orgId: string) => [...auditKeys.all, 'org', orgId] as const,
};

/**
 * Fetch audit logs for organization from Supabase
 */
const fetchOrgAuditLogs = async (orgId: string): Promise<AuditEvent[]> => {
  const { data, error } = await supabase
    .from('audit_events')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1000); // Limit to last 1000 events for performance

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }

  return data || [];
};

/**
 * Hook for managing audit logs with business logic separation
 *
 * Provides comprehensive audit log management functionality including:
 * - Data fetching and caching via React Query
 * - UI state management via Zustand store
 * - Business logic filtering and formatting
 * - Timeline and grouped views
 * - Statistics and analytics
 * - CSV export functionality
 * - Pagination support
 *
 * @returns Complete audit management interface
 *
 * @example
 * ```tsx
 * function AuditLogPage() {
 *   const {
 *     groupedLogs,
 *     isLoading,
 *     stats,
 *     searchTerm,
 *     setSearchTerm,
 *     exportToCSV,
 *   } = useAuditManagement();
 *
 *   return (
 *     <div>
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <AuditStats stats={stats} />
 *       <AuditTimeline groups={groupedLogs} />
 *       <Button onClick={exportToCSV}>Export to CSV</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuditManagement = (): IUseAuditManagementReturn => {
  // Data layer - fetch audit logs from Supabase
  const orgId = useOrganizationId();
  const {
    data: auditLogs = [],
    isLoading,
    error,
  }: UseQueryResult<AuditEvent[], Error> = useQuery({
    queryKey: auditKeys.orgLogs(orgId),
    queryFn: () => fetchOrgAuditLogs(orgId),
    enabled: !!orgId,
    staleTime: 30000, // 30 seconds
  });

  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    showFilters,
    searchTerm,
    filters,
    dateRange,
    sortBy,
    sortOrder,
    selectedLogIds,
    selectedLogId,
    isDetailsPanelOpen,
    isExporting,
    currentPage,
    itemsPerPage,
    setView,
    toggleFilters,
    setSearchTerm,
    toggleUserFilter,
    toggleActionFilter,
    toggleEntityFilter,
    toggleSeverityFilter,
    clearFilters,
    setDateRange,
    clearDateRange,
    setToday,
    setYesterday,
    setLast7Days,
    setLast30Days,
    setThisWeek,
    setThisMonth,
    toggleSort,
    toggleLogSelection,
    selectAllLogs: selectAll,
    clearSelection,
    openDetails,
    closeDetails,
    resetFilters,
    setCurrentPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage: goToLast,
    startExport,
    finishExport,
  } = useAuditUIStore();

  // Business logic layer - filtering and sorting
  const filteredAndSorted = useMemo(() => {
    // Apply business logic filters
    const businessFilters: IAuditFilters = {
      searchTerm,
      userIds: filters.userIds,
      actions: filters.actions,
      entities: filters.entities,
      dateRange: dateRange.startDate && dateRange.endDate
        ? {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }
        : undefined,
    };

    const filtered = filterAuditLogs(auditLogs, businessFilters);

    // Apply severity filter (UI-specific)
    const severityFiltered = filters.severityFilter.length > 0
      ? filtered.filter((log) => {
          const formatted = formatAuditEntry(log);
          return filters.severityFilter.includes(formatted.severity);
        })
      : filtered;

    // Apply business logic sorting
    const sortConfig: IAuditSortConfig = {
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    };

    return sortAuditLogs(severityFiltered, sortConfig);
  }, [auditLogs, searchTerm, filters, dateRange, sortBy, sortOrder]);

  // Format logs for display
  const formattedLogs = useMemo(
    () => filteredAndSorted.map(formatAuditEntry),
    [filteredAndSorted]
  );

  // Group logs by date for timeline view
  const groupedLogs = useMemo(
    () => groupAuditLogsByDate(formattedLogs),
    [formattedLogs]
  );

  // Pagination
  const totalItems = formattedLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = formattedLogs.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Statistics - calculate from current audit logs
  const stats = useMemo(() => calculateAuditStats(auditLogs), [auditLogs]);

  // Unique values for filters
  const uniqueActions = useMemo(() => getUniqueActions(auditLogs), [auditLogs]);
  const uniqueEntities = useMemo(() => getUniqueEntities(auditLogs), [auditLogs]);
  const uniqueUsers = useMemo(() => getUniqueUsers(auditLogs), [auditLogs]);

  // Export operations
  const exportToCSV = useCallback(() => {
    startExport();

    try {
      const exportData = exportAuditLogsToCSV(formattedLogs);
      const csvContent = generateAuditCSVContent(exportData);

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${exportData.filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      finishExport();
    }
  }, [formattedLogs, startExport, finishExport]);

  const downloadCSV = useCallback((filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const selectAllLogs = useCallback(() => {
    selectAll(formattedLogs.map((log) => log.id));
  }, [formattedLogs, selectAll]);

  const goToLastPage = useCallback(() => {
    goToLast(totalPages);
  }, [totalPages, goToLast]);

  return {
    // Data
    auditLogs,
    filteredLogs: formattedLogs,
    groupedLogs,
    paginatedLogs,
    isLoading,
    error,

    // Statistics
    stats,
    uniqueActions,
    uniqueEntities,
    uniqueUsers,

    // Pagination
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,

    // UI State
    view,
    showFilters,
    searchTerm,
    filters,
    dateRange,
    sortBy,
    sortOrder,
    selectedLogIds,
    selectedLogId,
    isDetailsPanelOpen,
    isExporting,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleUserFilter,
    toggleActionFilter,
    toggleEntityFilter,
    toggleSeverityFilter,
    clearFilters,
    setDateRange,
    clearDateRange,
    setToday,
    setYesterday,
    setLast7Days,
    setLast30Days,
    setThisWeek,
    setThisMonth,
    toggleSort,
    toggleLogSelection,
    selectAllLogs,
    clearSelection,
    openDetails,
    closeDetails,
    resetFilters,

    // Pagination Actions
    setCurrentPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,

    // Export Operations
    exportToCSV,
    downloadCSV,
  };
};
