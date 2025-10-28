# Complete Localization Implementation Guide

## ✅ Completed Work

### 1. Database Infrastructure (100% Complete)
**Migration**: `20251028000001_seed_localized_values.sql`

**Seeded Entity Types**:
- ✅ Facility Types (idrettshall, kulturhus, møterom, hall)
- ✅ Message Types (all, system, booking, news)
- ✅ Duration Options (1h, 2h, 4h, 8h, all)
- ✅ Payment Methods (visa, mastercard, invoice, all)
- ✅ Filter Categories (all, active, upcoming, past)
- ✅ Years (2023, 2024, 2025, all)
- ✅ Common Labels (status, view_details, all_bookings_completed)

**Database View Created**:
- `vw_localized_values` - Easy querying of active localized values

### 2. Custom Hooks (100% Complete)
**File**: `src/hooks/useLocalizedDbValue.ts`

**Features**:
- Fetches localized values from database
- Caches results for performance
- Automatic language switching
- Error handling
- Refresh capability

**Usage Example**:
```typescript
const { getValue, getOptions, loading } = useLocalizedDbValue('facility_type');

// Get single value
const label = getValue('idrettshall'); // "Sports Hall" or "Idrettshall"

// Get all options for select
const options = getOptions(); 
// [{ value: 'idrettshall', label: 'Sports Hall' }, ...]
```

### 3. Reusable Components (100% Complete)
**File**: `src/components/common/LocalizedSelect.tsx`

**Features**:
- Drop-in replacement for hardcoded selects
- Automatic database fetching
- Loading states
- Error handling
- Configurable to include/exclude "All" option

**Usage Example**:
```typescript
<LocalizedSelect
  entityType="facility_type"
  value={selectedType}
  onValueChange={setSelectedType}
  placeholder="Select facility type"
  includeAll={true}
/>
```

### 4. Translation Files Updated
**File**: `public/locales/en/common.json`

**Added Keys**:
```json
{
  "common": {
    "loading": "Loading...",
    "select_option": "Select an option",
    "no_options": "No options available",
    "system_messages": "System Messages",
    "view_details": "View details",
    "all_bookings_completed": "All bookings completed"
  }
}
```

### 5. Documentation Created
- ✅ `LOCALIZATION_IMPLEMENTATION_PLAN.md` - Complete implementation roadmap
- ✅ `LOCALIZATION_COMPLETE_GUIDE.md` - This file

## 🔄 Component Localization Status

### Priority 1: Hard-Coded Select Boxes (READY TO IMPLEMENT)

####  1. SystemMessageFilters.tsx
**Location**: `src/components/features/dashboard/user/SystemMessageFilters.tsx`

**Current Hard-Coded Values**:
```typescript
<CardTitle>Systemmeldinger</CardTitle>
<SelectItem value="all">Alle</SelectItem>
<SelectItem value="system">System</SelectItem>
<SelectItem value="booking">Booking</SelectItem>
<SelectItem value="news">Nyheter</SelectItem>
```

**Solution**:
```typescript
import { useTranslation } from 'react-i18next';
import { LocalizedSelect } from '@/components/common/LocalizedSelect';

const { t } = useTranslation('common');

// Replace title
<CardTitle>{t('common.system_messages')}</CardTitle>

// Replace select
<LocalizedSelect
  entityType="message_type"
  value={messageFilter}
  onValueChange={onFilterChange}
  includeAll={true}
  ariaLabel={t('aria.filter_system_messages')}
/>
```

#### 2. BookingFilters.tsx
**Location**: `src/components/features/dashboard/user/BookingFilters.tsx`

**Current Hard-Coded**: `{ value: "all", label: "Alle" }`

**Solution**: Use `t('common.all')` or LocalizedSelect with `filter_category` entity type

#### 3. Duration Selects (Admin BookingsPage)
**Location**: `src/pages/admin/BookingsPage.tsx:253-286`

