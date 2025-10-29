# Clean Architecture Refactoring Master Plan

## 🎯 Vision

Transform the entire codebase to follow clean architecture principles:
- **Presentation Layer** (Components/Pages) - Pure UI only
- **Hooks Layer** (Custom Hooks) - Orchestration
- **Business Logic Layer** (Services) - Pure functions
- **State Layer** (Zustand) - UI state management
- **Data Layer** (Supabase) - Data fetching

---

## 📊 Current State Analysis

### ✅ Completed
- [x] Facilities management (FacilitiesPage.tsx)
- [x] Business service: `facility.business.service.ts`
- [x] UI Store: `facilityUIStore.ts`
- [x] Hooks: `useFacilityManagement`, `useFacilityEditor`
- [x] Architecture documentation

### 🚧 Existing Stores (Need Review)
```
✓ facilityUIStore.ts     - NEW (clean architecture)
⚠️ cartStore.ts           - Needs refactor (mixed concerns)
⚠️ recurringBookingStore.ts - Needs refactor
⚠️ groupStore.ts          - Needs refactor
⚠️ messageStore.ts        - Needs refactor
⚠️ fieldConfigStore.ts    - Needs refactor
⚠️ supportStore.ts        - Needs refactor
⚠️ favoritesStore.ts      - Needs refactor
⚠️ zoneStore.ts           - Needs refactor
⚠️ slotSelectionStore.ts  - Needs refactor
```

### 🚧 Existing Hooks (Need Organization)
```
Root level (need to move to /features/):
⚠️ useBookings.ts
⚠️ useDraftBooking.ts
⚠️ useLocalizedDbValue.ts
⚠️ useNotifications.ts
⚠️ useRealtimeBookings.ts
⚠️ useRealtimeNotifications.ts
⚠️ useReviews.ts
⚠️ useStatistics.ts
⚠️ useStorageMigration.ts
⚠️ useUserPreferences.ts
```

---

## 📋 Master Refactoring Plan

### Phase 1: Foundation & Infrastructure (Priority: 🔥 HIGH)
**Goal:** Set up the architectural foundation

#### 1.1 Service Layer Creation
Create business logic services for each domain:

```
/src/services/business/
├── facility.business.service.ts      ✅ DONE
├── booking.business.service.ts       ⏳ TODO
├── user.business.service.ts          ⏳ TODO
├── auth.business.service.ts          ⏳ TODO
├── calendar.business.service.ts      ⏳ TODO
├── zone.business.service.ts          ⏳ TODO
├── group.business.service.ts         ⏳ TODO
├── message.business.service.ts       ⏳ TODO
├── notification.business.service.ts  ⏳ TODO
├── cart.business.service.ts          ⏳ TODO
├── payment.business.service.ts       ⏳ TODO
├── support.business.service.ts       ⏳ TODO
└── report.business.service.ts        ⏳ TODO
```

#### 1.2 UI State Stores (Zustand)
Refactor existing stores to ONLY handle UI state:

```
/src/stores/
├── facilityUIStore.ts        ✅ DONE
├── bookingUIStore.ts         ⏳ TODO (refactor recurringBookingStore)
├── userUIStore.ts            ⏳ TODO
├── calendarUIStore.ts        ⏳ TODO
├── zoneUIStore.ts            ⏳ TODO (refactor zoneStore)
├── groupUIStore.ts           ⏳ TODO (refactor groupStore)
├── messageUIStore.ts         ⏳ TODO (refactor messageStore)
├── cartUIStore.ts            ⏳ TODO (refactor cartStore)
├── supportUIStore.ts         ⏳ TODO (refactor supportStore)
├── favoritesUIStore.ts       ⏳ TODO (refactor favoritesStore)
└── slotSelectionUIStore.ts   ⏳ TODO (refactor slotSelectionStore)
```

#### 1.3 Feature Hooks Organization
Move and organize all hooks:

