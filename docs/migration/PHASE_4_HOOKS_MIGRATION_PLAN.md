# Phase 4: Hooks & State Optimization - Migration Plan

**Date**: October 28, 2025  
**Status**: 🚧 IN PROGRESS  
**Goal**: Move feature-specific hooks into their respective feature domains

---

## 📊 Current Hooks Analysis

### Already Organized ✅
```
src/hooks/
├── auth/ (3 items) - Already in feature domain style
├── bookings/ (5 items) - Already in feature domain style
└── search/ (4 items) - Already in feature domain style
```

### Need to Migrate (25+ hooks)

#### Calendar Domain Hooks (7 hooks)
```
useCalendarEnhancements.ts → features/calendar/hooks/
useCalendarEvents.ts → features/calendar/hooks/
useCalendarState.ts → features/calendar/hooks/
useCalendarView.ts → features/calendar/hooks/
useDragSelection.ts → features/calendar/hooks/
useEventHandling.ts → features/calendar/hooks/
useTimeSlotSelection.ts → features/calendar/hooks/
```

#### Bookings Domain Hooks (4 hooks)
```
useAvailabilityStatus.ts → features/bookings/hooks/
useBookingSteps.ts → features/bookings/hooks/ (might be duplicate)
useRealtimeBookings.ts → features/bookings/hooks/
useSlotSelection.ts → features/bookings/hooks/
```

#### Facilities Domain Hooks (2 hooks)
```
useFacility.ts → features/facilities/hooks/
useZones.ts → features/facilities/hooks/
```

#### Messaging Domain Hooks (2 hooks)
```
useMessaging.ts → features/messaging/hooks/
useRealtimeMessages.ts → features/messaging/hooks/
```

#### Dashboard Domain Hooks (2 hooks)
```
useDashboardData.ts → features/dashboard/hooks/
useStatistics.ts → features/dashboard/hooks/
```

#### Support Domain Hooks (1 hook)
```
useTickets.ts → features/support/hooks/
```

#### Search Domain Hooks (2 hooks)
```
useAdminSearch.ts → features/search/hooks/
useGlobalSearch.ts → features/search/hooks/
```

#### Notifications (1 hook)
```
useNotifications.ts → Keep in src/hooks/ (cross-cutting concern)
OR → Create features/notifications/ domain
```

#### Shared/Common Hooks (Keep in src/hooks/)
```
useFormValidation.ts - Used across multiple features
useModal.ts - Generic modal management
useHistory.ts - Generic history tracking
useAmenityTranslation.ts - i18n utility
useLocalizedDbValue.ts - i18n database values
useLocalizedDbValues.ts - i18n database values
useOfflineStatus.ts - App-wide connectivity
useRealtimeNotifications.ts - App-wide notifications
useReviews.ts - Could move to facilities or keep shared
```

---

## 🎯 Migration Priority

### Phase 4A: Calendar Hooks (7 hooks) - HIGHEST PRIORITY
**Why**: Largest group, clear domain ownership, high cohesion

**Files to Move**:
1. useCalendarEnhancements.ts
2. useCalendarEvents.ts
3. useCalendarState.ts
4. useCalendarView.ts
5. useDragSelection.ts
6. useEventHandling.ts
7. useTimeSlotSelection.ts

**Target**: `src/components/features/calendar/hooks/`

**Steps**:
1. Move files to target directory
2. Update imports in calendar components
3. Add to calendar feature's index.ts
4. Update src/hooks/index.ts

---

### Phase 4B: Bookings Hooks (4 hooks) - HIGH PRIORITY
**Why**: Core feature, already partially organized

**Files to Move**:
1. useAvailabilityStatus.ts
2. useBookingSteps.ts (check for duplicate)
3. useRealtimeBookings.ts
4. useSlotSelection.ts

**Target**: `src/components/features/bookings/hooks/`

---

### Phase 4C: Facilities Hooks (2 hooks) - MEDIUM PRIORITY

**Files to Move**:
1. useFacility.ts
2. useZones.ts

**Target**: `src/components/features/facilities/hooks/`

---

### Phase 4D: Messaging Hooks (2 hooks) - MEDIUM PRIORITY

**Files to Move**:
1. useMessaging.ts
2. useRealtimeMessages.ts

**Target**: `src/components/features/messaging/hooks/`

---

### Phase 4E: Search Hooks (2 hooks) - MEDIUM PRIORITY

**Files to Move**:
1. useAdminSearch.ts
2. useGlobalSearch.ts

**Target**: `src/components/features/search/hooks/`

---

### Phase 4F: Dashboard & Support (3 hooks) - LOW PRIORITY

**Files to Move**:
1. useDashboardData.ts → features/dashboard/hooks/
2. useStatistics.ts → features/dashboard/hooks/
3. useTickets.ts → features/support/hooks/

---

### Phase 4G: Cleanup (Keep in src/hooks/)

**Shared Hooks to Keep**:
- useFormValidation.ts
- useModal.ts
- useHistory.ts
- useAmenityTranslation.ts
- useLocalizedDbValue.ts
- useLocalizedDbValues.ts
- useOfflineStatus.ts
- useNotifications.ts (or create notifications feature)
- useRealtimeNotifications.ts
- useReviews.ts (decide: facilities or shared)

---

## 📝 Migration Checklist (Per Hook)

For each hook migration:

- [ ] **1. Check dependencies** - What does this hook import?
- [ ] **2. Check usage** - Where is this hook used?
- [ ] **3. Move file** - Copy to feature domain
- [ ] **4. Update imports** - Fix all import paths
- [ ] **5. Add to feature index** - Export from feature barrel
- [ ] **6. Update src/hooks/index** - Remove or re-export
- [ ] **7. Test build** - Verify no errors
- [ ] **8. Delete original** - Remove from src/hooks/

---

## 🎯 Expected Outcome

**Before**:
```
src/hooks/ (30+ files at root)
src/components/features/{domain}/hooks/ (placeholders)
```

**After**:
```
src/hooks/ (8-10 shared hooks only)
src/components/features/calendar/hooks/ (7 files)
src/components/features/bookings/hooks/ (9 files)
src/components/features/facilities/hooks/ (4 files)
src/components/features/messaging/hooks/ (3 files)
src/components/features/dashboard/hooks/ (3 files)
src/components/features/search/hooks/ (6 files)
src/components/features/support/hooks/ (2 files)
```

---

## ⚠️ Risks & Mitigation

### Risk 1: Circular Dependencies
**Mitigation**: Check imports before moving, ensure one-way dependencies

### Risk 2: Shared Hook Usage
**Mitigation**: If a hook is used across multiple features, keep in src/hooks/

### Risk 3: Breaking Changes
**Mitigation**: Move hooks gradually, test build after each phase

---

## 🚀 Execution Timeline

**Phase 4A**: Calendar (7 hooks) - 1 hour  
**Phase 4B**: Bookings (4 hooks) - 30 minutes  
**Phase 4C**: Facilities (2 hooks) - 15 minutes  
**Phase 4D**: Messaging (2 hooks) - 15 minutes  
**Phase 4E**: Search (2 hooks) - 15 minutes  
**Phase 4F**: Dashboard & Support (3 hooks) - 20 minutes  
**Phase 4G**: Cleanup - 30 minutes

**Total Estimated Time**: 3-4 hours

---

## ✅ Success Criteria

- All feature-specific hooks moved to feature domains
- Clean src/hooks/ directory (only shared utilities)
- All imports updated correctly
- Build succeeds with 0 errors
- No breaking changes
- Proper barrel exports in place

---

**Status**: Ready to execute Phase 4A (Calendar hooks)
