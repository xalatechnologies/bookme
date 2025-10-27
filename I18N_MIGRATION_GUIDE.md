# i18n Migration Guide - Removing Hardcoded Norwegian Text

**Date**: October 27, 2025
**Status**: 📋 **IN PROGRESS**
**Scope**: 113 files with hardcoded Norwegian text

---

## Overview

The codebase currently has **113 files** containing hardcoded Norwegian text. This guide provides a systematic approach to migrating all components to use i18n translations.

---

## Translation Files Available

### ✅ Already Created
1. `public/locales/no/roles.json` - Role translations
2. `public/locales/en/roles.json`
3. `public/locales/no/common.json` - Common UI elements (100+ keys)
4. `public/locales/en/common.json`
5. `public/locales/no/navigation.json` - Navigation labels
6. `public/locales/en/navigation.json`

### 🔄 Need to Create
Based on the codebase structure, we need additional namespaces:

1. **facilities.json** - Facility-related translations
2. **bookings.json** - Booking-related translations
3. **auth.json** - Authentication/login translations
4. **admin.json** - Admin panel specific translations
5. **user.json** - User dashboard translations
6. **errors.json** - Error messages
7. **validation.json** - Form validation messages
8. **calendar.json** - Calendar component translations
9. **search.json** - Search-related translations
10. **messaging.json** - Messaging/support translations

---

## Migration Steps

### Step 1: Identify Norwegian Text Patterns

Common Norwegian words to search for:
```
Lagre, Avbryt, Slett, Rediger, Opprett, Søk, Filtrer
Lukk, Tilbake, Neste, Forrige, Bekreft, Logg ut
Laster, Velkommen, Innstillinger, Profil, Hjem
Bokinger, Fasiliteter, Brukere, Rapporter
```

### Step 2: Component Migration Pattern

For each component:

#### Before (Hardcoded):
```typescript
export const MyComponent = (): JSX.Element => {
  return (
    <div>
      <h1>Velkommen</h1>
      <button>Lagre</button>
      <p>Laster...</p>
    </div>
  );
};
```

#### After (i18n):
```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent = (): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('actions.save')}</button>
      <p>{t('actions.loading')}</p>
    </div>
  );
};
```

### Step 3: Use Appropriate Namespace

```typescript
// For navigation elements
const { t } = useTranslation('navigation');

// For common actions/status
const { t } = useTranslation('common');

// For role labels
const { t } = useTranslation('roles');

// For facility-specific text
const { t } = useTranslation('facilities');

// For multiple namespaces
const { t } = useTranslation(['common', 'navigation']);
```

---

## Priority Migration List

### 🔴 High Priority (User-Facing Components)

1. **Authentication Pages**
   - `src/pages/LoginSelection.tsx`
   - `src/pages/Login.tsx`
   - Create `auth.json` translations

2. **Main Navigation**
   - `src/components/GlobalHeader.tsx` ✅ (uses LanguageToggle)
   - `src/components/admin/layout/AdminHeader.tsx` ✅ (partially done)
   - `src/components/admin/layout/AdminSidebar.tsx`
   - `src/components/user/layout/UserSidebar.tsx`

3. **User Dashboard**
   - `src/pages/user/UserDashboard.tsx`
   - `src/pages/user/UserProfile.tsx`
   - `src/pages/user/UserSettings.tsx`

4. **Booking Flow**
   - `src/components/booking/StepByStepBooking.tsx`
   - `src/pages/Checkout.tsx`
   - `src/pages/user/Bookings.tsx`

### 🟡 Medium Priority (Admin Panel)

5. **Admin Dashboard**
   - `src/pages/admin/Overview.tsx`
   - `src/pages/admin/BookingsPage.tsx`
   - `src/pages/admin/FacilitiesPage.tsx`
   - `src/pages/admin/UsersRolesPage.tsx`

6. **Admin Components**
   - `src/components/admin/facilities/FacilityEditForm.tsx`
   - `src/components/admin/dashboard/TodaysBookings.tsx`

### 🟢 Low Priority (Internal/Advanced Features)

7. **Support/Messaging**
   - `src/components/support/SupportTicketForm.tsx`
   - `src/components/messaging/MessageInbox.tsx`

8. **Calendar Components**
   - `src/components/calendar/EnhancedCalendar.tsx`
   - `src/components/calendar/FacilityCalendar.tsx`

9. **Advanced Features**
   - `src/components/group/GroupBookingFlow.tsx`
   - `src/pages/admin/AuditLogPage.tsx`

