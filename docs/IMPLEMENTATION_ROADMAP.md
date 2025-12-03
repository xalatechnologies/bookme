# 🗺️ Supabase Migration Implementation Roadmap

**Project:** Booknor Supabase Integration
**Total Components:** 26
**Total Estimated Effort:** 76-94 days (50-60 with parallel work)
**Last Updated:** October 27, 2025

## 📊 Executive Summary

### Current State Analysis
- **26 components** need refactoring
- **5,209 lines** of code across major pages
- **8 Zustand stores** to remove
- **12 components** depend on `useFacilityStore` alone

### Target State
- All data fetched via Supabase through React Query
- Business logic extracted to custom hooks
- Components reduced to pure UI (under 50 lines each)
- 8 stores removed, only 2 transient stores remaining

### Critical Path
1. Seed Supabase database
2. Refactor critical pages (Bookings, Favorites, Facilities)
3. Extract shared logic to hooks
4. Migrate component library
5. Remove Zustand stores
6. Final testing and cleanup

---

## 🎯 Phase Breakdown

### Phase 0: Foundation (Week 0)
**Status:** ⏳ Ready to Start
**Dependencies:** None

#### Tasks:
- [x] Create seed data files (SQL + TypeScript)
- [x] Document migration strategy
- [x] Document hooks architecture
- [x] Document component patterns
- [x] Analyze codebase and identify components
- [ ] **Run seed scripts** to populate Supabase
- [ ] Verify seed data in Supabase dashboard
- [ ] Set up development environment
- [ ] Configure .env with Supabase credentials

#### Deliverables:
- ✅ `supabase/seed.sql`
- ✅ `scripts/seed-database.ts`
- ✅ `MOCK_TO_SUPABASE_MIGRATION.md`
- ✅ `HOOKS_ARCHITECTURE.md`
- ✅ `COMPONENT_REFACTORING_PATTERNS.md`
- ✅ `IMPLEMENTATION_ROADMAP.md` (this file)
- ⏳ Seeded Supabase database

---

### Phase 1: Critical Pages (Weeks 1-3)
**Status:** 🔴 Not Started
**Estimated Effort:** 20-25 days
**Priority:** CRITICAL

These pages have the most business logic and user impact. Start here.

#### 1.1 Bookings Page Refactoring (8-10 days)
**File:** `src/pages/user/Bookings.tsx` (1,546 lines, 43 hooks)

**Current State:**
- Uses `useRecurringBookingStore`, `useGroupStore`
- Complex filtering, sorting, grouping logic
- localStorage persistence
- 43 hooks in one component

**Target State:**
```typescript
// Simplified component
export function Bookings() {
  const {
    bookings,
    recurringGroups,
    filters,
    stats,
    isLoading,
    setFilters,
    handleEdit,
    handleDelete,
  } = useBookingListPage(userId);

  return (
    <div>
      <BookingStats stats={stats} />
      <BookingFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading /> : (
        <BookingList
          bookings={bookings}
          recurringGroups={recurringGroups}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
```

**Hooks to Create:**
- [ ] `useBookingListPage(userId)` - Main page orchestration
- [ ] `useBookingFilters(bookings, filters)` - Filter logic
- [ ] `useRecurringBookingGroups(bookings)` - Group recurring bookings
- [ ] `useBookingStats(bookings)` - Calculate statistics
- [ ] `useBookingActions()` - Edit, delete, share actions

**Services to Create:**
- [ ] `BookingService.getByUser(userId)` - Fetch user bookings
- [ ] `BookingService.update(id, data)` - Update booking
- [ ] `BookingService.delete(id)` - Delete booking
- [ ] `BookingService.checkAvailability()` - Check slot availability

**Components to Extract:**
- [ ] `BookingFilters` - Filter UI
- [ ] `BookingList` - List rendering
- [ ] `BookingCard` - Individual booking
- [ ] `RecurringBookingGroup` - Grouped display
- [ ] `BookingEditModal` - Edit dialog
- [ ] `BookingStats` - Statistics dashboard

