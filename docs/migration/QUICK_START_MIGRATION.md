# 🚀 Booknor Supabase Migration - Quick Start Guide

**Status:** Ready to implement
**Estimated Time:** 10-12 weeks
**Your first task:** Seed the database (30 minutes)

---

## 📚 5 Essential Documents

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **MIGRATION_SUMMARY.md** | Overview & getting started | Start here |
| **IMPLEMENTATION_ROADMAP.md** | Detailed task list & priorities | Daily reference |
| **HOOKS_ARCHITECTURE.md** | Hook patterns & examples | When creating hooks |
| **COMPONENT_REFACTORING_PATTERNS.md** | Refactoring examples | When refactoring components |
| **MOCK_TO_SUPABASE_MIGRATION.md** | Migration strategy | Understanding approach |

---

## ⚡ 3-Step Quick Start (First 30 Minutes)

### Step 1: Seed Your Database (10 minutes)

```bash
# Start Supabase
npx supabase start

# Run seed script
ts-node scripts/seed-database.ts

# Verify (check dashboard)
npx supabase status
# Open the dashboard URL shown and check tables
```

**Expected Result:**
- 2 organizations
- 5 facilities
- 6 zones
- 6 additional services

---

### Step 2: Verify Setup (10 minutes)

```bash
# Check Supabase connection
npm run dev
# Visit http://localhost:5173
# Check browser console for Supabase connection

# Run existing tests to establish baseline
npm run test:e2e:ui
```

---

### Step 3: Start First Refactoring (10 minutes setup)

```bash
# Create hooks directory structure
mkdir -p src/hooks/bookings
mkdir -p src/hooks/facilities
mkdir -p src/hooks/favorites
mkdir -p src/hooks/dashboard

# Create your first hook file
touch src/hooks/bookings/useBookingListPage.ts

# Open HOOKS_ARCHITECTURE.md for pattern reference
# Open COMPONENT_REFACTORING_PATTERNS.md for example code
```

---

## 📅 Week-by-Week Plan

### Week 1: Bookings Page
**Files:** `src/pages/user/Bookings.tsx`
**Effort:** 8-10 days
**Priority:** CRITICAL

**Tasks:**
1. Create `useBookingListPage` hook
2. Create `useBookingFilters` hook
3. Create `useRecurringBookingGroups` hook
4. Enhance `BookingService`
5. Refactor component

**Reference:** `IMPLEMENTATION_ROADMAP.md` Phase 1.1

---

### Week 2: Favorites & Facilities Pages
**Files:**
- `src/pages/user/UserFavorites.tsx`
- `src/pages/user/UserFacilities.tsx`

**Effort:** 12-15 days
**Priority:** HIGH

**Tasks:**
1. Create favorites hooks
2. Create facilities hooks
3. Create services
4. Refactor both pages

**Reference:** `IMPLEMENTATION_ROADMAP.md` Phase 1.2 & 1.3

---

### Week 3: Dashboard Page
**File:** `src/pages/user/UserDashboard.tsx`
**Effort:** 5-7 days
**Priority:** HIGH

**Tasks:**
1. Create dashboard aggregation hooks
2. Extract recommendations logic
3. Simplify component

**Reference:** `IMPLEMENTATION_ROADMAP.md` Phase 1.4

---

### Weeks 4-5: Admin Pages
**Priority:** HIGH
**Reference:** `IMPLEMENTATION_ROADMAP.md` Phase 2

---

### Weeks 6-7: Component Library
**Priority:** MEDIUM
**Reference:** `IMPLEMENTATION_ROADMAP.md` Phase 3

---

### Weeks 8-9: Supporting Components
**Priority:** MEDIUM-LOW
**Reference:** `IMPLEMENTATION_ROADMAP.md` Phase 4

---

### Week 10: Store Removal
**Priority:** HIGH
**Tasks:** Delete 8 Zustand stores, keep 2 transient stores

---

### Week 11: Testing & Validation
**Priority:** CRITICAL
**Tasks:** Run all tests, manual testing, bug fixes

---

