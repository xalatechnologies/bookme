# Systematic Refactoring Task Checklist

**Generated**: 2025-10-28  
**Story Point Size**: Each task = 1 SP (1-2 hours)  
**Total Tasks**: 152 tasks  
**Estimated Duration**: 10-12 weeks (1 developer)

---

## How to Use This Checklist

✅ Check off tasks as completed  
📝 Update status in your project management tool  
🔄 Tasks can be done in parallel where noted  
⚠️ Some tasks have dependencies - follow the order within each phase

---

## Phase 1: Quick Wins & Foundation (Week 1-2)

### 1.1 Performance Quick Fixes (8 tasks, 1 day)

**Goal:** Fix inline arrow functions causing unnecessary re-renders

- [ ] **Task 1.1.1** - Fix inline functions in `BookingCard/index.tsx` (3 instances)
- [ ] **Task 1.1.2** - Fix inline functions in `BookingDetailsPanel.tsx` (2 instances)
- [ ] **Task 1.1.3** - Fix inline functions in `MessageThread.tsx` (4 instances)
- [ ] **Task 1.1.4** - Fix inline functions in `MessageInbox.tsx` (3 instances)
- [ ] **Task 1.1.5** - Fix inline functions in `UserReceipts.tsx` (5 instances)
- [ ] **Task 1.1.6** - Fix inline functions in `BookingsPage.tsx` (8 instances)
- [ ] **Task 1.1.7** - Fix inline functions in `Checkout.tsx` (6 instances)
- [ ] **Task 1.1.8** - Fix inline functions in remaining 40+ files (batch process)

**Acceptance Criteria:**
- All `onClick={() => ...}` replaced with `useCallback`
- All event handlers memoized
- ESLint warnings resolved

**Parallel:** ✅ All tasks can be done simultaneously

---

### 1.2 Missing Key Props (2 tasks, 2 hours)

**Goal:** Fix React warnings about missing keys in lists

- [ ] **Task 1.2.1** - Add keys to map iterations in `PermissionGuard.tsx`
- [ ] **Task 1.2.2** - Add keys to map iterations in `BookingFiltersBar.tsx`
- [ ] **Task 1.2.3** - Add keys to map iterations in `UserNotifications.tsx`
- [ ] **Task 1.2.4** - Add keys to map iterations in `MessageInbox.tsx`
- [ ] **Task 1.2.5** - Add keys to map iterations in `SupportTicketList.tsx`
- [ ] **Task 1.2.6** - Add keys to map iterations in `FacilityEditPage.tsx`

**Acceptance Criteria:**
- All `.map()` with JSX have unique `key` prop
- No React key warnings in console

**Parallel:** ✅ All tasks can be done simultaneously

---

### 1.3 TypeScript Quality (6 tasks, 1 day)

**Goal:** Remove all explicit `any` types

- [ ] **Task 1.3.1** - Fix `any` types in `UserReceipts.tsx` (8 instances)
- [ ] **Task 1.3.2** - Fix `any` types in `useRecurringSlots.ts` (5 instances)
- [ ] **Task 1.3.3** - Fix `any` types in `BookingsPage.tsx` (4 instances)
- [ ] **Task 1.3.4** - Fix `any` types in `messageStore.ts` (3 instances)
- [ ] **Task 1.3.5** - Fix `any` types in `FacilityEditPage.tsx` (6 instances)
- [ ] **Task 1.3.6** - Fix `any` types in remaining 5 files (5 instances)

**Acceptance Criteria:**
- Create proper type definitions
- No `any` types remaining
- Full TypeScript strict mode compliance

**Parallel:** ✅ All tasks can be done simultaneously

---

### 1.4 Remove Unused Imports (4 tasks, 4 hours)

**Goal:** Clean up 96 files with unused imports

- [ ] **Task 1.4.1** - Clean imports in all `pages/admin/` files (13 files)
- [ ] **Task 1.4.2** - Clean imports in all `pages/user/` files (12 files)
- [ ] **Task 1.4.3** - Clean imports in all `components/features/bookings/` (25 files)
- [ ] **Task 1.4.4** - Clean imports in remaining components (46 files)

**Acceptance Criteria:**
- Run ESLint auto-fix
- Manually verify imports
- No unused import warnings

