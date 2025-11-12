"use client";

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { Language } from '@/i18n/types';
import { changeLanguage as changeI18nLanguage, getCurrentLanguage } from '@/i18n/config';

export interface LanguageContextType {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  readonly children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps): JSX.Element => {
  const { i18n } = useTranslation();

  // Initialize with current i18n language (mapping: 'no' -> 'NO', 'en' -> 'EN')
  const [language, setLanguageState] = useState<Language>(() => {
    const currentLang = getCurrentLanguage();
    return currentLang === 'no' ? 'NO' : 'EN';
  });

  const setLanguage = useCallback(async (newLanguage: Language): Promise<void> => {
    setLanguageState(newLanguage);

    // Sync with i18n (mapping: 'NO' -> 'no', 'EN' -> 'en')
    const i18nLang = newLanguage === 'NO' ? 'no' : 'en';
    await changeI18nLanguage(i18nLang as 'no' | 'en');

    // Store in localStorage (keeping existing key for compatibility)
    localStorage.setItem('booknor-language', newLanguage);
  }, []);

  const toggleLanguage = useCallback((): void => {
    const newLanguage = language === 'NO' ? 'EN' : 'NO';
    void setLanguage(newLanguage);
  }, [language, setLanguage]);

  // Sync with i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string): void => {
      const newLang: Language = lng === 'no' ? 'NO' : 'EN';
      if (newLang !== language) {
        setLanguageState(newLang);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, language]);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('booknor-language') as Language;
    if (savedLanguage && (savedLanguage === 'NO' || savedLanguage === 'EN')) {
      void setLanguage(savedLanguage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