**Testing:**
- [ ] Unit tests for `useBookingFilters`
- [ ] Unit tests for `useRecurringBookingGroups`
- [ ] Unit tests for `useBookingStats`
- [ ] Integration tests for BookingService
- [ ] E2E tests for booking management flow

---

#### 1.2 User Favorites Page Refactoring (6-8 days)
**File:** `src/pages/user/UserFavorites.tsx` (597 lines)

**Current State:**
- Uses `useFacilityStore`, `useFavoritesStore`
- Complex multi-filter system (7 filters)
- 7 sort options
- Availability simulation
- Usage tracking

**Target State:**
```typescript
export function UserFavorites() {
  const {
    facilities,
    filters,
    sortBy,
    view,
    stats,
    setFilters,
    setSortBy,
    setView,
  } = useFavoritesPage(userId);

  return (
    <PageLayout>
      <FavoritesHeader stats={stats} view={view} onViewChange={setView} />
      <FacilityFilters filters={filters} onChange={setFilters} sortBy={sortBy} onSortChange={setSortBy} />
      <FacilityGrid facilities={facilities} view={view} />
    </PageLayout>
  );
}
```

**Hooks to Create:**
- [ ] `useFavoritesPage(userId)` - Main orchestration
- [ ] `useFavoriteFilters(facilities, filters)` - Multi-criteria filtering
- [ ] `useFacilitySorting(facilities, sortBy)` - Sort logic
- [ ] `useFavoriteTracking(facilityId)` - Usage tracking
- [ ] `useFavoriteStats(favorites)` - Calculate stats

**Services to Create:**
- [ ] `FavoritesService.getByUser(userId)` - Fetch favorites
- [ ] `FavoritesService.add(facilityId)` - Add favorite
- [ ] `FavoritesService.remove(facilityId)` - Remove favorite
- [ ] `FavoritesService.trackVisit(facilityId)` - Track usage

**Testing:**
- [ ] Unit tests for filter logic
- [ ] Unit tests for sort logic
- [ ] Integration tests for FavoritesService
- [ ] E2E tests for favorites management

---

#### 1.3 User Facilities Page Refactoring (6-8 days)
**File:** `src/pages/user/UserFacilities.tsx` (305 lines)

**Current State:**
- Uses `useFacilityStore`, `useFavoritesStore`
- Real-time availability calculation
- Complex filtering (search, type, availability)
- View mode management (grid/list/map)

**Target State:**
```typescript
export function UserFacilities() {
  const {
    facilities,
    filters,
    view,
    isLoading,
    setFilters,
    setView,
  } = useFacilityBrowsePage(orgId);

  return (
    <div>
      <SearchBar value={filters.search} onChange={(s) => setFilters({ ...filters, search: s })} />
      <FacilityFilters filters={filters} onChange={setFilters} />
      <ViewToggle view={view} onChange={setView} />
      {isLoading ? <Loading /> : (
        <FacilityDisplay facilities={facilities} view={view} />
      )}
    </div>
  );
}
```

**Hooks to Create:**
- [ ] `useFacilityBrowsePage(orgId)` - Main orchestration
- [ ] `useFacilityFilters(facilities, filters)` - Filter logic
- [ ] `useFacilityAvailability(facilityId, date)` - Availability check
- [ ] `useFacilitySearch(facilities, query)` - Search logic

**Services to Update:**
- [ ] `FacilitiesService.getPublished(orgId)` - Already exists, verify
- [ ] `FacilitiesService.checkAvailability(id, date)` - Add if missing

**Testing:**
- [ ] Unit tests for filters
- [ ] Unit tests for availability calculation
- [ ] E2E tests for facility browsing

---

#### 1.4 User Dashboard Refactoring (5-7 days)
**File:** `src/pages/user/UserDashboard.tsx` (666 lines)