**Parallel:** ✅ All tasks can be done simultaneously

---

## Phase 2: Design System Setup (Week 2-3)

### 2.1 Design Tokens Creation (5 tasks, 1 day)

- [ ] **Task 2.1.1** - Create `src/config/design-tokens.ts` with color palette
- [ ] **Task 2.1.2** - Add spacing scale to design tokens
- [ ] **Task 2.1.3** - Add typography scale to design tokens
- [ ] **Task 2.1.4** - Add shadow system to design tokens
- [ ] **Task 2.1.5** - Add border radius scale to design tokens

**Acceptance Criteria:**
- All tokens properly typed with TypeScript
- Tokens cover all existing hardcoded values
- Documentation for each token group

**Dependencies:** Must be done in order

---

### 2.2 Tailwind Configuration (2 tasks, 2 hours)

- [ ] **Task 2.2.1** - Update `tailwind.config.ts` with design tokens
- [ ] **Task 2.2.2** - Test Tailwind classes with new token system

**Acceptance Criteria:**
- All custom colors available as Tailwind classes
- IntelliSense shows new classes
- No breaking changes to existing classes

**Dependencies:** Requires 2.1.* complete

---

### 2.3 Remove Hardcoded Values (5 tasks, 1 day)

- [ ] **Task 2.3.1** - Replace hardcoded colors in `DashboardKPIs.tsx`
- [ ] **Task 2.3.2** - Replace hardcoded colors in `CalendarView.tsx`
- [ ] **Task 2.3.3** - Replace hardcoded colors in `StatusBadges` (3 files)
- [ ] **Task 2.3.4** - Replace hardcoded spacing in inline styles (7 files)
- [ ] **Task 2.3.5** - Verify no hardcoded values remain (run analysis)

**Acceptance Criteria:**
- All hardcoded hex colors removed
- All inline styles converted to Tailwind
- Design token usage documented

**Dependencies:** Requires 2.2.* complete

---

## Phase 3: Auth & RBAC Standardization (Week 3-4)

### 3.1 Role Constants Migration (8 tasks, 1 day)

- [ ] **Task 3.1.1** - Replace role strings in `BookingsPage.tsx` with ROLES constants
- [ ] **Task 3.1.2** - Replace role strings in `FacilitiesPage.tsx` with ROLES constants
- [ ] **Task 3.1.3** - Replace role strings in `UsersRolesPage.tsx` with ROLES constants
- [ ] **Task 3.1.4** - Replace role strings in `GroupManagementCard.tsx` with ROLES constants
- [ ] **Task 3.1.5** - Replace role strings in `GroupBookingFlow.tsx` with ROLES constants
- [ ] **Task 3.1.6** - Replace role strings in layout components (3 files)
- [ ] **Task 3.1.7** - Replace role strings in auth components (4 files)
- [ ] **Task 3.1.8** - Replace role strings in remaining 45 files

**Acceptance Criteria:**
- All role strings use `ROLES` constant
- No hardcoded role strings remain
- TypeScript ensures type safety

**Parallel:** ✅ All tasks can be done simultaneously

---

### 3.2 Permission System Expansion (5 tasks, 1 day)

- [ ] **Task 3.2.1** - Create `src/constants/permissions.ts` with all permissions
- [ ] **Task 3.2.2** - Define role-to-permission mappings
- [ ] **Task 3.2.3** - Update `usePermissions` hook to use new system
- [ ] **Task 3.2.4** - Add permission checks to all booking operations
- [ ] **Task 3.2.5** - Add permission checks to all facility operations

**Acceptance Criteria:**
- 20+ permissions defined
- All roles mapped to permissions
- Permission checks in critical operations

**Dependencies:** Must be done in order

---

### 3.3 Remove Inline Auth Logic (2 tasks, 2 hours)

- [ ] **Task 3.3.1** - Refactor inline auth checks in component A (identified in analysis)
- [ ] **Task 3.3.2** - Refactor inline auth checks in component B (identified in analysis)

**Acceptance Criteria:**
- Use `<PermissionGuard>` component
- Use `usePermissions()` hook
- No inline role checking logic

**Dependencies:** Requires 3.2.* complete