```
/src/hooks/features/
├── facilities/
│   ├── useFacilityManagement.ts     ✅ DONE
│   └── useFacilityEditor.ts         ✅ DONE
├── bookings/
│   ├── useBookingManagement.ts      ⏳ TODO (from useBookings)
│   ├── useDraftBooking.ts           ⏳ TODO (move from root)
│   ├── useRealtimeBookings.ts       ⏳ TODO (move from root)
│   └── useBookingValidation.ts      ⏳ TODO
├── users/
│   ├── useUserManagement.ts         ⏳ TODO
│   ├── useUserProfile.ts            ⏳ TODO
│   └── useUserPreferences.ts        ⏳ TODO (move from root)
├── calendar/
│   ├── useCalendarManagement.ts     ⏳ TODO
│   └── useSlotSelection.ts          ⏳ TODO
├── zones/
│   └── useZoneManagement.ts         ⏳ TODO
├── groups/
│   └── useGroupManagement.ts        ⏳ TODO
├── messages/
│   └── useMessageManagement.ts      ⏳ TODO
├── notifications/
│   ├── useNotifications.ts          ⏳ TODO (move from root)
│   └── useRealtimeNotifications.ts  ⏳ TODO (move from root)
├── cart/
│   └── useCartManagement.ts         ⏳ TODO
├── support/
│   └── useSupportManagement.ts      ⏳ TODO
├── reviews/
│   └── useReviews.ts                ⏳ TODO (move from root)
└── favorites/
    └── useFavoritesManagement.ts    ⏳ TODO
```

---

### Phase 2: Admin Pages Refactoring (Priority: 🔥 HIGH)

#### 2.1 Dashboard & Overview
**Files:**
- `Overview.tsx` - Admin dashboard

**Tasks:**
1. Create `useDashboardManagement.ts` hook
2. Create `dashboard.business.service.ts`
3. Create `dashboardUIStore.ts`
4. Refactor Overview.tsx to pure UI

**Dependencies:**
- Facility stats (✅ done)
- Booking stats (needs service)
- User stats (needs service)

---

#### 2.2 Facilities Management
**Files:**
- `FacilitiesPage.tsx` ✅ DONE
- `FacilityEditPage.tsx` ⏳ TODO

**Tasks for FacilityEditPage:**
1. Use existing `useFacilityEditor()` hook
2. Remove all business logic
3. Simplify to pure UI

---

#### 2.3 Bookings Management
**Files:**
- `BookingsPage.tsx`
- `ApprovalsPage.tsx`

**Tasks:**
1. Create `booking.business.service.ts`
   - Booking validation rules
   - Status transitions
   - Approval logic
   - Conflict detection
   - Price calculations

2. Create `bookingUIStore.ts`
   - View mode (list/calendar/timeline)
   - Filters (status, date range, facility)
   - Sort preferences
   - Selection state

3. Create `useBookingManagement.ts`
   - Combine booking operations
   - Connect to business service
   - Connect to UI store
   - Handle real-time updates

4. Refactor pages to use hooks

---

#### 2.4 Users & Roles Management
**Files:**
- `UsersRolesPage.tsx`

**Tasks:**
1. Create `user.business.service.ts`
   - User validation
   - Role permissions
   - Access control logic

2. Create `userUIStore.ts`
   - User filters
   - Role filters
   - Selection state

3. Create `useUserManagement.ts`
4. Refactor page

---

#### 2.5 Settings & Configuration
**Files:**
- `SettingsPage.tsx`
- `LocalizationManagementPage.tsx`
- `IntegrationsPage.tsx`

**Tasks:**
1. Create `settings.business.service.ts`
2. Create `settingsUIStore.ts`
3. Create `useSettingsManagement.ts`
4. Refactor pages

---

#### 2.6 Reports & Analytics
**Files:**
- `ReportsPage.tsx`
- `AuditLogPage.tsx`

**Tasks:**
1. Create `report.business.service.ts`
   - Report generation logic
   - Data aggregation
   - Export formatting

2. Create `reportUIStore.ts`
3. Create `useReportManagement.ts`
4. Refactor pages

---

#### 2.7 Messaging & Notifications
**Files:**
- `AdminMessages.tsx`
- `NotificationsPage.tsx`

**Tasks:**
1. Create `message.business.service.ts`
2. Create `notification.business.service.ts`
3. Create respective UI stores
4. Create hooks
5. Refactor pages

---

### Phase 3: User Pages Refactoring (Priority: 🔶 MEDIUM)

#### 3.1 User Dashboard
**Files:**
- `UserDashboard.tsx`
- `CalendarPage.tsx`

**Tasks:**
1. Create `useUserDashboard.ts`
2. Use existing booking services
3. Create `calendarUIStore.ts`
4. Create `useCalendarManagement.ts`
5. Refactor pages

---

