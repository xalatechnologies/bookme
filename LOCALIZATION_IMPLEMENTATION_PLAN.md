# Complete Localization Implementation Plan

## Overview
This plan systematically localizes all hard-coded strings in the BookMe application, organized by specialized agent teams for different component groups.

## Database Infrastructure ✅
- **Status**: Already implemented
- **Tables**: `translation_keys`, `translations`, `localized_db_values`, `translation_history`
- **Functions**: `get_translation()`, `get_translations_by_namespace()`, `get_localized_db_value()`

## Agent Teams & Assignments

### Team 1: Filter & Sort Components
**Specialist**: Filter Localization Agent
**Components**:
- `SystemMessageFilters.tsx` - Hard-coded: "Systemmeldinger", "Alle", "System", "Booking", "Nyheter"
- `BookingFilters.tsx` - Hard-coded: "Alle", filter labels
- `FilterPanel.tsx` - Validate translation keys
- `SortDropdown.tsx` - Validate translation keys
- `FilterBar.tsx` (FacilitySearch) - Check all filter options

**Translation Keys Needed**:
```json
{
  "filters": {
    "all": "All",
    "system_messages": "System Messages",
    "message_types": {
      "all": "All",
      "system": "System",
      "booking": "Booking",
      "news": "News"
    }
  }
}
```

### Team 2: Status & Labels
**Specialist**: Status Label Localization Agent
**Components**:
- `EventContextMenu.tsx` - Hard-coded: "Se detaljer"
- `RecurringBookingGroup.tsx` - Hard-coded: "Alle bookinger fullført"
- `UserReceipts.tsx` - Hard-coded: "Status:" label
- Status badges across all components

**Translation Keys Needed**:
```json
{
  "status": {
    "label": "Status",
    "all_bookings_completed": "All bookings completed",
    "view_details": "View details"
  }
}
```

### Team 3: Card Components
**Specialist**: Card Localization Agent
**Components**:
- `KPICard.tsx` - Validate translation usage
- `FacilityCard.tsx` - Validate translation usage
- `BookingCard.tsx` - Validate translation usage
- Dashboard cards

**Tasks**:
- Verify all card text uses `t()` function
- No hard-coded values in card content
- Number/currency formatting via i18n

### Team 4: Select Boxes & Dropdowns
**Specialist**: Select Box Localization Agent
**Components**:
- All `<Select>` components with hard-coded options
- Facility type selectors
- Duration selectors
- Payment method selectors
- Year selectors

**Database Integration Needed**:
```sql
-- Insert facility types
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label)
VALUES
  ('facility_type', 'idrettshall', 'no', 'Idrettshall'),
  ('facility_type', 'idrettshall', 'en', 'Sports Hall'),
  ('facility_type', 'kulturhus', 'no', 'Kulturhus'),
  ('facility_type', 'kulturhus', 'en', 'Culture House');
```

### Team 5: Form Components
**Specialist**: Form Localization Agent
**Components**:
- All form labels
- Placeholder text
- Help text
- Validation messages

**Translation Namespaces**:
- `forms.json` (already exists)
- `validation.json` (already exists)

### Team 6: Admin Pages
**Specialist**: Admin Localization Agent
**Pages**:
- `FacilitiesPage.tsx` - Check filter/sort sections
- `BookingsPage.tsx` - Duration filters, facility type filters
- All admin dashboard components

**Translation Keys**:
- Already in `admin.json`, verify completeness

### Team 7: User Pages
**Specialist**: User Localization Agent
**Pages**:
- `UserReceipts.tsx` - Status filters
- User dashboard components
- Booking management pages

**Translation Keys**:
- Already in `user.json`, verify completeness

## Implementation Steps

### Phase 1: Audit & Discovery (Current)
- [x] Identify all hard-coded strings
- [x] Map to component groups
- [x] Assign to specialist agents
- [ ] Create missing translation keys list

### Phase 2: Database Localization
**Priority**: HIGH
**Agent**: Database Localization Specialist

**Tasks**:
1. Seed `localized_db_values` table with:
   - Facility types (idrettshall, kulturhus, møterom, hall)
   - Booking statuses (pending, paid, cancelled, etc.)
   - Message types (system, booking, news)
   - Duration options (1h, 2h, 4h, 8h)
   - Payment methods (visa, mastercard, invoice)

2. Create helper hook: `useLocalizedDbValue()`
```typescript
export const useLocalizedDbValue = (entityType: string, entityKey: string) => {
  const { i18n } = useTranslation();
  // Fetch from database or cache
  return localizedValue;
};
```

3. Create Select component wrapper:
```typescript
<LocalizedSelect
  entityType="facility_type"
  value={selectedType}
  onChange={setSelectedType}
/>
```

### Phase 3: Component Localization (Parallel)
Each team works independently on their assigned components.

**Team 1-7**: Replace hard-coded strings
- Import `useTranslation()`
- Replace strings with `t()` calls
- Add translation keys to JSON files
- Test both languages

### Phase 4: Translation File Updates
**Agent**: Translation File Manager

**Files to Update**:
1. `common.json` (EN & NO)
2. `user.json` (EN & NO)  
3. `admin.json` (EN & NO)
4. `facilities.json` (EN & NO)
5. `bookings.json` (EN & NO)

**Missing Keys to Add**:
```json
// common.json
{
  "filters": {
    "system_messages": "System Messages",
    "message_types": {
      "all": "All",
      "system": "System",
      "booking": "Booking",
      "news": "News"
    }
  },
  "labels": {
    "status": "Status"
  }
}
```

### Phase 5: Testing & Validation
**Agent**: QA Localization Tester

**Test Cases**:
1. Switch language between NO/EN
2. Verify all UI text changes
3. Check select boxes show translated options
4. Verify database-driven selects work
5. Test with missing translations (fallback)
6. Verify number/date formatting

### Phase 6: Documentation
**Agent**: Documentation Specialist

**Deliverables**:
1. Translation key naming conventions
2. How to add new translations
3. Database localization guide
4. Component localization examples

## Translation Key Naming Convention

```
namespace.category.subcategory.key

Examples:
- common.filters.all
- common.filters.message_types.system
- user.receipts.status.paid
- facilities.types.idrettshall
- bookings.duration.one_hour
```

## Database Seed Requirements

### Facility Types
| Entity Key | NO Label | EN Label |
|-----------|----------|----------|
| idrettshall | Idrettshall | Sports Hall |
| kulturhus | Kulturhus | Culture House |
| møterom | Møterom | Meeting Room |
| hall | Hall | Hall |

### Message Types
| Entity Key | NO Label | EN Label |
|-----------|----------|----------|
| system | System | System |
| booking | Booking | Booking |
| news | Nyheter | News |

### Duration Options
| Entity Key | NO Label | EN Label |
|-----------|----------|----------|
| 1h | 1 time | 1 hour |
| 2h | 2 timer | 2 hours |
| 4h | 4 timer | 4 hours |
| 8h | 8 timer | 8 hours |

## Success Criteria
- [ ] No hard-coded Norwegian text in UI
- [ ] All select boxes use database localization
- [ ] Language switch updates all UI elements
- [ ] Proper fallback to English
- [ ] Database values properly localized
- [ ] All translation keys documented
