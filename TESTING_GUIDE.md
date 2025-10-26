# Supabase Integration Testing Guide

## Overview

This guide provides **comprehensive testing procedures** for the new Supabase backend integration. Follow these tests to verify that all services, real-time features, and migrations are working correctly.

---

## Prerequisites

### 1. Start Local Supabase

```bash
# Start Supabase (if not already running)
supabase start

# Verify it's running
supabase status

# You should see:
# - API URL: http://127.0.0.1:54321
# - Studio URL: http://127.0.0.1:54323
# - All services: running
```

### 2. Start Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:5173
```

### 3. Open Developer Tools

- **Browser DevTools:** Console, Network, Application tabs
- **React Query DevTools:** Should appear in bottom-left corner
- **Supabase Studio:** http://127.0.0.1:54323

---

## Test Suite 1: Database & Migrations

### Test 1.1: Verify All Migrations Applied

```bash
# Check migration status
supabase migration list

# Expected output:
# ✓ 20240101000001_enhanced_facilities_with_zones.sql
# ✓ 20240101000002_additional_services.sql
# ✓ 20240101000003_recurring_bookings.sql
# ✓ 20240101000004_group_bookings.sql
# ✓ 20240101000005_messaging_system.sql
# ✓ 20240101000006_support_tickets.sql
# ✓ 20240101000007_notification_preferences.sql
# ✓ 20240101000008_performance_indexes.sql
```

**✅ Pass:** All 8 migrations show checkmarks
**❌ Fail:** Any migration missing or shows error

### Test 1.2: Verify Tables Exist

Open Supabase Studio → Table Editor

**Expected tables:**
- `facilities`
- `zones`
- `bookings`
- `additional_services`
- `recurring_bookings`
- `recurring_booking_occurrences`
- `group_bookings`
- `group_booking_members`
- `message_threads`
- `message_thread_participants`
- `messages`
- `message_attachments`
- `support_tickets`
- `support_ticket_messages`
- `notification_preferences`

**✅ Pass:** All tables present
**❌ Fail:** Any table missing

### Test 1.3: Verify RLS Policies

Studio → Authentication → Policies

**Expected policies per table:**
- At least 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
- All policies should reference `auth.uid()` or `auth.jwt()`

**✅ Pass:** All tables have RLS enabled with policies
**❌ Fail:** Any table missing policies

### Test 1.4: Verify Database Functions

Studio → Database → Functions

**Expected functions:**
- `check_booking_availability`
- `create_recurring_booking_occurrences`
- `get_user_unread_message_count`

**✅ Pass:** All functions present
**❌ Fail:** Any function missing

---

## Test Suite 2: Authentication

### Test 2.1: Magic Link Login

**Steps:**
1. Navigate to login page
2. Enter email address
3. Click "Send magic link"
4. Check email for magic link
5. Click magic link in email
6. Verify redirect to dashboard

**Expected behavior:**
- Magic link email received within 1 minute
- Clicking link logs you in
- User session persists after page reload

**✅ Pass:** Login successful, session persists
**❌ Fail:** Email not received, link doesn't work, session lost

### Test 2.2: Session Persistence

**Steps:**
1. Log in successfully
2. Reload the page
3. Check if still logged in

**Expected behavior:**
- User remains logged in after reload
- `useAuth()` returns user object
- No re-authentication required

**✅ Pass:** Session persists
**❌ Fail:** User logged out after reload

### Test 2.3: Auth Context

**Steps:**
1. Open browser console
2. In any component, add:
   ```typescript
   const { user, currentOrgId, loading } = useAuth();
   console.log({ user, currentOrgId, loading });
   ```
3. Check console output

**Expected output:**
```javascript
{
  user: {
    id: "uuid-here",
    email: "test@example.com",
    // ... other user fields
  },
  currentOrgId: "org-uuid-here",
  loading: false
}
```

**✅ Pass:** User and org data present
**❌ Fail:** User is null, org is null, or loading stuck at true

---

## Test Suite 3: Service Layer

### Test 3.1: Facilities Service

**Test: Fetch All Facilities**

```typescript
import { useFacilities } from '@/services/supabase';

