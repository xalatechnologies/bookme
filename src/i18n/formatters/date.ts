/**
 * Date Formatting Utilities
 *
 * Provides localized date formatting for Norwegian and English locales.
 *
 * @module i18n/formatters/date
 */

import { format, parseISO, isValid, formatDistance, formatRelative } from 'date-fns';
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
 * Format a date with localization
 *
 * @param date - Date to format (Date object or ISO string)
 * @param lng - Language code ('no' or 'en')
 * @param formatStr - date-fns format string (default: 'PP' for localized date)
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), 'no') // "27. oktober 2024"
 * formatDate(new Date(), 'en') // "October 27, 2024"
 */
export const formatDate = (
  date: Date | string | number,
  lng: string = 'no',
  formatStr: string = 'PP'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }

    return format(dateObj, formatStr, {
      locale: getLocale(lng),
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date with short format
 *
 * @param date - Date to format
 * @param lng - Language code
 * @returns Short formatted date (e.g., "27.10.24" or "10/27/24")
 */
export const formatDateShort = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  const formatStr = lng === 'no' ? 'dd.MM.yy' : 'MM/dd/yy';
  return formatDate(date, lng, formatStr);
};

/**
 * Format a date with long format
 *
 * @param date - Date to format
 * @param lng - Language code
 * @returns Long formatted date (e.g., "søndag 27. oktober 2024")
 */
export const formatDateLong = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  return formatDate(date, lng, 'PPPP');
};

/**
 * Format a date with custom Norwegian format
 *
 * @param date - Date to format
 * @returns Norwegian formatted date (e.g., "27. oktober 2024")
 */
export const formatDateNorwegian = (
  date: Date | string | number
): string => {
  return formatDate(date, 'no', 'd. MMMM yyyy');
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns ISO date string for HTML input
 */
export const formatDateForInput = (
  date: Date | string | number
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 *
 * @param date - Date to format
 * @param lng - Language code
 * @returns Relative time string
 */
export const formatRelativeTime = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: getLocale(lng),
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Format relative date (e.g., "tomorrow at 10:00 AM")
 *
 * @param date - Date to format
 * @param lng - Language code
 * @returns Relative date string
 */
export const formatRelativeDate = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);

    if (!isValid(dateObj)) {
      return '';
    }

    return formatRelative(dateObj, new Date(), {
      locale: getLocale(lng),
    });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

/**
 * Format month and year
 *
 * @param date - Date to format
 * @param lng - Language code
 * @returns Month and year string (e.g., "Oktober 2024")
 */
export const formatMonthYear = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  return formatDate(date, lng, 'MMMM yyyy');
};

/**
 * Format day of week
 *
 * @param date - Date to format
 * @param lng - Language code
 * @returns Day of week (e.g., "Mandag" or "Monday")
 */
export const formatDayOfWeek = (
  date: Date | string | number,
  lng: string = 'no'
): string => {
  return formatDate(date, lng, 'EEEE');
};

/**
 * Format date range
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param lng - Language code
 * @returns Formatted date range
 */
export const formatDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  lng: string = 'no'
): string => {
  const start = formatDate(startDate, lng, 'd. MMM');
  const end = formatDate(endDate, lng, 'd. MMM yyyy');

  return lng === 'no' ? `${start} - ${end}` : `${start} - ${end}`;
};