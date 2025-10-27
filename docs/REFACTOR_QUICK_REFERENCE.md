# BookMe Refactoring: Quick Reference Guide

## TL;DR - What Needs to Change

### Files to DELETE (7 files, ~1,022 lines)
```
❌ /src/data/coreFacilities.ts
❌ /src/data/zones/dummyZones.ts  
❌ /src/data/bookings/dummyBookings.ts
❌ /src/data/additionalServices/dummyServices.ts
❌ /src/data/admin/dashboardData.ts
❌ /src/data/admin/trendData.ts
❌ /src/data/admin/facilitiesData.ts
```

### Stores to CONVERT to React Query (8 stores)
```
facilityStore        → useFacilities() + useAdminFacilities()
zoneStore            → useZones() + useAdminZones()
messageStore         → useMessages() + useThreads()
groupStore           → useGroups() + useGroupInvitations()
supportStore         → useSupportTickets()
recurringBookingStore → useRecurringBookings()
favoritesStore       → useFavorites()
fieldConfigStore     → useFieldConfigs()
```

### Stores to KEEP (use as-is)
```
✓ cartStore - For transient booking items (good candidate)
✓ slotSelectionStore - For UI-only time slot selection
```

### Components to REFACTOR (10+)
```
Priority 1:
- /src/pages/admin/FacilitiesPage.tsx (200+ lines, heavy filtering)
- /src/pages/user/Bookings.tsx (150+ lines, heavy filtering)
- /src/pages/user/UserDashboard.tsx (mixed concerns)

Priority 2:
- /src/components/booking/BookingForm.tsx (validation logic)
- /src/components/admin/facilities/FacilityEditForm.tsx
- /src/pages/admin/BookingsPage.tsx
- /src/pages/admin/AuditLogPage.tsx

All admin pages using direct store access
```

### Hooks to UPDATE/CREATE (5 new)
```
NEW:
+ /src/hooks/useFacilitiesWithFilters.ts
+ /src/hooks/useDashboardData.ts
+ /src/hooks/useBookingFilters.ts
+ /src/utils/filterUtils.ts
+ /src/utils/sortUtils.ts

UPDATE:
~ /src/hooks/useZones.ts (replace with React Query)
~ /src/hooks/useFacility.ts (replace with React Query)
~ /src/hooks/useHistory.ts (migrate fully)
```

---

## Pattern Changes

### BEFORE: Mock Data + Store Pattern
```typescript
// Component uses Zustand store with mock data
const { getFacilityById } = useFacilityStore();
const facility = getFacilityById(id); // Returns mock data or store data
```

### AFTER: React Query Pattern
```typescript
// Component uses React Query hook with Supabase
const { data: facility, isLoading, error } = useFacility(id);
// Automatically fetches from Supabase, caches, syncs in real-time
```

---

## Key Statistics

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Mock Data Files | 7 | 0 | -7 (-100%) |
| Zustand Stores | 10 | 2 | -8 (-80%) |
| Data Fetching Patterns | 3 (mixed) | 1 (React Query) | Unified |
| Service Files | 14 | 14 | 0 (but utilized) |
| Components with Business Logic | 20+ | 5-8 | -12 (-60%) |
| Total Refactoring Files | 50+ | | |

---

## Critical Dependencies & Impacts

### Files IMPORTING Mock Data (50+ files)
Search pattern: `from '@/data/`

**High Impact Files:**
- FacilitiesPage.tsx - uses coreFacilities
- UserDashboard.tsx - uses coreFacilities
- Bookings.tsx - uses dummyBookings indirectly
- All calendar components - may use zones
- All facility detail pages - may use zones

### Files USING facilityStore (15+ files)
Search pattern: `useFacilityStore()`

**Must Update:**
- FacilitiesPage.tsx
- FacilityDetailPage.tsx
- All admin facility components
- MapView.tsx
- All facility list/grid components

### Files USING zoneStore (8+ files)
Search pattern: `useZoneStore()`

**Must Update:**
- Calendar components
- Booking forms
- Facility detail pages

---

## Implementation Order

### Week 1: Setup & Planning
- [ ] Create feature branch: `refactor/migrate-to-supabase`
- [ ] Verify all data exists in Supabase
- [ ] Create comprehensive test fixtures
- [ ] Document current data relationships

### Week 2: Phase 1 - Clean Data Layer
- [ ] Delete `/src/data/` files (keep in git history)
- [ ] Update 50+ imports across codebase
- [ ] Fix compilation errors
- [ ] Add missing Supabase queries

### Week 3: Phase 2 - Refactor Stores
- [ ] Create new React Query hooks
- [ ] Migrate components to use new hooks
- [ ] Update store usage in 15+ files
- [ ] Test each migrated store

### Week 4: Phase 3 - Services
- [ ] Complete all Supabase service implementations
- [ ] Add query keys consistently
- [ ] Add error handling
- [ ] Add cache invalidation

