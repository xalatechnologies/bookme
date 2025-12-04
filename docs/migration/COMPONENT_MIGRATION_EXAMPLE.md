# Component Migration Example

## Overview

This guide shows step-by-step how to migrate a component from Zustand + localStorage to Supabase + React Query.

---

## Example: Facility List Component

### Before (Zustand + localStorage)

```tsx
// OLD: Using Zustand store with localStorage persistence
import React from 'react';
import { useFacilityStore } from '@/stores/facilityStore';
import { FacilityCard } from '@/components/FacilityCard';

export const FacilityList = (): JSX.Element => {
  // Get facilities from Zustand store (localStorage)
  const { facilities, updateFacility, deleteFacility } = useFacilityStore();

  // Get only published facilities
  const publishedFacilities = facilities.filter(f => f.status === 'published');

  return (
    <div className="facility-list">
      <h1>Available Facilities</h1>

      {publishedFacilities.map(facility => (
        <FacilityCard
          key={facility.id}
          facility={facility}
          onUpdate={(id, updates) => updateFacility(id, updates)}
          onDelete={(id) => deleteFacility(id)}
        />
      ))}
    </div>
  );
};
```

**Problems with this approach:**
- ❌ Data is hardcoded (initialFacilities in store)
- ❌ No loading states
- ❌ No error handling
- ❌ Data doesn't sync across devices
- ❌ No multi-user collaboration
- ❌ localStorage can be cleared
- ❌ No server-side validation

---

### After (Supabase + React Query)

```tsx
// NEW: Using Supabase service with React Query
import React from 'react';
import { useFacilities, useUpdateFacility, useDeleteFacility } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FacilityCard } from '@/components/FacilityCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export const FacilityList = (): JSX.Element => {
  // Get current organization from auth context
  const { currentOrgId } = useAuth();

  // Fetch facilities from Supabase (with caching, loading, error states)
  const {
    data: facilities,
    isLoading,
    error,
    refetch,
  } = useFacilities(currentOrgId!);

  // Mutation hooks for updates and deletes
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Handle empty state
  if (!facilities || facilities.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">No facilities found</p>
      </div>
    );
  }

  return (
    <div className="facility-list">
      <h1>Available Facilities</h1>

      {facilities.map(facility => (
        <FacilityCard
          key={facility.id}
          facility={facility}
          onUpdate={(id, updates) => {
            updateFacility.mutate(
              { id, updates },
              {
                onSuccess: () => {
                  // Success handled automatically by React Query
                  console.log('Facility updated successfully');
                },
                onError: (err) => {
                  console.error('Failed to update facility:', err);
                  alert('Failed to update facility. Please try again.');
                },
              }
            );
          }}
          onDelete={(id) => {
            if (confirm('Are you sure you want to delete this facility?')) {
              deleteFacility.mutate(id, {
                onSuccess: () => {
                  console.log('Facility deleted successfully');
                },
                onError: (err) => {
                  console.error('Failed to delete facility:', err);
                  alert('Failed to delete facility. Please try again.');
                },
              });
            }
          }}
          isUpdating={updateFacility.isPending}
          isDeleting={deleteFacility.isPending}
        />
      ))}
    </div>
  );
};
```

**Benefits of this approach:**
- ✅ Real data from Supabase database
- ✅ Loading states handled properly
- ✅ Error handling with retry
- ✅ Syncs across all devices
- ✅ Multi-user collaboration ready
- ✅ Persistent in database
- ✅ Server-side validation via RLS
- ✅ Automatic cache invalidation
- ✅ Optimistic updates possible
- ✅ Type-safe throughout

---

## Step-by-Step Migration Process

### Step 1: Identify Dependencies

**Before migration, identify:**
1. Which store is being used? (`useFacilityStore`)
2. What data is needed? (`facilities`)
3. What operations are performed? (`updateFacility`, `deleteFacility`)
4. What filters are applied? (`status === 'published'`)

### Step 2: Find Corresponding Service

Check `src/services/supabase/index.ts` for the right service:

```tsx
// For facilities, use:
import {
  useFacilities,
  usePublishedFacilities, // If you only need published
  useUpdateFacility,
  useDeleteFacility,
} from '@/services/supabase';
```

### Step 3: Add Auth Context

Most queries need organization ID:

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { currentOrgId, user } = useAuth();
```

### Step 4: Replace Store Hook with Service Hook

```tsx
// Before
const { facilities } = useFacilityStore();

// After
const { data: facilities, isLoading, error } = useFacilities(currentOrgId!);
```

### Step 5: Add Loading and Error States

```tsx
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### Step 6: Update Mutation Calls

```tsx
// Before
updateFacility(id, updates);

// After
updateFacility.mutate({ id, updates }, {
  onSuccess: () => { /* success handler */ },
  onError: (err) => { /* error handler */ },
});
```

### Step 7: Remove Store Import

```tsx
// Delete this line
import { useFacilityStore } from '@/stores/facilityStore';
```

### Step 8: Test Thoroughly

- ✅ Component renders
- ✅ Data loads from database
- ✅ Loading state shows
- ✅ Error state shows (test by stopping Supabase)
- ✅ Updates work
- ✅ Deletes work
- ✅ Cache invalidates properly

---

## More Complex Example: Facility Detail with Zones

### Before