**Solution**:
```typescript
<LocalizedSelect
  entityType="duration"
  value={filters.duration}
  onValueChange={(val) => setFilters({ ...filters, duration: val })}
  includeAll={true}
/>
```

#### 4. Facility Type Selects
**Location**: Multiple pages

**Solution**:
```typescript
<LocalizedSelect
  entityType="facility_type"
  value={filters.facilityType}
  onValueChange={(val) => setFilters({ ...filters, facilityType: val })}
  includeAll={true}
/>
```

#### 5. Payment Method Select (UserReceipts)
**Location**: `src/pages/user/UserReceipts.tsx`

**Solution**:
```typescript
<LocalizedSelect
  entityType="payment_method"
  value={filterPaymentMethod}
  onValueChange={setFilterPaymentMethod}
  includeAll={true}
/>
```

### Priority 2: Labels & Text

#### 1. EventContextMenu.tsx
**Hard-Coded**: "Se detaljer"
**Solution**: `t('common.view_details')`

#### 2. RecurringBookingGroup.tsx
**Hard-Coded**: "Alle bookinger fullført"
**Solution**: `t('common.all_bookings_completed')`

#### 3. Status Labels
**Hard-Coded**: "Status:"
**Solution**: `t('status.label')` or `t('common.status', { ns: 'common' })`

## 📋 Norwegian Translations Needed

Update `public/locales/no/common.json`:

```json
{
  "common": {
    "loading": "Laster...",
    "select_option": "Velg et alternativ",
    "no_options": "Ingen alternativer tilgjengelige",
    "system_messages": "Systemmeldinger",
    "view_details": "Se detaljer",
    "all_bookings_completed": "Alle bookinger fullført",
    "status": "Status"
  }
}
```

## 🚀 Implementation Steps

### Step 1: Update Norwegian Translations
```bash
# Edit public/locales/no/common.json
# Add the keys listed above
```

### Step 2: Fix SystemMessageFilters Component
```typescript
// File: src/components/features/dashboard/user/SystemMessageFilters.tsx
import { useTranslation } from 'react-i18next';
import { LocalizedSelect } from '@/components/common/LocalizedSelect';

// Replace hardcoded strings
const { t } = useTranslation('common');

return (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <CardTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        {t('common.system_messages')}
      </CardTitle>
      {/* ... rest of component */}
    </div>
    <div className="flex items-center space-x-2">
      <LocalizedSelect
        entityType="message_type"
        value={messageFilter}
        onValueChange={onFilterChange}
        className="w-[180px]"
        ariaLabel={t('aria.filter_system_messages', 'Filter system messages')}
        includeAll={true}
      />
    </div>
  </div>
);
```

### Step 3: Fix BookingFilters Component
```typescript
// File: src/components/features/dashboard/user/BookingFilters.tsx
import { LocalizedSelect } from '@/components/common/LocalizedSelect';

// Replace hardcoded options
<LocalizedSelect
  entityType="filter_category"
  value={bookingFilter}
  onValueChange={onFilterChange}
  includeAll={true}
/>
```

### Step 4: Fix Duration Selects
```typescript
// In any component with duration select
<LocalizedSelect
  entityType="duration"
  value={duration}
  onValueChange={setDuration}
  includeAll={true}
/>
```

### Step 5: Fix Facility Type Selects
```typescript
// In FacilitiesPage, BookingsPage, etc.
<LocalizedSelect
  entityType="facility_type"
  value={facilityType}
  onValueChange={setFacilityType}
  includeAll={true}
/>
```

### Step 6: Fix Payment Method Select
```typescript
// In UserReceipts
<LocalizedSelect
  entityType="payment_method"
  value={paymentMethod}
  onValueChange={setPaymentMethod}
  includeAll={true}
/>
```

### Step 7: Fix Remaining Labels
Replace all instances of hardcoded strings with `t()` calls:

```typescript
// Before
<span>Status:</span>

// After
<span>{t('common.status')}:</span>

// Before  
"Se detaljer"

// After
{t('common.view_details')}
```

## 🧪 Testing Checklist

- [ ] Switch language to English - all selects show English labels
- [ ] Switch language to Norwegian - all selects show Norwegian labels
- [ ] All hard-coded "Alle" replaced with localized version
- [ ] Facility type selects work in all pages
- [ ] Duration selects work correctly
- [ ] Payment method select works
- [ ] Message type filter works
- [ ] No console errors related to translations
- [ ] All labels switch language correctly
- [ ] Database values cache properly
- [ ] Select components show loading state
- [ ] Fallback to English works if Norwegian missing

## 📊 Progress Tracking

### Database Layer
- [x] Migration created
- [x] Values seeded
- [x] View created
- [x] Migration pushed to remote

### Code Layer
- [x] Hook created (`useLocalizedDbValue`)
- [x] Component created (`LocalizedSelect`)
- [x] English translations added
- [ ] Norwegian translations added
- [ ] Components updated (0/15)

### Components to Update
- [ ] SystemMessageFilters.tsx
- [ ] BookingFilters.tsx
- [ ] EventContextMenu.tsx
- [ ] RecurringBookingGroup.tsx
- [ ] UserReceipts.tsx (payment method, status label)
- [ ] BookingsPage.tsx (duration, facility type)
- [ ] FacilitiesPage.tsx (facility type)
- [ ] FilterBar.tsx (facility types)
- [ ] All status label instances
- [ ] All "view details" instances

## 🔧 Maintenance

### Adding New Localized Values

```sql
-- Add to database
INSERT INTO localized_db_values (entity_type, entity_key, language_code, label, sort_order)
VALUES
  ('your_type', 'your_key', 'no', 'Norwegian Label', 1),
  ('your_type', 'your_key', 'en', 'English Label', 1);
```

### Using in Components

```typescript
// Option 1: Use LocalizedSelect
<LocalizedSelect
  entityType="your_type"
  value={value}
  onValueChange={setValue}
/>

// Option 2: Use hook directly
const { getValue, getOptions } = useLocalizedDbValue('your_type');
const label = getValue('your_key');
```

### Clear Cache After Database Updates

```typescript
import { clearLocalizedCache } from '@/hooks/useLocalizedDbValue';

// After updating database values
clearLocalizedCache();
```

## 🎯 Next Steps

1. **Immediate**: Add Norwegian translations to `common.json`
2. **Phase 1**: Update all Select components (highest visibility)
3. **Phase 2**: Update all text labels
4. **Phase 3**: Test thoroughly in both languages
5. **Phase 4**: Document any edge cases
6. **Phase 5**: Create automated tests for localization

## 💡 Best Practices

1. **Always use LocalizedSelect for database-driven options**
   - Don't hardcode select options
   - Let database manage translations

2. **Use translation keys for UI text**
   - Consistent naming: `namespace.category.key`
   - Descriptive keys: `common.view_details` not `common.btn1`

3. **Cache management**
   - Cache clears on language change automatically
   - Manual clear only needed after database updates

4. **Fallbacks**
   - Always provide English fallback
   - Use default values in `t()` calls

5. **Testing**
   - Test both languages
   - Test with missing translations
   - Test database connection failures

## 🚨 Common Issues & Solutions

**Issue**: Select shows no options
**Solution**: Check database connection, verify entity_type name

**Issue**: Language doesn't switch
**Solution**: Clear cache with `clearLocalizedCache()`

**Issue**: Wrong translation shown
**Solution**: Check language_code in database matches i18n language

**Issue**: "Loading..." never disappears
**Solution**: Check network tab for database errors, verify RLS policies

## 📚 Additional Resources

- [i18next Documentation](https://www.i18next.com/)
- [React i18next Documentation](https://react.i18next.com/)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- Translation management in `supabase/migrations/20251027000002_localization_tables.sql`