---

## Phase 4: Reusable Components (Week 4-6)

### 4.1 StatusBadge Component (6 tasks, 1.5 days)

- [ ] **Task 4.1.1** - Create `src/components/common/status/StatusBadge.tsx`
- [ ] **Task 4.1.2** - Add translation support to StatusBadge
- [ ] **Task 4.1.3** - Create domain-specific badge variants (Booking, Payment, User)
- [ ] **Task 4.1.4** - Write unit tests for StatusBadge
- [ ] **Task 4.1.5** - Create Storybook stories for StatusBadge
- [ ] **Task 4.1.6** - Document StatusBadge API and usage examples

**Acceptance Criteria:**
- Component fully typed with TypeScript
- Supports all status types found in analysis
- i18n integration complete
- 100% test coverage

**Dependencies:** Must be done in order

---

### 4.2 Migrate to StatusBadge (10 tasks, 2 days)

- [ ] **Task 4.2.1** - Replace status badge in `BookingsPage.tsx`
- [ ] **Task 4.2.2** - Replace status badge in `UserReceipts.tsx`
- [ ] **Task 4.2.3** - Replace status badge in `BookingList.tsx`
- [ ] **Task 4.2.4** - Replace status badge in `BookingCard/index.tsx`
- [ ] **Task 4.2.5** - Replace status badge in `RecurringBookingCard.tsx`
- [ ] **Task 4.2.6** - Replace status badge in `IntegrationsPage.tsx`
- [ ] **Task 4.2.7** - Replace status badge in `ReportsPage.tsx`
- [ ] **Task 4.2.8** - Replace status badge in `UsersRolesPage.tsx`
- [ ] **Task 4.2.9** - Replace status badge in `ApprovalsPage.tsx`
- [ ] **Task 4.2.10** - Replace status badge in `SupportTicketList.tsx`

**Acceptance Criteria:**
- Old badge logic removed
- New StatusBadge component used
- Translations verified
- Visual consistency confirmed

**Dependencies:** Requires 4.1.* complete  
**Parallel:** ✅ All tasks can be done simultaneously after 4.1.*

---

### 4.3 FilterBar Component (6 tasks, 1.5 days)

- [ ] **Task 4.3.1** - Create `src/components/common/filters/FilterBar.tsx`
- [ ] **Task 4.3.2** - Add support for all filter types (select, search, date, multi-select)
- [ ] **Task 4.3.3** - Integrate with LocalizedSelect for database-driven filters
- [ ] **Task 4.3.4** - Write unit tests for FilterBar
- [ ] **Task 4.3.5** - Create Storybook stories for FilterBar
- [ ] **Task 4.3.6** - Document FilterBar API and usage examples

**Acceptance Criteria:**
- Composable filter system
- Works with existing filter logic
- i18n support
- Accessible (keyboard navigation, screen readers)

**Dependencies:** Must be done in order

---

### 4.4 Migrate to FilterBar (8 tasks, 2 days)

- [ ] **Task 4.4.1** - Replace filters in `BookingsPage.tsx`
- [ ] **Task 4.4.2** - Replace filters in `FacilitiesPage.tsx`
- [ ] **Task 4.4.3** - Replace filters in `UsersRolesPage.tsx`
- [ ] **Task 4.4.4** - Replace filters in `BookingFiltersBar.tsx`
- [ ] **Task 4.4.5** - Replace filters in `UserReceipts.tsx`
- [ ] **Task 4.4.6** - Replace filters in `UserFavorites.tsx`
- [ ] **Task 4.4.7** - Replace filters in `HistoryPage.tsx`
- [ ] **Task 4.4.8** - Replace filters in search components (3 files)

**Acceptance Criteria:**
- Filter state management preserved
- URL parameter syncing works
- Clear filters functionality maintained

**Dependencies:** Requires 4.3.* complete  
**Parallel:** ✅ All tasks can be done simultaneously after 4.3.*

---

### 4.5 FormField Component (6 tasks, 1.5 days)

