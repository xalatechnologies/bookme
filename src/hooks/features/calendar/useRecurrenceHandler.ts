/**
 * useRecurrenceHandler Hook
 *
 * Manages recurring booking patterns including:
 * - Pattern validation
 * - Occurrence generation
 * - Pattern state management
 * - Weekly/monthly recurrence
 * - Time slot coordination
 *
 * @returns Recurrence pattern management functions
 */

import { useState, useCallback } from "react";
import { addDays, addWeeks, addMonths, getDay } from "date-fns";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";
import type { ISelectedTimeSlot } from "@/components/features/bookings/types";

export interface RecurringSlot {
  readonly date: Date;
  readonly timeSlot: string;
  readonly zoneId: string;
  readonly facilityId: string;
  readonly pricePerHour: number;
}

export interface UseRecurrenceHandlerReturn {
  readonly pattern: RecurrencePattern | null;
  readonly setPattern: (pattern: RecurrencePattern | null) => void;
  readonly generateRecurringSlots: (
    pattern: RecurrencePattern,
    startDate: Date,
    zoneId: string,
    facilityId: string,
    pricePerHour: number,
    maxOccurrences?: number
  ) => readonly ISelectedTimeSlot[];
  readonly validatePattern: (pattern: RecurrencePattern) => boolean;
  readonly clearPattern: () => void;
  readonly getNextOccurrence: (
    pattern: RecurrencePattern,
    fromDate: Date
  ) => Date | null;
}

/**
 * Hook for managing recurring booking patterns
 */
