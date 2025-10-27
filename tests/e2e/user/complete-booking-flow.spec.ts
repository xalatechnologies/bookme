import { test, expect } from '@playwright/test';
import { testCredentials } from '../../fixtures/users';
import { newBookingData } from '../../fixtures/bookings';

/**
 * Complete User Booking Flow E2E Test
 *
 * Tests the entire booking journey from login to booking confirmation.
 * This represents the critical happy path that must always work.
 */

test.describe('Complete User Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should complete full booking flow from search to confirmation', async ({ page }) => {
    // Step 1: Login
    await test.step('User logs in', async () => {
      await page.click('text=Logg inn');
      await page.waitForURL('**/login');

      await page.fill('input[name="email"]', testCredentials.validUser.email);
      await page.fill('input[name="password"]', testCredentials.validUser.password);
      await page.click('button[type="submit"]');

      // Wait for successful login
      await page.waitForURL('**/user/dashboard');
      await expect(page.locator('text=Velkommen')).toBeVisible();
    });

    // Step 2: Navigate to facilities
    await test.step('Navigate to facilities', async () => {
      await page.click('text=Utforsk lokaler');
      await page.waitForURL('**/user/facilities');
      await expect(page.locator('h1:has-text("Lokaler")')).toBeVisible();
    });

    // Step 3: Search for a facility
    await test.step('Search for facility', async () => {
      const searchInput = page.locator('input[placeholder*="Søk"]');
      await searchInput.fill('Idrettshall');
      await page.waitForTimeout(500); // Debounce delay

      // Verify search results
      await expect(page.locator('article').first()).toBeVisible();
    });

    // Step 4: View facility details
    await test.step('View facility details', async () => {
      await page.locator('article').first().click();

      // Verify facility details page
      await expect(page.locator('h1')).toContainText('Idrettshall');
      await expect(page.locator('text=Book lokale')).toBeVisible();
    });

    // Step 5: Select date and time
    await test.step('Select booking date and time', async () => {
      // Open date picker
      await page.click('[data-testid="date-picker"]');

      // Select a future date (15th of current month)
      await page.click('button:has-text("15")');

      // Select time slot
      await page.selectOption('select[name="start-time"]', '10:00');
      await page.selectOption('select[name="end-time"]', '12:00');

      // Verify price calculation
      await expect(page.locator('[data-testid="total-price"]')).toContainText('kr');
    });

    // Step 6: Add to cart or proceed to checkout
    await test.step('Proceed to checkout', async () => {
      await page.click('button:has-text("Legg til i handlekurv")');

      // Verify item added to cart
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

      // Go to cart
      await page.click('[data-testid="cart-icon"]');
      await expect(page.locator('text=Handlekurv')).toBeVisible();

      // Proceed to checkout
      await page.click('button:has-text("Gå til kasse")');
      await page.waitForURL('**/checkout');
    });

    // Step 7: Fill checkout form
    await test.step('Fill checkout form', async () => {
      // Add optional notes
      await page.fill('textarea[name="notes"]', 'E2E test booking - Please confirm');

      // Verify booking summary
      await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
      await expect(page.locator('text=Idrettshall')).toBeVisible();
    });

    // Step 8: Complete booking (without actual payment in test)
    await test.step('Complete booking', async () => {
      // Mock payment success (in real E2E, this would go through test payment gateway)
      await page.click('button:has-text("Fullfør bestilling")');

      // Wait for confirmation page
      await page.waitForURL('**/booking-confirmation/**', { timeout: 10000 });

      // Verify success message
      await expect(page.locator('text=Booking bekreftet')).toBeVisible();
      await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
    });

    // Step 9: View booking in My Bookings
    await test.step('Verify booking in My Bookings', async () => {
      await page.click('text=Mine bookinger');
      await page.waitForURL('**/user/bookings');

      // Verify the booking appears in the list
      await expect(page.locator('text=Idrettshall').first()).toBeVisible();
      await expect(page.locator('[data-status="pending"]').first()).toBeVisible();
    });
  });

  test('should handle unavailable time slot gracefully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testCredentials.validUser.email);
    await page.fill('input[name="password"]', testCredentials.validUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/user/dashboard');

    // Navigate to facilities and select one
    await page.goto('/user/facilities');
    await page.locator('article').first().click();

    // Try to select an unavailable time slot
    await page.click('[data-testid="date-picker"]');
    await page.click('button:has-text("15")');

    // Select a time that might be taken (this would be mocked in real test)
    await page.selectOption('select[name="start-time"]', '14:00');
    await page.selectOption('select[name="end-time"]', '16:00');

    // The UI should show unavailability or error message
    // (Actual behavior depends on implementation)
    await page.click('button:has-text("Legg til i handlekurv")');

    // Expect either an error toast or disabled button
    const errorMessage = page.locator('text=ikke tilgjengelig, text=opptatt');
    const buttonDisabled = page.locator('button:has-text("Legg til i handlekurv")[disabled]');

    await expect(errorMessage.or(buttonDisabled)).toBeVisible({ timeout: 5000 });
  });

  test('should allow user to cancel a booking', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testCredentials.validUser.email);
    await page.fill('input[name="password"]', testCredentials.validUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/user/dashboard');

    // Navigate to bookings
    await page.goto('/user/bookings');

    // Find a paid booking (assuming one exists from previous test or setup)
    const bookingCard = page.locator('[data-status="paid"]').first();

    if (await bookingCard.isVisible()) {
      await bookingCard.click();

      // Open booking details
      await expect(page.locator('text=Booking detaljer')).toBeVisible();

      // Click cancel button
      await page.click('button:has-text("Avlys booking")');

      // Confirm cancellation in dialog
      await expect(page.locator('text=Er du sikker')).toBeVisible();
      await page.click('button:has-text("Bekreft avlysning")');

      // Verify cancellation
      await expect(page.locator('text=Booking avlyst')).toBeVisible();

      // Booking should now show as cancelled
      await expect(page.locator('[data-status="cancelled"]')).toBeVisible();
    }
  });

  test('should show validation errors for invalid booking data', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testCredentials.validUser.email);
    await page.fill('input[name="password"]', testCredentials.validUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/user/dashboard');

    // Navigate to facilities
    await page.goto('/user/facilities');
    await page.locator('article').first().click();

    // Try to select invalid time range (end before start)
    await page.click('[data-testid="date-picker"]');
    await page.click('button:has-text("15")');

    await page.selectOption('select[name="start-time"]', '14:00');
    await page.selectOption('select[name="end-time"]', '12:00'); // Before start time

    // Should show validation error
    await expect(page.locator('text=ugyldig, text=må være etter')).toBeVisible();

    // Button should be disabled
    await expect(page.locator('button:has-text("Legg til i handlekurv")')).toBeDisabled();
  });

  test('should persist cart items across navigation', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testCredentials.validUser.email);
    await page.fill('input[name="password"]', testCredentials.validUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/user/dashboard');

    // Add item to cart
    await page.goto('/user/facilities');
    await page.locator('article').first().click();

    await page.click('[data-testid="date-picker"]');
    await page.click('button:has-text("15")');
    await page.selectOption('select[name="start-time"]', '10:00');
    await page.selectOption('select[name="end-time"]', '12:00');
    await page.click('button:has-text("Legg til i handlekurv")');

    // Verify cart count
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Navigate away and back
    await page.goto('/user/dashboard');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // Navigate to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });
});

test.describe('Mobile Booking Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE dimensions

  test('should complete booking on mobile device', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testCredentials.validUser.email);
    await page.fill('input[name="password"]', testCredentials.validUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/user/dashboard');

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await page.click('text=Utforsk lokaler');
    await page.waitForURL('**/user/facilities');

    // Search and select facility
    await page.fill('input[placeholder*="Søk"]', 'Idrettshall');
    await page.waitForTimeout(500);
    await page.locator('article').first().click();

    // Select date and time
    await page.click('[data-testid="date-picker"]');
    await page.click('button:has-text("15")');
    await page.selectOption('select[name="start-time"]', '10:00');
    await page.selectOption('select[name="end-time"]', '12:00');

    // Add to cart
    await page.click('button:has-text("Legg til i handlekurv")');

    // Verify mobile cart indicator
    await expect(page.locator('[data-testid="cart-count"]')).toBeVisible();
  });
});
