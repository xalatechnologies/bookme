# 🔄 Mock Data to Supabase Migration Guide

Complete guide for migrating from mock data to Supabase database with proper architecture.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Migration Strategy](#migration-strategy)
3. [Seed Data Setup](#seed-data-setup)
4. [Component Refactoring](#component-refactoring)
5. [State Management Migration](#state-management-migration)
6. [Step-by-Step Implementation](#step-by-step-implementation)
7. [Testing Strategy](#testing-strategy)

## 🎯 Overview

### Current State
- **Mock data files**: 7 files (~650 lines)
- **Zustand stores**: 10 stores (8 need removal)
- **Components**: Business logic mixed with UI
- **Data flow**: Mock data → Zustand store → Components

### Target State
- **Database**: Supabase PostgreSQL
- **State**: React Query for server state
- **Components**: Pure UI logic only
- **Data flow**: Supabase → React Query → Hooks → Components

## 🗺️ Migration Strategy

### Phase 1: Seed Data Setup (Week 1)
1. Convert mock data to Supabase seed files
2. Run migrations and seed data
3. Verify data in Supabase dashboard
4. Create backup of existing data

### Phase 2: Service Layer (Week 2)
1. Update existing Supabase services
2. Add missing CRUD operations
3. Create React Query hooks
4. Test all services independently

### Phase 3: Remove Zustand Stores (Weeks 3-4)
1. Replace facility store with React Query
2. Replace zone store with React Query
3. Replace message/support stores
4. Remove all data-bearing stores
5. Keep cart & slot selection stores (transient state)

### Phase 4: Refactor Components (Weeks 5-6)
1. Separate business logic into hooks
2. Make components pure UI
3. Move filtering/sorting to hooks
4. Update all imports

### Phase 5: Testing & Validation (Week 7)
1. Run integration tests
2. Test all user workflows
3. Verify data integrity
4. Performance testing

### Phase 6: Cleanup (Week 8)
1. Delete mock data files
2. Remove unused Zustand stores
3. Update documentation
4. Code review and optimization

## 🌱 Seed Data Setup

### Option 1: SQL Seed File

```bash
# Run the SQL seed file
psql -d your_database < supabase/seed.sql

# Or through Supabase CLI
supabase db reset  # Resets and runs migrations + seed
```

### Option 2: TypeScript Seed Script

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run the seed script
SUPABASE_URL=your_url SUPABASE_KEY=your_key ts-node scripts/seed-database.ts

# Or with local Supabase
npx supabase start
ts-node scripts/seed-database.ts
```

### Seed Data Includes

- **2 Organizations** (Drammen Kommune + Demo Org)
- **5 Facilities** (Sports halls, conference rooms, etc.)
- **6 Zones** (Different areas within facilities)
- **6 Additional Services** (Equipment, catering, staff, etc.)

## 🔧 Component Refactoring

### Before: Mixed Concerns

```typescript
// ❌ BAD: Business logic in component
function FacilitiesPage() {
  const facilities = useFacilityStore(state => state.facilities);
  const [filtered, setFiltered] = useState(facilities);

  useEffect(() => {
    // Business logic in component
    const result = facilities
      .filter(f => f.type === selectedType)
      .filter(f => f.pricePerHour <= maxPrice)
      .sort((a, b) => a.pricePerHour - b.pricePerHour);
    setFiltered(result);
  }, [facilities, selectedType, maxPrice]);

  return <div>{/* UI */}</div>;
}
```

### After: Separated Concerns

```typescript
// ✅ GOOD: Business logic in hook
function useFacilities(filters: FacilityFilters) {
  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities', filters],
    queryFn: () => facilitiesService.getAll(filters.orgId),
  });

  // Business logic in hook
  const filtered = useMemo(() => {
    if (!facilities) return [];
    return facilities
      .filter(f => !filters.type || f.type === filters.type)
      .filter(f => !filters.maxPrice || f.price_per_hour <= filters.maxPrice)
      .sort((a, b) => {
        if (filters.sort === 'price-asc') return a.price_per_hour - b.price_per_hour;
        return 0;
      });
  }, [facilities, filters]);

  return { facilities: filtered, isLoading };
}

// ✅ GOOD: Component only handles UI
function FacilitiesPage() {
  const [filters, setFilters] = useState<FacilityFilters>({});
  const { facilities, isLoading } = useFacilities(filters);

  return (
    <div>
      <FacilityFilters filters={filters} onFilterChange={setFilters} />
      <FacilityList facilities={facilities} isLoading={isLoading} />
    </div>
  );
}
```

## 🔄 State Management Migration

### Zustand Stores to Remove

```typescript
// ❌ DELETE: These duplicate Supabase data
facilityStore.ts       → Use useFacilities() from React Query
zoneStore.ts          → Use useZones() from React Query
messageStore.ts       → Use useMessages() from React Query
groupStore.ts         → Use useGroupBookings() from React Query
supportStore.ts       → Use useSupportTickets() from React Query
recurringBookingStore → Use useRecurringBookings() from React Query
favoritesStore.ts     → Use useFavorites() from React Query
fieldConfigStore.ts   → Move to database or config file
```

### Zustand Stores to Keep

```typescript
// ✅ KEEP: These are truly transient UI state
cartStore.ts           → Shopping cart (not persisted)
slotSelectionStore.ts  → Selected time slots (booking flow)
```

### Migration Pattern

```typescript
// Before: Zustand store
import { useFacilityStore } from '@/stores/facilityStore';

function Component() {
  const facilities = useFacilityStore(state => state.facilities);
  const fetchFacilities = useFacilityStore(state => state.fetchFacilities);

  useEffect(() => {
    fetchFacilities();
  }, []);

  // ...
}

// After: React Query
import { useFacilities } from '@/services/supabase/facilities.service';

function Component() {
  const { data: facilities, isLoading } = useFacilities('org-id');

  // No manual fetching needed - React Query handles it
  // ...
}
```

## 📝 Step-by-Step Implementation

### Step 1: Seed the Database

```bash
# Start Supabase locally
npx supabase start

# Run seed script
ts-node scripts/seed-database.ts

# Verify in Supabase dashboard
npx supabase status  # Get dashboard URL
```

### Step 2: Update One Component

Pick a simple component to start with (e.g., FacilityList):

```typescript
// 1. Remove Zustand import
- import { useFacilityStore } from '@/stores/facilityStore';

// 2. Add React Query hook
+ import { useFacilities } from '@/services/supabase/facilities.service';

// 3. Update data fetching
function FacilityList() {
-  const facilities = useFacilityStore(state => state.facilities);
+  const { data: facilities, isLoading, error } = useFacilities('org-id');

+  if (isLoading) return <Loading />;
+  if (error) return <Error message={error.message} />;

  return <div>{/* render facilities */}</div>;
}
```

### Step 3: Extract Business Logic to Hook

```typescript
// Create new hook: hooks/useFacilityFilters.ts
export function useFacilityFilters(
  facilities: Facility[] | undefined,
  filters: FacilityFilters
) {
  return useMemo(() => {
    if (!facilities) return [];

    let result = facilities;

    // Apply type filter
    if (filters.type) {
      result = result.filter(f => f.type === filters.type);
    }

    // Apply price filter
    if (filters.maxPrice) {
      result = result.filter(f => f.price_per_hour <= filters.maxPrice);
    }

    // Apply sorting
    if (filters.sort === 'price-asc') {
      result = result.sort((a, b) => a.price_per_hour - b.price_per_hour);
    }

    return result;
  }, [facilities, filters]);
}

// Use in component
function FacilitiesPage() {
  const [filters, setFilters] = useState<FacilityFilters>({});
  const { data: facilities } = useFacilities('org-id');
  const filtered = useFacilityFilters(facilities, filters);

  return <FacilityList facilities={filtered} />;
}
```

### Step 4: Remove Mock Data File

```bash
# After verifying component works with Supabase
git rm src/data/coreFacilities.ts
git commit -m "Remove coreFacilities mock data (now using Supabase)"
```

### Step 5: Remove Zustand Store

```bash
# After all components updated
git rm src/stores/facilityStore.ts
git commit -m "Remove facilityStore (replaced with React Query)"
```

### Step 6: Repeat for Each Feature

1. Facilities ✅
2. Zones
3. Bookings
4. Messages
5. Support
6. Notifications
7. Groups
8. Recurring bookings

## 🧪 Testing Strategy

### 1. Unit Tests (hooks)

```typescript
// hooks/__tests__/useFacilityFilters.test.ts
import { renderHook } from '@testing-library/react';
import { useFacilityFilters } from '../useFacilityFilters';

describe('useFacilityFilters', () => {
  it('filters by type', () => {
    const facilities = [
      { id: '1', type: 'sports', price_per_hour: 100 },
      { id: '2', type: 'conference', price_per_hour: 200 },
    ];

    const { result } = renderHook(() =>
      useFacilityFilters(facilities, { type: 'sports' })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe('sports');
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/facilities.test.ts
import { facilitiesService } from '@/services/supabase/facilities.service';

describe('Facilities Service', () => {
  it('fetches facilities from Supabase', async () => {
    const facilities = await facilitiesService.getAll('org-id');

    expect(facilities).toBeDefined();
    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities[0]).toHaveProperty('name');
  });
});
```

### 3. E2E Tests

Use the existing Playwright tests - they should work with real Supabase data!

```bash
# Run E2E tests against seeded database
npm run test:e2e
```

## 📊 Progress Tracking

### Completion Checklist

- [ ] **Phase 1: Seed Data**
  - [ ] Run SQL seed file
  - [ ] Run TypeScript seed script
  - [ ] Verify data in Supabase dashboard
  - [ ] Test data retrieval via API

- [ ] **Phase 2: Facilities**
  - [ ] Update FacilitiesPage component
  - [ ] Extract filtering logic to hook
  - [ ] Remove facilityStore
  - [ ] Delete coreFacilities.ts
  - [ ] Test all facility features

- [ ] **Phase 3: Zones**
  - [ ] Update zone-related components
  - [ ] Remove zoneStore
  - [ ] Delete dummyZones.ts
  - [ ] Test zone selection

- [ ] **Phase 4: Bookings**
  - [ ] Update booking components
  - [ ] Extract booking logic
  - [ ] Delete dummyBookings.ts
  - [ ] Test booking flow

- [ ] **Phase 5: Other Features**
  - [ ] Messages → Supabase
  - [ ] Support tickets → Supabase
  - [ ] Groups → Supabase
  - [ ] Recurring bookings → Supabase
  - [ ] Favorites → Supabase

- [ ] **Phase 6: Cleanup**
  - [ ] Delete all mock data files
  - [ ] Remove unused Zustand stores
  - [ ] Update imports across codebase
  - [ ] Run full test suite
  - [ ] Update documentation

## 🎯 Success Criteria

- ✅ All mock data files deleted
- ✅ 8 Zustand stores removed (keep cart + slot selection)
- ✅ All components use React Query hooks
- ✅ Business logic extracted to custom hooks
- ✅ All tests passing
- ✅ No console errors in production
- ✅ Performance metrics maintained or improved

## 📚 Additional Resources

- [REFACTOR_ANALYSIS.md](./REFACTOR_ANALYSIS.md) - Detailed analysis
- [Supabase Services Documentation](./src/services/supabase/README.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Testing Guide](./TESTING_README.md)

## 🆘 Common Issues

### Issue: Seed script fails

**Solution:**
```bash
# Ensure Supabase is running
npx supabase status

# Check connection string
echo $SUPABASE_URL

# Try with explicit environment variables
SUPABASE_URL=http://localhost:54321 ts-node scripts/seed-database.ts
```

### Issue: Components still showing mock data

**Solution:**
1. Clear browser cache
2. Check that seed script completed
3. Verify Supabase connection in browser console
4. Check React Query DevTools

### Issue: Type errors after migration

**Solution:**
```typescript
// Update type imports
- import { Facility } from '@/data/coreFacilities';
+ import { Database } from '@/types/database';
+ type Facility = Database['public']['Tables']['facilities']['Row'];
```

## 💡 Best Practices

1. **One feature at a time** - Don't migrate everything at once
2. **Test after each change** - Ensure nothing breaks
3. **Keep mock data temporarily** - Delete only after confirming Supabase works
4. **Use React Query DevTools** - Monitor cache and queries
5. **Handle loading states** - Always show loading indicators
6. **Handle errors gracefully** - Show user-friendly error messages

## 🎉 Next Steps

Once migration is complete:
1. Deploy seeded database to production
2. Run performance testing
3. Monitor error rates
4. Collect user feedback
5. Optimize based on metrics

---

**Ready to start?** Begin with [Step 1: Seed the Database](#step-1-seed-the-database)
