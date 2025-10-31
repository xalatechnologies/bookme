import { useState, useMemo, useCallback } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isToday, isWeekend, isPast } from 'date-fns';

export interface CalendarDay {
  readonly date: Date;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly isPast: boolean;
}

export interface CalendarWeek {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly days: readonly CalendarDay[];
}

export interface CalendarGridState {
  readonly currentWeekStart: Date;
  readonly calendarWeek: CalendarWeek;
  readonly timeSlots: readonly string[];
}

export interface CalendarGridActions {
  readonly handlePreviousWeek: () => void;
  readonly handleNextWeek: () => void;
  readonly setCurrentWeekStart: (date: Date) => void;
}

export interface UseCalendarGridProps {
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
  readonly initialDate?: Date;
}

export interface UseCalendarGridReturn {
  readonly state: CalendarGridState;
  readonly actions: CalendarGridActions;
}

/**
 * Custom hook for managing calendar grid data
 * Handles week navigation, calendar generation, and time slot calculation
 */
export const useCalendarGrid = ({
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
  initialDate
}: UseCalendarGridProps = {}): UseCalendarGridReturn => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    startOfWeek(initialDate || new Date(), { weekStartsOn: 1 })
  );

  // Generate time slots based on opening hours
  const timeSlots = useMemo((): readonly string[] => {
    const startHour = parseInt(openingHoursStart.split(':')[0]);
    const endHour = parseInt(openingHoursEnd.split(':')[0]);
    const totalHours = endHour - startHour;

    return Array.from({ length: totalHours }, (_, i) => {
      const hour = startHour + i;
      const nextHour = hour + 1;
      return `${hour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`;
    });
  }, [openingHoursStart, openingHoursEnd]);

  // Generate calendar week data with day metadata
  const calendarWeek = useMemo((): CalendarWeek => {
    const days = Array.from({ length: 7 }, (_, i): CalendarDay => {
      const date = addDays(currentWeekStart, i);
      return {
        date,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        isPast: isPast(date),
      };
    });

    return {
      startDate: currentWeekStart,
      endDate: addDays(currentWeekStart, 6),
      days,
    };
  }, [currentWeekStart]);

  // Navigate to previous week
  const handlePreviousWeek = useCallback((): void => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  }, []);

  // Navigate to next week
  const handleNextWeek = useCallback((): void => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  return {
    state: {
      currentWeekStart,
      calendarWeek,
      timeSlots
    },
    actions: {
      handlePreviousWeek,
      handleNextWeek,
      setCurrentWeekStart
    }
  };
};
