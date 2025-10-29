# Supabase Integration & Data Normalization Guide

## 🎯 Overview

This guide provides step-by-step instructions for completing the Supabase integration and data normalization for the BookMe application.

## ✅ Completed Phase 1: Critical Fixes

All critical bugs have been fixed and the codebase is ready for migration:

### 1. Fixed Column Name Mismatches
- **File**: `src/services/supabase/bookings.service.ts`
- **Changes**: All `start_time` → `starts_at`, `end_time` → `ends_at`
- **Impact**: Booking queries will no longer fail

### 2. Created Data Normalization Migration
- **File**: `supabase/migrations/20251030000001_normalize_facility_data.sql`
- **Features**:
  - Adds `slug` field with auto-generation
  - Normalizes `facility_type` (Idrettshall → idrettshall)
  - Normalizes `amenities` arrays (Lyd/lys → lyd-lys)
  - Installs validation triggers
  - Creates performance indexes

### 3. Updated Seed Script
- **File**: `scripts/seed-database.ts`
- **Features**:
  - 7 facilities with normalized data and slugs
  - 6 zones with proper UUID format and pricing in cents
  - 6 additional services with proper schema
  - All using normalized localization keys

### 4. Updated TypeScript Types
- **File**: `src/types/database.ts`
- **Changes**: Added `slug: string` to facilities Row/Insert/Update types

---

## 🚀 Phase 2: Run Migration (Required Before Seeding)

### Step 1: Apply Migration via Supabase Dashboard

**Option A: SQL Editor (Recommended)**

1. Go to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/pfkggenadjqrzrtdghrr/sql/new
   ```

2. Open the migration file:
   ```bash
   supabase/migrations/20251030000001_normalize_facility_data.sql
   ```

3. Copy **all** contents (350+ lines)

4. Paste into SQL Editor

5. Click **"Run"** button

6. Verify success - you should see:
   ```
   ========================================
   Data Normalization Complete
   ========================================
   Facilities processed: X
   Zones with amenities: X
   ...
   ```

**Option B: Supabase CLI (Alternative)**

```bash
# Install CLI globally
npm install -g supabase

# Link to your project
supabase link --project-ref pfkggenadjqrzrtdghrr

# Push migration
supabase db push
```

### Step 2: Verify Migration Success

Run this query in Supabase SQL Editor to verify:

```sql
-- Check slug column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'facilities' AND column_name = 'slug';

-- Check normalization functions exist
SELECT proname FROM pg_proc
WHERE proname IN ('normalize_facility_type', 'normalize_amenity', 'generate_facility_slug');

-- Check triggers are installed
SELECT tgname FROM pg_trigger
WHERE tgname IN ('validate_facility_type_trigger', 'validate_facilities_amenities_trigger', 'auto_generate_facility_slug_trigger');
```

Expected: All queries should return results.

---

## 🌱 Phase 3: Seed Database

### Step 1: Run Seed Script

```bash
cd /Users/ibrahimrahmani/Documents/xaheen/bookme
npx tsx --env-file=.env.local scripts/seed-database.ts
```

### Step 2: Verify Seeded Data

**Expected Output:**
```
🌱 Starting database seeding...

🏢 Checking organizations...
✅ Using existing organization: drammen-kommune (fdd29683-...)

🏟️  Seeding facilities...
✅ Seeded 7 facilities

📍 Seeding zones...
✅ Seeded 6 zones

🛠️  Seeding additional services...
✅ Seeded 6 additional services
✅ Linked services to facilities

✅ Database seeding completed successfully!
```

**Verify in Supabase Dashboard:**

```sql
-- Check facilities
SELECT id, name, slug, facility_type, amenities
FROM facilities
ORDER BY created_at DESC
LIMIT 10;

-- Verify slugs
-- drammen-idrettshall, stromso-kulturhus, bragernes-møterom, etc.

