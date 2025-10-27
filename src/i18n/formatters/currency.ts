/**
 * Currency Formatting Utilities
 *
 * Provides localized currency formatting for NOK (Norwegian Krone).
 *
 * @module i18n/formatters/currency
 */

/**
 * Currency formatter options
 */
export interface CurrencyFormatOptions {
  readonly showDecimals?: boolean;
  readonly showCurrency?: boolean;
  readonly compact?: boolean;
  readonly signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/**
 * Format amount as Norwegian Krone (NOK)
 *
 * @param amount - Amount to format
 * @param lng - Language code ('no' or 'en')
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500, 'no') // "1 500 kr"
 * formatCurrency(1500, 'en') // "kr 1,500"
 * formatCurrency(1500.50, 'no', { showDecimals: true }) // "1 500,50 kr"
 */
export const formatCurrency = (
  amount: number,
  lng: string = 'no',
  options: CurrencyFormatOptions = {}
): string => {
  const {
    showDecimals = false,
    showCurrency = true,
    compact = false,
    signDisplay = 'auto',
  } = options;

  try {
    // Create formatter based on language
    const locale = lng === 'no' ? 'nb-NO' : 'en-US';

    const formatter = new Intl.NumberFormat(locale, {
      style: showCurrency ? 'currency' : 'decimal',
      currency: 'NOK',
      currencyDisplay: 'symbol',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
      notation: compact ? 'compact' : 'standard',
      signDisplay,
    });

    let formatted = formatter.format(amount);

    // Adjust currency position for Norwegian (move "kr" to end)
    if (lng === 'no' && showCurrency) {
      // Norwegian formatter puts "kr" at the beginning, we want it at the end
      formatted = formatted.replace(/^kr\s*/, '').replace(/NOK\s*/, '') + ' kr';
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} kr`;
  }
};

/**
 * Format amount with always showing decimals
 *
 * @param amount - Amount to format
 * @param lng - Language code
 * @returns Currency with decimals
 */
export const formatCurrencyWithDecimals = (
  amount: number,
  lng: string = 'no'
): string => {
  return formatCurrency(amount, lng, { showDecimals: true });
};

/**
 * Format amount without currency symbol
 *
 * @param amount - Amount to format
 * @param lng - Language code
 * @returns Formatted number without currency
 */
export const formatAmount = (
  amount: number,
  lng: string = 'no'
): string => {
  return formatCurrency(amount, lng, { showCurrency: false });
};

/**
 * Format compact currency (e.g., 1.5K kr)
 *
 * @param amount - Amount to format
 * @param lng - Language code
 * @returns Compact currency format
 */
export const formatCompactCurrency = (
  amount: number,
  lng: string = 'no'
): string => {
  return formatCurrency(amount, lng, { compact: true });
};

/**
 * Format price range
 *
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param lng - Language code
 * @returns Formatted price range
 *
 * @example
 * formatPriceRange(100, 500, 'no') // "100 - 500 kr"
 * formatPriceRange(100, 500, 'en') // "kr 100 - 500"
 */
export const formatPriceRange = (
  minPrice: number,
  maxPrice: number,
  lng: string = 'no'
): string => {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice, lng);
  }

  const min = formatCurrency(minPrice, lng, { showCurrency: false });
  const max = formatCurrency(maxPrice, lng);

  if (lng === 'no') {
    return `${min} - ${max}`;
  } else {
    // For English, include currency symbol at start
    return `kr ${min} - ${max.replace('kr ', '')}`;
  }
};

/**
 * Format hourly rate
 *
 * @param rate - Hourly rate
 * @param lng - Language code
 * @returns Formatted hourly rate
 */
export const formatHourlyRate = (
  rate: number,
  lng: string = 'no'
): string => {
  const formatted = formatCurrency(rate, lng);
  const perHour = lng === 'no' ? '/time' : '/hour';
  return `${formatted}${perHour}`;
};

/**
 * Format daily rate
 *
 * @param rate - Daily rate
 * @param lng - Language code
 * @returns Formatted daily rate
 */
export const formatDailyRate = (
  rate: number,
  lng: string = 'no'
): string => {
  const formatted = formatCurrency(rate, lng);
  const perDay = lng === 'no' ? '/dag' : '/day';
  return `${formatted}${perDay}`;
};

/**
 * Format discount amount
 *
 * @param amount - Discount amount
 * @param lng - Language code
 * @returns Formatted discount with minus sign
 */
export const formatDiscount = (
  amount: number,
  lng: string = 'no'
): string => {
  return formatCurrency(-Math.abs(amount), lng, { signDisplay: 'always' });
};

/**
 * Format percentage discount
 *
 * @param percentage - Discount percentage (0-100)
 * @param lng - Language code
 * @returns Formatted percentage
 */
export const formatPercentageDiscount = (
  percentage: number,
  lng: string = 'no'
): string => {
  const locale = lng === 'no' ? 'nb-NO' : 'en-US';
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    signDisplay: 'always',
  });

  return formatter.format(-Math.abs(percentage) / 100);
};

/**
 * Parse currency string to number
 *
 * @param value - Currency string
 * @param lng - Language code
 * @returns Parsed number or NaN
 */
export const parseCurrency = (
  value: string,
  lng: string = 'no'
): number => {
  try {
    // Remove currency symbols and spaces
    let cleaned = value
      .replace(/kr/gi, '')
      .replace(/NOK/gi, '')
      .trim();

    // Handle different decimal separators
    if (lng === 'no') {
      // Norwegian uses comma as decimal separator and space as thousands
      cleaned = cleaned.replace(/\s/g, '').replace(',', '.');
    } else {
      // English uses period as decimal and comma as thousands
      cleaned = cleaned.replace(/,/g, '');
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return 0;
  }
};

/**
 * Validate if string is valid currency
 *
 * @param value - Value to validate
 * @param lng - Language code
 * @returns True if valid currency format
 */
export const isValidCurrency = (
  value: string,
  lng: string = 'no'
): boolean => {
  const parsed = parseCurrency(value, lng);
  return !isNaN(parsed) && parsed >= 0;
};

/**
 * Format currency for input field
 *
 * @param amount - Amount to format
 * @param lng - Language code
 * @returns Formatted string for input
 */
export const formatCurrencyForInput = (
  amount: number,
  lng: string = 'no'
): string => {
  if (isNaN(amount)) return '';

  const locale = lng === 'no' ? 'nb-NO' : 'en-US';
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

  return formatter.format(amount);
};