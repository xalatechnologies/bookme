# Manual Test Checklist - RBAC & Authentication

**Date**: 2025-10-27
**App URL**: http://localhost:3006
**Supabase Studio**: http://localhost:54323

---

## Pre-Test Verification

✅ **Supabase Status**
```bash
npx supabase status
# Should show all services running
```

✅ **Test Users Verified**
- test.user@drammen.kommune.no (Customer)
- staff@drammen.kommune.no (Staff)
- admin@drammen.kommune.no (Admin)
- owner@drammen.kommune.no (Owner)
- superadmin@booknor.no (Platform Admin)

✅ **All passwords**: `Test123!`

✅ **Test Data**
- 3 bookings for test.user@drammen.kommune.no
- 1 facility (Fotballbane A)
- 1 organization (Drammen Kommune)

---

## Test 1: Customer User Flow

### 1.1 Login as Customer

**Steps**:
1. Navigate to http://localhost:3006/login
2. Enter email: `test.user@drammen.kommune.no`
3. Enter password: `Test123!`
4. Click "Logg inn"

**Expected Results**:
- ✅ Login succeeds without errors
- ✅ Redirects to `/user` (user dashboard)
- ✅ No loading spinner stuck
- ✅ No console errors

**Check Console Log**:
```
📋 useBookingListPage - Current user: 10000000-0000-0000-0000-000000000001
🔍 Fetching bookings for user: 10000000-0000-0000-0000-000000000001
✅ Fetched bookings: 3 bookings
```

---

### 1.2 Verify Navbar (Customer)

**Check**:
- ✅ Avatar shows (gradient or image)
- ✅ Name displays: "Test Bruker" or "test.user@drammen.kommune.no"
- ✅ Email displays: "test.user@drammen.kommune.no"
- ✅ Dropdown opens when clicked

**Dropdown Menu Should Show**:
- ✅ "Min profil" option
- ✅ "Innstillinger" option
- ✅ "Språk / Language" option
- ✅ "Logg ut" option (in red)

---

### 1.3 Access User Dashboard

**URL**: http://localhost:3006/user

**Expected**:
- ✅ Page loads without infinite spinner
- ✅ Dashboard content displays
- ✅ User-specific data shown
- ✅ No "redirect to login" issue

---

### 1.4 Access Bookings Page

**URL**: http://localhost:3006/user/bookings

**Expected Results**:
- ✅ Page loads successfully
- ✅ Shows 3 bookings:
  - 1 "Bekreftet" (paid) - Oct 28
  - 1 "Ventende" (pending) - Oct 30
  - 1 "Fullført" (completed) - Oct 25
- ✅ Facility name displays: "Fotballbane A"
- ✅ Prices display correctly
- ✅ Status badges color-coded correctly

**Status Panel Should Show**:
- Alle: 3
- Bekreftet: 1
- Ventende: 1
- Fullført: 1

---

### 1.5 Try to Access Admin Routes (Should Fail)

**Steps**:
1. Try to navigate to: http://localhost:3006/admin

**Expected**:
- ✅ Should redirect to login OR show "Access Denied"
- ✅ Should NOT allow access to admin panel
- ❌ Should NOT see admin navigation

---

### 1.6 Test Logout (Customer)

**Steps**:
1. Click avatar dropdown
2. Click "Logg ut"

**Expected**:
- ✅ Success toast: "Du er nå logget ut!"
- ✅ Redirects to `/login-selection`
- ✅ Session cleared (no console errors)
- ✅ Cannot access protected routes after logout

**Check**:
- Navigate to http://localhost:3006/user/bookings
- ✅ Should redirect to login

---

## Test 2: Staff User Flow

### 2.1 Login as Staff

**Steps**:
1. Navigate to http://localhost:3006/login
2. Enter email: `staff@drammen.kommune.no`
3. Enter password: `Test123!`
4. Click "Logg inn"

**Expected**:
- ✅ Login succeeds
- ✅ Redirects to appropriate page
- ✅ No errors in console

---

### 2.2 Verify Navbar (Staff)

**Check**:
- ✅ Name displays: "Staff Member"
- ✅ Email displays: "staff@drammen.kommune.no"
- ✅ Dropdown menu works

---

### 2.3 Access Admin Routes (Staff)

**URL**: http://localhost:3006/admin

**Expected**:
- ✅ Should have access to admin panel (staff can access admin routes)
- ✅ Can view facilities
- ✅ Can view bookings (all bookings, not just own)
- ✅ Admin navigation visible

---

### 2.4 View All Bookings (Staff)

