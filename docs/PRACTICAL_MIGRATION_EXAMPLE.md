# Practical Migration Example: FacilityCard Component

## Overview

This document shows a **real-world example** of migrating the `FacilityCard` component from local state to Supabase + React Query for the favorites feature.

---

## Current Implementation (BEFORE)

**File:** `src/components/facility/FacilityCard.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Heart, Share2 } from 'lucide-react';

import { useTranslation } from '@/i18n';
import type { IFacility } from '@/stores/facilityStore';
import { useFieldConfigStore } from '@/stores/fieldConfigStore';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FacilityCardProps {
  readonly facility: IFacility;
  readonly onAddressClick: (e: React.MouseEvent, facility: IFacility) => void;
  readonly viewMode?: "grid" | "list";
}

export const FacilityCard = ({
  facility,
  onAddressClick,
  viewMode = "grid"
}: FacilityCardProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ❌ PROBLEM: Local state, doesn't persist or sync
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facility.id);

  const handleCardClick = (): void => {
    navigate(`/facilities/${facility.id}`);
  };

  // ❌ PROBLEM: Favorite state resets on page reload
  const handleFavorite = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <Card>
      {/* ... Card content ... */}

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        className="p-2 rounded-full bg-white/90 backdrop-blur-sm"
        aria-label="Legg til favoritter"
      >
        <Heart
          className={`h-4 w-4 ${
            isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      </button>

      {/* ... Rest of card ... */}
    </Card>
  );
};
```

### Problems with Current Implementation

1. **❌ No persistence** - Favorites reset on page reload
2. **❌ No sync** - Favorites don't sync across devices
3. **❌ No loading state** - Button always enabled
4. **❌ No error handling** - Silent failures
5. **❌ Wrong initial state** - Always starts as `false`, even if favorited before
6. **❌ No optimistic updates** - UI waits for server response

---

## Migrated Implementation (AFTER)

**File:** `src/components/facility/FacilityCard.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Heart, Share2, Loader2 } from 'lucide-react';

import { useTranslation } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import type { IFacility } from '@/stores/facilityStore';
import { useFieldConfigStore } from '@/stores/fieldConfigStore';

// ✅ Import Supabase hooks
import { useIsFavorite, useToggleFavorite } from '@/services/supabase';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface FacilityCardProps {
  readonly facility: IFacility;
  readonly onAddressClick: (e: React.MouseEvent, facility: IFacility) => void;
  readonly viewMode?: "grid" | "list";
}