**Current State:**
- Uses `useFacilityStore`
- Weather simulation
- Message filtering
- Booking progress calculation

**Target State:**
```typescript
export function UserDashboard() {
  const {
    nextBooking,
    recommendations,
    recentMessages,
    stats,
    isLoading,
  } = useUserDashboard(userId);

  return (
    <DashboardLayout>
      <NextBookingCard booking={nextBooking} />
      <DashboardStats stats={stats} />
      <RecommendationsSection facilities={recommendations} />
      <RecentMessagesSection messages={recentMessages} />
    </DashboardLayout>
  );
}
```

**Hooks to Create:**
- [ ] `useUserDashboard(userId)` - Main orchestration
- [ ] `useNextBooking(userId)` - Get upcoming booking
- [ ] `useFacilityRecommendations(userId)` - Get recommendations
- [ ] `useRecentMessages(userId)` - Get recent messages
- [ ] `useDashboardStats(userId)` - Calculate stats

**Testing:**
- [ ] Unit tests for dashboard hooks
- [ ] Integration tests for data aggregation
- [ ] E2E tests for dashboard

**Phase 1 Summary:**
- ✅ 4 critical pages refactored
- ✅ Major Zustand stores (facility, favorites, booking) replaced
- ✅ Foundational hooks created
- ✅ Core business logic extracted

---

### Phase 2: Admin Pages (Weeks 4-5)
**Status:** 🔴 Not Started
**Estimated Effort:** 12-15 days
**Priority:** HIGH

#### 2.1 Admin Bookings Page (6-8 days)
**File:** `src/pages/admin/BookingsPage.tsx` (150+ lines, complex)

**Current State:**
- Uses `useSupportStore`
- KPI calculations
- Approval workflow
- Bulk operations

**Hooks to Create:**
- [ ] `useAdminBookingsPage(orgId)`
- [ ] `useBookingApprovalWorkflow()`
- [ ] `useBookingKPIs(bookings)`
- [ ] `useBulkBookingActions()`

**Services to Create:**
- [ ] `AdminBookingService.approve(id)`
- [ ] `AdminBookingService.reject(id)`
- [ ] `AdminBookingService.bulkUpdate(ids, action)`

---

#### 2.2 Admin Facilities Page (5-7 days)
**File:** `src/pages/admin/FacilitiesPage.tsx` (200+ lines)

**Current State:**
- Uses `useFacilityStore`
- Batch operations
- Status transitions
- Facility duplication

**Hooks to Create:**
- [ ] `useAdminFacilitiesPage(orgId)`
- [ ] `useFacilityBatchActions()`
- [ ] `useFacilityStatusTransitions()`

**Services to Create:**
- [ ] `AdminFacilityService.bulkUpdate(ids, action)`
- [ ] `AdminFacilityService.duplicate(id)`
- [ ] `AdminFacilityService.changeStatus(id, status)`

---

### Phase 3: Component Library (Weeks 6-7)
**Status:** 🔴 Not Started
**Estimated Effort:** 10-14 days
**Priority:** MEDIUM

#### 3.1 Messaging Components (5-7 days)
**Files:**
- `src/components/messaging/MessageInbox.tsx` (330 lines)
- `src/components/messaging/MessageThread.tsx` (571 lines)

**Hooks to Create:**
- [ ] `useMessageInbox(userId)`
- [ ] `useMessageThread(threadId)`
- [ ] `useMessageFilters(messages, filters)`
- [ ] `useUnreadCount(userId)`

**Services to Create:**
- [ ] `MessageService.getByUser(userId)`
- [ ] `MessageService.getThread(threadId)`
- [ ] `MessageService.markAsRead(messageId)`
- [ ] `MessageService.sendMessage(threadId, content)`

---

#### 3.2 Group Components (5-7 days)
**Files:**
- `src/components/group/GroupBookingFlow.tsx` (491 lines)
- `src/components/group/GroupManagementCard.tsx` (485 lines)

