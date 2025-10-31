import { useQuery } from '@tanstack/react-query';
import { bookingsService } from '@/services/supabase/bookings.service';
import type { IHistoryQuery, IHistoryPage } from '@/types/history';
import type { IBooking } from '@/types/booking';

export const useHistory = (userId: string, query: IHistoryQuery) => {
  return useQuery({
    queryKey: ['history', userId, query],
    queryFn: async () => {
      // Get user's bookings
      const bookings = await bookingsService.getForUser(userId);
      
      // Convert bookings to history items
      const historyItems = bookings.map((booking: IBooking) => ({
        id: booking.id,
        facilityId: booking.facility_id,
        facilityName: `Facility ${booking.facility_id}`, // Placeholder - would need to fetch facility name
        title: 'Booking',
        start: booking.start_time,
        end: booking.end_time,
        status: booking.status as 'completed' | 'cancelled',
        totalPriceNok: 0, // Placeholder - would need to calculate from booking
        invoiceId: `INV-${booking.id}`,
        createdAt: new Date().toISOString() // Placeholder - would need to get from booking
      }));
      
      // Filter based on query parameters
      let filtered = historyItems;
      
      if (query.facilityIds && query.facilityIds.length > 0) {
        filtered = filtered.filter(item => query.facilityIds!.includes(item.facilityId));
      }
      
      if (query.statuses && query.statuses.length > 0) {
        filtered = filtered.filter(item => query.statuses!.includes(item.status));
      }
      
      if (query.text) {
        const searchText = query.text.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(searchText) ||
          item.facilityName.toLowerCase().includes(searchText)
        );
      }
      
      if (query.from) {
        filtered = filtered.filter(item => item.start >= query.from!);
      }
      
      if (query.to) {
        filtered = filtered.filter(item => item.start <= query.to!);
      }
      
      // Sort
      if (query.sort === "start_asc") {
        filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      } else {
        filtered.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
      }
      
      // Pagination
      const page = query.page || 1;
      const pageSize = query.pageSize || 25;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = filtered.slice(startIndex, endIndex);
      
      const result: IHistoryPage = {
        items: paginatedItems,
        total: filtered.length
      };
      
      return result;
    },
    enabled: !!userId,
  });
};

export const useExportHistory = (userId: string, query: IHistoryQuery) => {
  return useQuery({
    queryKey: ['history-export', userId, query],
    queryFn: async () => {
      const bookings = await bookingsService.getForUser(userId);
      
      // Convert bookings to history items
      const historyItems = bookings.map((booking: IBooking) => ({
        id: booking.id,
        facilityId: booking.facility_id,
        facilityName: `Facility ${booking.facility_id}`, // Placeholder - would need to fetch facility name
        title: 'Booking',
        start: booking.start_time,
        end: booking.end_time,
        status: booking.status as 'completed' | 'cancelled',
        totalPriceNok: 0, // Placeholder - would need to calculate from booking
        invoiceId: `INV-${booking.id}`,
        createdAt: new Date().toISOString() // Placeholder - would need to get from booking
      }));
      
      // Filter based on query parameters
      let filtered = historyItems;
      
      if (query.facilityIds && query.facilityIds.length > 0) {
        filtered = filtered.filter(item => query.facilityIds!.includes(item.facilityId));
      }
      
      if (query.statuses && query.statuses.length > 0) {
        filtered = filtered.filter(item => query.statuses!.includes(item.status));
      }
      
      if (query.text) {
        const searchText = query.text.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(searchText) ||
          item.facilityName.toLowerCase().includes(searchText)
        );
      }
      
      if (query.from) {
        filtered = filtered.filter(item => item.start >= query.from!);
      }
      
      if (query.to) {
        filtered = filtered.filter(item => item.start <= query.to!);
      }
      
      // Sort
      if (query.sort === "start_asc") {
        filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      } else {
        filtered.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
      }
      
      const headers = ["Dato", "Tid", "Lokale", "Aktivitet", "Varighet", "Status", "Sum", "Faktura"];
      const csvContent = [
        headers.join(","),
        ...filtered.map(item => [
          new Date(item.start).toLocaleDateString("nb-NO"),
          `${new Date(item.start).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}-${new Date(item.end).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`,
          item.facilityName,
          item.title,
          `${(new Date(item.end).getTime() - new Date(item.start).getTime()) / 3_600_000} t`,
          item.status,
          item.totalPriceNok ? `${item.totalPriceNok} kr` : "-",
          item.invoiceId || "-"
        ].join(","))
      ].join("\n");
      
      return new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    },
    enabled: false, // Only run when explicitly triggered
  });
};