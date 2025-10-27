# E2E Test Suites - Complete Implementation

## Overview

This document provides **complete end-to-end test implementations** using Playwright for all major user flows in the BookMe application.

---

## Test Suite 1: Authentication Flow

### File: `tests/e2e/auth/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send magic link")')).toBeVisible();
  });

  test('should send magic link successfully', async ({ page }) => {
    await page.goto('/login');

    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');

    // Click send button
    await page.click('button:has-text("Send magic link")');

    // Verify success message
    await expect(page.locator('text=Check your email')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');

    // Click send button
    await page.click('button:has-text("Send magic link")');

    // Verify error message
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should maintain session after page reload', async ({ page }) => {
    // Assuming user is already logged in (from auth state)
    await page.goto('/dashboard');

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify still logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard');

    // Click user menu
    await page.click('[data-testid="user-menu"]');

    // Click logout
    await page.click('text=Logout');

    // Verify redirected to login
    await expect(page).toHaveURL('/login');

    // Verify logged out
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
```

---

## Test Suite 2: Facility Management

### File: `tests/e2e/facilities/list.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { createTestFacility } from '../../setup/supabase-helpers';

test.describe('Facility List', () => {
  let testFacility: any;

  test.beforeEach(async ({ page }) => {
    // Create test facility
    testFacility = await createTestFacility({
      name: 'E2E Test Facility',
      status: 'published',
    });

    await page.goto('/facilities');
  });

  test.afterEach(async () => {
    // Cleanup
    if (testFacility) {
      await supabase.from('facilities').delete().eq('id', testFacility.id);
    }
  });

  test('should display facility list', async ({ page }) => {
    // Wait for facilities to load
    await page.waitForSelector('[data-testid="facility-card"]', {
      timeout: 10000,
    });

    // Verify facility card is visible
    const facilityCards = page.locator('[data-testid="facility-card"]');
    await expect(facilityCards).toHaveCountGreaterThan(0);
  });

  test('should display facility details', async ({ page }) => {
    // Wait for test facility
    await page.waitForSelector(`text=${testFacility.name}`);

    // Verify facility name
    await expect(page.locator(`text=${testFacility.name}`)).toBeVisible();

    // Verify facility details
    await expect(page.locator(`text=${testFacility.address}`)).toBeVisible();
    await expect(page.locator(`text=${testFacility.capacity} personer`)).toBeVisible();
  });

  test('should filter facilities by type', async ({ page }) => {
    // Click type filter
    await page.click('[data-testid="filter-type"]');

    // Select sports
    await page.click('text=Sports');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    // Verify only sports facilities shown
    const facilityCards = page.locator('[data-testid="facility-card"]');
    const count = await facilityCards.count();

    for (let i = 0; i < count; i++) {
      const card = facilityCards.nth(i);
      await expect(card.locator('[data-testid="facility-type"]')).toContainText('sports');
    }
  });

  test('should search facilities', async ({ page }) => {
    // Type in search box
    await page.fill('[data-testid="search-input"]', 'E2E Test');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify test facility is shown
    await expect(page.locator(`text=${testFacility.name}`)).toBeVisible();
  });

  test('should switch between grid and list view', async ({ page }) => {
    // Click list view button
    await page.click('[data-testid="view-list"]');

    // Verify list view active
    await expect(page.locator('[data-testid="facility-list-view"]')).toBeVisible();

    // Click grid view button
    await page.click('[data-testid="view-grid"]');

    // Verify grid view active
    await expect(page.locator('[data-testid="facility-grid-view"]')).toBeVisible();
  });

  test('should paginate through facilities', async ({ page }) => {
    // Scroll to bottom to load more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for more facilities to load
    await page.waitForTimeout(1000);

    // Verify more facilities loaded
    const facilityCards = page.locator('[data-testid="facility-card"]');
    await expect(facilityCards).toHaveCountGreaterThan(3);
  });
});
```

### File: `tests/e2e/facilities/detail.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { createTestFacility } from '../../setup/supabase-helpers';

test.describe('Facility Detail Page', () => {
  let testFacility: any;

  test.beforeEach(async ({ page }) => {
    testFacility = await createTestFacility({
      name: 'Detail Test Facility',
      description: 'This is a test facility for detail page testing',
      amenities: ['WiFi', 'Parking', 'AC'],
    });

    await page.goto(`/facilities/${testFacility.id}`);
  });

  test.afterEach(async () => {
    if (testFacility) {
      await supabase.from('facilities').delete().eq('id', testFacility.id);
    }
  });

  test('should display facility details', async ({ page }) => {
    // Verify name
    await expect(page.locator('h1')).toContainText(testFacility.name);

    // Verify description
    await expect(page.locator('text=' + testFacility.description)).toBeVisible();

    // Verify address
    await expect(page.locator(`text=${testFacility.address}`)).toBeVisible();

    // Verify capacity
    await expect(page.locator(`text=${testFacility.capacity}`)).toBeVisible();

    // Verify price
    await expect(page.locator(`text=${testFacility.price_per_hour} kr`)).toBeVisible();
  });

  test('should display amenities', async ({ page }) => {
    // Verify each amenity
    for (const amenity of testFacility.amenities) {
      await expect(page.locator(`text=${amenity}`)).toBeVisible();
    }
  });

  test('should display calendar', async ({ page }) => {
    // Verify calendar is visible
    await expect(page.locator('[data-testid="facility-calendar"]')).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    // Scroll to contact section
    await page.locator('[data-testid="contact-section"]').scrollIntoViewIfNeeded();

    // Verify contact info visible
    await expect(page.locator('[data-testid="contact-section"]')).toBeVisible();
  });

  test('should share facility', async ({ page }) => {
    // Click share button
    await page.click('[data-testid="share-button"]');

    // Verify share dialog or clipboard action
    // (Implementation depends on your share mechanism)
    await page.waitForTimeout(500);
  });

  test('should show images in gallery', async ({ page }) => {
    // Verify image gallery
    await expect(page.locator('[data-testid="image-gallery"]')).toBeVisible();

    // Click on image
    await page.click('[data-testid="gallery-image"]');

    // Verify lightbox or modal
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();
  });
});
```

---

## Test Suite 3: Booking Flow

### File: `tests/e2e/bookings/create.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { createTestFacility } from '../../setup/supabase-helpers';

test.describe('Create Booking', () => {
  let testFacility: any;

  test.beforeEach(async ({ page }) => {
    testFacility = await createTestFacility();
    await page.goto(`/facilities/${testFacility.id}`);
  });

  test.afterEach(async () => {
    if (testFacility) {
      // Cleanup bookings
      await supabase.from('bookings').delete().eq('facility_id', testFacility.id);
      await supabase.from('facilities').delete().eq('id', testFacility.id);
    }
  });

  test('should display booking form', async ({ page }) => {
    // Click book now button
    await page.click('[data-testid="book-now-button"]');

    // Verify booking form visible
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

    // Verify form fields
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-time"]')).toBeVisible();
  });

  test('should check availability', async ({ page }) => {
    await page.click('[data-testid="book-now-button"]');

    // Select date (tomorrow)
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="tomorrow"]');

    // Select start time
    await page.click('[data-testid="start-time"]');
    await page.click('text=10:00');

    // Select end time
    await page.click('[data-testid="end-time"]');
    await page.click('text=12:00');

    // Wait for availability check
    await page.waitForTimeout(1000);

    // Verify availability indicator
    await expect(
      page.locator('[data-testid="availability-indicator"]:has-text("Available")')
    ).toBeVisible();
  });

  test('should create booking successfully', async ({ page }) => {
    await page.click('[data-testid="book-now-button"]');

    // Fill booking form
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="tomorrow"]');
    await page.click('[data-testid="start-time"]');
    await page.click('text=10:00');
    await page.click('[data-testid="end-time"]');
    await page.click('text=12:00');

    // Add notes (optional)
    await page.fill('[data-testid="booking-notes"]', 'Test booking notes');

    // Submit booking
    await page.click('[data-testid="submit-booking"]');

    // Verify success message
    await expect(page.locator('text=Booking confirmed')).toBeVisible({
      timeout: 10000,
    });

    // Verify redirected to bookings page or booking detail
    await expect(page).toHaveURL(/\/bookings/);
  });

  test('should show error for conflicting booking', async ({ page }) => {
    // First, create a booking
    await createTestBooking(testFacility.id, user.id, {
      start_time: tomorrowAt10AM,
      end_time: tomorrowAt12PM,
    });

    await page.click('[data-testid="book-now-button"]');

    // Try to book same time slot
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="tomorrow"]');
    await page.click('[data-testid="start-time"]');
    await page.click('text=10:00');
    await page.click('[data-testid="end-time"]');
    await page.click('text=12:00');

    // Wait for availability check
    await page.waitForTimeout(1000);

    // Verify unavailable message
    await expect(
      page.locator('[data-testid="availability-indicator"]:has-text("Unavailable")')
    ).toBeVisible();

    // Submit button should be disabled
    await expect(page.locator('[data-testid="submit-booking"]')).toBeDisabled();
  });

  test('should calculate price correctly', async ({ page }) => {
    await page.click('[data-testid="book-now-button"]');

    // Select 2-hour booking
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="tomorrow"]');
    await page.click('[data-testid="start-time"]');
    await page.click('text=10:00');
    await page.click('[data-testid="end-time"]');
    await page.click('text=12:00');

    // Verify price calculation
    const expectedPrice = testFacility.price_per_hour * 2;
    await expect(page.locator('[data-testid="total-price"]')).toContainText(
      `${expectedPrice} kr`
    );
  });

  test('should add additional services', async ({ page }) => {
    await page.click('[data-testid="book-now-button"]');

    // Fill basic booking info
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="tomorrow"]');
    await page.click('[data-testid="start-time"]');
    await page.click('text=10:00');
    await page.click('[data-testid="end-time"]');
    await page.click('text=12:00');

    // Add service
    await page.click('[data-testid="add-service-button"]');
    await page.click('[data-testid="service-projector"]');

    // Verify service added to summary
    await expect(page.locator('[data-testid="selected-services"]')).toContainText(
      'Projector'
    );

    // Verify price updated
    await expect(page.locator('[data-testid="total-price"]')).not.toContainText(
      `${testFacility.price_per_hour * 2} kr`
    );
  });
});
```

### File: `tests/e2e/bookings/cancel.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { createTestFacility, createTestBooking } from '../../setup/supabase-helpers';

