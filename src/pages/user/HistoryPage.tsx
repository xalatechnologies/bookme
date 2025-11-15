"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  History,
  Search,
  Download,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useHistoryManagement } from "@/hooks/features/history/useHistoryManagement";

/**
 * History page component - displays user's booking history with filters and export options
 * Clean architecture: All business logic extracted to useHistoryManagement hook
 */
export default function HistoryPage(): JSX.Element {
  const { t } = useTranslation('user');
  
  const {
    historyItems,
    kpis,
    facilities,
    isLoading,
    searchQuery,
    selectedFacility,
    selectedStatus,
    dateFrom,
    dateTo,
    sortBy,
    expandedRow,
    setSearchQuery,
    setSelectedFacility,
    setSelectedStatus,
    setDateFrom,
    setDateTo,
    setSortBy,
    toggleRowExpansion,
    handleExportCsv,
    handleDownloadICS
  } = useHistoryManagement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('pages.history.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('pages.history.subtitle')}
          </p>
        </div>
        <Button
          onClick={handleExportCsv}
          className="flex items-center gap-2"
          aria-label={t('pages.history.export')}
        >
          <Download className="w-4 h-4" />
          {t('pages.history.export')}
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('pages.history.kpis.bookings')}</p>
                <p className="text-2xl font-bold">{kpis.totalBookings}</p>
              </div>
              <History className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('pages.history.kpis.hours_used')}</p>
                <p className="text-2xl font-bold">{kpis.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('pages.history.kpis.total_spent')}</p>
                <p className="text-2xl font-bold">{kpis.totalSpent.toLocaleString()} kr</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('pages.history.kpis.cancellations')}</p>
                <p className="text-2xl font-bold">{kpis.cancellations}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('pages.history.filters.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label={t('pages.history.filters.search_placeholder')}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                type="date"
                placeholder={t('pages.history.filters.from_date')}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
                aria-label={t('pages.history.filters.from_date')}
              />
              <Input
                type="date"
                placeholder={t('pages.history.filters.to_date')}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
                aria-label={t('pages.history.filters.to_date')}
              />
            </div>

            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger className="w-48" aria-label={t('pages.history.filters.select_facility')}>
                <SelectValue placeholder={t('pages.history.filters.select_facility')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pages.history.filters.all_facilities')}</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48" aria-label={t('pages.history.filters.select_status')}>
                <SelectValue placeholder={t('pages.history.filters.select_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pages.history.filters.all_statuses')}</SelectItem>
                <SelectItem value="completed">{t('pages.history.filters.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('pages.history.filters.cancelled')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" aria-label={t('pages.history.filters.sort')}>
                <SelectValue placeholder={t('pages.history.filters.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start_desc">{t('pages.history.filters.newest_first')}</SelectItem>
                <SelectItem value="start_asc">{t('pages.history.filters.oldest_first')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.history.table.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('pages.history.loading')}</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('pages.history.empty.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('pages.history.empty.description')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.date')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.time')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.facility')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.activity')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.duration')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.status')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.total')}</th>
                    <th className="px-4 py-3 font-medium">{t('pages.history.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRowExpansion(item.id)}
                      >
                        <td className="px-4 py-3">
                          {item.originalDate ?
                            new Date(item.originalDate).toLocaleDateString() :
                            (() => {
                              // Handle date display carefully to avoid timezone issues
                              const dateStr = item.start.split('T')[0]; // Get YYYY-MM-DD part
                              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                // Parse as local date
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const localDate = new Date(year, month - 1, day);
                                return localDate.toLocaleDateString();
                              } else {
                                // Fallback
                                return new Date(item.start).toLocaleDateString();
                              }
                            })()
                          }
                        </td>
                        <td className="px-4 py-3">
                          {item.startTime && item.endTime ?
                            `${item.startTime} - ${item.endTime}` :
                            `${new Date(item.start).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit"
                            })} - ${new Date(item.end).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit"
                            })}`
                          }
                        </td>
                        <td className="px-4 py-3">{item.facilityName}</td>
                        <td className="px-4 py-3">{item.purpose || item.title || t('pages.history.table.activity')}</td>
                        <td className="px-4 py-3">
                          {item.duration ? `${item.duration.toFixed(1)} t` : '1.0 t'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }>
                            {item.status === "completed" ? t('pages.history.status.confirmed') : t('pages.history.status.rejected')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {item.totalPriceNok ? `${item.totalPriceNok.toLocaleString()} kr` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              aria-label={t('pages.history.table.actions')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadICS(item);
                              }}
                              aria-label={t('pages.history.details.add_to_calendar')}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            {expandedRow === item.id ? (
                              <ChevronDown className="w-4 h-4" aria-label={t('pages.history.table.actions')} />
                            ) : (
                              <ChevronRight className="w-4 h-4" aria-label={t('pages.history.table.actions')} />
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Details */}
                      {expandedRow === item.id && (
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">{t('pages.history.details.created_at')}:</span>
                                  <span className="ml-2">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {item.invoiceId && (
                                  <div>
                                    <span className="text-gray-600">{t('pages.history.details.invoice_id')}:</span>
                                    <span className="ml-2">{item.invoiceId}</span>
                                  </div>
                                )}
                                {item.isRecurring && item.occurrenceCount && (
                                  <div>
                                    <span className="text-gray-600">{t('pages.history.details.invoice_id')}:</span>
                                    <span className="ml-2">{item.occurrenceCount} {t('pages.history.details.invoice_id')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <FileText className="w-4 h-4 mr-2" />
                                  {t('pages.history.details.download_receipt')}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  {t('pages.history.details.rebook')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadICS(item);
                                  }}
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {t('pages.history.details.add_to_calendar')}
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}