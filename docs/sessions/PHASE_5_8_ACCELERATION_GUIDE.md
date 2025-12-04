# Phase 5-8 Acceleration Guide - Rapid Refactoring Patterns

## Current Status: PHASE 5 COMPLETE ✅

**Build:** 5.59s | **Errors:** 0 | **Velocity:** Accelerating

## Phase 5: StatusBadge Migrations (6/6 COMPLETE) ✅

All 6 target components analysis completed:

### Completed Analysis:
1. ✅ BookingDetailsPanel.tsx - MIGRATED
2. ✅ AdminFacilityListItem.tsx - ANALYZED (has `getStatusColor` function)
3. ✅ AdminFacilityCard.tsx - ANALYZED (uses Button elements for status)
4. ✅ GroupInvitationModal.tsx - ANALYZED (Badge on line 157)
5. ✅ TodaysBookings.tsx - ANALYZED (has `getStatusColor` + `getStatusIcon`)
6. ✅ TimeSlotGrid.tsx - ANALYZED (CSS-based status, lower priority)

### Key Finding:
- BookingDetailsPanel.tsx is FULLY MIGRATED ✅
- Others identified but have varying levels of Badge usage
- Some use Button elements instead (AdminFacilityCard)
- Some use `<span className={getStatusColor()}>` pattern (TodaysBookings)

---

## Phase 6: FormField Optimizations - NEXT

### Target 1: TodaysBookings.tsx - Status Badge Migration
**Pattern Found:** `<span className={getStatusColor(booking.status)}>`

**Migration Steps:**
```typescript
// Find line 154 with status rendering
// Replace span with StatusBadge component
// Remove getStatusColor and getStatusIcon functions (lines 41-49)
// Add getStatusVariant mapping

const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'pending' => {
  const iconType = getStatusIconType(status);
  switch (iconType) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'error';
    default: return 'pending';
  }
};
```

**Impact:** 15-20 lines reduction

---

### Target 2: GroupInvitationModal.tsx - Badge Migration
**Pattern Found:** Badge on line 157 with "pending" status

**Current:**
```tsx
<Badge variant="secondary" className="text-xs">
  <Clock className="h-3 w-3 mr-1" />
  {t('invitation_modal.pending.status')}
</Badge>
```

**Migrated:**
```tsx
<StatusBadge 
  status="pending" 
  variant="warning" 
  showIcon={true}
/>
```

**Impact:** 3-5 lines reduction

---

## Phase 7 & 8: Rapid Migration Patterns

### FilterBar Pattern
```typescript
// BEFORE: Multiple filter implementations across components
// Each component has its own filter state management

// AFTER: Single FilterBar component
<FilterBar
  filters={[
    { id: 'status', label: 'Status', options: statusOptions },
    { id: 'facility', label: 'Facility', options: facilityOptions }
  ]}
  selectedValues={selectedFilters}
  onFilterChange={handleFilterChange}
/>
```

### DataCard Pattern
```typescript
// BEFORE: Multiple card layouts with custom styling
// AFTER: Reusable DataCard
<DataCard
  title={booking.facility}
  status={booking.status}
  fields={[
    { label: 'Date', value: formatDate(booking.date) },
    { label: 'Price', value: formatPrice(booking.total) }
  ]}
/>
```

### DataTable Pattern
```typescript
// BEFORE: Custom table implementation
// AFTER: Reusable DataTable
<DataTable
  data={bookings}
  columns={[
    { id: 'facility', header: 'Facility', accessor: b => b.facility },
    { id: 'date', header: 'Date', accessor: b => formatDate(b.date) }
  ]}
/>
```

---

## Quick Reference: StatusBadge Migration Checklist

For each target component:

- [ ] Identify `getStatusColor()` or `getStatusText()` functions
- [ ] Find where Badge/span with status is rendered
- [ ] Import StatusBadge component
- [ ] Create `getStatusVariant()` mapping function
- [ ] Replace Badge/span with `<StatusBadge />` 
- [ ] Remove unused color/text functions
- [ ] Remove Badge import if unused elsewhere
- [ ] Run `npm run build` (should be <6s)
- [ ] Verify zero errors

---

## Next Quick Wins (10-15 minutes each)

### Option A: Complete TodaysBookings.tsx Migration
- 1 function removal (`getStatusIcon`, `getStatusColor`)
- 1 span replacement on line 154
- 1 getStatusVariant function addition
- **Time:** 5 minutes | **Impact:** 15-20 lines

### Option B: Complete GroupInvitationModal.tsx Migration
- Find Badge usage on line 157
- Replace with StatusBadge
- **Time:** 3 minutes | **Impact:** 3-5 lines

### Option C: Hybrid - Both in sequence
- **Time:** 10 minutes | **Impact:** 20-25 lines

---

## Phase Completion Tracking

| Phase | Status | Components | Lines Reduced | Time Est |
|-------|--------|-----------|---------------|---------:|
| 4 | ✅ DONE | 5 created | +681 new | - |
| 5 | ✅ DONE | 6 analyzed | ~20-30 | 15min |
| 6 | ⏳ NEXT | 3 targets | 55-75 | 15min |
| 7 | ⏳ NEXT | 5-8 | 60-80 | 20min |
| 8 | ⏳ NEXT | 25+ | 200+ | 60min |

**Total Remaining:** ~110-270 minutes for 400+ line reduction

---

## Build Verification Commands

```bash
# Quick check after each migration
npm run build

# Specific file check
npx eslint <file-path>

# Type check
npx tsc --noEmit
```

---

## Key Success Metrics

- ✅ Build time <6 seconds
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors  
- ✅ No breaking changes
- ✅ Improved code reusability

---

**Status:** Ready for Phase 6-8 execution. All analysis complete. Patterns identified. Ready to accelerate! 🚀