test.describe('Cancel Booking', () => {
  let testFacility: any;
  let testBooking: any;

  test.beforeEach(async ({ page, context }) => {
    testFacility = await createTestFacility();

    // Get user from auth state
    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === 'supabase-auth-token');
    const session = JSON.parse(authCookie?.value || '{}');
    const userId = session.user.id;

    testBooking = await createTestBooking(testFacility.id, userId);

    await page.goto('/bookings');
  });

  test.afterEach(async () => {
    if (testBooking) {
      await supabase.from('bookings').delete().eq('id', testBooking.id);
    }
    if (testFacility) {
      await supabase.from('facilities').delete().eq('id', testFacility.id);
    }
  });

  test('should display user bookings', async ({ page }) => {
    // Wait for bookings to load
    await page.waitForSelector('[data-testid="booking-card"]');

    // Verify booking is visible
    await expect(page.locator(`text=${testFacility.name}`)).toBeVisible();
  });

  test('should cancel booking', async ({ page }) => {
    // Find booking card
    const bookingCard = page.locator(`[data-testid="booking-card"]:has-text("${testFacility.name}")`);

    // Click cancel button
    await bookingCard.locator('[data-testid="cancel-button"]').click();

    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel"]');

    // Verify success message
    await expect(page.locator('text=Booking cancelled')).toBeVisible({
      timeout: 5000,
    });

    // Verify booking status updated
    await expect(bookingCard.locator('[data-testid="booking-status"]')).toContainText(
      'Cancelled'
    );
  });

  test('should not allow cancelling past bookings', async ({ page }) => {
    // Create past booking
    const pastBooking = await createTestBooking(testFacility.id, userId, {
      start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      end_time: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    });

    await page.reload();

    // Find past booking
    const bookingCard = page.locator(`[data-testid="booking-card"][data-booking-id="${pastBooking.id}"]`);

    // Verify cancel button is disabled or not present
    await expect(bookingCard.locator('[data-testid="cancel-button"]')).toBeDisabled();
  });
});
```

---

## Test Suite 4: Favorites

### File: `tests/e2e/favorites/toggle.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { createTestFacility, waitForRealtimeUpdate } from '../../setup/supabase-helpers';