export const useRecurrenceHandler = (): UseRecurrenceHandlerReturn => {
  const [pattern, setPattern] = useState<RecurrencePattern | null>(null);

  /**
   * Validate a recurrence pattern
   *
   * @param pattern - Pattern to validate
   * @returns True if pattern is valid
   */
  const validatePattern = useCallback((pattern: RecurrencePattern): boolean => {
    // Check pattern type
    if (!pattern.type || !["weekly", "monthly"].includes(pattern.type)) {
      return false;
    }

    // Check interval
    if (!pattern.interval || pattern.interval < 1) {
      return false;
    }

    // For weekly patterns, check weekdays
    if (pattern.type === "weekly") {
      if (!pattern.weekdays || pattern.weekdays.length === 0) {
        return false;
      }

      // Weekdays should be 0-6 (Sunday-Saturday)
      const validWeekdays = pattern.weekdays.every(
        (day) => day >= 0 && day <= 6
      );
      if (!validWeekdays) {
        return false;
      }
    }

    // Check time slots
    if (!pattern.timeSlots || pattern.timeSlots.length === 0) {
      return false;
    }

    // Validate time slot format (HH:MM-HH:MM)
    const timeSlotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
    const validTimeSlots = pattern.timeSlots.every((slot) =>
      timeSlotRegex.test(slot)
    );
    if (!validTimeSlots) {
      return false;
    }

    return true;
  }, []);

  /**
   * Get the next occurrence date for a pattern
   *
   * @param pattern - Recurrence pattern
   * @param fromDate - Start date
   * @returns Next occurrence date or null
   */
  const getNextOccurrence = useCallback(
    (pattern: RecurrencePattern, fromDate: Date): Date | null => {
      if (!validatePattern(pattern)) {
        return null;
      }

      if (pattern.type === "weekly") {
        // For weekly patterns, find the next matching weekday
        const currentDayOfWeek = getDay(fromDate);
        const weekdays = pattern.weekdays || [];

        // Find next weekday in current week
        const nextDayInWeek = weekdays.find((day) => day > currentDayOfWeek);

        if (nextDayInWeek !== undefined) {
          // Next occurrence is in the current week
          const daysToAdd = nextDayInWeek - currentDayOfWeek;
          return addDays(fromDate, daysToAdd);
        } else {
          // Next occurrence is in the next interval week
          const firstWeekday = Math.min(...weekdays);
          const daysUntilNextWeek =
            7 - currentDayOfWeek + firstWeekday + (pattern.interval - 1) * 7;
          return addDays(fromDate, daysUntilNextWeek);
        }
      }

      if (pattern.type === "monthly") {
        // For monthly patterns, add the interval months
        return addMonths(fromDate, pattern.interval);
      }

      return null;
    },
    [validatePattern]
  );

  /**
   * Generate recurring time slots based on pattern
   *
   * @param pattern - Recurrence pattern
   * @param startDate - Start date for recurrence
   * @param zoneId - Zone ID
   * @param facilityId - Facility ID
   * @param pricePerHour - Price per hour for the zone
   * @param maxOccurrences - Maximum number of occurrences (default: 52)
   * @returns Array of generated time slots
   */
  const generateRecurringSlots = useCallback(
    (
      pattern: RecurrencePattern,
      startDate: Date,
      zoneId: string,
      facilityId: string,
      pricePerHour: number,
      maxOccurrences: number = 52
    ): readonly ISelectedTimeSlot[] => {
      if (!validatePattern(pattern)) {
        console.warn("Invalid recurrence pattern");
        return [];
      }

      const slots: ISelectedTimeSlot[] = [];
      let currentDate = new Date(startDate);
      let occurrenceCount = 0;

      // Limit to maxOccurrences or pattern's endDate
      const maxDate = pattern.endDate ? new Date(pattern.endDate) : null;

      while (
        occurrenceCount < maxOccurrences &&
        (!maxDate || currentDate <= maxDate)
      ) {
        if (pattern.type === "weekly") {
          // Generate slots for each weekday in the pattern
          const weekdays = pattern.weekdays || [];

          weekdays.forEach((weekday) => {
            const currentDayOfWeek = getDay(currentDate);
            const daysToAdd =
              weekday >= currentDayOfWeek
                ? weekday - currentDayOfWeek
                : 7 - currentDayOfWeek + weekday;

            const occurrenceDate = addDays(currentDate, daysToAdd);

            // Skip if beyond max date
            if (maxDate && occurrenceDate > maxDate) {
              return;
            }

            // Generate a slot for each time slot in the pattern
            pattern.timeSlots?.forEach((timeSlot) => {
              // Calculate duration from time slot
              const [startTime, endTime] = timeSlot.split("-");
              const startMinutes =
                parseInt(startTime.split(":")[0]) * 60 +
                parseInt(startTime.split(":")[1]);
              const endMinutes =
                parseInt(endTime.split(":")[0]) * 60 +
                parseInt(endTime.split(":")[1]);
              const duration = endMinutes - startMinutes;

              slots.push({
                id: `${facilityId}-${zoneId}-${
                  occurrenceDate.toISOString().split("T")[0]
                }-${timeSlot}`,
                facilityId,
                zoneId,
                date: occurrenceDate,
                timeSlot,
                duration,
                pricePerHour,
              });
            });
          });

          // Move to next interval week
          currentDate = addWeeks(currentDate, pattern.interval);
        } else if (pattern.type === "monthly") {
          // For monthly patterns, generate slots on the same day each month
          pattern.timeSlots?.forEach((timeSlot) => {
            // Calculate duration from time slot
            const [startTime, endTime] = timeSlot.split("-");
            const startMinutes =
              parseInt(startTime.split(":")[0]) * 60 +
              parseInt(startTime.split(":")[1]);
            const endMinutes =
              parseInt(endTime.split(":")[0]) * 60 +
              parseInt(endTime.split(":")[1]);
            const duration = endMinutes - startMinutes;

            slots.push({
              id: `${facilityId}-${zoneId}-${
                currentDate.toISOString().split("T")[0]
              }-${timeSlot}`,
              facilityId,
              zoneId,
              date: new Date(currentDate),
              timeSlot,
              duration,
              pricePerHour,
            });
          });

          // Move to next interval month
          currentDate = addMonths(currentDate, pattern.interval);
        }

        occurrenceCount++;
      }

      return slots;
    },
    [validatePattern]
  );

  /**
   * Clear the current recurrence pattern
   */
  const clearPattern = useCallback((): void => {
    setPattern(null);
  }, []);

  return {
    pattern,
    setPattern,
    generateRecurringSlots,
    validatePattern,
    clearPattern,
    getNextOccurrence,
  };
};