---

## Translation Key Naming Convention

### Actions
```json
{
  "actions": {
    "save": "Lagre",
    "cancel": "Avbryt",
    "delete": "Slett",
    "edit": "Rediger",
    "create": "Opprett"
  }
}
```

### Status
```json
{
  "status": {
    "loading": "Laster...",
    "success": "Vellykket",
    "error": "Feil",
    "pending": "Ventende"
  }
}
```

### Entity Names
```json
{
  "entities": {
    "facility": "Fasilitet",
    "facilities": "Fasiliteter",
    "booking": "Booking",
    "bookings": "Bookinger",
    "user": "Bruker",
    "users": "Brukere"
  }
}
```

### Messages
```json
{
  "messages": {
    "success": {
      "saved": "Lagret!",
      "deleted": "Slettet!",
      "updated": "Oppdatert!"
    },
    "error": {
      "generic": "Noe gikk galt",
      "not_found": "Ikke funnet",
      "network": "Nettverksfeil"
    }
  }
}
```

---

## Example Migrations

### Example 1: Admin Sidebar

#### Before:
```typescript
<nav>
  <a href="/admin">Dashbord</a>
  <a href="/admin/bookings">Bookinger</a>
  <a href="/admin/facilities">Fasiliteter</a>
  <a href="/admin/users">Brukere</a>
  <a href="/admin/reports">Rapporter</a>
  <a href="/admin/settings">Innstillinger</a>
</nav>
```

#### After:
```typescript
import { useTranslation } from 'react-i18next';

const AdminSidebar = (): JSX.Element => {
  const { t } = useTranslation('navigation');

  return (
    <nav>
      <a href="/admin">{t('dashboard')}</a>
      <a href="/admin/bookings">{t('bookings')}</a>
      <a href="/admin/facilities">{t('facilities')}</a>
      <a href="/admin/users">{t('users')}</a>
      <a href="/admin/reports">{t('reports')}</a>
      <a href="/admin/settings">{t('settings')}</a>
    </nav>
  );
};
```

### Example 2: Booking Card

#### Before:
```typescript
<div className="booking-card">
  <h3>{facility.name}</h3>
  <p>Dato: {booking.date}</p>
  <p>Tid: {booking.time}</p>
  <p>Status: {booking.status}</p>
  <button>Avbryt booking</button>
</div>
```

#### After:
```typescript
import { useTranslation } from 'react-i18next';

const BookingCard = ({ booking, facility }): JSX.Element => {
  const { t } = useTranslation(['bookings', 'common']);

  return (
    <div className="booking-card">
      <h3>{facility.name}</h3>
      <p>{t('bookings:fields.date')}: {booking.date}</p>
      <p>{t('bookings:fields.time')}: {booking.time}</p>
      <p>{t('bookings:fields.status')}: {t(`common:status.${booking.status}`)}</p>
      <button>{t('bookings:actions.cancel_booking')}</button>
    </div>
  );
};
```

### Example 3: Form with Validation

#### Before:
```typescript
<form>
  <label>Navn</label>
  <input type="text" required />
  {error && <span>Navn er påkrevd</span>}

  <label>E-post</label>
  <input type="email" required />
  {emailError && <span>Ugyldig e-postadresse</span>}

  <button type="submit">Lagre</button>
  <button type="button">Avbryt</button>
</form>
```

#### After:
```typescript
import { useTranslation } from 'react-i18next';

const UserForm = (): JSX.Element => {
  const { t } = useTranslation(['common', 'validation']);

  return (
    <form>
      <label>{t('common:common.name')}</label>
      <input type="text" required />
      {error && <span>{t('validation:required.name')}</span>}

      <label>{t('common:common.email')}</label>
      <input type="email" required />
      {emailError && <span>{t('validation:invalid.email')}</span>}

      <button type="submit">{t('common:actions.save')}</button>
      <button type="button">{t('common:actions.cancel')}</button>
    </form>
  );
};
```

---

## Automated Migration Script

For bulk updates, you can use this script:

```bash
#!/bin/bash
# migrate-hardcoded-text.sh

# Find all .tsx files with common Norwegian words
grep -r -l "Lagre\|Avbryt\|Slett" src/ --include="*.tsx" > files-to-migrate.txt

echo "Found $(wc -l < files-to-migrate.txt) files to migrate"
echo "Files saved to: files-to-migrate.txt"
```

---

## Component-by-Component Checklist

