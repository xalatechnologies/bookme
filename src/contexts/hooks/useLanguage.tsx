import { useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import type { LanguageContextType } from '../LanguageContext';

/**
 * Hook to use language context
 *
 * @throws {Error} If used outside of LanguageProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { language, setLanguage, toggleLanguage } = useLanguage();
 *
 *   return (
 *     <div>
 *       <p>Current language: {language}</p>
 *       <button onClick={toggleLanguage}>Toggle Language</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
