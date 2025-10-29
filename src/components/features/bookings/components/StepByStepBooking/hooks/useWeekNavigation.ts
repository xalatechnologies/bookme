import { useState, useMemo, useCallback } from 'react';
import { startOfWeek, addWeeks, subWeeks, addDays, isToday, isWeekend, isPast } from 'date-fns';

/**
 * Week day information
 */
export interface WeekDay {
  readonly date: Date;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly isPast: boolean;
}

/**
 * Week range information
 */
export interface WeekRange {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly days: readonly WeekDay[];
}

/**
 * Week navigation hook return type
 */
export interface UseWeekNavigationReturn {
  readonly currentWeek: WeekRange;
  readonly currentWeekStart: Date;
  readonly goToPreviousWeek: () => void;
  readonly goToNextWeek: () => void;
  readonly goToWeek: (date: Date) => void;
  readonly goToToday: () => void;
}

/**
 * Week navigation hook options
 */
export interface UseWeekNavigationOptions {
  readonly initialDate?: Date;
  readonly weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Custom hook for week navigation
 *
 * Manages week-based calendar navigation with support for:
 * - Moving between weeks
 * - Calculating week ranges
 * - Getting day information (isToday, isWeekend, isPast)
 * - Jumping to specific dates
 *
 * @param options - Hook options
 * @returns Week navigation state and controls
 *
 * @example
 * ```tsx
 * const { currentWeek, goToNextWeek, goToPreviousWeek } = useWeekNavigation({
 *   initialDate: new Date(),
 *   weekStartsOn: 1 // Monday
 * });
 * ```
 */
export const useWeekNavigation = (
  options: UseWeekNavigationOptions = {}
): UseWeekNavigationReturn => {
  const { initialDate = new Date(), weekStartsOn = 1 } = options;

  /**
   * Current week start date state
   */
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return startOfWeek(initialDate, { weekStartsOn });
  });

  /**
   * Navigate to previous week
   */
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  }, []);

  /**
   * Navigate to next week
   */
  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  /**
   * Navigate to a specific week containing the given date
   */
  const goToWeek = useCallback((date: Date) => {
    setCurrentWeekStart(startOfWeek(date, { weekStartsOn }));
  }, [weekStartsOn]);

  /**
   * Navigate to current week (today)
   */
  const goToToday = useCallback(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn }));
  }, [weekStartsOn]);

  /**
   * Calculate current week range with day information
   */
  const currentWeek = useMemo((): WeekRange => {
    const start = currentWeekStart;
    const end = addWeeks(start, 1);

    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      days.push({
        date,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        isPast: isPast(date)
      });
    }

    return {
      startDate: start,
      endDate: end,
      days: days as readonly WeekDay[]
    };
  }, [currentWeekStart]);

  return {
    currentWeek,
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToWeek,
    goToToday
  };
};
