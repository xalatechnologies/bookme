# Comprehensive i18n Architecture for BookMe

## Executive Summary

This document outlines a production-ready internationalization (i18n) architecture for the BookMe platform, a Norwegian booking/facility management SaaS application. The architecture prioritizes type safety, developer experience, and seamless integration with the existing RBAC system.

## 1. Library Selection: react-i18next

### Why react-i18next?

After evaluating multiple i18n solutions, **react-i18next** (already installed in the project) is the optimal choice for the following reasons:

1. **Type Safety**: Full TypeScript support with type-safe translation keys
2. **React Integration**: First-class React hooks and HOC support
3. **Performance**: Lazy loading, code splitting, and namespace support
4. **Ecosystem**: Rich ecosystem with formatters, extractors, and management tools
5. **Flexibility**: Supports dynamic content, pluralization, and interpolation
6. **Community**: Large community, excellent documentation, mature solution
7. **Compatibility**: Works seamlessly with TanStack Query and Supabase

### Alternatives Considered

- **react-intl (FormatJS)**: More complex, heavier bundle size
- **lingui**: Excellent but smaller community, less tooling
- **Custom solution**: Time-consuming, lacks features

## 2. File Structure

```
src/
├── i18n/
│   ├── config/
│   │   ├── i18next.config.ts         # Main i18next configuration
│   │   ├── languages.ts              # Supported languages config
│   │   └── namespaces.ts             # Translation namespaces
│   │
│   ├── locales/
│   │   ├── no/                       # Norwegian translations
│   │   │   ├── common.json
│   │   │   ├── rbac.json
│   │   │   ├── forms.json
│   │   │   ├── errors.json
│   │   │   ├── booking.json
│   │   │   ├── facility.json
│   │   │   └── validation.json
│   │   │
│   │   └── en/                       # English translations
│   │       ├── common.json
│   │       ├── rbac.json
│   │       ├── forms.json
│   │       ├── errors.json
│   │       ├── booking.json
│   │       ├── facility.json
│   │       └── validation.json
│   │
│   ├── types/
│   │   ├── resources.ts              # Type definitions for all translations
│   │   ├── custom.d.ts               # i18next module augmentation
│   │   └── index.ts                  # Export all types
│   │
│   ├── formatters/
│   │   ├── date.ts                   # Date formatting utilities
│   │   ├── time.ts                   # Time formatting utilities
│   │   ├── currency.ts               # Currency (NOK) formatting
│   │   └── number.ts                 # Number formatting utilities
│   │
│   ├── hooks/
│   │   ├── useTranslation.ts         # Enhanced translation hook
│   │   ├── useFormatters.ts          # Formatting hooks
│   │   ├── useRoleTranslation.ts     # RBAC-specific translations
│   │   └── useValidationMessages.ts   # Form validation messages
│   │
│   ├── components/
│   │   ├── LanguageSelector.tsx      # Language switcher component
│   │   ├── TranslatedText.tsx        # Text component with translation
│   │   └── LocalizedDate.tsx         # Date display component
│   │
│   ├── utils/
│   │   ├── extractKeys.ts            # Extract translation keys from code
│   │   ├── validateTranslations.ts   # Validate translation completeness
│   │   └── generateTypes.ts          # Generate TypeScript types
│   │
│   └── index.ts                      # Main export file
```

## 3. TypeScript Type System

### 3.1 Resource Type Definitions

```typescript
// src/i18n/types/resources.ts
import type no from '../locales/no';
import type en from '../locales/en';

export type DefaultNamespace = 'common';
export type Namespaces = keyof typeof no;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: DefaultNamespace;
    resources: {
      no: typeof no;
      en: typeof en;
    };
  }
}

// Type-safe translation keys
export type TranslationKey<NS extends Namespaces = DefaultNamespace> =
  NS extends keyof typeof no ? DotNotation<typeof no[NS]> : never;

// Utility type for dot notation paths
type DotNotation<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? DotNotation<T[K], P extends '' ? K : `${P}.${K}`>
          : P extends ''
          ? K
          : `${P}.${K}`
        : never;
    }[keyof T]
  : never;
```

### 3.2 RBAC Translation Types

