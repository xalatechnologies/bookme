# State Management Optimization Roadmap

**Last Updated:** 2025-10-30
**Status:** Phase 3 Complete - Ready for Phase 4

## Executive Summary

This roadmap outlines the systematic optimization of state management in the BookMe application, leveraging:
- **Existing feature hooks** (5 already created)
- **Zustand store consolidation** (23 → 8-10 stores)
- **React Query migration** (server state separation)
- **AppProviders consolidation** (already completed)

## Current Architecture Overview

### State Management Layers

```
┌──────────────────────────────────────────────────────────────┐
│                     Components                                │
└───────────────┬──────────────────────────────────────────────┘
                │
    ┌───────────▼───────────┐
    │   Feature Hooks       │  ← Integration Layer
    │   (5 created)         │
    └─┬─────────────────┬───┘
      │                 │
      ▼                 ▼
┌─────────────┐   ┌──────────────────┐
│ UI State    │   │ Business Logic   │
│ (Zustand)   │   │ (Pure Functions) │
│ 23 stores   │   │ Services         │
└─────────────┘   └──────────────────┘
      │
      ▼
┌─────────────┐
│ localStorage│
│ Persistence │
└─────────────┘
```

### Completed: Phase 3 - State Management Optimizations

✅ **Task 1: Consolidate Context Providers**
- Created `AppProviders.tsx` component
- Reduced provider nesting from 6 levels to 1
- Improved performance with single render cycle
- Cleaner App.tsx structure

✅ **Task 2: Audit Zustand Usage**
- Identified all 23 Zustand stores
- Categorized into data (9) and UI (14) stores
- Created comprehensive audit documentation
- Identified consolidation opportunities

✅ **Task 3: Optimize TanStack Query Configuration**
- Enhanced retry logic with exponential backoff
- Added network mode handling
- Implemented structural sharing
- Added placeholder data for better UX

✅ **Task 4: Integrate Feature Hooks with Audit**
- Documented 5 existing feature hooks
- Created three-layer architecture diagram
- Provided migration examples
- Established implementation path

## Optimization Goals

### Primary Objectives
1. **Reduce store count**: 23 → 8-10 stores (50-60% reduction)
2. **Improve maintainability**: Clear separation of concerns
3. **Enhance performance**: Minimize re-renders, optimize caching
4. **Prepare for scale**: React Query for server state
5. **Developer experience**: Consistent patterns, better TypeScript

### Success Metrics
- ✅ Store count reduced by 50-60%
- ✅ Bundle size reduced (fewer store modules)
- ✅ Faster component re-renders
- ✅ Better TypeScript autocomplete
- ✅ Easier onboarding for new developers

## Phase 4: Component Migration to Feature Hooks

**Status:** Not Started
**Priority:** High
**Timeline:** 2-3 weeks

### Objectives
Migrate components from direct store access to feature hooks.

### Tasks

#### 4.1 Audit Component Usage
- [ ] Scan codebase for direct `useZoneStore` calls
- [ ] Scan for direct `useCalendarUIStore` calls
- [ ] Scan for direct `useGroupStore` calls
- [ ] Scan for direct `useMessageStore` calls
- [ ] Scan for direct `useCartStore` calls
- [ ] Document current usage patterns
- [ ] Identify high-traffic components

#### 4.2 Migration Priority List
**High Priority (User-Facing):**
1. Zone management components → `useZoneManagement()`
2. Calendar components → `useCalendarManagement()`
3. Cart/Checkout flow → `useCartManagement()`
4. Group booking components → `useGroupManagement()`
5. Message inbox/threads → `useMessageManagement()`

**Medium Priority (Admin):**
6. Facility management → `useFacilityManagement()` (to be created)
7. Booking management → `useBookingManagement()` (to be created)
8. Support tickets → `useSupportManagement()` (to be created)

**Low Priority (Settings):**
9. User settings → Keep as Context/useState
10. UI preferences → Keep local

#### 4.3 Migration Strategy
```typescript
// Step 1: Create wrapper hook if needed
export const useZoneManagement = (zones = []) => {
  const uiStore = useZoneUIStore();
  // ... business logic
  return {
    filteredZones,
    // ... methods
  };
};

// Step 2: Update component
// Before:
function ZoneList() {
  const zones = useZoneStore(state => state.zones);
  const searchTerm = useZoneUIStore(state => state.searchTerm);
  // Business logic here...
}

// After:
function ZoneList() {
  const { filteredZones, searchTerm } = useZoneManagement(zones);
  // Clean presentation logic
}

// Step 3: Test component behavior
// Step 4: Remove direct store imports
```

#### 4.4 Testing Plan
- [ ] Write unit tests for each hook migration
- [ ] Test UI interactions remain unchanged
- [ ] Verify state persistence still works
- [ ] Check performance with React DevTools
- [ ] User acceptance testing

