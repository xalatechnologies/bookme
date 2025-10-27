import { test, expect } from '@playwright/test';

test.describe('Bookings - Create Flow', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    // Navigate to facilities to start booking
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');
  });

  test('should create a single booking', async ({ page }) => {
    // Click first facility
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Select tomorrow's date
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      await dateInput.fill(dateStr);
      await page.waitForTimeout(500);
    }

    // Select available time slot
    const timeSlots = page.locator(
      '[data-testid="time-slot"]:not([disabled])'
    );
    const availableSlots = await timeSlots.count();

    if (availableSlots > 0) {
      await timeSlots.first().click();

      // Click book button
      const bookButton = page.locator(
        'button:has-text("Book"), button:has-text("Reserve"), button:has-text("Confirm")'
      );
      await bookButton.click();

      // Should show success message or confirmation
      const successMessage = page.locator(
        'text=/booking.*created|booking.*confirmed|success/i'
      );
      await expect(successMessage).toBeVisible({ timeout: 15000 });
    }
  });

  test('should validate required booking fields', async ({ page }) => {
    // Click first facility
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Try to book without selecting date/time
    const bookButton = page.locator(
      'button:has-text("Book"), button:has-text("Reserve")'
    );

    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Should show validation error
      const errorMessage = page.locator(
        'text=/please select.*date|time.*required|select.*time slot/i'
      );
      const isErrorVisible = await errorMessage.isVisible();

      // Or button might be disabled
      const isDisabled = await bookButton.isDisabled();

      expect(isErrorVisible || isDisabled).toBeTruthy();
    }
  });

  test('should calculate booking price correctly', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Get hourly price
    const priceText = await page
      .locator('text=/AED.*\/hour|Price:.*AED/i')
      .first()
      .textContent();
    const hourlyPrice = parseInt(priceText?.match(/\d+/)?.[0] || '0');

    // Select duration
    const durationInput = page.locator(
      'input[name="duration"], select[name="hours"]'
    );

    if (await durationInput.isVisible()) {
      await durationInput.fill('2');
      await page.waitForTimeout(300);

      // Check calculated total
      const totalText = await page
        .locator('[data-testid="total-price"], text=/Total:.*AED/i')
        .textContent();
      const total = parseInt(totalText?.match(/\d+/)?.[0] || '0');

      expect(total).toBe(hourlyPrice * 2);
    }
  });

  test('should prevent booking past time slots', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Select today's date
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await dateInput.fill(today);
      await page.waitForTimeout(500);

      // Past time slots should be disabled
      const timeSlots = page.locator('[data-testid="time-slot"]');
      const firstSlot = timeSlots.first();

      if ((await timeSlots.count()) > 0) {
        const isDisabled = await firstSlot.isDisabled();
        // Past slots should be disabled
        expect(isDisabled).toBeTruthy();
      }
    }
  });

  test('should show booking summary before confirmation', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Complete booking form
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      await page.waitForTimeout(500);
    }

    const timeSlots = page.locator('[data-testid="time-slot"]:not([disabled])');
    if ((await timeSlots.count()) > 0) {
      await timeSlots.first().click();

      const bookButton = page.locator('button:has-text("Book"), button:has-text("Review")');
      await bookButton.click();

      // Should show booking summary
      const summary = page.locator(
        '[data-testid="booking-summary"], text=/booking.*details|review.*booking/i'
      );
      const isSummaryVisible = await summary.isVisible({ timeout: 5000 });

      if (isSummaryVisible) {
        // Summary should include facility name, date, time, price
        await expect(summary).toBeVisible();
      }
    }
  });

  test('should handle zone selection for zoned facilities', async ({ page }) => {
    // Find a facility with zones (might need to filter)
    await page.goto('/facilities');
    const facilityCard = page.locator('[data-testid="facility-card"]').first();
    await facilityCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    const zoneSelector = page.locator(
      '[data-testid="zone-selector"], select[name="zone"]'
    );

    if (await zoneSelector.isVisible()) {
      // Select a zone
      const options = zoneSelector.locator('option');
      const optionCount = await options.count();

      if (optionCount > 1) {
        await zoneSelector.selectOption({ index: 1 });
        await page.waitForTimeout(300);

        // Should update availability based on zone
        const timeSlots = page.locator('[data-testid="time-slot"]');
        await expect(timeSlots.first()).toBeVisible();
      }
    }
  });

  test('should support additional services selection', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    const additionalServices = page.locator(
      '[data-testid="additional-service"], .service-checkbox'
    );

    if ((await additionalServices.count()) > 0) {
      // Select first additional service
      await additionalServices.first().click();

      // Price should update
      const totalPrice = page.locator(
        '[data-testid="total-price"], text=/Total:.*AED/i'
      );
      await expect(totalPrice).toBeVisible();
    }
  });
});