```typescript
// src/i18n/types/rbac.types.ts
import type { SystemRole, ExtendedOrgRole } from '@/constants/roles';

export interface RBACTranslations {
  roles: Record<SystemRole, {
    label: string;
    description: string;
  }>;
  permissions: {
    resources: Record<string, string>;
    actions: Record<string, string>;
    messages: {
      granted: string;
      denied: string;
      insufficientRole: string;
    };
  };
  features: Record<string, {
    name: string;
    description: string;
  }>;
}
```

## 4. Implementation Examples

### 4.1 i18next Configuration

```typescript
// src/i18n/config/i18next.config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all namespaces
import commonNo from '../locales/no/common.json';
import commonEn from '../locales/en/common.json';
import rbacNo from '../locales/no/rbac.json';
import rbacEn from '../locales/en/rbac.json';

export const defaultNS = 'common';
export const supportedLanguages = ['no', 'en'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

const resources = {
  no: {
    common: commonNo,
    rbac: rbacNo,
    // ... other namespaces
  },
  en: {
    common: commonEn,
    rbac: rbacEn,
    // ... other namespaces
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'no',
    defaultNS,
    debug: import.meta.env.DEV,

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bookme-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes
      format: (value, format, lng) => {
        if (format === 'date') return formatDate(value, lng);
        if (format === 'time') return formatTime(value, lng);
        if (format === 'currency') return formatCurrency(value, lng);
        if (format === 'number') return formatNumber(value, lng);
        return value;
      },
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
  });

export default i18n;
```

### 4.2 Role Translation Implementation

```typescript
// src/i18n/hooks/useRoleTranslation.ts
import { useTranslation } from 'react-i18next';
import type { SystemRole, ExtendedOrgRole } from '@/constants/roles';

export const useRoleTranslation = () => {
  const { t, i18n } = useTranslation('rbac');

  const getRoleLabel = (role: SystemRole): string => {
    return t(`roles.${role}.label`);
  };

  const getRoleDescription = (role: SystemRole): string => {
    return t(`roles.${role}.description`);
  };

  const getPermissionLabel = (resource: string, action: string): string => {
    return t('permissions.label', {
      resource: t(`permissions.resources.${resource}`),
      action: t(`permissions.actions.${action}`),
    });
  };

  const getFeatureLabel = (featureKey: string): string => {
    return t(`features.${featureKey}.name`);
  };

  const getFeatureDescription = (featureKey: string): string => {
    return t(`features.${featureKey}.description`);
  };

  return {
    getRoleLabel,
    getRoleDescription,
    getPermissionLabel,
    getFeatureLabel,
    getFeatureDescription,
    language: i18n.language as 'no' | 'en',
  };
};
```

### 4.3 Form Validation Messages

```typescript
// src/i18n/hooks/useValidationMessages.ts
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const useValidationMessages = () => {
  const { t } = useTranslation('validation');

  const getZodErrorMap = (): z.ZodErrorMap => (error, ctx) => {
    switch (error.code) {
      case z.ZodIssueCode.too_small:
        if (error.type === 'string')
          return t('string.min', { min: error.minimum });
        if (error.type === 'number')
          return t('number.min', { min: error.minimum });
        if (error.type === 'array')
          return t('array.min', { min: error.minimum });
        break;
      case z.ZodIssueCode.too_big:
        if (error.type === 'string')
          return t('string.max', { max: error.maximum });
        if (error.type === 'number')
          return t('number.max', { max: error.maximum });
        break;
      case z.ZodIssueCode.invalid_type:
        if (error.expected === 'string')
          return t('type.string');
        if (error.expected === 'number')
          return t('type.number');
        if (error.expected === 'boolean')
          return t('type.boolean');
        break;
      case z.ZodIssueCode.invalid_string:
        if (error.validation === 'email')
          return t('string.email');
        if (error.validation === 'url')
          return t('string.url');
        break;
      case z.ZodIssueCode.custom:
        return error.message || t('generic.invalid');
    }
    return ctx.defaultError;
  };

  const getFieldError = (field: string, error: string): string => {
    return t(`fields.${field}.errors.${error}`, {
      defaultValue: t(`errors.${error}`, { defaultValue: error }),
    });
  };

  return {
    getZodErrorMap,
    getFieldError,
    required: t('errors.required'),
    invalid: t('errors.invalid'),
  };
};
```

### 4.4 Date/Time/Currency Formatters

