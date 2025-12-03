"use client";

import { useCallback } from "react";
import { ISelectedTimeSlot } from "@/components/features/bookings/types";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";
import { useSlotSelectionStore } from "@/stores/slotSelectionStore";

/**
 * Slot selection hook for calendar time slot management
 *
 * Provides functionality to manage selected time slots including
 * adding, removing, and bulk operations. Uses Zustand store for
 * persistent state management.
 *
 * Features:
 * - Single slot selection/deselection
 * - Bulk slot operations
 * - Clear all selections
 * - Persistent state with localStorage
 * - Date normalization
 *
 * @returns Slot selection state and handlers
 */
export const useSlotSelection = () => {
  const {
    selectedSlots,
    recurringSlots,
    addSlot,
    removeSlot,
    clearSelection,
    setSelectedSlots: setSelectedSlotsStore,
    clearRecurringSlots,
    generateRecurringSlots: generateRecurringSlotsStore,
    getAllSlots,
    isSlotSelected: isSlotSelectedStore
  } = useSlotSelectionStore();

  /**
   * Ensure date is a proper Date object
   *
   * @param date - Date or string to normalize
   * @returns Normalized Date object
   */
  const ensureDate = useCallback((date: Date | string): Date => {
    return date instanceof Date ? date : new Date(date);
  }, []);

  /**
   * Handle single slot click
   *
   * @param zoneId - Zone ID
   * @param date - Date of the slot
   * @param timeSlot - Time slot string
   * @param availability - Availability status
   * @param facilityId - Facility ID (optional)
   * @param pricePerHour - Price per hour (optional)
   */
  const handleSlotClick = useCallback((
    zoneId: string,
    date: Date,
    timeSlot: string,
    availability: string,
    facilityId: string = "",
    pricePerHour: number = 0
  ): void => {
    if (availability !== "available" && availability !== "selected") {
      return;
    }

    const slotDate = ensureDate(date);

    // Check if slot is already selected
    const isSelected = isSlotSelectedStore(zoneId, slotDate, timeSlot);

    if (isSelected) {
      // Remove slot
      removeSlot(zoneId, slotDate, timeSlot);
    } else {
      // Add slot - use local date components to avoid timezone issues
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`; // YYYY-MM-DD format

      const newSlot: ISelectedTimeSlot = {
        id: `${facilityId}-${zoneId}-${dayString}-${timeSlot}`,
        facilityId,
        zoneId,
        date: slotDate,
        timeSlot,
        // duration in minutes (e.g., 60 for 1h)
        duration: 60,
        pricePerHour,
      };

      addSlot(newSlot);
    }
  }, [ensureDate, isSlotSelectedStore, removeSlot, addSlot]);

  /**
   * Handle bulk slot selection
   *
   * @param newSlots - Array of slots to add
   */
  const handleBulkSlotSelection = useCallback((newSlots: readonly ISelectedTimeSlot[]): void => {
    if (newSlots.length === 0) {
      return;
    }

    // Ensure all dates are Date objects and generate proper IDs
    const normalizedSlots = newSlots.map(slot => {
      const slotDate = ensureDate(slot.date);
      // Use local date components to avoid timezone issues
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`; // YYYY-MM-DD format

      return {
        ...slot,
        date: slotDate,
        id: `${slot.facilityId}-${slot.zoneId}-${dayString}-${slot.timeSlot}`
      };
    });

    // Add each slot individually (the store will handle duplicates)
    normalizedSlots.forEach(slot => {
      addSlot(slot);
    });
  }, [ensureDate, addSlot]);

  /**
   * Set selected slots (for external control)
   *
   * @param slots - Array of slots to set
   */
  const setSelectedSlots = useCallback((slots: readonly ISelectedTimeSlot[]): void => {
    setSelectedSlotsStore(slots);
  }, [setSelectedSlotsStore]);

  /**
   * Generate recurring slots from a pattern
   *
   * @param pattern - Recurrence pattern
   * @param startDate - Start date for generation
   * @param zoneId - Zone ID
   * @param facilityId - Facility ID
   * @param pricePerHour - Price per hour
   * @param maxOccurrences - Maximum occurrences to generate
   */
  const generateRecurringSlots = useCallback((
    pattern: RecurrencePattern,
    startDate: Date,
    zoneId: string,
    facilityId: string,
    pricePerHour: number,
    maxOccurrences: number = 52
  ): void => {
    generateRecurringSlotsStore(pattern, startDate, zoneId, facilityId, pricePerHour, maxOccurrences);
  }, [generateRecurringSlotsStore]);

  /**
   * Check if a slot is selected
   *
   * @param zoneId - Zone ID
   * @param date - Date of the slot
   * @param timeSlot - Time slot string
   * @returns True if the slot is selected
   */
  const isSlotSelected = useCallback((
    zoneId: string,
    date: Date,
    timeSlot: string
  ): boolean => {
    return isSlotSelectedStore(zoneId, date, timeSlot);
  }, [isSlotSelectedStore]);

  return {
    selectedSlots,
    recurringSlots,
    handleSlotClick,
    handleBulkSlotSelection,
    clearSelection,
    setSelectedSlots,
    generateRecurringSlots,
    clearRecurringSlots,
    getAllSlots,
    isSlotSelected,
  };
};