**Hooks to Create:**
- [ ] `useGroupBookingFlow(facilityId)`
- [ ] `useGroupManagement(groupId)`
- [ ] `useGroupMembers(groupId)`

**Services to Create:**
- [ ] `GroupService.create(data)`
- [ ] `GroupService.update(id, data)`
- [ ] `GroupService.addMember(groupId, userId)`
- [ ] `GroupService.removeMember(groupId, userId)`

---

### Phase 4: Supporting Components (Weeks 8-9)
**Status:** 🔴 Not Started
**Estimated Effort:** 16-20 days
**Priority:** MEDIUM-LOW

#### 4.1 Facility Display Components (8-10 days)
**Components:**
- FacilityCard (admin/user variants)
- FacilityGrid
- FacilityListItem
- MapView
- InfiniteScrollFacilities

**Tasks:**
- [ ] Extract shared facility display logic
- [ ] Create `useFacilityCard` hook
- [ ] Migrate MapView to use Supabase data
- [ ] Update infinite scroll to use React Query

---

#### 4.2 Facility Detail Components (4-5 days)
**Components:**
- FacilityInfoTabs
- FacilityDetailLayout
- FacilityDetailHeader
- FacilityContactInfo

**Tasks:**
- [ ] Extract zone display logic
- [ ] Create `useFacilityDetail` hook
- [ ] Migrate tabs to use Supabase zones

---

#### 4.3 Utility Components (4-5 days)
**Components:**
- GlobalSearch
- SupportTicketList
- Various modals

**Tasks:**
- [ ] Extract search logic
- [ ] Create `useGlobalSearch` hook
- [ ] Migrate support to Supabase

---

### Phase 5: Store Removal (Week 10)
**Status:** 🔴 Not Started
**Estimated Effort:** 3-5 days
**Priority:** HIGH

#### Tasks:
- [ ] Verify all components migrated from `useFacilityStore`
- [ ] Verify all components migrated from `useFavoritesStore`
- [ ] Delete `facilityStore.ts`
- [ ] Delete `favoritesStore.ts`
- [ ] Delete `messageStore.ts`
- [ ] Delete `groupStore.ts`
- [ ] Delete `supportStore.ts`
- [ ] Delete `recurringBookingStore.ts`
- [ ] Delete `fieldConfigStore.ts`
- [ ] Keep `cartStore.ts` (transient state)
- [ ] Keep `slotSelectionStore.ts` (transient state)
- [ ] Delete mock data files:
  - `src/data/coreFacilities.ts`
  - `src/data/zones/dummyZones.ts`
  - `src/data/bookings/dummyBookings.ts`
  - `src/data/additionalServices/dummyServices.ts`

---

### Phase 6: Testing & Validation (Week 11)
**Status:** 🔴 Not Started
**Estimated Effort:** 5-7 days
**Priority:** CRITICAL

#### Tasks:
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run all E2E tests
- [ ] Manual testing of all user workflows:
  - [ ] User registration/login
  - [ ] Facility browsing and filtering
  - [ ] Booking creation and management
  - [ ] Favorites management
  - [ ] Message sending/receiving
  - [ ] Group booking creation
  - [ ] Admin approval workflows
  - [ ] Support ticket management
- [ ] Performance testing
- [ ] Load testing with real Supabase
- [ ] Fix any bugs found
- [ ] Update documentation

---

### Phase 7: Cleanup & Documentation (Week 12)
**Status:** 🔴 Not Started
**Estimated Effort:** 3-5 days
**Priority:** MEDIUM

#### Tasks:
- [ ] Remove all unused imports
- [ ] Remove all commented-out code
- [ ] Update README.md
- [ ] Update API documentation
- [ ] Create deployment guide
- [ ] Update environment variable documentation
- [ ] Code review and optimization
- [ ] Create handoff documentation

---

## 📦 Hook Library to Create