export const FacilityCard = ({
  facility,
  onAddressClick,
  viewMode = "grid"
}: FacilityCardProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Get current user from auth context
  const { user } = useAuth();

  // ✅ Fetch favorite status from Supabase (with caching!)
  const {
    data: isFavorited = false,
    isLoading: isFavoriteLoading
  } = useIsFavorite(user?.id!, facility.id);

  // ✅ Toggle favorite mutation with optimistic updates
  const toggleFavorite = useToggleFavorite();

  const [isHovered, setIsHovered] = useState(false);

  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facility.id);

  const handleCardClick = (): void => {
    navigate(`/facilities/${facility.id}`);
  };

  // ✅ NEW: Persist favorite state to Supabase with optimistic updates
  const handleFavorite = (e: React.MouseEvent): void => {
    e.stopPropagation();

    // ✅ Check if user is logged in
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('favorites.loginToFavorite'),
        variant: 'default',
      });
      return;
    }

    // ✅ Toggle favorite with optimistic update
    toggleFavorite.mutate(
      { userId: user.id, facilityId: facility.id },
      {
        onSuccess: () => {
          // ✅ Show success message
          toast({
            title: isFavorited
              ? t('favorites.removed')
              : t('favorites.added'),
            description: facility.name,
            variant: 'default',
          });
        },
        onError: (error) => {
          // ✅ Show error message (optimistic update auto-reverts)
          console.error('Failed to toggle favorite:', error);
          toast({
            title: t('favorites.error'),
            description: t('favorites.tryAgain'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Card>
      {/* ... Card content ... */}

      {/* ✅ NEW: Favorite button with loading state */}
      <button
        onClick={handleFavorite}
        disabled={isFavoriteLoading || toggleFavorite.isPending}
        className="p-2 rounded-full bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label={
          isFavorited
            ? t('favorites.removeFromFavorites')
            : t('favorites.addToFavorites')
        }
      >
        {toggleFavorite.isPending ? (
          // ✅ Show loading spinner while mutating
          <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
        ) : (
          // ✅ Show heart icon (filled if favorited)
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorited
                ? 'fill-red-500 text-red-500'
                : 'text-gray-600 hover:text-red-400'
            }`}
          />
        )}
      </button>

      {/* ... Rest of card ... */}
    </Card>
  );
};
```

---

## Migration Steps

### Step 1: Import Required Hooks

```typescript
// Add these imports at the top
import { useAuth } from '@/contexts/AuthContext';
import { useIsFavorite, useToggleFavorite } from '@/services/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
```

### Step 2: Get User from Auth Context

```typescript
// Inside component
const { user } = useAuth();
```

### Step 3: Replace Local State with React Query Hooks

```typescript
// ❌ OLD: Local state
const [isFavorited, setIsFavorited] = useState(false);

// ✅ NEW: React Query hook
const {
  data: isFavorited = false,
  isLoading: isFavoriteLoading
} = useIsFavorite(user?.id!, facility.id);

const toggleFavorite = useToggleFavorite();
```

### Step 4: Update Click Handler

```typescript
// ❌ OLD: Simple state toggle
const handleFavorite = (e: React.MouseEvent): void => {
  e.stopPropagation();
  setIsFavorited(!isFavorited);
};

// ✅ NEW: Mutation with error handling
const handleFavorite = (e: React.MouseEvent): void => {
  e.stopPropagation();

  if (!user) {
    toast({
      title: 'Login Required',
      description: 'Please login to add favorites',
    });
    return;
  }

  toggleFavorite.mutate(
    { userId: user.id, facilityId: facility.id },
    {
      onSuccess: () => {
        toast({ title: isFavorited ? 'Removed' : 'Added' });
      },
      onError: (error) => {
        console.error('Failed to toggle favorite:', error);
        toast({ title: 'Error', variant: 'destructive' });
      },
    }
  );
};
```

### Step 5: Update Button UI

```typescript
// ✅ Add loading state and disabled state
<button
  onClick={handleFavorite}
  disabled={isFavoriteLoading || toggleFavorite.isPending}
  className="p-2 rounded-full bg-white/90 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
>
  {toggleFavorite.isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Heart className={isFavorited ? 'fill-red-500' : 'text-gray-600'} />
  )}
</button>
```

---

## Benefits After Migration

### ✅ Persistence

```typescript
// Favorites are stored in Supabase database
// They persist across:
// - Page reloads
// - Browser restarts
// - Device switches
```

### ✅ Real-time Sync

```typescript
// Enable real-time sync across devices
import { useRealtimeFavorites } from '@/hooks';

// In component
useRealtimeFavorites(user?.id!);
// Now favorites update instantly across all tabs/devices
```

### ✅ Optimistic Updates

```typescript
// UI updates IMMEDIATELY when you click
// If the server request fails, it automatically reverts
// Users get instant feedback without waiting
```

### ✅ Loading States

```typescript
// Button is disabled during loading
// Shows spinner during mutation
// Professional UX with proper feedback
```

### ✅ Error Handling

```typescript
// Proper error messages shown to user
// Failed requests logged to console
// Automatic retry on network errors (via React Query)
```

### ✅ Authentication Check

```typescript
// Prompts user to login if not authenticated
// Shows helpful toast message
// Prevents unauthorized actions
```

---

## Testing the Migration

### Test 1: Basic Functionality

1. Click the heart icon
2. Verify heart fills with red color
3. Reload the page
4. Verify heart is STILL red (persistence works!)

### Test 2: Optimistic Updates

1. Click heart icon
2. Verify heart fills IMMEDIATELY (before server response)
3. Check network tab - request is still pending
4. After request completes, heart stays filled

### Test 3: Error Handling

1. Stop Supabase: `supabase stop`
2. Click heart icon
3. Verify error toast appears
4. Verify heart reverts to unfilled (rollback works!)
5. Start Supabase: `supabase start`

### Test 4: Multi-device Sync

1. Open app in two browser tabs
2. Click heart in first tab
3. Verify heart updates in BOTH tabs (real-time sync!)

### Test 5: Authentication

1. Logout
2. Click heart icon
3. Verify "Login Required" toast appears
4. Login
5. Click heart again
6. Verify favorite is saved

---

## Performance Comparison

### Before (Local State)

- **Initial render:** Instant (always `false`)
- **State update:** Instant (but not saved)
- **Page reload:** Lost (back to `false`)
- **Multi-device:** No sync
- **Network requests:** 0

### After (Supabase + React Query)

- **Initial render:** Cached (instant if in cache, otherwise fast query)
- **State update:** Instant (optimistic) + background mutation
- **Page reload:** Preserved (loaded from database via cache)
- **Multi-device:** Real-time sync
- **Network requests:** 1 initial fetch (cached for 5 minutes), 1 per mutation
- **Cache reuse:** If user navigates to facility list → detail → list, NO new requests!

---

## Additional Migration Examples

### Example 2: Facility List with Real-time Updates

```typescript
import { useFacilities } from '@/services/supabase';
import { useRealtimeBookings } from '@/hooks';

export const FacilityList = (): JSX.Element => {
  const { currentOrgId } = useAuth();
  const { data: facilities, isLoading } = useFacilities(currentOrgId!);

  // ✅ Enable real-time booking updates
  useRealtimeBookings(currentOrgId!);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {facilities?.map(facility => (
        <FacilityCard key={facility.id} facility={facility} />
      ))}
    </div>
  );
};
```

### Example 3: Booking Form with Availability Check

```typescript
import { useCheckAvailability, useCreateBooking } from '@/services/supabase';

export const BookingForm = ({ facilityId }: { facilityId: string }): JSX.Element => {
  const [selectedTime, setSelectedTime] = useState<string>('');

  // ✅ Check availability in real-time
  const { data: isAvailable, isLoading } = useCheckAvailability({
    facilityId,
    startTime: selectedTime,
    endTime: addHours(selectedTime, 1),
  }, !!selectedTime);

  const createBooking = useCreateBooking();

  const handleSubmit = () => {
    if (!isAvailable) {
      toast({ title: 'Time slot not available' });
      return;
    }

    createBooking.mutate({
      facilityId,
      startTime: selectedTime,
      endTime: addHours(selectedTime, 1),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TimeSlotPicker
        value={selectedTime}
        onChange={setSelectedTime}
        disabled={isLoading}
      />

      {isAvailable === false && (
        <p className="text-red-500">This time slot is not available</p>
      )}

      <button
        type="submit"
        disabled={!isAvailable || createBooking.isPending}
      >
        {createBooking.isPending ? 'Booking...' : 'Book Now'}
      </button>
    </form>
  );
};
```

---

## Troubleshooting

### Issue: "Cannot read property 'id' of undefined"

**Cause:** User is not logged in, but trying to access `user.id`

**Fix:**
```typescript
// ✅ Use optional chaining and provide fallback
const { data: isFavorited } = useIsFavorite(user?.id ?? '', facility.id);

// Or disable the query when user is not logged in
const { data: isFavorited } = useIsFavorite(
  user?.id!,
  facility.id,
  !!user // enabled parameter
);
```

### Issue: Heart icon doesn't fill immediately

**Cause:** Optimistic update not configured

**Fix:**
```typescript
// The useToggleFavorite hook already has optimistic updates built-in!
// Just make sure you're using it correctly:
toggleFavorite.mutate({ userId, facilityId });

// The hook will:
// 1. Immediately update the cache (instant UI update)
// 2. Send request to server
// 3. Revert if request fails
```

### Issue: Favorites don't sync across tabs

**Cause:** Real-time subscription not enabled

**Fix:**
```typescript
// Add real-time hook in parent component
import { useRealtimeFavorites } from '@/hooks';

function App() {
  const { user } = useAuth();
  useRealtimeFavorites(user?.id!);

  return <YourApp />;
}
```

---

## Next Steps

1. ✅ **Migrate FacilityCard** - Follow this example
2. **Test thoroughly** - All 5 test cases above
3. **Migrate similar components** - FacilityCardUser, FacilityListItem, etc.
4. **Add real-time subscriptions** - For collaborative features
5. **Remove old Zustand stores** - Once migration is complete

---

**Migration Status:** Ready to implement
**Estimated Time:** 30-45 minutes per component
**Difficulty:** Medium
**Benefits:** High (persistence, sync, real-time, better UX)
