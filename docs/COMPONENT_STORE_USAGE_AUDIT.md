# Component Store Usage Audit

**Date:** 2025-10-30
**Purpose:** Identify all components using Zustand stores directly for migration to feature hooks

## Summary Statistics

**Total Files Using Stores:** 35 files
**Store Import Counts:**
- `favoritesStore`: 3 usages
- `zoneStore`: 2 usages
- `calendarUIStore`: 2 usages
- `zoneUIStore`: 1 usage
- `userUIStore`: 1 usage
- `supportStore`: 1 usage
- `settingsUIStore`: 1 usage
- `reportUIStore`: 1 usage
- `messageUIStore`: 1 usage
- `messageStore`: 1 usage
- `groupUIStore`: 1 usage
- `fieldConfigStore`: 1 usage
- `facilityUIStore`: 1 usage
- `cartUIStore`: 1 usage
- `bookingUIStore`: 1 usage
- `auditUIStore`: 1 usage

## Usage Categories

### Category 1: Components Using Stores Directly (NEEDS MIGRATION)

These components import and use stores directly instead of using feature hooks:

#### 1.1 Group Management
**File:** `/src/components/features/groups/components/GroupBookingFlow.tsx`
- **Import:** `useGroupStore`
- **Migration Target:** `useGroupManagement()` (already exists!)
- **Priority:** HIGH - User-facing booking flow

**File:** `/src/components/features/groups/components/GroupInvitationModal.tsx`
- **Import:** (need to check - likely `useGroupStore`)
- **Migration Target:** `useGroupManagement()`
- **Priority:** MEDIUM

**File:** `/src/components/features/groups/components/GroupManagementCard.tsx`
- **Import:** (need to check)
- **Migration Target:** `useGroupManagement()`
- **Priority:** MEDIUM

#### 1.2 Messaging
**File:** `/src/components/features/messaging/components/MessageThread.tsx`
- **Import:** `useMessageStore`
- **Migration Target:** `useMessageManagement()` (already exists!)
- **Priority:** HIGH - Core communication feature

**File:** `/src/components/features/messaging/components/CreateThreadModal.tsx`
- **Import:** (need to check)
- **Migration Target:** `useMessageManagement()`
- **Priority:** MEDIUM

**File:** `/src/components/features/messaging/components/MessageInbox.tsx`
- **Import:** (need to check)
- **Migration Target:** `useMessageManagement()`
- **Priority:** HIGH - User inbox

#### 1.3 Facilities
**File:** `/src/components/features/facilities/components/FacilityCard/index.tsx`
- **Import:** (need to check - likely `useFacilityStore`)
- **Migration Target:** `useFacilityManagement()` (already exists!)
- **Priority:** HIGH - Main facility display

**File:** `/src/components/features/facilities/components/FacilityCard/FacilityListItem.tsx`
- **Import:** (need to check)
- **Migration Target:** `useFacilityManagement()`
- **Priority:** HIGH

**File:** `/src/components/features/facilities/components/FacilityCard/FacilityListItemUser.tsx`
- **Import:** (need to check)
- **Migration Target:** `useFacilityManagement()`
- **Priority:** HIGH

**File:** `/src/components/features/facilities/components/FacilityDetail/FacilityInfoTabs.tsx`
- **Import:** (need to check)
- **Migration Target:** `useFacilityManagement()`
- **Priority:** MEDIUM

#### 1.4 Admin Pages
**File:** `/src/pages/admin/Overview.tsx`
- **Import:** (need to check - multiple stores likely)
- **Migration Target:** Multiple feature hooks
- **Priority:** MEDIUM - Admin-only

**File:** `/src/pages/admin/FacilityEditPage.tsx`
- **Import:** (need to check)
- **Migration Target:** `useFacilityManagement()`
- **Priority:** MEDIUM

**File:** `/src/pages/admin/SettingsPage.tsx`
- **Import:** (need to check - likely `useSettingsUIStore`)
- **Migration Target:** `useSettingsManagement()` or local state
- **Priority:** LOW

#### 1.5 Support
**File:** `/src/components/features/support/components/SupportTicketList.tsx`
- **Import:** (need to check - likely `useSupportStore`)
- **Migration Target:** `useSupportManagement()` (needs to be created)
- **Priority:** MEDIUM