### ✅ Completed
- [x] `src/components/admin/layout/AdminHeader.tsx` (skip to content)
- [x] `src/components/admin/header/ProfileDropdown.tsx` (logout messages)

### 🔄 In Progress
- [ ] `src/components/admin/layout/AdminSidebar.tsx`
- [ ] `src/components/user/layout/UserSidebar.tsx`

### 📋 To Do (113 files total)

See the full list in the grep output above. Key files:

#### Authentication (5 files)
- [ ] `src/pages/LoginSelection.tsx`
- [ ] `src/pages/Login.tsx`
- [ ] `src/contexts/AuthContext.tsx`
- [ ] `src/components/auth/ProtectedRoute.tsx`
- [ ] `src/services/supabase/auth.service.ts`

#### User Pages (15 files)
- [ ] `src/pages/user/UserDashboard.tsx`
- [ ] `src/pages/user/UserProfile.tsx`
- [ ] `src/pages/user/UserSettings.tsx`
- [ ] `src/pages/user/Bookings.tsx`
- [ ] `src/pages/user/UserFacilities.tsx`
- [ ] `src/pages/user/UserFavorites.tsx`
- [ ] `src/pages/user/UserNotifications.tsx`
- [ ] `src/pages/user/UserHelp.tsx`
- [ ] `src/pages/user/UserReceipts.tsx`
- [ ] `src/pages/user/HistoryPage.tsx`
- [ ] `src/pages/user/CalendarPage.tsx`
- [ ] And more...

#### Admin Pages (12 files)
- [ ] `src/pages/admin/Overview.tsx`
- [ ] `src/pages/admin/BookingsPage.tsx`
- [ ] `src/pages/admin/FacilitiesPage.tsx`
- [ ] `src/pages/admin/FacilityEditPage.tsx`
- [ ] `src/pages/admin/UsersRolesPage.tsx`
- [ ] `src/pages/admin/ReportsPage.tsx`
- [ ] `src/pages/admin/SettingsPage.tsx`
- [ ] `src/pages/admin/NotificationsPage.tsx`
- [ ] `src/pages/admin/ApprovalsPage.tsx`
- [ ] `src/pages/admin/AuditLogPage.tsx`
- [ ] `src/pages/admin/IntegrationsPage.tsx`
- [ ] `src/pages/admin/DeletionPlanPage.tsx`

#### Components (80+ files)
- Booking components
- Calendar components
- Facility components
- Search components
- User layout components
- Admin layout components
- Support/messaging components
- And more...

---

## Testing Strategy

After migrating each component:

1. **Visual Test**
   - Switch language to NO (Norwegian)
   - Verify all text displays correctly
   - Switch to EN (English)
   - Verify translations

2. **Functionality Test**
   - Ensure buttons/actions still work
   - Form submissions work
   - Navigation works

3. **Console Check**
   - No missing translation warnings
   - No console errors

---

## Common Pitfalls

### ❌ Don't Do This:
```typescript
// Mixing languages
<button>Lagre {data.name}</button>

// Hardcoded in attributes
<input placeholder="Søk..." />

// Concatenating translations
{t('hello') + ' ' + userName}
```

### ✅ Do This Instead:
```typescript
// Use translation
<button>{t('actions.save')} {data.name}</button>

// Translate attributes
<input placeholder={t('search.placeholder')} />

// Use interpolation
{t('greetings.hello_user', { name: userName })}
```

---

## Next Steps

1. **Create Missing Translation Files**
   - facilities.json
   - bookings.json
   - auth.json
   - admin.json
   - user.json
   - errors.json
   - validation.json

2. **Migrate High Priority Components**
   - Start with authentication pages
   - Then navigation components
   - Then user dashboard

3. **Set Up CI/CD Check**
   - Add lint rule to catch hardcoded Norwegian
   - Add translation coverage report

4. **Documentation**
   - Update component documentation
   - Add i18n examples to style guide

---

## Estimated Effort

Based on 113 files:

- **High Priority (20 files)**: 8-10 hours
- **Medium Priority (40 files)**: 15-20 hours
- **Low Priority (53 files)**: 20-25 hours

**Total**: 43-55 hours (5-7 working days)

**Recommended Approach**:
- Migrate in phases
- Start with user-facing components
- Test thoroughly after each phase

---

## Progress Tracking

Create a spreadsheet or project board to track:
- File name
- Status (Not Started | In Progress | Review | Complete)
- Assignee
- Priority
- Notes

---

**Document Version**: 1.0
**Last Updated**: October 27, 2025
**Author**: BookMe Development Team
