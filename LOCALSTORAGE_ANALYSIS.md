# localStorage Usage Analysis

This document analyzes all localStorage usage in the project and categorizes what should be migrated to the database.

## Summary

Found **30+ localStorage usage locations** across the codebase. They fall into these categories:

### ✅ Already Migrated / OK to Keep

1. **Theme Preferences** (`ThemeToggle.tsx`)
   - ✅ OK - UI preference, doesn't need database
   
2. **Language Preferences** (`LanguageContext.tsx`)
   - ⚠️ **SHOULD MIGRATE** - User preference should be in database (user_profiles table)
   
3. **Migration Config** (`migrationConfig.ts`)
   - ✅ OK - Technical migration phase tracking

---

## ❌ MUST MIGRATE to Database

### 1. **Facility Data** (CRITICAL)
**Files:**
- `AdminFacilityCard.tsx` (lines 128, 132, 168, 172, 199, 203)
- `AdminFacilityListItem.tsx` (lines 142, 146, 182, 186, 216, 220)

**Current:** Stores entire facility data in `localStorage.getItem('adminFacilities')`

**Problem:** Facility data should ONLY be in database (facilities table)

**Solution:** Remove all localStorage reads/writes. Use React Query hooks that already exist.

---

### 2. **User Avatar** (IMPORTANT)
**Files:**
- `ProfileDropdown.tsx` (line 63)
- `useAdminProfileManagement.ts` (line 58)

**Current:** `localStorage.getItem(\`avatar_\${user.id}\`)`

**Problem:** Avatar should be in database (user_profiles table has avatar_url column)

**Solution:** Use user_profiles.avatar_url from Supabase

---

### 3. **Last Login Tracking** (IMPORTANT)
**Files:**
- `AuthContext.tsx` (lines 153, 156, 161)

**Current:** `localStorage.setItem(\`last_login_\${userId}\`, new Date().toISOString())`

**Problem:** Last login should be in database (user_profiles.last_login_at)

**Solution:** Update user_profiles table on login

---

### 4. **Notification Preferences** (IMPORTANT)
**Files:**
- `useNotificationPreferences.ts` (lines 293, 299, 308, 329, 335, 344, 370)

**Current:** Stores in localStorage:
- `notificationPreferences`
- `notificationTemplates`
- `contactInfo`

**Problem:** User preferences should be in database

**Solution:** Create `user_notification_preferences` table

---

### 5. **Booking Numbers** (CRITICAL)
**Files:**
- `Checkout.tsx` (lines 556, 559)
- `BookingsPage.tsx` (lines 525, 528)

**Current:** 
- `localStorage.getItem("lastBookingNumber")`
- `localStorage.getItem("pendingBookings")`
- `localStorage.getItem("processedBookings")`

**Problem:** Booking data MUST be in database for reliability

**Solution:** Use bookings table auto-incrementing ID. Already exists in database.

---

### 6. **User Portal Preference** (MEDIUM)
**Files:**
- `GlobalHeader.tsx` (lines 50, 52, 65)
- `Index.tsx` (line 52)

**Current:** `localStorage.setItem("lastPortal", "admin")`

**Problem:** User preference should persist across devices

**Solution:** Add `preferred_portal` to user_profiles table

---

### 7. **Favorites View Mode** (LOW)
**Files:**
- `useUserFavoritesManagement.ts` (lines 241, 256)

**Current:** `localStorage.getItem(VIEW_MODE_STORAGE_KEY)`

**Problem:** UI preference could be in database for cross-device sync

**Solution:** Add `favorites_view_mode` to user_profiles table (optional)

---

## Migration Priority

### 🔴 CRITICAL (Do First)
1. **Facility Data** - Remove all localStorage usage, already in database
2. **Booking Numbers** - Use database auto-increment

### 🟡 HIGH (Do Soon)  
3. **User Avatar** - Use user_profiles.avatar_url
4. **Last Login** - Use user_profiles.last_login_at
5. **Language Preference** - Use user_profiles.language

### 🟢 MEDIUM (Can Wait)
6. **Notification Preferences** - Create dedicated table
7. **Portal Preference** - Add to user_profiles

### ⚪ LOW (Optional)
8. **View Mode Preferences** - Nice to have cross-device sync

---

## Recommended Database Schema Changes

```sql
-- Add to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_portal VARCHAR(10) DEFAULT 'user';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'no';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS favorites_view_mode VARCHAR(10) DEFAULT 'grid';

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  booking_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Files That Need Changes

### Remove localStorage completely:
1. ✅ `src/components/features/facilities/components/FacilityEditForm/AdminFacilityCard.tsx`
2. ✅ `src/components/features/facilities/components/FacilityEditForm/AdminFacilityListItem.tsx`
3. ✅ `src/pages/Checkout.tsx`
4. ✅ `src/pages/admin/BookingsPage.tsx`

### Migrate to database:
5. ✅ `src/contexts/AuthContext.tsx` (last_login)
6. ✅ `src/contexts/LanguageContext.tsx` (language preference)
7. ✅ `src/components/layouts/AdminLayout/ProfileDropdown.tsx` (avatar)
8. ✅ `src/hooks/features/profile/useAdminProfileManagement.ts` (avatar)
9. ✅ `src/components/layouts/PublicLayout/GlobalHeader.tsx` (portal preference)
10. ✅ `src/pages/Index.tsx` (portal preference)
11. ✅ `src/hooks/features/notifications/useNotificationPreferences.ts` (all preferences)
12. ✅ `src/hooks/features/favorites/useUserFavoritesManagement.ts` (view mode)

---

## Next Steps

1. Create database migration for new columns/tables
2. Update each file to use database instead of localStorage
3. Add migration script to move existing localStorage data to database
4. Remove all localStorage.getItem/setItem calls
5. Test thoroughly

Would you like me to proceed with migrating these to the database?
