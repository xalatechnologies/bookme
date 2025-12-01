"use client";

// External libraries
import React from "react";
import { useTranslation } from 'react-i18next';
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Trash2, Calendar, Clock } from "lucide-react";

// Internal libraries/utilities
import { Button } from "@/components/ui/button";

// Types
import { ISelectedSlotsDisplayProps, ISelectedTimeSlot } from "../../types";

/**
 * Selected slots display component
 *
 * Shows all selected time slots in a organized list with
 * options to remove individual slots or clear all selections.
 *
 * Features:
 * - List of selected time slots
 * - Individual slot removal
 * - Clear all functionality
 * - Responsive design
 * - Loading state support
 *
 * @param props - Selected slots display props
 */
export const SelectedSlotsDisplay: React.FC<ISelectedSlotsDisplayProps> = ({
  selectedSlots,
   
  onRemoveSlot: _onRemoveSlot,
  onClearAll,
  isLoading = false,
}): JSX.Element => {
  const { t } = useTranslation(['bookings','common']);

  /**
   * Get duration text for display
   *
   * @param duration - Duration in minutes
   * @returns Formatted duration text
   */
  const getDurationText = (duration: number): string => {
    // Convert minutes to hours
    const hours = duration / 60;
    return hours === 1 ? `1 ${t('bookings:time.hour', 'hour')}` : `${hours} ${t('bookings:time.hours', 'hours')}`;
  };


  /**
   * Group time slots into packages by date and consecutive times
   *
   * @param slots - Array of selected time slots
   * @returns Array of grouped time packages
   */
  const groupTimeSlotsIntoPackages = (slots: readonly ISelectedTimeSlot[]) => {
    // Convert readonly array to mutable for processing
    const mutableSlots = Array.from(slots);

    // Group by date first
    const dateGroups = mutableSlots.reduce((groups, slot) => {
      const dateKey = format(slot.date instanceof Date ? slot.date : new Date(slot.date), 'yyyy-MM-dd');
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
        dateFormatted: format(new Date(dateKey), 'dd. MMM', { locale: nb }),
        groups: consecutiveGroups.map(group => ({
          slots: group,
          startTime: group[0].timeSlot.split('-')[0],
          endTime: group[group.length - 1].timeSlot.split('-')[1],
          totalDuration: group.reduce((total, slot) => total + slot.duration, 0),
          totalPrice: group.reduce((total, slot) => total + (slot.pricePerHour * slot.duration), 0),
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
  };

  if (selectedSlots.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">
          {t('booking:details.select_slots_pricing', 'Select time slots and get a price calculation')}
        </p>
      </div>
    );
  }

  const timePackages = groupTimeSlotsIntoPackages(selectedSlots);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t('booking:details.selected_slots', 'Selected time slots')} ({selectedSlots.length})
        </h4>
        {selectedSlots.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {t('booking:sidebar.clear_all_slots', 'Remove all selected time slots')}
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {timePackages.map((datePackage) => (
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
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {group.isConsecutive
                        ? `(${group.startTime}-${group.endTime}) - (${getDurationText(group.totalDuration)})`
                        : `(${group.slots.map(slot => slot.timeSlot.split('-')[0]).join(', ')}) - (${getDurationText(group.totalDuration)})`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">{t('booking:details.total_hours', 'Total hours:')}</span>
          <span className="font-medium text-gray-900">
            {(() => {
              const totalHours = selectedSlots.reduce((total, slot) => total + slot.duration, 0) / 60;
              return totalHours === 1 ? `1 ${t('bookings:time.hour', 'hour')}` : `${totalHours} ${t('bookings:time.hours', 'hours')}`;
            })()}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">{t('booking:details.total_cost', 'Total cost')}:</span>
          <span className="font-semibold text-gray-900">
            {selectedSlots.reduce((total, slot) => total + (slot.pricePerHour * slot.duration), 0)} kr
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectedSlotsDisplay;
