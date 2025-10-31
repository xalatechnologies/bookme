/**
 * CalendarRenderer Component
 *
 * Pure calendar display component responsible for:
 * - Week navigation UI
 * - Calendar grid rendering
 * - Date display
 * - Zone selection
 * - Legend display
 *
 * Separated from business logic for better maintainability.
 */

import React from "react";
import { format, addDays } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeSlotGrid } from "../../EnhancedCalendar/TimeSlotGrid";
import { AvailabilityLegend } from "../../EnhancedCalendar/AvailabilityLegend";
import type {
  ISelectedTimeSlot,
  IZone,
} from "@/components/features/bookings/types";

export interface CalendarWeek {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly days: readonly {
    readonly date: Date;
    readonly isToday: boolean;
    readonly isWeekend: boolean;
    readonly isHoliday: boolean;
    readonly holidayName?: string;
    readonly isPast: boolean;
    readonly timeSlots: readonly unknown[];
  }[];
}

export interface CalendarRendererProps {
  readonly facilityId: string;
  readonly zones: readonly IZone[];
  readonly selectedZoneId: string;
  readonly onZoneChange: (zoneId: string) => void;
  readonly calendarWeek: CalendarWeek;
  readonly currentWeekStart: Date;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly onSlotClick: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    status: string
  ) => void;
  readonly onBulkSelect: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly pricePerHour: number;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly getAvailabilityStatus?: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => {
    status: string;
    conflict?: { readonly id: string; readonly title: string };
  };
  readonly isSlotSelected?: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly openingHoursStart: string;
  readonly openingHoursEnd: string;
}

/**
 * CalendarRenderer Component
 *
 * Renders the calendar grid with navigation controls
 */
export const CalendarRenderer: React.FC<CalendarRendererProps> = ({
  facilityId,
  zones,
  selectedZoneId,
  onZoneChange,
  calendarWeek,
  currentWeekStart,
  onPreviousWeek,
  onNextWeek,
  selectedSlots,
  onSlotClick,
  onBulkSelect,
  pricePerHour,
  isLoading = false,
  error,
  getAvailabilityStatus,
  isSlotSelected,
  openingHoursStart,
  openingHoursEnd,
}): JSX.Element => {
  const { t } = useTranslation("calendar");

  return (
    <div className="space-y-4">
      {/* Zone Selection */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {zones.map((zone) => (
              <Button
                key={zone.id}
                variant={selectedZoneId === zone.id ? "default" : "outline"}
                onClick={() => onZoneChange(zone.id)}
                className="flex items-center gap-2 text-base px-4 py-2"
                size="lg"
              >
                <Users className="h-4 w-4" />
                {zone.name}
                <Badge variant="secondary" className="ml-1 text-sm">
                  {zone.area ? `${zone.area} m²` : "120 m²"}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPreviousWeek} size="lg">
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("navigation.previous_week")}
        </Button>
        <div className="text-center">
          <h3 className="text-xl font-semibold">
            {format(currentWeekStart, "dd. MMMM", { locale: nb })} -{" "}
            {format(addDays(currentWeekStart, 6), "dd. MMMM yyyy", {
              locale: nb,
            })}
          </h3>
        </div>
        <Button variant="outline" onClick={onNextWeek} size="lg">
          {t("navigation.next_week")}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <TimeSlotGrid
            facilityId={facilityId}
            zoneId={selectedZoneId}
            week={calendarWeek}
            selectedSlots={selectedSlots}
            onSlotClick={onSlotClick}
            onBulkSelect={onBulkSelect}
            pricePerHour={pricePerHour}
            isLoading={isLoading}
            error={error}
            getAvailabilityStatus={getAvailabilityStatus}
            isSlotSelected={isSlotSelected}
            openingHoursStart={openingHoursStart}
            openingHoursEnd={openingHoursEnd}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <AvailabilityLegend />
    </div>
  );
};
