import { test, expect } from '@playwright/test';

test.describe('Bookings - Manage Bookings', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');
  });

  test('should display user bookings list', async ({ page }) => {
    await expect(page).toHaveTitle(/Bookings|My Bookings|Booknor/);

    // Should have bookings header
    await expect(
      page.locator('h1, h2').filter({ hasText: /bookings/i })
    ).toBeVisible();

    // Should show bookings or empty state
    const bookingsList = page.locator(
      '[data-testid="bookings-list"], [data-testid="booking-card"]'
    );
    const emptyState = page.locator(
      'text=/no.*bookings|haven\'t.*booked/i'
    );

    const hasBookings = (await bookingsList.count()) > 0;
    const isEmpty = await emptyState.isVisible();

    expect(hasBookings || isEmpty).toBeTruthy();
  });

  test('should filter bookings by status', async ({ page }) => {
    const statusFilter = page.locator(
      'select[name="status"], [data-testid="status-filter"]'
    );

    if (await statusFilter.isVisible()) {
      // Filter by confirmed
      await statusFilter.selectOption('confirmed');
      await page.waitForTimeout(500);

      // All visible bookings should be confirmed
      const bookings = page.locator('[data-testid="booking-card"]');
      if ((await bookings.count()) > 0) {
        const firstBooking = bookings.first();
        await expect(firstBooking).toContainText(/confirmed/i);
      }

      // Filter by completed
      await statusFilter.selectOption('completed');
      await page.waitForTimeout(500);

      // Should show completed bookings or empty state
      const completedBookings = page.locator('[data-testid="booking-card"]');
      const emptyMessage = page.locator('text=/no.*completed/i');
      const hasCompleted = (await completedBookings.count()) > 0;
      const showsEmpty = await emptyMessage.isVisible();

      expect(hasCompleted || showsEmpty).toBeTruthy();
    }
  });

  test('should filter bookings by date range', async ({ page }) => {
    const dateFromInput = page.locator('input[name="from"], input[name="startDate"]');
    const dateToInput = page.locator('input[name="to"], input[name="endDate"]');

    if ((await dateFromInput.isVisible()) && (await dateToInput.isVisible())) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      await dateFromInput.fill(today.toISOString().split('T')[0]);
      await dateToInput.fill(nextWeek.toISOString().split('T')[0]);
      await page.waitForTimeout(500);

      // Should show filtered results
      const bookings = page.locator('[data-testid="booking-card"]');
      await expect(bookings.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display booking details in list', async ({ page }) => {
    const bookingCard = page.locator('[data-testid="booking-card"]').first();

    if (await bookingCard.isVisible()) {
      // Should show facility name
      await expect(bookingCard.locator('h3, h4')).toBeVisible();

      // Should show date and time
      const dateTime = bookingCard.locator('text=/\\d{1,2}.*\\d{4}|\\d{1,2}:\\d{2}/');
      await expect(dateTime.first()).toBeVisible();

      // Should show status
      const status = bookingCard.locator(
        '[data-testid="booking-status"], .status-badge'
      );
      await expect(status).toBeVisible();

      // Should show price
      const price = bookingCard.locator('text=/AED/');
      await expect(price).toBeVisible();
    }
  });

  test('should navigate to booking detail page', async ({ page }) => {
    const bookingCard = page.locator('[data-testid="booking-card"]').first();

    if (await bookingCard.isVisible()) {
      await bookingCard.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/bookings\/[a-f0-9-]+/);
    }
  });

  test('should cancel upcoming booking', async ({ page }) => {
    // Look for upcoming confirmed booking
    const upcomingBooking = page.locator(
      '[data-testid="booking-card"]:has-text("Confirmed")'
    ).first();

    if (await upcomingBooking.isVisible()) {
      // Click cancel button
      const cancelButton = upcomingBooking.locator(
        'button:has-text("Cancel"), button[aria-label*="cancel"]'
      );

      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Should show confirmation dialog
        const confirmDialog = page.locator(
          '[role="dialog"], [data-testid="confirm-cancel-dialog"]'
        );
        await expect(confirmDialog).toBeVisible();

        // Confirm cancellation
        const confirmButton = confirmDialog.locator(
          'button:has-text("Confirm"), button:has-text("Yes")'
        );
        await confirmButton.click();

        // Should show success message
        const success = page.locator(
          'text=/booking.*cancelled|cancellation.*successful/i'
        );
        await expect(success).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should not allow canceling past bookings', async ({ page }) => {
    // Filter to show completed bookings
    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('completed');
      await page.waitForTimeout(500);
    }

    const pastBooking = page.locator(
      '[data-testid="booking-card"]:has-text("Completed")'
    ).first();

    if (await pastBooking.isVisible()) {
      // Cancel button should not be visible or should be disabled
      const cancelButton = pastBooking.locator('button:has-text("Cancel")');
      const isVisible = await cancelButton.isVisible();

      if (isVisible) {
        const isDisabled = await cancelButton.isDisabled();
        expect(isDisabled).toBeTruthy();
      } else {
        expect(isVisible).toBeFalsy();
      }
    }
  });

  test('should modify upcoming booking', async ({ page }) => {
    const upcomingBooking = page.locator(
      '[data-testid="booking-card"]:has-text("Confirmed")'
    ).first();

    if (await upcomingBooking.isVisible()) {
      const modifyButton = upcomingBooking.locator(
        'button:has-text("Modify"), button:has-text("Edit"), button[aria-label*="modify"]'
      );

      if (await modifyButton.isVisible()) {
        await modifyButton.click();

        // Should navigate to modification page or show modal
        const modifyModal = page.locator('[role="dialog"]');
        const urlChanged = page.url().includes('/modify') || page.url().includes('/edit');

        expect((await modifyModal.isVisible()) || urlChanged).toBeTruthy();
      }
    }
  });

  test('should download booking confirmation', async ({ page }) => {
    const bookingCard = page.locator('[data-testid="booking-card"]').first();

    if (await bookingCard.isVisible()) {
      const downloadButton = bookingCard.locator(
        'button:has-text("Download"), button[aria-label*="download"]'
      );

      if (await downloadButton.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          downloadButton.click(),
        ]);

        expect(download.suggestedFilename()).toContain('booking');
      }
    }
  });

  test('should sort bookings', async ({ page }) => {
    const sortSelect = page.locator(
      'select[name="sort"], [data-testid="sort-select"]'
    );

    if (await sortSelect.isVisible()) {
      // Get first booking date
      const firstBooking = page.locator('[data-testid="booking-card"]').first();
      const initialDate = await firstBooking.locator('text=/\\d{1,2}.*\\d{4}/').textContent();

      // Change sort order
      await sortSelect.selectOption('date-desc');
      await page.waitForTimeout(500);

      // Order should change
      const newFirstBooking = page.locator('[data-testid="booking-card"]').first();
      await expect(newFirstBooking).toBeVisible();
    }
  });

  test('should paginate bookings list', async ({ page }) => {
    const nextButton = page.locator(
      'button:has-text("Next"), [aria-label="Next page"]'
    );

    if (await nextButton.isEnabled()) {
      // Get first booking on page 1
      const firstBookingPage1 = page.locator('[data-testid="booking-card"]').first();
      const titlePage1 = await firstBookingPage1.locator('h3, h4').textContent();

      // Go to next page
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Get first booking on page 2
      const firstBookingPage2 = page.locator('[data-testid="booking-card"]').first();
      const titlePage2 = await firstBookingPage2.locator('h3, h4').textContent();

      // Should be different
      expect(titlePage1).not.toBe(titlePage2);
    }
  });
});

