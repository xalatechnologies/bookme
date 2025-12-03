"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/hooks";
import { useUserBookings, type BookingWithDetails } from "@/services/supabase/bookings.service";
import type { IBookingHistoryItem } from "@/types/history";
import type { IBookingEvent } from "@/types/calendar";
import { downloadICS } from "@/shared/export/ics";

/**
 * Extended history item with additional fields for display
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
  readonly handleDownloadReceipt: (item: IExtendedHistoryItem) => void;
}

/**
 * Map Supabase booking status to history status
 */
const mapBookingStatus = (status: string): "completed" | "cancelled" => {
  switch (status) {
    case "paid":
    case "completed":
      return "completed";
    case "cancelled":
    case "rejected":
      return "cancelled";
    default:
      return "completed"; // pending, awaiting_payment default to completed for display
  }
};

/**
 * Convert Supabase booking to history item format
 */
const convertBookingToHistoryItem = (booking: BookingWithDetails): IExtendedHistoryItem => {
  const startDate = new Date(booking.starts_at);
  const endDate = new Date(booking.ends_at);

  // Calculate duration in hours
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  // Format times
  const startTime = startDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const endTime = endDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Convert price from cents to NOK
  const totalPriceNok = booking.total_cents / 100;

  return {
    id: booking.id,
    facilityId: booking.facility_id,
    facilityName: booking.facility?.name || "Ukjent lokale",
    title: booking.notes || "Booking",
    start: booking.starts_at,
    end: booking.ends_at,
    startTime,
    endTime,
    duration: durationHours,
    status: mapBookingStatus(booking.status),
    totalPriceNok,
    purpose: booking.notes || "Ikke spesifisert",
    location: booking.facility?.name || "Ukjent lokale",
    isRecurring: booking.is_recurring,
    createdAt: booking.created_at,
    originalDate: startDate.toISOString().split("T")[0],
    originalTime: `${startTime}-${endTime}`,
  };
};

/**
 * Hook for managing booking history data and operations
 * Migrated from localStorage to Supabase backend
 */