- [ ] **Task 4.5.1** - Create `src/components/common/forms/FormField.tsx`
- [ ] **Task 4.5.2** - Add validation error display
- [ ] **Task 4.5.3** - Add helper text and required indicator
- [ ] **Task 4.5.4** - Write unit tests for FormField
- [ ] **Task 4.5.5** - Create Storybook stories for FormField
- [ ] **Task 4.5.6** - Document FormField API and usage examples

**Acceptance Criteria:**
- Supports all input types
- Works with React Hook Form
- Accessible form labels
- Error state styling

**Dependencies:** Must be done in order

---

### 4.6 Migrate to FormField (12 tasks, 3 days)

- [ ] **Task 4.6.1** - Replace form fields in `FacilityEditForm.tsx` (8 fields)
- [ ] **Task 4.6.2** - Replace form fields in `UserProfile.tsx` (6 fields)
- [ ] **Task 4.6.3** - Replace form fields in `BookingForm/index.tsx` (5 fields)
- [ ] **Task 4.6.4** - Replace form fields in `SupportTicketForm.tsx` (4 fields)
- [ ] **Task 4.6.5** - Replace form fields in `GroupInvitationModal.tsx` (3 fields)
- [ ] **Task 4.6.6** - Replace form fields in `CreateThreadModal.tsx` (3 fields)
- [ ] **Task 4.6.7** - Replace form fields in `SettingsPage.tsx` (7 fields)
- [ ] **Task 4.6.8** - Replace form fields in `UsersRolesPage.tsx` (5 fields)
- [ ] **Task 4.6.9** - Replace form fields in `IntegrationsPage.tsx` (4 fields)
- [ ] **Task 4.6.10** - Replace form fields in login/auth forms (4 fields)
- [ ] **Task 4.6.11** - Replace form fields in remaining forms (15 files, ~20 fields)
- [ ] **Task 4.6.12** - Verify form validation still works across all forms

**Acceptance Criteria:**
- All forms use FormField component
- Form validation preserved
- Accessibility improved
- Consistent styling

**Dependencies:** Requires 4.5.* complete  
**Parallel:** ⚠️ Tasks 4.6.1-4.6.11 can be parallel, 4.6.12 must be last

---

### 4.7 DataCard Component (6 tasks, 1.5 days)

- [ ] **Task 4.7.1** - Create `src/components/common/cards/DataCard.tsx`
- [ ] **Task 4.7.2** - Add action menu support
- [ ] **Task 4.7.3** - Add footer slot for card actions
- [ ] **Task 4.7.4** - Write unit tests for DataCard
- [ ] **Task 4.7.5** - Create Storybook stories for DataCard
- [ ] **Task 4.7.6** - Document DataCard API and usage examples

**Acceptance Criteria:**
- Flexible composition slots
- Action menu with dropdown
- Click handling
- Responsive design

**Dependencies:** Must be done in order

---

### 4.8 Migrate to DataCard (10 tasks, 2.5 days)

- [ ] **Task 4.8.1** - Replace cards in `BookingCard/index.tsx`
- [ ] **Task 4.8.2** - Replace cards in `RecurringBookingCard.tsx`
- [ ] **Task 4.8.3** - Replace cards in `BookingList.tsx`
- [ ] **Task 4.8.4** - Replace cards in `UserReceipts.tsx`
- [ ] **Task 4.8.5** - Replace cards in `UserFavorites.tsx`
- [ ] **Task 4.8.6** - Replace cards in `AdminFacilityCard.tsx`
- [ ] **Task 4.8.7** - Replace cards in `AdminFacilityListItem.tsx`
- [ ] **Task 4.8.8** - Replace cards in `KPICard.tsx`
- [ ] **Task 4.8.9** - Replace cards in `TrendCard.tsx`
- [ ] **Task 4.8.10** - Replace cards in remaining 15+ card components

**Acceptance Criteria:**
- Consistent card appearance
- Action menus work correctly
- Click handlers preserved
- Status badges integrated

**Dependencies:** Requires 4.7.* complete  
**Parallel:** ✅ All tasks can be done simultaneously after 4.7.*

---

### 4.9 DataTable Component (8 tasks, 2 days)

