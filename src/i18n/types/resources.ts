/**
 * Type-safe Translation Resources
 *
 * Provides TypeScript type definitions for all translation resources
 * ensuring type safety when using translation keys.
 *
 * @module i18n/types/resources
 */

// Import translation JSON files for type inference
import type commonNo from '../../../public/locales/no/common.json';
import type rbacNo from '../../../public/locales/no/rbac.json';
import type formsNo from '../../../public/locales/no/forms.json';
import type errorsNo from '../../../public/locales/no/errors.json';
import type validationNo from '../../../public/locales/no/validation.json';
import type bookingNo from '../../../public/locales/no/booking.json';
import type facilityNo from '../../../public/locales/no/facility.json';
import type calendarNo from '../../../public/locales/no/calendar.json';

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
  | 'facility'
  | 'calendar';

/**
 * Resource type for each namespace
 */
export interface NamespaceResources {
  common: typeof commonNo;
  rbac: typeof rbacNo;
  forms: typeof formsNo;
  errors: typeof errorsNo;
  validation: typeof validationNo;
  booking: typeof bookingNo;
  facility: typeof facilityNo;
  calendar: typeof calendarNo;
}

/**
 * Resource type for each language
 */
export interface Resources {
  common: typeof commonNo;
  rbac: typeof rbacNo;
  forms: typeof formsNo;
  errors: typeof errorsNo;
  validation: typeof validationNo;
  booking: typeof bookingNo;
  facility: typeof facilityNo;
  calendar: typeof calendarNo;
}

/**
 * Utility type for creating dot notation paths from nested objects
 *
 * @example
 * DotNotation<{ a: { b: { c: string } } }> = 'a' | 'a.b' | 'a.b.c'
 */
export type DotNotation<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? DotNotation<T[K], P extends '' ? K : `${P}.${K}`> | (P extends '' ? K : `${P}.${K}`)
          : P extends ''
          ? K
          : `${P}.${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Type-safe translation key for a specific namespace
 *
 * @example
 * TranslationKey<'common'> = 'actions.save' | 'actions.cancel' | ...
 */
export type TranslationKey<NS extends Namespaces = DefaultNamespace> =
  NS extends keyof Resources ? DotNotation<Resources[NS]> : never;

/**
 * Get the type of a translation value for a specific key
 */
export type TranslationValue<
  NS extends Namespaces,
  K extends TranslationKey<NS>
> = NS extends keyof Resources
  ? K extends keyof Resources[NS]
    ? Resources[NS][K]
    : never
  : never;

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
  return ['common', 'rbac', 'forms', 'errors', 'validation', 'booking', 'facility', 'calendar'].includes(value);
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
  ? Record<string, any>
  : T extends `${string}{{${infer Param}}}${infer Rest}`
  ? { [K in Param]: string | number } & ExtractInterpolations<Rest>
  : {};

/**
 * Type-safe translation function signature
 */
export type TypedTranslationFunction = {
  <NS extends Namespaces = DefaultNamespace, K extends TranslationKey<NS> = TranslationKey<NS>>(
    key: K,
    options?: TranslationOptions & TranslationParams
  ): string;

  <NS extends Namespaces = DefaultNamespace>(
    key: string,
    defaultValue: string,
    options?: TranslationOptions & TranslationParams
  ): string;
};
