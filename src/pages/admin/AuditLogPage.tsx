"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import SystemPageLayout from "@/components/layouts/AdminLayout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Download,
  Filter,
  Search,
  Activity,
  AlertCircle,
  Clock,
  User,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  List,
  Timeline,
  Table,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuditManagement } from "@/hooks/features/audit/useAuditManagement";
import type { IFormattedAuditEntry } from "@/services/business/audit.business.service";

/**
 * Audit Log Page Component
 *
 * Comprehensive security audit log interface for administrators.
 * Features timeline/list views, filtering, search, and export capabilities.
 * Follows clean architecture with business logic separated into services and hooks.
 */
const AuditLogPage = (): JSX.Element => {
  const { t } = useTranslation("admin");

  const {
    // Data
    groupedLogs,
    paginatedLogs,
    filteredLogs,
    isLoading,
    stats,

    // Pagination
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,

    // Filters and metadata
    uniqueActions,
    uniqueEntities,

    // UI State
    view,
    showFilters,
    searchTerm,
    filters,
    dateRange,
    selectedLogId,
    isDetailsPanelOpen,
    isExporting,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleActionFilter,
    toggleEntityFilter,
    toggleSeverityFilter,
    clearFilters,
    setToday,
    setYesterday,
    setLast7Days,
    setLast30Days,
    setThisWeek,
    setThisMonth,
    openDetails,
    closeDetails,
    resetFilters,

    // Pagination Actions
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,

    // Export
    exportToCSV,
  } = useAuditManagement();

  /**
   * View modes
   */
  const viewModes = [
    { value: 'timeline' as const, label: 'Timeline', icon: Timeline },
    { value: 'list' as const, label: 'List', icon: List },
    { value: 'table' as const, label: 'Table', icon: Table },
  ];

  /**
   * Date range presets
   */
  const dateRangePresets = [
    { label: 'Today', onClick: setToday },
    { label: 'Yesterday', onClick: setYesterday },
    { label: 'Last 7 days', onClick: setLast7Days },
    { label: 'Last 30 days', onClick: setLast30Days },
    { label: 'This week', onClick: setThisWeek },
    { label: 'This month', onClick: setThisMonth },
  ];

  /**
   * Severity badge styling
   */
  const getSeverityBadge = (severity: string): JSX.Element => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    const icons = {
      info: CheckCircle,
      warning: AlertCircle,
      critical: XCircle,
    };

    const Icon = icons[severity as keyof typeof icons] || Activity;

    return (
      <Badge className={styles[severity as keyof typeof styles] || styles.info}>
        <Icon className="h-3 w-3 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  /**
   * Format date range display
   */
  const formattedDateRange = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'All time';
    }
    const start = dateRange.startDate.toLocaleDateString('nb-NO', {
      month: 'short',
      day: 'numeric',
    });
    const end = dateRange.endDate.toLocaleDateString('nb-NO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  }, [dateRange]);

  /**
   * Render audit log entry
   */
  const renderAuditEntry = (log: IFormattedAuditEntry): JSX.Element => {
    return (
      <div
        key={log.id}
        className="p-4 border-l-4 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => openDetails(log.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${log.actionColor.replace('text-', 'bg-').replace('600', '100').replace('400', '900/20')}`}>
                <Activity className={`h-4 w-4 ${log.actionColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {log.actionLabel}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {log.entityLabel} • {log.actorName}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {log.formattedDetails}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {log.relativeTime}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {log.formattedTimestamp}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {getSeverityBadge(log.severity)}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openDetails(log.id);
              }}
              className="h-8"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render timeline view
   */
  const renderTimelineView = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (groupedLogs.length === 0) {
      return (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No audit logs found
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Try adjusting your filters or date range
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {groupedLogs.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {group.formattedDate}
              </h3>
              <Badge variant="secondary">{group.count} events</Badge>
            </div>
            <div className="space-y-3">
              {group.entries.map(renderAuditEntry)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render list view
   */
  const renderListView = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    if (paginatedLogs.length === 0) {
      return (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No audit logs found
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Try adjusting your filters or date range
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {paginatedLogs.map(renderAuditEntry)}
      </div>
    );
  };

  /**
   * Render table view
   */
  const renderTableView = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      );
    }

    if (paginatedLogs.length === 0) {
      return (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No audit logs found
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Timestamp
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Action
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Entity
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Actor
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Severity
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => openDetails(log.id)}
              >
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                  {log.relativeTime}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Activity className={`h-4 w-4 ${log.actionColor}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.actionLabel}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {log.entityLabel}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {log.actorName}
                </td>
                <td className="py-3 px-4">
                  {getSeverityBadge(log.severity)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                  {log.formattedDetails}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <RequireRole roles={["org-admin", "system-admin"]}>
      <SystemPageLayout
        title="Audit Logs"
        description="Security audit trail and activity monitoring"
        secondaryActions={[
          {
            label: 'Export CSV',
            icon: Download,
            onClick: exportToCSV,
            disabled: isExporting || filteredLogs.length === 0,
          },
        ]}
      >
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.totalEvents.toLocaleString('nb-NO')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.eventsToday} today
                  </p>
                </div>
                <Activity className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Unique Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.uniqueUsers}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Active this period
                  </p>
                </div>
                <User className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Critical Events
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {stats.criticalEvents}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Requires attention
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.eventsThisWeek.toLocaleString('nb-NO')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last 7 days
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filters
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFilters}
                  aria-label="Toggle filters"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                {(filters.actions.length > 0 || filters.entities.length > 0 || filters.severityFilter.length > 0 || dateRange.startDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>

              {/* Date Range Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Range:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formattedDateRange}
                </span>
              </div>

              {/* Date Range Presets */}
              {showFilters && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quick Date Ranges:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dateRangePresets.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          onClick={preset.onClick}
                          className="h-10"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Action Filters */}
                  {uniqueActions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Actions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueActions.slice(0, 10).map((action) => (
                          <Button
                            key={action}
                            variant={filters.actions.includes(action) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleActionFilter(action)}
                            className="h-10"
                          >
                            {action.replace(/_/g, ' ')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entity Filters */}
                  {uniqueEntities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Entities:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueEntities.map((entity) => (
                          <Button
                            key={entity}
                            variant={filters.entities.includes(entity) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleEntityFilter(entity)}
                            className="h-10"
                          >
                            {entity}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Severity Filters */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Severity:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['info', 'warning', 'critical'].map((severity) => (
                        <Button
                          key={severity}
                          variant={filters.severityFilter.includes(severity) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSeverityFilter(severity)}
                          className="h-10"
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* View Selector and Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Trail ({totalItems.toLocaleString('nb-NO')} events)
              </span>
              <div className="flex items-center gap-2">
                {viewModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.value}
                      variant={view === mode.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView(mode.value)}
                      aria-label={`Switch to ${mode.label} view`}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {view === 'timeline' && renderTimelineView()}
            {view === 'list' && renderListView()}
            {view === 'table' && renderTableView()}

            {/* Pagination */}
            {view !== 'timeline' && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={!hasPreviousPage}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousPage}
                    disabled={!hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900 dark:text-white px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={!hasNextPage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={!hasNextPage}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </SystemPageLayout>
    </RequireRole>
  );
};

export default AuditLogPage;
