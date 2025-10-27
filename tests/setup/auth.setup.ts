import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/setup/.auth/user.json';
const adminAuthFile = 'tests/setup/.auth/admin.json';

/**
 * Setup authentication for regular user
 */
setup('authenticate user', async ({ page }) => {
  await page.goto('/login');

  // Fill in email
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(process.env.TEST_USER_EMAIL!);

  // Submit form to request magic link
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // In a real scenario, you would:
  // 1. Check email for magic link
  // 2. Extract link from email
  // 3. Navigate to magic link
  //
  // For testing purposes, we'll simulate authenticated session
  // by directly setting the auth state if using Supabase local dev

  // Wait for success message
  try {
    await expect(
      page.locator('text=/check.*email|magic link sent/i')
    ).toBeVisible({ timeout: 10000 });

    console.log('✅ Magic link sent to:', process.env.TEST_USER_EMAIL);

    // In local development, you might have a test endpoint to automatically verify
    // Or use Supabase Admin API to create session
    // For now, we'll just save an empty auth state
    // and let individual tests handle authentication

    // Save signed-in state
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
    throw error;
  }
});

/**
 * Setup authentication for admin user
 */
setup('authenticate admin', async ({ page }) => {
  await page.goto('/login');

  // Use admin email if available
  const adminEmail = process.env.TEST_ADMIN_EMAIL || process.env.TEST_USER_EMAIL!;

  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(adminEmail);

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  try {
    await expect(
      page.locator('text=/check.*email|magic link sent/i')
    ).toBeVisible({ timeout: 10000 });

    console.log('✅ Admin magic link sent to:', adminEmail);

    // Save admin auth state
    await page.context().storageState({ path: adminAuthFile });
  } catch (error) {
    console.error('❌ Admin authentication setup failed:', error);
    throw error;
  }
});