### Week 12: Cleanup & Documentation
**Priority:** MEDIUM
**Tasks:** Code cleanup, documentation updates

---

## 🎯 Daily Workflow

### Morning (Plan)
1. Check `IMPLEMENTATION_ROADMAP.md` for today's tasks
2. Review relevant documentation
3. Set up working environment

### During Development (Code)
1. Create hook following `HOOKS_ARCHITECTURE.md` patterns
2. Enhance/create service in `src/services/supabase/`
3. Refactor component following `COMPONENT_REFACTORING_PATTERNS.md`
4. Extract sub-components as needed

### End of Day (Test & Commit)
1. Write unit tests for hooks
2. Write integration tests for services
3. Run E2E tests
4. Commit working code
5. Update progress in `IMPLEMENTATION_ROADMAP.md`

---

## 🔧 Essential Commands

### Development
```bash
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Testing
```bash
npm run test:unit              # Unit tests (hooks, utils)
npm run test:integration       # Integration tests (services)
npm run test:e2e:ui            # E2E tests with UI
npm run test:all               # Run all tests
```

### Database
```bash
npx supabase start             # Start local Supabase
npx supabase stop              # Stop local Supabase
npx supabase status            # Check status & get URLs
npx supabase db reset          # Reset & reseed database
ts-node scripts/seed-database.ts  # Run seed script
```

### Code Quality
```bash
npm run lint                   # Run ESLint
npm run type-check             # TypeScript check
npm run format                 # Format code
```

---

## 📦 File Structure Reference

```
booknor/
├── src/
│   ├── hooks/                     # ← Create custom hooks here
│   │   ├── bookings/
│   │   │   ├── useBookingListPage.ts
│   │   │   ├── useBookingFilters.ts
│   │   │   └── useBookingStats.ts
│   │   ├── facilities/
│   │   ├── favorites/
│   │   └── dashboard/
│   │
│   ├── services/
│   │   └── supabase/              # ← Enhance services here
│   │       ├── bookings.service.ts
│   │       ├── facilities.service.ts
│   │       └── favorites.service.ts
│   │
│   ├── components/                # ← Extract sub-components here
│   │   ├── bookings/
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingList.tsx
│   │   │   └── BookingFilters.tsx
│   │   └── ...
│   │
│   ├── pages/                     # ← Refactor pages here
│   │   ├── user/
│   │   │   ├── Bookings.tsx       # ← 1,546 lines → 50 lines
│   │   │   ├── UserFavorites.tsx
│   │   │   └── UserFacilities.tsx
│   │   └── admin/
│   │
│   └── stores/                    # ← DELETE 8 stores (Phase 5)
│       ├── facilityStore.ts       # DELETE
│       ├── favoritesStore.ts      # DELETE
│       ├── cartStore.ts           # KEEP (transient)
│       └── slotSelectionStore.ts  # KEEP (transient)
│
├── supabase/
│   └── seed.sql                   # ← Seed data (SQL)
│
├── scripts/
│   └── seed-database.ts           # ← Seed data (TypeScript)
│
└── Documentation/
    ├── MIGRATION_SUMMARY.md       # Overview
    ├── IMPLEMENTATION_ROADMAP.md  # Detailed plan
    ├── HOOKS_ARCHITECTURE.md      # Hook patterns
    ├── COMPONENT_REFACTORING_PATTERNS.md  # Examples
    └── QUICK_START_MIGRATION.md   # ← You are here
```

---

## 🎨 Code Template Quick Reference

### Create a Hook
```typescript
// src/hooks/bookings/useBookingListPage.ts
import { useState, useMemo } from 'react';
import { useBookings } from '@/services/supabase/bookings.service';
import { useBookingFilters } from './useBookingFilters';

export function useBookingListPage(userId: string) {
  // 1. Fetch data with React Query
  const { data: bookings, isLoading } = useBookings(userId);

  // 2. UI state
  const [filters, setFilters] = useState({});

  // 3. Business logic
  const filtered = useBookingFilters(bookings, filters);

  // 4. Return everything component needs
  return {
    bookings: filtered,
    filters,
    setFilters,
    isLoading,
  };
}
```

### Refactor a Component
```typescript
// BEFORE (150+ lines with logic)
function Component() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  useEffect(() => { /* fetch */ }, []);
  useEffect(() => { /* filter */ }, [data]);
  // ... more logic
  return <div>{/* JSX */}</div>;
}