### Category 2: Feature Hooks Already Using Stores (GOOD PATTERN)

These are feature hooks that properly abstract store access - this is the pattern we want!

#### 2.1 Existing Feature Hooks ✅
**File:** `/src/hooks/features/useFacilityManagement.ts`
- **Uses:** `useFacilityUIStore`
- **Pattern:** ✅ Correct - Feature hook pattern

**File:** `/src/hooks/features/cart/useCartManagement.ts`
- **Uses:** `useCartUIStore`
- **Pattern:** ✅ Correct

**File:** `/src/hooks/features/messages/useMessageManagement.ts`
- **Uses:** `useMessageUIStore`
- **Pattern:** ✅ Correct

**File:** `/src/hooks/features/groups/useGroupManagement.ts`
- **Uses:** `useGroupUIStore`
- **Pattern:** ✅ Correct

**File:** `/src/hooks/features/zones/useZoneManagement.ts`
- **Uses:** `useZoneUIStore`
- **Pattern:** ✅ Correct

**File:** `/src/hooks/features/calendar/useCalendarManagement.ts`
- **Uses:** `useCalendarUIStore`
- **Pattern:** ✅ Correct

**File:** `/src/hooks/features/bookings/useBookingManagement.ts`
- **Uses:** `useBookingUIStore`
- **Pattern:** ✅ Correct

#### 2.2 Other Hook Files (Need Review)
**File:** `/src/hooks/features/users/useUserManagement.ts`
- **Uses:** (need to check)

**File:** `/src/hooks/features/facilities/useFacilityZoneData.ts`
- **Uses:** (need to check)

**File:** `/src/hooks/features/facilities/useFacilityActions.ts`
- **Uses:** (need to check)

**File:** `/src/hooks/features/favorites/useUserFavoritesManagement.ts`
- **Uses:** `useFavoritesStore` (likely)

**File:** `/src/hooks/features/facilities/useUserFacilitiesManagement.ts`
- **Uses:** (need to check)

**File:** `/src/hooks/features/audit/useAuditManagement.ts`
- **Uses:** `useAuditUIStore`

**File:** `/src/hooks/features/reports/useReportsManagement.ts`
- **Uses:** `useReportUIStore`

**File:** `/src/hooks/features/settings/useSettingsManagement.ts`
- **Uses:** `useSettingsUIStore`

### Category 3: Context Files (KEEP AS IS)

**File:** `/src/contexts/CartContext.tsx`
- **Uses:** `useCartStore`
- **Pattern:** Context wrapper around store - keep this pattern

### Category 4: Supporting Hook Files (VERIFY PATTERN)

**File:** `/src/components/features/facilities/hooks/useZones.ts`
- **Uses:** `useZoneStore`
- **Pattern:** Need to check - might be duplicate of `useZoneManagement`

**File:** `/src/components/features/messaging/hooks/useMessaging.ts`
- **Uses:** `useMessageStore`
- **Pattern:** Need to check - might be duplicate of `useMessageManagement`

**File:** `/src/components/features/support/hooks/useTickets.ts`
- **Uses:** `useSupportStore`
- **Pattern:** Need to check

**File:** `/src/components/features/bookings/hooks/useSlotSelection.ts`
- **Uses:** (need to check - likely `useSlotSelectionStore`)

**File:** `/src/components/features/dashboard/hooks/useDashboardData.ts`
- **Uses:** (need to check - multiple stores)

## Migration Priority Matrix

### Priority 1: HIGH (User-Facing, High Traffic)
1. ✅ **GroupBookingFlow.tsx** → `useGroupManagement()`
2. ✅ **MessageThread.tsx** → `useMessageManagement()`
3. ✅ **MessageInbox.tsx** → `useMessageManagement()`
4. ✅ **FacilityCard/index.tsx** → `useFacilityManagement()`
5. ✅ **FacilityListItem.tsx** → `useFacilityManagement()`
6. ✅ **FacilityListItemUser.tsx** → `useFacilityManagement()`

**Rationale:** These are core user-facing features used in every session.

### Priority 2: MEDIUM (Admin or Less Frequent)
7. **GroupInvitationModal.tsx** → `useGroupManagement()`
8. **GroupManagementCard.tsx** → `useGroupManagement()`
9. **CreateThreadModal.tsx** → `useMessageManagement()`
10. **FacilityInfoTabs.tsx** → `useFacilityManagement()`
11. **SupportTicketList.tsx** → `useSupportManagement()` (create first)
12. **FacilityEditPage.tsx** → `useFacilityManagement()`
13. **Overview.tsx** → Multiple hooks

