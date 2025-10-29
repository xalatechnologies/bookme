import { useState, useCallback, useMemo } from 'react';

export type CalendarView = 'month' | 'week' | 'day';

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface UseDateNavigationOptions {
  readonly initialDate?: Date;
  readonly view?: CalendarView;
  readonly onDateChange?: (date: Date) => void;
}

export interface UseDateNavigationReturn {
  readonly currentDate: Date;
  readonly view: CalendarView;
  readonly setCurrentDate: (date: Date) => void;
  readonly goToPrevious: () => void;
  readonly goToNext: () => void;
  readonly goToToday: () => void;
  readonly getDisplayText: () => string;
  readonly dateRange: DateRange;
  readonly weekStartDate: Date;
  readonly weekEndDate: Date;
  readonly firstDayOfMonth: Date;
  readonly lastDayOfMonth: Date;
}

/**
 * Custom hook for handling calendar date navigation and date range calculations
 * Supports month, week, and day views with bidirectional date synchronization
 */
export const useDateNavigation = (
  externalCurrentDate?: Date,
  onDateChange?: (date: Date) => void,
  view: CalendarView = 'month'
): UseDateNavigationReturn => {
  const [internalCurrentDate, setInternalCurrentDate] = useState<Date>(new Date());

  // Use external date if provided, otherwise use internal state
  const currentDate = externalCurrentDate || internalCurrentDate;
  const setCurrentDate = onDateChange || setInternalCurrentDate;

  // Calculate month boundaries
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Calculate week boundaries (Monday start)
  const weekStartDate = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0
    const adjustedDay = (day + 6) % 7;
    const diff = startOfWeek.getDate() - adjustedDay;
    startOfWeek.setDate(diff);
    return startOfWeek;
  }, [currentDate]);

  const weekEndDate = useMemo(() => {
    const endOfWeek = new Date(weekStartDate);
    endOfWeek.setDate(weekStartDate.getDate() + 6);
    return endOfWeek;
  }, [weekStartDate]);

  // Calculate date range based on current view
  const dateRange = useMemo((): DateRange => {
    if (view === 'month') {
      return {
        start: firstDayOfMonth,
        end: lastDayOfMonth
      };
    } else if (view === 'week') {
      return {
        start: weekStartDate,
        end: weekEndDate
      };
    } else {
      // Day view
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      return {
        start: dayStart,
        end: dayEnd
      };
    }
  }, [view, firstDayOfMonth, lastDayOfMonth, weekStartDate, weekEndDate, currentDate]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, view, setCurrentDate]);

  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, view, setCurrentDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  // Format display text based on view
  const getDisplayText = useCallback((): string => {
    if (view === 'month') {
      return firstDayOfMonth.toLocaleDateString('nb-NO', {
        month: 'long',
        year: 'numeric'
      });
    } else if (view === 'week') {
      return `${weekStartDate.toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short'
      })} - ${weekEndDate.toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}`;
    } else if (view === 'day') {
      return currentDate.toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return '';
  }, [view, firstDayOfMonth, weekStartDate, weekEndDate, currentDate]);

  return {
    currentDate,
    view,
    setCurrentDate,
    goToPrevious,
    goToNext,
    goToToday,
    getDisplayText,
    dateRange,
    weekStartDate,
    weekEndDate,
    firstDayOfMonth,
    lastDayOfMonth
  };
};