- [ ] **Task 4.9.1** - Create `src/components/common/tables/DataTable.tsx`
- [ ] **Task 4.9.2** - Add sorting functionality
- [ ] **Task 4.9.3** - Add row selection with checkboxes
- [ ] **Task 4.9.4** - Add column configuration system
- [ ] **Task 4.9.5** - Add loading and empty states
- [ ] **Task 4.9.6** - Write unit tests for DataTable
- [ ] **Task 4.9.7** - Create Storybook stories for DataTable
- [ ] **Task 4.9.8** - Document DataTable API and usage examples

**Acceptance Criteria:**
- Generic, reusable table
- Type-safe column definitions
- Sorting, selection, pagination support
- Accessible table markup

**Dependencies:** Must be done in order

---

### 4.10 Migrate to DataTable (6 tasks, 1.5 days)

- [ ] **Task 4.10.1** - Replace table in `BookingsPage.tsx`
- [ ] **Task 4.10.2** - Replace table in `UsersRolesPage.tsx`
- [ ] **Task 4.10.3** - Replace table in `FacilitiesPage.tsx`
- [ ] **Task 4.10.4** - Replace table in `ReportsPage.tsx`
- [ ] **Task 4.10.5** - Replace table in `AuditLogPage.tsx`
- [ ] **Task 4.10.6** - Replace table in `NotificationsPage.tsx`

**Acceptance Criteria:**
- Table functionality preserved
- Sorting works correctly
- Row actions integrated
- Performance optimized

**Dependencies:** Requires 4.9.* complete  
**Parallel:** ✅ All tasks can be done simultaneously after 4.9.*

---

## Phase 5: Separation of Concerns (Week 6-8)

### 5.1 Extract Business Logic to Hooks (11 tasks, 3 days)

- [ ] **Task 5.1.1** - Create `useBookingCalculations` hook (extract from 3 components)
- [ ] **Task 5.1.2** - Create `useReceiptFiltering` hook (extract from UserReceipts)
- [ ] **Task 5.1.3** - Create `useBookingFiltering` hook (extract from BookingsPage)
- [ ] **Task 5.1.4** - Create `useFacilityData` hook (extract from FacilityEditPage)
- [ ] **Task 5.1.5** - Create `useFacilityForm` hook (extract from FacilityEditForm)
- [ ] **Task 5.1.6** - Create `useCheckoutCalculations` hook (extract from Checkout)
- [ ] **Task 5.1.7** - Create `useUserStatistics` hook (extract from UserDashboard)
- [ ] **Task 5.1.8** - Create `useCalendarFilters` hook (extract from CalendarView)
- [ ] **Task 5.1.9** - Create `useMessageThreads` hook (extract from MessageInbox)
- [ ] **Task 5.1.10** - Create `useGroupManagement` hook (extract from GroupManagementCard)
- [ ] **Task 5.1.11** - Document all new hooks with usage examples

**Acceptance Criteria:**
- Business logic extracted from components
- Components only handle UI rendering
- Hooks are reusable
- Full test coverage for hooks

**Dependencies:** Must be done in order

---

### 5.2 Remove Direct API Calls (3 tasks, 6 hours)

- [ ] **Task 5.2.1** - Move API calls from `FacilityEditForm.tsx` to service/hook
- [ ] **Task 5.2.2** - Move API calls from `FacilityEditPage.tsx` to service/hook
- [ ] **Task 5.2.3** - Move API calls from `Bookings.tsx` to service/hook

**Acceptance Criteria:**
- No direct Supabase calls in components
- All data fetching in services or hooks
- Error handling centralized
- Loading states managed by hooks

**Dependencies:** Can be done in parallel

---

### 5.3 Refactor Large Components (8 tasks, 4 days)

**BookingsPage (1715 LOC → ~400 LOC)**
- [ ] **Task 5.3.1** - Extract `BookingsDataProvider` component
- [ ] **Task 5.3.2** - Extract `BookingsFilters` component
- [ ] **Task 5.3.3** - Extract `BookingsList` component
- [ ] **Task 5.3.4** - Extract `BookingDetailModal` component

**Checkout (1306 LOC → ~300 LOC)**
- [ ] **Task 5.3.5** - Extract `CheckoutSummary` component
- [ ] **Task 5.3.6** - Extract `PaymentForm` component
- [ ] **Task 5.3.7** - Extract `ConfirmationStep` component