// In component
const { data: facilities, isLoading, error } = useFacilities(currentOrgId!);
```

**Expected behavior:**
1. **Loading state:** `isLoading = true` initially
2. **Data loaded:** `facilities` array returned
3. **No errors:** `error = null`
4. **Network request:** Check Network tab for GET to `/rest/v1/facilities`

**Check in React Query DevTools:**
- Query key: `['facilities', 'list', orgId]`
- Status: success
- Data: array of facilities
- Fresh for 5 minutes (staleTime)

**✅ Pass:** Facilities loaded, cached correctly
**❌ Fail:** Loading stuck, error returned, no network request

**Test: Create Facility**

```typescript
const createFacility = useCreateFacility();

createFacility.mutate({
  orgId: currentOrgId!,
  name: 'Test Facility',
  description: 'Test description',
  address: '123 Test St',
  type: 'sports',
  status: 'published',
  capacity: 50,
  pricePerHour: 500,
  // ... other required fields
});
```

**Expected behavior:**
1. **Pending state:** `createFacility.isPending = true`
2. **Success:** Facility created in database
3. **Cache invalidation:** Facilities list automatically updates
4. **React Query DevTools:** See mutation, then see query invalidation

**Verify in Supabase Studio:**
- Table Editor → facilities
- New row should appear

**✅ Pass:** Facility created, list auto-updates
**❌ Fail:** Mutation fails, list doesn't update

### Test 3.2: Bookings Service

**Test: Check Availability**

```typescript
const { data: isAvailable } = useCheckAvailability({
  facilityId: 'facility-uuid',
  startTime: '2024-10-26T10:00:00Z',
  endTime: '2024-10-26T12:00:00Z',
});
```

**Expected behavior:**
- Returns `true` if time slot is available
- Returns `false` if time slot is booked
- Calls database function `check_booking_availability`

**Verify in Network tab:**
- POST to `/rest/v1/rpc/check_booking_availability`
- Request body contains facility ID and times
- Response is boolean

**✅ Pass:** Availability checked correctly
**❌ Fail:** Always returns true/false, or error

**Test: Create Booking**

```typescript
const createBooking = useCreateBooking();

createBooking.mutate({
  facilityId: 'facility-uuid',
  userId: user!.id,
  startTime: '2024-10-26T14:00:00Z',
  endTime: '2024-10-26T16:00:00Z',
  status: 'confirmed',
  totalPrice: 1000,
});
```

**Expected behavior:**
1. Booking created in database
2. Availability for that time slot becomes `false`
3. User bookings query auto-invalidates
4. Facility bookings query auto-invalidates

**✅ Pass:** Booking created, queries updated
**❌ Fail:** Booking fails, queries not updated

### Test 3.3: Favorites Service (Optimistic Updates)

**Test: Toggle Favorite**

```typescript
const toggleFavorite = useToggleFavorite();

// Initial state: not favorited
console.log('Before:', isFavorited); // false

toggleFavorite.mutate({ userId: user!.id, facilityId });

console.log('After (optimistic):', isFavorited); // true immediately
```

**Expected behavior:**
1. **Optimistic update:** UI changes INSTANTLY (heart fills)
2. **Network request:** POST to `/rest/v1/favorites` in background
3. **On success:** State remains changed
4. **On error:** State REVERTS to previous value

**Test error case:**
1. Stop Supabase: `supabase stop`
2. Click favorite button
3. Watch it optimistically update (heart fills)
4. After ~2 seconds, watch it revert (heart empties)
5. Error toast appears
6. Start Supabase: `supabase start`

**✅ Pass:** Instant UI update, auto-revert on error
**❌ Fail:** UI doesn't update immediately, or doesn't revert on error

### Test 3.4: Messages Service

**Test: Send Message**

```typescript
const sendMessage = useSendMessage();