-- Verify normalized facility types
-- idrettshall, kulturhus, møterom, fotballbane, svømmehall, tennisbane

-- Verify normalized amenities
-- ["garderober", "dusj", "parkering", "lyd-lys", "tribuner"]
```

---

## 📱 Phase 4: Component Migration (26 Components)

### Overview

Replace all `useFacilityStore()` calls with Supabase React Query hooks.

### Migration Pattern

**Before (Zustand)**:
```typescript
import { useFacilityStore } from '@/stores/facilityStore';

function MyComponent() {
  const { facilities, getFacilityById } = useFacilityStore();
  const facility = getFacilityById(id);

  return <div>{facility?.name}</div>;
}
```

**After (Supabase)**:
```typescript
import { useFacilities, useFacility } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId'; // You'll need to create this

function MyComponent() {
  const orgId = useOrganizationId(); // Get from context/auth
  const { data: facilities } = useFacilities(orgId);
  const { data: facility } = useFacility(id);

  return <div>{facility?.name}</div>;
}
```

### Components to Migrate

Run this to find all components using facilityStore:

```bash
cd /Users/ibrahimrahmani/Documents/xaheen/bookme
grep -r "useFacilityStore\|facilityStore" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

### Key Changes Required

1. **Organization ID Context**

Create `/src/hooks/useOrganizationId.ts`:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function useOrganizationId(): string {
  const { user } = useAuth();

  // TODO: Get org_id from user profile or default org
  // For now, use the Drammen Kommune org ID
  return 'fdd29683-8e3c-48be-bd2c-12d3c3ef028f';
}
```

2. **Update Facility Detail Pages**

Use slug for routing instead of ID:

```typescript
// pages/facilities/[slug].tsx
import { useParams } from 'next/navigation';
import { useFacilityBySlug } from '@/services/supabase/facilities.service';

export default function FacilityDetailPage() {
  const { slug } = useParams();
  const { data: facility, isLoading } = useFacilityBySlug(slug as string);

  // ...
}
```

3. **Add Missing Hook**

Add to `/src/services/supabase/facilities.service.ts`:

```typescript
/**
 * Hook to fetch facility by slug
 */
