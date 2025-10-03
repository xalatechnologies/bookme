import { useLanguage } from '@/contexts/LanguageContext';
import { commonTranslations } from '@/i18n/translations/common';
import { facilityTranslations } from '@/i18n/translations/facility';
import { bookingTranslations } from '@/i18n/translations/booking';
import type { TranslationFunction, TranslationParams } from '@/i18n/types';

// Kombiner alle oversettelser
const allTranslations = {
  NO: {
    ...commonTranslations.NO,
    ...facilityTranslations.NO,
    ...bookingTranslations.NO
  },
  EN: {
    ...commonTranslations.EN,
    ...facilityTranslations.EN,
    ...bookingTranslations.EN
  }
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string, params?: TranslationParams, fallback?: string): string => {
    const keys = key.split('.');
    let translation: any = allTranslations[language];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback til engelsk hvis norsk oversettelse ikke finnes
        if (language === 'NO') {
          let fallbackTranslation: any = allTranslations.EN;
          for (const fallbackKey of keys) {
            if (fallbackTranslation && typeof fallbackTranslation === 'object' && fallbackKey in fallbackTranslation) {
              fallbackTranslation = fallbackTranslation[fallbackKey];
            } else {
              return fallback || key; // Returner fallback eller nøkkelen hvis ingen oversettelse finnes
            }
          }
          translation = fallbackTranslation;
        } else {
          return fallback || key; // Returner fallback eller nøkkelen hvis ingen oversettelse finnes
        }
        break;
      }
    }

    if (typeof translation !== 'string') {
      return fallback || key;
    }

    // Erstatt parametere i oversettelsen
    if (params) {
      let result = translation;
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
      return result;
    }

    return translation;
  };

  return { t, language };
};