sendMessage.mutate({
  threadId: 'thread-uuid',
  senderId: user!.id,
  content: 'Hello, this is a test message',
});
```

**Expected behavior:**
1. Message created in database
2. Thread's `last_message_at` updated
3. Thread messages query invalidated
4. New message appears in list

**Verify in Supabase Studio:**
- Table Editor → messages
- New message row with correct thread_id

**✅ Pass:** Message sent, list updates
**❌ Fail:** Message not created, list doesn't update

---

## Test Suite 4: Real-time Subscriptions

### Test 4.1: Real-time Bookings

**Setup:**
1. Open app in two browser tabs (Tab A and Tab B)
2. Navigate both to same facility calendar

**Test:**
1. In Tab A: Create a new booking
2. In Tab B: Watch calendar

**Expected behavior:**
- Tab B's calendar updates AUTOMATICALLY within 1-2 seconds
- No page reload needed
- New booking appears on calendar

**Check console in Tab B:**
```
[Realtime] Subscribing to bookings for facility: <facility-id>
[Realtime] Bookings subscription status for facility <facility-id>: SUBSCRIBED
[Realtime] Booking change: INSERT
```

**✅ Pass:** Tab B auto-updates
**❌ Fail:** Tab B doesn't update, or requires reload

### Test 4.2: Real-time Messages

**Setup:**
1. Open app in two browser tabs (Tab A and Tab B)
2. Navigate both to same message thread
3. Log in as User A in Tab A
4. Log in as User B in Tab B

**Test:**
1. In Tab A (User A): Send a message
2. In Tab B (User B): Watch messages list

**Expected behavior:**
- Message appears in Tab B INSTANTLY
- No polling or refresh needed
- Message timestamp is correct

**Check console in Tab B:**
```
[Realtime] Subscribing to messages for thread: <thread-id>
[Realtime] Messages subscription status for thread <thread-id>: SUBSCRIBED
[Realtime] New message: { id: "...", content: "...", ... }
```

**✅ Pass:** Message appears instantly in Tab B
**❌ Fail:** Message doesn't appear, or requires reload

### Test 4.3: Real-time Notifications

**Setup:**
1. Enable browser notifications (click "Allow" when prompted)
2. Add notification trigger:
   ```typescript
   useRealtimeNotifications(user?.id!, true, (notification) => {
     console.log('New notification:', notification);
     showBrowserNotification(notification);
   });
   ```

**Test:**
1. In Supabase Studio, insert a notification:
   ```sql
   INSERT INTO notifications (user_id, subject, body, priority)
   VALUES ('your-user-id', 'Test Notification', 'This is a test', 'normal');
   ```

**Expected behavior:**
1. Console logs: `[Realtime] New notification: { ... }`
2. Browser notification appears (desktop notification)
3. Notification badge count increments
4. React Query cache invalidated

**✅ Pass:** Browser notification appears, badge updates
**❌ Fail:** No notification, console errors

---

## Test Suite 5: Cache Management

### Test 5.1: Cache Invalidation on Mutation

**Test:**
1. Open React Query DevTools
2. Fetch facilities: `useFacilities(orgId)`
3. Note query in DevTools (status: success, fresh)
4. Create new facility: `useCreateFacility().mutate(...)`
5. Watch DevTools

**Expected behavior:**
- After mutation succeeds:
  - Facilities query status changes to "fetching"
  - Query refetches automatically
  - New facility appears in list
  - Query returns to "fresh" status

**✅ Pass:** Query auto-refetches after mutation
**❌ Fail:** Query doesn't refetch, new data not shown

### Test 5.2: Stale-While-Revalidate

**Test:**
1. Fetch facilities (query becomes fresh)
2. Wait 6 minutes (staleTime = 5 minutes)
3. Navigate away and back
4. Check DevTools

**Expected behavior:**
- Query is marked as "stale" (orange)
- Old data shown immediately (from cache)
- Background refetch happens automatically
- Fresh data replaces old data when refetch completes

**✅ Pass:** Stale data shown immediately, then refreshed
**❌ Fail:** Loading spinner shown, or data not refreshed

### Test 5.3: Query Key Hierarchy

**Test:**
1. Open React Query DevTools
2. Trigger multiple facility queries:
   - `useFacilities(orgId)` → key: `['facilities', 'list', orgId]`
   - `useFacility(id1)` → key: `['facilities', 'detail', id1]`
   - `useFacility(id2)` → key: `['facilities', 'detail', id2]`
3. Invalidate with `facilityKeys.all` (via mutation)

**Expected behavior:**
- All three queries marked as stale
- All three refetch in background
- Hierarchical invalidation works

**✅ Pass:** All facility queries invalidated
**❌ Fail:** Some queries not invalidated

---

## Test Suite 6: Error Handling

### Test 6.1: Network Error

**Test:**
1. Stop Supabase: `supabase stop`
2. Try to fetch facilities

**Expected behavior:**
1. Query retries 3 times (React Query default)
2. After 3 failures, error state set
3. Error message displayed to user
4. "Retry" button available
5. Clicking retry re-fetches

**Check console:**
```
Failed to fetch facilities: FetchError: ...
React Query: retrying query... (attempt 1/3)
React Query: retrying query... (attempt 2/3)
React Query: retrying query... (attempt 3/3)
React Query: query failed
```

**✅ Pass:** Retries, then shows error with retry button
**❌ Fail:** No retries, crashes, or infinite loading

### Test 6.2: RLS Policy Violation

**Test:**
1. Try to access another org's facility:
   ```typescript
   const { data } = useFacility('facility-from-different-org');
   ```

**Expected behavior:**
- Query returns empty/null (RLS blocks access)
- No error thrown (RLS is silent)
- No console errors
- No network error (200 OK with empty result)

**✅ Pass:** Query returns empty, no errors
**❌ Fail:** Error thrown, console errors

### Test 6.3: Validation Error

**Test:**
1. Try to create booking with invalid data:
   ```typescript
   createBooking.mutate({
     facilityId: 'invalid-uuid',
     startTime: 'invalid-date',
     // ... invalid data
   });
   ```

**Expected behavior:**
- Mutation fails immediately
- `error` object contains validation message
- Error toast shown to user
- No database changes made

**✅ Pass:** Validation error caught and displayed
**❌ Fail:** Invalid data written to database

---

## Test Suite 7: Performance

### Test 7.1: Query Response Time

**Test:**
1. Open Network tab
2. Clear cache
3. Fetch facilities

**Expected response times:**
- **Facilities list:** < 150ms
- **Single facility:** < 50ms
- **Availability check:** < 100ms
- **Booking creation:** < 200ms

**Check Network tab:**
- Filter by "facilities"
- Check "Time" column
- Should be under expected thresholds

**✅ Pass:** All queries under thresholds
**❌ Fail:** Queries taking > 2x expected time

### Test 7.2: Cache Hit Rate

**Test:**
1. Clear React Query cache
2. Navigate to facility list (cache miss - network request)
3. Navigate to facility detail (cache miss - network request)
4. Navigate back to list (cache hit - NO network request)
5. Navigate to same detail (cache hit - NO network request)

**Check Network tab:**
- First visit: 2 requests
- Second visit: 0 requests (served from cache)

**✅ Pass:** No duplicate network requests
**❌ Fail:** Same query makes multiple requests

### Test 7.3: Real-time Latency

**Test:**
1. Open app in two tabs
2. Create booking in Tab A
3. Measure time until Tab B updates

**Expected latency:**
- **WebSocket connection:** < 200ms
- **Event delivery:** < 300ms
- **UI update:** Instant (optimistic)

**Use console.time() to measure:**
```typescript
console.time('realtime-latency');
// Create booking in Tab A

