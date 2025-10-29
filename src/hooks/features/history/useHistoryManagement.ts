"use client";

import { useState, useMemo, useCallback } from "react";
import type { IBookingHistoryItem } from "@/types/history";
import type { IBookingEvent } from "@/types/calendar";
import { downloadICS } from "@/shared/export/ics";

/**
 * Extended history item with additional fields for localStorage data
 */
interface IExtendedHistoryItem extends IBookingHistoryItem {
  readonly startTime?: string;
  readonly endTime?: string;
  readonly duration?: number;
  readonly purpose?: string;
  readonly location?: string;
  readonly originalDate?: string;
  readonly originalTime?: string;
  readonly isRecurring?: boolean;
  readonly occurrenceCount?: number;
  readonly occurrences?: readonly {
    readonly id: string;
    readonly date: string;
    readonly time: string;
    readonly status: string;
  }[];
}

/**
 * KPI metrics for history page
 */
interface IHistoryKPIs {
  readonly totalBookings: number;
  readonly totalHours: number;
  readonly totalSpent: number;
  readonly cancellations: number;
}

/**
 * Return type for useHistoryManagement hook
 */
export interface IUseHistoryManagementReturn {
  readonly historyItems: readonly IExtendedHistoryItem[];
  readonly kpis: IHistoryKPIs;
  readonly facilities: readonly string[];
  readonly isLoading: boolean;
  readonly searchQuery: string;
  readonly selectedFacility: string;
  readonly selectedStatus: string;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly sortBy: string;
  readonly expandedRow: string | null;
  readonly setSearchQuery: (query: string) => void;
  readonly setSelectedFacility: (facility: string) => void;
  readonly setSelectedStatus: (status: string) => void;
  readonly setDateFrom: (date: string) => void;
  readonly setDateTo: (date: string) => void;
  readonly setSortBy: (sort: string) => void;
  readonly toggleRowExpansion: (id: string) => void;
  readonly handleExportCsv: () => Promise<void>;
  readonly handleDownloadICS: (item: IExtendedHistoryItem) => void;
}

/**
 * Hook for managing booking history data and operations
 * Extracts all business logic from HistoryPage component
 */
