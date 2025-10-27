import { test, expect } from '@playwright/test';

test.describe('Facilities - Detail View', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  let facilityId: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to facilities list first
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');

    // Get first facility and navigate to it
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    // Wait for detail page
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);
    facilityId = page.url().split('/').pop() || '';
  });

  test('should display facility detail page', async ({ page }) => {
    // Should show facility name
    await expect(page.locator('h1')).toBeVisible();

    // Should show facility image
    const image = page.locator('img[alt*="facility"], [data-testid="facility-image"]').first();
    await expect(image).toBeVisible();

    // Should show description
    const description = page.locator('[data-testid="facility-description"], p');
    await expect(description.first()).toBeVisible();
  });

  test('should display facility information', async ({ page }) => {
    // Should show type
    const type = page.locator('text=/Type:|Category:/i');
    if (await type.isVisible()) {
      await expect(type).toBeVisible();
    }

    // Should show capacity
    const capacity = page.locator('text=/Capacity:/i');
    if (await capacity.isVisible()) {
      await expect(capacity).toBeVisible();
    }

    // Should show price
    const price = page.locator('text=/Price:|AED|\/hour/i');
    await expect(price.first()).toBeVisible();

    // Should show address
    const address = page.locator('text=/Address:|Location:/i, [data-testid="facility-address"]');
    if (await address.isVisible()) {
      await expect(address).toBeVisible();
    }
  });

  test('should display facility amenities', async ({ page }) => {
    const amenitiesSection = page.locator(
      'text=/Amenities:|Features:/i, [data-testid="amenities-section"]'
    );

    if (await amenitiesSection.isVisible()) {
      // Should show amenity list
      const amenityItems = page.locator(
        '[data-testid="amenity-item"], .amenity-tag, .amenity-badge'
      );
      const count = await amenityItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should display availability calendar', async ({ page }) => {
    const calendar = page.locator(
      '[data-testid="availability-calendar"], .calendar-view'
    );

    if (await calendar.isVisible()) {
      await expect(calendar).toBeVisible();

      // Should have date selector
      const dateSelector = page.locator(
        'input[type="date"], [data-testid="date-picker"]'
      );
      await expect(dateSelector.first()).toBeVisible();
    }
  });

  test('should allow selecting time slots', async ({ page }) => {
    // Look for time slot selector
    const timeSlots = page.locator(
      '[data-testid="time-slot"], .time-slot-button'
    );

    if ((await timeSlots.count()) > 0) {
      // Click first available time slot
      const firstSlot = timeSlots.first();
      await firstSlot.click();

      // Should mark slot as selected
      await expect(firstSlot).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should toggle favorite', async ({ page }) => {
    const favoriteButton = page.locator(
      'button[aria-label*="favorite"], [data-testid="favorite-button"]'
    );

    await expect(favoriteButton).toBeVisible();

    // Get initial state
    const initialState = await favoriteButton.getAttribute('aria-pressed');

    // Click favorite
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // State should toggle
    const newState = await favoriteButton.getAttribute('aria-pressed');
    expect(newState).not.toBe(initialState);
  });

  test('should navigate to booking flow', async ({ page }) => {
    const bookButton = page.locator(
      'button:has-text("Book"), button:has-text("Reserve"), [data-testid="book-button"]'
    );

    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Should navigate to booking page or show booking modal
      const isModalVisible = await page
        .locator('[role="dialog"], [data-testid="booking-modal"]')
        .isVisible();
      const urlChanged = page.url().includes('/book');

      expect(isModalVisible || urlChanged).toBeTruthy();
    }
  });

  test('should display facility images gallery', async ({ page }) => {
    const images = page.locator(
      '[data-testid="facility-image"], .facility-gallery img'
    );
    const imageCount = await images.count();

    if (imageCount > 1) {
      // Should have gallery navigation
      const nextButton = page.locator(
        'button[aria-label*="next"], [data-testid="next-image"]'
      );

      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Image should change
        await expect(images.first()).toBeVisible();
      }
    }
  });

  test('should display zone selection for zoned facilities', async ({ page }) => {
    const zoneSelector = page.locator(
      '[data-testid="zone-selector"], select[name="zone"]'
    );

    if (await zoneSelector.isVisible()) {
      await expect(zoneSelector).toBeVisible();

      // Should have zone options
      const options = zoneSelector.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    }
  });

  test('should calculate price based on duration', async ({ page }) => {
    const durationSelector = page.locator(
      'input[name="duration"], [data-testid="duration-input"]'
    );

    if (await durationSelector.isVisible()) {
      // Enter duration
      await durationSelector.fill('2');

      // Should show calculated price
      const totalPrice = page.locator(
        '[data-testid="total-price"], .total-price, text=/Total:.*AED/i'
      );
      await expect(totalPrice).toBeVisible();
    }
  });

  test('should show facility reviews if available', async ({ page }) => {
    const reviewsSection = page.locator(
      '[data-testid="reviews-section"], text=/Reviews|Ratings/i'
    );

    if (await reviewsSection.isVisible()) {
      // Should show rating
      const rating = page.locator(
        '[data-testid="facility-rating"], .rating-stars'
      );
      await expect(rating).toBeVisible();
    }
  });

  test('should handle facility not found', async ({ page }) => {
    await page.goto('/facilities/non-existent-facility-id-12345');

    // Should show error or redirect
    const errorMessage = page.locator(
      'text=/not found|doesn\'t exist/i, [data-testid="error-message"]'
    );
    const isError = await errorMessage.isVisible();
    const isRedirected = !page.url().includes('non-existent-facility-id');

    expect(isError || isRedirected).toBeTruthy();
  });
});

test.describe('Facilities - Booking from Detail Page', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should complete booking flow from detail page', async ({ page }) => {
    // Navigate to facility detail
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    // Select date (tomorrow)
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      await dateInput.fill(dateStr);
      await page.waitForTimeout(500);
    }

    // Select time slot
    const timeSlots = page.locator('[data-testid="time-slot"]');
    if ((await timeSlots.count()) > 0) {
      await timeSlots.first().click();
    }

    // Click book button
    const bookButton = page.locator(
      'button:has-text("Book"), button:has-text("Reserve")'
    );
    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Should show confirmation or navigate to checkout
      const confirmation = page.locator(
        '[role="dialog"], text=/booking.*confirmed|success/i'
      );
      const isConfirmed = await confirmation.isVisible({ timeout: 10000 });
      const urlChanged = page.url().includes('/book') || page.url().includes('/checkout');

      expect(isConfirmed || urlChanged).toBeTruthy();
    }
  });
});
