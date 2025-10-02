"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

import type { Language } from '@/i18n/types';

interface LanguageContextType {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  readonly children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps): JSX.Element => {
  const [language, setLanguageState] = useState<Language>('NO'); // Norsk som standard

  const setLanguage = useCallback((newLanguage: Language): void => {
    setLanguageState(newLanguage);
    localStorage.setItem('bookme-language', newLanguage);
  }, []);

  const toggleLanguage = useCallback((): void => {
    const newLanguage = language === 'NO' ? 'EN' : 'NO';
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  // Last inn språk fra localStorage ved oppstart
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('bookme-language') as Language;
    if (savedLanguage && (savedLanguage === 'NO' || savedLanguage === 'EN')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