### Deliverables
- ✅ Migration guide document
- Component usage audit report (pending)
- Updated component examples (pending)
- Test coverage report (pending)

## Phase 5: Create Additional Feature Hooks

**Status:** Not Started
**Priority:** Medium
**Timeline:** 1-2 weeks

### Objectives
Create feature hooks for remaining stores without hooks.

### New Hooks to Create

#### 5.1 useFacilityManagement
**Combines:** `facilityStore` + `facilityUIStore`

**Responsibilities:**
- Facility CRUD operations
- Filtering and sorting
- Availability calculations
- Zone management integration
- Image gallery management
- Pricing rules application

**Returns:**
```typescript
interface IUseFacilityManagementReturn {
  // Data
  filteredFacilities: readonly Facility[]
  selectedFacility: Facility | null

  // UI State
  viewMode: 'grid' | 'list' | 'map'
  searchTerm: string
  filters: FacilityFilters

  // Operations
  validateFacility: (facility) => ValidationResult
  calculateAvailability: (date) => AvailabilityResult
  applyPricingRules: (booking) => number
}
```

#### 5.2 useBookingManagement
**Combines:** `recurringBookingStore` + `slotSelectionStore` + `bookingUIStore`

**Responsibilities:**
- Booking creation and validation
- Slot selection and conflict detection
- Recurring pattern management
- Status tracking (pending, confirmed, cancelled)
- Cancellation policy enforcement

**Returns:**
```typescript
interface IUseBookingManagementReturn {
  // Data
  bookings: readonly Booking[]
  selectedSlots: readonly TimeSlot[]
  recurringPattern: RecurrencePattern | null

  // Operations
  createBooking: (data) => Promise<Booking>
  validateSlots: (slots) => ValidationResult
  generateRecurringOccurrences: (pattern) => Occurrence[]
  canCancelBooking: (booking) => PermissionResult
}
```

#### 5.3 useSupportManagement
**Combines:** `supportStore` + `supportUIStore`

**Responsibilities:**
- Ticket creation and management
- Status tracking and updates
- Priority management
- Assignment to staff
- Response time calculations

**Returns:**
```typescript
interface IUseSupportManagementReturn {
  // Data
  tickets: readonly SupportTicket[]
  filteredTickets: readonly SupportTicket[]

  // Statistics
  openCount: number
  averageResponseTime: number

  // Operations
  createTicket: (data) => Promise<SupportTicket>
  assignTicket: (ticketId, staffId) => Promise<void>
  calculatePriority: (ticket) => Priority
}
```

### Tasks
- [ ] Create `useFacilityManagement.ts` with TypeScript interfaces
- [ ] Create `useBookingManagement.ts` combining booking stores
- [ ] Create `useSupportManagement.ts` for support features
- [ ] Write comprehensive JSDoc documentation
- [ ] Add usage examples to docs
- [ ] Create unit tests for each hook
- [ ] Update `FEATURE_HOOKS_SUMMARY.md`

## Phase 6: React Query Integration

**Status:** Not Started
**Priority:** High
**Timeline:** 3-4 weeks

### Objectives
Migrate server state from Zustand to React Query.

### Architecture Changes

```typescript
// Current: Data passed as props
export const useZoneManagement = (zones = []) => {
  const uiStore = useZoneUIStore();
  // ... logic with zones prop
};

// Future: Data fetched internally
export const useZoneManagement = (facilityId?: string) => {
  // React Query handles data fetching
  const { data: zones = [], isLoading, error } = useQuery({
    queryKey: ['zones', facilityId],
    queryFn: () => fetchZones(facilityId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const uiStore = useZoneUIStore();

  // ... business logic

  return {
    zones,
    filteredZones,
    isLoading,
    error,
    // ... other returns
  };
};
```

### Migration Strategy

#### 6.1 Data Store Categorization
**Server State (Migrate to React Query):**
- ✅ `facilityStore` - Facilities from database
- ✅ `zoneStore` - Zones from database
- ✅ `groupStore` - Groups from database
- ✅ `messageStore` - Messages from database
- ✅ `supportStore` - Support tickets from database
- ✅ `fieldConfigStore` - Dynamic form fields from database

**Client State (Keep in Zustand):**
- ✅ `cartStore` - Shopping cart (local only)
- ✅ `recurringBookingStore` - Draft recurring patterns
- ✅ `slotSelectionStore` - Temporary slot selection
- ✅ `favoritesStore` - User favorites (sync to server)

**UI State (Keep in Zustand, consider useState):**
- All `*UIStore` files remain but may be simplified

#### 6.2 Create React Query Hooks