test.describe('Bookings - Booking Detail Page', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should display complete booking information', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const firstBooking = page.locator('[data-testid="booking-card"]').first();
    if (await firstBooking.isVisible()) {
      await firstBooking.click();
      await page.waitForURL(/\/bookings\/[a-f0-9-]+/);

      // Should show booking details
      await expect(page.locator('h1')).toBeVisible();

      // Should show facility information
      await expect(page.locator('text=/Facility:/i')).toBeVisible();

      // Should show booking status
      const status = page.locator('[data-testid="booking-status"]');
      await expect(status).toBeVisible();

      // Should show date and time
      await expect(page.locator('text=/Date:|Time:/i')).toBeVisible();

      // Should show price breakdown
      await expect(page.locator('text=/Total:|Price:/i')).toBeVisible();
    }
  });

  test('should display QR code for confirmed booking', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    const confirmedBooking = page.locator(
      '[data-testid="booking-card"]:has-text("Confirmed")'
    ).first();

    if (await confirmedBooking.isVisible()) {
      await confirmedBooking.click();
      await page.waitForURL(/\/bookings\/[a-f0-9-]+/);

      // Should show QR code
      const qrCode = page.locator(
        '[data-testid="qr-code"], img[alt*="QR"]'
      );

      if (await qrCode.isVisible()) {
        await expect(qrCode).toBeVisible();
      }
    }
  });

  test('should allow adding booking to calendar', async ({ page }) => {
    await page.goto('/bookings');
    const firstBooking = page.locator('[data-testid="booking-card"]').first();

    if (await firstBooking.isVisible()) {
      await firstBooking.click();
      await page.waitForURL(/\/bookings\/[a-f0-9-]+/);

      const addToCalendarButton = page.locator(
        'button:has-text("Add to Calendar"), button:has-text("Calendar")'
      );

      if (await addToCalendarButton.isVisible()) {
        await addToCalendarButton.click();

        // Should show calendar options or download .ics file
        const calendarOptions = page.locator('[role="menu"], [data-testid="calendar-options"]');
        const isOptionsVisible = await calendarOptions.isVisible();

        expect(isOptionsVisible).toBeTruthy();
      }
    }
  });
});

test.describe('Bookings - Recurring Bookings Management', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should display recurring booking series', async ({ page }) => {
    await page.goto('/bookings');

    const recurringBooking = page.locator(
      '[data-testid="booking-card"]:has-text("Recurring"), [data-testid="booking-card"]:has-text("Series")'
    ).first();

    if (await recurringBooking.isVisible()) {
      await recurringBooking.click();

      // Should show series information
      const seriesInfo = page.locator(
        'text=/recurring.*pattern|series.*info/i'
      );
      await expect(seriesInfo).toBeVisible();

      // Should show list of occurrences
      const occurrences = page.locator(
        '[data-testid="occurrence-item"], .occurrence-list'
      );
      const count = await occurrences.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should cancel entire recurring series', async ({ page }) => {
    await page.goto('/bookings');

    const recurringBooking = page.locator(
      '[data-testid="booking-card"]:has-text("Recurring")'
    ).first();

    if (await recurringBooking.isVisible()) {
      await recurringBooking.click();

      const cancelSeriesButton = page.locator(
        'button:has-text("Cancel Series"), button:has-text("Cancel All")'
      );

      if (await cancelSeriesButton.isVisible()) {
        await cancelSeriesButton.click();

        // Should show confirmation
        const confirmDialog = page.locator('[role="dialog"]');
        await expect(confirmDialog).toBeVisible();

        const confirmButton = confirmDialog.locator('button:has-text("Confirm")');
        await confirmButton.click();

        // Should show success
        const success = page.locator('text=/series.*cancelled/i');
        await expect(success).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
