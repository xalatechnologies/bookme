import { useState, useCallback } from 'react';
import { addDays, addMonths, startOfWeek, startOfMonth } from 'date-fns';

export type CalendarView = 'day' | 'week' | 'month';

interface UseCalendarStateReturn {
  readonly currentDate: Date;
  readonly view: CalendarView;
  readonly selectedDate: Date | null;
  readonly setView: (view: CalendarView) => void;
  readonly setCurrentDate: (date: Date) => void;
  readonly setSelectedDate: (date: Date | null) => void;
  readonly nextPeriod: () => void;
  readonly prevPeriod: () => void;
  readonly goToToday: () => void;
  readonly goToDate: (date: Date) => void;
}

/**
 * Custom hook for managing calendar state
 *
 * Provides state management for calendar navigation, view switching,
 * and date selection with proper TypeScript types.
 *
 * Features:
 * - Current date tracking
 * - View mode (day/week/month)
 * - Selected date tracking
 * - Period navigation (next/prev)
 * - Jump to today/specific date
 *
 * @returns Calendar state and actions
 */
export const useCalendarState = (): UseCalendarStateReturn => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /**
   * Navigate to next period based on current view
   */
  const nextPeriod = useCallback((): void => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return addDays(prev, 1);
        case 'week':
          return addDays(prev, 7);
        case 'month':
          return addMonths(prev, 1);
        default:
          return prev;
      }
    });
  }, [view]);

  /**
   * Navigate to previous period based on current view
   */
  const prevPeriod = useCallback((): void => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return addDays(prev, -1);
        case 'week':
          return addDays(prev, -7);
        case 'month':
          return addMonths(prev, -1);
        default:
          return prev;
      }
    });
  }, [view]);

  /**
   * Jump to today's date
   */
  const goToToday = useCallback((): void => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  /**
   * Jump to specific date
   *
   * @param date - Target date
   */
  const goToDate = useCallback((date: Date): void => {
    setCurrentDate(date);
    setSelectedDate(date);
  }, []);

  return {
    currentDate,
    view,
    selectedDate,
    setView,
    setCurrentDate,
    setSelectedDate,
    nextPeriod,
    prevPeriod,
    goToToday,
    goToDate,
  };
};
