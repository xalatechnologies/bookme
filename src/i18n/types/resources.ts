/**
 * Type-safe Translation Resources
 *
 * Provides TypeScript type definitions for all translation resources
 * ensuring type safety when using translation keys.
 *
 * @module i18n/types/resources
 */

// Define resource types based on the expected structure
// This avoids importing from public directory which causes Vite warnings

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
  common: Record<string, unknown>;
  rbac: Record<string, unknown>;
  forms: Record<string, unknown>;
  errors: Record<string, unknown>;
  validation: Record<string, unknown>;
  booking: Record<string, unknown>;
  bookings: Record<string, unknown>;
  facility: Record<string, unknown>;
  calendar: Record<string, unknown>;
  admin: Record<string, unknown>;
  checkout: Record<string, unknown>;
  user: Record<string, unknown>;
  navigation: Record<string, unknown>;
}

/**
 * Resource type for each language
 */
export interface Resources {
  common: Record<string, unknown>;
  rbac: Record<string, unknown>;
  forms: Record<string, unknown>;
  errors: Record<string, unknown>;
  validation: Record<string, unknown>;
  booking: Record<string, unknown>;
  bookings: Record<string, unknown>;
  facility: Record<string, unknown>;
  calendar: Record<string, unknown>;
  admin: Record<string, unknown>;
  checkout: Record<string, unknown>;
  user: Record<string, unknown>;
  navigation: Record<string, unknown>;
}

/**
 * Simplified type for translation keys to avoid deep instantiation issues
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TranslationKey<NS extends Namespaces = DefaultNamespace> = string;

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractInterpolations<T extends string> = string extends T
  ? Record<string, any>
  : T extends `${string}{{${infer Param}}}${infer Rest}`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  <NS extends Namespaces = DefaultNamespace>(
    key: string,
    defaultValue: string,
    options?: TranslationOptions & TranslationParams
  ): string;
};