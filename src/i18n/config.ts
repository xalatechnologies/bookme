/**
 * i18n Configuration
 *
 * Configures react-i18next for multilingual support
 * - Default language: Norwegian (Bokmål)
 * - Fallback language: English
 * - Namespaces: roles, common, facilities, bookings, etc.
 *
 * @see https://react.i18next.com/
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import translation files directly for initial load to prevent flickering
import rolesEN from '../../public/locales/en/roles.json';
import rolesNO from '../../public/locales/no/roles.json';
import commonEN from '../../public/locales/en/common.json';
import commonNO from '../../public/locales/no/common.json';
import navigationEN from '../../public/locales/en/navigation.json';
import navigationNO from '../../public/locales/no/navigation.json';
import authEN from '../../public/locales/en/auth.json';
import authNO from '../../public/locales/no/auth.json';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  NO: 'no', // Norwegian (Bokmål) - Default
  EN: 'en', // English
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

// Language display names
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  no: 'Norsk',
  en: 'English',
};

// Available namespaces
export const NAMESPACES = {
  ROLES: 'roles',
  COMMON: 'common',
  FACILITIES: 'facilities',
  BOOKINGS: 'bookings',
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  ERRORS: 'errors',
} as const;

// Initialize i18next
i18n
  // Load translation files
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language (Norwegian)
    lng: SUPPORTED_LANGUAGES.NO,

    // Fallback language (English)
    fallbackLng: SUPPORTED_LANGUAGES.EN,

    // Supported languages
    supportedLngs: Object.values(SUPPORTED_LANGUAGES),

    // Default namespace
    defaultNS: NAMESPACES.COMMON,

    // Available namespaces
    ns: Object.values(NAMESPACES),

    // Debug mode (disabled in production)
    debug: import.meta.env.DEV,

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Backend configuration (for loading translation files)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',

      // Add query parameter to prevent caching during development
      queryStringParams: import.meta.env.DEV ? { v: Date.now().toString() } : undefined,
    },

    // Language detector options
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Keys to lookup language from
      lookupLocalStorage: 'i18nextLng',

      // Cache user language
      caches: ['localStorage'],

      // Exclude certain detectors in production
      excludeCacheFor: ['cimode'],
    },

    // React-specific options
    react: {
      // Use Suspense for async translations
      useSuspense: true,

      // Bind i18n instance to React context
      bindI18n: 'languageChanged loaded',

      // Bind i18n store to React context
      bindI18nStore: 'added removed',

      // Trans component default namespace
      defaultTransParent: 'div',
    },

    // Preload resources - critical namespaces to prevent flickering
    resources: {
      en: {
        roles: rolesEN,
        common: commonEN,
        navigation: navigationEN,
        auth: authEN,
      },
      no: {
        roles: rolesNO,
        common: commonNO,
        navigation: navigationNO,
        auth: authNO,
      },
    },

    // Allow partial bundles - other namespaces load via HTTP backend
    partialBundledLanguages: true,

    // Load all namespaces initially
    preload: Object.values(SUPPORTED_LANGUAGES),

    // Separate keys with dots
    keySeparator: '.',

    // Separate namespaces with colons
    nsSeparator: ':',

    // Return null for missing keys (instead of key itself)
    returnNull: false,

    // Return empty string for missing keys in production
    returnEmptyString: !import.meta.env.DEV,

    // Reload on language change
    reloadOnPrerender: import.meta.env.DEV,
  });

// Export configured i18n instance
export default i18n;

/**
 * Change application language
 *
 * @param language - Language code to change to
 * @returns Promise that resolves when language is changed
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(language);
};

/**
 * Get current language
 *
 * @returns Current language code
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage;
};

/**
 * Check if a language is supported
 *
 * @param language - Language code to check
 * @returns True if language is supported
 */
export const isSupportedLanguage = (language: string): language is SupportedLanguage => {
  return Object.values(SUPPORTED_LANGUAGES).includes(language as SupportedLanguage);
};

/**
 * Format date according to current locale
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const currentLang = getCurrentLanguage();

  // Norwegian (Bokmål) locale
  const locale = currentLang === 'no' ? 'nb-NO' : 'en-US';

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format number according to current locale
 *
 * @param value - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  const currentLang = getCurrentLanguage();
  const locale = currentLang === 'no' ? 'nb-NO' : 'en-US';

  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Format currency according to current locale
 *
 * @param value - Amount to format
 * @param currency - Currency code (default: NOK)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = 'NOK'
): string => {
  const currentLang = getCurrentLanguage();
  const locale = currentLang === 'no' ? 'nb-NO' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format relative time (e.g., "2 days ago")
 *
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const currentLang = getCurrentLanguage();
  const locale = currentLang === 'no' ? 'nb-NO' : 'en-US';

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  // Define time units
  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  // Find appropriate unit
  for (const { unit, seconds } of units) {
    const value = Math.floor(diffInSeconds / seconds);
    if (Math.abs(value) >= 1) {
      return rtf.format(-value, unit);
    }
  }

  return rtf.format(0, 'second');
};

/**
 * Type-safe translation key helper
 * Use this to get autocomplete for translation keys
 *
 * @example
 * ```ts
 * const key = translationKey('roles', 'case_handler');
 * // Returns: 'roles.case_handler'
 * ```
 */
export const translationKey = (namespace: string, key: string): string => {
  return `${namespace}.${key}`;
};
