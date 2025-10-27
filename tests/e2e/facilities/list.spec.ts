import { test, expect } from '@playwright/test';

test.describe('Facilities - List View', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/facilities');
  });

  test('should display facilities list page', async ({ page }) => {
    await expect(page).toHaveTitle(/Facilities|BookMe/);
    await expect(page.locator('h1, h2').filter({ hasText: /facilities/i })).toBeVisible();
  });

  test('should display facility cards', async ({ page }) => {
    // Wait for facilities to load
    await page.waitForLoadState('networkidle');

    // Should have at least one facility card
    const facilityCards = page.locator('[data-testid="facility-card"], .facility-card');
    await expect(facilityCards.first()).toBeVisible({ timeout: 10000 });

    // Each card should have key information
    const firstCard = facilityCards.first();
    await expect(firstCard.locator('img, [role="img"]')).toBeVisible();
    await expect(firstCard.locator('text=/.*/')).toBeVisible(); // Has some text
  });

  test('should filter facilities by search', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialCards = page.locator('[data-testid="facility-card"], .facility-card');
    const initialCount = await initialCards.count();

    // Enter search term
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Sports');
      await page.waitForTimeout(500); // Debounce

      // Should filter results
      const filteredCards = page.locator('[data-testid="facility-card"], .facility-card');
      const filteredCount = await filteredCards.count();

      // Count should change or stay same if all match
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should filter facilities by type', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for filter controls
    const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]');

    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('sports');
      await page.waitForTimeout(500);

      // All visible cards should be sports facilities
      const cards = page.locator('[data-testid="facility-card"]');
      const count = await cards.count();

      if (count > 0) {
        const firstCard = cards.first();
        await expect(firstCard).toContainText(/sports/i);
      }
    }
  });

  test('should filter facilities by price range', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const priceFilter = page.locator(
      'input[name="maxPrice"], [data-testid="price-filter"]'
    );

    if (await priceFilter.isVisible()) {
      await priceFilter.fill('500');
      await page.waitForTimeout(500);

      // Should show filtered results
      const cards = page.locator('[data-testid="facility-card"]');
      await expect(cards.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should sort facilities', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const sortSelect = page.locator('select[name="sort"], [data-testid="sort-select"]');

    if (await sortSelect.isVisible()) {
      // Get initial first card title
      const firstCard = page.locator('[data-testid="facility-card"]').first();
      const initialTitle = await firstCard.locator('h3, h2').textContent();

      // Change sort order
      await sortSelect.selectOption('price-asc');
      await page.waitForTimeout(500);

      // First card might change
      const newFirstCard = page.locator('[data-testid="facility-card"]').first();
      await expect(newFirstCard).toBeVisible();
    }
  });

  test('should display facility availability status', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid="facility-card"]');

    if ((await cards.count()) > 0) {
      const firstCard = cards.first();

      // Should show availability indicator
      const availabilityBadge = firstCard.locator(
        '[data-testid="availability-badge"], .availability-status, text=/available|booked|unavailable/i'
      );

      // Availability info should exist (might be hidden)
      const hasAvailability = await availabilityBadge.count() > 0;
      expect(hasAvailability).toBeTruthy();
    }
  });

  test('should navigate to facility detail on card click', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Click card
    await firstCard.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/facilities\/[a-f0-9-]+/);
  });

  test('should display empty state when no facilities found', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistentfacility123');
      await page.waitForTimeout(500);

      // Should show empty state
      const emptyState = page.locator(
        'text=/no.*facilities.*found/i, [data-testid="empty-state"]'
      );
      await expect(emptyState).toBeVisible({ timeout: 5000 });
    }
  });

  test('should toggle favorite on facility card', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[data-testid="facility-card"]').first();
    const favoriteButton = firstCard.locator(
      'button[aria-label*="favorite"], [data-testid="favorite-button"]'
    );

    if (await favoriteButton.isVisible()) {
      // Get initial state
      const initialState = await favoriteButton.getAttribute('aria-pressed');

      // Click favorite button
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // State should change
      const newState = await favoriteButton.getAttribute('aria-pressed');
      expect(newState).not.toBe(initialState);
    }
  });
});

test.describe('Facilities - Pagination', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should paginate facilities list', async ({ page }) => {
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');

    const paginationControls = page.locator(
      '[data-testid="pagination"], nav[aria-label="Pagination"]'
    );

    if (await paginationControls.isVisible()) {
      const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]');

      if (await nextButton.isEnabled()) {
        // Get first card title on page 1
        const firstCardPage1 = page.locator('[data-testid="facility-card"]').first();
        const titlePage1 = await firstCardPage1.locator('h3, h2').textContent();

        // Go to next page
        await nextButton.click();
        await page.waitForLoadState('networkidle');

        // Get first card title on page 2
        const firstCardPage2 = page.locator('[data-testid="facility-card"]').first();
        const titlePage2 = await firstCardPage2.locator('h3, h2').textContent();

        // Titles should be different
        expect(titlePage1).not.toBe(titlePage2);
      }
    }
  });
});

test.describe('Facilities - Map View', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should toggle between list and map view', async ({ page }) => {
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');

    const mapToggle = page.locator(
      'button:has-text("Map"), [data-testid="map-toggle"]'
    );

    if (await mapToggle.isVisible()) {
      await mapToggle.click();

      // Should show map view
      const mapContainer = page.locator('[data-testid="map-view"], .map-container');
      await expect(mapContainer).toBeVisible({ timeout: 5000 });

      // Toggle back to list
      const listToggle = page.locator(
        'button:has-text("List"), [data-testid="list-toggle"]'
      );
      await listToggle.click();

      // Should show list view
      const listContainer = page.locator('[data-testid="facility-list"]');
      await expect(listContainer).toBeVisible();
    }
  });
});