**FacilityEditPage (1288 LOC → ~350 LOC)**
- [ ] **Task 5.3.8** - Split into `FacilityEditContainer` + `FacilityEditSections`

**Acceptance Criteria:**
- Each component < 400 LOC
- Clear single responsibility
- Props well-defined
- Tests updated

**Dependencies:** Must be done in order within each component group  
**Parallel:** ✅ Different component groups can be done in parallel

---

## Phase 6: Performance Optimization (Week 8-9)

### 6.1 React Query Setup (4 tasks, 1 day)

- [ ] **Task 6.1.1** - Install and configure React Query
- [ ] **Task 6.1.2** - Set up QueryClient with caching strategy
- [ ] **Task 6.1.3** - Create query key factory pattern
- [ ] **Task 6.1.4** - Document React Query usage patterns

**Acceptance Criteria:**
- QueryClient configured
- Caching strategy defined (5min stale, 10min cache)
- Error handling setup
- DevTools enabled in development

**Dependencies:** Must be done in order

---

### 6.2 Migrate to React Query (8 tasks, 2 days)

- [ ] **Task 6.2.1** - Migrate bookings data fetching to `useQuery`
- [ ] **Task 6.2.2** - Migrate facilities data fetching to `useQuery`
- [ ] **Task 6.2.3** - Migrate users data fetching to `useQuery`
- [ ] **Task 6.2.4** - Migrate messages data fetching to `useQuery`
- [ ] **Task 6.2.5** - Create mutations for booking operations
- [ ] **Task 6.2.6** - Create mutations for facility operations
- [ ] **Task 6.2.7** - Create mutations for user operations
- [ ] **Task 6.2.8** - Implement optimistic updates for critical operations

**Acceptance Criteria:**
- All data fetching uses React Query
- Cache invalidation working
- Loading/error states handled
- Optimistic updates for mutations

**Dependencies:** Requires 6.1.* complete  
**Parallel:** ✅ All tasks can be done simultaneously after 6.1.*

---

### 6.3 Add Memoization (6 tasks, 1.5 days)

- [ ] **Task 6.3.1** - Add `React.memo` to `BookingCard` component
- [ ] **Task 6.3.2** - Add `React.memo` to `DataCard` component
- [ ] **Task 6.3.3** - Add `React.memo` to `StatusBadge` component
- [ ] **Task 6.3.4** - Add `React.memo` to all filter components
- [ ] **Task 6.3.5** - Add `React.memo` to table row components
- [ ] **Task 6.3.6** - Profile and verify performance improvements

**Acceptance Criteria:**
- Pure components wrapped with React.memo
- Props properly memoized
- Re-render count reduced
- Performance metrics improved

**Parallel:** ✅ All tasks can be done simultaneously

---

### 6.4 Code Splitting (4 tasks, 1 day)

- [ ] **Task 6.4.1** - Lazy load admin routes
- [ ] **Task 6.4.2** - Lazy load user routes
- [ ] **Task 6.4.3** - Lazy load heavy feature components (calendar, messaging)
- [ ] **Task 6.4.4** - Analyze bundle size and optimize chunks

**Acceptance Criteria:**
- Routes lazy loaded with `React.lazy`
- Suspense boundaries added
- Bundle size reduced by 30%+
- Initial load time improved

**Dependencies:** Can be done in parallel

---

## Phase 7: Complete Localization (Week 9-11)

### 7.1 Translation Infrastructure (4 tasks, 1 day)

- [ ] **Task 7.1.1** - Audit and organize translation files structure
- [ ] **Task 7.1.2** - Create missing translation namespaces
- [ ] **Task 7.1.3** - Set up translation key naming conventions
- [ ] **Task 7.1.4** - Create translation helper utilities

**Acceptance Criteria:**
- Clear namespace structure
- Naming convention documented
- Helper functions created
- Team trained on patterns

**Dependencies:** Must be done in order

---

### 7.2 Localize Remaining Pages (20 tasks, 5 days)

