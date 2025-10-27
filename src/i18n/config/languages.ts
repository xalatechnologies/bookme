/**
 * Language Configuration
 *
 * Defines supported languages and their metadata for the application.
 *
 * @module i18n/config/languages
 */

export interface LanguageConfig {
  readonly code: string;
  readonly name: string;
  readonly nativeName: string;
  readonly flag: string;
  readonly dateFormat: string;
  readonly timeFormat: string;
  readonly firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  readonly decimalSeparator: string;
  readonly thousandsSeparator: string;
  readonly currencySymbol: string;
  readonly currencyCode: string;
  readonly currencyPosition: 'before' | 'after';
}

/**
 * Supported languages configuration
 */
export const languages: Record<string, LanguageConfig> = {
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: '🇳🇴',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 1, // Monday
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    currencySymbol: 'kr',
    currencyCode: 'NOK',
    currencyPosition: 'after',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    firstDayOfWeek: 0, // Sunday
    decimalSeparator: '.',
    thousandsSeparator: ',',
    currencySymbol: 'kr',
    currencyCode: 'NOK',
    currencyPosition: 'before',
  },
} as const;

/**
 * Default language code
 */
export const defaultLanguage = 'no';

/**
 * Get language configuration by code
 */
export const getLanguageConfig = (code: string): LanguageConfig => {
  return languages[code] || languages[defaultLanguage];
};

/**
 * Get all supported language codes
 */
export const getLanguageCodes = (): string[] => {
  return Object.keys(languages);
};

/**
 * Check if a language code is supported
 */
export const isLanguageSupported = (code: string): boolean => {
  return code in languages;
};

/**
 * Language direction (for future RTL support)
 */
export const getLanguageDirection = (code: string): 'ltr' | 'rtl' => {
  // All current languages are LTR
  // Add RTL languages here when needed
  return 'ltr';
};