# Booking System – Test Cases

## 1. Authentication and User Management

### BKG-AUTH-001 – Register New User with Valid Data
**Preconditions**
- No account exists for the email address.

**Steps**
1. Go to "Register".
2. Fill in valid name, email and strong password.
3. Click "Create account".

**Expected Result**
- User is created.
- User is logged in or receives message to confirm email (depending on solution).
- User sees standard landing page for logged in user.

---

### BKG-AUTH-002 – Register User with Existing Email
**Preconditions**
- Account already exists for the email address.

**Steps**
1. Go to "Register".
2. Fill in same email as existing user.
3. Submit form.

**Expected Result**
- System rejects registration.
- Clear error message that email is already registered.

---

### BKG-AUTH-003 – Login with Correct Username/Password
**Preconditions**
- User exists with known password.

**Steps**
1. Go to "Login".
2. Enter correct email and password.
3. Click "Login".

**Expected Result**
- User is logged in.
- User lands on correct start page (user or admin depending on role).

---

### BKG-AUTH-004 – Login with Incorrect Password
**Preconditions**
- User exists.

**Steps**
1. Go to "Login".
2. Enter correct email and incorrect password.
3. Click "Login".

**Expected Result**
- Login fails.
- Clear error message about wrong username/password.
- No access to logged in pages.

---

### BKG-AUTH-005 – Show/Hide Password in Login Form
**Preconditions**
- Login form with "Show password" icon or button.

**Steps**
1. Go to "Login".
2. Enter a password in the password field.
3. Click "Show password".
4. Click "Hide password" again.

**Expected Result**
- Password is displayed in cleartext when "Show" is active.
- Password is hidden when "Hide" is active.
- No page refresh or data loss.

---

### BKG-AUTH-006 – Logout from Top Menu
**Preconditions**
- User is logged in.

**Steps**
1. Click on profile / menu icon.
2. Select "Logout".

**Expected Result**
- Session ends.
- User is sent to public page (e.g. front page).
- No access to "My page" without new login.
- No endless "loader".

---

### BKG-AUTH-007 – Forgot Password with Valid Email
**Preconditions**
- User exists with email.

**Steps**
1. Go to "Forgot password".
2. Enter valid registered email.
3. Submit.

**Expected Result**
- System confirms that reset email is sent.
- Log shows that reset request is created.

---

### BKG-AUTH-008 – Forgot Password with Unknown Email
**Preconditions**
- No user associated with the email.

**Steps**
1. Go to "Forgot password".
2. Enter non-existing email.
3. Submit.

