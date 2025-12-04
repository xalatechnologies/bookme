# Translation Quick Reference Guide

A developer-friendly guide for working with translations in Booknor.

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('namespace');

  return <h1>{t('key.path')}</h1>;
};
```

### With Multiple Namespaces

```typescript
const MyComponent = () => {
  const { t } = useTranslation(['user', 'common']);

  return (
    <>
      <h1>{t('user:dashboard.title')}</h1>
      <button>{t('common:actions.save')}</button>
    </>
  );
};
```

---

## 📁 Available Namespaces

| Namespace | Use For | Coverage Status |
|-----------|---------|-----------------|
| `admin` | Admin panel features | ✅ 100% |
| `auth` | Login, registration, authentication | ✅ Complete |
| `booking` | Booking process, calendar | ⚠️ Partial |
| `bookings` | Booking management, history | ⚠️ Partial |
| `calendar` | Calendar views, date selection | ⚠️ Partial |
| `common` | Shared UI elements, actions | ❌ 8.7% (CRITICAL) |
| `errors` | Error messages | ⚠️ Partial |
| `facilities` | Facility listings, search | ⚠️ Partial |
| `facility` | Individual facility details | ⚠️ 33% EN, 81% NO |
| `forms` | Form fields, validation | ⚠️ Partial |
| `group` | Group management | ⚠️ Partial |
| `groups` | Groups listing | ⚠️ Partial |
| `navigation` | Menu items, breadcrumbs | ✅ Complete |
| `rbac` | Role-based access control | ⚠️ Partial |
| `roles` | User roles and permissions | ⚠️ Partial |
| `support` | Support tickets, help | ❌ 0% EN, 43% NO |
| `user` | User dashboard, profile | ⚠️ 43% |
| `validation` | Form validation messages | ⚠️ Partial |

---

## ✅ Best Practices

### DO ✅

```typescript
// Use proper translation keys
t('common:actions.save')
t('user:dashboard.greeting', { name: userName })
t('facility:card.capacity', { count: 10 })

// Use namespaces explicitly
const { t } = useTranslation('facility');
t('facility:actions.book')

// Use interpolation for dynamic content
t('common:messages.deleteSuccess', { item: facilityName })

// Check if key exists in translations before using
const key = 'common:actions.save';
// Key should be defined in /public/locales/en/common.json
```

### DON'T ❌

```typescript
// ❌ Never hardcode Norwegian text
t('Bruker oppdatert!')

// ❌ Don't use UI text as namespace
t('Skriv inn ny rolle:key')

// ❌ Don't use generic/unclear keys
t('message')
t('text1')
t('label')

// ❌ Don't skip namespace (unless in common)
t('save') // Where is this defined?

// ❌ Don't create keys without adding to translation files
t('common:new.feature.key') // Must exist in common.json first!
```

---

## 🎯 Common Patterns

### Actions/Buttons

**Namespace:** `common`

```typescript
// Standard actions
t('common:actions.save')
t('common:actions.cancel')
t('common:actions.delete')
t('common:actions.edit')
t('common:actions.view')
t('common:actions.add')
t('common:actions.remove')
t('common:actions.submit')
t('common:actions.confirm')

// Booking-specific actions
t('common:actions.book')
t('common:actions.bookNow')
t('common:actions.reserve')
```

### Status Messages

**Namespace:** `common`

```typescript
// Status types
t('common:status.active')
t('common:status.pending')
t('common:status.confirmed')
t('common:status.cancelled')
t('common:status.completed')

// Success messages
t('common:messages.saveSuccess', { item: 'Facility' })
t('common:messages.deleteSuccess', { item: 'Booking' })
t('common:messages.updateSuccess', { item: 'User' })

// Error messages
t('common:messages.saveFailed', { item: 'Facility' })
t('common:messages.loadingFailed', { item: 'Data' })
t('common:messages.networkError')
```

### Navigation

**Namespace:** `navigation`

```typescript
// Admin navigation
t('navigation:admin.overview')
t('navigation:admin.facilities')
t('navigation:admin.bookings')
t('navigation:admin.users')

// User navigation
t('navigation:user.dashboard')
t('navigation:user.bookings')
t('navigation:user.profile')
t('navigation:user.settings')
```

### Form Fields

**Namespace:** `common` or specific namespace

```typescript
// Basic fields
t('common:common.name')
t('common:common.email')
t('common:common.phone')
t('common:common.address')
t('common:common.description')

// Facility-specific fields
t('facility:fields.capacity')
t('facility:fields.pricePerHour')
t('facility:fields.amenities')
t('facility:fields.equipment')
```

### Date/Time

**Namespace:** `common`

```typescript
// Time periods
t('common:time.today')
t('common:time.yesterday')
t('common:time.tomorrow')
t('common:time.thisWeek')
t('common:time.thisMonth')

// Durations
t('common:time.hour')
t('common:time.hours')
t('common:time.day')
t('common:time.days')

