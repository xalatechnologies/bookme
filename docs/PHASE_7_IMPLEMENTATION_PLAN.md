# Phase 7 Implementation Plan: Store Consolidation

**Date:** 2025-10-30
**Current:** 23 Zustand stores
**Target:** 8-10 Zustand stores
**Reduction:** ~60% (13-15 stores removed)

## Executive Summary

With Phase 6 complete (React Query now handling all server data), we can safely consolidate Zustand stores. The strategy: **Remove data stores** (now handled by React Query) and **consolidate UI stores** where appropriate.

## Current Store Inventory (23 Stores)

### Data Stores (9) - **CANDIDATES FOR REMOVAL**
Since React Query now handles server data, these can be removed:

1. ✅ `groupStore.ts` - **REMOVE** (replaced by `useUserGroups`)
2. ✅ `messageStore.ts` - **REMOVE** (replaced by `useUserThreads`)
3. ✅ `zoneStore.ts` - **REMOVE** (replaced by zones service)
4. ✅ `favoritesStore.ts` - **REMOVE** (replaced by favorites service)
5. ✅ `supportStore.ts` - **REMOVE** (replaced by support service)
6. ✅ `fieldConfigStore.ts` - **CHECK** (might be client-only config)
7. ❌ `cartStore.ts` - **KEEP** (client-only, pre-checkout state)
8. ❌ `recurringBookingStore.ts` - **KEEP** (client-only draft patterns)
9. ❌ `slotSelectionStore.ts` - **KEEP** (temporary UI state)

**Action:** Remove 5-6 data stores, keep 3 client-only stores

### UI Stores (14) - **CANDIDATES FOR CONSOLIDATION**

#### Group A: Admin/Settings (Consolidate → `appUIStore`)
10. ✅ `settingsUIStore.ts` → `appUIStore.settings`
11. ✅ `reportUIStore.ts` → `appUIStore.reports`
12. ✅ `auditUIStore.ts` → `appUIStore.audit`
13. ✅ `userUIStore.ts` → `appUIStore.users`

#### Group B: Feature UI (Keep Separate)
14. ❌ `bookingUIStore.ts` - **KEEP** (complex booking flow state)
15. ❌ `calendarUIStore.ts` - **KEEP** (calendar view state)
16. ❌ `facilityUIStore.ts` - **KEEP** (facility filters/views)
17. ❌ `groupUIStore.ts` - **KEEP** (group management UI)
18. ❌ `messageUIStore.ts` - **KEEP** (message thread UI)

#### Group C: Minor UI (Consider Consolidation)
19. ⚠️ `cartUIStore.ts` - **EVALUATE** (might merge with cartStore)
20. ⚠️ `favoritesUIStore.ts` - **EVALUATE** (simple, might be useState)
21. ⚠️ `slotSelectionUIStore.ts` - **EVALUATE** (might merge with slotSelectionStore)
22. ⚠️ `supportUIStore.ts` - **EVALUATE** (simple UI state)
23. ⚠️ `zoneUIStore.ts` - **EVALUATE** (might merge with facilityUIStore)

**Action:** Consolidate 4 admin stores, evaluate 5 minor UI stores

## Consolidation Strategy

### Step 1: Create `appUIStore` (NEW STORE)

**Purpose:** Global application UI state (admin, settings, reports, audit)

**Structure:**
```typescript
// /src/stores/appUIStore.ts

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface AppUIState {
  // Settings section
  settings: {
    activeSection: string;
    unsavedChanges: boolean;
    theme: 'light' | 'dark' | 'system';
  };

  // Reports section
  reports: {
    dateRange: { start: string | null; end: string | null };
    selectedMetrics: readonly string[];
    activeTab: string;
    filters: ReportFilters;
  };

  // Audit section
  audit: {
    filters: AuditFilters;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    selectedAuditIds: readonly string[];
  };

  // User management section
  users: {
    searchTerm: string;
    roleFilter: readonly string[];
    statusFilter: readonly string[];
    sortBy: string;
  };

  // Global UI
  sidebarCollapsed: boolean;
  notificationsPanelOpen: boolean;

  // Actions
  setSettingsSection: (section: string) => void;
  setReportDateRange: (range: { start: string | null; end: string | null }) => void;
  toggleSidebar: () => void;
  // ... more actions
}

export const useAppUIStore = create<AppUIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        settings: {
          activeSection: 'general',
          unsavedChanges: false,
          theme: 'system',
        },
        reports: {
          dateRange: { start: null, end: null },
          selectedMetrics: [],
          activeTab: 'overview',
          filters: {},
        },
        audit: {
          filters: {},
          sortBy: 'created_at',
          sortOrder: 'desc',
          selectedAuditIds: [],
        },
        users: {
          searchTerm: '',
          roleFilter: [],
          statusFilter: [],
          sortBy: 'name',
        },
        sidebarCollapsed: false,
        notificationsPanelOpen: false,

        // Actions
        setSettingsSection: (section) =>
          set((state) => ({
            settings: { ...state.settings, activeSection: section },
          })),
        setReportDateRange: (range) =>
          set((state) => ({
            reports: { ...state.reports, dateRange: range },
          })),
        toggleSidebar: () =>
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          })),
        // ... more actions
      }),
      {
        name: 'app-ui-store',
        version: 1,
      }
    ),
    { name: 'AppUIStore' }
  )
);
```