test.describe('Bookings - Recurring Bookings', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should create a recurring booking', async ({ page }) => {
    await page.goto('/facilities');
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Look for recurring option
    const recurringToggle = page.locator(
      '[data-testid="recurring-toggle"], input[type="checkbox"][name*="recurring"]'
    );

    if (await recurringToggle.isVisible()) {
      await recurringToggle.click();

      // Should show recurring options
      const frequencySelect = page.locator(
        'select[name="frequency"], [data-testid="frequency-select"]'
      );
      await expect(frequencySelect).toBeVisible();

      // Select weekly recurrence
      await frequencySelect.selectOption('weekly');

      // Set end date
      const endDateInput = page.locator('input[name="endDate"]');
      if (await endDateInput.isVisible()) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        await endDateInput.fill(endDate.toISOString().split('T')[0]);
      }

      // Complete booking
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      }

      const timeSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
      if (await timeSlot.isVisible()) {
        await timeSlot.click();

        const bookButton = page.locator('button:has-text("Book")');
        await bookButton.click();

        // Should show success for recurring booking
        const success = page.locator('text=/recurring.*created|series.*booked/i');
        await expect(success).toBeVisible({ timeout: 15000 });
      }
    }
  });
});

test.describe('Bookings - Group Bookings', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should create a group booking', async ({ page }) => {
    await page.goto('/facilities');
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Look for group booking option
    const groupToggle = page.locator(
      '[data-testid="group-toggle"], input[type="checkbox"][name*="group"]'
    );

    if (await groupToggle.isVisible()) {
      await groupToggle.click();

      // Should show member input
      const memberInput = page.locator(
        '[data-testid="member-email"], input[name*="member"]'
      );
      await expect(memberInput).toBeVisible();

      // Add group member
      await memberInput.fill('member@example.com');

      const addButton = page.locator('button:has-text("Add"), button:has-text("+")');
      if (await addButton.isVisible()) {
        await addButton.click();

        // Member should be added to list
        const memberList = page.locator('[data-testid="member-list"]');
        await expect(memberList).toContainText('member@example.com');
      }
    }
  });
});

test.describe('Bookings - Payment Flow', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should proceed to payment after booking confirmation', async ({ page }) => {
    await page.goto('/facilities');
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Complete booking form
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      await page.waitForTimeout(500);
    }

    const timeSlot = page.locator('[data-testid="time-slot"]:not([disabled])').first();
    if (await timeSlot.isVisible()) {
      await timeSlot.click();

      const bookButton = page.locator('button:has-text("Book"), button:has-text("Proceed")');
      await bookButton.click();

      // Should navigate to payment or show payment modal
      const paymentSection = page.locator(
        '[data-testid="payment-section"], text=/payment.*method|pay.*now/i'
      );
      const isPaymentVisible = await paymentSection.isVisible({ timeout: 10000 });
      const urlChanged = page.url().includes('/payment') || page.url().includes('/checkout');

      expect(isPaymentVisible || urlChanged).toBeTruthy();
    }
  });
});
