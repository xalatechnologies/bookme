"use client";

import { useCallback } from "react";
import { ISelectedTimeSlot } from "@/components/features/bookings/types";
import { TimeSlotStatus } from "@/components/features/calendar/types";

/**
 * Hook for drag slot selection in calendar grid
 *
 * Provides drag and drop functionality for selecting multiple
 * time slots in the calendar grid. Supports both single clicks
 * and drag selection for bulk operations with mobile touch support.
 *
 * Features:
 * - Mouse down/move/up event handlers
 * - Touch event handlers for mobile devices
 * - Drag preview with visual feedback
 * - Rectangle selection logic across days and times
 * - Conflict detection during drag
 * - Availability checking integration
 * - Cleanup and cancellation support
 *
 * @example
 * const {
 *   handleMouseDown,
 *   handleMouseEnter,
 *   handleMouseUp,
 *   handleSlotClick,
 *   cancelDrag
 * } = useDragSlotSelection({
 *   zoneId: "zone-1",
 *   facilityId: "facility-1",
 *   pricePerHour: 100,
 *   timeSlots,
 *   weekDays: week.days,
 *   dragState,
 *   startDrag,
 *   updateDrag,
 *   endDrag,
 *   cancelDrag: cancelDragHandler,
 *   isSlotInPreview,
 *   getAvailabilityStatus,
 *   isSlotSelected,
 *   onSlotClick,
 *   onBulkSelect
 * });
 */

/**
 * Props for useDragSlotSelection hook
 */
export interface IUseDragSlotSelectionProps {
  readonly zoneId: string;
  readonly facilityId: string;
  readonly pricePerHour: number;
  readonly timeSlots: readonly string[];
  readonly weekDays: readonly { readonly date: Date }[];
  readonly dragState: {
    readonly isDragging: boolean;
  };
  readonly startDrag: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    event: React.MouseEvent | React.TouchEvent
  ) => void;
  readonly updateDrag: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    timeSlots: readonly string[],
    weekDays: readonly { readonly date: Date }[],
    getAvailabilityStatus: (
      zoneId: string,
      date: Date,
      timeSlot: string
    ) => { readonly status: string; readonly conflict?: { readonly id: string; readonly title: string } },
    facilityId: string,
    pricePerHour: number
  ) => void;
  readonly endDrag: () => readonly ISelectedTimeSlot[];
  readonly cancelDrag: () => void;
  readonly isSlotInPreview: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly getAvailabilityStatus: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => { readonly status: string; readonly conflict?: { readonly id: string; readonly title: string } };
  readonly isSlotSelected: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly onSlotClick: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    status: TimeSlotStatus
  ) => void;
  readonly onBulkSelect?: (slots: readonly ISelectedTimeSlot[]) => void;
}

/**
 * Return type for useDragSlotSelection hook
 */
export interface IUseDragSlotSelectionReturn {
  readonly handleMouseDown: (
    day: Date,
    timeSlot: string,
    event: React.MouseEvent
  ) => void;
  readonly handleMouseEnter: (day: Date, timeSlot: string) => void;
  readonly handleMouseUp: (event: React.MouseEvent) => void;
  readonly handleSlotClick: (
    day: Date,
    timeSlot: string,
    event: React.MouseEvent
  ) => void;
  readonly handleTouchStart: (
    day: Date,
    timeSlot: string,
    event: React.TouchEvent
  ) => void;
  readonly handleTouchMove: (event: React.TouchEvent) => void;
  readonly handleTouchEnd: (event: React.TouchEvent) => void;
}

/**
 * Custom hook for drag slot selection functionality
 *
 * Encapsulates all drag selection logic including mouse and touch event
 * handlers, providing a clean interface for the TimeSlotGrid component.
 *
 * @param props - Hook configuration props
 * @returns Event handlers and state for drag selection
 */
