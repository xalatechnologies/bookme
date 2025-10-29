# Component Migration Examples - facilityStore to Supabase

This document provides concrete before/after examples for migrating components from `facilityStore` (Zustand) to Supabase React Query hooks.

## ✅ Completed Migrations

### 1. useCalendarView Hook ✅

**File**: `src/components/features/calendar/hooks/useCalendarView.ts`

**Changes**:
- ✅ Replaced `useFacilityStore()` with `usePublishedFacilities(orgId)`
- ✅ Added `useOrganizationId()` hook for context
- ✅ Updated field names: `type` → `facility_type`, `location` → `address/area`
- ✅ Updated capacity handling with null checks
- ✅ Integrated React Query loading states

### 2. useGlobalSearch Hook ✅

**File**: `src/components/features/search/hooks/useGlobalSearch.ts`

**Changes**:
- ✅ Replaced `useFacilityStore()` with `usePublishedFacilities(orgId)`
- ✅ Updated all field names to Supabase schema
- ✅ Changed facility URLs to use slugs: `/facilities/${facility.slug || facility.id}`
- ✅ Updated search to use `facility_type`, `address`, `area` fields
- ✅ Added null safety for optional fields

### 3. useDashboardData Hook ✅

**File**: `src/components/features/dashboard/hooks/useDashboardData.ts`

**Changes**:
- ✅ Replaced `useFacilityStore()` with `useFacilities(orgId)`
- ✅ Integrated React Query loading states with local loading state
- ✅ Added proper loading state composition
- ✅ Ensured dashboard only calculates when facilities are loaded

---

## 📋 Remaining Migrations

### Migration Pattern Template

**Before (Zustand)**:
```typescript
import { useFacilityStore, type IFacility } from '@/stores/facilityStore';

export const MyComponent = (): JSX.Element => {
  const { facilities, getFacilityById } = useFacilityStore();
  const facility = getFacilityById(id);

  return <div>{facility?.name}</div>;
};
```

**After (Supabase)**:
```typescript
import { useFacilities, useFacility } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

export const MyComponent = (): JSX.Element => {
  const orgId = useOrganizationId();
  const { data: facilities = [], isLoading } = useFacilities(orgId);
  const { data: facility } = useFacility(id);

  if (isLoading) return <LoadingSpinner />;

  return <div>{facility?.name}</div>;
};
```

---

## 🔄 Pending Component Migrations

### 4. MapView Component

**File**: `src/components/features/facilities/components/FacilityMap/MapView.tsx`

**Before**:
```typescript
import { useFacilityStore } from '@/stores/facilityStore';

const { getPublishedFacilities, getAdminFacilities } = useFacilityStore();
```

**After**:
```typescript
import { usePublishedFacilities, useFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';

const orgId = useOrganizationId();
const { data: publishedFacilities = [] } = usePublishedFacilities(orgId);
const { data: adminFacilities = [] } = useFacilities(orgId); // For admin view
```

**Field Updates**:
- `facility.type` → `facility.facility_type`
- `facility.location` → `facility.address` or `facility.area`
- `facility.images` → `facility.images` (JSONB array)

---

### 5. InfiniteScrollFacilities Component

**File**: `src/components/features/facilities/components/FacilitySearch/InfiniteScrollFacilities.tsx`

**Before**:
```typescript
import { useFacilityStore } from "@/stores/facilityStore";

const { getPublishedFacilities } = useFacilityStore();
const facilities = getPublishedFacilities();
```

**After**:
```typescript
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';

const orgId = useOrganizationId();
const { data: facilities = [], isLoading } = usePublishedFacilities(orgId);
```

**Pagination Pattern** (future enhancement):
```typescript
// For true infinite scroll, consider using React Query's useInfiniteQuery
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['facilities', 'infinite', orgId],
  queryFn: ({ pageParam = 0 }) =>
    facilitiesService.getPaginated(orgId, pageParam, 20),
  getNextPageParam: (lastPage, pages) =>
    lastPage.length === 20 ? pages.length : undefined,
});
```

---

### 6. FacilityGrid Component

**File**: `src/components/features/facilities/components/FacilitySearch/FacilityGrid.tsx`

**Before**:
```typescript
import { useFacilityStore } from '@/stores/facilityStore';

const { getPublishedFacilities } = useFacilityStore();
const facilities = getPublishedFacilities();
```

**After**:
```typescript
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';

const orgId = useOrganizationId();
const { data: facilities = [], isLoading, error } = usePublishedFacilities(orgId);

if (isLoading) return <LoadingGrid />;
if (error) return <ErrorMessage error={error} />;
```

---

### 7. FacilityEditForm Component (MUTATIONS)

**File**: `src/components/features/facilities/components/FacilityEditForm/FacilityEditForm.tsx`

**Before**:
```typescript
import { useFacilityStore } from "@/stores/facilityStore";

const { updateFacility } = useFacilityStore();

const handleSubmit = (data: IFacility) => {
  updateFacility(facility.id, data);
};
```

**After**:
```typescript
import { useUpdateFacility } from '@/services/supabase/facilities.service';
import type { Database } from '@/types/database';

type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

const updateFacility = useUpdateFacility();

const handleSubmit = (data: FacilityUpdate) => {
  updateFacility.mutate(
    { id: facility.id, updates: data },
    {
      onSuccess: (updatedFacility) => {
        toast.success('Facility updated!');
        navigate(`/admin/facilities/${updatedFacility.slug}`);
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      }
    }
  );
};
```

**Form Field Mapping**:
```typescript
// Old facilityStore fields → New Supabase schema
{
  name: string                  // Same
  type: string                  // → facility_type: string
  description: string           // Same
  location: string              // → address: string
  capacity: number              // Same
  amenities: string[]           // Same (but normalized keys)
  images: string[]              // Same (JSONB)
  status: string                // Same
  area: string                  // Same (e.g., "Drammen Sentrum")
  price_per_hour: number        // → price_per_hour_cents: number (multiply by 100!)
}
```