// AFTER (30-50 lines, pure UI)
function Component() {
  const { data, filters, setFilters, isLoading } = useComponentPage();

  if (isLoading) return <Loading />;

  return (
    <div>
      <Filters filters={filters} onChange={setFilters} />
      <DataDisplay data={data} />
    </div>
  );
}
```

### Create a Service Method
```typescript
// src/services/supabase/bookings.service.ts
export const bookingsService = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, facility:facilities(*)')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// Export React Query hook
export function useBookings(userId: string) {
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => bookingsService.getByUser(userId),
  });
}
```

---

## ⚠️ Red Flags (When to Ask for Help)

### During Development
- ❌ Hook is over 100 lines → Split into smaller hooks
- ❌ Component is over 100 lines → Extract sub-components
- ❌ Seeing "undefined" errors → Check loading states
- ❌ Tests failing after refactor → Check mock data
- ❌ Performance degradation → Check memoization

### During Testing
- ❌ E2E tests timing out → Check if data is seeded
- ❌ Unit tests failing → Check if mocking Supabase correctly
- ❌ Integration tests failing → Check Supabase connection
- ❌ Real-time not working → Check subscription setup

---

## ✅ Success Indicators

### After Each Component Refactoring
- ✅ Component under 50 lines (excluding JSX)
- ✅ No business logic in component
- ✅ All logic in testable hooks
- ✅ Loading states handled
- ✅ Error states handled
- ✅ Tests passing
- ✅ TypeScript compiles
- ✅ No console errors

### After Each Week
- ✅ All planned components refactored
- ✅ All tests passing
- ✅ Code committed to git
- ✅ Progress updated in roadmap
- ✅ No blocking issues

### After Full Migration
- ✅ All 26 components refactored
- ✅ 8 stores deleted
- ✅ Mock data files deleted
- ✅ 171+ tests passing
- ✅ Performance maintained
- ✅ Documentation updated

---

## 🎯 Your Next Action

**Right now, do this:**

```bash
# 1. Open terminal
cd /path/to/booknor

# 2. Start Supabase
npx supabase start

# 3. Run seed script
ts-node scripts/seed-database.ts

# 4. Verify in browser
# Copy the Studio URL from terminal and open it
# Check that tables have data

# 5. Open your editor
code .

# 6. Open these 3 files side-by-side:
# - IMPLEMENTATION_ROADMAP.md (left)
# - HOOKS_ARCHITECTURE.md (center)
# - src/pages/user/Bookings.tsx (right)

# 7. Start coding!
# Create: src/hooks/bookings/useBookingListPage.ts
```

---

## 💡 Pro Tips

1. **Start small:** Don't refactor the entire component at once. Extract one hook at a time.

2. **Test continuously:** Write tests as you extract logic, not at the end.

3. **Use examples:** Copy-paste from `COMPONENT_REFACTORING_PATTERNS.md` and modify.

4. **Keep it simple:** If a component gets under 50 lines, you're done. Don't over-engineer.

5. **Ask for help early:** If stuck for more than 1 hour, review documentation or seek help.

6. **Commit often:** Commit after each successful hook extraction or component refactor.

7. **Update progress:** Check off tasks in `IMPLEMENTATION_ROADMAP.md` as you complete them.

---

**You're ready! Start with seeding the database. Good luck! 🚀**

---

**Quick Links:**
- 📋 [Full Overview](./MIGRATION_SUMMARY.md)
- 🗺️ [Detailed Roadmap](./IMPLEMENTATION_ROADMAP.md)
- 🎣 [Hook Patterns](./HOOKS_ARCHITECTURE.md)
- 🎨 [Refactoring Examples](./COMPONENT_REFACTORING_PATTERNS.md)
- 📖 [Migration Strategy](./MOCK_TO_SUPABASE_MIGRATION.md)