### Core Hooks (Week 1-2)
- [ ] `useBookingListPage(userId)` - Booking management
- [ ] `useBookingFilters(bookings, filters)` - Filter logic
- [ ] `useRecurringBookingGroups(bookings)` - Recurring grouping
- [ ] `useBookingStats(bookings)` - Statistics
- [ ] `useFavoritesPage(userId)` - Favorites page
- [ ] `useFavoriteFilters(facilities, filters)` - Favorite filtering
- [ ] `useFacilityBrowsePage(orgId)` - Facility browsing
- [ ] `useFacilityAvailability(facilityId)` - Availability

### Admin Hooks (Week 4-5)
- [ ] `useAdminBookingsPage(orgId)` - Admin booking management
- [ ] `useBookingApprovalWorkflow()` - Approval workflow
- [ ] `useAdminFacilitiesPage(orgId)` - Admin facility management
- [ ] `useFacilityBatchActions()` - Batch operations

### Messaging Hooks (Week 6)
- [ ] `useMessageInbox(userId)` - Message inbox
- [ ] `useMessageThread(threadId)` - Thread display
- [ ] `useMessageFilters(messages, filters)` - Message filtering

### Group Hooks (Week 7)
- [ ] `useGroupBookingFlow(facilityId)` - Group booking wizard
- [ ] `useGroupManagement(groupId)` - Group CRUD

### Utility Hooks (Week 8-9)
- [ ] `useGlobalSearch(query)` - Multi-entity search
- [ ] `useFacilityCard(facilityId)` - Card display logic
- [ ] `useFacilityDetail(facilityId)` - Detail page logic

---

## 🔧 Service Layer to Create

### Core Services (Week 1-3)
```typescript
// src/services/supabase/bookings.service.ts
export const BookingService = {
  getByUser: (userId: string) => {...},
  create: (data: BookingData) => {...},
  update: (id: string, data: Partial<BookingData>) => {...},
  delete: (id: string) => {...},
  checkAvailability: (facilityId, startTime, endTime) => {...},
};

// src/services/supabase/favorites.service.ts
export const FavoritesService = {
  getByUser: (userId: string) => {...},
  add: (userId: string, facilityId: string) => {...},
  remove: (userId: string, facilityId: string) => {...},
  trackVisit: (userId: string, facilityId: string) => {...},
};

// src/services/supabase/facilities.service.ts (enhance existing)
export const FacilitiesService = {
  // Existing methods...
  getPublished: (orgId: string) => {...},
  checkAvailability: (id: string, date: Date) => {...},
  getRecommendations: (userId: string) => {...},
};
```

### Admin Services (Week 4-5)
```typescript
// src/services/supabase/admin/bookings.service.ts
export const AdminBookingService = {
  approve: (id: string) => {...},
  reject: (id: string, reason: string) => {...},
  bulkUpdate: (ids: string[], action: string) => {...},
  getKPIs: (orgId: string, dateRange) => {...},
};

// src/services/supabase/admin/facilities.service.ts
export const AdminFacilityService = {
  bulkUpdate: (ids: string[], updates) => {...},
  duplicate: (id: string) => {...},
  changeStatus: (id: string, status: string) => {...},
};
```

### Messaging Services (Week 6)
```typescript
// src/services/supabase/messages.service.ts
export const MessageService = {
  getByUser: (userId: string) => {...},
  getThread: (threadId: string) => {...},
  sendMessage: (threadId, content) => {...},
  markAsRead: (messageId: string) => {...},
  createThread: (data: ThreadData) => {...},
};
```

### Group Services (Week 7)
```typescript
// src/services/supabase/groups.service.ts
export const GroupService = {
  create: (data: GroupData) => {...},
  update: (id: string, data) => {...},
  delete: (id: string) => {...},
  addMember: (groupId, userId) => {...},
  removeMember: (groupId, userId) => {...},
  getMembers: (groupId: string) => {...},
};
```

---