export const useFacilityBySlug = (
  slug: string,
  enabled = true
): UseQueryResult<Facility, Error> => {
  return useQuery({
    queryKey: [...facilityKeys.lists(), 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug && enabled,
  });
};
```

---

## 🎨 Phase 5: Localization Integration

### Use Localized Values

**For Facility Types:**

```typescript
import { useLocalizedDbValue } from '@/hooks/shared/useLocalizedDbValue';

function FacilityCard({ facility }) {
  const { getValue } = useLocalizedDbValue('facility_type');

  return (
    <div>
      <h2>{facility.name}</h2>
      <span>{getValue(facility.facility_type)}</span>
      {/* Shows "Idrettshall" in NO, "Sports Hall" in EN */}
    </div>
  );
}
```

**For Amenities:**

```typescript
import { useAmenityTranslation } from '@/hooks/shared/useLocalizedDbValue';

function AmenitiesList({ amenities }) {
  const translateAmenity = useAmenityTranslation();

  return (
    <ul>
      {amenities.map(amenity => (
        <li key={amenity}>{translateAmenity(amenity)}</li>
      ))}
    </ul>
  );
}
```

---

## 🧪 Phase 6: Testing

### 1. Test Facility Listing

```bash
# Check that facilities load from Supabase
# Navigate to: http://localhost:3000/facilities
```

Expected: See 7 facilities (Drammen Idrettshall, Strømsø Kulturhus, etc.)

### 2. Test Facility Detail

```bash
# Navigate to: http://localhost:3000/facilities/drammen-idrettshall
```

Expected: Facility details load correctly with slug-based routing

### 3. Test Localization

```bash
# Switch language between Norwegian and English
```

Expected:
- Facility types translate correctly
- Amenities translate correctly
- All labels use localized values

### 4. Test Bookings

```bash
# Create a test booking
```

Expected: Booking timestamps use `starts_at`/`ends_at` correctly

---

## 🐛 Troubleshooting

### Migration Fails

**Error**: `Could not find the 'slug' column`

**Solution**: Migration not run yet. Follow Phase 2 instructions.

---

**Error**: `Invalid facility_type: XYZ`

**Solution**: Validation trigger working! Use normalized keys:
- ✅ `idrettshall`, `kulturhus`, `møterom`
- ❌ `Idrettshall`, `Kulturhus`, `Møterom`

---

### Seed Script Fails

**Error**: `supabaseUrl is required`

**Solution**: Run with env file:
```bash
npx tsx --env-file=.env.local scripts/seed-database.ts
```

---

**Error**: `Foreign key violation`

**Solution**: Organization doesn't exist. Migration creates it automatically.

---

### Components Not Loading Data

**Issue**: Components show loading forever

**Check**:
1. Are you passing `orgId` to hooks?
2. Is user authenticated?
3. Check browser console for errors
4. Verify RLS policies allow read access

---

## 📊 Migration Checklist

Use this checklist to track your progress:

### Phase 1: Preparation ✅
- [x] Fix column name mismatches in bookings.service.ts
- [x] Create normalization migration SQL
- [x] Update seed script with normalized data
- [x] Update TypeScript types with slug field

### Phase 2: Database Migration ⏸️
- [ ] Run migration via Supabase Dashboard or CLI
- [ ] Verify slug column exists
- [ ] Verify normalization functions installed
- [ ] Verify validation triggers active

### Phase 3: Seed Data ⏸️
- [ ] Run seed script successfully
- [ ] Verify 7 facilities seeded
- [ ] Verify 6 zones seeded
- [ ] Verify 6 additional services seeded
- [ ] Check slugs are correct (drammen-idrettshall, etc.)
- [ ] Check facility types are normalized (idrettshall, etc.)
- [ ] Check amenities are normalized (lyd-lys, garderober, etc.)

### Phase 4: Component Migration ⏸️
- [ ] Create useOrganizationId hook
- [ ] Add useFacilityBySlug hook
- [ ] Migrate UserFacilities.tsx
- [ ] Migrate FacilitiesPage.tsx (admin)
- [ ] Migrate FacilitySearch/FilterBar.tsx
- [ ] Migrate all facility detail pages
- [ ] Update routing to use slugs
- [ ] Remove/deprecate facilityStore mock data

### Phase 5: Localization ⏸️
- [ ] Update all facility type displays to use getValue()
- [ ] Update all amenity displays to use translateAmenity()
- [ ] Test language switching (NO ↔ EN)
- [ ] Verify all labels translate correctly

### Phase 6: Testing ⏸️
- [ ] Test facility listing page
- [ ] Test facility detail pages (slug routing)
- [ ] Test facility search and filters
- [ ] Test booking creation (timestamps)
- [ ] Test localization switching
- [ ] End-to-end booking flow test

---

## 🎉 Success Criteria

Migration is complete when:

1. ✅ All 7 facilities visible in application
2. ✅ Facility URLs use slugs (e.g., `/facilities/drammen-idrettshall`)
3. ✅ Facility types show localized labels
4. ✅ Amenities show localized labels
5. ✅ Language switching works correctly (NO ↔ EN)
6. ✅ Bookings can be created successfully
7. ✅ No mock data being used (all from Supabase)
8. ✅ No TypeScript errors
9. ✅ No console errors in browser
10. ✅ All tests passing

---

## 📞 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Review Supabase Dashboard logs
3. Check browser console for errors
4. Verify environment variables are set
5. Ensure migration ran successfully

---

**Generated**: 2025-10-29
**Migration File**: `20251030000001_normalize_facility_data.sql`
**Status**: Ready for deployment 🚀