### Week 5: Phase 4 - Components
- [ ] Extract filtering logic to hooks
- [ ] Extract sorting logic to utils
- [ ] Remove embedded business logic
- [ ] Simplify JSX logic

### Week 6: Phase 5 - Real-time
- [ ] Connect real-time subscriptions
- [ ] Test cache invalidation
- [ ] Handle edge cases
- [ ] Performance optimization

### Week 7-8: Testing & Docs
- [ ] Comprehensive testing
- [ ] Update documentation
- [ ] Performance validation
- [ ] Deployment prep

---

## Code Examples

### STORE MIGRATION Example

**BEFORE: Zustand with Mock Data**
```typescript
// facilityStore.ts
const initialFacilities: readonly IFacility[] = [
  { id: "1", name: "Drammen Idrettshall", ... },
  { id: "2", name: "Strømsø Kulturhus", ... },
  // ... more hardcoded data
];

export const useFacilityStore = create<IFacilityStore>()(
  persist(
    (set, get) => ({
      facilities: initialFacilities,
      updateFacility: (id, updates) => { ... },
      getFacilityById: (id) => { ... },
    }),
    { name: "facility-store" }
  )
);

// Component usage
const { facilities, getFacilityById } = useFacilityStore();
const facility = getFacilityById("1"); // Gets mock data
```

**AFTER: React Query with Supabase**
```typescript
// hooks/useFacilities.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useFacilities = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Component usage
const { data: facilities, isLoading, error } = useFacilities();
// Gets real data from Supabase with caching
```

### COMPONENT REFACTORING Example

**BEFORE: Business Logic in Component**
```typescript
const FacilitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { facilities } = useFacilityStore();
  
  // Business logic in JSX
  const filtered = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      <input onChange={e => setSearchTerm(e.target.value)} />
      {filtered.map(f => <FacilityCard facility={f} />)}
    </div>
  );
};
```

**AFTER: Separated Concerns**
```typescript
// Hook: /src/hooks/useFacilitiesWithFilters.ts
const useFacilitiesWithFilters = (searchTerm: string) => {
  const { data: facilities = [] } = useFacilities();
  
  return useMemo(() => 
    facilities
      .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [facilities, searchTerm]
  );
};

// Component: Clean and simple
const FacilitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = useFacilitiesWithFilters(searchTerm);
  
  return (
    <div>
      <input onChange={e => setSearchTerm(e.target.value)} />
      {filtered.map(f => <FacilityCard facility={f} />)}
    </div>
  );
};
```

---

## Testing Checklist

### Unit Tests (Services)
- [ ] Each Supabase service function
- [ ] Error handling in services
- [ ] Query key generation
- [ ] Cache invalidation logic

### Integration Tests (Hooks)
- [ ] React Query hook behavior
- [ ] Loading/error states
- [ ] Cache invalidation triggering
- [ ] Data transformation

### E2E Tests (User Flows)
- [ ] Admin facility management flow
- [ ] User booking creation flow
- [ ] Real-time updates
- [ ] Offline handling

### Data Validation
- [ ] Supabase schema matches types
- [ ] All mock data migrated to Supabase
- [ ] Data relationships intact
- [ ] No data loss

---

## Common Pitfalls to Avoid

❌ **DON'T:**
- Keep mock data as fallback after deletion
- Leave hardcoded data in components
- Skip testing before deleting stores
- Migrate everything at once
- Forget about cache invalidation
- Create duplicate services for same entity

✓ **DO:**
- Verify Supabase has all data first
- Migrate incrementally (feature by feature)
- Test each migration thoroughly
- Use consistent query key structure
- Implement proper error boundaries
- Create comprehensive E2E tests

---

## Success Indicators

- [ ] No more files in `/src/data/`
- [ ] `npm run build` works without errors
- [ ] All tests pass
- [ ] No console warnings about deprecated patterns
- [ ] Real-time features work end-to-end
- [ ] Performance metrics stable or improved
- [ ] No breaking changes to user features

---

## Questions & Answers

**Q: Can we do this gradually?**
A: YES! Recommended approach:
1. Start with isolated features (favorites, field configs)
2. Move to larger features (facilities, bookings)
3. Last: admin pages and dashboards

**Q: What about offline support?**
A: Keep cartStore in Zustand; use React Query's offline support plugin for others

**Q: Will this break user sessions?**
A: No - AuthContext is properly integrated; migrations transparent to users

**Q: How much testing is needed?**
A: Comprehensive - this touches every data flow. Aim for 80%+ coverage of critical paths.

**Q: Timeline realistic?**
A: 6-8 weeks with 2 developers. Could be faster with 3+ developers or more focused scope.

---

## Emergency Rollback Plan

If issues arise:
1. Revert to feature branch start point
2. Keep failed migrations in separate branches
3. Document issues for post-analysis
4. Create targeted fixes before retry
5. Increase test coverage for failed areas

---

Generated: October 27, 2024
Last Updated: Ongoing
