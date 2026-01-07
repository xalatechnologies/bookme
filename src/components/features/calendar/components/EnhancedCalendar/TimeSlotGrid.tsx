"use client";

// External libraries
import React, { useMemo, useCallback } from "react";
import { format } from "date-fns";
import { nb, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// Internal libraries/utilities
import { useDragSelection } from "../../hooks";
import { useAvailabilityStatus } from "@/components/features/bookings/hooks";
import { useDragSlotSelection } from "@/hooks/features/calendar";
import { Button } from "@/components/ui/button";

// Types
import { ICalendarGridProps, TimeSlotStatus } from "../../types";

/**
 * Time slot grid component for calendar
 *
 * Displays a grid of time slots for a week, showing availability
 * and allowing users to select time slots for booking.
 *
 * Features:
 * - Week view with 7 days
 * - Time slots from 08:00 to 22:00
 * - Color-coded availability status
 * - Click handling for slot selection
 * - Responsive design
 * - Accessibility support
 *
 * @param props - Calendar grid props
 */
export const TimeSlotGrid: React.FC<ICalendarGridProps> = ({
  facilityId,
  zoneId,
  week,
  selectedSlots,
  onSlotClick,
  onBulkSelect,
  pricePerHour = 0,
  isLoading = false,
  error,
  getAvailabilityStatus: externalGetAvailabilityStatus,
  isSlotSelected: externalIsSlotSelected,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
}) => {
  const { t, i18n } = useTranslation("calendar");
  const currentLocale = i18n.language === "en" ? enUS : nb;

  // Generate time slots based on opening hours - memoized
  const timeSlots = useMemo(() => {
    const startHour = parseInt(openingHoursStart.split(":")[0]);
    const endHour = parseInt(openingHoursEnd.split(":")[0]);
    const totalHours = endHour - startHour;

    return Array.from({ length: totalHours }, (_, i) => {
      const hour = startHour + i;
      const nextHour = hour + 1;
      return `${hour.toString().padStart(2, "0")}:00-${nextHour
        .toString()
        .padStart(2, "0")}:00`;
    });
  }, [openingHoursStart, openingHoursEnd]);

  // Use hooks for drag selection and availability
  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isSlotInPreview,
  } = useDragSelection();
  const {
    getAvailabilityStatus: internalGetAvailabilityStatus,
    isSlotSelected: internalIsSlotSelected,
  } = useAvailabilityStatus(selectedSlots);

  // Use external props if available, otherwise use internal state
  const getAvailabilityStatus =
    externalGetAvailabilityStatus || internalGetAvailabilityStatus;
  const isSlotSelected = externalIsSlotSelected || internalIsSlotSelected;

  // Use drag slot selection hook for event handlers
  const {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleSlotClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useDragSlotSelection({
    zoneId,
    facilityId,
    pricePerHour,
    timeSlots,
    weekDays: week.days,
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isSlotInPreview,
    getAvailabilityStatus,
    isSlotSelected,
    onSlotClick,
    onBulkSelect,
  });

  /**
   * Get status for a specific time slot using availability hook
   * Memoized for performance
   *
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @returns Status of the time slot
   */
  const getSlotStatus = useCallback(
    (day: Date, timeSlot: string): TimeSlotStatus => {
      const { status } = getAvailabilityStatus(zoneId, day, timeSlot);
      const isSelected = isSlotSelected(zoneId, day, timeSlot);

      if (isSelected) {
        return "selected";
      }

      return status as TimeSlotStatus;
    },
    [zoneId, getAvailabilityStatus, isSlotSelected]
  );

  /**
   * Get status label for accessibility
   *
   * @param status - Time slot status
   * @returns Translated status label
   */
  const getStatusLabel = useCallback(
    (status: TimeSlotStatus): string => {
      switch (status) {
        case "available":
          return t("slot_status.available");
        case "busy":
          return t("slot_status.busy");
        case "unavailable":
          return t("slot_status.unavailable");
        case "selected":
          return t("slot_status.selected");
        case "conflict":
          return t("slot_status.conflict");
        default:
          return t("slot_status.conflict");
      }
    },
    [t]
  );

  /**
   * Get CSS classes for a time slot based on status
   * Memoized for performance
   *
   * @param status - Time slot status
   * @param isInPreview - Whether slot is in drag preview
   * @returns CSS class string
   */
  const getSlotClasses = useCallback(
    (status: TimeSlotStatus, isInPreview: boolean = false): string => {
      const baseClasses =
        "p-3 text-center rounded-lg transition-all duration-200 cursor-pointer border-2 font-medium text-sm";

      if (isInPreview) {
        return `${baseClasses} bg-blue-200 hover:bg-blue-300 border-blue-400 text-blue-800 font-medium cursor-pointer`;
      }

      switch (status) {
        case "available":
          return `${baseClasses} bg-green-100 hover:bg-green-200 border-green-300 text-green-800 hover:shadow-md transform hover:scale-105`;
        case "busy":
          return `${baseClasses} bg-red-100 border-red-300 text-red-700 cursor-not-allowed line-through`;
        case "selected":
          return `${baseClasses} bg-blue-600 border-blue-700 text-white shadow-md hover:bg-blue-700 hover:border-blue-800`;
        case "unavailable":
          return `${baseClasses} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through`;
        case "conflict":
          return `${baseClasses} bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200`;
        default:
          return `${baseClasses} bg-gray-100 border-gray-200 text-gray-600`;
      }
    },
    []
  );



  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2">{t("errors.loading_calendar")}</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onMouseLeave={cancelDrag}
      onMouseUp={handleMouseUp}
      style={{ userSelect: "none" }}
    >
      <div className="w-full">
        {/* Day Headers - Compact like drammen */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {week.days.map((day, index) => {
            const isToday =
              format(day.date, "yyyy-MM-dd") ===
              format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={index}
                className={`p-2 text-center rounded-lg border ${
                  isToday
                    ? "bg-blue-600 border-blue-700 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <div className="text-xs font-medium uppercase tracking-wide">
                  {format(day.date, "EEE", { locale: currentLocale })}
                </div>
                <div className="text-lg font-bold mt-1">
                  {format(day.date, "dd", { locale: currentLocale })}
                </div>
                {isToday && (
                  <div className="text-xs text-blue-200 mt-1">
                    {t("navigation.today")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Slot Rows - Compact like drammen */}
        <div className="space-y-1">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-7 gap-1">
              {week.days.map((day, dayIndex) => {
                const status = getSlotStatus(day.date, timeSlot);
                const isInPreview = isSlotInPreview(zoneId, day.date, timeSlot);
                // No need to generate slotId anymore since we pass parameters directly
                const selectedSlot = selectedSlots.find((s) => {
                  const slotDate =
                    s.date instanceof Date ? s.date : new Date(s.date);
                  return (
                    s.zoneId === zoneId &&
                    slotDate.toDateString() === day.date.toDateString() &&
                    s.timeSlot === timeSlot
                  );
                });
                const purposeTitle =
                  selectedSlot &&
                  selectedSlot.showPurposeInCalendar &&
                  selectedSlot.purpose
                    ? selectedSlot.purpose
                    : undefined;

                return (
                  <div key={dayIndex} className="relative">
                    <Button
                      variant="ghost"
                      className={`w-full h-8 rounded border transition-all duration-200 text-sm select-none p-0 ${getSlotClasses(
                        status,
                        isInPreview
                      )} ${
                        status === "available"
                          ? "transform hover:scale-105"
                          : status === "selected"
                          ? "hover:scale-105"
                          : ""
                      }`}
                      disabled={status !== "available" && status !== "selected"}
                      onMouseDown={(e) => handleMouseDown(day.date, timeSlot, e)}
                      onMouseEnter={() => handleMouseEnter(day.date, timeSlot)}
                      onMouseUp={handleMouseUp}
                      onClick={(e) => handleSlotClick(day.date, timeSlot, e)}
                      onTouchStart={(e) => handleTouchStart(day.date, timeSlot, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      title={purposeTitle || getStatusLabel(status)}
                      aria-label={purposeTitle || getStatusLabel(status)}
                      data-slot={JSON.stringify({ day: day.date.toISOString(), timeSlot })}
                      style={{ userSelect: "none" }}
                    >
                      <div className="flex flex-col items-center justify-center h-full leading-tight">
                        <span
                          className={`text-sm font-medium ${
                            status === "selected"
                              ? "text-white"
                              : isInPreview
                              ? "text-blue-800"
                              : "text-gray-700"
                          }`}
                        >
                          {timeSlot.split("-")[0]}
                        </span>
                        {purposeTitle && (
                          <span className="text-[10px] font-semibold text-white mt-0.5 text-center line-clamp-2 px-1">
                            {purposeTitle}
                          </span>
                        )}
                        {isInPreview && status !== "selected" && (
                          <span className="text-sm text-blue-800 ml-1">◯</span>
                        )}
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <div className="text-gray-600">{t("time_slots.loading")}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
