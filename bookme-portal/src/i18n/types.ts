export type Language = 'NO' | 'EN';

export interface TranslationParams {
  readonly [key: string]: string | number;
}

export type TranslationFunction = (key: string, params?: TranslationParams, fallback?: string) => string;
