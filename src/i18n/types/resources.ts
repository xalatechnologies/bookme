/**
 * Type-safe Translation Resources
 *
 * Provides TypeScript type definitions for all translation resources
 * ensuring type safety when using translation keys.
 *
 * @module i18n/types/resources
 */

// Import translation JSON files for type inference
import type commonNO from '../../../public/locales/no/common.json';
import type rbacNO from '../../../public/locales/no/rbac.json';
import type formsNO from '../../../public/locales/no/forms.json';
import type errorsNO from '../../../public/locales/no/errors.json';
import type validationNO from '../../../public/locales/no/validation.json';
import type bookingNO from '../../../public/locales/no/booking.json';
import type bookingsNO from '../../../public/locales/no/bookings.json';
import type facilityNO from '../../../public/locales/no/facility.json';
import type calendarNO from '../../../public/locales/no/calendar.json';
import type adminNO from '../../../public/locales/no/admin.json';
import type checkoutNO from '../../../public/locales/no/checkout.json';
import type userNO from '../../../public/locales/no/user.json';
import type navigationNO from '../../../public/locales/no/navigation.json';

/**
 * Default namespace for translations
 */
export type DefaultNamespace = 'common';

/**
 * All available namespaces
 */
export type Namespaces =
  | 'common'
  | 'rbac'
  | 'forms'
  | 'errors'
  | 'validation'
  | 'booking'
  | 'bookings'
  | 'facility'
  | 'calendar'
  | 'admin'
  | 'checkout'
  | 'user'
  | 'navigation';

/**
 * Resource type for each namespace
 */
export interface NamespaceResources {
  common: typeof commonNO;
  rbac: typeof rbacNO;
  forms: typeof formsNO;
  errors: typeof errorsNO;
  validation: typeof validationNO;
  booking: typeof bookingNO;
  bookings: typeof bookingsNO;
  facility: typeof facilityNO;
  calendar: typeof calendarNO;
  admin: typeof adminNO;
  checkout: typeof checkoutNO;
  user: typeof userNO;
  navigation: typeof navigationNO;
}

/**
 * Resource type for each language
 */
export interface Resources {
  common: typeof commonNO;
  rbac: typeof rbacNO;
  forms: typeof formsNO;
  errors: typeof errorsNO;
  validation: typeof validationNO;
  booking: typeof bookingNO;
  bookings: typeof bookingsNO;
  facility: typeof facilityNO;
  calendar: typeof calendarNO;
  admin: typeof adminNO;
  checkout: typeof checkoutNO;
  user: typeof userNO;
  navigation: typeof navigationNO;
}

/**
 * Simplified type for translation keys to avoid deep instantiation issues
 */
export type TranslationKey<T extends Namespaces = DefaultNamespace> = string;

/**
 * Translation function parameters
 */
export interface TranslationParams {
  readonly [key: string]: string | number | boolean | Date;
}

/**
 * Translation options
 */
export interface TranslationOptions {
  readonly lng?: 'no' | 'en';
  readonly ns?: Namespaces;
  readonly defaultValue?: string;
  readonly returnObjects?: boolean;
  readonly count?: number;
  readonly context?: string;
  readonly replace?: TranslationParams;
}

/**
 * Module augmentation for i18next
 * This enables TypeScript to understand our custom types
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: DefaultNamespace;
    resources: Resources;
    returnNull: false;
    returnEmptyString: false;
  }
}

/**
 * Type guard to check if a string is a valid namespace
 */
export const isNamespace = (value: string): value is Namespaces => {
  return ['common', 'rbac', 'forms', 'errors', 'validation', 'booking', 'bookings', 'facility', 'calendar', 'admin', 'checkout', 'user', 'navigation'].includes(value);
};

/**
 * Type guard to check if a string is a valid translation key
 */
export const isTranslationKey = <NS extends Namespaces>(
  value: string,
  namespace: NS
): value is TranslationKey<NS> => {
  // This would require runtime checking against actual translation files
  // For now, we just check if it's a non-empty string
  return typeof value === 'string' && value.length > 0;
};

/**
 * Helper type for extracting interpolation parameters from a translation string
 *
 * @example
 * ExtractInterpolations<'Hello {{name}}, you have {{count}} messages'> = { name: string; count: number }
 */
export type ExtractInterpolations<T extends string> = string extends T
  ? Record<string, unknown>
  : T extends `${string}{{${infer Param}}}${infer Rest}`
  ? { [K in Param]: string | number } & ExtractInterpolations<Rest>
  : Record<string, never>;

/**
 * Type-safe translation function signature
 */
export type TypedTranslationFunction = {
  <NS extends Namespaces = DefaultNamespace, K extends TranslationKey<NS> = TranslationKey<NS>>(
    key: K,
    options?: TranslationOptions & TranslationParams
  ): string;

  <T extends Namespaces = DefaultNamespace>(
    key: string,
    defaultValue: string,
    options?: TranslationOptions & TranslationParams
  ): string;
};