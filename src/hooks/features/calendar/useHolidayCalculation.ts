/**
 * useHolidayCalculation Hook
 *
 * Provides Norwegian holiday detection and date utilities
 * for calendar components. Handles both fixed and moveable
 * holidays (Easter-based).
 *
 * Features:
 * - Fixed holiday detection (New Year, Constitution Day, Christmas)
 * - Easter calculation using Computus algorithm
 * - Easter-based holiday detection (Good Friday, Ascension Day, etc.)
 * - Weekend detection
 * - Holiday name localization
 *
 * @returns Holiday detection functions
 */

import { useCallback } from "react";
import { addDays, isWeekend as dateFnsIsWeekend } from "date-fns";

export interface HolidayInfo {
  readonly isHoliday: boolean;
  readonly holidayName?: string;
  readonly isWeekend: boolean;
}

export interface UseHolidayCalculationReturn {
  readonly checkIfHoliday: (date: Date) => boolean;
  readonly getHolidayName: (date: Date) => string | undefined;
  readonly getHolidayInfo: (date: Date) => HolidayInfo;
  readonly calculateEaster: (year: number) => Date;
  readonly isWeekendOrHoliday: (date: Date) => boolean;
}

/**
 * Hook for Norwegian holiday calculations
 */
export const useHolidayCalculation = (): UseHolidayCalculationReturn => {
  /**
   * Calculate Easter date for a given year using Computus algorithm
   *
   * @param year - Year to calculate Easter for
   * @returns Easter Sunday date
   */
  const calculateEaster = useCallback((year: number): Date => {
    // Anonymous Gregorian algorithm (Computus)
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;

    return new Date(year, n - 1, p + 1);
  }, []);

  /**
   * Check if a date is a Norwegian holiday
   *
   * @param date - Date to check
   * @returns True if the date is a holiday
   */
  const checkIfHoliday = useCallback(
    (date: Date): boolean => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const day = date.getDate();

      // Fixed holidays
      const fixedHolidays = [
        { month: 1, day: 1 }, // New Year's Day
        { month: 5, day: 1 }, // Labour Day
        { month: 5, day: 17 }, // Constitution Day
        { month: 12, day: 25 }, // Christmas Day
        { month: 12, day: 26 }, // Boxing Day
      ];

      // Check fixed holidays
      for (const holiday of fixedHolidays) {
        if (month === holiday.month && day === holiday.day) {
          return true;
        }
      }

      // Calculate Easter and related holidays
      const easter = calculateEaster(year);
      const easterHolidays = [
        addDays(easter, -3), // Maundy Thursday
        addDays(easter, -2), // Good Friday
        addDays(easter, 1), // Easter Monday
        addDays(easter, 39), // Ascension Day
        addDays(easter, 49), // Whit Monday
        addDays(easter, 50), // Whit Monday
      ];

      // Check Easter-related holidays
      for (const holiday of easterHolidays) {
        if (
          holiday.getFullYear() === year &&
          holiday.getMonth() + 1 === month &&
          holiday.getDate() === day
        ) {
          return true;
        }
      }

      return false;
    },
    [calculateEaster]
  );

  /**
   * Get the Norwegian name of a holiday
   *
   * @param date - Date to check
   * @returns Holiday name or undefined
   */
  const getHolidayName = useCallback(
    (date: Date): string | undefined => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // Fixed holidays with Norwegian names
      const fixedHolidays: Record<string, string> = {
        "1-1": "Nyttårsdag",
        "5-1": "Arbeidernes dag",
        "5-17": "Grunnlovsdag",
        "12-25": "1. juledag",
        "12-26": "2. juledag",
      };

      const key = `${month}-${day}`;
      if (fixedHolidays[key]) {
        return fixedHolidays[key];
      }

      // Calculate Easter and related holidays
      const easter = calculateEaster(year);
      const easterHolidays = [
        { date: addDays(easter, -3), name: "Skjærtorsdag" },
        { date: addDays(easter, -2), name: "Langfredag" },
        { date: addDays(easter, 0), name: "1. påskedag" },
        { date: addDays(easter, 1), name: "2. påskedag" },
        { date: addDays(easter, 39), name: "Kristi himmelfartsdag" },
        { date: addDays(easter, 49), name: "1. pinsedag" },
        { date: addDays(easter, 50), name: "2. pinsedag" },
      ];

      // Check Easter-related holidays
      for (const holiday of easterHolidays) {
        if (
          holiday.date.getFullYear() === year &&
          holiday.date.getMonth() + 1 === month &&
          holiday.date.getDate() === day
        ) {
          return holiday.name;
        }
      }

      return undefined;
    },
    [calculateEaster]
  );

  /**
   * Get comprehensive holiday information for a date
   *
   * @param date - Date to check
   * @returns Holiday information including weekend status
   */
  const getHolidayInfo = useCallback(
    (date: Date): HolidayInfo => {
      const isHoliday = checkIfHoliday(date);
      const holidayName = isHoliday ? getHolidayName(date) : undefined;
      const isWeekend = dateFnsIsWeekend(date);

      return {
        isHoliday,
        holidayName,
        isWeekend,
      };
    },
    [checkIfHoliday, getHolidayName]
  );

  /**
   * Check if a date is a weekend or holiday
   *
   * @param date - Date to check
   * @returns True if weekend or holiday
   */
  const isWeekendOrHoliday = useCallback(
    (date: Date): boolean => {
      return dateFnsIsWeekend(date) || checkIfHoliday(date);
    },
    [checkIfHoliday]
  );

  return {
    checkIfHoliday,
    getHolidayName,
    getHolidayInfo,
    calculateEaster,
    isWeekendOrHoliday,
  };
};
