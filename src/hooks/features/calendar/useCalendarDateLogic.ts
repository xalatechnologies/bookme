import { useMemo } from 'react';
import type { IBookingEvent } from '@/types/calendar';
import type { CalendarView } from './useDateNavigation';

export interface CalendarDay {
  readonly date: number | null;
  readonly actualDate?: Date;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly isPastDate: boolean;
}

export interface UseCalendarDateLogicOptions {
  readonly currentDate: Date;
  readonly view: CalendarView;
  readonly weekStartDate: Date;
  readonly firstDayOfMonth: Date;
  readonly lastDayOfMonth: Date;
}

export interface UseCalendarDateLogicReturn {
  readonly calendarDays: readonly CalendarDay[];
  readonly getEventsForDate: (day: number | null, events: readonly IBookingEvent[]) => readonly IBookingEvent[];
  readonly formatDateString: (date: Date) => string;
  readonly isDateToday: (date: Date) => boolean;
  readonly isWeekend: (date: Date) => boolean;
  readonly getDayName: (date: Date) => string;
  readonly getWeekDays: () => readonly Date[];
}

/**
 * Custom hook for calendar date logic, including day generation, date utilities,
 * and event filtering by date
 */
export const useCalendarDateLogic = ({
  currentDate,
  view,
  weekStartDate,
  firstDayOfMonth,
  lastDayOfMonth
}: UseCalendarDateLogicOptions): UseCalendarDateLogicReturn => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days based on view
  const calendarDays = useMemo((): readonly CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = new Date();

    if (view === 'month') {
      const daysInMonth = lastDayOfMonth.getDate();
      // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0
      const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push({
          date: null,
          isToday: false,
          isWeekend: false,
          isPastDate: false
        });
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

        days.push({
          date: day,
          actualDate: date,
          isToday:
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear(),
          isWeekend,
          isPastDate: date < new Date(today.setHours(0, 0, 0, 0))
        });
      }
    } else if (view === 'week') {
      // Add 7 days for the week
      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(weekStartDate);
        weekDay.setDate(weekStartDate.getDate() + i);
        const dayOfWeek = weekDay.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        days.push({
          date: weekDay.getDate(),
          actualDate: weekDay,
          isToday:
            weekDay.getDate() === today.getDate() &&
            weekDay.getMonth() === today.getMonth() &&
            weekDay.getFullYear() === today.getFullYear(),
          isWeekend,
          isPastDate: weekDay < new Date(today.setHours(0, 0, 0, 0))
        });
      }
    } else if (view === 'day') {
      // Just the current day
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push({
        date: currentDate.getDate(),
        actualDate: currentDate,
        isToday:
          currentDate.getDate() === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear(),
        isWeekend,
        isPastDate: currentDate < new Date(today.setHours(0, 0, 0, 0))
      });
    }

    return days;
  }, [view, currentDate, currentMonth, currentYear, weekStartDate, firstDayOfMonth, lastDayOfMonth]);

  // Format date as YYYY-MM-DD string
  const formatDateString = useMemo(
    () => (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    []
  );

  // Get events for a specific date
  const getEventsForDate = useMemo(
    () =>
      (day: number | null, events: readonly IBookingEvent[]): readonly IBookingEvent[] => {
        if (!day) return [];

        let dateString: string;

        if (view === 'month') {
          const targetDate = new Date(currentYear, currentMonth, day);
          dateString = formatDateString(targetDate);
        } else if (view === 'week') {
          // For week view, calculate the actual date for this day
          const weekDays: number[] = [];
          for (let i = 0; i < 7; i++) {
            const weekDay = new Date(weekStartDate);
            weekDay.setDate(weekStartDate.getDate() + i);
            weekDays.push(weekDay.getDate());
          }

          // Find the index of this day in the week
          const dayIndex = weekDays.indexOf(day);
          if (dayIndex === -1) return [];

          // Calculate the actual date
          const targetDate = new Date(weekStartDate);
          targetDate.setDate(weekStartDate.getDate() + dayIndex);
          dateString = formatDateString(targetDate);
        } else if (view === 'day') {
          dateString = formatDateString(currentDate);
        } else {
          return [];
        }

        const filteredEvents = events.filter((event) => {
          const eventStart = new Date(event.start);
          const eventDateString = formatDateString(eventStart);
          return eventDateString === dateString;
        });

        return filteredEvents;
      },
    [view, currentDate, currentMonth, currentYear, weekStartDate, formatDateString]
  );

  // Check if a date is today
  const isDateToday = useMemo(
    () => (date: Date): boolean => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
    []
  );

  // Check if a date is a weekend (Saturday or Sunday)
  const isWeekend = useMemo(
    () => (date: Date): boolean => {
      const day = date.getDay();
      return day === 0 || day === 6;
    },
    []
  );

  // Get localized day name
  const getDayName = useMemo(
    () => (date: Date): string => {
      return date.toLocaleDateString('nb-NO', { weekday: 'long' });
    },
    []
  );

  // Get all days in the current week
  const getWeekDays = useMemo(
    () => (): readonly Date[] => {
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(weekStartDate);
        weekDay.setDate(weekStartDate.getDate() + i);
        days.push(weekDay);
      }
      return days;
    },
    [weekStartDate]
  );

  return {
    calendarDays,
    getEventsForDate,
    formatDateString,
    isDateToday,
    isWeekend,
    getDayName,
    getWeekDays
  };
};
