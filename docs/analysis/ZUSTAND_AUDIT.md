# Zustand Store Audit

**Date:** 2025-10-29
**Total Stores:** 23

## Store Categories

### 1. Data Stores (Business Logic)
- `cartStore.ts` - Shopping cart data
- `recurringBookingStore.ts` - Recurring booking data
- `groupStore.ts` - Group management data
- `messageStore.ts` - Messaging data
- `fieldConfigStore.ts` - Field configuration data
- `supportStore.ts` - Support ticket data
- `favoritesStore.ts` - User favorites data
- `zoneStore.ts` - Zone management data
- `slotSelectionStore.ts` - Time slot selection data

### 2. UI State Stores
- `bookingUIStore.ts` - Booking UI state
- `calendarUIStore.ts` - Calendar UI state
- `cartUIStore.ts` - Cart UI state
- `facilityUIStore.ts` - Facility UI state
- `favoritesUIStore.ts` - Favorites UI state
- `groupUIStore.ts` - Group UI state
- `messageUIStore.ts` - Message UI state
- `settingsUIStore.ts` - Settings UI state
- `slotSelectionUIStore.ts` - Slot selection UI state
- `supportUIStore.ts` - Support UI state
- `userUIStore.ts` - User UI state
- `zoneUIStore.ts` - Zone UI state
- `reportUIStore.ts` - Report UI state
- `auditUIStore.ts` - Audit UI state

## Analysis

### Issues Identified

1. **Store Proliferation (23 stores)**
   - Too many stores can lead to maintenance challenges
   - Unclear separation of concerns
   - Potential for redundant state

2. **Duplicate Pattern**
   - Many features have both data + UI stores
   - Could be consolidated into single stores with namespaced state

3. **UI State Should Be Local**
   - Most UI stores (modals, tabs, selections) could use `useState`
   - Only truly global UI state needs Zustand

4. **Potential React Query Overlap**
   - Some data stores may duplicate server state
   - React Query already handles caching/syncing

## Recommendations

### High Priority

1. **Consolidate UI Stores**
   - Merge related UI stores into feature-specific stores
   - Example: `facilityUIStore` + `zoneUIStore` → `facilitiesUIStore`

2. **Move Local UI to useState**
   - Modal states → component `useState`
   - Form states → component `useState`
   - Selection states → component `useState`

3. **Leverage React Query**
   - Server data should use React Query
   - Only use Zustand for client-side state

### Medium Priority

4. **Combine Data + UI Stores**
   - Single store per feature with sections
   - Example: `groupStore` (data + UI in one)

5. **Add Store Documentation**
   - Document purpose of each store
   - Define when to use Zustand vs React Query vs useState

### Low Priority

6. **Performance Optimization**
   - Use selectors to prevent unnecessary re-renders
   - Implement shallow equality checks
   - Consider store splitting for large stores

## Target Store Count

**Current:** 23 stores
**Target:** 8-10 stores (50-60% reduction)

### Proposed Store Structure

1. `appUIStore` - Global UI state (theme, sidebar, etc.)
2. `cartStore` - Shopping cart (client state)
3. `bookingStore` - Booking management (client state)
4. `userPreferencesStore` - User preferences (client state)
5. `groupStore` - Group management (client state)
6. `messageStore` - Messaging (client state)
7. `supportStore` - Support tickets (client state)
8. `facilityStore` - Facility management (if needed beyond React Query)

## Migration Strategy

### Phase 1: Audit Current Usage
- [ ] Identify which stores are actively used
- [ ] Map dependencies between stores
- [ ] Document state access patterns

### Phase 2: Consolidate UI Stores
- [ ] Merge UI stores by feature
- [ ] Move local UI to component state
- [ ] Update components to use new structure

### Phase 3: Optimize Data Stores
- [ ] Migrate server state to React Query
- [ ] Combine related data stores
- [ ] Implement proper selectors

### Phase 4: Documentation
- [ ] Update usage guidelines
- [ ] Add migration notes
- [ ] Document best practices

## Integration with Feature Hooks

### Current Feature Hooks Architecture

