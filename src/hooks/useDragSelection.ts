"use client";

import { useState, useCallback, useRef } from "react";
import { ISelectedTimeSlot } from "@/components/booking/types";

/**
 * Drag state interface for drag selection functionality
 * 
 * Tracks the current state of drag operations including
 * start position, current position, and preview slots.
 */
interface IDragState {
  readonly isDragging: boolean;
  readonly startSlot: {
    readonly zoneId: string;
    readonly date: Date;
    readonly timeSlot: string;
  } | null;
  readonly currentSlot: {
    readonly zoneId: string;
    readonly date: Date;
    readonly timeSlot: string;
  } | null;
  readonly previewSlots: readonly ISelectedTimeSlot[];
}

/**
 * Drag selection hook for calendar time slot selection
 * 
 * Provides drag and drop functionality for selecting multiple
 * time slots in the calendar grid. Supports both single clicks
 * and drag selection for bulk operations.
 * 
 * Features:
 * - Mouse down/up/enter event handling
 * - Drag preview with visual feedback
 * - Rectangle selection logic
 * - Conflict detection during drag
 * - Cleanup and cancellation support
 * 
 * Usage:
 * - Call startDrag on mouse down
 * - Call updateDrag on mouse enter
 * - Call endDrag on mouse up
 * - Use isSlotInPreview to show preview state
 * 
 * @returns Drag selection state and handlers
 */
export const useDragSelection = () => {
  const [dragState, setDragState] = useState<IDragState>({
    isDragging: false,
    startSlot: null,
    currentSlot: null,
    previewSlots: [],
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Start drag selection
   * 
   * @param zoneId - Zone ID for the slot
   * @param date - Date of the slot
   * @param timeSlot - Time slot string
   * @param event - Mouse event
   */
  const startDrag = useCallback((
    zoneId: string,
    date: Date,
    timeSlot: string,
    event: React.MouseEvent
  ): void => {
    event.preventDefault();
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    
    setDragState({
      isDragging: true,
      startSlot: { zoneId, date, timeSlot },
      currentSlot: { zoneId, date, timeSlot },
      previewSlots: [],
    });
  }, []);

  /**
   * Update drag selection
   * 
   * @param zoneId - Zone ID for the slot
   * @param date - Date of the slot
   * @param timeSlot - Time slot string
   * @param timeSlots - Available time slots
   * @param weekDays - Week days array (ICalendarDay[])
   * @param getAvailabilityStatus - Function to check availability
   * @param facilityId - Facility ID (optional)
   * @param pricePerHour - Price per hour (optional)
   */
  const updateDrag = useCallback((
    zoneId: string,
    date: Date,
    timeSlot: string,
    timeSlots: readonly string[],
    weekDays: readonly { date: Date }[],
    getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => { status: string; conflict?: any },
    facilityId: string = "",
    pricePerHour: number = 0
  ): void => {
    if (!dragState.isDragging || !dragState.startSlot) return;

    const startSlot = dragState.startSlot;
    const endSlot = { zoneId, date, timeSlot };

    // Calculate the selection rectangle
    const previewSlots: ISelectedTimeSlot[] = [];
    
    // Find indices for start and end positions
    const startDayIndex = weekDays.findIndex(day => 
      day.date.toDateString() === startSlot.date.toDateString()
    );
    const endDayIndex = weekDays.findIndex(day => 
      day.date.toDateString() === endSlot.date.toDateString()
    );
    const startTimeIndex = timeSlots.findIndex(slot => slot === startSlot.timeSlot);
    const endTimeIndex = timeSlots.findIndex(slot => slot === endSlot.timeSlot);

    if (startDayIndex !== -1 && endDayIndex !== -1 && startTimeIndex !== -1 && endTimeIndex !== -1) {
      const minDayIndex = Math.min(startDayIndex, endDayIndex);
      const maxDayIndex = Math.max(startDayIndex, endDayIndex);
      const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
      const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);

      // Create selection rectangle
      for (let dayIndex = minDayIndex; dayIndex <= maxDayIndex; dayIndex++) {
        for (let timeIndex = minTimeIndex; timeIndex <= maxTimeIndex; timeIndex++) {
          const currentDayObj = weekDays[dayIndex];
          const currentDay = currentDayObj.date;
          const currentTimeSlot = timeSlots[timeIndex];
          const { status } = getAvailabilityStatus(zoneId, currentDay, currentTimeSlot);
          
          // Only include available slots in the preview
          if (status === "available") {
            previewSlots.push({
              id: `${zoneId}-${currentDay.getTime()}-${currentTimeSlot}`,
              facilityId,
              zoneId,
              date: currentDay,
              timeSlot: currentTimeSlot,
              duration: 1,
              pricePerHour,
            });
          }
        }
      }
    }

    setDragState(prev => ({
      ...prev,
      currentSlot: endSlot,
      previewSlots,
    }));
  }, [dragState.isDragging, dragState.startSlot]);

  /**
   * End drag selection
   * 
   * @returns Array of selected time slots
   */
  const endDrag = useCallback((): readonly ISelectedTimeSlot[] => {
    const result = dragState.previewSlots;
    setDragState({
      isDragging: false,
      startSlot: null,
      currentSlot: null,
      previewSlots: [],
    });
    dragStartRef.current = null;
    return result;
  }, [dragState.previewSlots]);

  /**
   * Cancel drag selection
   */
  const cancelDrag = useCallback((): void => {
    setDragState({
      isDragging: false,
      startSlot: null,
      currentSlot: null,
      previewSlots: [],
    });
    dragStartRef.current = null;
  }, []);

  /**
   * Check if a slot is in preview state
   * 
   * @param zoneId - Zone ID
   * @param date - Date
   * @param timeSlot - Time slot
   * @returns True if slot is in preview
   */
  const isSlotInPreview = useCallback((
    zoneId: string,
    date: Date,
    timeSlot: string
  ): boolean => {
    return dragState.previewSlots.some(slot =>
      slot.zoneId === zoneId &&
      slot.date.toDateString() === date.toDateString() &&
      slot.timeSlot === timeSlot
    );
  }, [dragState.previewSlots]);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isSlotInPreview,
  };
};