---

### 8. useFacility Hook

**File**: `src/components/features/facilities/hooks/useFacility.ts`

**Before**:
```typescript
import { useFacilityStore, type IFacility } from '@/stores/facilityStore';

export const useFacility = (id: string | undefined) => {
  const { getFacilityById } = useFacilityStore();

  if (!id) return null;

  const facility = getFacilityById(id);
  return facility;
};
```

**After**:
```typescript
import { useFacility as useSupabaseFacility } from '@/services/supabase/facilities.service';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

export const useFacility = (id: string | undefined) => {
  const { data: facility, isLoading, error } = useSupabaseFacility(id || '', !!id);

  return {
    facility,
    isLoading,
    error
  };
};
```

**Or use the slug-based version**:
```typescript
import { useFacilityBySlug } from '@/services/supabase/facilities.service';

export const useFacilityBySlug = (slug: string | undefined) => {
  const { data: facility, isLoading, error } = useSupabaseFacility(slug || '', !!slug);

  return {
    facility,
    isLoading,
    error
  };
};
```

---

## 🎯 Type Migration Pattern

### Replace IFacility with Supabase Types

**Before**:
```typescript
import type { IFacility } from "@/stores/facilityStore";

interface ComponentProps {
  readonly facility: IFacility;
}
```

**After**:
```typescript
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

interface ComponentProps {
  readonly facility: Facility;
}
```

**For Insert Operations**:
```typescript
type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];

// Use when creating new facilities
const newFacility: FacilityInsert = {
  org_id: orgId,
  name: 'New Facility',
  facility_type: 'idrettshall',
  // slug is auto-generated by trigger
  // ...
};
```

**For Update Operations**:
```typescript
type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

// Use when updating facilities (all fields optional)
const updates: FacilityUpdate = {
  name: 'Updated Name',
  status: 'published',
  // Only include fields you want to update
};
```

---

## 🔧 Common Field Mappings

| Old (facilityStore) | New (Supabase) | Notes |
|---------------------|----------------|-------|
| `id: number` | `id: string` | UUID format |
| `type` | `facility_type` | Normalized keys (e.g., 'idrettshall') |
| `location` | `address` or `area` | `address` for full address, `area` for district |
| `images: string[]` | `images: string[]` | JSONB array |
| `amenities: string[]` | `amenities: string[]` | JSONB array with normalized keys |
| `price` | `price_per_hour_cents` | Multiply by 100 (850 NOK → 85000 cents) |
| `rating` | `rating` | Same (decimal) |
| `reviewCount` | `review_count` | Snake_case |
| `accessibilityFeatures` | `accessibility_features` | JSONB array |
| `status` | `status` | Same (draft, published, archived) |

---

## ✨ Loading States Pattern

### Single Query
```typescript
const { data: facility, isLoading, error } = useFacility(id);

if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
if (!facility) return <NotFound />;

return <div>{facility.name}</div>;
```

### Multiple Queries
```typescript
const orgId = useOrganizationId();
const { data: facilities = [], isLoading: facilitiesLoading } = useFacilities(orgId);
const { data: zones = [], isLoading: zonesLoading } = useFacilityZones(facilityId);

const isLoading = facilitiesLoading || zonesLoading;

if (isLoading) return <LoadingState />;
```

### Mutations
```typescript
const updateFacility = useUpdateFacility();

<button
  onClick={handleSave}
  disabled={updateFacility.isPending}
>
  {updateFacility.isPending ? 'Saving...' : 'Save'}
</button>

{updateFacility.isError && (
  <ErrorMessage>{updateFacility.error.message}</ErrorMessage>
)}
```

---

## 🎨 URL Routing Updates

### Use Slugs Instead of IDs

**Before**:
```typescript
navigate(`/facilities/${facility.id}`);
```

**After**:
```typescript
navigate(`/facilities/${facility.slug || facility.id}`);
```

**Page Routing**:
```typescript
// pages/FacilityDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useFacilityBySlug } from '@/services/supabase/facilities.service';

export const FacilityDetailPage = (): JSX.Element => {
  const { slug } = useParams();
  const { data: facility, isLoading } = useFacilityBySlug(slug!);

  if (isLoading) return <LoadingPage />;
  if (!facility) return <NotFound />;

  return <FacilityDetail facility={facility} />;
};
```

---

## 📊 Migration Checklist

For each component/hook, verify:

- [ ] Replaced `useFacilityStore()` with appropriate Supabase hook
- [ ] Added `useOrganizationId()` where needed
- [ ] Updated all field names to match Supabase schema
- [ ] Changed `IFacility` type to Supabase `Facility` type
- [ ] Added loading state handling
- [ ] Added error state handling
- [ ] Updated URLs to use slugs instead of IDs
- [ ] Converted prices to cents (multiply by 100)
- [ ] Used normalized keys for facility_type and amenities
- [ ] Added null safety for optional fields
- [ ] Removed facilityStore import

---

## 🚀 Next Steps After Component Migration

1. **Update Routing** - Change all facility routes from ID-based to slug-based
2. **Integrate Localization** - Use `useLocalizedDbValue()` for facility_type and amenities
3. **Test End-to-End** - Verify all CRUD operations work with Supabase
4. **Remove facilityStore** - Deprecate or remove the Zustand store entirely
5. **Update Documentation** - Document the new Supabase-first architecture

---

**Generated**: 2025-10-29
**Status**: 3/11 components migrated, 8 remaining
**Next Priority**: MapView component (high-impact user-facing feature)