// In Tab B's subscription handler:
console.timeEnd('realtime-latency');
// Should show < 500ms
```

**✅ Pass:** Updates appear within 500ms
**❌ Fail:** Updates take > 2 seconds

---

## Test Suite 8: Type Safety

### Test 8.1: TypeScript Compilation

**Test:**
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Expected output:
# (no errors)
```

**✅ Pass:** No TypeScript errors
**❌ Fail:** Type errors present

### Test 8.2: IntelliSense

**Test:**
1. Open any component file
2. Type: `const {} = useFacilities(orgId);`
3. Inside `{}`, press Ctrl+Space

**Expected behavior:**
- IntelliSense shows: `data`, `isLoading`, `error`, `refetch`, etc.
- Hovering over `data` shows type: `Facility[] | undefined`

**✅ Pass:** Full IntelliSense support
**❌ Fail:** No autocomplete, `any` types

### Test 8.3: Database Types

**Test:**
1. Open `src/types/database.ts`
2. Check that all tables have types
3. Try to use a field that doesn't exist:
   ```typescript
   facility.nonExistentField // Should error
   ```

**Expected behavior:**
- TypeScript error: Property 'nonExistentField' does not exist
- All database fields have proper types

**✅ Pass:** Type error on non-existent field
**❌ Fail:** No error, `any` type

