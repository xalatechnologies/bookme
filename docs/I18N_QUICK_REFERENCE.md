# i18n Quick Reference Guide

**For Booknor Developers** - Quick guide to using translations in the codebase

---

## TL;DR

```typescript
// 1. Import
import { useTranslation } from 'react-i18next';

// 2. Use in component
const { t } = useTranslation('common');

// 3. Translate text
<button>{t('actions.save')}</button>
```

---

## Import Pattern

✅ **CORRECT**:
```typescript
import { useTranslation } from 'react-i18next';
```

❌ **WRONG** (old system - removed):
```typescript
import { useTranslation } from '@/i18n';  // DON'T USE THIS
```

---

## Available Namespaces

| Namespace | Use For | Examples |
|-----------|---------|----------|
| `common` | General UI, actions, status | save, cancel, loading, active |
| `navigation` | Menu items, links | dashboard, profile, settings |
| `auth` | Login, logout, authentication | login, password, email |
| `roles` | User roles | admin, user, staff, owner |
| `facilities` | Facility-related text | capacity, price, amenities |
| `bookings` | Booking-related text | booking, reservation, payment |
| `admin` | Admin panel specific | dashboard KPIs, reports |
| `user` | User dashboard specific | my_bookings, favorites |

---

## Common Usage Patterns

### 1. Single Namespace (Most Common)
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <button>{t('actions.save')}</button>
      <button>{t('actions.cancel')}</button>
    </div>
  );
};
```

### 2. Multiple Namespaces
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['common', 'facilities']);

  return (
    <div>
      <h1>{t('details.capacity', { ns: 'facilities' })}</h1>
      <button>{t('actions.book_now', { ns: 'common' })}</button>
    </div>
  );
};
```

### 3. With Fallback (Development Safety)
```typescript
const { t } = useTranslation('auth');

// Provide fallback text for missing keys
<h1>{t('login.title', 'Login')}</h1>
```

### 4. With Variables (Interpolation)
```typescript
const { t } = useTranslation('user');

// Use {{variable}} in translation file
// "greeting": "Hei, {{name}}!"
<h1>{t('dashboard.greeting', { name: user.firstName })}</h1>
```

---

## Translation File Structure

Translation files are in: `public/locales/{language}/{namespace}.json`

Example: `public/locales/no/common.json`
```json
{
  "actions": {
    "save": "Lagre",
    "cancel": "Avbryt",
    "delete": "Slett"
  },
  "status": {
    "active": "Aktiv",
    "pending": "Ventende"
  }
}
```

**Usage**: `t('actions.save')` → "Lagre" (Norwegian) or "Save" (English)

---

## Adding New Translations

### Step 1: Add to Both Language Files

**Norwegian** (`public/locales/no/{namespace}.json`):
```json
{
  "actions": {
    "print": "Skriv ut"
  }
}
```

**English** (`public/locales/en/{namespace}.json`):
```json
{
  "actions": {
    "print": "Print"
  }
}
```

### Step 2: Use in Component
```typescript
const { t } = useTranslation('common');
<button>{t('actions.print')}</button>
```

### Step 3: Test Both Languages
1. Run dev server: `npm run dev`
2. Toggle language in header (NO ↔ EN)
3. Verify text updates correctly

---

## Quick Translation Key Reference

### Common Actions (`common:actions`)
- `save` - Lagre / Save
- `cancel` - Avbryt / Cancel
- `delete` - Slett / Delete
- `edit` - Rediger / Edit
- `create` - Opprett / Create
- `search` - Søk / Search
- `login` - Logg inn / Login
- `logout` - Logg ut / Logout
- `share` - Del / Share
- `like` - Lik / Like

### Common Status (`common:status`)
- `active` - Aktiv / Active
- `pending` - Ventende / Pending
- `approved` - Godkjent / Approved
- `rejected` - Avvist / Rejected
- `completed` - Fullført / Completed