// Weekdays
t('common:time.weekdays.monday')
t('common:time.weekdays.tuesday')
// ... etc
```

---

## 🔧 Adding New Translations

### Step 1: Choose the Right Namespace

- **UI elements, buttons, common actions** → `common`
- **Admin-specific features** → `admin`
- **User dashboard/profile** → `user`
- **Facility-related** → `facility` or `facilities`
- **Booking process** → `booking` or `bookings`

### Step 2: Create Proper Key Structure

Use dot notation for hierarchical organization:

```typescript
// Good structure
namespace:category.subcategory.key

// Examples
common:actions.save
user:dashboard.greeting
facility:card.capacity
admin:dashboard.kpi.total_facilities
```

### Step 3: Add to Translation Files

1. **English**: `/public/locales/en/{namespace}.json`
2. **Norwegian**: `/public/locales/no/{namespace}.json`

```json
// en/common.json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "messages": {
    "saveSuccess": "{{item}} was saved successfully"
  }
}
```

```json
// no/common.json
{
  "actions": {
    "save": "Lagre",
    "cancel": "Avbryt"
  },
  "messages": {
    "saveSuccess": "{{item}} ble lagret"
  }
}
```

### Step 4: Use in Code

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');

  const handleSave = () => {
    // ... save logic
    alert(t('messages.saveSuccess', { item: 'Facility' }));
  };

  return (
    <button onClick={handleSave}>
      {t('actions.save')}
    </button>
  );
};
```

---

## 🧪 Testing Translations

### Check If Key Exists

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Check if key exists
const keyExists = i18n.exists('common:actions.save');

// Get current language
const currentLang = i18n.language; // 'en' or 'no'

// Change language
i18n.changeLanguage('no');
```

### Validate Before Commit

Run the analysis tool:

```bash
python3 analyze_translations.py
```

This will show:
- Missing translation keys
- Coverage percentage
- Hardcoded strings

---

## 📊 Current Translation Status

**Last Updated:** October 27, 2025

| Language | Coverage | Status |
|----------|----------|--------|
| English | 15.7% | 🔴 Critical - 596 keys missing |
| Norwegian | 21.1% | 🔴 Critical - 558 keys missing |

### Priority Issues

1. **481 keys missing** in `common` namespace (both languages)
2. **65 keys missing** in `support` namespace (EN has no file)
3. **35 keys missing** in `user` namespace (both languages)
4. **150+ hardcoded Norwegian strings** need proper keys

---

## 🆘 Troubleshooting

### "Translation key not found" Warning

```typescript
// Problem: Key doesn't exist in translation files
t('common:actions.unknown')

// Solution: Add to /public/locales/en/common.json and no/common.json
{
  "actions": {
    "unknown": "Unknown Action"
  }
}
```

### Hardcoded Text Shows Instead of Translation

```typescript
// Problem: Using hardcoded text as key
t('Lagre endringer!')

// Solution: Create proper key
t('common:actions.saveChanges')

// And add to translation files:
// en/common.json: "saveChanges": "Save Changes"
// no/common.json: "saveChanges": "Lagre endringer"
```

### Wrong Language Shows

```typescript
// Check current language
const { i18n } = useTranslation();
console.log(i18n.language); // Should be 'en' or 'no'

// Force language change
i18n.changeLanguage('en');
```

---

## 📚 Resources

- **Full Glossary**: `TRANSLATION_GLOSSARY.md` - Complete list of all keys
- **Missing Keys**: `MISSING_TRANSLATIONS.json` - Keys that need translation
- **Analysis Summary**: `TRANSLATION_ANALYSIS_SUMMARY.md` - Detailed report
- **Analysis Tool**: `analyze_translations.py` - Run to check coverage

---

## 🎓 Examples from Codebase

### Good Examples ✅

```typescript
// From pages/admin/Overview.tsx
const { t } = useTranslation(['admin', 'common']);

// Using with interpolation
title: t('admin:dashboard.kpi.total_facilities')
description: t('admin:dashboard.kpi.active_facilities')

// Using with variables
message: t('admin:dashboard.alerts.facilities_waiting', { count: draftFacilities })
```

```typescript
// From pages/user/UserSettings.tsx
const { t } = useTranslation(['user', 'common']);

{t('user:settings.title')}
{t('user:settings.notifications.email')}
{t('user:settings.notifications.email_desc')}
```

### Bad Examples ❌

```typescript
// ❌ From hooks/useNotifications.ts
alert(t('Alle notifikasjoner markert som lest!'));

// Should be:
alert(t('common:notifications.all_marked_read'));
```

```typescript
// ❌ From pages/admin/UsersRolesPage.tsx
alert(t('Bruker oppdatert!'));

// Should be:
alert(t('common:messages.user_updated'));
```

---

## 🔄 Migration Guide

### Replacing Hardcoded Norwegian Strings

1. **Identify** hardcoded strings:
   ```bash
   grep -r "t(['\"][^:]*['\"])" src/ --include="*.tsx"
   ```

2. **Create** proper translation key in `/public/locales/`

3. **Replace** in code:
   ```typescript
   // Before
   t('Fasilitet oppdatert!')

   // After
   t('common:messages.facility_updated')
   ```

4. **Verify** both EN and NO translations exist

---

**Need Help?** Check the full documentation or run `python3 analyze_translations.py` for current status.

*Last Updated: October 27, 2025*
