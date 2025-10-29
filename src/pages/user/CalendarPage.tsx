"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { EnhancedCalendar } from "@/components/features/calendar/components/EnhancedCalendar";
import { EventDetailsModal } from "@/components/features/calendar/components/EventDetailsModal";
import { useCalendarPageManagement } from "@/hooks/features/calendar";

/**
 * CalendarPage Component
 *
 * User calendar page displaying bookings in month/week/day views.
 * Follows clean architecture with all business logic in useCalendarPageManagement hook.
 */
export default function CalendarPage(): JSX.Element {
  const { t } = useTranslation('user');

  const {
    events,
    view,
    currentDate,
    selectedEvent,
    setView,
    setCurrentDate,
    setSelectedEvent,
    handleEventClick,
    handleEventEdit,
    handleEventDelete,
    handleEventCopy,
    handleEventShare,
    handleEventAddToCalendar,
  } = useCalendarPageManagement();

  return (
    <>
      <EnhancedCalendar
        events={events}
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

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          t={t}
        />
      )}
    </>
  );
}