**Benefits:**
- Single store for all admin/global UI
- Namespaced sections prevent confusion
- One localStorage key
- Easier to manage global state

### Step 2: Remove Data Stores

#### 2.1 Remove `groupStore.ts`
**Reason:** `useUserGroups` from React Query handles all group data

**Migration:**
```typescript
// Before
import { useGroupStore } from '@/stores/groupStore';
const store = useGroupStore();
const groups = store.getUserGroups(userId);

// After
import { useUserGroups } from '@/services/supabase/groups.service';
const { data: groups = [] } = useUserGroups(userId);
```

**Or better, use feature hook:**
```typescript
// Best
import { useGroupManagement } from '@/hooks/features/groups';
const { groups, filteredGroups } = useGroupManagement();
```

#### 2.2 Remove `messageStore.ts`
**Reason:** `useUserThreads` from React Query handles message data

#### 2.3 Remove `zoneStore.ts`
**Reason:** Zones service with React Query handles zone data

#### 2.4 Remove `favoritesStore.ts`
**Reason:** Favorites service handles favorites

#### 2.5 Remove `supportStore.ts`
**Reason:** Support service handles tickets

### Step 3: Evaluate Minor UI Stores

#### Option A: Keep Separate (Recommended for v1)
Keep minor UI stores as-is for now:
- Less risky (no breaking changes)
- Can consolidate later if needed
- Easier to maintain focused stores

#### Option B: Consolidate Aggressively
Merge related UI stores:
- `cartUIStore` → merge into `cartStore` (combined data + UI)
- `slotSelectionUIStore` → merge into `slotSelectionStore`
- `favoritesUIStore` → consider `useState` in components
- `supportUIStore` → `appUIStore.support`
- `zoneUIStore` → merge into `facilityUIStore`

**Recommendation:** Option A for Phase 7, Option B later if needed

### Step 4: Update Imports

After consolidation, update all imports:

```bash
# Find all usages of removed stores
grep -r "useGroupStore" src/
grep -r "useMessageStore" src/
grep -r "useZoneStore" src/
grep -r "useFavoritesStore" src/
grep -r "useSupportStore" src/

# Find usages of settings/reports/audit UI stores
grep -r "useSettingsUIStore" src/
grep -r "useReportUIStore" src/
grep -r "useAuditUIStore" src/
grep -r "useUserUIStore" src/
```

Replace with appropriate alternatives:
- Data stores → React Query services or feature hooks
- Admin UI stores → `useAppUIStore()`

## Implementation Order

### Phase 7a: Create Foundation (Day 1)
1. ✅ Create `appUIStore.ts` with all admin/global UI
2. ✅ Write tests for appUIStore
3. ✅ Add TypeScript interfaces

### Phase 7b: Migrate Admin UI (Day 2)
4. Update Settings page to use `appUIStore.settings`
5. Update Reports page to use `appUIStore.reports`
6. Update Audit page to use `appUIStore.audit`
7. Update User management to use `appUIStore.users`
8. Test admin pages thoroughly

### Phase 7c: Remove Data Stores (Day 3)
9. Remove `groupStore.ts` (verify useGroupManagement works)
10. Remove `messageStore.ts` (verify useMessageManagement works)
11. Remove `zoneStore.ts` (verify zones service used)
12. Remove `favoritesStore.ts`
13. Remove `supportStore.ts`
14. Update all affected imports

### Phase 7d: Cleanup Old UI Stores (Day 4)
15. Remove `settingsUIStore.ts`
16. Remove `reportUIStore.ts`
17. Remove `auditUIStore.ts`
18. Remove `userUIStore.ts`
19. Update all affected imports

### Phase 7e: Testing & Validation (Day 5)
20. Full manual testing of all features
21. Verify localStorage working
22. Check for console errors
23. Performance testing
24. Update documentation