---

## Test Suite 9: Integration Tests

### Test 9.1: End-to-End Booking Flow

**Complete user journey:**

1. **Browse facilities**
   - Navigate to facility list
   - Verify facilities load
   - Filter by type
   - Verify filtered results

2. **View facility details**
   - Click on a facility
   - Verify details load
   - Verify zones load
   - Verify calendar loads

3. **Check availability**
   - Select date and time
   - Verify availability check
   - See available time slots

4. **Create booking**
   - Fill out booking form
   - Submit booking
   - Verify success message
   - Verify booking appears in "My Bookings"

5. **Real-time update**
   - Open same facility in another tab
   - Verify new booking appears automatically

**✅ Pass:** Complete flow works end-to-end
**❌ Fail:** Any step fails

### Test 9.2: Multi-user Collaboration

**Two users, same organization:**

1. **User A:** Create a facility
2. **User B:** Refresh → should see new facility
3. **User B:** Create a booking on that facility
4. **User A:** Should see booking in calendar (real-time)
5. **User A:** Update facility details
6. **User B:** Should see updated details (real-time)

**✅ Pass:** All changes sync between users
**❌ Fail:** Changes don't sync, or require reload

### Test 9.3: Favorites Sync

**Same user, multiple devices:**

1. **Device A:** Add facility to favorites
2. **Device B:** Refresh
3. **Device B:** Verify facility is favorited
4. **Device B:** Remove from favorites
5. **Device A:** Should update automatically (real-time)

**✅ Pass:** Favorites sync across devices
**❌ Fail:** Favorites don't sync

---

## Test Suite 10: Edge Cases

### Test 10.1: Concurrent Bookings

**Test race condition:**

1. Open two tabs (A and B)
2. Both select same time slot
3. Tab A: Submit booking
4. Tab B: Submit booking (immediately after A)

**Expected behavior:**
- One booking succeeds
- Other booking fails with "Time slot unavailable"
- Database function prevents double-booking

**✅ Pass:** Only one booking created
**❌ Fail:** Both bookings created (double-booking)

### Test 10.2: Offline/Online Transitions

**Test:**
1. Load facilities
2. Go offline (DevTools → Network → Offline)
3. Try to create booking

**Expected behavior:**
- Mutation queued (or fails gracefully)
- Error message shown
- When back online, option to retry

**✅ Pass:** Graceful offline handling
**❌ Fail:** Crash or infinite loading

### Test 10.3: Session Expiration

**Test:**
1. Log in
2. Wait for session to expire (or manually expire in Studio)
3. Try to make a request

**Expected behavior:**
- Session auto-refreshed (if refresh token valid)
- Or redirect to login (if refresh token expired)
- User notified of session expiration

**✅ Pass:** Auto-refresh or graceful logout
**❌ Fail:** Stuck in loading state, or silent failure

---

## Troubleshooting Tests

### If Test Fails: Network Request Not Made

**Possible causes:**
1. Query is disabled: Check `enabled` parameter
2. Query key is undefined: Check all params are truthy
3. Supabase is stopped: Run `supabase status`

**Fix:**
```typescript
// Ensure query is enabled
const { data } = useFacilities(
  currentOrgId!,
  !!currentOrgId // enabled when orgId exists
);
```

