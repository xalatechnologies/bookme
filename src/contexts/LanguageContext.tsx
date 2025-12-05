"use client";

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/clients/supabase';

import type { Language } from '@/i18n/types';
import { changeLanguage as changeI18nLanguage, getCurrentLanguage } from '@/i18n/config';

export interface LanguageContextType {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly toggleLanguage: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
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

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ language: i18nLang })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
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

  // Load language from database on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any)
            .from('profiles')
            .select('language')
            .eq('id', user.id)
            .single();
          
          if (data?.language) {
            const savedLang: Language = data.language === 'no' ? 'NO' : 'EN';
            void setLanguage(savedLang);
          }
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };
    
    void loadLanguagePreference();
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