export const useHistoryManagement = (): IUseHistoryManagementReturn => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<string>("start_desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  /**
   * Load and group booking data from localStorage
   */
  const rawData = useMemo(() => {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const processed = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const all = [...pending, ...processed];

      // Group recurring bookings by parentBookingId or fallback key
      const groupedRecurring = new Map<string, any[]>();
      const singleBookings: any[] = [];

      all.forEach((booking: any) => {
        const parentKey = booking.parentBookingId ||
          `${booking.facility || booking.facilityName}-${booking.purpose}-${booking.time || booking.startTime}`;

        if (booking.isRecurring || booking.bookingType === 'recurring') {
          if (!groupedRecurring.has(parentKey)) {
            groupedRecurring.set(parentKey, []);
          }
          groupedRecurring.get(parentKey)!.push(booking);
        } else {
          singleBookings.push(booking);
        }
      });

      // Convert single bookings to history format
      const singleHistoryItems: IExtendedHistoryItem[] = singleBookings.map((booking: any) => {
        // Handle different date/time formats
        let startDate: string;
        let endDate: string;

        if (booking.startDate && booking.startTime) {
          startDate = new Date(booking.startDate + 'T' + booking.startTime).toISOString();
        } else if (booking.date && booking.time) {
          const [startTime] = booking.time.split('-');
          startDate = new Date(booking.date + 'T' + startTime).toISOString();
        } else {
          startDate = new Date().toISOString();
        }

        if (booking.endTime) {
          endDate = new Date(booking.startDate + 'T' + booking.endTime).toISOString();
        } else if (booking.time) {
          const [, endTime] = booking.time.split('-');
          endDate = new Date(booking.date + 'T' + endTime).toISOString();
        } else {
          endDate = new Date(startDate).toISOString();
        }

        // Calculate duration from booking data
        let durationHours = 1; // Default to 1 hour
        if (booking.duration) {
          // If duration is in minutes, convert to hours
          durationHours = typeof booking.duration === 'number' ? booking.duration / 60 : 1;
        } else if (booking.time) {
          // Calculate from time range if duration not available
          const [startTime, endTime] = booking.time.split('-');
          const [startH, startM] = startTime.split(':').map(Number);
          const [endH, endM] = endTime.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          durationHours = (endMinutes - startMinutes) / 60;
        }

        const status = booking.status === 'approved' ? 'confirmed' :
                      booking.status === 'rejected' ? 'rejected' :
                      'pending';

        return {
          id: booking.id,
          facilityId: booking.facilityId || booking.id,
          facilityName: booking.facilityName || booking.facility || 'Ukjent lokale',
          title: booking.purpose || 'Ikke spesifisert',
          start: startDate,
          end: endDate,
          startTime: booking.startTime || booking.time?.split('-')[0] || '09:00',
          endTime: booking.endTime || booking.time?.split('-')[1] || '10:00',
          duration: durationHours,
          status: status as "completed" | "cancelled",
          totalPriceNok: parseFloat(booking.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0'),
          purpose: booking.purpose || 'Ikke spesifisert',
          location: booking.facilityName || booking.facility || 'Ukjent lokale',
          isRecurring: false,
          createdAt: booking.createdAt || new Date().toISOString(),
          originalDate: booking.startDate || booking.date,
          originalTime: booking.time || `${booking.startTime || '09:00'}-${booking.endTime || '10:00'}`
        };
      });

      // Convert recurring booking groups to history format
      const recurringHistoryItems: IExtendedHistoryItem[] = Array.from(groupedRecurring.entries()).map(([parentKey, bookings]) => {
        const first = bookings[0];
        const last = bookings[bookings.length - 1];

        // Calculate total price for all occurrences
        const totalPrice = bookings.reduce((sum, booking) => {
          return sum + parseFloat(booking.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
        }, 0);

        // Determine group status
        const statuses = bookings.map(b => b.status);
        const groupStatus = statuses.every(s => s === 'approved') ? 'confirmed' :
                           statuses.every(s => s === 'rejected') ? 'rejected' : 'pending';

        // Calculate total duration for recurring bookings
        const totalDuration = bookings.reduce((sum, booking) => {
          let durationHours = 1;
          if (booking.duration) {
            durationHours = typeof booking.duration === 'number' ? booking.duration / 60 : 1;
          } else if (booking.time) {
            const [startTime, endTime] = booking.time.split('-');
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            durationHours = (endMinutes - startMinutes) / 60;
          }
          return sum + durationHours;
        }, 0);

        return {
          id: parentKey,
          facilityId: first.facilityId || first.id,
          facilityName: first.facilityName || first.facility || 'Ukjent lokale',
          title: first.purpose || 'Ikke spesifisert',
          start: new Date(first.startDate || first.date).toISOString(),
          end: new Date(last.startDate || last.date).toISOString(),
          startTime: first.startTime || first.time?.split('-')[0] || '09:00',
          endTime: last.endTime || last.time?.split('-')[1] || '10:00',
          duration: totalDuration,
          status: groupStatus as "completed" | "cancelled",
          totalPriceNok: totalPrice,
          purpose: first.purpose || 'Ikke spesifisert',
          location: first.facilityName || first.facility || 'Ukjent lokale',
          isRecurring: true,
          occurrenceCount: bookings.length,
          createdAt: first.createdAt || new Date().toISOString(),
          originalDate: first.startDate || first.date,
          originalTime: first.time || `${first.startTime || '09:00'}-${first.endTime || '10:00'}`,
          occurrences: bookings.map(booking => ({
            id: booking.id,
            date: booking.startDate || booking.date,
            time: booking.startTime || booking.time,
            status: booking.status
          }))
        };
      });

      // Combine single and recurring items
      const allHistoryItems = [...singleHistoryItems, ...recurringHistoryItems];

      return allHistoryItems;
    } catch (error) {
      console.error('Error loading history data:', error);
      return [];
    }
  }, []);

  /**
   * Get unique facilities list from booking data
   */
  const facilities = useMemo(() => {
    const uniqueFacilities = [...new Set(rawData.map(booking => booking.facilityName))];
    return uniqueFacilities.filter(Boolean);
  }, [rawData]);

  /**
   * Apply filters and sorting to history items
   */
  const historyItems = useMemo(() => {
    let filtered = [...rawData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.facilityName.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.purpose?.toLowerCase().includes(query)
      );
    }

    // Apply facility filter
    if (selectedFacility !== "all") {
      filtered = filtered.filter(item => item.facilityName === selectedFacility);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(item => {
        if (selectedStatus === "completed") return item.status === "confirmed";
        if (selectedStatus === "cancelled") return item.status === "rejected" || item.status === "cancelled";
        return true;
      });
    }

    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(item => new Date(item.start) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter(item => new Date(item.start) <= toDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.start).getTime();
      const dateB = new Date(b.start).getTime();
      return sortBy === "start_desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [rawData, searchQuery, selectedFacility, selectedStatus, dateFrom, dateTo, sortBy]);

  /**
   * Calculate KPI metrics
   */
  const kpis = useMemo((): IHistoryKPIs => {
    const totalBookings = historyItems.length;
    const totalHours = historyItems.reduce((sum, item) => sum + (item.duration || 1), 0);
    const totalSpent = historyItems.reduce((sum, item) => sum + (item.totalPriceNok || 0), 0);
    const cancellations = historyItems.filter(item =>
      item.status === "rejected" || item.status === "cancelled"
    ).length;

    return { totalBookings, totalHours, totalSpent, cancellations };
  }, [historyItems]);

  /**
   * Export booking history to CSV
   */
  const handleExportCsv = useCallback(async (): Promise<void> => {
    try {
      const csvContent = [
        "Dato,Tid,Lokale,Aktivitet,Varighet,Status,Sum,Faktura",
        ...historyItems.map(item => [
          new Date(item.start).toLocaleDateString("nb-NO"),
          `${new Date(item.start).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}-${new Date(item.end).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`,
          item.facilityName,
          item.title,
          `${item.duration?.toFixed(1) || '1.0'} t`,
          item.status,
          item.totalPriceNok ? `${item.totalPriceNok} kr` : "-",
          item.invoiceId || "-"
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookme-history-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  }, [historyItems]);

  /**
   * Download ICS calendar file for a booking
   */
  const handleDownloadICS = useCallback((item: IExtendedHistoryItem): void => {
    const event: IBookingEvent = {
      id: item.id,
      facilityId: item.facilityId,
      facilityName: item.facilityName,
      title: item.title,
      start: item.start,
      end: item.end,
      status: item.status === "confirmed" ? "confirmed" :
              item.status === "cancelled" ? "cancelled" : "pending"
    };
    downloadICS(event);
  }, []);

  /**
   * Toggle row expansion for detailed view
   */
  const toggleRowExpansion = useCallback((itemId: string): void => {
    setExpandedRow(prev => prev === itemId ? null : itemId);
  }, []);

  return {
    historyItems,
    kpis,
    facilities,
    isLoading: false, // No loading state needed for localStorage
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
  };
};