**Steps**:
1. Navigate to admin bookings page
2. Check if can see bookings from all users

**Expected**:
- ✅ Can see all 3 bookings
- ✅ Can see user emails for each booking
- ✅ Can manage bookings (approve, reject, etc.)

---

### 2.5 Test Logout (Staff)

**Steps**:
1. Click "Logg ut"

**Expected**:
- ✅ Successfully logs out
- ✅ Redirects to login selection
- ✅ Session cleared

---

## Test 3: Admin User Flow

### 3.1 Login as Admin

**Steps**:
1. Navigate to http://localhost:3006/login
2. Enter email: `admin@drammen.kommune.no`
3. Enter password: `Test123!`
4. Click "Logg inn"

**Expected**:
- ✅ Login succeeds
- ✅ Full admin access granted

---

### 3.2 Verify Admin Access

**Check**:
- ✅ Can access `/admin`
- ✅ Can manage facilities
- ✅ Can manage bookings
- ✅ Can manage users
- ✅ Can access organization settings

---

### 3.3 Verify Navbar (Admin)

**Check**:
- ✅ Name displays: "Admin User"
- ✅ Email displays: "admin@drammen.kommune.no"
- ✅ Role badge or indicator shows admin level

---

## Test 4: Owner User Flow

### 4.1 Login as Owner

**Steps**:
1. Login with: `owner@drammen.kommune.no`
2. Password: `Test123!`

**Expected**:
- ✅ Login succeeds
- ✅ Highest level access to organization

---

### 4.2 Verify Owner Permissions

**Check**:
- ✅ Full admin access
- ✅ Additional owner-only features (if any)
- ✅ Can manage organization settings
- ✅ Can manage memberships

---

## Test 5: Platform Admin Flow

### 5.1 Login as Platform Admin

**Steps**:
1. Login with: `superadmin@booknor.no`
2. Password: `Test123!`

**Expected**:
- ✅ Login succeeds
- ✅ Platform-wide access

---

### 5.2 Verify Platform Admin Access

**Check**:
- ✅ Can access all organizations
- ✅ Platform-level controls available
- ✅ No organization membership required

---

## Test 6: Protected Routes & Redirects

### 6.1 Unauthenticated Access

**Steps**:
1. Clear browser storage: `localStorage.clear()`
2. Refresh page
3. Try to access: http://localhost:3006/user/bookings

**Expected**:
- ✅ Should redirect to login
- ✅ No infinite loading spinner
- ✅ No access to protected content

---

### 6.2 Wrong Role Access

**Steps**:
1. Login as customer
2. Try to access: http://localhost:3006/admin

**Expected**:
- ✅ Should show access denied OR redirect
- ❌ Should NOT see admin content

---

## Test 7: Data Persistence

### 7.1 Page Refresh

**Steps**:
1. Login as any user
2. Navigate to bookings page
3. Refresh browser (F5)

**Expected**:
- ✅ User stays logged in
- ✅ Page loads without redirect to login
- ✅ Data displays correctly
- ✅ No "session missing" errors

---

### 7.2 Navigation Between Routes

**Steps**:
1. Login as customer
2. Navigate: Dashboard → Bookings → Profile → Back to Dashboard

**Expected**:
- ✅ All navigation works smoothly
- ✅ No unexpected logouts
- ✅ User data persists across pages
- ✅ No loading issues

---

## Test 8: Error Handling

### 8.1 Wrong Password

**Steps**:
1. Try to login with: `test.user@drammen.kommune.no`
2. Password: `WrongPassword123!`

**Expected**:
- ✅ Shows error message
- ✅ Does not login
- ✅ Error is user-friendly

---

### 8.2 Non-existent User

**Steps**:
1. Try to login with: `nonexistent@example.com`
2. Password: `Test123!`

**Expected**:
- ✅ Shows error message
- ✅ Does not login

---

## Test 9: Browser Console Checks

### 9.1 Customer Login Console

**Expected Logs**:
```
📋 useBookingListPage - Current user: [user-id]
🔍 Fetching bookings for user: [user-id]
✅ Fetched bookings: 3 bookings
📊 Bookings query state: { isLoading: false, isError: false, bookingsCount: 3 }
```

**Should NOT See**:
- ❌ "useAuth must be used within an AuthProvider"
- ❌ "Cannot read property of undefined"
- ❌ Infinite re-render warnings
- ❌ Network errors (401, 403, 500)

---

### 9.2 Network Tab