The application already has **5 feature hooks** following clean architecture patterns (see `FEATURE_HOOKS_SUMMARY.md`):

1. **useCalendarManagement** → `calendarUIStore` + `calendar.business.service.ts`
2. **useZoneManagement** → `zoneUIStore` + `zone.business.service.ts`
3. **useGroupManagement** → `groupUIStore` + `group.business.service.ts`
4. **useMessageManagement** → `messageUIStore` + `message.business.service.ts`
5. **useCartManagement** → `cartUIStore` + `cart.business.service.ts`

### How Feature Hooks Support Store Consolidation

**Three-Layer Architecture:**
```
┌─────────────────────────────────────┐
│  Components (Presentation)          │
└────────────┬────────────────────────┘
             │ use feature hooks
┌────────────▼────────────────────────┐
│  Feature Hooks (Integration)        │
│  - useCalendarManagement()          │
│  - useZoneManagement()              │
│  - useGroupManagement()             │
└────┬───────────────────┬────────────┘
     │                   │
     ▼                   ▼
┌─────────────┐   ┌──────────────────┐
│ UI Stores   │   │ Business Logic   │
│ (Zustand)   │   │ (Pure Functions) │
└─────────────┘   └──────────────────┘
```

### Benefits for Store Reduction

1. **UI Stores Become Leaner**
   - Feature hooks handle integration logic
   - Stores only manage UI state (filters, modals, selections)
   - Business logic moves to pure service functions

2. **Ready for React Query Migration**
   - Feature hooks abstract data source
   - Currently: `useZoneManagement(zones)`
   - Future: `useZoneManagement()` fetches internally with React Query
   - Components don't need to change!

3. **Easier Consolidation**
   - Multiple UI stores can share one feature hook
   - Example: `facilityUIStore` + `zoneUIStore` → single `useFacilityManagement()`

### Recommended Implementation Path

**Phase 1: Leverage Existing Feature Hooks (Quick Wins)**
- ✅ 5 feature hooks already created
- Migrate components to use hooks instead of direct store access
- This prepares ground for store consolidation

**Phase 2: Create Additional Feature Hooks**
- `useFacilityManagement()` - combine facility + zone stores
- `useBookingManagement()` - combine booking + slot selection stores
- `useSupportManagement()` - for support tickets

**Phase 3: Consolidate Stores**
- Merge UI stores that are now abstracted behind feature hooks
- Move data stores to React Query (server state)
- Keep only client-side state in Zustand

**Phase 4: Final Cleanup**
- Remove unused stores
- Document final architecture
- Add migration guide

### Example Migration

**Before (Direct Store Access):**
```typescript
function ZoneList() {
  const zones = useZoneStore(state => state.zones);
  const searchTerm = useZoneUIStore(state => state.searchTerm);

  // Business logic in component
  const filtered = zones.filter(z =>
    z.name.includes(searchTerm)
  );

  return <div>{/* render */}</div>;
}
```

**After (Feature Hook):**
```typescript
function ZoneList() {
  const {
    filteredZones,
    searchTerm,
    setSearchTerm,
    validateZoneData,
  } = useZoneManagement(zones);

  return <div>{/* render */}</div>;
}
```

**Future (With React Query):**
```typescript
function ZoneList() {
  // Hook fetches data internally, no props needed
  const {
    filteredZones,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    validateZoneData,
  } = useZoneManagement();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <div>{/* render */}</div>;
}
```

## Next Steps

### Immediate Actions
1. ✅ Feature hooks already created (5/5 complete)
2. Audit component usage of direct store access
3. Identify components that can migrate to feature hooks
4. Create migration plan for remaining features

### Medium Term
5. Create additional feature hooks for remaining stores
6. Begin migrating components to use hooks
7. Plan React Query integration strategy
8. Document API patterns for new features

### Long Term
9. Migrate server state to React Query
10. Consolidate UI stores (23 → 8-10)
11. Remove deprecated stores
12. Finalize architectural documentation

---

**Note:** This is a comprehensive audit. Implementation should be gradual to avoid breaking changes. The existing feature hooks provide an excellent foundation for store consolidation and React Query migration.
