/**
 * Number Formatting Utilities
 *
 * Provides localized number formatting for Norwegian and English locales.
 *
 * @module i18n/formatters/number
 */

/**
 * Number formatter options
 */
export interface NumberFormatOptions {
  readonly style?: 'decimal' | 'percent' | 'unit';
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
  readonly useGrouping?: boolean;
  readonly unit?: string;
  readonly unitDisplay?: 'short' | 'long' | 'narrow';
  readonly notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  readonly signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/**
 * Format a number with localization
 *
 * @param value - Number to format
 * @param lng - Language code ('no' or 'en')
 * @param options - Formatting options
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.56, 'no') // "1 234,56"
 * formatNumber(1234.56, 'en') // "1,234.56"
 */
export const formatNumber = (
  value: number,
  lng: string = 'no',
  options: NumberFormatOptions = {}
): string => {
  try {
    const locale = lng === 'no' ? 'nb-NO' : 'en-US';

    const formatter = new Intl.NumberFormat(locale, {
      style: options.style || 'decimal',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
      useGrouping: options.useGrouping ?? true,
      notation: options.notation || 'standard',
      signDisplay: options.signDisplay || 'auto',
      ...(options.unit && {
        unit: options.unit,
        unitDisplay: options.unitDisplay || 'short',
      }),
    });

    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value);
  }
};

/**
 * Format an integer (no decimals)
 *
 * @param value - Number to format
 * @param lng - Language code
 * @returns Formatted integer
 */
export const formatInteger = (
  value: number,
  lng: string = 'no'
): string => {
  return formatNumber(value, lng, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Format a decimal with specific precision
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @param lng - Language code
 * @returns Formatted decimal
 */
export const formatDecimal = (
  value: number,
  decimals: number = 2,
  lng: string = 'no'
): string => {
  return formatNumber(value, lng, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a percentage
 *
 * @param value - Value to format (0.15 = 15%)
 * @param lng - Language code
 * @param decimals - Number of decimal places
 * @returns Formatted percentage
 *
 * @example
 * formatPercent(0.156, 'no') // "15,6 %"
 * formatPercent(0.156, 'en') // "15.6%"
 */
export const formatPercent = (
  value: number,
  lng: string = 'no',
  decimals: number = 1
): string => {
  return formatNumber(value, lng, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a compact number
 *
 * @param value - Number to format
 * @param lng - Language code
 * @returns Compact formatted number
 *
 * @example
 * formatCompact(1500, 'no') // "1,5K"
 * formatCompact(1500000, 'en') // "1.5M"
 */
export const formatCompact = (
  value: number,
  lng: string = 'no'
): string => {
  return formatNumber(value, lng, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
};

/**
 * Format area in square meters
 *
 * @param value - Area in square meters
 * @param lng - Language code
 * @returns Formatted area
 */
export const formatArea = (
  value: number,
  lng: string = 'no'
): string => {
  const formatted = formatNumber(value, lng, {
    maximumFractionDigits: 0,
  });
  return `${formatted} m²`;
};

/**
 * Format capacity (number of people)
 *
 * @param value - Capacity number
 * @param lng - Language code
 * @returns Formatted capacity
 */
export const formatCapacity = (
  value: number,
  lng: string = 'no'
): string => {
  const formatted = formatInteger(value, lng);
  const label = lng === 'no'
    ? value === 1 ? 'person' : 'personer'
    : value === 1 ? 'person' : 'people';
  return `${formatted} ${label}`;
};

/**
 * Format ordinal numbers (1st, 2nd, etc.)
 *
 * @param value - Number to format
 * @param lng - Language code
 * @returns Formatted ordinal
 */
export const formatOrdinal = (
  value: number,
  lng: string = 'no'
): string => {
  if (lng === 'no') {
    // Norwegian ordinals just add period
    return `${value}.`;
  } else {
    // English ordinals
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = value % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return `${value}${suffix}`;
  }
};

/**
 * Format rating (e.g., 4.5/5)
 *
 * @param value - Rating value
 * @param maxRating - Maximum rating
 * @param lng - Language code
 * @returns Formatted rating
 */
export const formatRating = (
  value: number,
  maxRating: number = 5,
  lng: string = 'no'
): string => {
  const formatted = formatDecimal(value, 1, lng);
  return `${formatted}/${maxRating}`;
};

/**
 * Format file size
 *
 * @param bytes - Size in bytes
 * @param lng - Language code
 * @returns Formatted file size
 */
export const formatFileSize = (
  bytes: number,
  lng: string = 'no'
): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted = formatDecimal(size, unitIndex === 0 ? 0 : 1, lng);
  return `${formatted} ${units[unitIndex]}`;
};

/**
 * Parse localized number string
 *
 * @param value - Number string to parse
 * @param lng - Language code
 * @returns Parsed number or NaN
 */
export const parseNumber = (
  value: string,
  lng: string = 'no'
): number => {
  try {
    let cleaned = value.trim();

    if (lng === 'no') {
      // Norwegian uses comma as decimal separator and space as thousands
      cleaned = cleaned.replace(/\s/g, '').replace(',', '.');
    } else {
      // English uses period as decimal and comma as thousands
      cleaned = cleaned.replace(/,/g, '');
    }

    // Remove any non-numeric characters except minus and period
    cleaned = cleaned.replace(/[^0-9.-]/g, '');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing number:', error);
    return 0;
  }
};

/**
 * Format number for input field
 *
 * @param value - Number to format
 * @param lng - Language code
 * @returns Formatted string for input
 */
export const formatNumberForInput = (
  value: number,
  lng: string = 'no'
): string => {
  if (isNaN(value)) return '';

  return formatNumber(value, lng, {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 10,
  });
};

/**
 * Format range of numbers
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @param lng - Language code
 * @returns Formatted range
 */
export const formatNumberRange = (
  min: number,
  max: number,
  lng: string = 'no'
): string => {
  const minFormatted = formatNumber(min, lng);
  const maxFormatted = formatNumber(max, lng);
  return `${minFormatted} - ${maxFormatted}`;
};