**Check**:
- ✅ POST to `/auth/v1/token` (login)
- ✅ GET to `/rest/v1/bookings` (fetch bookings)
- ✅ GET to `/rest/v1/profiles` (fetch profile)
- ✅ All requests return 200 status
- ❌ No 401 Unauthorized errors

---

## Test 10: Logout Scenarios

### 10.1 Normal Logout

**Steps**:
1. Login as any user
2. Click logout button

**Expected**:
- ✅ Success toast shown
- ✅ Redirects to login selection
- ✅ localStorage cleared
- ✅ Cannot access protected routes

---

### 10.2 Multiple Tab Logout

**Steps**:
1. Open app in two browser tabs
2. Login in both
3. Logout in one tab
4. Try to use the other tab

**Expected**:
- ✅ Both tabs should detect logout
- ✅ Other tab should redirect to login
- ✅ No weird state issues

---

## Test 11: Booking Filters & Actions

### 11.1 Status Filters

**Steps**:
1. Login as customer
2. Go to bookings page
3. Click each status filter: Alle, Bekreftet, Ventende, Fullført

**Expected**:
- ✅ Filter works immediately
- ✅ Count badges update correctly
- ✅ No loading issues

---

### 11.2 Booking Details

**Steps**:
1. Click on a booking card

**Expected**:
- ✅ Details panel opens
- ✅ Shows full booking information
- ✅ Actions available (cancel, share, etc.)

---

## Test 12: Profile & Settings

### 12.1 User Profile

**Steps**:
1. Login as customer
2. Navigate to profile page

**Expected**:
- ✅ Shows correct user info
- ✅ Can view profile details
- ✅ Settings are accessible

---

### 12.2 Language Toggle

**Steps**:
1. Click avatar dropdown
2. Click "Språk / Language"

**Expected**:
- ✅ Language switches
- ✅ UI updates to selected language
- ✅ Preference persists

---

## Summary Checklist

### Critical Tests (Must Pass)
- [ ] Customer can login
- [ ] Customer can view own bookings (3 bookings)
- [ ] Admin can login
- [ ] Admin can access admin panel
- [ ] Logout works for all users
- [ ] Protected routes redirect when not authenticated
- [ ] Navbar shows correct user info
- [ ] No infinite loading spinners

### Important Tests (Should Pass)
- [ ] All 5 user types can login
- [ ] Role permissions work correctly
- [ ] Data persists across page refresh
- [ ] Error messages are user-friendly
- [ ] Console has no critical errors
- [ ] Network requests succeed (200 status)

### Nice to Have Tests
- [ ] Language toggle works
- [ ] Booking filters work
- [ ] Profile page accessible
- [ ] Multi-tab logout detection

---

## Test Results Template

**Tester**: _______________
**Date**: _______________
**Browser**: _______________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1.1 | Customer Login | ☐ PASS ☐ FAIL | |
| 1.2 | Customer Navbar | ☐ PASS ☐ FAIL | |
| 1.3 | User Dashboard | ☐ PASS ☐ FAIL | |
| 1.4 | Bookings Page | ☐ PASS ☐ FAIL | |
| 1.5 | Admin Access Denied | ☐ PASS ☐ FAIL | |
| 1.6 | Customer Logout | ☐ PASS ☐ FAIL | |
| 2.1 | Staff Login | ☐ PASS ☐ FAIL | |
| 2.3 | Staff Admin Access | ☐ PASS ☐ FAIL | |
| 3.1 | Admin Login | ☐ PASS ☐ FAIL | |
| 6.1 | Redirect When Logged Out | ☐ PASS ☐ FAIL | |

---

## Quick Test Commands

```bash
# Check Supabase status
npx supabase status

# Run automated RBAC tests
node test-rbac.js

# Check logs for errors
npx supabase logs | grep ERROR

# Reset test data if needed
npx supabase db reset
node setup-test-users.js
```

---

## Common Issues & Solutions

### Issue: Infinite Loading Spinner
**Solution**: Check console for "useAuth must be used within AuthProvider" error. Verify AuthProvider wraps the app in main.tsx.

### Issue: "Invalid login credentials"
**Solution**: Run `node setup-test-users.js` to reset passwords.

### Issue: Bookings not loading
**Solution**: Check console logs. Verify bookings query returns data. Check user ID is correct.

### Issue: Redirect loop
**Solution**: Clear localStorage and cookies. Check RequireAuth logic.

### Issue: "Auth session missing" on logout
**Solution**: This is expected and handled. Check that logout still succeeds.

---

## Test Environment Info

- **App URL**: http://localhost:3006
- **API URL**: http://localhost:54321
- **Studio URL**: http://localhost:54323
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
