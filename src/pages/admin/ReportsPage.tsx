"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import SystemPageLayout from "@/components/layouts/AdminLayout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Users,
  Building2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useReportsManagement } from "@/hooks/features/reports/useReportsManagement";
import type { ReportType } from "@/services/business/report.business.service";

/**
 * Reports Page Component
 *
 * Comprehensive analytics and reporting interface for administrators.
 * Features multiple report types, date range selection, and export capabilities.
 * Follows clean architecture with business logic separated into services and hooks.
 */
const ReportsPage = (): JSX.Element => {
  const { t } = useTranslation("admin");

  const {
    // Data and reports
    revenueReport,
    bookingReport,
    utilizationReport,
    userActivityReport,
    chartData,
    isLoading,

    // UI State
    reportType,
    dateRange,
    groupBy,
    showFilters,

    // UI Actions
    setReportType,
    setGroupBy,
    toggleFilters,
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
    formatCurrency,
    formatPercentage,
    formatDate,
  } = useReportsManagement();

  /**
   * Report type configuration
   */
  const reportTypes: Array<{
    value: ReportType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      value: "revenue",
      label: t("pages.reports.report_types.revenue"),
      icon: DollarSign,
      description: t("pages.reports.report_types.revenue_description"),
    },
    {
      value: "bookings",
      label: t("pages.reports.report_types.bookings"),
      icon: Calendar,
      description: t("pages.reports.report_types.bookings_description"),
    },
    {
      value: "utilization",
      label: t("pages.reports.report_types.utilization"),
      icon: Building2,
      description: t("pages.reports.report_types.utilization_description"),
    },
    {
      value: "users",
      label: t("pages.reports.report_types.users"),
      icon: Users,
      description: t("pages.reports.report_types.users_description"),
    },
  ];

  /**
   * Date range presets
   */
  const dateRangePresets = [
    { label: t("pages.reports.date_presets.today"), onClick: setToday },
    { label: t("pages.reports.date_presets.this_week"), onClick: setThisWeek },
    { label: t("pages.reports.date_presets.this_month"), onClick: setThisMonth },
    { label: t("pages.reports.date_presets.this_year"), onClick: setThisYear },
    { label: t("pages.reports.date_presets.last_30_days"), onClick: setLast30Days },
    { label: t("pages.reports.date_presets.last_90_days"), onClick: setLast90Days },
  ];

  /**
   * Get growth icon and color based on value
   */
  const getGrowthIndicator = (
    value: number
  ): {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  } => {
    if (value >= 0) {
      return {
        icon: ArrowUpRight,
        color: "text-green-600 dark:text-green-400",
      };
    }
    return {
      icon: ArrowDownRight,
      color: "text-red-600 dark:text-red-400",
    };
  };

  /**
   * Format date range for display
   */
  const formattedDateRange = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return t("pages.reports.no_date_range");
    }
    return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
  }, [dateRange, formatDate, t]);

  /**
   * Render KPI cards based on report type
   */
  const renderKPICards = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (reportType === "revenue" && revenueReport) {
      const growthIndicator = getGrowthIndicator(revenueReport.growthRate);
      const GrowthIcon = growthIndicator.icon;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.total_revenue")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(revenueReport.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <GrowthIcon className={`h-4 w-4 ${growthIndicator.color}`} />
                    <span className={`text-sm font-medium ml-1 ${growthIndicator.color}`}>
                      {formatPercentage(Math.abs(revenueReport.growthRate))}
                    </span>
                  </div>
                </div>
                <DollarSign className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.total_bookings")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {revenueReport.totalBookings.toLocaleString("nb-NO")}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.average_value")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(revenueReport.averageBookingValue)}
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.growth_rate")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatPercentage(revenueReport.growthRate)}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === "bookings" && bookingReport) {
      const total = bookingReport.totalBookings;
      const { pending, confirmed } = bookingReport.statusBreakdown;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.total_bookings")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {total.toLocaleString("nb-NO")}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.confirmed")}
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {confirmed.toLocaleString("nb-NO")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {total > 0 ? formatPercentage((confirmed / total) * 100) : "0%"}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.pending")}
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {pending.toLocaleString("nb-NO")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {total > 0 ? formatPercentage((pending / total) * 100) : "0%"}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.conversion_rate")}
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {formatPercentage(bookingReport.averageConversionRate)}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === "utilization" && utilizationReport) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.overall_utilization")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatPercentage(utilizationReport.overallUtilization)}
                  </p>
                </div>
                <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.top_facilities")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {utilizationReport.topFacilities.length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.underutilized")}
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {utilizationReport.underutilizedFacilities.length}
                  </p>
                </div>
                <TrendingDown className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.total_facilities")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {utilizationReport.dataPoints.length}
                  </p>
                </div>
                <Building2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (reportType === "users" && userActivityReport) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.total_users")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {userActivityReport.totalUsers.toLocaleString("nb-NO")}
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.active_users")}
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {userActivityReport.activeUsers.toLocaleString("nb-NO")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {userActivityReport.totalUsers > 0
                      ? formatPercentage((userActivityReport.activeUsers / userActivityReport.totalUsers) * 100)
                      : "0%"}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.avg_bookings_per_user")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {userActivityReport.averageBookingsPerUser.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("pages.reports.kpi.avg_spend_per_user")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(userActivityReport.averageSpendPerUser)}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <div />;
  };

  return (
    <RequireRole minRole="admin">
      <SystemPageLayout
        title={t("pages.reports.title")}
        description={t("pages.reports.description")}
        secondaryActions={[
          {
            label: t("pages.reports.actions.download_csv"),
            icon: Download,
            onClick: exportToCSV,
          },
          {
            label: t("pages.reports.actions.download_pdf"),
            icon: Download,
            onClick: exportToPDF,
          },
        ]}
      >
        {/* Report Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("pages.reports.select_report_type")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isActive = reportType === type.value;

                return (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`p-4 border-2 rounded-lg transition-all hover:shadow-lg ${
                      isActive
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                    }`}
                    aria-label={`Select ${type.label} report`}
                  >
                    <div className="flex flex-col items-start gap-2">
                      <Icon
                        className={`h-6 w-6 ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                      <div className="text-left">
                        <p
                          className={`font-semibold ${
                            isActive
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Date Range and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("pages.reports.date_range.title")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? t("pages.reports.hide_filters") : t("pages.reports.show_filters")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date Range Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("pages.reports.selected_period")}:
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formattedDateRange}
                </span>
              </div>

              {/* Date Range Presets */}
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

              {/* Grouping Options */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("pages.reports.group_by")}:
                </span>
                <div className="flex gap-2">
                  {(["day", "week", "month", "year"] as const).map((group) => (
                    <Button
                      key={group}
                      variant={groupBy === group ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGroupBy(group)}
                      className="h-10"
                    >
                      {t(`pages.reports.grouping.${group}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {renderKPICards()}

        {/* Chart Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t(`pages.reports.chart_title.${reportType}`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {t("pages.reports.chart_placeholder")}
                  </p>
                  <p className="text-sm mt-2">
                    {t("pages.reports.chart_implementation_note")}
                  </p>
                  <div className="mt-4 text-xs text-left max-w-md mx-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold mb-2">
                      {t("pages.reports.chart_data_available")}:
                    </p>
                    <ul className="space-y-1">
                      {chartData.slice(0, 5).map((point, idx) => (
                        <li key={idx}>
                          {point.label}: {point.formattedValue}
                        </li>
                      ))}
                      {chartData.length > 5 && (
                        <li>... {t("pages.reports.and_more", { count: chartData.length - 5 })}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">{t("pages.reports.no_data")}</p>
                  <p className="text-sm mt-2">{t("pages.reports.no_data_description")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Data Table */}
        {reportType === "utilization" && utilizationReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("pages.reports.facility_details")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t("pages.reports.table.facility")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t("pages.reports.table.utilization")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t("pages.reports.table.bookings")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {t("pages.reports.table.revenue")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilizationReport.dataPoints.map((facility) => (
                      <tr
                        key={facility.facilityId}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {facility.facilityName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className={`h-full ${
                                  facility.utilizationRate >= 70
                                    ? "bg-green-600"
                                    : facility.utilizationRate >= 40
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                                }`}
                                style={{ width: `${Math.min(facility.utilizationRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatPercentage(facility.utilizationRate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {facility.bookingCount}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {formatCurrency(facility.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </SystemPageLayout>
    </RequireRole>
  );
};

export default ReportsPage;
