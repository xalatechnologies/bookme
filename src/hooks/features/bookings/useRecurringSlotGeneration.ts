/**
 * Recurring Slot Generation Hook
 *
 * Handles recurring booking pattern generation and slot creation.
 * Provides pattern validation and occurrence generation logic.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  addDays,
  addWeeks,
  addMonths,
  getDay,
  parseISO,
  isValid,
} from 'date-fns';
import type { ISelectedTimeSlot, IZone } from '@/components/features/bookings/types';
import type { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';

export interface IUseRecurringSlotGenerationOptions {
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly selectedZone?: IZone;
  readonly facilityId: string;
  readonly debounceMs?: number;
}

export interface IUseRecurringSlotGenerationReturn {
  readonly recurringSlots: readonly ISelectedTimeSlot[];
  readonly generateSlots: (pattern: RecurrencePattern) => void;
  readonly clearSlots: () => void;
  readonly isGenerating: boolean;
}

/**
 * Hook for generating recurring booking slots based on patterns
 *
 * Provides comprehensive recurring slot generation including:
 * - Weekly, biweekly, monthly, and custom patterns
 * - Multiple weekday support
 * - Consecutive time slot grouping
 * - Debounced generation
 * - Pattern validation
 *
 * @param options - Configuration including selected slots and facility
 * @returns Recurring slot generation interface
 *
 * @example
 * ```tsx
 * function RecurringBookingForm() {
 *   const { recurringSlots, generateSlots, clearSlots } =
 *     useRecurringSlotGeneration({
 *       selectedSlots,
 *       selectedZone,
 *       facilityId,
 *     });
 *
 *   const handlePatternChange = (pattern: RecurrencePattern) => {
 *     generateSlots(pattern);
 *   };
 *
 *   return (
 *     <div>
 *       <PatternSelector onPatternChange={handlePatternChange} />
 *       <SlotPreview slots={recurringSlots} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useRecurringSlotGeneration = (
  options: IUseRecurringSlotGenerationOptions
): IUseRecurringSlotGenerationReturn => {
  const {
    selectedSlots,
    selectedZone,
    facilityId,
    debounceMs = 500,
  } = options;

  const [recurringSlots, setRecurringSlots] = useState<ISelectedTimeSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Group time slots into packages by date and consecutive times
   */
  const groupTimeSlotsIntoPackages = useCallback(
    (slots: readonly ISelectedTimeSlot[]) => {
      // Group by date first
      const dateGroups = slots.reduce((groups, slot) => {
        // Safely handle date conversion
        let date: Date;
        if (slot.date instanceof Date) {
          date = slot.date;
        } else if (typeof slot.date === 'string') {
          date = parseISO(slot.date);
        } else {
          date = new Date(slot.date);
        }

        // Validate date
        if (!isValid(date)) {
          console.warn('Invalid date for slot:', slot);
          return groups;
        }

        const dateKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(slot);
        return groups;
      }, {} as Record<string, ISelectedTimeSlot[]>);

      // Process each date group
      return Object.entries(dateGroups).map(([dateKey, dateSlots]) => {
        // Sort by start time
        const sortedSlots = [...dateSlots].sort((a, b) => {
          const timeA = a.timeSlot.split('-')[0];
          const timeB = b.timeSlot.split('-')[0];
          return timeA.localeCompare(timeB);
        });

        // Group consecutive time slots
        const consecutiveGroups: ISelectedTimeSlot[][] = [];
        let currentGroup: ISelectedTimeSlot[] = [sortedSlots[0]];

        for (let i = 1; i < sortedSlots.length; i++) {
          const prevSlot = sortedSlots[i - 1];
          const currentSlot = sortedSlots[i];

          // Check if current slot is consecutive to previous
          const prevEndTime = prevSlot.timeSlot.split('-')[1];
          const currentStartTime = currentSlot.timeSlot.split('-')[0];

          if (prevEndTime === currentStartTime) {
            // Consecutive - add to current group
            currentGroup.push(currentSlot);
          } else {
            // Not consecutive - start new group
            consecutiveGroups.push([...currentGroup]);
            currentGroup = [currentSlot];
          }
        }

        // Add the last group
        consecutiveGroups.push(currentGroup);

        return {
          date: dateKey,
          groups: consecutiveGroups.map((group) => ({
            slots: group,
            startTime: group[0].timeSlot.split('-')[0],
            endTime: group[group.length - 1].timeSlot.split('-')[1],
            totalDuration: group.reduce((total, slot) => total + slot.duration, 0),
          })),
        };
      });
    },
    []
  );

  /**
   * Generate recurring slots based on pattern
   */
  const generateSlots = useCallback(
    (pattern: RecurrencePattern): void => {
      if (!selectedSlots.length || !selectedZone) {
        setRecurringSlots([]);
        return;
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsGenerating(true);

      // Debounce generation
      timeoutRef.current = setTimeout(() => {
        const timePackages = groupTimeSlotsIntoPackages(selectedSlots);
        const templatePackage = timePackages[0];
        if (!templatePackage) {
          setRecurringSlots([]);
          setIsGenerating(false);
          return;
        }

        const templateGroup = templatePackage.groups[0];
        if (!templateGroup) {
          setRecurringSlots([]);
          setIsGenerating(false);
          return;
        }

        // Build weekday to group mapping
        const weekdayToGroup = new Map<
          number,
          { startTime: string; endTime: string; totalDuration: number }
        >();
        const weekdayToFirstDate = new Map<number, Date>();

        for (const datePackage of timePackages) {
          const [y, m, d] = datePackage.date.split('-').map(Number);
          const localDate = new Date(y, (m || 1) - 1, d || 1);
          const wd = localDate.getDay();
          const grp = datePackage.groups && datePackage.groups[0];
          if (grp && !weekdayToGroup.has(wd)) {
            weekdayToGroup.set(wd, {
              startTime: grp.startTime,
              endTime: grp.endTime,
              totalDuration: grp.totalDuration,
            });
          }
          if (!weekdayToFirstDate.has(wd)) {
            weekdayToFirstDate.set(wd, localDate);
          }
        }

        const defaultGroup = {
          startTime: templateGroup.startTime,
          endTime: templateGroup.endTime,
          totalDuration: templateGroup.totalDuration,
        };

        // Determine start date from most common date
        const dateCounts = selectedSlots.reduce((counts, slot) => {
          const slotDate =
            slot.date instanceof Date ? slot.date : new Date(slot.date);
          const dateKey = `${slotDate.getFullYear()}-${String(
            slotDate.getMonth() + 1
          ).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}`;
          counts[dateKey] = (counts[dateKey] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);

        const mostCommonDate = Object.entries(dateCounts).reduce((a, b) =>
          dateCounts[a[0]] > dateCounts[b[0]] ? a : b
        )[0];

        let startDate: Date;
        if (mostCommonDate) {
          startDate = parseISO(mostCommonDate);
        } else {
          const rawStartDate = pattern.startDate || selectedSlots[0].date;
          if (rawStartDate instanceof Date) {
            startDate = rawStartDate;
          } else if (typeof rawStartDate === 'string') {
            startDate = parseISO(rawStartDate);
          } else {
            startDate = new Date(rawStartDate);
          }
        }

        if (!isValid(startDate)) {
          console.error('Invalid startDate:', mostCommonDate || pattern.startDate);
          setRecurringSlots([]);
          setIsGenerating(false);
          return;
        }

        const maxOccurrences = Math.max(1, pattern.maxOccurrences || 5);
        const occurrences: ISelectedTimeSlot[] = [];

        // Generate based on pattern type
        if (pattern.type === 'weekly' || pattern.type === 'biweekly') {
          const weekIncrement = pattern.type === 'biweekly' ? 2 : 1;
          const selectedWeekdays =
            pattern.weekdays && pattern.weekdays.length > 0
              ? [...pattern.weekdays]
              : [getDay(startDate)];

          type WeekdayCursor = { weekday: number; date: Date };
          const cursors: WeekdayCursor[] = selectedWeekdays.map((weekday) => {
            const templateFirst = weekdayToFirstDate.get(weekday);
            if (templateFirst) {
              return { weekday, date: new Date(templateFirst) };
            }
            const startDow = getDay(startDate);
            const daysToAdd = (weekday - startDow + 7) % 7;
            const firstDate = addDays(startDate, daysToAdd);
            return { weekday, date: firstDate };
          });

          const perWeekdayCount = new Map<number, number>();
          selectedWeekdays.forEach((w) => perWeekdayCount.set(w, 0));

          let occurrenceCount = 0;
          const targetTotal = maxOccurrences * selectedWeekdays.length;

          while (occurrenceCount < targetTotal && cursors.length > 0) {
            let earliestIndex = 0;
            for (let i = 1; i < cursors.length; i++) {
              if (cursors[i].date < cursors[earliestIndex].date) {
                earliestIndex = i;
              }
            }

            const next = cursors[earliestIndex];
            const nextDate = next.date;
            const groupForWeekday =
              weekdayToGroup.get(next.weekday) || defaultGroup;
            const timeSlot = `${groupForWeekday.startTime}-${groupForWeekday.endTime}`;
            const duration = groupForWeekday.totalDuration;

            const currentCount = perWeekdayCount.get(next.weekday) || 0;
            if (currentCount >= maxOccurrences) {
              cursors.splice(earliestIndex, 1);
              continue;
            }

            occurrences.push({
              id: `${
                selectedZone.id
              }-${nextDate.getTime()}-${timeSlot}-recurring-${occurrenceCount}`,
              facilityId,
              zoneId: selectedZone.id,
              date: nextDate,
              timeSlot,
              duration,
              pricePerHour: selectedZone.pricePerHour || 0,
              zoneName: selectedZone.name,
              isRecurring: true,
              recurrencePattern: pattern,
              parentBookingId: selectedSlots[0].id,
            });

            occurrenceCount++;
            perWeekdayCount.set(next.weekday, currentCount + 1);

            const advancedDate = addWeeks(nextDate, weekIncrement);
            if ((perWeekdayCount.get(next.weekday) || 0) >= maxOccurrences) {
              cursors.splice(earliestIndex, 1);
            } else {
              cursors[earliestIndex] = {
                weekday: next.weekday,
                date: advancedDate,
              };
            }
          }
        } else if (pattern.type === 'monthly') {
          const timeSlots = [`${templateGroup.startTime}-${templateGroup.endTime}`];
          let occurrenceCount = 0;
          const targetWeekday =
            pattern.weekdays && pattern.weekdays.length > 0
              ? pattern.weekdays[0]
              : getDay(startDate);

          let monthCursor = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            1
          );

          while (occurrenceCount < maxOccurrences) {
            const monthStartDay = getDay(monthCursor);
            const add = (targetWeekday - monthStartDay + 7) % 7;
            let occ = addDays(monthCursor, add);

            if (
              occ < startDate &&
              monthCursor.getMonth() === startDate.getMonth() &&
              monthCursor.getFullYear() === startDate.getFullYear()
            ) {
              occ = addDays(occ, 7);
            }

            for (const timeSlot of timeSlots) {
              if (occurrenceCount >= maxOccurrences) break;
              const [startTime, endTime] = timeSlot.split('-');
              const startMinutes =
                parseInt(startTime.split(':')[0]) * 60 +
                parseInt(startTime.split(':')[1]);
              const endMinutes =
                parseInt(endTime.split(':')[0]) * 60 +
                parseInt(endTime.split(':')[1]);
              const duration = endMinutes - startMinutes;
              occurrences.push({
                id: `${
                  selectedZone.id
                }-${occ.getTime()}-${timeSlot}-recurring-${occurrenceCount}`,
                facilityId,
                zoneId: selectedZone.id,
                date: new Date(occ),
                timeSlot,
                duration,
                pricePerHour: selectedZone.pricePerHour || 0,
                zoneName: selectedZone.name,
                isRecurring: true,
                recurrencePattern: pattern,
                parentBookingId: selectedSlots[0].id,
              });
              occurrenceCount++;
            }

            monthCursor = addMonths(monthCursor, 1);
          }
        } else if (pattern.type === 'custom') {
          const timeSlots = [`${templateGroup.startTime}-${templateGroup.endTime}`];
          const intervalDays = Math.max(1, pattern.interval || 1);
          let occurrenceCount = 0;
          let occurrenceDate = new Date(startDate);
          while (occurrenceCount < maxOccurrences) {
            for (const timeSlot of timeSlots) {
              if (occurrenceCount >= maxOccurrences) break;
              const [startTime, endTime] = timeSlot.split('-');
              const startMinutes =
                parseInt(startTime.split(':')[0]) * 60 +
                parseInt(startTime.split(':')[1]);
              const endMinutes =
                parseInt(endTime.split(':')[0]) * 60 +
                parseInt(endTime.split(':')[1]);
              const duration = endMinutes - startMinutes;
              occurrences.push({
                id: `${
                  selectedZone.id
                }-${occurrenceDate.getTime()}-${timeSlot}-recurring-${occurrenceCount}`,
                facilityId,
                zoneId: selectedZone.id,
                date: new Date(occurrenceDate),
                timeSlot,
                duration,
                pricePerHour: selectedZone.pricePerHour || 0,
                zoneName: selectedZone.name,
                isRecurring: true,
                recurrencePattern: pattern,
                parentBookingId: selectedSlots[0].id,
              });
              occurrenceCount++;
            }
            occurrenceDate = addDays(occurrenceDate, intervalDays);
          }
        }

        setRecurringSlots(occurrences);
        setIsGenerating(false);
      }, debounceMs);
    },
    [selectedSlots, selectedZone, facilityId, debounceMs, groupTimeSlotsIntoPackages]
  );

  /**
   * Clear all recurring slots
   */
  const clearSlots = useCallback((): void => {
    setRecurringSlots([]);
  }, []);

  return {
    recurringSlots,
    generateSlots,
    clearSlots,
    isGenerating,
  };
};