**Pattern:**
```typescript
// /src/hooks/api/zones/useZones.ts
export const useZones = (facilityId?: string) => {
  return useQuery({
    queryKey: ['zones', facilityId],
    queryFn: () => supabase
      .from('zones')
      .select('*')
      .eq('facility_id', facilityId)
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zone: Zone) => supabase
      .from('zones')
      .insert(zone)
      .select()
      .single(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
};
```

#### 6.3 Update Feature Hooks
```typescript
// /src/hooks/features/zones/useZoneManagement.ts
export const useZoneManagement = (facilityId?: string) => {
  // Use React Query hook
  const { data: zones = [], isLoading, error } = useZones(facilityId);
  const createZone = useCreateZone();

  // UI state from Zustand
  const uiStore = useZoneUIStore();

  // Business logic
  const filteredZones = useMemo(() => {
    return filterZones(zones, {
      searchTerm: uiStore.searchTerm,
      facilityFilter: uiStore.facilityFilter,
    });
  }, [zones, uiStore.searchTerm, uiStore.facilityFilter]);

  return {
    zones,
    filteredZones,
    isLoading,
    error,
    createZone: createZone.mutate,
    // ... other operations
  };
};
```

### Tasks

#### 6.4 Implementation Checklist
- [ ] Set up React Query hooks directory structure
- [ ] Create API hooks for each data store
  - [ ] `useZones()` and mutations
  - [ ] `useFacilities()` and mutations
  - [ ] `useBookings()` and mutations
  - [ ] `useGroups()` and mutations
  - [ ] `useMessages()` and mutations
  - [ ] `useSupportTickets()` and mutations
- [ ] Update feature hooks to use API hooks
- [ ] Configure optimistic updates
- [ ] Set up cache invalidation strategies
- [ ] Add error boundaries for query errors
- [ ] Test with Supabase backend
- [ ] Document query key conventions
- [ ] Add loading/error states to components

## Phase 7: Store Consolidation

**Status:** Not Started
**Priority:** Medium
**Timeline:** 2 weeks

### Objectives
Reduce store count from 23 to 8-10 by consolidating related stores.

### Consolidation Plan

#### 7.1 Create Global UI Store
**New:** `appUIStore.ts`

**Consolidates:**
- `settingsUIStore` → `appUIStore.settings`
- `reportUIStore` → `appUIStore.reports`
- `auditUIStore` → `appUIStore.audit`
- Global theme, sidebar state, notification preferences

**Structure:**
```typescript
interface AppUIState {
  // Theme
  theme: 'light' | 'dark' | 'system';

  // Layout
  sidebarCollapsed: boolean;

  // Reports
  reports: {
    dateRange: DateRange;
    selectedMetrics: string[];
    activeTab: string;
  };

  // Audit logs
  audit: {
    filters: AuditFilters;
    sortBy: string;
  };

  // Settings
  settings: {
    activeSection: string;
    unsavedChanges: boolean;
  };
}
```

#### 7.2 Consolidate Feature UI Stores
**Option A: Keep Separate (Recommended)**
- Feature hooks abstract complexity
- Each store remains focused
- Easier to maintain

**Option B: Merge Related Stores**
- `facilityUIStore` + `zoneUIStore` → `facilitiesUIStore`
- `bookingUIStore` + `slotSelectionUIStore` → `bookingFlowUIStore`
- Consider if stores are always used together

#### 7.3 Client State Stores (Keep)
These stores manage genuine client-side state:
- `cartStore` - Shopping cart before checkout
- `recurringBookingStore` - Draft recurring patterns
- `favoritesStore` - User favorites with sync

### Tasks
- [ ] Create `appUIStore` combining global UI state
- [ ] Migrate settings UI state to `appUIStore`
- [ ] Migrate report UI state to `appUIStore`
- [ ] Migrate audit UI state to `appUIStore`
- [ ] Update components using consolidated stores
- [ ] Remove deprecated store files
- [ ] Update imports across codebase
- [ ] Test state persistence

### Expected Result
**From 23 stores:**
```
cartStore
recurringBookingStore
groupStore (if needed beyond React Query)
messageStore (if needed for optimistic updates)
fieldConfigStore (dynamic forms)
supportStore (if needed for draft tickets)
favoritesStore
zoneStore (if needed beyond React Query)
slotSelectionStore
bookingUIStore
calendarUIStore
cartUIStore
facilityUIStore
favoritesUIStore
groupUIStore
messageUIStore
settingsUIStore
slotSelectionUIStore
supportUIStore
userUIStore
zoneUIStore
reportUIStore
auditUIStore
```

