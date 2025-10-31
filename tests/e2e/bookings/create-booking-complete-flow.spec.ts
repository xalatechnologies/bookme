/**
 * E2E Test: Complete Booking Flow
 *
 * Tests the entire user journey from facility selection to booking completion
 * including calendar selection, form filling, and confirmation.
 *
 * Test Coverage:
 * - Browse and select facility
 * - Navigate through step-by-step booking
 * - Select time slots from calendar
 * - Fill in booking details
 * - Accept terms and conditions
 * - Complete booking
 * - Verify confirmation
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'test.user@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

const TEST_BOOKING = {
  purpose: 'Team Workshop and Training Session',
  attendees: 15,
  activityType: 'Møte',
  actorType: 'Privat firma',
  additionalInfo: 'We need projector and whiteboard',
};

/**
 * Helper: Login to the application
 */
async function login(page: Page) {
  await page.goto('/login');
  await page.fill('[name="email"]', TEST_USER.email);
  await page.fill('[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/\//, { timeout: 10000 });
}

/**
 * Helper: Select a facility from the list
 */
async function selectFacility(page: Page, facilityName: string) {
  await page.goto('/facilities');

  // Wait for facilities to load
  await page.waitForSelector('[data-testid="facility-card"]', { timeout: 10000 });

  // Click on the facility card
  await page.click(`text="${facilityName}"`);

  // Wait for facility details page
  await page.waitForSelector('[data-testid="facility-detail"]', { timeout: 10000 });
}

/**
 * Helper: Navigate through booking steps
 */
async function navigateToStep(page: Page, stepName: string) {
  await page.click(`button:has-text("${stepName}")`);
  await page.waitForTimeout(500); // Wait for step transition
}

test.describe('Complete Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('should complete full booking flow from facility selection to confirmation', async ({ page }) => {
    // Step 1: Browse and select facility
    await test.step('Browse facilities', async () => {
      await page.goto('/facilities');

      // Verify facilities are loaded
      await expect(page.locator('[data-testid="facility-card"]')).toHaveCount(
        expect.any(Number)
      );

      // Select first facility
      const firstFacility = page.locator('[data-testid="facility-card"]').first();
      const facilityName = await firstFacility.locator('h3').textContent();

      await firstFacility.click();

      // Verify facility details page
      await expect(page).toHaveURL(/\/facilities\/[^/]+/);
      await expect(page.locator('h1')).toContainText(facilityName || '');
    });

    // Step 2: Start booking process
    await test.step('Start booking', async () => {
      await page.click('button:has-text("Book nå")');

      // Verify booking modal or page opened
      await expect(page.locator('[data-testid="step-by-step-booking"]')).toBeVisible();
    });

    // Step 3: Select time slots
    await test.step('Select time slots from calendar', async () => {
      // Verify calendar is visible
      await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();

      // Select zone if multiple zones available
      const zoneSelector = page.locator('[data-testid="zone-selector"]');
      if (await zoneSelector.isVisible()) {
        await zoneSelector.click();
        await page.click('[data-testid="zone-option"]').first();
      }

      // Select time slots (click on available slots)
      const availableSlots = page.locator('[data-availability="available"]');
      const slotCount = await availableSlots.count();

      if (slotCount > 0) {
        // Select first 2 available slots
        await availableSlots.nth(0).click();
        if (slotCount > 1) {
          await availableSlots.nth(1).click();
        }
      }

      // Verify slots are selected
      await expect(page.locator('[data-testid="selected-slots"]')).toContainText(/\d+ valgte/i);

      // Verify next button is enabled
      await expect(page.locator('button:has-text("Neste")')).toBeEnabled();
    });

    // Step 4: Navigate to booking details
    await test.step('Navigate to details step', async () => {
      await page.click('button:has-text("Neste")');

      // Verify we're on details step
      await expect(page.locator('[data-step="details"]')).toBeVisible();
    });

    // Step 5: Fill in booking details
    await test.step('Fill booking details', async () => {
      // Fill purpose
      await page.fill('[name="purpose"]', TEST_BOOKING.purpose);

      // Fill attendees
      await page.fill('[name="attendees"]', TEST_BOOKING.attendees.toString());

      // Select activity type
      await page.click('[name="activityType"]');
      await page.click(`text="${TEST_BOOKING.activityType}"`);

      // Select actor type
      await page.click('[name="actorType"]');
      await page.click(`text="${TEST_BOOKING.actorType}"`);

      // Fill additional info
      await page.fill('[name="additionalInfo"]', TEST_BOOKING.additionalInfo);

      // Verify form is filled
      await expect(page.locator('[name="purpose"]')).toHaveValue(TEST_BOOKING.purpose);
    });

    // Step 6: Navigate through recurrence step
    await test.step('Skip recurrence (one-time booking)', async () => {
      await page.click('button:has-text("Neste")');

      // Verify one-time booking is selected (default)
      await expect(page.locator('[value="one-time"]')).toBeChecked();

      // Continue to next step
      await page.click('button:has-text("Neste")');
    });

    // Step 7: Accept terms and conditions
    await test.step('Accept terms and conditions', async () => {
      // Verify terms page is visible
      await expect(page.locator('[data-step="terms"]')).toBeVisible();

      // Scroll and read terms
      await page.locator('[data-testid="terms-content"]').scrollIntoViewIfNeeded();

      // Accept terms
      await page.check('[name="termsAccepted"]');

      // Verify checkbox is checked
      await expect(page.locator('[name="termsAccepted"]')).toBeChecked();

      // Continue to review
      await page.click('button:has-text("Neste")');
    });

    // Step 8: Review booking summary
    await test.step('Review booking summary', async () => {
      // Verify review page
      await expect(page.locator('[data-step="review"]')).toBeVisible();

      // Verify booking details are displayed
      await expect(page.locator('[data-testid="booking-summary"]')).toContainText(TEST_BOOKING.purpose);
      await expect(page.locator('[data-testid="booking-summary"]')).toContainText(`${TEST_BOOKING.attendees}`);

      // Verify selected slots are shown
      await expect(page.locator('[data-testid="selected-slots-summary"]')).toBeVisible();

      // Verify price is calculated
      await expect(page.locator('[data-testid="total-price"]')).toContainText(/\d+\.\d+ kr/);
    });

    // Step 9: Complete booking
    await test.step('Complete booking', async () => {
      // Click complete booking button
      await page.click('button:has-text("Fullfør booking")');

      // Wait for confirmation
      await page.waitForURL(/\/bookings\/confirmation|\/bookings\/success/, { timeout: 15000 });

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
    });

    // Step 10: Verify booking appears in user's bookings
    await test.step('Verify booking in list', async () => {
      await page.goto('/bookings');

      // Verify booking appears in the list
      await expect(page.locator(`text="${TEST_BOOKING.purpose}"`)).toBeVisible();
    });
  });

  test('should add booking to cart instead of completing immediately', async ({ page }) => {
    await test.step('Navigate to booking flow', async () => {
      await selectFacility(page, 'Conference Room A');
      await page.click('button:has-text("Book nå")');
    });

    await test.step('Select slots and fill details', async () => {
      // Select slots
      const availableSlots = page.locator('[data-availability="available"]');
      await availableSlots.first().click();

      // Fill minimal details
      await page.click('button:has-text("Neste")');
      await page.fill('[name="purpose"]', 'Quick meeting');
      await page.fill('[name="attendees"]', '5');
    });

    await test.step('Navigate to review and add to cart', async () => {
      // Skip through steps
      await page.click('button:has-text("Neste")'); // To recurrence
      await page.click('button:has-text("Neste")'); // To terms
      await page.check('[name="termsAccepted"]');
      await page.click('button:has-text("Neste")'); // To review

      // Click add to cart
      await page.click('button:has-text("Legg til i handlekurv")');

      // Verify cart notification
      await expect(page.locator('[data-testid="cart-notification"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-notification"]')).toContainText(/lagt til i handlekurv/i);
    });

    await test.step('Verify cart contains the booking', async () => {
      await page.goto('/cart');

      await expect(page.locator('[data-testid="cart-item"]')).toContainText('Quick meeting');
    });
  });

  test('should validate required fields before proceeding', async ({ page }) => {
    await test.step('Start booking without selecting slots', async () => {
      await page.goto('/facilities');
      await page.locator('[data-testid="facility-card"]').first().click();
      await page.click('button:has-text("Book nå")');

      // Try to proceed without selecting slots
      await page.click('button:has-text("Neste")');

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/velg minst ett tidspunkt/i);
    });

    await test.step('Try to proceed without filling required details', async () => {
      // Select a slot
      await page.locator('[data-availability="available"]').first().click();
      await page.click('button:has-text("Neste")');

      // Try to proceed without filling purpose
      await page.click('button:has-text("Neste")');

      // Verify validation error
      await expect(page.locator('[data-testid="field-error"]')).toContainText(/påkrevd/i);
    });

    await test.step('Try to proceed without accepting terms', async () => {
      // Fill details
      await page.fill('[name="purpose"]', 'Test booking');
      await page.fill('[name="attendees"]', '10');
      await page.click('button:has-text("Neste")'); // To recurrence
      await page.click('button:has-text("Neste")'); // To terms

      // Try to proceed without accepting terms
      await page.click('button:has-text("Neste")');

      // Verify terms validation
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/akseptere vilkårene/i);
    });
  });

  test('should handle recurring booking creation', async ({ page }) => {
    await test.step('Start recurring booking', async () => {
      await selectFacility(page, 'Conference Room A');
      await page.click('button:has-text("Book nå")');
    });

    await test.step('Select recurring pattern', async () => {
      // Select slots
      await page.locator('[data-availability="available"]').first().click();
      await page.click('button:has-text("Neste")');

      // Fill details
      await page.fill('[name="purpose"]', 'Weekly team meeting');
      await page.fill('[name="attendees"]', '8');
      await page.click('button:has-text("Neste")');

      // Select recurring
      await page.check('[value="recurring"]');

      // Verify recurrence options appear
      await expect(page.locator('[data-testid="recurrence-pattern"]')).toBeVisible();

      // Select weekly pattern
      await page.click('text="Ukentlig"');

      // Select weekdays
      await page.check('[name="weekday-monday"]');
      await page.check('[name="weekday-wednesday"]');

      // Set number of occurrences
      await page.fill('[name="maxOccurrences"]', '10');
    });

    await test.step('Complete recurring booking', async () => {
      await page.click('button:has-text("Neste")'); // To terms
      await page.check('[name="termsAccepted"]');
      await page.click('button:has-text("Neste")'); // To review

      // Verify recurring bookings are shown in summary
      await expect(page.locator('[data-testid="recurring-summary"]')).toContainText('10 bookinger');

      // Complete booking
      await page.click('button:has-text("Fullfør booking")');

      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toContainText(/gjentakende booking opprettet/i);
    });
  });

  test('should allow editing booking before completion', async ({ page }) => {
    await test.step('Complete booking flow to review', async () => {
      await selectFacility(page, 'Conference Room A');
      await page.click('button:has-text("Book nå")');

      // Quick flow to review
      await page.locator('[data-availability="available"]').first().click();
      await page.click('button:has-text("Neste")');
      await page.fill('[name="purpose"]', 'Initial purpose');
      await page.fill('[name="attendees"]', '10');
      await page.click('button:has-text("Neste")'); // Recurrence
      await page.click('button:has-text("Neste")'); // Terms
      await page.check('[name="termsAccepted"]');
      await page.click('button:has-text("Neste")'); // Review
    });

    await test.step('Edit booking details from review', async () => {
      // Click edit button
      await page.click('[data-testid="edit-details-button"]');

      // Should navigate back to details step
      await expect(page.locator('[data-step="details"]')).toBeVisible();

      // Edit purpose
      await page.fill('[name="purpose"]', 'Updated purpose');

      // Navigate back to review
      await page.click('button:has-text("Neste")'); // Recurrence
      await page.click('button:has-text("Neste")'); // Terms
      await page.click('button:has-text("Neste")'); // Review

      // Verify updated purpose in review
      await expect(page.locator('[data-testid="booking-summary"]')).toContainText('Updated purpose');
    });
  });

  test('should handle booking with multiple zones', async ({ page }) => {
    await test.step('Select facility with multiple zones', async () => {
      await page.goto('/facilities');

      // Find facility with multiple zones
      await page.click('[data-testid="facility-card"]:has-text("Sports Complex")');

      await page.click('button:has-text("Book nå")');
    });

    await test.step('Select different zones', async () => {
      // Verify zone selector is visible
      await expect(page.locator('[data-testid="zone-selector"]')).toBeVisible();

      // Select first zone
      await page.selectOption('[data-testid="zone-selector"]', { index: 0 });

      // Select slots in first zone
      await page.locator('[data-availability="available"]').first().click();

      // Switch to second zone
      await page.selectOption('[data-testid="zone-selector"]', { index: 1 });

      // Select slots in second zone
      await page.locator('[data-availability="available"]').first().click();

      // Verify slots from both zones are selected
      await expect(page.locator('[data-testid="selected-slots"]')).toContainText(/2 valgte/i);
    });
  });

  test('should cancel booking flow and return to facility list', async ({ page }) => {
    await test.step('Start booking and cancel', async () => {
      await selectFacility(page, 'Conference Room A');
      await page.click('button:has-text("Book nå")');

      // Click cancel button
      await page.click('[data-testid="cancel-booking-button"]');

      // Confirm cancellation in dialog
      await page.click('button:has-text("Ja, avbryt")');

      // Verify returned to facility details
      await expect(page).toHaveURL(/\/facilities\/[^/]+/);
    });
  });
});

test.describe('Booking Flow - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await login(page);
    await selectFacility(page, 'Conference Room A');
    await page.click('button:has-text("Book nå")');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is on interactive element
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'SELECT']).toContain(focused);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await login(page);
    await selectFacility(page, 'Conference Room A');
    await page.click('button:has-text("Book nå")');

    // Verify progress bar has ARIA label
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-label');

    // Verify form fields have labels
    await page.click('button:has-text("Neste")');
    const purposeInput = page.locator('[name="purpose"]');
    const inputId = await purposeInput.getAttribute('id');
    await expect(page.locator(`label[for="${inputId}"]`)).toBeVisible();
  });
});
