"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTimeSlotGrouping } from "@/hooks/features/bookings";
import type { ISelectedTimeSlot } from "@/components/features/bookings/types";
import type { IDatePackage } from "@/hooks/features/bookings/useTimeSlotGrouping";

export interface ITimeSlotDisplayProps {
  readonly slots: readonly ISelectedTimeSlot[];
  readonly recurringSlots?: readonly ISelectedTimeSlot[];
  readonly bookingType: "one-time" | "recurring";
  readonly onRemoveSlot?: (slotId: string) => void;
  readonly onClearAll?: () => void;
  readonly showClearButton?: boolean;
  readonly maxPreviewSlots?: number;
}

/**
 * Time Slot Display Component
 *
 * Displays selected time slots in a grouped, organized format.
 * Shows consecutive slots as time ranges.
 *
 * @example
 * ```tsx
 * <TimeSlotDisplay
 *   slots={selectedSlots}
 *   recurringSlots={recurringSlots}
 *   bookingType="recurring"
 *   onClearAll={handleClearAll}
 * />
 * ```
 */
export const TimeSlotDisplay: React.FC<ITimeSlotDisplayProps> = ({
  slots,
  recurringSlots = [],
  bookingType,
  onRemoveSlot,
  onClearAll,
  showClearButton = true,
  maxPreviewSlots = 5,
}): JSX.Element => {
  const { t } = useTranslation("bookings");
  const { groupedSlots } = useTimeSlotGrouping(slots);
  const { groupedSlots: groupedRecurringSlots } = useTimeSlotGrouping(recurringSlots);

  /**
   * Render time slot group
   */
  const renderSlotGroup = (
    group: {
      readonly slots: readonly ISelectedTimeSlot[];
      readonly startTime: string;
      readonly endTime: string;
      readonly totalDuration: number;
      readonly isConsecutive: boolean;
    },
    isRecurring: boolean = false
  ): JSX.Element => {
    const durationHours = group.totalDuration / 60;
    const durationText =
      durationHours === 1 ? `1 ${t('time.hour', 'time')}` : `${durationHours} ${t('time.hours', 'timer')}`;

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {group.isConsecutive
                ? `(${group.startTime}-${group.endTime}) - (${durationText})`
                : `(${group.slots
                    .map((slot) => slot.timeSlot.split("-")[0])
                    .join(", ")}) - (${durationText})`}
            </span>
          </div>
        </div>
        {isRecurring && (
          <Badge variant="secondary" className="text-xs ml-2">
            {t('recurrence.recurring', 'Gjentakende')}
          </Badge>
        )}
      </div>
    );
  };

  /**
   * Render date package
   */
  const renderDatePackage = (
    datePackage: IDatePackage,
    isRecurring: boolean = false
  ): JSX.Element => {
    return (
      <div key={datePackage.date} className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">
            {datePackage.dateFormatted}
          </span>
        </div>
        {datePackage.groups.map((group, groupIndex) => (
          <div key={`${datePackage.date}-${groupIndex}`}>
            {renderSlotGroup(group, isRecurring)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Template slots for recurring bookings */}
      {bookingType === "recurring" && slots.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-blue-600 font-medium mb-2">
            {t('sidebar.template_for_recurrence', 'Mal for gjentakelse')}
          </div>
          {[...groupedSlots]
            .sort((a, b) => {
              const ad = new Date(a.date);
              const bd = new Date(b.date);
              return ad.getTime() - bd.getTime();
            })
            .map((datePackage) => renderDatePackage(datePackage, false))}
        </div>
      )}

      {/* One-time booking slots */}
      {bookingType === "one-time" && slots.length > 0 && (
        <div className="space-y-2">
          {groupedSlots.map((datePackage) =>
            renderDatePackage(datePackage, false)
          )}
        </div>
      )}

      {/* Recurring slots preview */}
      {bookingType === "recurring" && recurringSlots.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2">
            {t('sidebar.recurring_instances', 'Gjentakende forekomster ({{count}} totalt):', { count: recurringSlots.length })}
          </div>
          {groupedRecurringSlots
            .slice(0, maxPreviewSlots)
            .map((datePackage) => renderDatePackage(datePackage, true))}
          {recurringSlots.length > maxPreviewSlots && (
            <div className="text-xs text-gray-500 text-center py-1">
              {t('sidebar.and_more', '... og {{count}} til', { count: recurringSlots.length - maxPreviewSlots })}
            </div>
          )}
        </div>
      )}

      {/* Clear All Button */}
      {showClearButton &&
        (slots.length > 1 || recurringSlots.length > 0) &&
        onClearAll && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="w-full text-gray-500 hover:text-red-500 hover:bg-red-50"
              aria-label={t('sidebar.clear_all_slots', 'Fjern alle valgte tidspunkter')}
            >
              <X className="h-3 w-3 mr-1" />
              {t('sidebar.clear_all_slots', 'Fjern alle valgte tidspunkter')}
            </Button>
          </div>
        )}
    </div>
  );
};
