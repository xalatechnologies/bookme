# i18n System Fix - Translation Keys Not Displaying

**Date**: October 27, 2025
**Issue**: Login page showing translation keys instead of translated values
**Status**: ✅ **RESOLVED**

---

## Problem Summary

The login page at `http://localhost:3006/login?type=admin` was displaying translation keys (e.g., `auth:login.admin.title`) instead of actual translated text.

---

## Root Cause

The application has **TWO different i18n systems running in parallel**:

### 1. Old System (Legacy)
- **Location**: `src/i18n/hooks/useTranslation.ts`
- **Translation Files**: `src/i18n/translations/*.ts`
  - `common.ts`
  - `facility.ts`
  - `booking.ts`
- **Import**: `import { useTranslation } from "@/i18n"`
- **Namespaces**: Limited to 3 namespaces only

### 2. New System (react-i18next)
- **Location**: `src/i18n/config.ts`
- **Translation Files**: `public/locales/{lng}/*.json`
  - `roles.json`
  - `common.json`
  - `navigation.json`
  - `facilities.json`
  - `bookings.json`
  - `admin.json`
  - `user.json`
  - `auth.json` ← **New namespace**
- **Import**: `import { useTranslation } from "react-i18next"`
- **Namespaces**: 8 comprehensive namespaces

### The Problem

**Login.tsx** and **LoginSelection.tsx** were importing from the **old system** (`@/i18n`) but trying to use the **auth** namespace which only exists in the **new system**. This caused the translation function to return the keys as fallback values.

---

## Solution

Updated both authentication pages to use the new react-i18next system:

### Files Fixed

#### 1. `src/pages/Login.tsx`

**Before**:
```typescript
import { useTranslation } from "@/i18n";

export const Login = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <h1>{t('auth:login.admin.title', 'Administrator Innlogging')}</h1>
  );
};
```

**After**:
```typescript
import { useTranslation } from "react-i18next";

export const Login = (): JSX.Element => {
  const { t } = useTranslation('auth');

  return (
    <h1>{t('login.admin.title', 'Administrator Innlogging')}</h1>
  );
};
```

**Changes**:
1. Import from `react-i18next` instead of `@/i18n`
2. Specify namespace in `useTranslation('auth')`
3. Remove `auth:` prefix from all translation keys

#### 2. `src/pages/LoginSelection.tsx`

**Before**:
```typescript
import { useTranslation } from "@/i18n";

export const LoginSelection = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <h1>{t('auth:loginSelection.title', 'Velkommen til BookMe Portal')}</h1>
  );
};
```

**After**:
```typescript
import { useTranslation } from "react-i18next";

export const LoginSelection = (): JSX.Element => {
  const { t } = useTranslation('auth');

  return (
    <h1>{t('loginSelection.title', 'Velkommen til BookMe Portal')}</h1>
  );
};
```

**Changes**:
1. Import from `react-i18next` instead of `@/i18n`
2. Specify namespace in `useTranslation('auth')`
3. Remove `auth:` prefix from all translation keys

---

## Files Still Using Old System

The following **7 files** still use the old i18n system (`@/i18n`). These are working fine because they use namespaces that exist in the old system (common, facility, booking):

1. `/src/pages/facilities/[id]/book.tsx`
2. `/src/pages/facilities/[id].tsx`
3. `/src/components/search/ViewModeToggle.tsx`
4. `/src/components/header/ProfileMenu.tsx`
5. `/src/components/facility/detail/FacilityDetailStates.tsx`
6. `/src/components/facility/detail/FacilityContactInfo.tsx`
7. `/src/components/facility/FacilityHeader.tsx`

### Migration Recommendation

These 7 files should eventually be migrated to use react-i18next for consistency. However, this is **not urgent** as they are functioning correctly with the old system.

**Migration pattern**:
```typescript
// Change this:
import { useTranslation } from "@/i18n";
const { t } = useTranslation();

// To this:
import { useTranslation } from "react-i18next";
const { t } = useTranslation('common'); // or 'facilities', 'bookings'
```

---

## Translation Namespace Reference

### New System (react-i18next) Namespaces

