"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
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
  ChevronRight,
  Repeat
} from "lucide-react";
import { useHistoryManagement } from "@/hooks/features/history/useHistoryManagement";
import { BookingDetailsPanel } from "@/components/features/bookings/components/BookingCard/BookingDetailsPanel";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";

/**
 * History page component - displays user's booking history with filters and export options
 * Clean architecture: All business logic extracted to useHistoryManagement hook
 */
export default function HistoryPage(): JSX.Element {
  const { t } = useTranslation('user');
  
  // Local state for details panel
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  
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
    handleDownloadICS,
    handleDownloadReceipt
  } = useHistoryManagement();

  // Handle view booking details
  const handleViewBooking = (item: any) => {
    // Convert history item to BookingWithDetails format
    const bookingDetails: BookingWithDetails = {
      id: item.id,
      user_id: '', // Not needed for display
      facility_id: item.facilityId,
      starts_at: item.start,
      ends_at: item.end,
      total_cents: Math.round((item.totalPriceNok || 0) * 100),
      status: item.status === 'completed' ? 'paid' : 'cancelled',
      notes: item.purpose || item.title,
      created_at: item.createdAt,
      updated_at: item.createdAt,
      currency: 'NOK',
      is_recurring: item.isRecurring || false,
      zone_id: null,
      group_id: null,
      org_id: '',
      facility: {
        id: item.facilityId,
        name: item.facilityName,
        org_id: '',
        created_at: '',
        updated_at: '',
      },
    };
    
    setSelectedBooking(bookingDetails);
    setShowDetailsPanel(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsPanel(false);
    setSelectedBooking(null);
  };

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
        <PrimaryButton
          onClick={handleExportCsv}
          className="flex items-center gap-2"
          aria-label={t('pages.history.export')}
        >
          <Download className="w-4 h-4" />
          {t('pages.history.export')}
        </PrimaryButton>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.history.kpis.bookings')}</p>
                <p className="text-2xl font-bold dark:text-white">{kpis.totalBookings}</p>
              </div>
              <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.history.kpis.hours_used')}</p>
                <p className="text-2xl font-bold dark:text-white">{kpis.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.history.kpis.total_spent')}</p>
                <p className="text-2xl font-bold dark:text-white">{kpis.totalSpent.toLocaleString()} kr</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pages.history.kpis.cancellations')}</p>
                <p className="text-2xl font-bold dark:text-white">{kpis.cancellations}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600 dark:text-red-400" />
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
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('pages.history.loading')}</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('pages.history.empty.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('pages.history.empty.description')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
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
                        className="border-t border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => toggleRowExpansion(item.id)}
                      >
                        <td className="px-4 py-3">
                          {item.isRecurring ? (
                            // For recurring bookings, show the period range vertically with arrow
                            <div className="flex flex-col items-start">
                              <div>{item.originalDate ?
                                new Date(item.originalDate).toLocaleDateString('nb-NO') :
                                new Date(item.start).toLocaleDateString('nb-NO')
                              }</div>
                              <div className="my-1 pl-5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              </div>
                              <div>{new Date(item.end).toLocaleDateString('nb-NO')}</div>
                            </div>
                          ) : (
                            // For single bookings, show the single date
                            <div className="flex items-start">
                              {item.originalDate ?
                                new Date(item.originalDate).toLocaleDateString('nb-NO') :
                                (() => {
                                  // Handle date display carefully to avoid timezone issues
                                  const dateStr = item.start.split('T')[0]; // Get YYYY-MM-DD part
                                  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                    // Parse as local date
                                    const [year, month, day] = dateStr.split('-').map(Number);
                                    const localDate = new Date(year, month - 1, day);
                                    return localDate.toLocaleDateString('nb-NO');
                                  } else {
                                    // Fallback
                                    return new Date(item.start).toLocaleDateString('nb-NO');
                                  }
                                })()
                              }
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.startTime && item.endTime ?
                            `${item.startTime} - ${item.endTime}` :
                            `${new Date(item.start).toLocaleTimeString('nb-NO', {
                            hour: "2-digit",
                            minute: "2-digit"
                            })} - ${new Date(item.end).toLocaleTimeString('nb-NO', {
                            hour: "2-digit",
                            minute: "2-digit"
                            })}`
                          }
                        </td>
                        <td className="px-4 py-3">{item.facilityName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.isRecurring && (
                              <Repeat className="w-4 h-4 text-blue-500" />
                            )}
                            <span>{item.purpose || item.title || t('pages.history.table.activity')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.duration ? `${item.duration.toFixed(1)} t` : '1.0 t'}
                          {item.isRecurring && item.occurrenceCount && (
                            <span className="text-xs text-gray-500 block">
                              {item.occurrenceCount} forekomster
                            </span>
                          )}
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
                                handleViewBooking(item);
                              }}
                              aria-label={t('pages.history.table.actions')}
                              title="Se detaljer"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReceipt(item);
                              }}
                              aria-label="Last ned kvittering"
                              title="Last ned kvittering"
                            >
                              <FileText className="w-4 h-4" />
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
                        <tr className="border-t border-gray-200 bg-gray-50 dark:bg-gray-800">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">{t('pages.history.details.created_at')}:</span>
                                  <span className="ml-2 dark:text-white">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {item.invoiceId && (
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">{t('pages.history.details.invoice_id')}:</span>
                                    <span className="ml-2 dark:text-white">{item.invoiceId}</span>
                                  </div>
                                )}
                                {item.isRecurring && item.occurrenceCount && (
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Antall forekomster:</span>
                                    <span className="ml-2 dark:text-white">{item.occurrenceCount}</span>
                                  </div>
                                )}
                                {item.isRecurring && (
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                    <span className="ml-2 dark:text-white">Gjentakende booking</span>
                                  </div>
                                )}
                              </div>

                              {item.isRecurring && item.occurrences && item.occurrences.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Forekomster:</h4>
                                  <div className="max-h-40 overflow-y-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                          <th className="px-2 py-1 text-left dark:text-white">Dato</th>
                                          <th className="px-2 py-1 text-left dark:text-white">Tid</th>
                                          <th className="px-2 py-1 text-left dark:text-white">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {item.occurrences.map((occurrence, idx) => (
                                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-2 py-1 dark:text-white">{new Date(occurrence.date).toLocaleDateString('nb-NO')}</td>
                                            <td className="px-2 py-1 dark:text-white">{occurrence.time}</td>
                                            <td className="px-2 py-1">
                                              <Badge className={
                                                occurrence.status === "completed"
                                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                              }>
                                                {occurrence.status === "completed" ? t('pages.history.status.confirmed') : t('pages.history.status.rejected')}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
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

      {/* Booking Details Panel */}
      {showDetailsPanel && selectedBooking && (
        <BookingDetailsPanel
          booking={selectedBooking}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}