**Admin Pages:**
- [ ] **Task 7.2.1** - Localize `ApprovalsPage.tsx`
- [ ] **Task 7.2.2** - Localize `AuditLogPage.tsx`
- [ ] **Task 7.2.3** - Localize `DeletionPlanPage.tsx`
- [ ] **Task 7.2.4** - Localize `FacilityEditPage.tsx`
- [ ] **Task 7.2.5** - Localize `IntegrationsPage.tsx`
- [ ] **Task 7.2.6** - Localize `NotificationsPage.tsx`
- [ ] **Task 7.2.7** - Localize `Overview.tsx`
- [ ] **Task 7.2.8** - Localize `ReportsPage.tsx`
- [ ] **Task 7.2.9** - Localize `SettingsPage.tsx`
- [ ] **Task 7.2.10** - Localize `UsersRolesPage.tsx`

**User Pages:**
- [ ] **Task 7.2.11** - Localize `Bookings.tsx`
- [ ] **Task 7.2.12** - Localize `CalendarPage.tsx`
- [ ] **Task 7.2.13** - Localize `HistoryPage.tsx`
- [ ] **Task 7.2.14** - Localize `UserDashboard.tsx`
- [ ] **Task 7.2.15** - Localize `UserFacilities.tsx`
- [ ] **Task 7.2.16** - Localize `UserFavorites.tsx`
- [ ] **Task 7.2.17** - Localize `UserHelp.tsx`
- [ ] **Task 7.2.18** - Localize `UserMessages.tsx`
- [ ] **Task 7.2.19** - Localize `UserNotifications.tsx`
- [ ] **Task 7.2.20** - Localize `UserSettings.tsx`

**Acceptance Criteria (each task):**
- All hardcoded strings replaced with `t()` calls
- Translation keys added to JSON files
- Norwegian and English translations provided
- Language switching tested

**Dependencies:** Requires 7.1.* complete  
**Parallel:** ✅ All tasks can be done simultaneously after 7.1.*

---

### 7.3 Localize Remaining Components (15 tasks, 4 days)

- [ ] **Task 7.3.1** - Localize all booking components (10 components)
- [ ] **Task 7.3.2** - Localize all calendar components (8 components)
- [ ] **Task 7.3.3** - Localize all facility components (6 components)
- [ ] **Task 7.3.4** - Localize all dashboard components (5 components)
- [ ] **Task 7.3.5** - Localize all group components (4 components)
- [ ] **Task 7.3.6** - Localize all search components (3 components)
- [ ] **Task 7.3.7** - Localize all support components (2 components)
- [ ] **Task 7.3.8** - Localize all auth components (4 components)
- [ ] **Task 7.3.9** - Localize all layout components (8 components)
- [ ] **Task 7.3.10** - Localize filter components (5 components)
- [ ] **Task 7.3.11** - Localize form components (3 components)
- [ ] **Task 7.3.12** - Localize modal components (4 components)
- [ ] **Task 7.3.13** - Localize common components (10 components)
- [ ] **Task 7.3.14** - Add missing translation keys to database
- [ ] **Task 7.3.15** - Verify 100% localization coverage

**Acceptance Criteria:**
- All components use translation system
- No hardcoded user-facing strings
- Database-driven selects use LocalizedSelect
- Translation coverage report shows 100%

**Dependencies:** Requires 7.1.* complete  
**Parallel:** ✅ Tasks 7.3.1-7.3.13 can be done simultaneously

---

## Phase 8: Testing & Documentation (Week 11-12)

### 8.1 Unit Tests (8 tasks, 2 days)

- [ ] **Task 8.1.1** - Write tests for StatusBadge component
- [ ] **Task 8.1.2** - Write tests for FilterBar component
- [ ] **Task 8.1.3** - Write tests for FormField component
- [ ] **Task 8.1.4** - Write tests for DataCard component
- [ ] **Task 8.1.5** - Write tests for DataTable component
- [ ] **Task 8.1.6** - Write tests for all custom hooks
- [ ] **Task 8.1.7** - Write tests for auth utilities
- [ ] **Task 8.1.8** - Achieve 80%+ code coverage

**Acceptance Criteria:**
- All reusable components tested
- Edge cases covered
- 80%+ coverage
- CI/CD integration

**Parallel:** ✅ All tasks can be done simultaneously

---

### 8.2 Integration Tests (4 tasks, 1 day)