export const useHistoryManagement = (): IUseHistoryManagementReturn => {
  const { user } = useAuth();

  // Fetch bookings from Supabase
  const { data: bookings = [], isLoading } = useUserBookings(user?.id || "", !!user?.id);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<string>("start_desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  /**
   * Convert and group booking data from Supabase
   */
  const rawData = useMemo(() => {
    try {
      if (!bookings || bookings.length === 0) {
        return [];
      }

      // Separate recurring and single bookings
      const recurringBookingsMap = new Map<string, BookingWithDetails[]>();
      const singleBookings: BookingWithDetails[] = [];

      bookings.forEach((booking) => {
        // Check if this is a recurring booking
        if (booking.is_recurring) {
          // For recurring bookings, we need to group them
          // If they have a recurring_booking_id, use that as the key
          // Otherwise, create a grouping key based on facility, purpose, and time pattern
          let key: string;
          if (booking.recurring_booking_id) {
            // Use the recurring booking ID as the grouping key
            key = booking.recurring_booking_id;
          } else {
            // Create a synthetic key for recurring bookings without an explicit ID
            // Group by facility, purpose, day of week, and time pattern
            const startDate = new Date(booking.starts_at);
            const endDate = new Date(booking.ends_at);
            const timePattern = `${startDate.getHours()}:${startDate.getMinutes()}-${endDate.getHours()}:${endDate.getMinutes()}`;
            const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Create a unique key based on the recurring pattern
            key = `recurring-${booking.facility_id}-${booking.notes || 'no-purpose'}-${dayOfWeek}-${timePattern}`;
          }
          
          if (!recurringBookingsMap.has(key)) {
            recurringBookingsMap.set(key, []);
          }
          recurringBookingsMap.get(key)!.push(booking);
        } else {
          // This is a single booking
          singleBookings.push(booking);
        }
      });

      // Convert single bookings to history format
      const singleHistoryItems: IExtendedHistoryItem[] = singleBookings.map(convertBookingToHistoryItem);

      // Convert recurring booking groups to history format
      const recurringHistoryItems: IExtendedHistoryItem[] = Array.from(recurringBookingsMap.entries()).map(
        ([recurringId, recurringBookings]) => {
          // Sort bookings by start date
          const sortedBookings = [...recurringBookings].sort(
            (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
          );

          const first = sortedBookings[0];
          const last = sortedBookings[sortedBookings.length - 1];

          // Calculate total price for all occurrences
          const totalPrice = recurringBookings.reduce((sum, booking) => sum + booking.total_cents / 100, 0);

          // Calculate total duration for recurring bookings
          const totalDuration = recurringBookings.reduce((sum, booking) => {
            const start = new Date(booking.starts_at);
            const end = new Date(booking.ends_at);
            const durationMs = end.getTime() - start.getTime();
            return sum + durationMs / (1000 * 60 * 60);
          }, 0);

          // Determine group status (all must be same for group to have that status)
          const statuses = recurringBookings.map((b) => b.status);
          const allCompleted = statuses.every((s) => s === "paid" || s === "completed");
          const allCancelled = statuses.every((s) => s === "cancelled" || s === "expired" || s === "refunded");
          const groupStatus: "completed" | "cancelled" = allCompleted
            ? "completed"
            : allCancelled
            ? "cancelled"
            : "completed"; // Mixed status defaults to completed

          const firstStart = new Date(first.starts_at);
          const firstStartTime = firstStart.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          const firstEnd = new Date(first.ends_at);
          const firstEndTime = firstEnd.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

          const lastEnd = new Date(last.ends_at);
          const lastEndTime = lastEnd.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

          // Create a descriptive title for the recurring booking
          const title = first.notes 
            ? `${first.notes} (${recurringBookings.length} forekomster)` 
            : `Gjentakende booking (${recurringBookings.length} forekomster)`;

          return {
            id: recurringId, // Use the recurring booking ID or synthetic key as the group ID
            facilityId: first.facility_id,
            facilityName: first.facility?.name || "Ukjent lokale",
            title: title,
            start: first.starts_at,
            end: last.ends_at,
            startTime: firstStartTime,
            endTime: lastEndTime,
            duration: totalDuration,
            status: groupStatus,
            totalPriceNok: totalPrice,
            purpose: first.notes || "Ikke spesifisert",
            location: first.facility?.name || "Ukjent lokale",
            isRecurring: true,
            occurrenceCount: recurringBookings.length,
            createdAt: first.created_at,
            originalDate: firstStart.toISOString().split("T")[0],
            originalTime: `${firstStartTime}-${firstEndTime}`,
            occurrences: sortedBookings.map((booking) => {
              const bookingStart = new Date(booking.starts_at);
              const bookingStartTime = bookingStart.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return {
                id: booking.id,
                date: bookingStart.toISOString().split("T")[0],
                time: bookingStartTime,
                status: booking.status,
              };
            }),
          };
        }
      );

      // Combine single and recurring items
      const allHistoryItems = [...singleHistoryItems, ...recurringHistoryItems];

      return allHistoryItems;
    } catch (error) {
      console.error("Error processing booking data:", error);
      return [];
    }
  }, [bookings]);

  /**
   * Get unique facilities list from booking data
   */
  const facilities = useMemo(() => {
    const uniqueFacilities = [...new Set(rawData.map((booking) => booking.facilityName))];
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
      filtered = filtered.filter(
        (item) =>
          item.facilityName.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.purpose?.toLowerCase().includes(query)
      );
    }

    // Apply facility filter
    if (selectedFacility !== "all") {
      filtered = filtered.filter((item) => item.facilityName === selectedFacility);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => {
        if (selectedStatus === "completed") return item.status === "completed";
        if (selectedStatus === "cancelled") return item.status === "cancelled";
        return true;
      });
    }

    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((item) => new Date(item.start) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter((item) => new Date(item.start) <= toDate);
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
    const cancellations = historyItems.filter((item) => item.status === "cancelled").length;

    return { totalBookings, totalHours, totalSpent, cancellations };
  }, [historyItems]);

  /**
   * Export booking history to CSV
   */
  const handleExportCsv = useCallback(async (): Promise<void> => {
    try {
      const csvContent = [
        "Dato,Tid,Lokale,Aktivitet,Varighet,Status,Sum,Faktura",
        ...historyItems.map((item) =>
          [
            new Date(item.start).toLocaleDateString("nb-NO"),
            `${new Date(item.start).toLocaleTimeString("nb-NO", {
              hour: "2-digit",
              minute: "2-digit",
            })}-${new Date(item.end).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`,
            item.facilityName,
            item.title,
            `${item.duration?.toFixed(1) || "1.0"} t`,
            item.status,
            item.totalPriceNok ? `${item.totalPriceNok} kr` : "-",
            item.invoiceId || "-",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booknor-history-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
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
      status: item.status === "completed" ? "confirmed" : item.status === "cancelled" ? "cancelled" : "pending",
    };
    downloadICS(event);
  }, []);

  /**
   * Download receipt PDF for a booking
   */
  const handleDownloadReceipt = useCallback((item: IExtendedHistoryItem): void => {
    try {
      // Create receipt content
      const receiptContent = `
==============================================
               KVITTERING / RECEIPT
==============================================

Booking ID: ${item.id}
Dato: ${new Date(item.start).toLocaleDateString('nb-NO')}
Tid: ${item.startTime || 'N/A'} - ${item.endTime || 'N/A'}

Lokale: ${item.facilityName}
Formål: ${item.purpose || 'Ikke spesifisert'}
Varighet: ${item.duration?.toFixed(1) || '1.0'} timer

Status: ${item.status === 'completed' ? 'Bekreftet' : 'Kansellert'}
Sum: ${item.totalPriceNok?.toLocaleString('nb-NO') || '0'} kr
${item.invoiceId ? `Faktura ID: ${item.invoiceId}` : ''}

${item.isRecurring ? `Type: Gjentakende booking\nAntall forekomster: ${item.occurrenceCount || 0}\n` : ''}

Opprettet: ${new Date(item.createdAt).toLocaleDateString('nb-NO')}

==============================================
              Takk for din bestilling!
              Thank you for your booking!
==============================================
      `;

      // Create blob and download
      const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kvittering-${item.id}-${new Date(item.start).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  }, []);

  /**
   * Toggle row expansion for detailed view
   */
  const toggleRowExpansion = useCallback((itemId: string): void => {
    setExpandedRow((prev) => (prev === itemId ? null : itemId));
  }, []);

  return {
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
    handleDownloadReceipt,
  };
};