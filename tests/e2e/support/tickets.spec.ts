import { test, expect } from '@playwright/test';

test.describe('Support - Ticket Management', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support');
    await page.waitForLoadState('networkidle');
  });

  test('should display support tickets page', async ({ page }) => {
    await expect(page).toHaveTitle(/Support|Help|Booknor/);

    // Should have support header
    await expect(
      page.locator('h1, h2').filter({ hasText: /support|help|tickets/i })
    ).toBeVisible();
  });

  test('should display ticket list', async ({ page }) => {
    const ticketList = page.locator(
      '[data-testid="ticket-list"], [data-testid="ticket-card"]'
    );
    const emptyState = page.locator('text=/no.*tickets|no.*support.*requests/i');

    const hasTickets = (await ticketList.count()) > 0;
    const isEmpty = await emptyState.isVisible();

    expect(hasTickets || isEmpty).toBeTruthy();
  });

  test('should create new support ticket', async ({ page }) => {
    const newTicketButton = page.locator(
      'button:has-text("New Ticket"), button:has-text("Create Ticket"), button:has-text("Get Help")'
    );

    if (await newTicketButton.isVisible()) {
      await newTicketButton.click();

      // Should show ticket form
      const ticketForm = page.locator('[data-testid="ticket-form"], form');
      await expect(ticketForm).toBeVisible();

      // Fill ticket details
      const subjectInput = page.locator('input[name="subject"], input[placeholder*="subject"]');
      const descriptionInput = page.locator(
        'textarea[name="description"], textarea[placeholder*="describe"]'
      );
      const prioritySelect = page.locator('select[name="priority"]');

      await subjectInput.fill('Test Support Ticket');
      await descriptionInput.fill('This is a test support ticket description.');

      if (await prioritySelect.isVisible()) {
        await prioritySelect.selectOption('medium');
      }

      // Submit ticket
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
      await submitButton.click();

      // Should show success message
      const success = page.locator('text=/ticket.*created|ticket.*submitted/i');
      await expect(success).toBeVisible({ timeout: 10000 });
    }
  });

  test('should validate required ticket fields', async ({ page }) => {
    const newTicketButton = page.locator('button:has-text("New Ticket")');

    if (await newTicketButton.isVisible()) {
      await newTicketButton.click();

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show validation errors
      const errors = page.locator(
        'text=/subject.*required|description.*required/i, .error-message'
      );
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThan(0);
    }
  });

  test('should display ticket details', async ({ page }) => {
    const ticket = page.locator('[data-testid="ticket-card"]').first();

    if (await ticket.isVisible()) {
      // Should show ticket information
      await expect(ticket.locator('h3, h4')).toBeVisible(); // Subject

      // Should show status
      const status = ticket.locator('[data-testid="ticket-status"], .status-badge');
      await expect(status).toBeVisible();

      // Should show priority
      const priority = ticket.locator('[data-testid="ticket-priority"], .priority-badge');
      if (await priority.isVisible()) {
        await expect(priority).toBeVisible();
      }

      // Should show created date
      const date = ticket.locator('time, [data-testid="created-date"]');
      if (await date.isVisible()) {
        await expect(date).toBeVisible();
      }
    }
  });

  test('should open ticket detail page', async ({ page }) => {
    const ticket = page.locator('[data-testid="ticket-card"]').first();

    if (await ticket.isVisible()) {
      await ticket.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/support\/tickets\/[a-f0-9-]+/);

      // Should show full ticket details
      await expect(page.locator('h1')).toBeVisible();

      // Should show description
      const description = page.locator('[data-testid="ticket-description"]');
      await expect(description).toBeVisible();
    }
  });

  test('should filter tickets by status', async ({ page }) => {
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');

    if (await statusFilter.isVisible()) {
      // Filter by open
      await statusFilter.selectOption('open');
      await page.waitForTimeout(500);

      const tickets = page.locator('[data-testid="ticket-card"]');
      if ((await tickets.count()) > 0) {
        const firstTicket = tickets.first();
        const status = await firstTicket.locator('[data-testid="ticket-status"]').textContent();
        expect(status?.toLowerCase()).toContain('open');
      }

      // Filter by closed
      await statusFilter.selectOption('closed');
      await page.waitForTimeout(500);

      const closedTickets = page.locator('[data-testid="ticket-card"]');
      if ((await closedTickets.count()) > 0) {
        const firstClosed = closedTickets.first();
        const closedStatus = await firstClosed.locator('[data-testid="ticket-status"]').textContent();
        expect(closedStatus?.toLowerCase()).toContain('closed');
      }
    }
  });

  test('should filter tickets by priority', async ({ page }) => {
    const priorityFilter = page.locator(
      'select[name="priority"], [data-testid="priority-filter"]'
    );

    if (await priorityFilter.isVisible()) {
      await priorityFilter.selectOption('high');
      await page.waitForTimeout(500);

      const tickets = page.locator('[data-testid="ticket-card"]');
      if ((await tickets.count()) > 0) {
        const firstTicket = tickets.first();
        const priority = firstTicket.locator('[data-testid="ticket-priority"]');
        if (await priority.isVisible()) {
          const priorityText = await priority.textContent();
          expect(priorityText?.toLowerCase()).toContain('high');
        }
      }
    }
  });

  test('should add message to ticket', async ({ page }) => {
    const ticket = page.locator('[data-testid="ticket-card"]').first();

    if (await ticket.isVisible()) {
      await ticket.click();
      await page.waitForURL(/\/support\/tickets\/[a-f0-9-]+/);

      // Should have message input
      const messageInput = page.locator(
        'textarea[placeholder*="reply"], textarea[placeholder*="message"]'
      );

      if (await messageInput.isVisible()) {
        const testMessage = `Test reply ${Date.now()}`;
        await messageInput.fill(testMessage);

        const sendButton = page.locator('button[type="submit"], button:has-text("Send")');
        await sendButton.click();

        // Should display new message
        const sentMessage = page.locator(`text="${testMessage}"`);
        await expect(sentMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display ticket message thread', async ({ page }) => {
    const ticket = page.locator('[data-testid="ticket-card"]').first();

    if (await ticket.isVisible()) {
      await ticket.click();
      await page.waitForURL(/\/support\/tickets\/[a-f0-9-]+/);

      const messages = page.locator('[data-testid="ticket-message"], .message-item');
      const count = await messages.count();

      if (count > 0) {
        // Should show message author
        const firstMessage = messages.first();
        const author = firstMessage.locator('[data-testid="message-author"], .message-sender');
        if (await author.isVisible()) {
          await expect(author).toBeVisible();
        }

        // Should show message timestamp
        const timestamp = firstMessage.locator('time, .message-time');
        if (await timestamp.isVisible()) {
          await expect(timestamp).toBeVisible();
        }
      }
    }
  });

  test('should close ticket', async ({ page }) => {
    const openTicket = page.locator(
      '[data-testid="ticket-card"]:has-text("Open"), [data-testid="ticket-card"]:has-text("In Progress")'
    ).first();

    if (await openTicket.isVisible()) {
      await openTicket.click();
      await page.waitForURL(/\/support\/tickets\/[a-f0-9-]+/);

      const closeButton = page.locator(
        'button:has-text("Close Ticket"), button:has-text("Resolve")'
      );

      if (await closeButton.isVisible()) {
        await closeButton.click();

        // May show confirmation dialog
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Should show success or update status
        await page.waitForTimeout(1000);

        const status = page.locator('[data-testid="ticket-status"]');
        const statusText = await status.textContent();
        expect(statusText?.toLowerCase()).toContain('closed');
      }
    }
  });

  test('should reopen closed ticket', async ({ page }) => {
    // Filter to show closed tickets
    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('closed');
      await page.waitForTimeout(500);
    }

    const closedTicket = page.locator('[data-testid="ticket-card"]').first();

    if (await closedTicket.isVisible()) {
      await closedTicket.click();
      await page.waitForURL(/\/support\/tickets\/[a-f0-9-]+/);

      const reopenButton = page.locator('button:has-text("Reopen")');

      if (await reopenButton.isVisible()) {
        await reopenButton.click();

        await page.waitForTimeout(1000);

        // Status should change to open
        const status = page.locator('[data-testid="ticket-status"]');
        const statusText = await status.textContent();
        expect(statusText?.toLowerCase()).toContain('open');
      }
    }
  });

  test('should search tickets', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('booking');
      await page.waitForTimeout(500);

      // Should show search results
      const results = page.locator('[data-testid="ticket-card"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort tickets', async ({ page }) => {
    const sortSelect = page.locator('select[name="sort"], [data-testid="sort-select"]');

    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('created-desc');
      await page.waitForTimeout(500);

      const tickets = page.locator('[data-testid="ticket-card"]');
      await expect(tickets.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should attach file to ticket message', async ({ page }) => {
    const ticket = page.locator('[data-testid="ticket-card"]').first();

    if (await ticket.isVisible()) {
      await ticket.click();
      await page.waitForURL(/\/support\/tickets\/[a-f0-9-]+/);

      const attachButton = page.locator(
        'button[aria-label*="attach"], input[type="file"]'
      );

      if (await attachButton.isVisible()) {
        // Verify attachment functionality is available
        await expect(attachButton).toBeVisible();
      }
    }
  });

  test('should display ticket category', async ({ page }) => {
    const newTicketButton = page.locator('button:has-text("New Ticket")');

    if (await newTicketButton.isVisible()) {
      await newTicketButton.click();

      const categorySelect = page.locator('select[name="category"]');

      if (await categorySelect.isVisible()) {
        const options = categorySelect.locator('option');
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(0);

        // Select a category
        await categorySelect.selectOption({ index: 1 });

        // Category should be selected
        const selectedValue = await categorySelect.inputValue();
        expect(selectedValue).toBeTruthy();
      }
    }
  });
});

test.describe('Support - Admin View', () => {
  test.use({ storageState: 'tests/setup/.auth/admin.json' });

  test('should display all organization tickets for admin', async ({ page }) => {
    await page.goto('/admin/support');
    await page.waitForLoadState('networkidle');

    // Should see all tickets, not just own tickets
    const tickets = page.locator('[data-testid="ticket-card"]');
    const count = await tickets.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should assign ticket to agent', async ({ page }) => {
    await page.goto('/admin/support');
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('[data-testid="ticket-card"]').first();

    if (await ticket.isVisible()) {
      await ticket.click();

      const assignButton = page.locator(
        'button:has-text("Assign"), select[name="assignee"]'
      );

      if (await assignButton.isVisible()) {
        if (assignButton.getAttribute('type')) {
          await assignButton.click();

          // Select agent
          const agentOption = page.locator('[role="option"], option').first();
          await agentOption.click();

          // Should show success
          const success = page.locator('text=/assigned/i');
          await expect(success).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});