### If Test Fails: Real-time Not Working

**Possible causes:**
1. Real-time not enabled in `.env.local`
2. Subscription not initialized
3. Channel name collision

**Fix:**
```typescript
// Check env var
console.log(import.meta.env.VITE_ENABLE_REALTIME); // should be 'true'

// Check subscription
useRealtimeBookings(facilityId, true); // ensure enabled=true

// Check console for subscription logs
// Should see: [Realtime] Subscribing to bookings...
```

### If Test Fails: RLS Policy Error

**Possible causes:**
1. User not authenticated
2. User not member of organization
3. RLS policy too restrictive

**Fix:**
```typescript
// Check auth
const { user, currentOrgId } = useAuth();
console.log({ user, currentOrgId });

// Verify in Supabase Studio:
// Authentication → Users → Check user exists
// Table Editor → organizations → Check user membership
```

---

## Test Report Template

Use this template to document test results:

```markdown
# Supabase Integration Test Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Local Development / Staging / Production

## Test Results Summary

| Test Suite | Pass | Fail | Skip | Notes |
|------------|------|------|------|-------|
| Database & Migrations | ✅ | ❌ | - | All migrations applied |
| Authentication | ✅ | ❌ | - | Magic links working |
| Service Layer | ✅ | ❌ | - | All CRUD operations work |
| Real-time | ✅ | ❌ | - | Subscriptions active |
| Cache Management | ✅ | ❌ | - | Invalidation works |
| Error Handling | ✅ | ❌ | - | Graceful failures |
| Performance | ✅ | ❌ | - | Within thresholds |
| Type Safety | ✅ | ❌ | - | No TS errors |
| Integration | ✅ | ❌ | - | E2E flows work |
| Edge Cases | ✅ | ❌ | - | Race conditions handled |

## Detailed Results

### Test Suite 1: Database & Migrations
- [✅] Test 1.1: All migrations applied
- [✅] Test 1.2: All tables exist
- [✅] Test 1.3: RLS policies active
- [✅] Test 1.4: Database functions present

### Test Suite 2: Authentication
- [✅] Test 2.1: Magic link login
- [✅] Test 2.2: Session persistence
- [✅] Test 2.3: Auth context working

... (continue for all tests)

## Issues Found

1. **Issue:** Description of issue
   - **Severity:** High / Medium / Low
   - **Steps to reproduce:** ...
   - **Expected:** ...
   - **Actual:** ...
   - **Fix:** ...

## Recommendations

1. Recommendation 1
2. Recommendation 2

## Sign-off

**Ready for production:** Yes / No
**Signature:** _________________
**Date:** _________________
```

---

## Automated Testing (Future)

### Unit Tests (Vitest)

```typescript
// Example: Test facility service
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFacilities } from '@/services/supabase';

describe('useFacilities', () => {
  it('should fetch facilities', async () => {
    const { result } = renderHook(() => useFacilities('org-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBeNull();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// Example: Test booking flow
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Send magic link")');

  // Navigate to facility
  await page.click('text=Sports Center');

  // Select time slot
  await page.click('[data-slot="10:00"]');

  // Submit booking
  await page.click('button:has-text("Book Now")');

  // Verify success
  await expect(page.locator('text=Booking confirmed')).toBeVisible();
});
```

---

## Summary

This testing guide covers:

- ✅ **10 test suites** with 30+ individual tests
- ✅ **Database verification** (migrations, RLS, functions)
- ✅ **Service testing** (CRUD operations, queries, mutations)
- ✅ **Real-time testing** (subscriptions, multi-device sync)
- ✅ **Performance testing** (response times, cache efficiency)
- ✅ **Error handling** (network errors, validation, edge cases)
- ✅ **Integration testing** (end-to-end user flows)
- ✅ **Type safety verification** (TypeScript, IntelliSense)

**Estimated testing time:** 2-3 hours for complete manual test suite

**Next step:** Run through each test suite and document results using the test report template.

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Status:** Ready for Testing