## Final Store Count (Target: 8-10)

### Remaining Stores After Phase 7

**Client Data Stores (3):**
1. `cartStore.ts` - Pre-checkout cart state
2. `recurringBookingStore.ts` - Draft recurring patterns
3. `slotSelectionStore.ts` - Temporary slot selection

**Feature UI Stores (5):**
4. `bookingUIStore.ts` - Booking flow UI
5. `calendarUIStore.ts` - Calendar view state
6. `facilityUIStore.ts` - Facility filters/views
7. `groupUIStore.ts` - Group management UI
8. `messageUIStore.ts` - Message thread UI

**Global UI Store (1):**
9. `appUIStore.ts` - Admin/settings/reports/audit UI

**Optional Minor UI (0-2):**
10. `cartUIStore.ts` - *Consider merging with cartStore*
11. `favoritesUIStore.ts` - *Consider useState in components*

**Total: 9-11 stores** (down from 23)

## Risk Assessment

### Low Risk
- Creating appUIStore (new, no dependencies)
- Removing data stores (React Query already works)
- Removing unused UI stores

### Medium Risk
- Updating admin page imports (many files)
- localStorage key changes (users lose settings)

### High Risk
- Breaking existing functionality
- Missing import updates

### Mitigation Strategies

1. **Create appUIStore First**
   - No existing dependencies
   - Can test in isolation
   - No breaking changes

2. **One Store at a Time**
   - Remove groupStore first
   - Verify everything works
   - Then proceed to next

3. **Keep Old Files Temporarily**
   - Don't delete immediately
   - Comment out exports
   - Remove after 1-2 weeks

4. **Comprehensive Testing**
   - Manual testing of each feature
   - Check localStorage
   - Verify no console errors

## Testing Checklist

### Before Removal (Per Store)
- [ ] Identify all usages with grep
- [ ] Document replacement pattern
- [ ] Verify replacement exists and works
- [ ] Test replacement in isolation

### After Removal (Per Store)
- [ ] TypeScript compiles without errors
- [ ] Dev server runs without errors
- [ ] Feature works as before
- [ ] localStorage persists correctly
- [ ] No console warnings/errors

### After All Removals
- [ ] All pages load without errors
- [ ] All features functional
- [ ] Build succeeds: `npm run build`
- [ ] Performance unchanged or improved
- [ ] Bundle size reduced

## Success Metrics

**Code Quality:**
- ✅ Store count reduced by 60% (23 → 9)
- ✅ No duplicate state
- ✅ Clear separation of concerns
- ✅ TypeScript strict mode passes

**Performance:**
- ✅ Bundle size reduced (fewer store files)
- ✅ Faster initial load (less store initialization)
- ✅ localStorage more organized (fewer keys)

**Developer Experience:**
- ✅ Easier to find relevant store
- ✅ Less confusion about where state lives
- ✅ Cleaner imports
- ✅ Better documentation

## Documentation Updates

After Phase 7 completion:

1. Update `/docs/ZUSTAND_AUDIT.md` with final store list
2. Update `/docs/STATE_MANAGEMENT_ROADMAP.md` with Phase 7 complete
3. Create `/docs/STORE_CONSOLIDATION_GUIDE.md` with migration patterns
4. Update `CLAUDE.md` with new store architecture
5. Update component migration guide with new patterns

## Rollback Plan

If issues arise:

1. **Revert Git commits** - Each store removal should be one commit
2. **Restore from backup** - Keep deleted files in `/backup` folder
3. **Feature flags** - Could add flags to toggle new/old stores
4. **Gradual rollback** - Revert one store at a time

## Next Steps After Phase 7

### Phase 8: Final Documentation
- Complete migration guides
- Add architecture diagrams
- Document best practices
- Create video walkthrough (optional)

### Future Optimizations
- Consider merging more UI stores if beneficial
- Add store middleware for logging/analytics
- Implement store persistence versioning migration
- Add store performance monitoring

## Conclusion

Phase 7 will reduce store count from 23 to ~9, a **60% reduction**. This is possible because:
1. React Query now handles all server data (Phase 6 complete)
2. Admin UI can be consolidated into one store
3. Client-only stores are clearly identified

The consolidation is **low-risk** with clear benefits:
- Less code to maintain
- Clearer architecture
- Better performance
- Improved developer experience

**Estimated Time:** 5 days
**Complexity:** Medium
**Risk Level:** Low-Medium
**Impact:** High (major cleanup)

---

**Status:** Ready to implement
**Prerequisites:** Phase 6 complete ✅
**Next:** Create appUIStore
