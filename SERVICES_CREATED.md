# Supabase Services Created ✅

## Summary

Successfully created **4 complete Supabase service layers** with React Query integration. Each service provides full CRUD operations, optimistic updates, and type-safe hooks.

---

## Services Created

### 1. Facilities Service ✅
**File:** `src/services/supabase/facilities.service.ts`

**Features:**
- Full CRUD operations
- Search functionality
- Zone integration
- Organization-scoped queries
- Published facility filtering

**Hooks Provided:**
- `useFacilities(orgId)` - List all facilities
- `usePublishedFacilities(orgId)` - Public facilities only
- `useFacility(id)` - Single facility
- `useFacilityWithZones(id)` - Facility with zones
- `useCreateFacility()` - Create mutation
- `useUpdateFacility()` - Update mutation
- `useDeleteFacility()` - Delete mutation
- `useSearchFacilities(orgId, query)` - Search

**Example Usage:**
```tsx
import { useFacilities } from '@/services/supabase';

function FacilityList() {
  const { currentOrgId } = useAuth();
  const { data: facilities, isLoading } = useFacilities(currentOrgId!);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {facilities?.map(f => <FacilityCard key={f.id} facility={f} />)}
    </div>
  );
}
```

---

### 2. Bookings Service ✅
**File:** `src/services/supabase/bookings.service.ts`

**Features:**
- User, org, and facility-scoped queries
- Booking lifecycle management
- Availability checking via RPC
- Upcoming and past bookings
- Booking with related data (facility, zone)

**Hooks Provided:**
- `useUserBookings(userId)` - User's bookings
- `useOrgBookings(orgId)` - Organization bookings
- `useFacilityBookings(facilityId, startDate, endDate)` - Facility calendar
- `useBooking(id)` - Single booking with details
- `useUpcomingBookings(userId, limit)` - Future bookings
- `usePastBookings(userId, limit)` - Historical bookings
- `useCreateBooking()` - Create booking
- `useUpdateBooking()` - Update booking
- `useCancelBooking()` - Cancel booking
- `useCheckAvailability(params)` - Check time slot availability

**Example Usage:**
```tsx
import { useUserBookings, useCancelBooking } from '@/services/supabase';

function MyBookings() {
  const { user } = useAuth();
  const { data: bookings } = useUserBookings(user?.id!);
  const cancelBooking = useCancelBooking();

  const handleCancel = (id: string) => {
    cancelBooking.mutate(id, {
      onSuccess: () => toast.success('Booking cancelled'),
    });
  };

  return (
    <div>
      {bookings?.map(booking => (
        <div key={booking.id}>
          <h3>{booking.facility?.name}</h3>
          <button onClick={() => handleCancel(booking.id)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
```

---

### 3. Zones Service ✅
**File:** `src/services/supabase/zones.service.ts`

**Features:**
- Facility-scoped zone queries
- Availability schedules (day of week)
- Zone-specific availability checking
- Active zone filtering
- Soft delete support

**Hooks Provided:**
- `useFacilityZones(facilityId)` - Zones for facility
- `useZone(id)` - Single zone
- `useZoneWithAvailability(id)` - Zone with schedule
- `useCreateZone()` - Create zone
- `useUpdateZone()` - Update zone
- `useDeleteZone()` - Delete (soft)
- `useCheckZoneAvailability(zoneId, startTime, endTime)` - Check availability
- `useZoneAvailabilityForDate(zoneId, date)` - Get schedule for date

**Example Usage:**
```tsx
import { useFacilityZones, useCheckZoneAvailability } from '@/services/supabase';

function ZoneSelector({ facilityId }: { facilityId: string }) {
  const { data: zones } = useFacilityZones(facilityId);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const { data: isAvailable } = useCheckZoneAvailability(
    selectedZone!,
    '2024-10-27T10:00:00',
    '2024-10-27T12:00:00',
    !!selectedZone
  );

  return (
    <div>
      {zones?.map(zone => (
        <button
          key={zone.id}
          onClick={() => setSelectedZone(zone.id)}
          className={selectedZone === zone.id ? 'selected' : ''}
        >
          {zone.name} - {zone.capacity} people
        </button>
      ))}
      {selectedZone && (
        <p>{isAvailable ? 'Available ✅' : 'Not available ❌'}</p>
      )}
    </div>
  );
}
```

---

### 4. Favorites Service ✅
**File:** `src/services/supabase/favorites.service.ts`

**Features:**
- User-scoped favorites
- Optimistic updates (instant UI feedback)
- Toggle functionality
- Favorite checking
- Replaces localStorage favorites

**Hooks Provided:**
- `useFavorites(userId)` - User's favorite facilities
- `useIsFavorite(userId, facilityId)` - Check if favorited
- `useAddFavorite()` - Add to favorites
- `useRemoveFavorite()` - Remove from favorites
- `useToggleFavorite()` - Toggle favorite status

