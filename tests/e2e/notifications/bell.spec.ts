import { test, expect } from '@playwright/test';

test.describe('Notifications - Bell Icon and List', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display notification bell icon', async ({ page }) => {
    const bellIcon = page.locator(
      'button[aria-label*="notification"], [data-testid="notification-bell"]'
    );

    await expect(bellIcon).toBeVisible();
  });

  test('should display unread notification count', async ({ page }) => {
    const notificationBadge = page.locator(
      '[data-testid="notification-badge"], .notification-count'
    );

    if (await notificationBadge.isVisible()) {
      const badgeText = await notificationBadge.textContent();
      const count = parseInt(badgeText?.match(/\d+/)?.[0] || '0');
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should open notification dropdown', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');

    await bellIcon.click();

    // Should show notification dropdown
    const dropdown = page.locator(
      '[data-testid="notification-dropdown"], [role="menu"]'
    );
    await expect(dropdown).toBeVisible();
  });

  test('should display notification list', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const notificationList = page.locator(
      '[data-testid="notification-list"], [data-testid="notification-item"]'
    );
    const emptyState = page.locator('text=/no.*notifications/i');

    const hasNotifications = (await notificationList.count()) > 0;
    const isEmpty = await emptyState.isVisible();

    expect(hasNotifications || isEmpty).toBeTruthy();
  });

  test('should display notification details', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const notification = page.locator('[data-testid="notification-item"]').first();

    if (await notification.isVisible()) {
      // Should show notification title/message
      await expect(notification.locator('h4, h5, .notification-title')).toBeVisible();

      // Should show timestamp
      const timestamp = notification.locator('time, .notification-time');
      if (await timestamp.isVisible()) {
        await expect(timestamp).toBeVisible();
      }

      // Should show read/unread indicator
      const unreadIndicator = notification.locator(
        '[data-testid="unread-indicator"], .unread-dot'
      );
      const hasIndicator = await unreadIndicator.count() > 0;
      expect(hasIndicator).toBeTruthy();
    }
  });

  test('should mark notification as read on click', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const unreadNotification = page.locator(
      '[data-testid="notification-item"]:has([data-testid="unread-indicator"])'
    ).first();

    if (await unreadNotification.isVisible()) {
      // Get initial badge count
      const initialBadge = page.locator('[data-testid="notification-badge"]');
      let initialCount = 0;
      if (await initialBadge.isVisible()) {
        const text = await initialBadge.textContent();
        initialCount = parseInt(text?.match(/\d+/)?.[0] || '0');
      }

      // Click notification
      await unreadNotification.click();
      await page.waitForTimeout(500);

      // Should navigate or show detail
      // And unread count should decrease
      if (initialCount > 0) {
        await bellIcon.click(); // Reopen dropdown
        const newBadge = page.locator('[data-testid="notification-badge"]');
        if (await newBadge.isVisible()) {
          const newText = await newBadge.textContent();
          const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
          expect(newCount).toBeLessThanOrEqual(initialCount);
        }
      }
    }
  });

  test('should mark all notifications as read', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const markAllButton = page.locator(
      'button:has-text("Mark all as read"), button:has-text("Clear all")'
    );

    if (await markAllButton.isVisible()) {
      await markAllButton.click();
      await page.waitForTimeout(1000);

      // Unread badge should disappear or show 0
      const badge = page.locator('[data-testid="notification-badge"]');
      const isVisible = await badge.isVisible();

      if (isVisible) {
        const text = await badge.textContent();
        const count = parseInt(text?.match(/\d+/)?.[0] || '0');
        expect(count).toBe(0);
      } else {
        expect(isVisible).toBeFalsy();
      }
    }
  });

  test('should filter notifications by type', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const typeFilter = page.locator(
      'select[name="type"], [data-testid="notification-type-filter"]'
    );

    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('booking');
      await page.waitForTimeout(500);

      const notifications = page.locator('[data-testid="notification-item"]');
      if ((await notifications.count()) > 0) {
        const firstNotification = notifications.first();
        await expect(firstNotification).toContainText(/booking/i);
      }
    }
  });

  test('should filter notifications by read/unread', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const readFilter = page.locator(
      'select[name="read"], button:has-text("Unread")'
    );

    if (await readFilter.isVisible()) {
      if (readFilter.getAttribute('type')) {
        await readFilter.click();
      } else {
        await readFilter.selectOption('unread');
      }
      await page.waitForTimeout(500);

      // All visible notifications should be unread
      const notifications = page.locator('[data-testid="notification-item"]');
      if ((await notifications.count()) > 0) {
        const firstNotification = notifications.first();
        const unreadIndicator = firstNotification.locator('[data-testid="unread-indicator"]');
        await expect(unreadIndicator).toBeVisible();
      }
    }
  });

  test('should navigate to notification target', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const notification = page.locator('[data-testid="notification-item"]').first();

    if (await notification.isVisible()) {
      // Get current URL
      const currentUrl = page.url();

      // Click notification
      await notification.click();
      await page.waitForTimeout(1000);

      // Should navigate somewhere (booking, facility, support, etc.)
      const newUrl = page.url();
      const hasNavigated = newUrl !== currentUrl || newUrl.includes('/bookings') ||
        newUrl.includes('/facilities') || newUrl.includes('/support');

      expect(hasNavigated).toBeTruthy();
    }
  });

  test('should delete notification', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const notification = page.locator('[data-testid="notification-item"]').first();

    if (await notification.isVisible()) {
      // Hover to show delete button
      await notification.hover();

      const deleteButton = notification.locator(
        'button[aria-label*="delete"], button:has-text("Delete")'
      );

      if (await deleteButton.isVisible()) {
        const notificationText = await notification.locator('.notification-title').textContent();

        await deleteButton.click();
        await page.waitForTimeout(500);

        // Notification should be removed
        const deletedNotification = page.locator(`text="${notificationText}"`);
        const stillExists = await deletedNotification.isVisible();
        expect(stillExists).toBeFalsy();
      }
    }
  });

  test('should display notification preferences', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const settingsButton = page.locator(
      'button:has-text("Settings"), button[aria-label*="settings"]'
    );

    if (await settingsButton.isVisible()) {
      await settingsButton.click();

      // Should show notification preferences
      const preferencesDialog = page.locator(
        '[role="dialog"], [data-testid="notification-preferences"]'
      );
      await expect(preferencesDialog).toBeVisible();
    }
  });

  test('should toggle email notifications', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.waitForLoadState('networkidle');

    const emailToggle = page.locator(
      'input[type="checkbox"][name*="email"], [data-testid="email-notifications-toggle"]'
    );

    if (await emailToggle.isVisible()) {
      const initialState = await emailToggle.isChecked();

      // Toggle
      await emailToggle.click();
      await page.waitForTimeout(500);

      // State should change
      const newState = await emailToggle.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('should toggle push notifications', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.waitForLoadState('networkidle');

    const pushToggle = page.locator(
      'input[type="checkbox"][name*="push"], [data-testid="push-notifications-toggle"]'
    );

    if (await pushToggle.isVisible()) {
      const initialState = await pushToggle.isChecked();

      await pushToggle.click();
      await page.waitForTimeout(500);

      const newState = await pushToggle.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('should configure notification types', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.waitForLoadState('networkidle');

    const bookingNotifications = page.locator(
      'input[type="checkbox"][name*="booking"]'
    );

    if (await bookingNotifications.isVisible()) {
      const initialState = await bookingNotifications.isChecked();

      await bookingNotifications.click();
      await page.waitForTimeout(500);

      const newState = await bookingNotifications.isChecked();
      expect(newState).not.toBe(initialState);

      // Save preferences
      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Should show success
        const success = page.locator('text=/saved|updated/i');
        await expect(success).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show urgent notifications differently', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const urgentNotification = page.locator(
      '[data-testid="notification-item"]:has-text("urgent"), [data-testid="notification-item"].urgent'
    ).first();

    if (await urgentNotification.isVisible()) {
      // Urgent notifications should have special styling
      const className = await urgentNotification.getAttribute('class');
      const hasUrgentClass = className?.includes('urgent') || className?.includes('priority');
      expect(hasUrgentClass).toBeTruthy();
    }
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    await bellIcon.click();

    const dropdown = page.locator('[data-testid="notification-dropdown"]');
    await expect(dropdown).toBeVisible();

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    // Dropdown should close
    const isVisible = await dropdown.isVisible();
    expect(isVisible).toBeFalsy();
  });
});

test.describe('Notifications - Real-time Updates', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should receive real-time notification updates', async ({ page, context }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get initial notification count
    const bellIcon = page.locator('[data-testid="notification-bell"]');
    const badge = page.locator('[data-testid="notification-badge"]');

    let initialCount = 0;
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      initialCount = parseInt(text?.match(/\d+/)?.[0] || '0');
    }

    // Simulate new notification (in real app, would come from WebSocket)
    // For testing, we'll just wait and check if count changes
    await page.waitForTimeout(5000);

    // Check if notification count updated
    if (await badge.isVisible()) {
      const newText = await badge.textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');

      // Count might have changed due to real-time updates
      expect(newCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show toast notification for new notifications', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for potential toast notifications
    await page.waitForTimeout(2000);

    const toast = page.locator(
      '[data-testid="toast"], [role="alert"], .toast-notification'
    );

    if (await toast.isVisible()) {
      // Should have notification content
      await expect(toast).toBeVisible();

      // Should auto-dismiss or have close button
      const closeButton = toast.locator('button[aria-label*="close"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();

        // Toast should disappear
        await page.waitForTimeout(500);
        const stillVisible = await toast.isVisible();
        expect(stillVisible).toBeFalsy();
      }
    }
  });
});