- [ ] **Task 8.2.1** - Test booking workflow end-to-end
- [ ] **Task 8.2.2** - Test facility management workflow
- [ ] **Task 8.2.3** - Test user authentication flow
- [ ] **Task 8.2.4** - Test localization switching

**Acceptance Criteria:**
- Critical user flows tested
- Multi-step workflows verified
- Error scenarios covered
- Tests run in CI/CD

**Parallel:** ✅ All tasks can be done simultaneously

---

### 8.3 Documentation Updates (6 tasks, 1.5 days)

- [ ] **Task 8.3.1** - Update component library documentation
- [ ] **Task 8.3.2** - Create migration guide for new components
- [ ] **Task 8.3.3** - Document design token usage
- [ ] **Task 8.3.4** - Update developer onboarding guide
- [ ] **Task 8.3.5** - Create code examples and recipes
- [ ] **Task 8.3.6** - Update architecture diagrams

**Acceptance Criteria:**
- All new components documented
- Usage examples provided
- Best practices listed
- Diagrams updated

**Parallel:** ✅ All tasks can be done simultaneously

---

### 8.4 Performance Audit (3 tasks, 6 hours)

- [ ] **Task 8.4.1** - Run Lighthouse audit on all pages
- [ ] **Task 8.4.2** - Profile React components for performance
- [ ] **Task 8.4.3** - Document performance improvements and metrics

**Acceptance Criteria:**
- Lighthouse scores > 90 (all categories)
- React DevTools shows minimal re-renders
- Bundle size reduced by 30%+
- Load time < 3 seconds

**Dependencies:** Must be done in order

---

## Progress Tracking

### Overall Progress

**Total Tasks:** 152  
**Completed:** 0  
**In Progress:** 0  
**Remaining:** 152

**Progress:** ░░░░░░░░░░░░░░░░░░░░ 0%

### Phase Progress

- [ ] Phase 1: Quick Wins (20 tasks)
- [ ] Phase 2: Design System (12 tasks)
- [ ] Phase 3: Auth/RBAC (15 tasks)
- [ ] Phase 4: Reusable Components (70 tasks)
- [ ] Phase 5: Separation of Concerns (22 tasks)
- [ ] Phase 6: Performance (22 tasks)
- [ ] Phase 7: Localization (39 tasks)
- [ ] Phase 8: Testing/Docs (21 tasks)

---

## Risk Mitigation

### High Risk Tasks

⚠️ **Task 5.3.1-5.3.8** (Component Splitting)
- **Risk:** Breaking existing functionality
- **Mitigation:** Create comprehensive tests before splitting
- **Rollback:** Keep old components until new ones verified

⚠️ **Task 6.2.1-6.2.8** (React Query Migration)
- **Risk:** Data fetching behavior changes
- **Mitigation:** Migrate one feature at a time, thorough testing
- **Rollback:** Feature flags for gradual rollout

⚠️ **Task 7.2.1-7.2.20** (Localization)
- **Risk:** Missing translations breaking UI
- **Mitigation:** Fallback to keys if translation missing
- **Rollback:** Keep original hardcoded strings commented

---

## Success Metrics

### Code Quality

- ✅ 0 explicit `any` types
- ✅ 0 unused imports
- ✅ 0 inline arrow functions in props
- ✅ 100% key props on lists
- ✅ 80%+ test coverage

### Architecture

- ✅ Average component < 200 LOC
- ✅ 0 components > 400 LOC
- ✅ 0 direct API calls in components
- ✅ All auth logic in guards/hooks

### Performance

- ✅ Bundle size reduced 30%+
- ✅ Initial load < 3 seconds
- ✅ Lighthouse score > 90
- ✅ Re-renders minimized

### Localization

- ✅ 100% translation coverage
- ✅ 0 hardcoded user-facing strings
- ✅ All database values localized
- ✅ Language switching works perfectly

### Reusability

- ✅ 5 core reusable components created
- ✅ ~3,600 lines of duplicated code removed
- ✅ Consistent UI/UX across all features
- ✅ Development speed increased 3x

---

**Status:** 📋 Ready to Start  
**Next Action:** Begin Phase 1, Task 1.1.1  
**Review Frequency:** Weekly progress review  
**Completion Target:** 12 weeks from start