**Expected Result**
- System gives neutral feedback (doesn't reveal if user exists).
- No reset link actually sent.

---

## 2. Search and Filtering of Facilities

### BKG-SEARCH-001 – Search Without Filter
**Preconditions**
- At least one active facility exists.

**Steps**
1. Go to facility search page.
2. Don't set any filter.
3. Click "Search" or load the page.

**Expected Result**
- List of active facilities is displayed.
- No error or empty list when data exists.

---

### BKG-SEARCH-002 – Filter by Capacity
**Preconditions**
- At least two facilities with different capacities.

**Steps**
1. Go to search page.
2. Set capacity e.g. "min 50 people".
3. Perform search.

**Expected Result**
- Only facilities with capacity ≥ 50 are displayed.
- Facilities with lower capacity are hidden.

---

### BKG-SEARCH-003 – Filter by Geography/Area
**Preconditions**
- Facilities in at least two areas.

**Steps**
1. Select an area in filter.
2. Perform search.

**Expected Result**
- Only facilities in selected area are displayed.

---

### BKG-SEARCH-004 – Filter by Facility (e.g. projector)
**Preconditions**
- One room with projector, one without.

**Steps**
1. Set filter "Projector".
2. Perform search.

**Expected Result**
- Only room with projector is displayed.

---

### BKG-SEARCH-005 – Combined Filter (capacity + area + facility)
**Preconditions**
- Test data that meets and doesn't meet the combination.

**Steps**
1. Set capacity ≥ X.
2. Select area Y.
3. Select facility Z.
4. Perform search.

**Expected Result**
- Only facilities that match all criteria are displayed.
- Clear message when no results.

---

## 3. Booking Flow – Non-Logged In User

### BKG-GUEST-001 – Start Booking Without Login, Redirect to Login
**Preconditions**
- At least one available facility.

**Steps**
1. As non-logged in: go to facility page.
2. Select date and time.
3. Click "Book".

**Expected Result**
- System sends user to login page.
- Information that login is required is displayed.

---

### BKG-GUEST-002 – Return to Booking After Login
**Preconditions**
- Same as BKG-GUEST-001.

**Steps**
1. Follow steps in BKG-GUEST-001.
2. Log in with valid user.
3. Complete login.

**Expected Result**
- User returns to same facility and time slot.
- Booking form shows previously selected data.

---

### BKG-GUEST-003 – Cancel Login in Booking Flow
**Preconditions**
- Same as above.

**Steps**
1. Start booking as non-logged in.
2. Get redirected to login.
3. Click "Back" in browser or cancel.

**Expected Result**
- User ends up in public view without half-finished booking creating "ghost booking".
- No error page.

---

## 4. Booking Flow – Logged In User

### BKG-BOOK-001 – Simple Booking Process
**Preconditions**
- User is logged in.
- At least one facility available in selected time slot.

**Steps**
1. Select facility.
2. Select date and time.
3. Fill in purpose and number of people.
4. Confirm booking.

**Expected Result**
- Booking is created.
- Confirmation page or message is displayed.
- Booking appears under "My bookings".

---

### BKG-BOOK-002 – Booking in Occupied Time Slot (Conflict)
**Preconditions**
- Existing booking in a specific time interval.

**Steps**
1. Try to book same facility, same time interval.
2. Confirm booking.

**Expected Result**
- System rejects booking.
- Clear message that time is occupied.

---

### BKG-BOOK-003 – Partially Overlapping Booking
**Preconditions**
- Booking from 18:00–20:00 exists.

**Steps**
1. Try to book same facility 19:00–21:00.
2. Confirm.

**Expected Result**
- System rejects or handles overlap according to defined rule.
- No double booking.

---

### BKG-BOOK-004 – Aborted Booking Mid-Process
**Preconditions**
- User logged in.

**Steps**
1. Start booking.
2. Fill in some fields, but don't complete.
3. Close browser or navigate to another page.

**Expected Result**
- No unwanted "pending" bookings are created.
- System leaves no inconsistent status.

---

### BKG-BOOK-005 – Modify Existing Booking (Time)
**Preconditions**
- Active booking owned by user.

**Steps**
1. Go to "My bookings".
2. Select a booking.
3. Change date or time to available interval.
4. Save.

**Expected Result**
- Booking is updated.
- No conflicts generated.
- History or log is updated.

---

### BKG-BOOK-006 – Cancel Booking
**Preconditions**
- Active booking.

**Steps**
1. Go to "My bookings".
2. Select booking.
3. Click "Cancel".
4. Confirm in dialog.

**Expected Result**
- Booking is marked as cancelled.
- Facility becomes available for others.
- Notification is sent if configured.

---

## 5. Admin – Booking Management

### BKG-ADMIN-001 – View List of Bookings
**Preconditions**
- Admin user.
- At least one booking in system.

**Steps**
1. Log in as admin.
2. Go to admin section for bookings.

**Expected Result**
- List of bookings is displayed with relevant info (user, facility, time, status).

---

### BKG-ADMIN-002 – Approve Booking
**Preconditions**
- Booking in status "pending/approval".

**Steps**
1. Open booking in admin.
2. Click "Approve".
3. Confirm action.

**Expected Result**
- Status changes to approved.
- User sees updated status.
- Notification is sent if configured.

---

### BKG-ADMIN-003 – Reject Booking
**Preconditions**
- Booking in status "pending/approval".

**Steps**
1. Open booking in admin.
2. Click "Reject".
3. Enter reason.
4. Confirm.

**Expected Result**
- Status is set to rejected.
- Reason is saved.
- User is notified.

---

### BKG-ADMIN-004 – Delete Pending Booking (Performance Test)
**Preconditions**
- Booking in pending status.

**Steps**
1. Open booking in admin.
2. Click "Delete" or "Cancel".
3. Measure response time.

**Expected Result**
- Operation completes quickly.
- No hanging spinner.
- Booking is removed from list.

---

### BKG-ADMIN-005 – Two Admins Handle Same Booking Simultaneously
**Preconditions**
- Two admin users.
- One booking in pending status.

**Steps**
1. Admin A opens booking.
2. Admin B opens same booking.
3. Admin A approves.
4. Admin B tries to reject afterwards.

**Expected Result**
- System prevents inconsistent status.
- Admin B gets message that status has already been changed.

---

## 6. Framework Time and Priority

### BKG-RAMME-001 – Framework Time Blocks Private Booking
**Preconditions**
- Framework time allocated to sports club Monday 18–20.
- Private user.

**Steps**
1. As private user, try to book same hall Monday 18–20.
2. Confirm booking.

**Expected Result**
- System rejects booking.
- Message that time is reserved.

---

### BKG-RAMME-002 – Municipal Activity Overrides Lower Priority
**Preconditions**
- Framework time for organization.
- Rule that municipal activity has higher priority.

**Steps**
1. Admin or municipal user tries to enter municipal booking in same time slot.
2. Confirm.

**Expected Result**
- Booking is allowed.
- Conflict is marked as overridden according to rule.

---

## 7. Prices and Billing

### BKG-PRICE-001 – Standard Hourly Rate
**Preconditions**
- Price rule for facility per hour.

**Steps**
1. Book facility for 2 hours.
2. Go to summary.

**Expected Result**
- Price = hourly rate × 2.
- No rounding errors.

---

### BKG-PRICE-002 – Children/Youth Price
**Preconditions**
- Organization marked as children/youth.
- Separate price group.

**Steps**
1. Book facility with this organization.
2. Check calculated price.

**Expected Result**
- Lower price or free according to rule.

---

### BKG-PRICE-003 – Commercial Price
**Preconditions**
- Organization marked as commercial.

**Steps**
1. Book same facility as in BKG-PRICE-001.
2. Check price.

**Expected Result**
- Higher price than standard / children/youth.

---

### BKG-PRICE-004 – Evening/Weekend Surcharge
**Preconditions**
- Rule for higher price after time X or on weekends.

**Steps**
1. Book on weekday daytime.
2. Book same facility, weekend or evening.
3. Compare prices.

**Expected Result**
- Higher price on evening/weekend according to setup.

---

### BKG-PRICE-005 – Cancellation Within Deadline
**Preconditions**
- Booking with price.
- Cancellation deadline defined.

**Steps**
1. Cancel booking within deadline.
2. Generate invoice basis.

**Expected Result**
- No invoice generated for cancelled booking.
- Log shows cancellation.

---

### BKG-PRICE-006 – Cancellation After Deadline (Fee)
**Preconditions**
- Same as above, but after deadline.

**Steps**
1. Cancel after deadline.
2. Generate invoice basis.

**Expected Result**
- Fee calculated according to rule.
- Invoice basis includes correct amount.

---

## 8. Organizations / Associations

### BKG-ORG-001 – Register Association
**Preconditions**
- User has access to association registration form.

**Steps**
1. Fill in name, org. number, contact info.
2. Submit.

**Expected Result**
- Association is created with status "pending".
- Visible in admin list.

---

### BKG-ORG-002 – Approve Association
**Preconditions**
- Association in status "pending".

**Steps**
1. Admin opens association.
2. Click "Approve".
3. Save.

**Expected Result**
- Status is set to "approved".
- Association can use association functionality (e.g. framework time).

---

### BKG-ORG-003 – Reject Association
**Preconditions**
- Association in status "pending".

**Steps**
1. Admin opens association.
2. Click "Reject".
3. Enter reason.
4. Save.

**Expected Result**
- Status is set to "rejected".
- Reason is saved.
- Notification is sent to user.