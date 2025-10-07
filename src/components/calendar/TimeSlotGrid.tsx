"use client";

import React from "react";
import { format, addDays, isToday, isWeekend, isPast } from "date-fns";
import { nb } from "date-fns/locale";
import { ICalendarGridProps, TimeSlotStatus } from "./types";
import { useDragSelection } from "@/hooks/useDragSelection";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

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
}) => {
  // Generate time slots from 08:00 to 22:00 (14 slots)
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    const nextHour = hour + 1;
    return `${hour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`;
  });

  // Convert selectedSlots to ISelectedTimeSlot format
  const selectedTimeSlots = selectedSlots.map(slotId => {
    const [facId, zone, timestamp, timeSlot] = slotId.split("-");
    return {
      id: slotId,
      facilityId: facId,
      zoneId: zone,
      date: new Date(parseInt(timestamp)),
      timeSlot,
      duration: 1,
      pricePerHour: 0,
    };
  });

  // Use hooks for drag selection and availability
  const { dragState, startDrag, updateDrag, endDrag, cancelDrag, isSlotInPreview } = useDragSelection();
  const { getAvailabilityStatus, isSlotSelected } = useAvailabilityStatus(selectedTimeSlots);

  /**
   * Get status for a specific time slot using availability hook
   * 
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @returns Status of the time slot
   */
  const getSlotStatus = (day: Date, timeSlot: string): TimeSlotStatus => {
    const { status } = getAvailabilityStatus(zoneId, day, timeSlot);
    const isSelected = isSlotSelected(zoneId, day, timeSlot);
    
    if (isSelected) {
      return "selected";
    }
    
    return status as TimeSlotStatus;
  };

  /**
   * Get CSS classes for a time slot based on status
   * 
   * @param status - Time slot status
   * @param isInPreview - Whether slot is in drag preview
   * @returns CSS class string
   */
  const getSlotClasses = (status: TimeSlotStatus, isInPreview: boolean = false): string => {
    const baseClasses = "p-3 text-center rounded-lg transition-all duration-200 cursor-pointer border-2 font-medium text-sm";
    
    if (isInPreview) {
      return `${baseClasses} bg-blue-200 hover:bg-blue-300 border-blue-400 text-blue-800 font-medium cursor-pointer`;
    }
    
    switch (status) {
      case "available":
        return `${baseClasses} bg-green-100 hover:bg-green-200 border-green-300 text-green-800 hover:shadow-md transform hover:scale-105`;
      case "busy":
        return `${baseClasses} bg-red-100 border-red-300 text-red-700 cursor-not-allowed line-through`;
      case "selected":
        return `${baseClasses} bg-blue-100 border-blue-400 text-blue-800 shadow-md`;
      case "unavailable":
        return `${baseClasses} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through`;
      case "conflict":
        return `${baseClasses} bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200`;
      default:
        return `${baseClasses} bg-gray-100 border-gray-200 text-gray-600`;
    }
  };

  /**
   * Handle mouse down for drag selection
   * 
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @param event - Mouse event
   */
  const handleMouseDown = (day: Date, timeSlot: string, event: React.MouseEvent): void => {
    const { status } = getAvailabilityStatus(zoneId, day, timeSlot);
    
    if (status === "available" && onBulkSelect) {
      event.preventDefault();
      startDrag(zoneId, day, timeSlot, event);
    }
  };

  /**
   * Handle mouse enter for drag selection
   * 
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   */
  const handleMouseEnter = (day: Date, timeSlot: string): void => {
    if (dragState.isDragging && onBulkSelect) {
      updateDrag(zoneId, day, timeSlot, timeSlots, week.days, getAvailabilityStatus, facilityId, pricePerHour);
    }
  };

  /**
   * Handle mouse up for drag selection
   */
  const handleMouseUp = (event: React.MouseEvent): void => {
    if (dragState.isDragging && onBulkSelect) {
      console.log("Ending drag selection, preview slots:", dragState.previewSlots.length);
      event.preventDefault();
      event.stopPropagation();
      
      const previewSlots = endDrag();
      
      if (previewSlots.length > 0) {
        console.log("Adding bulk slots:", previewSlots.length);
        // Pass the full slot objects, not just IDs
        onBulkSelect(previewSlots);
      }
    } else {
      console.log("Mouse up but not dragging or no bulk select handler");
    }
  };

  /**
   * Handle time slot click
   * 
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @param event - Mouse event
   */
  const handleSlotClick = (day: Date, timeSlot: string, event: React.MouseEvent): void => {
    // Prevent click if we just finished dragging
    if (dragState.isDragging) {
      console.log("Preventing click during drag");
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    const slotId = `${facilityId}-${zoneId}-${day.getTime()}-${timeSlot}`;
    const { status } = getAvailabilityStatus(zoneId, day, timeSlot);
    
    // Check if slot is already selected
    const isSelected = selectedSlots.includes(slotId);
    const actualStatus = isSelected ? "selected" : status;
    
    console.log("Slot click:", { slotId, status, isSelected, actualStatus });
    
    if (status === "available" || isSelected) {
      onSlotClick(slotId, actualStatus);
    }
  };

  /**
   * Get day header classes
   * 
   * @param day - Calendar day
   * @returns CSS class string
   */
  const getDayHeaderClasses = (day: Date): string => {
    const baseClasses = "p-3 text-center rounded-lg font-medium";
    
    if (isToday(day)) {
      return `${baseClasses} bg-blue-100 border-2 border-blue-300 text-blue-800`;
    }
    
    if (isWeekend(day)) {
      return `${baseClasses} bg-amber-50 border border-amber-200 text-amber-800`;
    }
    
    return `${baseClasses} bg-gray-50 border border-gray-200 text-gray-700`;
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-2">Feil ved lasting av kalender</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div 
      className="overflow-x-auto"
      onMouseLeave={cancelDrag}
      onMouseUp={handleMouseUp}
      style={{ userSelect: 'none' }}
    >
      <div className="min-w-[800px]">
        {/* Day Headers - Compact like drammen */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {week.days.map((day, index) => {
            const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <div key={index} className={`p-2 text-center rounded-lg border ${
                isToday 
                  ? 'bg-blue-600 border-blue-700 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}>
                <div className="text-xs font-medium uppercase tracking-wide">
                  {format(day.date, "EEE", { locale: nb })}
                </div>
                <div className="text-lg font-bold mt-1">
                  {format(day.date, "dd", { locale: nb })}
                </div>
                {isToday && (
                  <div className="text-xs text-blue-200 mt-1">I dag</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Slot Rows - Compact like drammen */}
        <div className="space-y-1">
          {timeSlots.map((timeSlot, timeIndex) => (
            <div key={timeSlot} className="grid grid-cols-7 gap-2">
              {week.days.map((day, dayIndex) => {
                const status = getSlotStatus(day.date, timeSlot);
                const isInPreview = isSlotInPreview(zoneId, day.date, timeSlot);
                const slotId = `${facilityId}-${zoneId}-${day.date.getTime()}-${timeSlot}`;
                
                return (
                  <div key={dayIndex} className="relative">
                    <button
                      className={`w-full h-8 rounded border transition-all duration-200 text-sm select-none ${getSlotClasses(status, isInPreview)} ${
                        status === "available" ? 'transform hover:scale-105' : ''
                      }`}
                      disabled={status !== "available"}
                      onMouseDown={(e) => handleMouseDown(day.date, timeSlot, e)}
                      onMouseEnter={() => handleMouseEnter(day.date, timeSlot)}
                      onMouseUp={handleMouseUp}
                      onClick={(e) => handleSlotClick(day.date, timeSlot, e)}
                      title={
                        status === "available" ? "Ledig - klikk eller dra for å velge" :
                        status === "busy" ? "Opptatt" :
                        status === "unavailable" ? "Ikke tilgjengelig" :
                        status === "selected" ? "Valgt - klikk for å fjerne" :
                        "Har konflikt"
                      }
                      style={{ userSelect: 'none' }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className={`text-sm font-medium ${
                          status === "selected" ? 'text-white' : 
                          isInPreview ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                          {status === "selected" ? "✓" : timeSlot.split('-')[0]}
                        </span>
                        {isInPreview && status !== "selected" && (
                          <span className="text-sm text-blue-800 ml-1">◯</span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <div className="text-gray-600">Laster kalender...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotGrid;