```typescript
// src/i18n/formatters/date.ts
import { format, parseISO } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';

const locales = {
  no: nb,
  en: enUS,
};

export const formatDate = (
  date: Date | string,
  lng: string = 'no',
  formatStr: string = 'PP'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, {
    locale: locales[lng as keyof typeof locales] || locales.no,
  });
};

// src/i18n/formatters/currency.ts
export const formatCurrency = (
  amount: number,
  lng: string = 'no'
): string => {
  const formatter = new Intl.NumberFormat(
    lng === 'no' ? 'nb-NO' : 'en-US',
    {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );
  return formatter.format(amount);
};

// src/i18n/formatters/time.ts
export const formatTime = (
  date: Date | string,
  lng: string = 'no'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const formatter = new Intl.DateTimeFormat(
    lng === 'no' ? 'nb-NO' : 'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
  return formatter.format(dateObj);
};
```

## 5. Translation File Templates

### 5.1 Norwegian RBAC Translations (no/rbac.json)

```json
{
  "roles": {
    "platform_admin": {
      "label": "Plattformadministrator",
      "description": "Full systemtilgang på tvers av alle organisasjoner"
    },
    "owner": {
      "label": "Eier",
      "description": "Full kontroll over organisasjonen"
    },
    "admin": {
      "label": "Administrator",
      "description": "Administrativ tilgang til organisasjonen"
    },
    "saksbehandler": {
      "label": "Saksbehandler",
      "description": "Kan håndtere bookinger og kundeforespørsler"
    },
    "redaktør": {
      "label": "Redaktør",
      "description": "Kan administrere innhold og fasiliteter"
    },
    "staff": {
      "label": "Ansatt",
      "description": "Operativ tilgang til fasiliteter og bookinger"
    },
    "lesetilgang": {
      "label": "Lesetilgang",
      "description": "Kan kun se informasjon, ikke gjøre endringer"
    },
    "customer": {
      "label": "Kunde",
      "description": "Standard kundetilgang"
    }
  },
  "permissions": {
    "resources": {
      "facilities": "Fasiliteter",
      "bookings": "Bookinger",
      "availability_rules": "Tilgjengelighetsregler",
      "pricing_rules": "Prisregler",
      "organizations": "Organisasjoner",
      "analytics": "Analyser",
      "billing": "Fakturering"
    },
    "actions": {
      "create": "Opprette",
      "read": "Lese",
      "update": "Oppdatere",
      "delete": "Slette",
      "manage": "Administrere",
      "export": "Eksportere"
    },
    "label": "{{action}} {{resource}}",
    "messages": {
      "granted": "Tilgang innvilget",
      "denied": "Tilgang nektet",
      "insufficientRole": "Du har ikke tilstrekkelige rettigheter for denne handlingen"
    }
  },
  "features": {
    "analytics": {
      "name": "Analyser",
      "description": "Se detaljerte rapporter og statistikk"
    },
    "billing": {
      "name": "Fakturering",
      "description": "Administrere fakturaer og betalinger"
    },
    "advancedBooking": {
      "name": "Avansert booking",
      "description": "Tilgang til avanserte bookingfunksjoner"
    }
  }
}
```

### 5.2 English RBAC Translations (en/rbac.json)

```json
{
  "roles": {
    "platform_admin": {
      "label": "Platform Administrator",
      "description": "Full system access across all organizations"
    },
    "owner": {
      "label": "Owner",
      "description": "Full control over the organization"
    },
    "admin": {
      "label": "Administrator",
      "description": "Administrative access to the organization"
    },
    "saksbehandler": {
      "label": "Case Handler",
      "description": "Can handle bookings and customer requests"
    },
    "redaktør": {
      "label": "Editor",
      "description": "Can manage content and facilities"
    },
    "staff": {
      "label": "Staff Member",
      "description": "Operational access to facilities and bookings"
    },
    "lesetilgang": {
      "label": "Read-Only Access",
      "description": "Can only view information, cannot make changes"
    },
    "customer": {
      "label": "Customer",
      "description": "Standard customer access"
    }
  },
  "permissions": {
    "resources": {
      "facilities": "Facilities",
      "bookings": "Bookings",
      "availability_rules": "Availability Rules",
      "pricing_rules": "Pricing Rules",
      "organizations": "Organizations",
      "analytics": "Analytics",
      "billing": "Billing"
    },
    "actions": {
      "create": "Create",
      "read": "Read",
      "update": "Update",
      "delete": "Delete",
      "manage": "Manage",
      "export": "Export"
    },
    "label": "{{action}} {{resource}}",
    "messages": {
      "granted": "Access granted",
      "denied": "Access denied",
      "insufficientRole": "You don't have sufficient permissions for this action"
    }
  },
  "features": {
    "analytics": {
      "name": "Analytics",
      "description": "View detailed reports and statistics"
    },
    "billing": {
      "name": "Billing",
      "description": "Manage invoices and payments"
    },
    "advancedBooking": {
      "name": "Advanced Booking",
      "description": "Access to advanced booking features"
    }
  }
}
```

