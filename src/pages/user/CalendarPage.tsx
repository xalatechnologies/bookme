"use client";

import React, { useMemo, useState } from "react";
import { EnhancedCalendar } from "@/components/calendar/EnhancedCalendar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { startOfMonth, endOfMonth } from "date-fns";
import type { IBookingEvent } from "@/types/calendar";

export default function CalendarPage(): JSX.Element {
  const [selectedEvent, setSelectedEvent] = useState<IBookingEvent | null>(null);

  const range = useMemo(() => {
    const now = new Date();
    return {
      from: startOfMonth(now).toISOString(),
      to: endOfMonth(now).toISOString()
    };
  }, []);

  const query = useMemo(() => ({
    from: range.from,
    to: range.to
  }), [range]);

  const { data = [], isLoading } = useCalendarEvents(query);

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


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Laster kalender...</div>
      </div>
    );
  }

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
                    {new Date(selectedEvent.start).toLocaleDateString("nb-NO")}
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
                
                {selectedEvent.priceNok && selectedEvent.priceNok > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pris:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selectedEvent.priceNok} kr
                    </span>
                  </div>
                )}
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