## 🧪 Testing Strategy

### Unit Tests (Throughout Implementation)
- Test each custom hook in isolation
- Test utility functions
- Test filter/sort logic
- Mock Supabase calls

### Integration Tests (Week 11)
- Test service layer with real Supabase (test database)
- Test React Query integration
- Test real-time subscriptions
- Test Row Level Security

### E2E Tests (Week 11)
- Use existing Playwright tests (171+ tests already created)
- Update tests to work with Supabase data
- Add new tests for refactored flows
- Test critical user workflows end-to-end

---

## 📊 Progress Tracking

### Overall Progress: 6/35 tasks completed (17%)

#### Foundation ✅ (6/6 completed)
- [x] Create seed data files
- [x] Document migration strategy
- [x] Document hooks architecture
- [x] Document component patterns
- [x] Analyze codebase
- [x] Create implementation roadmap

#### Database Setup ⏳ (0/2 completed)
- [ ] Run seed scripts
- [ ] Verify seed data

#### Phase 1: Critical Pages 🔴 (0/20 completed)
- [ ] Bookings page (0/8)
- [ ] Favorites page (0/5)
- [ ] Facilities page (0/4)
- [ ] Dashboard page (0/3)

#### Phase 2: Admin Pages 🔴 (0/8 completed)
- [ ] Admin bookings (0/4)
- [ ] Admin facilities (0/4)

#### Phase 3: Component Library 🔴 (0/8 completed)
- [ ] Messaging components (0/4)
- [ ] Group components (0/4)

#### Phase 4: Supporting Components 🔴 (0/12 completed)
- [ ] Facility display (0/5)
- [ ] Facility detail (0/4)
- [ ] Utility components (0/3)

#### Phase 5: Store Removal 🔴 (0/12 completed)

#### Phase 6: Testing 🔴 (0/10 completed)

#### Phase 7: Cleanup 🔴 (0/8 completed)

---

## 🚀 Quick Start (Next 7 Days)

### Day 1: Database Setup
```bash
# Run seed script
ts-node scripts/seed-database.ts

# Verify data
npx supabase start
# Check dashboard at http://localhost:54323
```

### Days 2-3: Start Bookings Page
1. Create `hooks/bookings/useBookingListPage.ts`
2. Create `hooks/bookings/useBookingFilters.ts`
3. Create `services/supabase/bookings.service.ts`
4. Start refactoring `Bookings.tsx`

### Days 4-5: Continue Bookings
1. Create `hooks/bookings/useRecurringBookingGroups.ts`
2. Create `hooks/bookings/useBookingStats.ts`
3. Extract components (BookingCard, BookingList, etc.)
4. Test refactored booking page

### Days 6-7: Start Favorites Page
1. Create `hooks/favorites/useFavoritesPage.ts`
2. Create `hooks/favorites/useFavoriteFilters.ts`
3. Create `services/supabase/favorites.service.ts`
4. Start refactoring `UserFavorites.tsx`

---

## 📞 Support & Resources

- **Architecture Docs:** `HOOKS_ARCHITECTURE.md`, `COMPONENT_REFACTORING_PATTERNS.md`
- **Migration Guide:** `MOCK_TO_SUPABASE_MIGRATION.md`
- **Testing Guide:** `README_TESTING.md`
- **Supabase Docs:** https://supabase.com/docs
- **React Query Docs:** https://tanstack.com/query/latest

---

## ⚠️ Critical Success Factors

1. **Seed database first** - Nothing works without data
2. **Start with critical pages** - Highest impact first
3. **Test continuously** - Don't accumulate technical debt
4. **Extract shared logic early** - Reduce duplication
5. **Keep components simple** - Under 50 lines each
6. **Document as you go** - Update hook documentation
7. **Parallel work** - Independent components can be done simultaneously

---

**Status:** 📋 Planning Complete - Ready to implement
**Next Step:** Run seed scripts and start Phase 1

Good luck! 🚀
