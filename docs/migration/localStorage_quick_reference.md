# Booknor localStorage Quick Reference

## Storage Keys Overview

### Zustand Stores (Persistent, Type-Safe)
```
cart-store                      → Shopping cart items
recurring-booking-store         → Recurring bookings
favorites-store                 → Favorite facilities
field-config-store              → Field visibility configs
slot-selection-store            → Selected time slots
message-store                   → Messages & threads
support-store                   → Support tickets
group-store                      → Booking groups
zone-storage                     → Facility zones
facility-store                   → Facilities data
```

### Direct localStorage Keys (Manual, Less Type-Safe)
```
pendingBookings                  → Bookings awaiting approval
processedBookings                → Approved/completed bookings
booknor-language                  → User language (NO/EN)
favorites-view-mode              → View preference (grid/list)
lastBookingNumber                → Sequential booking ID counter
adminUsers                       → Admin user list
adminRoles                       → Admin role definitions
deletionLogs                     → Deletion operation logs
notificationPreferences          → Notification settings
notificationTemplates            → Message templates
contactInfo                      → User contact info
userSettings                     → User preferences
offline_actions_queue            → Queued offline operations
systemEvents                     → System event logs
```

## Usage by Module

### Booking Workflow
- **Create:** `Checkout.tsx` writes to `pendingBookings`, `lastBookingNumber`
- **Display:** Dashboard, Calendar, History read from both states
- **Approve:** `BookingsPage.tsx` moves from pending to processed
- **Type:** `LocalStorageBooking[]`

### User Preferences
- **Language:** `LanguageContext.tsx` → `booknor-language`
- **Favorites View:** `UserFavorites.tsx` → `favorites-view-mode`
- **Settings:** `UserSettings.tsx` → `userSettings`

### Shopping Cart
- **Store:** `useCartStore()` with Zustand persist
- **Type:** `ICartState`
- **Auto-persisted:** Yes

### Notifications
- **Preferences:** `UserNotifications.tsx` → `notificationPreferences`
- **Templates:** `UserNotifications.tsx` → `notificationTemplates`
- **Contact:** `UserNotifications.tsx` → `contactInfo`

### Admin Operations
- **Users:** `UsersRolesPage.tsx` ↔ `adminUsers`
- **Roles:** `UsersRolesPage.tsx` ↔ `adminRoles`
- **Deletions:** `DeletionPlanPage.tsx` → `deletionLogs`
- **System:** `NotificationsPage.tsx` ↔ `systemEvents`

### Offline Support
- **Queue:** `useOfflineStatus.ts` → `offline_actions_queue`
- **Purpose:** Store operations when offline

## Type Coverage Status

### Well-Typed (Ready)
✅ All Zustand stores
✅ pendingBookings / processedBookings
✅ booknor-language

### Needs Types (Priority)
⚠️ Admin keys (adminUsers, adminRoles)
⚠️ Notification keys
⚠️ System keys (deletionLogs, systemEvents)

## Migration Strategy

### Phase 1: Consolidate Types
- Create `localStorage-keys.ts` with all interfaces
- Update existing helpers

### Phase 2: Centralize Access
- Create `BooknorStorage` utility class
- Migrate all direct access to use it

### Phase 3: Zustand Migration
- Convert remaining direct localStorage to Zustand stores
- Remove deprecated `localStorageTypes.ts`

## Key Statistics

- **Total Keys:** 21
- **Zustand Stores:** 10
- **Direct localStorage:** 11
- **Files Using Storage:** 34
- **Type Coverage:** ~45%

## Files by Storage Usage

### Pages (12)
- UserDashboard, BookingsPage, UserReceipts
- CalendarPage, HistoryPage, Checkout
- UserFavorites, UserNotifications, UserSettings
- UsersRolesPage, NotificationsPage, DeletionPlanPage

### Stores (10)
- All in `/src/stores/`

### Contexts (1)
- LanguageContext

### Hooks (2)
- useOfflineStatus, useNotifications

### Types (2)
- types/localStorage.ts (active)
- utils/localStorageTypes.ts (deprecated)

---

**For detailed information, see:** `localStorage_audit_report.md`