export const useDragSlotSelection = ({
  zoneId,
  facilityId,
  pricePerHour,
  timeSlots,
  weekDays,
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
}: IUseDragSlotSelectionProps): IUseDragSlotSelectionReturn => {
  /**
   * Handle mouse down for drag selection
   *
   * Initiates drag selection when user clicks on an available or selected slot.
   * Only triggers if bulk selection callback is provided.
   *
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @param event - Mouse event
   */
  const handleMouseDown = useCallback(
    (day: Date, timeSlot: string, event: React.MouseEvent): void => {
      const { status } = getAvailabilityStatus(zoneId, day, timeSlot);

      if ((status === "available" || status === "selected") && !!onBulkSelect) {
        event.preventDefault();
        startDrag(zoneId, day, timeSlot, event);
      }
    },
    [zoneId, getAvailabilityStatus, onBulkSelect, startDrag]
  );

  /**
   * Handle mouse enter for drag selection
   *
   * Updates drag selection preview as user moves mouse over slots.
   * Only updates if drag is currently active and bulk selection is enabled.
   *
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   */
  const handleMouseEnter = useCallback(
    (day: Date, timeSlot: string): void => {
      if (dragState.isDragging && !!onBulkSelect) {
        updateDrag(
          zoneId,
          day,
          timeSlot,
          timeSlots,
          weekDays,
          getAvailabilityStatus,
          facilityId,
          pricePerHour
        );
      }
    },
    [
      dragState.isDragging,
      onBulkSelect,
      updateDrag,
      zoneId,
      timeSlots,
      weekDays,
      getAvailabilityStatus,
      facilityId,
      pricePerHour,
    ]
  );

  /**
   * Handle mouse up for drag selection
   *
   * Completes drag selection and triggers bulk select callback
   * with all slots in the selection rectangle.
   *
   * @param event - Mouse event
   */
  const handleMouseUp = useCallback(
    (event: React.MouseEvent): void => {
      if (dragState.isDragging && !!onBulkSelect) {
        event.preventDefault();
        event.stopPropagation();

        const previewSlots = endDrag();

        if (previewSlots.length > 0) {
          // Pass the full slot objects to bulk select handler
          onBulkSelect(previewSlots);
        }
      }
    },
    [dragState.isDragging, onBulkSelect, endDrag]
  );

  /**
   * Handle time slot click
   *
   * Handles single slot selection when user clicks without dragging.
   * Checks availability status and triggers appropriate callback.
   *
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @param event - Mouse event
   */
  const handleSlotClick = useCallback(
    (day: Date, timeSlot: string, event: React.MouseEvent): void => {
      // Prevent click if we just finished dragging
      if (dragState.isDragging) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const { status } = getAvailabilityStatus(zoneId, day, timeSlot);

      // Check if slot is already selected
      const isSelected = isSlotSelected(zoneId, day, timeSlot);
      const actualStatus = isSelected ? "selected" : (status as TimeSlotStatus);

      if (status === "available" || isSelected) {
        // Pass the actual Date object and parameters directly
        onSlotClick(zoneId, day, timeSlot, actualStatus);
      }
    },
    [
      dragState.isDragging,
      getAvailabilityStatus,
      zoneId,
      isSlotSelected,
      onSlotClick,
    ]
  );

  /**
   * Handle touch start for mobile drag selection
   *
   * Initiates drag selection on mobile devices when user touches
   * an available or selected slot.
   *
   * @param day - Calendar day
   * @param timeSlot - Time slot string
   * @param event - Touch event
   */
  const handleTouchStart = useCallback(
    (day: Date, timeSlot: string, event: React.TouchEvent): void => {
      const { status } = getAvailabilityStatus(zoneId, day, timeSlot);

      if ((status === "available" || status === "selected") && !!onBulkSelect) {
        event.preventDefault();
        startDrag(zoneId, day, timeSlot, event);
      }
    },
    [zoneId, getAvailabilityStatus, onBulkSelect, startDrag]
  );

  /**
   * Handle touch move for mobile drag selection
   *
   * Updates drag selection as user moves finger across slots.
   * Uses document.elementFromPoint to detect slot under touch.
   *
   * @param event - Touch event
   */
  const handleTouchMove = useCallback(
    (event: React.TouchEvent): void => {
      if (dragState.isDragging && !!onBulkSelect) {
        event.preventDefault();

        const touch = event.touches[0];
        const element = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );

        if (element && element.hasAttribute("data-slot")) {
          const slotData = element.getAttribute("data-slot");
          if (slotData) {
            try {
              const { day, timeSlot } = JSON.parse(slotData);
              const date = new Date(day);

              updateDrag(
                zoneId,
                date,
                timeSlot,
                timeSlots,
                weekDays,
                getAvailabilityStatus,
                facilityId,
                pricePerHour
              );
            } catch (error) {
              console.error("Error parsing slot data:", error);
            }
          }
        }
      }
    },
    [
      dragState.isDragging,
      onBulkSelect,
      updateDrag,
      zoneId,
      timeSlots,
      weekDays,
      getAvailabilityStatus,
      facilityId,
      pricePerHour,
    ]
  );

  /**
   * Handle touch end for mobile drag selection
   *
   * Completes drag selection on mobile and triggers bulk select
   * callback with all slots in the selection.
   *
   * @param event - Touch event
   */
  const handleTouchEnd = useCallback(
    (event: React.TouchEvent): void => {
      if (dragState.isDragging && !!onBulkSelect) {
        event.preventDefault();

        const previewSlots = endDrag();

        if (previewSlots.length > 0) {
          onBulkSelect(previewSlots);
        }
      }
    },
    [dragState.isDragging, onBulkSelect, endDrag]
  );

  return {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleSlotClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
