"use client";

import React, { useMemo, useState } from "react";
import { EnhancedCalendar } from "@/components/calendar/EnhancedCalendar";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import type { IBookingEvent, TBookingStatus } from "@/types/calendar";

export default function CalendarPage(): JSX.Element {
  const [selectedEvent, setSelectedEvent] = useState<IBookingEvent | null>(null);
  const [view, setView] = useState<'month'|'week'|'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const range = useMemo(() => {
    if (view === 'week') {
      return {
        from: startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
      };
    }
    if (view === 'day') {
      return {
        from: startOfDay(currentDate).toISOString(),
        to: endOfDay(currentDate).toISOString(),
      };
    }
    // month default
    return {
      from: startOfMonth(currentDate).toISOString(),
      to: endOfMonth(currentDate).toISOString(),
    };
  }, [view, currentDate]);

  const query = useMemo(() => ({
    from: range.from,
    to: range.to
  }), [range]);

  // Build calendar events directly from the same data-kilde as "Mine bookinger"
  const data: IBookingEvent[] = useMemo(() => {
    try {
      const pending: readonly unknown[] = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const processed: readonly unknown[] = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const all = [...pending, ...processed];
      const events = all.map((b: unknown) => {
        if (typeof b !== 'object' || b === null) {
          return null;
        }
        const booking = b as Record<string, unknown>;
        // b.date === 'YYYY-MM-DD', b.time === 'HH:MM-HH:MM'
        const timeStr = (booking.time as string | undefined) || '09:00-10:00';
        const [startTime, endTime] = timeStr.split('-');
        const [startH, startM] = (startTime || '09:00').split(':').map((n: string) => parseInt(n, 10));
        const [endH, endM] = (endTime || '10:00').split(':').map((n: string) => parseInt(n, 10));
        const dateStr = (booking.date as string | undefined) || new Date().toISOString().split('T')[0];
        const [y, m, d] = dateStr.split('-').map((n: string) => parseInt(n, 10));
        const start = new Date(y, (m || 1) - 1, d || 1, startH, startM, 0, 0);
        const end = new Date(y, (m || 1) - 1, d || 1, endH, endM, 0, 0);
        // Map status correctly to match user bookings page
        const bookingStatus = (booking.status as string | undefined) || 'pending';
        let mappedStatus: TBookingStatus = 'pending';
        if (bookingStatus === 'approved' || bookingStatus === 'confirmed') {
          mappedStatus = 'confirmed';
        } else if (bookingStatus === 'rejected' || bookingStatus === 'cancelled') {
          mappedStatus = 'cancelled';
        } else if (bookingStatus === 'pending') {
          mappedStatus = 'pending';
        }
        
        return {
          id: (booking.id as string | undefined) || 'unknown',
          facilityId: (booking.facilityId as string | undefined) || '1',
          facilityName: (booking.facility as string | undefined) || (booking.facilityName as string | undefined) || 'Ukjent lokale',
          title: (booking.purpose as string | undefined) || 'Booking',
          start: start.toISOString(),
          end: end.toISOString(),
          status: mappedStatus,
          priceNok: undefined,
          tags: undefined
        };
      }).filter((event): event is NonNullable<typeof event> => event !== null);
      // Filter by current view range (simple month range for nå)
      const from = new Date(query.from);
      const to = new Date(query.to);
      return events.filter((e): e is NonNullable<typeof e> => e !== null).filter(e => {
        const s = new Date(e.start);
        return s >= from && s <= to;
      });
    } catch {
      return [] as IBookingEvent[];
    }
  }, [query]);

  const handleEventClick = (event: IBookingEvent): void => {
    setSelectedEvent(event);
  };

  const handleEventEdit = (event: IBookingEvent): void => {
    setSelectedEvent(null); // Close modal
    // Implement edit functionality
  };

  const handleEventDelete = (event: IBookingEvent): void => {
    setSelectedEvent(null); // Close modal
    // Implement delete functionality
  };

  const handleEventCopy = (event: IBookingEvent): void => {
    // Implement copy functionality
  };

  const handleEventShare = (event: IBookingEvent): void => {
    // Implement share functionality
  };

  const handleEventAddToCalendar = (event: IBookingEvent): void => {
    // Implement add to calendar functionality
  };


  // Ingen eksplisitt lastestatus – vi leser direkte fra localStorage

  return (
    <>
      <EnhancedCalendar
        events={data}
        onEventClick={handleEventClick}
        onEventEdit={handleEventEdit}
        onEventDelete={handleEventDelete}
        onEventCopy={handleEventCopy}
        onEventShare={handleEventShare}
        onEventAddToCalendar={handleEventAddToCalendar}
        className="w-full"
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lokale:</span>
                  <span className="text-gray-900 dark:text-white">{selectedEvent.facilityName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dato:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedEvent.start).toLocaleDateString("nb-NO", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tid:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(selectedEvent.start).toLocaleTimeString("nb-NO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })} - {new Date(selectedEvent.end).toLocaleTimeString("nb-NO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedEvent.status === "confirmed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    selectedEvent.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {selectedEvent.status === "confirmed" ? "Bekreftet" :
                     selectedEvent.status === "pending" ? "Ventende" : "Avlyst"}
                  </span>
                </div>
                
                {/* Prisinformasjon er ikke lenger tilgjengelig i den nye strukturen */}
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleEventEdit(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Rediger
                </button>
                <button
                  onClick={() => handleEventDelete(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Slett
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}