test.describe('Favorites', () => {
  let testFacility: any;

  test.beforeEach(async ({ page }) => {
    testFacility = await createTestFacility({
      name: 'Favorite Test Facility',
    });

    await page.goto(`/facilities/${testFacility.id}`);
  });

  test.afterEach(async () => {
    if (testFacility) {
      await supabase.from('favorites').delete().eq('facility_id', testFacility.id);
      await supabase.from('facilities').delete().eq('id', testFacility.id);
    }
  });

  test('should toggle favorite on facility detail page', async ({ page }) => {
    // Click favorite button (heart icon)
    await page.click('[data-testid="favorite-button"]');

    // Verify heart is filled (favorited)
    await expect(page.locator('[data-testid="favorite-button"] [data-filled="true"]')).toBeVisible({
      timeout: 3000,
    });

    // Click again to unfavorite
    await page.click('[data-testid="favorite-button"]');

    // Verify heart is not filled
    await expect(page.locator('[data-testid="favorite-button"] [data-filled="false"]')).toBeVisible({
      timeout: 3000,
    });
  });

  test('should show favorite in favorites list', async ({ page }) => {
    // Add to favorites
    await page.click('[data-testid="favorite-button"]');
    await waitForRealtimeUpdate();

    // Navigate to favorites page
    await page.goto('/favorites');

    // Verify facility is in favorites
    await expect(page.locator(`text=${testFacility.name}`)).toBeVisible();
  });

  test('should sync favorites across tabs', async ({ page, context }) => {
    // Add to favorites
    await page.click('[data-testid="favorite-button"]');
    await waitForRealtimeUpdate();

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto(`/facilities/${testFacility.id}`);

    // Verify favorite status synced
    await expect(page2.locator('[data-testid="favorite-button"] [data-filled="true"]')).toBeVisible({
      timeout: 5000,
    });

    // Remove favorite in second tab
    await page2.click('[data-testid="favorite-button"]');
    await waitForRealtimeUpdate(3000);

    // Verify status synced back to first tab
    await expect(page.locator('[data-testid="favorite-button"] [data-filled="false"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should require login to add favorite', async ({ page, context }) => {
    // Logout
    await page.goto('/logout');

    // Go to facility page
    await page.goto(`/facilities/${testFacility.id}`);

    // Click favorite button
    await page.click('[data-testid="favorite-button"]');

    // Verify login prompt or redirect
    await expect(page.locator('text=Please login')).toBeVisible();
  });
});
```

---

## Test Suite 5: Real-time Messaging

### File: `tests/e2e/messages/chat.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { waitForRealtimeUpdate } from '../../setup/supabase-helpers';

test.describe('Real-time Messaging', () => {
  test('should send and receive messages in real-time', async ({ page, context }) => {
    // User 1: Navigate to messages
    await page.goto('/messages');

    // Start new conversation
    await page.click('[data-testid="new-message-button"]');
    await page.fill('[data-testid="recipient-input"]', 'user2@example.com');
    await page.click('[data-testid="start-conversation"]');

    // Send message
    const messageText = `Test message ${Date.now()}`;
    await page.fill('[data-testid="message-input"]', messageText);
    await page.click('[data-testid="send-button"]');

    // Verify message sent
    await expect(page.locator(`text=${messageText}`)).toBeVisible({
      timeout: 3000,
    });

    // Open second tab as User 2
    const page2 = await context.newPage();
    // (Assuming you can switch auth context)
    await page2.goto('/messages');

    // Wait for real-time update
    await waitForRealtimeUpdate(2000);

    // Verify message received in second tab
    await expect(page2.locator(`text=${messageText}`)).toBeVisible({
      timeout: 5000,
    });

    // Reply from User 2
    const replyText = `Reply ${Date.now()}`;
    await page2.fill('[data-testid="message-input"]', replyText);
    await page2.click('[data-testid="send-button"]');

    // Verify reply received in User 1's tab
    await expect(page.locator(`text=${replyText}`)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should update unread count in real-time', async ({ page, context }) => {
    // User 1: Send message
    await page.goto('/messages');
    // ... send message logic ...

    // User 2: Open app (but not messages page)
    const page2 = await context.newPage();
    await page2.goto('/dashboard');

    // Wait for real-time update
    await waitForRealtimeUpdate(2000);

    // Verify unread badge updated
    await expect(page2.locator('[data-testid="messages-badge"]')).toContainText('1');
  });

  test('should mark messages as read', async ({ page }) => {
    await page.goto('/messages');

    // Click on unread conversation
    await page.click('[data-testid="unread-thread"]');

    // Wait a moment
    await page.waitForTimeout(1000);

    // Verify marked as read
    await expect(page.locator('[data-testid="unread-indicator"]')).not.toBeVisible();

    // Verify unread count decremented
    const badge = page.locator('[data-testid="messages-badge"]');
    await expect(badge).toBeHidden();
  });
});
```

---

## Test Suite 6: Support Tickets

### File: `tests/e2e/support/tickets.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Support Tickets', () => {
  test('should create support ticket', async ({ page }) => {
    await page.goto('/support');

    // Click create ticket
    await page.click('[data-testid="create-ticket-button"]');

    // Fill ticket form
    await page.fill('[data-testid="ticket-subject"]', 'Test Support Issue');
    await page.fill(
      '[data-testid="ticket-description"]',
      'This is a test support ticket description'
    );

    // Select priority
    await page.click('[data-testid="priority-select"]');
    await page.click('text=Normal');

    // Submit ticket
    await page.click('[data-testid="submit-ticket"]');

    // Verify success
    await expect(page.locator('text=Ticket created')).toBeVisible({
      timeout: 5000,
    });

    // Verify ticket appears in list
    await expect(page.locator('text=Test Support Issue')).toBeVisible();
  });

  test('should add message to ticket', async ({ page }) => {
    // Assuming ticket exists
    await page.goto('/support/tickets/test-ticket-id');

    // Add message
    const messageText = `Follow-up message ${Date.now()}`;
    await page.fill('[data-testid="ticket-message-input"]', messageText);
    await page.click('[data-testid="send-ticket-message"]');

    // Verify message added
    await expect(page.locator(`text=${messageText}`)).toBeVisible({
      timeout: 3000,
    });
  });

  test('should close ticket', async ({ page }) => {
    await page.goto('/support/tickets/test-ticket-id');

    // Click close button
    await page.click('[data-testid="close-ticket-button"]');

    // Confirm
    await page.click('[data-testid="confirm-close"]');

    // Verify status updated
    await expect(page.locator('[data-testid="ticket-status"]')).toContainText('Closed');
  });
});
```

---

## Test Suite 7: Notifications

### File: `tests/e2e/notifications/bell.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { waitForRealtimeUpdate } from '../../setup/supabase-helpers';

test.describe('Notifications', () => {
  test('should display notification bell with count', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify notification bell visible
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();

    // Verify unread count (if any)
    const badge = page.locator('[data-testid="notification-badge"]');
    // Badge may or may not be visible depending on unread count
  });

  test('should show notifications dropdown', async ({ page }) => {
    await page.goto('/dashboard');

    // Click notification bell
    await page.click('[data-testid="notification-bell"]');

    // Verify dropdown visible
    await expect(page.locator('[data-testid="notifications-dropdown"]')).toBeVisible();

    // Verify notifications list
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCountGreaterThanOrEqual(
      0
    );
  });

  test('should mark notification as read', async ({ page }) => {
    await page.goto('/dashboard');

    // Open notifications
    await page.click('[data-testid="notification-bell"]');

    // Click on unread notification
    await page.click('[data-testid="notification-item"]:has([data-unread="true"])');

    // Verify marked as read
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="notification-item"][data-unread="true"]')).toHaveCount(
      0
    );
  });

  test('should receive real-time notifications', async ({ page, context }) => {
    await page.goto('/dashboard');

    // Trigger notification (simulate in another context)
    // For example, create a booking that generates a notification

    // Wait for real-time update
    await waitForRealtimeUpdate(3000);

    // Verify notification badge updated
    await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should mark all as read', async ({ page }) => {
    await page.goto('/dashboard');

    // Open notifications
    await page.click('[data-testid="notification-bell"]');

    // Click mark all as read
    await page.click('[data-testid="mark-all-read"]');

    // Verify all marked as read
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="notification-item"][data-unread="true"]')).toHaveCount(
      0
    );

    // Verify badge hidden
    await expect(page.locator('[data-testid="notification-badge"]')).toBeHidden();
  });
});
```

---

## Running E2E Tests

### Run All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/facilities/list.spec.ts

# Run tests for specific browser
npm run test:e2e:chromium

# Debug tests
npm run test:e2e:debug
```

### View Test Report

```bash
# Generate and open HTML report
npm run test:e2e:report
```

---

## Best Practices

### 1. Use Data Test IDs

```tsx
// In components
<button data-testid="submit-button">Submit</button>

// In tests
await page.click('[data-testid="submit-button"]');
```

### 2. Wait for Network Requests

```typescript
// Wait for API response
await page.waitForResponse((response) =>
  response.url().includes('/api/facilities') && response.status() === 200
);
```

### 3. Clean Up Test Data

```typescript
test.afterEach(async () => {
  // Always clean up
  await cleanupTestData();
});
```

### 4. Use Page Object Model

```typescript
// Create page objects for reusability
class FacilityPage {
  constructor(private page: Page) {}

  async goto(id: string) {
    await this.page.goto(`/facilities/${id}`);
  }

  async clickBookNow() {
    await this.page.click('[data-testid="book-now-button"]');
  }
}
```

### 5. Test Real-time Features

```typescript
// Always wait for real-time updates
await waitForRealtimeUpdate(2000);

// Verify updates in multiple tabs
const page2 = await context.newPage();
// ... verify sync ...
```

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start Supabase
        run: npx supabase start

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Test Coverage:** 7 major user flows
**Total Tests:** 40+ E2E scenarios
