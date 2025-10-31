/**
 * i18n Type Definitions
 *
 * Central export point for all i18n type definitions.
 *
 * @module i18n/types
 */

// Re-export all types from the types directory
export * from './types/resources';
export * from './types/custom';

// Legacy types for backward compatibility
export type Language = 'NO' | 'EN';

export interface TranslationParams {
  readonly [key: string]: string | number;
}

export type TranslationFunction = (key: string, params?: TranslationParams, fallback?: string) => string;
