"use client";

// External imports
import React, { useState, useCallback, useMemo } from "react";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';

// Internal imports
import type { Zone, SelectedTimeSlot, AvailabilityStatus } from '@/types/booking';

// Sibling imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarGrid } from "@/components/features/calendar/components/EnhancedCalendar/CalendarGrid";

interface CalendarProps {
  readonly zones: readonly Zone[];
  readonly selectedSlots: readonly SelectedTimeSlot[];
  readonly onSlotClick: (zoneId: string, date: Date, timeSlot: string, availability: string) => void;
  readonly onBulkSlotSelection?: (slots: readonly SelectedTimeSlot[]) => void;
  readonly getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => AvailabilityStatus;
  readonly isSlotSelected: (zoneId: string, date: Date, timeSlot: string) => boolean;
  readonly timeSlotDuration?: number;
  readonly showZoneSelector?: boolean;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
  readonly compact?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  zones,
  selectedSlots,
  onSlotClick,
  onBulkSlotSelection,
  getAvailabilityStatus,
  isSlotSelected,
  timeSlotDuration = 1,
  showZoneSelector = true,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
  compact = false
}): JSX.Element => {
  const { t } = useTranslation('common');
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');

  // Generate time slots based on duration and opening hours
  const timeSlots = useMemo(() => {
    const startHour = parseInt(openingHoursStart.split(':')[0]);
    const endHour = parseInt(openingHoursEnd.split(':')[0]);
    const totalHours = endHour - startHour;
    const slotCount = Math.floor(totalHours / timeSlotDuration);
    
    return Array.from({ length: slotCount }, (_, i) => {
      const hour = startHour + (i * timeSlotDuration);
      const nextHour = hour + timeSlotDuration;
      return `${hour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`;
    });
  }, [openingHoursStart, openingHoursEnd, timeSlotDuration]);

  const handlePreviousWeek = useCallback((): void => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback((): void => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  const selectedZone = zones.find(zone => zone.id === selectedZoneId) || zones[0];

  if (!selectedZone) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Ingen soner tilgjengelig</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? 'max-w-4xl' : 'w-full'}`}>
      {/* Calendar Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-xl font-semibold">
              {format(currentWeekStart, "MMMM yyyy")}
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
              {t('calendar:navigation.previous_week')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              {t('calendar:navigation.next_week')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {showZoneSelector && zones.length > 1 && (
          <CardContent className="pt-0 pb-4">
            <div className="flex flex-wrap gap-2">
              {zones.map((zone) => (
                <Button
                  key={zone.id}
                  variant={selectedZoneId === zone.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedZoneId(zone.id)}
                  className="text-sm"
                >
                  {zone.name}
                </Button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Calendar Grid */}
      <CalendarGrid
        zone={selectedZone}
        currentWeekStart={currentWeekStart}
        timeSlots={timeSlots}
        selectedSlots={selectedSlots}
        getAvailabilityStatus={getAvailabilityStatus}
        isSlotSelected={isSlotSelected}
        onSlotClick={onSlotClick}
        onBulkSlotSelection={onBulkSlotSelection}
        openingHoursStart={openingHoursStart}
        openingHoursEnd={openingHoursEnd}
      />

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Ledig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Opptatt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Valgt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Ikke tilgjengelig</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