#### 3.2 User Bookings
**Files:**
- `Bookings.tsx`
- `HistoryPage.tsx`

**Tasks:**
1. Reuse `useBookingManagement.ts`
2. Add user-specific filters
3. Refactor pages

---

#### 3.3 User Facilities
**Files:**
- `UserFacilities.tsx`
- `UserFavorites.tsx`

**Tasks:**
1. Create `useFavoritesManagement.ts`
2. Reuse facility services
3. Refactor pages

---

#### 3.4 User Profile & Settings
**Files:**
- `UserProfile.tsx`
- `UserSettings.tsx`

**Tasks:**
1. Create `useUserProfile.ts`
2. Use user services
3. Refactor pages

---

#### 3.5 User Communication
**Files:**
- `UserMessages.tsx`
- `UserNotifications.tsx`
- `UserHelp.tsx`

**Tasks:**
1. Reuse message/notification hooks
2. Create `useSupportManagement.ts`
3. Refactor pages

---

#### 3.6 User Receipts
**Files:**
- `UserReceipts.tsx`

**Tasks:**
1. Create `receipt.business.service.ts`
2. Create `useReceiptManagement.ts`
3. Refactor page

---

### Phase 4: Feature Components Refactoring (Priority: 🔶 MEDIUM)

#### 4.1 Calendar Components
**Directory:** `/src/components/features/calendar/`

**Tasks:**
1. Extract business logic to services
2. Create calendar hooks
3. Refactor components to pure UI

---

#### 4.2 Booking Components
**Directory:** `/src/components/features/bookings/`

**Tasks:**
1. Extract booking logic
2. Use booking hooks
3. Refactor components

---

#### 4.3 Facility Components
**Directory:** `/src/components/features/facilities/`

**Tasks:**
1. Use existing facility hooks
2. Remove business logic
3. Refactor components

---

#### 4.4 Auth Components
**Directory:** `/src/components/features/auth/`

**Tasks:**
1. Create `auth.business.service.ts`
2. Create `useAuthManagement.ts`
3. Refactor components

---

#### 4.5 Search Components
**Directory:** `/src/components/features/search/`

**Tasks:**
1. Create `search.business.service.ts`
2. Create `searchUIStore.ts`
3. Create `useSearchManagement.ts`
4. Refactor components

---

#### 4.6 Dashboard Components
**Directory:** `/src/components/features/dashboard/`

**Tasks:**
1. Use dashboard hooks
2. Refactor to pure UI

---

#### 4.7 Cart Components
**Directory:** `/src/components/features/cart/`

**Tasks:**
1. Create `cart.business.service.ts`
2. Refactor `cartStore.ts` to UI only
3. Create `useCartManagement.ts`
4. Refactor components

---

#### 4.8 Messaging Components
**Directory:** `/src/components/features/messaging/`

**Tasks:**
1. Use message hooks
2. Refactor components

---

#### 4.9 Support Components
**Directory:** `/src/components/features/support/`

**Tasks:**
1. Use support hooks
2. Refactor components

---

#### 4.10 Groups Components
**Directory:** `/src/components/features/groups/`

**Tasks:**
1. Create `group.business.service.ts`
2. Refactor `groupStore.ts`
3. Create `useGroupManagement.ts`
4. Refactor components

---

### Phase 5: Common Components Review (Priority: 🟡 LOW)

#### 5.1 Forms Components
**Directory:** `/src/components/common/forms/`

**Status:** Likely already clean (presentation only)
**Action:** Review and document

---

#### 5.2 Tables Components
**Directory:** `/src/components/common/tables/`

**Status:** Likely already clean
**Action:** Review and document

---

#### 5.3 Calendar Commons
**Directory:** `/src/components/common/calendar/`

**Action:** Extract any business logic

---

#### 5.4 Filter Components
**Directory:** `/src/components/common/filters/`

**Action:** Ensure no business logic

---

### Phase 6: Shared Utilities & Cleanup (Priority: 🟡 LOW)

#### 6.1 Shared Hooks Review
**Directory:** `/src/hooks/shared/`

**Action:**
- Review each hook
- Ensure single responsibility
- Move feature-specific hooks to `/features/`

---

#### 6.2 Delete Obsolete Code
**Tasks:**
1. Remove old store implementations
2. Remove duplicate logic
3. Clean up unused utilities

---

#### 6.3 Type Definitions
**Tasks:**
1. Consolidate types
2. Create domain-specific type files
3. Remove duplicate types