**Rationale:** Important but admin-only or less frequently used features.

### Priority 3: LOW (Settings, Config)
14. **SettingsPage.tsx** → Consider `useState` instead
15. Audit/Reports pages → Keep existing hooks

**Rationale:** Low-traffic configuration pages.

## Migration Strategy

### Phase 1: Quick Wins (Week 1)
**Target:** Priority 1 components (6 components)

**Steps:**
1. Read component source to understand current store usage
2. Identify which feature hook to use
3. Replace store imports with hook imports
4. Update component logic to use hook return values
5. Test component behavior
6. Commit changes

**Expected Outcome:** 6 high-traffic components migrated to feature hooks

### Phase 2: Medium Priority (Week 2)
**Target:** Priority 2 components (7 components)

**Note:** SupportTicketList requires creating `useSupportManagement()` first

### Phase 3: Cleanup (Week 3)
**Target:** Priority 3 + duplicate hooks

**Tasks:**
- Migrate remaining components
- Remove duplicate hooks (useZones → useZoneManagement)
- Remove unused store imports
- Update documentation

## Expected Benefits

### Before Migration
```typescript
// Component directly accesses store
function GroupBookingFlow() {
  const groups = useGroupStore(state => state.groups);
  const addMember = useGroupStore(state => state.addMember);

  // Business logic mixed in component
  const filteredGroups = groups.filter(g => g.active);

  return <div>{/* ... */}</div>;
}
```

### After Migration
```typescript
// Component uses feature hook
function GroupBookingFlow() {
  const {
    filteredGroups,
    addMember,
    validateGroupData,
  } = useGroupManagement(groups);

  // Clean presentation logic only
  return <div>{/* ... */}</div>;
}
```

### Benefits:
- ✅ Cleaner component code
- ✅ Business logic in one place
- ✅ Easier testing
- ✅ Better TypeScript support
- ✅ Ready for React Query migration
- ✅ Consistent patterns across codebase

## Potential Issues & Mitigations

### Issue 1: Component Depends on Store Internal State
**Mitigation:** Extend feature hook return interface to expose needed values

### Issue 2: Performance Concerns with Hook
**Mitigation:** Use selectors in feature hooks with `useMemo`

### Issue 3: Multiple Stores in One Component
**Mitigation:** Use multiple feature hooks - this is fine and encouraged

### Issue 4: Breaking Changes
**Mitigation:** Keep old store imports temporarily, migrate gradually, comprehensive testing

## Testing Strategy

### For Each Migration:
1. **Unit Tests:** Verify feature hook behavior
2. **Component Tests:** Test component with React Testing Library
3. **Integration Tests:** Test full user flow
4. **Visual Regression:** Screenshot comparison (if tooling available)
5. **Manual QA:** Test in development environment

### Acceptance Criteria:
- ✅ All existing functionality works
- ✅ No console errors or warnings
- ✅ TypeScript compiles without errors
- ✅ Component re-render count unchanged or improved
- ✅ Bundle size unchanged or reduced

## Next Steps

1. **Immediate:** Start with GroupBookingFlow.tsx migration
2. **Day 2-3:** Migrate remaining Priority 1 components
3. **Day 4-5:** Test and verify all Priority 1 migrations
4. **Week 2:** Priority 2 migrations
5. **Week 3:** Cleanup and documentation

## Tracking

### Migration Status
- [ ] GroupBookingFlow.tsx
- [ ] MessageThread.tsx
- [ ] MessageInbox.tsx
- [ ] FacilityCard/index.tsx
- [ ] FacilityListItem.tsx
- [ ] FacilityListItemUser.tsx
- [ ] GroupInvitationModal.tsx
- [ ] GroupManagementCard.tsx
- [ ] CreateThreadModal.tsx
- [ ] FacilityInfoTabs.tsx
- [ ] SupportTicketList.tsx (requires creating hook first)
- [ ] FacilityEditPage.tsx
- [ ] Overview.tsx
- [ ] SettingsPage.tsx

---

**Last Updated:** 2025-10-30
**Next Review:** After Priority 1 migrations complete
