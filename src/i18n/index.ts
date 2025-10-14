// Re-export the main translation hook for backward compatibility
export { useTranslation } from './hooks/useTranslation';

// Export types for convenience
export type { Language, TranslationFunction, TranslationParams } from './types';

// Export the language context for direct access if needed
export { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
