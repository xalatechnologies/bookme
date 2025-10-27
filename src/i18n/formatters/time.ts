/**
 * Time Formatting Utilities
 *
 * Provides localized time formatting for Norwegian and English locales.
 *
 * @module i18n/formatters/time
 */

import { format, parseISO, isValid, addMinutes, differenceInMinutes } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import type { Locale } from 'date-fns';

/**
 * Locale mapping for date-fns
 */
const locales: Record<string, Locale> = {
  no: nb,
  en: enUS,
};

/**
 * Get locale object for date-fns
 */
const getLocale = (lng: string = 'no'): Locale => {
  return locales[lng] || locales.no;
};

/**
 * Format a time with localization
 *
 * @param date - Date/time to format (Date object or ISO string)
 * @param lng - Language code ('no' or 'en')
 * @param use24Hour - Force 24-hour format (default: true for 'no', false for 'en')
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date(), 'no') // "14:30"
 * formatTime(new Date(), 'en') // "2:30 PM"
 */
export const formatTime = (
  date: Date | string | number,
  lng: string = 'no',
  use24Hour?: boolean
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatTime:', date);
      return '';
    }

    // Default to 24-hour for Norwegian, 12-hour for English
    const is24Hour = use24Hour !== undefined ? use24Hour : lng === 'no';
    const formatStr = is24Hour ? 'HH:mm' : 'h:mm a';

    return format(dateObj, formatStr, {
      locale: getLocale(lng),
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Format time with seconds
 *
 * @param date - Date/time to format
 * @param lng - Language code
 * @returns Time with seconds (e.g., "14:30:45" or "2:30:45 PM")
 */
export const formatTimeWithSeconds = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    const is24Hour = lng === 'no';
    const formatStr = is24Hour ? 'HH:mm:ss' : 'h:mm:ss a';

    return format(dateObj, formatStr, {
      locale: getLocale(lng),
    });
  } catch (error) {
    console.error('Error formatting time with seconds:', error);
    return '';
  }
};

/**
 * Format time for input fields (HH:mm)
 *
 * @param date - Date/time to format
 * @returns Time string for HTML input
 */
export const formatTimeForInput = (
  date: Date | string | number
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, 'HH:mm');
  } catch (error) {
    console.error('Error formatting time for input:', error);
    return '';
  }
};

/**
 * Format date and time together
 *
 * @param date - Date/time to format
 * @param lng - Language code
 * @returns Combined date and time string
 */
export const formatDateTime = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    const dateFormat = lng === 'no' ? 'd. MMM yyyy' : 'MMM d, yyyy';
    const timeFormat = lng === 'no' ? 'HH:mm' : 'h:mm a';
    const separator = lng === 'no' ? ' kl. ' : ' at ';

    const formattedDate = format(dateObj, dateFormat, {
      locale: getLocale(lng),
    });

    const formattedTime = format(dateObj, timeFormat, {
      locale: getLocale(lng),
    });

    return `${formattedDate}${separator}${formattedTime}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Format duration in hours and minutes
 *
 * @param minutes - Duration in minutes
 * @param lng - Language code
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(90, 'no') // "1 time 30 minutter"
 * formatDuration(90, 'en') // "1 hour 30 minutes"
 */
export const formatDuration = (
  minutes: number,
  lng: string = 'no'
): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hourLabel = lng === 'no'
    ? hours === 1 ? 'time' : 'timer'
    : hours === 1 ? 'hour' : 'hours';

  const minuteLabel = lng === 'no'
    ? remainingMinutes === 1 ? 'minutt' : 'minutter'
    : remainingMinutes === 1 ? 'minute' : 'minutes';

  if (hours === 0) {
    return `${remainingMinutes} ${minuteLabel}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hourLabel}`;
  }

  return `${hours} ${hourLabel} ${remainingMinutes} ${minuteLabel}`;
};

/**
 * Format time range
 *
 * @param startTime - Start time
 * @param endTime - End time
 * @param lng - Language code
 * @returns Formatted time range
 *
 * @example
 * formatTimeRange(start, end, 'no') // "14:00 - 16:00"
 * formatTimeRange(start, end, 'en') // "2:00 PM - 4:00 PM"
 */
export const formatTimeRange = (
  startTime: Date | string | number,
  endTime: Date | string | number,
  lng: string = 'no'
): string => {
  const start = formatTime(startTime, lng);
  const end = formatTime(endTime, lng);

  return `${start} - ${end}`;
};

/**
 * Format opening hours
 *
 * @param openTime - Opening time
 * @param closeTime - Closing time
 * @param lng - Language code
 * @returns Formatted opening hours
 */
export const formatOpeningHours = (
  openTime: string,
  closeTime: string,
  lng: string = 'no'
): string => {
  const open = formatTime(`2024-01-01T${openTime}`, lng);
  const close = formatTime(`2024-01-01T${closeTime}`, lng);

  if (lng === 'no') {
    return `${open} - ${close}`;
  } else {
    return `${open} - ${close}`;
  }
};

/**
 * Get time slots for a day
 *
 * @param startHour - Start hour (0-23)
 * @param endHour - End hour (0-23)
 * @param intervalMinutes - Interval in minutes (default: 30)
 * @param lng - Language code
 * @returns Array of formatted time slots
 */
export const getTimeSlots = (
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 30,
  lng: string = 'no'
): string[] => {
  const slots: string[] = [];
  const baseDate = new Date();
  baseDate.setHours(startHour, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(endHour, 0, 0, 0);

  let currentSlot = baseDate;

  while (currentSlot < endDate) {
    slots.push(formatTime(currentSlot, lng));
    currentSlot = addMinutes(currentSlot, intervalMinutes);
  }

  return slots;
};

/**
 * Calculate and format time until/since
 *
 * @param date - Target date/time
 * @param lng - Language code
 * @returns Formatted time difference
 */
export const formatTimeUntil = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    const diffMinutes = differenceInMinutes(dateObj, new Date());
    const absDiff = Math.abs(diffMinutes);

    if (absDiff < 60) {
      const label = lng === 'no'
        ? absDiff === 1 ? 'minutt' : 'minutter'
        : absDiff === 1 ? 'minute' : 'minutes';
      return diffMinutes > 0
        ? lng === 'no' ? `om ${absDiff} ${label}` : `in ${absDiff} ${label}`
        : lng === 'no' ? `for ${absDiff} ${label} siden` : `${absDiff} ${label} ago`;
    }

    return formatDuration(absDiff, lng);
  } catch (error) {
    console.error('Error formatting time until:', error);
    return '';
  }
};