## 6. HOCs and Hooks

### 6.1 Enhanced Translation Hook

```typescript
// src/i18n/hooks/useTranslation.ts
import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { Namespaces, TranslationKey } from '../types';

export function useTranslation<NS extends Namespaces = 'common'>(
  namespace?: NS
) {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  const translate = <K extends TranslationKey<NS>>(
    key: K,
    options?: Record<string, any>
  ): string => {
    return t(key as string, options) as string;
  };

  const translateWithFallback = <K extends TranslationKey<NS>>(
    key: K,
    fallback: string,
    options?: Record<string, any>
  ): string => {
    const translation = t(key as string, options);
    return translation === key ? fallback : translation as string;
  };

  return {
    t: translate,
    tf: translateWithFallback,
    i18n,
    ready,
    language: i18n.language as 'no' | 'en',
    changeLanguage: i18n.changeLanguage,
  };
}
```

### 6.2 withTranslation HOC

```typescript
// src/i18n/components/withTranslation.tsx
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Namespaces } from '../types';

export function withTranslation<
  P extends object,
  NS extends Namespaces = 'common'
>(Component: React.ComponentType<P & ReturnType<typeof useTranslation>>, namespace?: NS) {
  return function TranslatedComponent(props: P) {
    const translationProps = useTranslation(namespace);
    return <Component {...props} {...translationProps} />;
  };
}
```

## 7. Build-time Validation

### 7.1 Translation Validation Script

```typescript
// scripts/validate-translations.ts
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  missing: string[];
  extra: string[];
  errors: string[];
}

function validateTranslations(): ValidationResult {
  const localesDir = path.join(__dirname, '../src/i18n/locales');
  const languages = ['no', 'en'];
  const namespaces = ['common', 'rbac', 'forms', 'errors', 'validation'];

  const results: ValidationResult = {
    missing: [],
    extra: [],
    errors: [],
  };

  // Get all keys from the primary language (Norwegian)
  const primaryKeys = new Set<string>();
  namespaces.forEach(ns => {
    const filePath = path.join(localesDir, 'no', `${ns}.json`);
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      extractKeys(content, ns, primaryKeys);
    }
  });

  // Validate other languages
  languages.forEach(lang => {
    if (lang === 'no') return; // Skip primary language

    const langKeys = new Set<string>();
    namespaces.forEach(ns => {
      const filePath = path.join(localesDir, lang, `${ns}.json`);
      if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        extractKeys(content, ns, langKeys);
      } else {
        results.errors.push(`Missing file: ${lang}/${ns}.json`);
      }
    });

    // Find missing keys
    primaryKeys.forEach(key => {
      if (!langKeys.has(key)) {
        results.missing.push(`${lang}: ${key}`);
      }
    });

    // Find extra keys
    langKeys.forEach(key => {
      if (!primaryKeys.has(key)) {
        results.extra.push(`${lang}: ${key}`);
      }
    });
  });

  return results;
}

function extractKeys(obj: any, prefix: string, keys: Set<string>, path: string = ''): void {
  Object.keys(obj).forEach(key => {
    const fullPath = path ? `${path}.${key}` : `${prefix}:${key}`;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      extractKeys(obj[key], prefix, keys, fullPath);
    } else {
      keys.add(fullPath);
    }
  });
}

// Run validation
const results = validateTranslations();
if (results.missing.length > 0 || results.errors.length > 0) {
  console.error('Translation validation failed!');
  console.error('Missing keys:', results.missing);
  console.error('Errors:', results.errors);
  process.exit(1);
}
console.log('Translation validation passed!');
```