**To 8-10 stores:**
```
appUIStore (global UI)
cartStore (client state)
recurringBookingStore (client state)
favoritesStore (client state with sync)
slotSelectionStore (temporary selection)
bookingUIStore (booking flow UI)
calendarUIStore (calendar UI)
facilityUIStore (facility UI - or merge with zoneUIStore)
groupUIStore (group UI)
messageUIStore (message UI)
```

Plus React Query for all server data!

## Phase 8: Documentation and Best Practices

**Status:** Partially Complete
**Priority:** Medium
**Timeline:** 1 week

### Objectives
Comprehensive documentation for the optimized architecture.

### Deliverables

#### 8.1 Architecture Documentation
- [x] ZUSTAND_AUDIT.md (completed)
- [x] FEATURE_HOOKS_SUMMARY.md (completed)
- [x] STATE_MANAGEMENT_ROADMAP.md (this document)
- [ ] REACT_QUERY_PATTERNS.md
- [ ] MIGRATION_GUIDE.md
- [ ] TROUBLESHOOTING.md

#### 8.2 Developer Guidelines
- [ ] When to use Zustand vs React Query vs useState
- [ ] Feature hook creation template
- [ ] Store creation template
- [ ] API hook patterns
- [ ] Testing strategies

#### 8.3 Code Examples
- [ ] Feature hook usage examples
- [ ] React Query integration examples
- [ ] Optimistic update patterns
- [ ] Error handling patterns
- [ ] Loading state patterns

### Tasks
- [ ] Create REACT_QUERY_PATTERNS.md
- [ ] Create MIGRATION_GUIDE.md for developers
- [ ] Document testing patterns
- [ ] Add inline code comments
- [ ] Create architecture diagrams
- [ ] Record demo video (optional)
- [ ] Update README.md with new architecture
- [ ] Add CONTRIBUTING.md guidelines

## Timeline Summary

### Completed (Phase 3)
- ✅ Provider consolidation
- ✅ Zustand audit
- ✅ React Query optimization
- ✅ Feature hooks integration documentation

### Phase 4: Component Migration (2-3 weeks)
- Week 1: Audit and planning
- Week 2-3: Component migration and testing

### Phase 5: Additional Hooks (1-2 weeks)
- Create 3 new feature hooks
- Documentation and testing

### Phase 6: React Query Integration (3-4 weeks)
- Week 1: Set up API hooks
- Week 2: Migrate first feature
- Week 3: Migrate remaining features
- Week 4: Testing and optimization

### Phase 7: Store Consolidation (2 weeks)
- Week 1: Create consolidated stores
- Week 2: Migration and cleanup

### Phase 8: Documentation (1 week)
- Comprehensive docs and examples

**Total Timeline:** 9-12 weeks for complete migration

## Risk Mitigation

### Potential Risks

1. **Breaking Changes**
   - **Mitigation:** Feature flag system, gradual rollout
   - Test in development before production
   - Keep old stores during transition

2. **Performance Regression**
   - **Mitigation:** Benchmark before/after
   - Monitor bundle size
   - Use React DevTools profiler

3. **Developer Confusion**
   - **Mitigation:** Comprehensive docs
   - Pair programming sessions
   - Code review guidelines

4. **Data Loss**
   - **Mitigation:** Backup localStorage data
   - Versioned persistence
   - Migration scripts

### Rollback Plan
Each phase includes:
- Git branches for isolated work
- Feature flags for toggles
- Preserved old code until verified
- Documented rollback procedures

## Success Criteria

### Phase Completion Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] User acceptance testing complete

### Final Verification
- [ ] Store count: 23 → 8-10 ✅
- [ ] Bundle size reduced by X% ✅
- [ ] Component re-renders optimized ✅
- [ ] Developer onboarding time reduced ✅
- [ ] All server state in React Query ✅
- [ ] All UI state properly separated ✅
- [ ] Comprehensive documentation ✅

## Appendix

### Related Documents
- `/docs/ZUSTAND_AUDIT.md` - Store audit results
- `/docs/FEATURE_HOOKS_SUMMARY.md` - Hook documentation
- `/src/lib/clients/queryClient.ts` - React Query config
- `/src/providers/AppProviders.tsx` - Provider setup

### Key Files by Phase
**Phase 4:**
- All components using stores directly

**Phase 5:**
- `/src/hooks/features/facilities/useFacilityManagement.ts`
- `/src/hooks/features/bookings/useBookingManagement.ts`
- `/src/hooks/features/support/useSupportManagement.ts`

**Phase 6:**
- `/src/hooks/api/zones/useZones.ts`
- `/src/hooks/api/facilities/useFacilities.ts`
- All API-related hooks

**Phase 7:**
- `/src/stores/appUIStore.ts`
- Consolidated store files

**Phase 8:**
- All documentation files

---

**Last Updated:** 2025-10-30
**Next Review:** After Phase 4 completion
**Owner:** Development Team
