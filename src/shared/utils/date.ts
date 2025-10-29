import { format, addDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isToday, isWeekend, isPast, isFuture, isWithinInterval } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';

/**
 * Date utility functions for calendar operations
 *
 * Provides pure functions for date manipulation and formatting
 * with proper TypeScript types and internationalization support.
 */

/**
 * Get locale object based on language code
 *
 * @param locale - Language code (no or en)
 * @returns date-fns locale object
 */
export const getDateLocale = (locale: string): Locale => {
  switch (locale) {
    case 'no':
      return nb;
    case 'en':
      return enUS;
    default:
      return nb;
  }
};

/**
 * Format date with locale support
 *
 * @param date - Date to format
 * @param formatStr - Format string
 * @param locale - Language code
 * @returns Formatted date string
 */
export const formatDate = (date: Date, formatStr: string, locale: string = 'no'): string => {
  return format(date, formatStr, { locale: getDateLocale(locale) });
};

/**
 * Get week days starting from Monday
 *
 * @param startDate - Start date of the week
 * @returns Array of 7 dates (Mon-Sun)
 */
export const getWeekDays = (startDate: Date): readonly Date[] => {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

/**
 * Get all days in a month
 *
 * @param date - Any date within the month
 * @returns Array of all dates in the month
 */
export const getMonthDays = (date: Date): readonly Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days: Date[] = [];

  let currentDate = start;
  while (currentDate <= end) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return days;
};

/**
 * Get calendar grid for month view (includes padding days)
 *
 * @param date - Any date within the month
 * @returns Array of dates including padding from prev/next months
 */
export const getMonthCalendarGrid = (date: Date): readonly (Date | null)[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: (Date | null)[] = [];
  let currentDate = calendarStart;

  while (currentDate <= calendarEnd) {
    if (currentDate < monthStart || currentDate > monthEnd) {
      days.push(null); // Padding days
    } else {
      days.push(currentDate);
    }
    currentDate = addDays(currentDate, 1);
  }

  return days;
};

/**
 * Check if date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export const checkIsToday = (date: Date): boolean => {
  return isToday(date);
};

/**
 * Check if date is weekend (Saturday or Sunday)
 *
 * @param date - Date to check
 * @returns True if date is weekend
 */
export const checkIsWeekend = (date: Date): boolean => {
  return isWeekend(date);
};

/**
 * Check if date is in the past
 *
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const checkIsPast = (date: Date): boolean => {
  return isPast(date);
};

/**
 * Check if date is in the future
 *
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const checkIsFuture = (date: Date): boolean => {
  return isFuture(date);
};

/**
 * Check if date is within a date range
 *
 * @param date - Date to check
 * @param start - Start date
 * @param end - End date
 * @returns True if date is within range
 */
export const checkIsWithinRange = (date: Date, start: Date, end: Date): boolean => {
  return isWithinInterval(date, { start, end });
};

/**
 * Get time slots for a day
 *
 * @param startHour - Opening hour (0-23)
 * @param endHour - Closing hour (0-23)
 * @param interval - Interval in minutes (default: 60)
 * @returns Array of time slot strings (e.g., "09:00-10:00")
 */
export const getTimeSlots = (
  startHour: number = 8,
  endHour: number = 22,
  interval: number = 60
): readonly string[] => {
  const slots: string[] = [];
  const totalMinutes = (endHour - startHour) * 60;
  const slotCount = Math.floor(totalMinutes / interval);

  for (let i = 0; i < slotCount; i++) {
    const startMinutes = startHour * 60 + i * interval;
    const endMinutes = startMinutes + interval;

    const startHourNum = Math.floor(startMinutes / 60);
    const startMinuteNum = startMinutes % 60;
    const endHourNum = Math.floor(endMinutes / 60);
    const endMinuteNum = endMinutes % 60;

    const startTime = `${String(startHourNum).padStart(2, '0')}:${String(startMinuteNum).padStart(2, '0')}`;
    const endTime = `${String(endHourNum).padStart(2, '0')}:${String(endMinuteNum).padStart(2, '0')}`;

    slots.push(`${startTime}-${endTime}`);
  }

  return slots;
};

/**
 * Parse opening hours string to hour number
 *
 * @param timeString - Time string (e.g., "08:00")
 * @returns Hour number (0-23)
 */
export const parseTimeToHour = (timeString: string): number => {
  const [hour] = timeString.split(':').map(Number);
  return hour;
};

/**
 * Get duration between two time slots in minutes
 *
 * @param startTime - Start time string (e.g., "09:00")
 * @param endTime - End time string (e.g., "11:00")
 * @returns Duration in minutes
 */
export const getDurationMinutes = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return endTotalMinutes - startTotalMinutes;
};

/**
 * Format duration in minutes to human-readable string
 *
 * @param minutes - Duration in minutes
 * @param locale - Language code
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number, locale: string = 'no'): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const hourLabel = locale === 'no' ? (hours === 1 ? 'time' : 'timer') : (hours === 1 ? 'hour' : 'hours');
  const minLabel = locale === 'no' ? (mins === 1 ? 'minutt' : 'minutter') : (mins === 1 ? 'minute' : 'minutes');

  if (hours > 0 && mins > 0) {
    return `${hours} ${hourLabel}, ${mins} ${minLabel}`;
  } else if (hours > 0) {
    return `${hours} ${hourLabel}`;
  } else {
    return `${mins} ${minLabel}`;
  }
};

/**
 * Compare two dates (ignoring time)
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Create date from date and time slot
 *
 * @param date - Base date
 * @param timeSlot - Time slot string (e.g., "09:00-10:00")
 * @returns Date object with time set
 */
export const createDateTimeFromSlot = (date: Date, timeSlot: string): { start: Date; end: Date } => {
  const [startTime, endTime] = timeSlot.split('-');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);

  return { start, end };
};