### 7.2 Package.json Scripts

```json
{
  "scripts": {
    "i18n:validate": "tsx scripts/validate-translations.ts",
    "i18n:extract": "i18next-parser",
    "i18n:types": "tsx scripts/generate-types.ts",
    "build": "npm run i18n:validate && vite build",
    "prebuild": "npm run i18n:types"
  }
}
```

## 8. Translation Extraction Workflow

### 8.1 i18next-parser Configuration

```javascript
// i18next-parser.config.js
module.exports = {
  locales: ['no', 'en'],
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,tsx}'],
  keySeparator: '.',
  namespaceSeparator: ':',
  createOldCatalogs: false,
  keepRemoved: false,
  defaultNamespace: 'common',
  lexers: {
    ts: ['JavascriptLexer'],
    tsx: ['JsxLexer'],
  },
  sort: true,
  skipDefaultValues: false,
  useKeysAsDefaultValue: false,
  verbose: true,
  failOnWarnings: false,
};
```

### 8.2 Translation Management Workflow

```markdown
## Translation Management Workflow

### For Developers

1. **Adding New Translations**
   ```bash
   # Add translation key in code
   const { t } = useTranslation('common');
   t('newFeature.title');

   # Extract new keys
   npm run i18n:extract

   # Update translations in locale files
   # Validate translations
   npm run i18n:validate
   ```

2. **Type Generation**
   ```bash
   # Generate TypeScript types from translation files
   npm run i18n:types
   ```

### For Non-Developers

1. **Using Translation Management Platform**
   - Export translations to JSON
   - Upload to Crowdin/Lokalise/POEditor
   - Translators work on the platform
   - Export completed translations
   - Import back to the project

2. **Simple Spreadsheet Workflow**
   - Export to CSV: `npm run i18n:export-csv`
   - Edit in Google Sheets/Excel
   - Import from CSV: `npm run i18n:import-csv`
```

## 9. Integration with Existing Code

### 9.1 Migration from Current System

```typescript
// src/i18n/migration/migrate.ts
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

export function useLegacyTranslation() {
  const { language } = useLanguage();
  const { t, i18n } = useTranslation();

  // Sync legacy language context with i18next
  useEffect(() => {
    const lng = language === 'NO' ? 'no' : 'en';
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [language, i18n]);

  return { t, language };
}
```

### 9.2 App.tsx Integration

```typescript
// src/App.tsx
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config/i18next.config';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Your app components */}
      </Suspense>
    </I18nextProvider>
  );
}
```

## 10. Testing Strategy

### 10.1 Translation Tests

```typescript
// src/i18n/__tests__/translations.test.ts
import { describe, it, expect } from 'vitest';
import i18n from '../config/i18next.config';

describe('i18n Configuration', () => {
  it('should have all required namespaces', () => {
    const namespaces = ['common', 'rbac', 'forms', 'errors'];
    namespaces.forEach(ns => {
      expect(i18n.hasResourceBundle('no', ns)).toBe(true);
      expect(i18n.hasResourceBundle('en', ns)).toBe(true);
    });
  });

  it('should translate role labels correctly', () => {
    expect(i18n.t('rbac:roles.owner.label', { lng: 'no' })).toBe('Eier');
    expect(i18n.t('rbac:roles.owner.label', { lng: 'en' })).toBe('Owner');
  });

  it('should format currency correctly', () => {
    const amount = 1500;
    expect(i18n.t('common:price', { lng: 'no', amount })).toContain('kr');
  });
});
```

## 11. Performance Considerations

1. **Lazy Loading**: Load translation namespaces on demand
2. **Code Splitting**: Split translations by route/feature
3. **Caching**: Use localStorage for language preference
4. **Bundle Size**: Only include used translations in production

## 12. Deployment Checklist

- [ ] All translations validated
- [ ] TypeScript types generated
- [ ] No missing translation keys
- [ ] Formatters working correctly
- [ ] Language switching tested
- [ ] Build-time validation passing
- [ ] Production bundle optimized
- [ ] Documentation updated

## Conclusion

This i18n architecture provides a robust, type-safe, and scalable solution for the BookMe platform. It seamlessly integrates with the existing RBAC system while maintaining excellent developer experience and performance.