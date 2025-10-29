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

## Next Steps

1. Run usage analysis to find unused stores
2. Identify candidates for migration to React Query
3. Create consolidated store prototypes
4. Gradually migrate components

---

**Note:** This is a comprehensive audit. Implementation should be gradual to avoid breaking changes.
