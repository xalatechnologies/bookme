# Developer Quick Reference Card

## One-Page Cheat Sheet for Daily Development

---

## Starting Development

```bash
# Start Supabase (first terminal)
supabase start

# Start dev server (second terminal)
npm run dev

# Open in browser
# App: http://localhost:5173
# Studio: http://127.0.0.1:54323
```

---

## Common Imports

```typescript
// Auth
import { useAuth } from '@/contexts/AuthContext';

// Services (70 hooks available)
import {
  useFacilities, useCreateFacility,
  useBookings, useCreateBooking,
  useFavorites, useToggleFavorite,
  // ... see below for full list
} from '@/services/supabase';

// Real-time
import {
  useRealtimeBookings,
  useRealtimeMessages,
  useRealtimeNotifications,
} from '@/hooks';

// Supabase client (for custom queries)
import { supabase } from '@/lib/supabase';
```

---

## Quick Patterns

### Pattern 1: Fetch Data

```typescript
const { currentOrgId } = useAuth();
const { data, isLoading, error } = useFacilities(currentOrgId!);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

return <FacilityList facilities={data} />;
```

### Pattern 2: Create/Update

```typescript
const createFacility = useCreateFacility();

const handleSubmit = async (formData) => {
  createFacility.mutate(formData, {
    onSuccess: () => toast({ title: 'Created!' }),
    onError: (err) => toast({ title: 'Error', description: err.message }),
  });
};

// Show loading
{createFacility.isPending && <Spinner />}
```

### Pattern 3: Optimistic Updates (Favorites)

```typescript
const { data: isFavorite } = useIsFavorite(userId!, facilityId);
const toggle = useToggleFavorite();

// Click → instant UI update → background sync
<button onClick={() => toggle.mutate({ userId, facilityId })}>
  <Heart className={isFavorite ? 'fill-red-500' : 'text-gray-400'} />
</button>
```

### Pattern 4: Real-time

```typescript
// Fetch data
const { data: bookings } = useFacilityBookings(facilityId);

// Enable real-time updates
useRealtimeBookings(facilityId);

// Bookings auto-update when changes occur!
```

---

## All Available Hooks (70 total)

### Facilities (8 hooks)
```typescript
useFacilities(orgId)              // All facilities
usePublishedFacilities(orgId)     // Published only
useFacility(id)                   // Single
useFacilityWithZones(id)          // With zones
useCreateFacility()               // Create
useUpdateFacility()               // Update
useDeleteFacility()               // Delete
useSearchFacilities(query)        // Search
```

### Bookings (10 hooks)
```typescript
useUserBookings(userId)           // User's bookings
useOrgBookings(orgId)             // Org bookings
useFacilityBookings(facilityId)   // Facility bookings
useBooking(id)                    // Single
useUpcomingBookings(userId)       // Future
usePastBookings(userId)           // History
useCreateBooking()                // Create
useUpdateBooking()                // Update
useCancelBooking()                // Cancel
useCheckAvailability(params)      // Check available
```

### Zones (8 hooks)
```typescript
useFacilityZones(facilityId)      // All zones
useZone(id)                       // Single
useZoneWithAvailability(id)       // With schedule
useCreateZone()                   // Create
useUpdateZone()                   // Update
useDeleteZone()                   // Delete
useCheckZoneAvailability(id, date) // Check
useZoneAvailabilityForDate(id, date) // Day schedule
```

### Favorites (5 hooks)
```typescript
useFavorites(userId)              // All favorites
useIsFavorite(userId, facilityId) // Check
useAddFavorite()                  // Add
useRemoveFavorite()               // Remove
useToggleFavorite()               // ⚡ Toggle (optimistic)
```

### Groups (10 hooks)
```typescript
useUserGroups(userId)             // User's groups
useGroup(id)                      // Single
useUserInvitations(email)         // Invitations
useGroupBookings(groupId)         // Group bookings
useCreateGroup()                  // Create
useUpdateGroup()                  // Update
useDeleteGroup()                  // Delete
useInviteUser()                   // Invite
useAcceptInvitation()             // Accept
useUpdateMemberRole()             // Change role
useRemoveMember()                 // Remove
```

### Recurring (10 hooks)
```typescript
useUserRecurring(userId)          // User's recurring
useRecurringBooking(id)           // Single series
useRecurringOccurrences(id)       // All occurrences
usePendingOccurrences(userId)     // Pending
useCreateRecurring()              // Create series
useUpdateRecurring()              // Update series
usePauseRecurring()               // Pause
useResumeRecurring()              // Resume
useCancelRecurring()              // Cancel
useConfirmOccurrence()            // Confirm
useSkipOccurrence()               // Skip
useCancelOccurrence()             // Cancel occurrence
```

