"use client";

// External imports
import React from "react";
import { format, addDays } from "date-fns";

// Internal imports
import type {
  Zone,
  SelectedTimeSlot,
  AvailabilityStatus,
} from "@/types/booking";
import { useCalendarGridDragSelection } from "@/hooks/features/calendar/useCalendarGridDragSelection";

// Sibling imports
import { Card, CardContent } from "@/components/ui/card";

interface CalendarGridProps {
  readonly zone: Zone;
  readonly currentWeekStart: Date;
  readonly timeSlots: readonly string[];
  readonly selectedSlots: readonly SelectedTimeSlot[];
  readonly getAvailabilityStatus: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => AvailabilityStatus;
  readonly isSlotSelected: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly onSlotClick: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    availability: string
  ) => void;
  readonly onBulkSlotSelection?: (slots: readonly SelectedTimeSlot[]) => void;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  zone,
  currentWeekStart,
  timeSlots,
   
  selectedSlots: _selectedSlots,
  getAvailabilityStatus,
  isSlotSelected,
  onSlotClick,
  onBulkSlotSelection,
   
  openingHoursStart: _openingHoursStart = "08:00",
   
  openingHoursEnd: _openingHoursEnd = "22:00",
}): JSX.Element => {
  const weekDays = Array(7)
    .fill(0)
    .map((_, i) => addDays(currentWeekStart, i));

  const {
     
    dragState: _dragState,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleClick,
    cancelDrag,
    isSlotInPreview,
    getStatusStyle,
  } = useCalendarGridDragSelection({
    zone,
    timeSlots,
    weekDays,
    getAvailabilityStatus,
    onBulkSlotSelection,
    onSlotClick,
  });

  const isNorwegianHoliday = (
    date: Date
  ): { isHoliday: boolean; name?: string } => {
    // Simple holiday check - in a real app this would be more comprehensive
    const day = format(date, "MM-dd");
    const holidays: Record<string, string> = {
      "01-01": "Nyttårsdag",
      "05-01": "1. mai",
      "05-17": "17. mai",
      "12-25": "1. juledag",
      "12-26": "2. juledag",
    };

    return {
      isHoliday: day in holidays,
      name: holidays[day],
    };
  };

  const renderTimeSlotCell = (
    day: Date,
    timeSlot: string,
    dayIndex: number
  ): JSX.Element => {
    const { status } = getAvailabilityStatus(zone.id, day, timeSlot);
    const isSelected = isSlotSelected(zone.id, day, timeSlot);
    const isInPreview = isSlotInPreview(zone.id, day, timeSlot);
    const statusStyle = getStatusStyle(status, isSelected, isInPreview);

    const startTime = timeSlot.split("-")[0];

    return (
      <button
        key={dayIndex}
        className={`w-full h-8 rounded border transition-all duration-200 text-sm select-none ${statusStyle} ${
          status === "available" ? "transform hover:scale-105" : ""
        }`}
        disabled={status !== "available"}
        onMouseDown={(e) => handleMouseDown(day, timeSlot, e)}
        onMouseEnter={() => handleMouseEnter(day, timeSlot)}
        onMouseUp={handleMouseUp}
        onClick={() => handleClick(day, timeSlot)}
        title={
          status === "available"
            ? `Book ${timeSlot}`
            : status === "busy"
            ? "Opptatt"
            : "Ikke tilgjengelig"
        }
        style={{ userSelect: "none" }}
      >
        <div className="flex items-center justify-center h-full">
          <span
            className={`text-sm font-medium ${
              isSelected
                ? "text-white"
                : isInPreview
                ? "text-blue-800"
                : "text-gray-700"
            }`}
          >
            {startTime}
          </span>
          {isSelected && <span className="text-sm text-white ml-1">✓</span>}
          {isInPreview && !isSelected && (
            <span className="text-sm text-blue-800 ml-1">◯</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div
      onMouseLeave={cancelDrag}
      onMouseUp={handleMouseUp}
      style={{ userSelect: "none" }}
    >
      <Card>
        <CardContent className="p-4">
          {/* Compact Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, i) => {
              const holidayCheck = isNorwegianHoliday(day);
              const isToday =
                format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

              return (
                <div
                  key={i}
                  className={`p-2 text-center rounded-lg border ${
                    isToday
                      ? "bg-blue-600 border-blue-700 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wide">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {format(day, "dd")}
                  </div>
                  {holidayCheck.isHoliday && (
                    <div
                      className="text-xs text-red-600 truncate mt-1"
                      title={holidayCheck.name}
                    >
                      {holidayCheck.name?.substring(0, 4)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-1">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-7 gap-2">
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="relative">
                    {renderTimeSlotCell(day, timeSlot, dayIndex)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
