import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeSlotGrid } from '@/components/features/calendar/components/EnhancedCalendar/TimeSlotGrid';
import { AvailabilityLegend } from '@/components/features/calendar/components/EnhancedCalendar/AvailabilityLegend';
import { useWeekNavigation } from '../hooks';

import { ISelectedTimeSlot } from '@/components/features/bookings/types';

/**
 * Step 1 Calendar props
 */
export interface IStep1CalendarProps {
  readonly facilityId: string;
  readonly selectedZone: {
    readonly id: string;
    readonly name: string;
    readonly pricePerHour?: number;
  };
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly onSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly getAvailabilityStatus?: (zoneId: string, date: Date, timeSlot: string) => {
    status: string;
    conflict?: { readonly id: string; readonly title: string };
  };
  readonly isSlotSelected?: (zoneId: string, date: Date, timeSlot: string) => boolean;
}

/**
 * Step 1: Calendar/Time Selection Component
 *
 * Allows users to select date and time slots from a weekly calendar view
 * Supports navigation between weeks and visual availability indicators
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const Step1Calendar = ({
  facilityId,
  selectedZone,
  selectedSlots,
  onSlotsChange,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
  isLoading = false,
  error,
  getAvailabilityStatus,
  isSlotSelected
}: IStep1CalendarProps): JSX.Element => {
  const { t } = useTranslation(['booking', 'calendar', 'common']);

  /**
   * Week navigation hook
   */
  const { currentWeek, goToPreviousWeek, goToNextWeek } = useWeekNavigation({
    initialDate: new Date(),
    weekStartsOn: 1 // Monday
  });

  /**
   * Check if slot is selected
   */
  const isSlotSelectedLocal = useCallback((zoneId: string, date: Date, timeSlot: string): boolean => {
    return selectedSlots.some(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      return slot.zoneId === zoneId &&
             slotDate.toDateString() === date.toDateString() &&
             slot.timeSlot === timeSlot;
    });
  }, [selectedSlots]);

  /**
   * Handle slot click (toggle selection)
   */
  const handleSlotClick = useCallback((zoneId: string, date: Date, timeSlot: string, status: string) => {
    if (status === "available" || status === "selected") {
      const existingIndex = selectedSlots.findIndex(slot => {
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        return slot.zoneId === zoneId &&
               slotDate.toDateString() === date.toDateString() &&
               slot.timeSlot === timeSlot;
      });

      if (existingIndex >= 0) {
        // Remove slot
        const updatedSlots = selectedSlots.filter((_, index) => index !== existingIndex);
        onSlotsChange(updatedSlots);
      } else {
        // Add slot
        const localDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const newSlot: ISelectedTimeSlot = {
          id: `${facilityId}-${zoneId}-${localDateString}-${timeSlot}`,
          facilityId,
          zoneId,
          date,
          timeSlot,
          duration: 60, // Default 1 hour in minutes
          pricePerHour: selectedZone?.pricePerHour || 0,
        };
        onSlotsChange([...selectedSlots, newSlot]);
      }
    }
  }, [selectedSlots, onSlotsChange, facilityId, selectedZone]);

  /**
   * Handle bulk slot selection
   */
  const handleBulkSelect = useCallback((slots: readonly ISelectedTimeSlot[]) => {
    const enrichedSlots = slots.map(slot => ({
      ...slot,
      facilityId,
      pricePerHour: selectedZone?.pricePerHour || 0,
    }));
    onSlotsChange([...selectedSlots, ...enrichedSlots]);
  }, [selectedSlots, onSlotsChange, facilityId, selectedZone]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('booking:steps.calendar.title', 'Velg tidspunkter')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('booking:steps.calendar.description', 'Klikk på ledige tidspunkter for å velge dem. Du kan velge flere tidspunkter samtidig.')}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={goToPreviousWeek}
              aria-label={t('calendar:navigation.previous_week', 'Forrige uke')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('calendar:navigation.previous_week', 'Forrige uke')}
            </Button>

            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {format(currentWeek.startDate, 'dd. MMM', { locale: nb })} - {format(currentWeek.endDate, 'dd. MMM yyyy', { locale: nb })}
              </h3>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={goToNextWeek}
              aria-label={t('calendar:navigation.next_week', 'Neste uke')}
            >
              {t('calendar:navigation.next_week', 'Neste uke')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Calendar Grid */}
          {selectedZone && (
            <div className="mt-4">
              <TimeSlotGrid
                facilityId={facilityId}
                zoneId={selectedZone.id}
                week={currentWeek}
                selectedSlots={selectedSlots}
                onSlotClick={handleSlotClick}
                onBulkSelect={handleBulkSelect}
                pricePerHour={selectedZone?.pricePerHour || 0}
                isLoading={isLoading}
                error={error}
                getAvailabilityStatus={getAvailabilityStatus}
                isSlotSelected={isSlotSelected || isSlotSelectedLocal}
                openingHoursStart={openingHoursStart}
                openingHoursEnd={openingHoursEnd}
              />
            </div>
          )}

          {/* Legend */}
          <div className="mt-4">
            <AvailabilityLegend />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
