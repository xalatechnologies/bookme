# i18n Implementation Guide for Booknor

## Table of Contents
1. [Quick Start](#quick-start)
2. [Using Translations in Components](#using-translations-in-components)
3. [RBAC Integration](#rbac-integration)
4. [Formatters Usage](#formatters-usage)
5. [Form Validation](#form-validation)
6. [Migration from Legacy System](#migration-from-legacy-system)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Initialize i18n in Your App

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config/i18next.config';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);
```

### 2. Basic Translation Usage

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common:common.dashboard')}</h1>
      <button>{t('common:actions.save')}</button>
    </div>
  );
};
```

## Using Translations in Components

### Simple Text Translation

```typescript
import { useTranslation } from 'react-i18next';

export const WelcomeMessage = (): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{t('common.welcome')}</h2>
      <p className="text-gray-600">{t('messages.info')}</p>
    </div>
  );
};
```

### Translation with Parameters

```typescript
import { useTranslation } from 'react-i18next';

interface UserGreetingProps {
  readonly userName: string;
  readonly itemCount: number;
}

export const UserGreeting = ({ userName, itemCount }: UserGreetingProps): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div>
      {/* Interpolation */}
      <p>{t('messages.welcome', { name: userName })}</p>

      {/* Pluralization */}
      <p>{t('items.count', { count: itemCount })}</p>

      {/* Formatted values */}
      <p>{t('messages.deleteSuccess', { item: t('common.booking') })}</p>
    </div>
  );
};
```

### Language Switcher Component

```typescript
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = (): JSX.Element => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const handleLanguageChange = (languageCode: string): void => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('booknor-language', languageCode === 'no' ? 'NO' : 'EN');
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {currentLanguage?.flag} {currentLanguage?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

## RBAC Integration

### Using Role Translations

```typescript
import { useTranslation } from 'react-i18next';
import type { SystemRole } from '@/constants/roles';

interface RoleDisplayProps {
  readonly role: SystemRole;
  readonly showDescription?: boolean;
}

export const RoleDisplay = ({ role, showDescription = false }: RoleDisplayProps): JSX.Element => {
  const { t } = useTranslation('rbac');

  return (
    <div className="flex flex-col">
      <span className="font-medium">{t(`roles.${role}.label`)}</span>
      {showDescription && (
        <span className="text-sm text-gray-600">
          {t(`roles.${role}.description`)}
        </span>
      )}
    </div>
  );
};
```

### Permission Labels

```typescript
import { useTranslation } from 'react-i18next';
import type { Permission } from '@/types/rbac';

interface PermissionLabelProps {
  readonly permission: Permission;
}

export const PermissionLabel = ({ permission }: PermissionLabelProps): JSX.Element => {
  const { t } = useTranslation('rbac');

  const resource = t(`permissions.resources.${permission.resource}`);
  const action = t(`permissions.actions.${permission.action}`);

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      {t('permissions.label', { action, resource })}
    </span>
  );
};
```

### Role Management Component

```typescript
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { ExtendedOrgRole } from '@/constants/roles';

interface RoleManagerProps {
  readonly currentRole: ExtendedOrgRole;
  readonly availableRoles: ExtendedOrgRole[];
  readonly onRoleChange: (role: ExtendedOrgRole) => void;
}

export const RoleManager = ({
  currentRole,
  availableRoles,
  onRoleChange
}: RoleManagerProps): JSX.Element => {
  const { t } = useTranslation('rbac');
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleRoleChange = (): void => {
    if (window.confirm(t('transitions.confirmChange', {
      user: 'John Doe',
      fromRole: t(`roles.${currentRole}.label`),
      toRole: t(`roles.${selectedRole}.label`)
    }))) {
      onRoleChange(selectedRole);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('common:common.role')}
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as ExtendedOrgRole)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          {availableRoles.map(role => (
            <option key={role} value={role}>
              {t(`roles.${role}.label`)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {t(`roles.${selectedRole}.description`)}
        </p>
      </div>

      <button
        onClick={handleRoleChange}
        disabled={selectedRole === currentRole}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
      >
        {t('transitions.changeRole', { role: t(`roles.${selectedRole}.label`) })}
      </button>
    </div>
  );
};
```

## Formatters Usage

### Date and Time Formatting

```typescript
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime, formatDateTime } from '@/i18n/formatters/date';

export const BookingDetails = ({ booking }: { booking: Booking }): JSX.Element => {
  const { i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <div className="space-y-2">
      <p>Date: {formatDate(booking.date, lng)}</p>
      <p>Time: {formatTime(booking.startTime, lng)}</p>
      <p>Full DateTime: {formatDateTime(booking.createdAt, lng)}</p>

      {/* Using interpolation formatting */}
      <p>{t('booking.scheduledFor', {
        date: booking.date,
        format: 'dateLong'
      })}</p>
    </div>
  );
};
```

### Currency Formatting

```typescript
import { formatCurrency, formatPriceRange } from '@/i18n/formatters/currency';
import { useTranslation } from 'react-i18next';

interface PricingDisplayProps {
  readonly price: number;
  readonly minPrice?: number;
  readonly maxPrice?: number;
}

export const PricingDisplay = ({ price, minPrice, maxPrice }: PricingDisplayProps): JSX.Element => {
  const { i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <div className="space-y-2">
      <p className="text-2xl font-bold">
        {formatCurrency(price, lng)}
      </p>

      {minPrice && maxPrice && (
        <p className="text-sm text-gray-600">
          Range: {formatPriceRange(minPrice, maxPrice, lng)}
        </p>
      )}
    </div>
  );
};
```

### Number Formatting

```typescript
import { formatNumber, formatPercent, formatCapacity } from '@/i18n/formatters/number';

export const FacilityStats = ({ facility }: { facility: Facility }): JSX.Element => {
  const { i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <span className="text-sm text-gray-500">Capacity</span>
        <p className="text-lg font-semibold">{formatCapacity(facility.capacity, lng)}</p>
      </div>

      <div>
        <span className="text-sm text-gray-500">Utilization</span>
        <p className="text-lg font-semibold">
          {formatPercent(facility.utilization, lng)}
        </p>
      </div>

      <div>
        <span className="text-sm text-gray-500">Area</span>
        <p className="text-lg font-semibold">
          {formatNumber(facility.area, lng)} m²
        </p>
      </div>
    </div>
  );
};
```

## Form Validation

### Using Validation Messages

```typescript
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const BookingForm = (): JSX.Element => {
  const { t } = useTranslation(['forms', 'validation']);

  // Create schema with translated messages
  const bookingSchema = z.object({
    facilityId: z.string().min(1, t('validation:required')),
    date: z.string().min(1, t('validation:required')),
    startTime: z.string().min(1, t('validation:required')),
    duration: z.number()
      .min(30, t('validation:custom.minimumDuration', { duration: 30 }))
      .max(480, t('validation:custom.maximumDuration', { duration: 8 })),
    attendees: z.number()
      .min(1, t('validation:number.min', { min: 1 }))
      .max(100, t('validation:custom.capacityExceeded')),
    notes: z.string().optional(),
  });

  type BookingFormData = z.infer<typeof bookingSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = (data: BookingFormData): void => {
    console.log('Form submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('forms:labels.facility')}
        </label>
        <input
          {...register('facilityId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.facilityId && (
          <p className="mt-1 text-sm text-red-600">{errors.facilityId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('forms:labels.date')}
        </label>
        <input
          type="date"
          {...register('date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {t('common:actions.book')}
      </button>
    </form>
  );
};
```

### Dynamic Validation with i18n

```typescript
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const useValidationSchema = () => {
  const { t } = useTranslation('validation');

  const createEmailSchema = () => z.string()
    .min(1, t('required'))
    .email(t('email'));

  const createPasswordSchema = () => z.string()
    .min(8, t('password.min', { min: 8 }))
    .regex(/[A-Z]/, t('password.uppercase'))
    .regex(/[a-z]/, t('password.lowercase'))
    .regex(/[0-9]/, t('password.number'))
    .regex(/[^A-Za-z0-9]/, t('password.special'));

  const createPhoneSchema = () => z.string()
    .regex(/^\+?[0-9\s-()]+$/, t('phone'));

  return {
    email: createEmailSchema,
    password: createPasswordSchema,
    phone: createPhoneSchema,
  };
};
```

## Migration from Legacy System

### Step 1: Update Language Context

```typescript
// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  readonly language: 'NO' | 'EN';
  readonly setLanguage: (language: 'NO' | 'EN') => void;
  readonly toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { i18n } = useTranslation();

  const language: 'NO' | 'EN' = i18n.language === 'no' ? 'NO' : 'EN';

  const setLanguage = (lang: 'NO' | 'EN'): void => {
    const newLang = lang === 'NO' ? 'no' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('booknor-language', lang);
  };

  const toggleLanguage = (): void => {
    setLanguage(language === 'NO' ? 'EN' : 'NO');
  };

  // Sync with localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('booknor-language') as 'NO' | 'EN' | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
```

### Step 2: Update Existing Components

```typescript
// Before (using old translation system)
import { useTranslation } from '@/i18n/hooks/useTranslation';

const MyComponent = () => {
  const t = useTranslation();
  return <button>{t('common.actions.save')}</button>;
};

// After (using react-i18next)
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  return <button>{t('actions.save')}</button>;
};
```

### Step 3: Update Role Components

```typescript
// Before
import { getRoleLabel } from '@/constants/roles';
import { useLanguage } from '@/contexts/LanguageContext';

const RoleLabel = ({ role }: { role: SystemRole }) => {
  const { language } = useLanguage();
  const locale = language === 'NO' ? 'no' : 'en';
  return <span>{getRoleLabel(role, locale)}</span>;
};

// After
import { useTranslation } from 'react-i18next';

const RoleLabel = ({ role }: { role: SystemRole }) => {
  const { t } = useTranslation('rbac');
  return <span>{t(`roles.${role}.label`)}</span>;
};
```

## Best Practices

### 1. Namespace Organization

```typescript
// Good: Use specific namespaces
const { t } = useTranslation('booking');
t('status.confirmed');

// Bad: Everything in common
const { t } = useTranslation('common');
t('bookingStatusConfirmed');
```

### 2. Type-Safe Translations

```typescript
// Create typed translation hooks
import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { Namespace } from '@/i18n/types';

export function useTypedTranslation<NS extends Namespace>(ns?: NS) {
  return useI18nTranslation(ns);
}
```

### 3. Consistent Key Naming

```json
{
  "actions": {
    "save": "Save",
    "delete": "Delete"
  },
  "messages": {
    "saveSuccess": "Saved successfully",
    "deleteConfirm": "Are you sure you want to delete?"
  }
}
```

### 4. Performance Optimization

```typescript
// Lazy load translation namespaces
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const AdminPanel = () => {
  const { t, i18n } = useTranslation('admin');

  useEffect(() => {
    // Load admin namespace only when needed
    i18n.loadNamespaces(['admin', 'rbac']);
  }, [i18n]);

  return <div>{t('title')}</div>;
};
```

### 5. Testing with i18n

```typescript
// test-utils.tsx
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config/i18next.config';

export const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

// Component test
import { renderWithI18n } from '@/test-utils';

test('displays role label correctly', () => {
  const { getByText } = renderWithI18n(<RoleDisplay role="admin" />);
  expect(getByText('Administrator')).toBeInTheDocument();
});
```

## Troubleshooting

### Missing Translations

```typescript
// Enable debug mode to see missing keys
import i18n from '@/i18n/config/i18next.config';

if (import.meta.env.DEV) {
  i18n.on('missingKey', (lng, ns, key) => {
    console.warn(`Missing translation: ${lng}/${ns}:${key}`);
  });
}
```

### Language Not Changing

```typescript
// Ensure language change is persisted
const handleLanguageChange = async (lng: string) => {
  await i18n.changeLanguage(lng);
  // Force re-render if needed
  window.location.reload();
};
```

### Type Errors

```typescript
// Ensure types are properly imported
/// <reference types="@/i18n/types/custom" />

import type { Resources } from '@/i18n/types/resources';
```

### Performance Issues

```typescript
// Use React.memo for translation-heavy components
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const TranslatedList = memo(({ items }: { items: string[] }) => {
  const { t } = useTranslation();

  return (
    <ul>
      {items.map(item => (
        <li key={item}>{t(item)}</li>
      ))}
    </ul>
  );
});
```

## Next Steps

1. **Complete Migration**: Update all existing components to use react-i18next
2. **Add More Languages**: Extend support to other Nordic languages
3. **Translation Management**: Set up a translation management platform
4. **Automated Testing**: Add i18n coverage to your test suite
5. **Performance Monitoring**: Track translation loading times

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [date-fns Documentation](https://date-fns.org/)
- [Intl API Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)