| Namespace | File Location | Purpose |
|-----------|--------------|---------|
| `roles` | `public/locales/{lng}/roles.json` | User role translations |
| `common` | `public/locales/{lng}/common.json` | Common UI elements (100+ keys) |
| `navigation` | `public/locales/{lng}/navigation.json` | Navigation labels |
| `facilities` | `public/locales/{lng}/facilities.json` | Facility-specific translations |
| `bookings` | `public/locales/{lng}/bookings.json` | Booking-specific translations |
| `admin` | `public/locales/{lng}/admin.json` | Admin panel translations |
| `user` | `public/locales/{lng}/user.json` | User dashboard translations |
| `auth` | `public/locales/{lng}/auth.json` | Authentication translations |

### Old System Namespaces (Legacy)

| Namespace | File Location | Status |
|-----------|--------------|--------|
| `common` | `src/i18n/translations/common.ts` | ⚠️ Legacy - will be deprecated |
| `facility` | `src/i18n/translations/facility.ts` | ⚠️ Legacy - will be deprecated |
| `booking` | `src/i18n/translations/booking.ts` | ⚠️ Legacy - will be deprecated |

---

## How to Use Translations (Best Practice)

### 1. Single Namespace

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = (): JSX.Element => {
  const { t } = useTranslation('auth');

  return <h1>{t('login.admin.title')}</h1>;
};
```

### 2. Multiple Namespaces

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = (): JSX.Element => {
  const { t } = useTranslation(['auth', 'common']);

  return (
    <div>
      <h1>{t('auth:login.admin.title')}</h1>
      <button>{t('common:actions.save')}</button>
    </div>
  );
};
```

### 3. With Fallback

```typescript
const { t } = useTranslation('auth');

// Provide fallback text for missing keys
return <h1>{t('login.admin.title', 'Administrator Login')}</h1>;
```

---

## Verification Steps

To verify the fix is working:

1. **Start dev server**: Server should be running at `http://localhost:3006`
2. **Navigate to login selection**: `http://localhost:3006/login-selection`
   - Should see: "Velkommen til BookMe Portal" (NO) or "Welcome to BookMe Portal" (EN)
3. **Navigate to admin login**: `http://localhost:3006/login?type=admin`
   - Should see: "Administrator Innlogging" (NO) or "Administrator Login" (EN)
4. **Toggle language**: Use language switcher in header
   - All text should update to selected language
5. **Check browser console**: No missing translation warnings

---

## Testing Language Switching

1. **Default Language**: Norwegian (Bokmål) - `no`
2. **Fallback Language**: English - `en`

### Test Procedure

```bash
# 1. Open browser DevTools console
# 2. Navigate to login page
# 3. Check localStorage for language preference:
localStorage.getItem('i18nextLng')  # Should return 'no' or 'en'

# 4. Toggle language using header button
# 5. Verify all text updates correctly
# 6. Refresh page - language should persist
```

---

## Future Work

### Phase 1: Complete Migration (Recommended)
Migrate remaining 7 files from old i18n system to react-i18next

**Priority**: Medium
**Effort**: 2-3 hours
**Impact**: Full consistency across codebase

### Phase 2: Deprecate Old System
Once all files are migrated, remove old i18n system:
- Delete `src/i18n/hooks/useTranslation.ts`
- Delete `src/i18n/translations/*.ts`
- Update `src/i18n/index.ts` to only export react-i18next

**Priority**: Low
**Effort**: 1 hour
**Impact**: Cleaner codebase, reduced confusion

### Phase 3: Add Translation Coverage Tests
Add tests to ensure all components use translations properly

**Priority**: Medium
**Effort**: 4-5 hours
**Impact**: Prevent regression

---

## Key Learnings

1. **Always check which i18n system is being used** when adding translations
2. **Import from `react-i18next`** for new components, not `@/i18n`
3. **Specify namespace** in `useTranslation()` call for clarity
4. **Remove namespace prefix** from keys when namespace is specified
5. **Check translation files exist** in `public/locales/{lng}/` before use

---

## Related Documentation

- [i18n Implementation Complete](./I18N_IMPLEMENTATION_COMPLETE.md) - Full i18n setup
- [i18n Migration Guide](./I18N_MIGRATION_GUIDE.md) - Migration patterns
- [react-i18next Documentation](https://react.i18next.com/)

---

**Document Version**: 1.0
**Last Updated**: October 27, 2025
**Author**: BookMe Development Team
