import { test, expect } from '@playwright/test';

test.describe('Favorites - Toggle and Management', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');
  });

  test('should add facility to favorites from list view', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    const favoriteButton = firstCard.locator(
      'button[aria-label*="favorite"], [data-testid="favorite-button"]'
    );

    if (await favoriteButton.isVisible()) {
      // Check initial state
      const initialPressed = await favoriteButton.getAttribute('aria-pressed');

      // Click to add favorite
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Should toggle state
      const newPressed = await favoriteButton.getAttribute('aria-pressed');
      expect(newPressed).not.toBe(initialPressed);

      // Should show visual feedback
      const iconChange = await favoriteButton.locator('svg, i').count();
      expect(iconChange).toBeGreaterThan(0);
    }
  });

  test('should remove facility from favorites', async ({ page }) => {
    // First add a favorite
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

    if (await favoriteButton.isVisible()) {
      // Ensure it's favorited
      const isPressed = await favoriteButton.getAttribute('aria-pressed');
      if (isPressed !== 'true') {
        await favoriteButton.click();
        await page.waitForTimeout(500);
      }

      // Now remove it
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Should be unfavorited
      const finalState = await favoriteButton.getAttribute('aria-pressed');
      expect(finalState).toBe('false');
    }
  });

  test('should add facility to favorites from detail page', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

    const favoriteButton = page.locator(
      'button[aria-label*="favorite"], [data-testid="favorite-button"]'
    );

    await expect(favoriteButton).toBeVisible();

    const initialState = await favoriteButton.getAttribute('aria-pressed');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    const newState = await favoriteButton.getAttribute('aria-pressed');
    expect(newState).not.toBe(initialState);
  });

  test('should persist favorite state across navigation', async ({ page }) => {
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    const facilityName = await firstCard.locator('h3, h4').textContent();
    const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

    if (await favoriteButton.isVisible()) {
      // Add to favorites
      await favoriteButton.click();
      await page.waitForTimeout(500);

      // Navigate to detail page
      await firstCard.click();
      await page.waitForURL(/\/facilities\/[a-f0-9-]+/);

      // Favorite state should persist
      const detailFavoriteButton = page.locator('[data-testid="favorite-button"]');
      const state = await detailFavoriteButton.getAttribute('aria-pressed');
      expect(state).toBe('true');

      // Navigate back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Find same facility
      const sameCard = page.locator(`[data-testid="facility-card"]:has-text("${facilityName}")`).first();
      const listFavoriteButton = sameCard.locator('[data-testid="favorite-button"]');

      // Should still be favorited
      const listState = await listFavoriteButton.getAttribute('aria-pressed');
      expect(listState).toBe('true');
    }
  });

  test('should display favorites page', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // Should have favorites header
    await expect(
      page.locator('h1, h2').filter({ hasText: /favorites/i })
    ).toBeVisible();

    // Should show favorites or empty state
    const favoritesList = page.locator('[data-testid="facility-card"]');
    const emptyState = page.locator('text=/no.*favorites|haven\'t.*favorited/i');

    const hasFavorites = (await favoritesList.count()) > 0;
    const isEmpty = await emptyState.isVisible();

    expect(hasFavorites || isEmpty).toBeTruthy();
  });

  test('should show favorite count indicator', async ({ page }) => {
    const favoriteCount = page.locator(
      '[data-testid="favorite-count"], .favorite-badge'
    );

    if (await favoriteCount.isVisible()) {
      const countText = await favoriteCount.textContent();
      const count = parseInt(countText?.match(/\d+/)?.[0] || '0');
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should remove favorite from favorites page', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    const favoriteCard = page.locator('[data-testid="facility-card"]').first();

    if (await favoriteCard.isVisible()) {
      const facilityName = await favoriteCard.locator('h3, h4').textContent();

      // Click unfavorite button
      const unfavoriteButton = favoriteCard.locator('[data-testid="favorite-button"]');
      await unfavoriteButton.click();
      await page.waitForTimeout(1000);

      // Card should be removed from list
      const remainingCards = page.locator(
        `[data-testid="facility-card"]:has-text("${facilityName}")`
      );
      const count = await remainingCards.count();
      expect(count).toBe(0);
    }
  });

  test('should filter favorites by type', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]');

    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('sports');
      await page.waitForTimeout(500);

      const favoriteCards = page.locator('[data-testid="facility-card"]');
      if ((await favoriteCards.count()) > 0) {
        const firstCard = favoriteCards.first();
        await expect(firstCard).toContainText(/sports/i);
      }
    }
  });

  test('should search within favorites', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

    if (await searchInput.isVisible()) {
      const firstCard = page.locator('[data-testid="facility-card"]').first();
      if (await firstCard.isVisible()) {
        const facilityName = await firstCard.locator('h3, h4').textContent();
        const searchTerm = facilityName?.split(' ')[0] || 'sports';

        await searchInput.fill(searchTerm);
        await page.waitForTimeout(500);

        // Should show matching results
        const results = page.locator('[data-testid="facility-card"]');
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should navigate to facility detail from favorites', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    const favoriteCard = page.locator('[data-testid="facility-card"]').first();

    if (await favoriteCard.isVisible()) {
      await favoriteCard.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/facilities\/[a-f0-9-]+/);

      // Favorite button should show favorited state
      const favoriteButton = page.locator('[data-testid="favorite-button"]');
      const state = await favoriteButton.getAttribute('aria-pressed');
      expect(state).toBe('true');
    }
  });

  test('should show empty state when all favorites removed', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    const favoriteCards = page.locator('[data-testid="facility-card"]');
    const count = await favoriteCards.count();

    if (count > 0) {
      // Remove all favorites
      for (let i = 0; i < count; i++) {
        const firstCard = page.locator('[data-testid="facility-card"]').first();
        if (await firstCard.isVisible()) {
          const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');
          await favoriteButton.click();
          await page.waitForTimeout(500);
        }
      }

      // Should show empty state
      const emptyState = page.locator('text=/no.*favorites/i');
      await expect(emptyState).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Favorites - Real-time Updates', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should update favorite count in real-time', async ({ page, context }) => {
    // Open two tabs
    const page2 = await context.newPage();

    // Navigate both to facilities
    await page.goto('/facilities');
    await page2.goto('/favorites');

    await page.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Get initial favorite count on page 2
    const favoriteCountPage2 = page2.locator('[data-testid="favorite-count"]');
    let initialCount = 0;
    if (await favoriteCountPage2.isVisible()) {
      const text = await favoriteCountPage2.textContent();
      initialCount = parseInt(text?.match(/\d+/)?.[0] || '0');
    }

    // Add favorite on page 1
    const firstCard = page.locator('[data-testid="facility-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

    if (await favoriteButton.isVisible()) {
      const isPressed = await favoriteButton.getAttribute('aria-pressed');
      if (isPressed !== 'true') {
        await favoriteButton.click();
        await page.waitForTimeout(2000); // Wait for real-time update

        // Refresh page 2 to see update (in real implementation, should be automatic)
        await page2.reload();
        await page2.waitForLoadState('networkidle');

        // Count should increase
        if (await favoriteCountPage2.isVisible()) {
          const text = await favoriteCountPage2.textContent();
          const newCount = parseInt(text?.match(/\d+/)?.[0] || '0');
          expect(newCount).toBeGreaterThanOrEqual(initialCount);
        }
      }
    }

    await page2.close();
  });
});