---

## 🎯 Implementation Strategy

### Priority Levels
- 🔥 **HIGH:** Core functionality, frequently used pages
- 🔶 **MEDIUM:** Important but less critical features
- 🟡 **LOW:** Nice-to-have improvements

### Execution Order
1. **Week 1-2:** Phase 1 (Foundation)
   - Create all business services
   - Refactor all stores to UI-only
   - Organize hooks structure

2. **Week 3-4:** Phase 2 (Admin Pages)
   - Focus on high-traffic admin pages
   - Booking management
   - Facilities (mostly done)

3. **Week 5-6:** Phase 3 (User Pages)
   - User-facing pages
   - Better UX priority

4. **Week 7-8:** Phase 4 (Feature Components)
   - Component refactoring
   - Shared component review

5. **Week 9-10:** Phase 5-6 (Polish & Cleanup)
   - Common components
   - Documentation
   - Testing

---

## 📐 Refactoring Template

### For Each Feature Domain:

```
1. Create Business Service
   ✓ Location: /src/services/business/{domain}.business.service.ts
   ✓ Content: Pure functions, validation, calculations

2. Create/Refactor UI Store
   ✓ Location: /src/stores/{domain}UIStore.ts
   ✓ Content: UI state only (view, filters, selections)

3. Create Management Hook
   ✓ Location: /src/hooks/features/{domain}/use{Domain}Management.ts
   ✓ Content: Connect services + store + data

4. Refactor Components/Pages
   ✓ Remove all business logic
   ✓ Use management hook
   ✓ Pure UI rendering only
```

---

## 📊 Success Metrics

### Code Quality
- [ ] 90%+ test coverage on business services
- [ ] 0 business logic in components
- [ ] 0 data fetching in components (except via hooks)
- [ ] All stores contain ONLY UI state

### Performance
- [ ] Reduced bundle size
- [ ] Faster initial load
- [ ] Optimized re-renders
- [ ] Better caching

### Developer Experience
- [ ] Clear file organization
- [ ] Easy to locate code
- [ ] Simple to add features
- [ ] Comprehensive documentation

### Maintainability
- [ ] Single responsibility everywhere
- [ ] Clear dependencies
- [ ] Easy to refactor
- [ ] Simple to debug

---

## 🚀 Quick Start Guide

### To Refactor a New Page:

1. **Analyze current state**
   ```bash
   # Check for business logic
   grep -n "filter\|sort\|validate" YourPage.tsx
   ```

2. **Create business service**
   ```typescript
   // /src/services/business/your-domain.business.service.ts
   export const filterYourData = (data, filters) => { /* ... */ }
   export const validateYourData = (data) => { /* ... */ }
   ```

3. **Create/update UI store**
   ```typescript
   // /src/stores/yourDomainUIStore.ts
   export const useYourDomainUIStore = create((set) => ({
     view: 'list',
     filters: {},
     setView: (view) => set({ view }),
   }));
   ```

4. **Create management hook**
   ```typescript
   // /src/hooks/features/your-domain/useYourDomainManagement.ts
   export const useYourDomainManagement = () => {
     const data = useYourData(); // Supabase
     const { filters } = useYourDomainUIStore(); // UI state
     const filtered = filterYourData(data, filters); // Business logic
     return { filtered, ...otherOperations };
   };
   ```

5. **Refactor page**
   ```typescript
   const YourPage = () => {
     const { filtered, operations } = useYourDomainManagement();
     return <div>{/* Pure UI */}</div>;
   };
   ```

---

## 📚 Reference Documents
- [Clean Architecture Guide](./CLEAN_ARCHITECTURE_GUIDE.md)
- [Example: FacilitiesPage](../src/pages/admin/FacilitiesPage.tsx)
- [Example: useFacilityManagement](../src/hooks/features/useFacilityManagement.ts)
- [Example: facility.business.service](../src/services/business/facility.business.service.ts)

---

## 🎯 Next Steps

1. **Review this plan with team**
2. **Prioritize based on business needs**
3. **Start with Phase 1 (Foundation)**
4. **Establish patterns with 2-3 domains**
5. **Scale to remaining domains**
6. **Continuous testing and refinement**

---

**Last Updated:** 2025-10-29
**Status:** Planning Phase
**Progress:** Phase 1 - 10% Complete (Facilities done)