### Navigation (`navigation`)
- `dashboard` - Dashboard / Dashboard
- `profile` - Profil / Profile
- `settings` - Innstillinger / Settings
- `bookings` - Bookinger / Bookings
- `facilities` - Fasiliteter / Facilities

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Hardcoding Text
```typescript
// DON'T DO THIS
<button>Lagre</button>
```

✅ **Fix**:
```typescript
const { t } = useTranslation('common');
<button>{t('actions.save')}</button>
```

### ❌ Mistake 2: Wrong Import
```typescript
// DON'T DO THIS
import { useTranslation } from '@/i18n';  // Old system removed
```

✅ **Fix**:
```typescript
import { useTranslation } from 'react-i18next';
```

### ❌ Mistake 3: Missing Namespace
```typescript
// DON'T DO THIS
const { t } = useTranslation();  // No namespace specified
```

✅ **Fix**:
```typescript
const { t } = useTranslation('common');  // Always specify namespace
```

### ❌ Mistake 4: Wrong Key Path
```typescript
// DON'T DO THIS
t('common:actions.save')  // Don't use colon when namespace is specified
```

✅ **Fix**:
```typescript
const { t } = useTranslation('common');
t('actions.save')  // Correct - namespace already specified
```

---

## Language Toggle

The language toggle is in the header and automatically syncs with i18n:

```typescript
// Already implemented - don't need to do anything
// Just click the language toggle button in header
```

Check current language:
```typescript
import { getCurrentLanguage } from '@/i18n';

const currentLang = getCurrentLanguage(); // 'no' or 'en'
```

Change language programmatically:
```typescript
import { changeLanguage } from '@/i18n';

await changeLanguage('en'); // Switch to English
```

---

## Debugging

### Check Translation Loading
Open browser console (F12):
```javascript
// Should see:
i18next: initialized
i18next: languageChanged no

// Should NOT see:
i18next::translator: missingKey no common actions.login
```

### Check Current Language
```javascript
localStorage.getItem('i18nextLng')  // Returns 'no' or 'en'
```

### Force Reload Translations
```javascript
window.location.reload();  // Reload page
```

---

## Need More Translation Keys?

1. Check existing translations: `public/locales/{lang}/{namespace}.json`
2. Add your key to BOTH language files (NO and EN)
3. Use in component with `t('your.key')`
4. Test language switching

If a namespace doesn't exist, check:
- [I18N Consolidation Guide](./I18N_CONSOLIDATION_COMPLETE.md)
- [I18N Implementation Guide](./I18N_IMPLEMENTATION_COMPLETE.md)

---

## Examples from Codebase

### Login Button
```typescript
// ProfileMenu.tsx
import { useTranslation } from 'react-i18next';

const ProfileMenu = () => {
  const { t } = useTranslation('common');

  return <button>{t('actions.login')}</button>;
  // Shows: "Logg inn" (NO) or "Login" (EN)
};
```

### View Mode Toggle
```typescript
// ViewModeToggle.tsx
import { useTranslation } from 'react-i18next';

const ViewModeToggle = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <button>{t('view_modes.grid')}</button>
      <button>{t('view_modes.list')}</button>
      <button>{t('view_modes.map')}</button>
    </div>
  );
  // Shows: "Rutenett visning", "Liste visning", "Kart" (NO)
  // Or: "Grid view", "List view", "Map" (EN)
};
```

### Admin Sidebar
```typescript
// AdminSidebar.tsx
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
  const { t } = useTranslation('navigation');

  return (
    <nav>
      <a>{t('dashboard')}</a>
      <a>{t('bookings')}</a>
      <a>{t('facilities')}</a>
    </nav>
  );
};
```

---

## Summary

**Remember these 3 steps:**

1. **Import**: `import { useTranslation } from 'react-i18next';`
2. **Hook**: `const { t } = useTranslation('namespace');`
3. **Use**: `{t('key.path')}`

**That's it!** 🎉

---

**Last Updated**: October 27, 2025
**Version**: 1.0