### Messages (9 hooks)
```typescript
useUserThreads(userId)            // User's threads
useThread(id)                     // Single thread
useThreadMessages(threadId)       // Messages
useUnreadCount(userId)            // Unread count
useMessageTemplates(orgId)        // Templates
useCreateThread()                 // Start thread
useSendMessage()                  // Send
useMarkAsRead()                   // Mark read
useUploadAttachment()             // Upload file
```

### Real-time (8 hooks)
```typescript
// Bookings
useRealtimeBookings(facilityId)
useRealtimeUserBookings(userId)
useRealtimeOrgBookings(orgId)

// Messages
useRealtimeMessages(threadId)
useRealtimeThreads(userId)
useRealtimeUnreadCount(userId)

// Notifications
useRealtimeNotifications(userId, enabled, onNew)
useRealtimeNotificationCount(userId)
```

---

## React Query DevTools

```typescript
// Already included in App.tsx
// Click icon in bottom-left corner

// Shows:
// - All active queries
// - Cache status (fresh/stale/fetching)
// - Query keys
// - Data/error states
// - Refetch buttons
```

---

## Common Tasks

### Check Auth

```typescript
const { user, currentOrgId, loading } = useAuth();

if (loading) return <Loading />;
if (!user) return <LoginPrompt />;
if (!currentOrgId) return <SelectOrg />;
```

### Invalidate Cache

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['facilities', 'list', orgId] });

// Invalidate all facilities
queryClient.invalidateQueries({ queryKey: ['facilities'] });
```

### Custom Supabase Query

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('facilities')
  .select('*, zones(*)')
  .eq('org_id', orgId)
  .order('created_at', { ascending: false });
```

### Check Availability

```typescript
const { data: isAvailable, isLoading } = useCheckAvailability({
  facilityId: 'facility-id',
  startTime: '2024-10-26T10:00:00Z',
  endTime: '2024-10-26T12:00:00Z',
  zoneId: 'zone-id', // optional
});

// Returns true if available, false if booked
```

---

## Troubleshooting

### Issue: "Cannot read property 'id' of undefined"

```typescript
// ❌ Wrong
const { data: facility } = useFacility(id);
return <div>{facility.name}</div>; // Error if loading

// ✅ Correct
const { data: facility, isLoading } = useFacility(id);
if (isLoading) return <Loading />;
if (!facility) return <NotFound />;
return <div>{facility.name}</div>;
```

### Issue: Query not refetching after mutation

```typescript
// Should auto-invalidate, but can force:
const update = useUpdateFacility();

update.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: facilityKeys.all });
  }
});
```

### Issue: RLS policy violation

```typescript
// Check auth first
const { user, currentOrgId } = useAuth();
console.log({ user, currentOrgId });

// Verify in Studio: Authentication → Policies
```

### Issue: Real-time not working

```typescript
// 1. Check env var
console.log(import.meta.env.VITE_ENABLE_REALTIME); // 'true'

// 2. Ensure enabled
useRealtimeBookings(facilityId, true); // enabled = true

// 3. Check console for logs
// [Realtime] Subscribing to bookings...
// [Realtime] Subscription status: SUBSCRIBED
```

---

## Supabase Studio Quick Tasks

### View Data
1. Open http://127.0.0.1:54323
2. Table Editor → Select table
3. Browse/search data

### Run SQL
1. SQL Editor → New query
2. Write SQL
3. Run (Cmd/Ctrl + Enter)

### Check RLS Policies
1. Authentication → Policies
2. Select table
3. View/edit policies

### View Logs
```bash
supabase logs
```

---

## Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENABLE_REALTIME=true
VITE_ENABLE_STORAGE=true
```

---

## Performance Tips

### Cache Times
```typescript
Facilities:     5 minutes   (rarely change)
Bookings:       2 minutes   (change moderately)
Availability:   30 seconds  (check frequently)
Messages:       10 seconds  (real-time critical)
```

### When to Disable Queries
```typescript
// Disable until data is ready
const { data } = useFacility(id, !!id); // enabled when id exists

// Disable in background tabs
const { data } = useFacilities(orgId, isTabActive);
```

### Pagination (Future)
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteFacilities(orgId);

// Call fetchNextPage() when user scrolls
```

---

## Testing Commands

```bash
# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

---

## Migration Checklist

When migrating a component:

- [ ] Replace Zustand store imports with service imports
- [ ] Add `useAuth()` for user/orgId
- [ ] Add loading state (`isLoading`)
- [ ] Add error state (`error`)
- [ ] Update mutations to use `.mutate()`
- [ ] Add success/error callbacks
- [ ] Remove store import
- [ ] Test thoroughly
- [ ] Add real-time if needed

---

## Useful Links

- **Docs:** `SUPABASE_INTEGRATION_COMPLETE.md`
- **Migration:** `PRACTICAL_MIGRATION_EXAMPLE.md`
- **Testing:** `TESTING_GUIDE.md`
- **Data Migration:** `DATA_MIGRATION_GUIDE.md`

---

**Print this page and keep it at your desk!** 📄

**Version:** 1.0.0
**Last Updated:** 2025-10-26
