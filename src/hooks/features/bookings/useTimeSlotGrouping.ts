/**
 * Time Slot Grouping Hook
 *
 * Provides utility functions for grouping and organizing time slots.
 * Handles consecutive slot grouping, date grouping, and formatting.
 */

import { useMemo, useCallback } from 'react';
import { parseISO, isValid } from 'date-fns';
import type { ISelectedTimeSlot } from '@/components/features/bookings/types';

export interface ITimeSlotGroup {
  readonly slots: readonly ISelectedTimeSlot[];
  readonly startTime: string;
  readonly endTime: string;
  readonly totalDuration: number;
  readonly isConsecutive: boolean;
}

export interface IDatePackage {
  readonly date: string;
  readonly dateFormatted: string;
  readonly groups: readonly ITimeSlotGroup[];
}

export interface IUseTimeSlotGroupingReturn {
  readonly groupedSlots: readonly IDatePackage[];
  readonly totalSlots: number;
  readonly totalDuration: number;
  readonly groupSlotsByDate: (slots: readonly ISelectedTimeSlot[]) => readonly IDatePackage[];
}

/**
 * Hook for grouping and organizing time slots
 *
 * Provides comprehensive time slot grouping including:
 * - Grouping by date
 * - Consecutive slot detection
 * - Duration calculation
 * - Formatted date strings
 * - Sorting and ordering
 *
 * @param slots - Time slots to group
 * @returns Grouped and organized time slots
 *
 * @example
 * ```tsx
 * function TimeSlotSummary({ slots }: { slots: ISelectedTimeSlot[] }) {
 *   const { groupedSlots, totalDuration } = useTimeSlotGrouping(slots);
 *
 *   return (
 *     <div>
 *       <p>Total duration: {totalDuration} minutes</p>
 *       {groupedSlots.map(datePackage => (
 *         <div key={datePackage.date}>
 *           <h3>{datePackage.dateFormatted}</h3>
 *           {datePackage.groups.map((group, idx) => (
 *             <div key={idx}>
 *               {group.startTime} - {group.endTime}
 *               ({group.totalDuration} min)
 *             </div>
 *           ))}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useTimeSlotGrouping = (
  slots: readonly ISelectedTimeSlot[]
): IUseTimeSlotGroupingReturn => {
  /**
   * Group time slots into packages by date and consecutive times
   */
  const groupSlotsByDate = useCallback(
    (slotsToGroup: readonly ISelectedTimeSlot[]): readonly IDatePackage[] => {
      // Group by date first
      const dateGroups = slotsToGroup.reduce((groups, slot) => {
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
          dateFormatted: new Date(dateKey).toLocaleDateString('nb-NO'),
          groups: consecutiveGroups.map((group) => ({
            slots: group,
            startTime: group[0].timeSlot.split('-')[0],
            endTime: group[group.length - 1].timeSlot.split('-')[1],
            totalDuration: group.reduce((total, slot) => total + slot.duration, 0),
            isConsecutive:
              group.length === 1 ||
              group.every((slot, index) => {
                if (index === 0) return true;
                const prevEndTime = group[index - 1].timeSlot.split('-')[1];
                const currentStartTime = slot.timeSlot.split('-')[0];
                return prevEndTime === currentStartTime;
              }),
          })),
        };
      });
    },
    []
  );

  /**
   * Memoized grouped slots
   */
  const groupedSlots = useMemo(
    () => groupSlotsByDate(slots),
    [slots, groupSlotsByDate]
  );

  /**
   * Calculate total number of slots
   */
  const totalSlots = useMemo(() => slots.length, [slots]);

  /**
   * Calculate total duration across all slots
   */
  const totalDuration = useMemo(
    () => slots.reduce((total, slot) => total + slot.duration, 0),
    [slots]
  );

  return {
    groupedSlots,
    totalSlots,
    totalDuration,
    groupSlotsByDate,
  };
};
