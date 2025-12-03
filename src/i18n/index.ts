/**
 * i18n System Exports
 *
 * This module re-exports key i18n functionality for convenient access.
 * All translations now use react-i18next system.
 *
 * @see src/i18n/config.ts - Main i18n configuration
 */

// Re-export react-i18next for convenience
export { useTranslation } from 'react-i18next';

// Export i18n configuration and utilities
export {
  default as i18n,
  changeLanguage,
  getCurrentLanguage,
  isSupportedLanguage,
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  translationKey,
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  NAMESPACES,
  type SupportedLanguage,
} from './config';

// Export types for convenience
export type { Language, TranslationFunction, TranslationParams } from './types';

// Export the language context for LanguageToggle component compatibility
export { useLanguage, LanguageProvider } from "@/contexts/hooks";