**Example Usage:**
```tsx
import { useIsFavorite, useToggleFavorite } from '@/services/supabase';

function FavoriteButton({ facilityId }: { facilityId: string }) {
  const { user } = useAuth();
  const { data: isFavorite } = useIsFavorite(user?.id!, facilityId);
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
      disabled={toggleFavorite.isPending}
      className={isFavorite ? 'text-red-500' : 'text-gray-400'}
    >
      {isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
    </button>
  );
}
```

---

## Architecture Features

### Type Safety
- All services use generated TypeScript types from database schema
- Type-safe query keys for cache management
- Strongly typed mutations and queries

### Caching Strategy
```typescript
// Different stale times based on data mutability
Facilities:   5 minutes  (changes infrequently)
Bookings:     2 minutes  (moderate changes)
Availability: 30 seconds (changes frequently)
Past data:    5 minutes  (historical data stable)
```

### Optimistic Updates
Favorites service implements optimistic updates:
- UI updates instantly when user clicks
- Reverts on error
- Maintains consistency

### Query Key Structure
```typescript
// Hierarchical cache keys for efficient invalidation
['facilities']                          // All facilities
['facilities', 'list', orgId]           // Org-specific list
['facilities', 'detail', id]            // Single facility
['facilities', 'detail', id, 'zones']   // With zones

// Invalidation example:
queryClient.invalidateQueries({ queryKey: ['facilities'] });
// Invalidates ALL facility queries
```

---

## Migration Guide

### Replacing Zustand Stores

#### Before (localStorage/Zustand):
```tsx
import { useFacilityStore } from '@/stores/facilityStore';

function Component() {
  const { facilities, updateFacility } = useFacilityStore();

  return <div>{facilities.map(...)}</div>;
}
```

#### After (Supabase/React Query):
```tsx
import { useFacilities, useUpdateFacility } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { currentOrgId } = useAuth();
  const { data: facilities, isLoading } = useFacilities(currentOrgId!);
  const updateFacility = useUpdateFacility();

  if (isLoading) return <LoadingSpinner />;

  return <div>{facilities?.map(...)}</div>;
}
```

---

## Services Still TODO

Following the same pattern, create:

### 5. Groups Service
- `useBookingGroups()`
- `useGroupMembers()`
- `useGroupInvitations()`
- `useCreateGroup()`
- `useInviteToGroup()`
- `useAcceptInvitation()`

### 6. Recurring Bookings Service
- `useRecurringBookings()`
- `useRecurringOccurrences()`
- `useCreateRecurringBooking()`
- `useGenerateOccurrences()`
- `useConfirmOccurrence()`

### 7. Messages Service
- `useMessageThreads()`
- `useMessages()`
- `useCreateThread()`
- `useSendMessage()`
- `useMarkRead()`
- Real-time subscriptions

### 8. Support Tickets Service
- `useUserTickets()`
- `useOrgTickets()`
- `useTicket()`
- `useCreateTicket()`
- `useReplyToTicket()`
- `useUpdateTicketStatus()`

### 9. Notifications Service
- `useNotifications()`
- `useUnreadCount()`
- `useMarkAsRead()`
- `useNotificationPreferences()`
- `useUpdatePreferences()`

---

## Testing Checklist

### ✅ Services Created
- [x] Facilities service
- [x] Bookings service
- [x] Zones service
- [x] Favorites service

### ⏳ Next Steps
- [ ] Test each service in isolation
- [ ] Migrate one component to use Supabase
- [ ] Add real-time subscriptions
- [ ] Create remaining services
- [ ] Data migration script
- [ ] E2E testing

---

## Performance Features

### Automatic Caching
React Query handles:
- Deduplication (multiple components, one request)
- Background refetching
- Stale-while-revalidate pattern
- Garbage collection

### Error Handling
- Automatic retry for 5xx errors
- No retry for 4xx errors
- Global error handlers
- Per-query error handling

### Developer Experience
- React Query DevTools in development
- Type-safe throughout
- Consistent API patterns
- Comprehensive JSDoc documentation

---

## File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client ✅
│   └── queryClient.ts       # React Query config ✅
├── contexts/
│   ├── AuthContext.tsx      # Auth provider ✅
│   └── index.ts             # Exports ✅
├── services/
│   └── supabase/
│       ├── facilities.service.ts  ✅
│       ├── bookings.service.ts    ✅
│       ├── zones.service.ts       ✅
│       ├── favorites.service.ts   ✅
│       └── index.ts               ✅ (exports all)
└── types/
    └── database.ts          # Generated types ✅ (103KB)
```

---

## Status

**Services Created:** 4/9 (44%)
**Foundation:** ✅ Complete
**Backend:** ✅ All migrations applied
**Ready for:** Component migration and testing

**Next Action:** Test one service by migrating a component

---

**Created:** 2024-10-26
**Status:** Services ready for use 🚀
