import React, { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { parseISO, isValid } from 'date-fns';
import { ISelectedTimeSlot } from '@/components/features/bookings/types';

/**
 * Time slot package display props
 */
export interface ITimeSlotPackageDisplayProps {
  readonly slots: readonly ISelectedTimeSlot[];
  readonly variant?: 'default' | 'template';
}

/**
 * Grouped time package interface
 */
interface ITimePackage {
  readonly date: string;
  readonly dateFormatted: string;
  readonly groups: readonly {
    readonly slots: readonly ISelectedTimeSlot[];
    readonly startTime: string;
    readonly endTime: string;
    readonly totalDuration: number;
    readonly isConsecutive: boolean;
  }[];
}

/**
 * Time slot package display component
 *
 * Displays time slots grouped by date and consecutive times
 * Shows intelligently grouped time packages for better UX
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const TimeSlotPackageDisplay = ({
  slots,
  variant = 'default'
}: ITimeSlotPackageDisplayProps): JSX.Element => {
  /**
   * Group time slots into packages by date and consecutive times
   */
  const timePackages = useMemo((): readonly ITimePackage[] => {
    // Group by date first
    const dateGroups = slots.reduce((groups, slot) => {
      let date: Date;
      if (slot.date instanceof Date) {
        date = slot.date;
      } else if (typeof slot.date === 'string') {
        date = parseISO(slot.date);
      } else {
        date = new Date(slot.date);
      }

      if (!isValid(date)) {
        console.warn('Invalid date for slot:', slot);
        return groups;
      }

      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
      return groups;
    }, {} as Record<string, ISelectedTimeSlot[]>);

    // Process each date group
    return Object.entries(dateGroups).map(([dateKey, dateSlots]) => {
      // Sort by start time
      const sortedSlots = dateSlots.sort((a, b) => {
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

        const prevEndTime = prevSlot.timeSlot.split('-')[1];
        const currentStartTime = currentSlot.timeSlot.split('-')[0];

        if (prevEndTime === currentStartTime) {
          currentGroup.push(currentSlot);
        } else {
          consecutiveGroups.push([...currentGroup]);
          currentGroup = [currentSlot];
        }
      }

      consecutiveGroups.push(currentGroup);

      return {
        date: dateKey,
        dateFormatted: new Date(dateKey).toLocaleDateString('nb-NO'),
        groups: consecutiveGroups.map(group => ({
          slots: group,
          startTime: group[0].timeSlot.split('-')[0],
          endTime: group[group.length - 1].timeSlot.split('-')[1],
          totalDuration: group.reduce((total, slot) => total + slot.duration, 0),
          isConsecutive: group.length === 1 ||
            group.every((slot, index) => {
              if (index === 0) return true;
              const prevEndTime = group[index - 1].timeSlot.split('-')[1];
              const currentStartTime = slot.timeSlot.split('-')[0];
              return prevEndTime === currentStartTime;
            })
        }))
      };
    });
  }, [slots]);

  const isTemplate = variant === 'template';

  return (
    <div className="space-y-2">
      {isTemplate && (
        <div className="text-xs text-blue-600 font-medium mb-2">
          Mal for gjentakelse
        </div>
      )}

      {[...timePackages].sort((a, b) => {
        const ad = new Date(a.date);
        const bd = new Date(b.date);
        return ad.getTime() - bd.getTime();
      }).map((datePackage) => (
        <div key={datePackage.date} className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">
              {datePackage.dateFormatted}
            </span>
          </div>

          {datePackage.groups.map((group, groupIndex) => (
            <div
              key={`${datePackage.date}-${groupIndex}`}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isTemplate
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Clock className={`h-3 w-3 ${isTemplate ? 'text-blue-600' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isTemplate ? 'text-blue-900' : 'text-blue-900'}`}>
                    {group.isConsecutive
                      ? `(${group.startTime}-${group.endTime}) - (${group.totalDuration / 60 === 1 ? '1 time' : `${group.totalDuration / 60} timer`})`
                      : `(${group.slots.map(slot => slot.timeSlot.split('-')[0]).join(', ')}) - (${group.totalDuration / 60 === 1 ? '1 time' : `${group.totalDuration / 60} timer`})`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
