"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import type {
  Zone,
  SelectedTimeSlot,
  AvailabilityStatus,
} from "@/types/booking";
import { useDragSelection } from "@/components/features/calendar/hooks";

/**
 * Calendar grid drag selection hook props
 */
interface IUseCalendarGridDragSelectionProps {
  readonly zone: Zone;
  readonly timeSlots: readonly string[];
  readonly weekDays: readonly Date[];
  readonly getAvailabilityStatus: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => AvailabilityStatus;
  readonly onBulkSlotSelection?: (slots: readonly SelectedTimeSlot[]) => void;
  readonly onSlotClick: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    availability: string
  ) => void;
}

/**
 * Calendar grid drag selection return type
 */
interface IUseCalendarGridDragSelectionReturn {
  readonly dragState: {
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
    readonly previewSlots: readonly SelectedTimeSlot[];
  };
  readonly handleMouseDown: (
    day: Date,
    timeSlot: string,
    event: React.MouseEvent
  ) => void;
  readonly handleMouseEnter: (day: Date, timeSlot: string) => void;
  readonly handleMouseUp: () => void;
  readonly handleClick: (day: Date, timeSlot: string) => void;
  readonly cancelDrag: () => void;
  readonly isSlotInPreview: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly getStatusStyle: (
    status: string,
    isSelected: boolean,
    isInPreview: boolean
  ) => string;
}

/**
 * Custom hook for calendar grid drag selection functionality
 *
 * Provides comprehensive drag selection capabilities for the calendar grid:
 * - Multi-slot selection via drag
 * - Single slot click selection
 * - Visual feedback during drag
 * - Status-based styling
 * - Touch and mouse event handling
 *
 * This hook encapsulates all drag selection logic, event handlers,
 * and styling utilities for the CalendarGrid component.
 *
 * @param props - Hook configuration
 * @returns Drag selection state and handlers
 */
export const useCalendarGridDragSelection = ({
  zone,
  timeSlots,
  weekDays,
  getAvailabilityStatus,
  onBulkSlotSelection,
  onSlotClick,
}: IUseCalendarGridDragSelectionProps): IUseCalendarGridDragSelectionReturn => {
  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isSlotInPreview,
  } = useDragSelection();

  /**
   * Get status-based style classes for slot rendering
   *
   * @param status - Slot availability status
   * @param isSelected - Whether slot is selected
   * @param isInPreview - Whether slot is in drag preview
   * @returns Tailwind CSS classes
   */
  const getStatusStyle = useCallback(
    (status: string, isSelected: boolean, isInPreview: boolean): string => {
      if (isSelected) {
        return "bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-700";
      }

      if (isInPreview) {
        return "bg-blue-200 hover:bg-blue-300 border border-blue-400 text-blue-800 font-medium cursor-pointer";
      }

      switch (status) {
        case "available":
          return "bg-green-100 hover:bg-green-200 border border-green-300 text-gray-800 hover:shadow-sm cursor-pointer";
        case "busy":
          return "bg-red-50 border border-red-200 text-gray-500 line-through cursor-not-allowed";
        case "unavailable":
        default:
          return "bg-gray-100 border border-gray-200 text-gray-400 line-through cursor-not-allowed";
      }
    },
    []
  );

  /**
   * Handle mouse down event to initiate drag selection
   *
   * @param day - Selected day
   * @param timeSlot - Selected time slot
   * @param event - Mouse event
   */
  const handleMouseDown = useCallback(
    (day: Date, timeSlot: string, event: React.MouseEvent): void => {
      const { status } = getAvailabilityStatus(zone.id, day, timeSlot);

      if (status === "available" && onBulkSlotSelection) {
        event.preventDefault();
        startDrag(zone.id, day, timeSlot, event);
      }
    },
    [zone.id, getAvailabilityStatus, onBulkSlotSelection, startDrag]
  );

  /**
   * Handle mouse enter event during drag
   *
   * @param day - Current day
   * @param timeSlot - Current time slot
   */
  const handleMouseEnter = useCallback(
    (day: Date, timeSlot: string): void => {
      if (dragState.isDragging && onBulkSlotSelection) {
        updateDrag(
          zone.id,
          day,
          timeSlot,
          timeSlots,
          weekDays,
          getAvailabilityStatus
        );
      }
    },
    [
      dragState.isDragging,
      zone.id,
      timeSlots,
      weekDays,
      getAvailabilityStatus,
      onBulkSlotSelection,
      updateDrag,
    ]
  );

  /**
   * Handle mouse up event to complete drag selection
   */
  const handleMouseUp = useCallback((): void => {
    if (dragState.isDragging && onBulkSlotSelection) {
      const previewSlots = endDrag();

      if (previewSlots.length > 0) {
        // Fill in the missing data for the slots
        const completeSlots = previewSlots.map((slot) => ({
          ...slot,
          facilityId: zone.facilityId,
          facilityName: "", // This should be filled by the parent component
          zoneName: zone.name,
          pricePerHour: zone.pricePerHour,
        }));

        onBulkSlotSelection(completeSlots);
      }
    }
  }, [
    dragState.isDragging,
    zone.facilityId,
    zone.name,
    zone.pricePerHour,
    onBulkSlotSelection,
    endDrag,
  ]);

  /**
   * Handle single click on slot
   *
   * @param day - Selected day
   * @param timeSlot - Selected time slot
   */
  const handleClick = useCallback(
    (day: Date, timeSlot: string): void => {
      // Prevent click if we just finished dragging
      if (dragState.isDragging) {
        return;
      }

      const { status } = getAvailabilityStatus(zone.id, day, timeSlot);

      // Only proceed with click if available
      if (status === "available") {
        onSlotClick(zone.id, day, timeSlot, status);
      }
    },
    [dragState.isDragging, zone.id, getAvailabilityStatus, onSlotClick]
  );

  return {
    dragState,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleClick,
    cancelDrag,
    isSlotInPreview,
    getStatusStyle,
  };
};