```tsx
import { useFacilityStore } from '@/stores/facilityStore';
import { useZoneStore } from '@/stores/zoneStore';

export const FacilityDetail = ({ id }: { id: string }) => {
  const { getFacilityById } = useFacilityStore();
  const { getZonesByFacility } = useZoneStore();

  const facility = getFacilityById(id);
  const zones = getZonesByFacility(id);

  if (!facility) return <div>Not found</div>;

  return (
    <div>
      <h1>{facility.name}</h1>
      <p>{facility.description}</p>

      <h2>Zones</h2>
      {zones.map(zone => (
        <div key={zone.id}>{zone.name}</div>
      ))}
    </div>
  );
};
```

### After

```tsx
import { useFacilityWithZones } from '@/services/supabase';
import { useRealtimeBookings } from '@/hooks';

export const FacilityDetail = ({ id }: { id: string }) => {
  // Fetch facility with zones in one query
  const {
    data: facility,
    isLoading,
    error,
  } = useFacilityWithZones(id);

  // Enable real-time updates for bookings
  useRealtimeBookings(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!facility) return <NotFound />;

  return (
    <div>
      <h1>{facility.name}</h1>
      <p>{facility.description}</p>

      <h2>Zones ({facility.zones?.length || 0})</h2>
      {facility.zones?.map(zone => (
        <ZoneCard key={zone.id} zone={zone} />
      ))}
    </div>
  );
};
```

**Benefits:**
- ✅ Single query fetches facility + zones
- ✅ Real-time updates for bookings
- ✅ Proper loading/error states
- ✅ Type-safe zone access

---

## Example: Favorites Toggle

### Before

```tsx
import { useFavoritesStore } from '@/stores/favoritesStore';

export const FavoriteButton = ({ facilityId }: { facilityId: string }) => {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFavorite = favorites.includes(facilityId);

  return (
    <button onClick={() => toggleFavorite(facilityId)}>
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
};
```

### After

```tsx
import { useIsFavorite, useToggleFavorite } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const FavoriteButton = ({ facilityId }: { facilityId: string }) => {
  const { user } = useAuth();
  const { data: isFavorite, isLoading } = useIsFavorite(user?.id!, facilityId);
  const toggleFavorite = useToggleFavorite();

  const handleClick = () => {
    toggleFavorite.mutate({
      userId: user!.id,
      facilityId,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || toggleFavorite.isPending}
      className={isFavorite ? 'text-red-500' : 'text-gray-400'}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
};
```

**Benefits:**
- ✅ Optimistic updates (instant UI feedback)
- ✅ Syncs across devices
- ✅ Persisted in database
- ✅ Disabled during loading

---

## Migration Checklist

For each component:

- [ ] Identify Zustand store usage
- [ ] Find corresponding Supabase service
- [ ] Add `useAuth()` if needed for orgId/userId
- [ ] Replace store hook with service hook
- [ ] Add loading state handling
- [ ] Add error state handling
- [ ] Add empty state handling (optional)
- [ ] Update mutation calls with `.mutate()`
- [ ] Add success/error callbacks
- [ ] Remove store import
- [ ] Test component thoroughly
- [ ] Check network tab (should see Supabase requests)
- [ ] Test with Supabase stopped (error state)
- [ ] Test with slow network (loading state)
- [ ] Verify cache invalidation works

---

## Common Patterns

### Pattern 1: List + Create

```tsx
const { data: items, isLoading } = useItems(orgId);
const createItem = useCreateItem();

return (
  <div>
    {isLoading ? <Loading /> : items?.map(...)}

    <button onClick={() => createItem.mutate(newItem)}>
      Create
    </button>
  </div>
);
```

### Pattern 2: Detail + Update

```tsx
const { data: item, isLoading } = useItem(id);
const updateItem = useUpdateItem();

if (isLoading) return <Loading />;

return (
  <Form
    initialValues={item}
    onSubmit={(values) => updateItem.mutate({ id, updates: values })}
  />
);
```

### Pattern 3: List with Real-time

```tsx
const { data: bookings } = useFacilityBookings(facilityId);

// Enable real-time updates
useRealtimeBookings(facilityId);

return <Calendar events={bookings} />;
```

### Pattern 4: Optimistic Favorites

```tsx
const { data: isFavorite } = useIsFavorite(userId, itemId);
const toggle = useToggleFavorite();

// Toggle immediately updates UI, reverts on error
return (
  <button onClick={() => toggle.mutate({ userId, itemId })}>
    {isFavorite ? 'Unfavorite' : 'Favorite'}
  </button>
);
```

---

## Troubleshooting

### Issue: "Cannot read property 'id' of undefined"

**Cause:** Data not loaded yet, accessing `facilities.id` when `facilities` is undefined.

**Fix:** Add loading check:
```tsx
if (isLoading || !facilities) return <LoadingSpinner />;
```

### Issue: "RLS policy violated"

**Cause:** User doesn't have permission to access this data.

**Fix:** Check auth and org membership:
```tsx
const { user, currentOrgId } = useAuth();
console.log({ user, currentOrgId }); // Debug

if (!user) return <LoginPrompt />;
if (!currentOrgId) return <SelectOrganization />;
```

### Issue: Data doesn't update after mutation

**Cause:** Query cache not invalidated.

**Fix:** Service hooks already handle this, but verify:
```tsx
const update = useUpdateItem();

update.mutate(data, {
  onSuccess: () => {
    // Should auto-invalidate, but can force:
    queryClient.invalidateQueries({ queryKey: itemKeys.all });
  }
});
```

---

## Next Steps

1. **Start with simple components** - Lists and detail views
2. **Move to forms** - Create and update operations
3. **Add real-time** - Chat, notifications, live calendars
4. **Optimize** - Add pagination, infinite scroll, etc.

---

**Created:** 2024-10-26
**Status:** Ready to migrate components
**Difficulty:** Medium
**Time per component:** 20-60 minutes depending on complexity
