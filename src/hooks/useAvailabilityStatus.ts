"use client";

import { useMemo } from "react";
import { ISelectedTimeSlot } from "@/components/booking/types";

/**
 * Availability status result
 * 
 * Contains the status of a time slot and any conflict information
 */
interface IAvailabilityStatus {
  readonly status: "available" | "busy" | "unavailable" | "conflict";
  readonly conflict?: {
    readonly id: string;
    readonly type: string;
    readonly title: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly description: string;
  };
}

/**
 * Availability status hook for calendar time slots
 * 
 * Provides functionality to check availability status of time slots
 * and determine if slots are selected. Handles past time detection,
 * conflict checking, and selection state management.
 * 
 * Features:
 * - Past time detection
 * - Conflict checking (placeholder for future API integration)
 * - Selection state checking
 * - Optimized with useMemo for performance
 * 
 * @param selectedSlots - Array of currently selected time slots
 * @returns Availability checking functions
 */
export const useAvailabilityStatus = (selectedSlots: readonly ISelectedTimeSlot[]) => {
  /**
   * Get availability status for a specific time slot
   * 
   * @param zoneId - Zone ID
   * @param date - Date of the slot
   * @param timeSlot - Time slot string (e.g., "08:00-09:00")
   * @returns Availability status and conflict information
   */
  const getAvailabilityStatus = useMemo(() => {
    return (zoneId: string, date: Date, timeSlot: string): IAvailabilityStatus => {
      // Check if the time slot is in the past
      const now = new Date();
      const timeHour = parseInt(timeSlot.split(':')[0]);
      const slotDateTime = new Date(date);
      slotDateTime.setHours(timeHour, 0, 0, 0);
      
      if (slotDateTime < now) {
        return { status: "unavailable" };
      }

      // Check if it's weekend (simplified logic)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - check if it's after 20:00
        if (timeHour >= 20) {
          return { status: "unavailable" };
        }
      }

      // Check for conflicts (static for demonstration)
      // Mark specific time slots as busy based on deterministic logic
      
      // Mark some specific time slots as busy (static examples)
      const isBusy = (
        // Monday 14:00-15:00 and 15:00-16:00
        (dayOfWeek === 1 && (timeHour === 14 || timeHour === 15)) ||
        // Wednesday 10:00-11:00 and 11:00-12:00
        (dayOfWeek === 3 && (timeHour === 10 || timeHour === 11)) ||
        // Friday 16:00-17:00 and 17:00-18:00
        (dayOfWeek === 5 && (timeHour === 16 || timeHour === 17))
      );
      
      if (isBusy) {
        return {
          status: "busy",
          conflict: {
            id: `conflict-${zoneId}-${date.getTime()}-${timeSlot}`,
            type: "booking",
            title: "Eksisterende booking",
            startTime: timeSlot.split('-')[0],
            endTime: timeSlot.split('-')[1],
            description: "Dette tidspunktet er allerede booket"
          }
        };
      }

      // Check for maintenance conflicts (static)
      const hasConflict = (
        // Tuesday 12:00-13:00 (lunch break maintenance)
        (dayOfWeek === 2 && timeHour === 12) ||
        // Thursday 18:00-19:00 (evening maintenance)
        (dayOfWeek === 4 && timeHour === 18)
      );
      
      if (hasConflict) {
        return {
          status: "conflict",
          conflict: {
            id: `conflict-${zoneId}-${date.getTime()}-${timeSlot}`,
            type: "maintenance",
            title: "Vedlikehold",
            startTime: timeSlot.split('-')[0],
            endTime: timeSlot.split('-')[1],
            description: "Tidspunktet er utilgjengelig på grunn av vedlikehold"
          }
        };
      }

      return { status: "available" };
    };
  }, []);

  /**
   * Check if a time slot is selected
   * 
   * @param zoneId - Zone ID
   * @param date - Date of the slot
   * @param timeSlot - Time slot string
   * @returns True if the slot is selected
   */
  const isSlotSelected = useMemo(() => {
    return (zoneId: string, date: Date, timeSlot: string): boolean => {
      return selectedSlots.some(slot => {
        // Ensure slot.date is a proper Date object
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        
        return slot.zoneId === zoneId &&
          slotDate.toDateString() === date.toDateString() &&
          slot.timeSlot === timeSlot;
      });
    };
  }, [selectedSlots]);

  return {
    getAvailabilityStatus,
    isSlotSelected,
  };
};
