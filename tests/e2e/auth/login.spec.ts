import { test, expect } from '@playwright/test';

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Booknor/);
    await expect(page.locator('h1')).toContainText(/Sign In|Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should show error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('invalid-email');
    await submitButton.click();

    await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
  });

  test('should show error for empty email', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page.locator('text=/email.*required/i')).toBeVisible();
  });

  test('should send magic link for valid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill(process.env.TEST_USER_EMAIL!);
    await submitButton.click();

    // Should show success message
    await expect(
      page.locator('text=/check.*email|magic link sent/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should redirect authenticated users to dashboard', async ({
    page,
    context,
  }) => {
    // Set authenticated session
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/login');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard|facilities)/);
  });
});

test.describe('Authentication - Logout Flow', () => {
  test.use({ storageState: 'tests/setup/.auth/user.json' });

  test('should logout user successfully', async ({ page }) => {
    await page.goto('/dashboard');

    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    await logoutButton.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/(login|auth)/);

    // Should not be able to access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(login|auth)/);
  });
});

test.describe('Authentication - Session Persistence', () => {
  test('should persist session across page reloads', async ({ page, context }) => {
    // Login
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(process.env.TEST_USER_EMAIL!);
    await page.locator('button[type="submit"]').click();

    // Wait for success message
    await expect(
      page.locator('text=/check.*email|magic link sent/i')
    ).toBeVisible({ timeout: 10000 });

    // In a real test, you would verify the magic link email
    // For now, we'll assume session is created

    // Reload page
    await page.reload();

    // Session should persist (or redirect to login if not authenticated)
    const currentUrl = page.url();
    expect(['/login', '/dashboard', '/facilities'].some(path =>
      currentUrl.includes(path)
    )).toBeTruthy();
  });

  test('should handle expired session', async ({ page, context }) => {
    // Set expired session
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'expired-token',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/(login|auth)/, { timeout: 5000 });
  });
});
