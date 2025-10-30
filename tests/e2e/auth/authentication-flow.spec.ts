/**
 * E2E Test: Authentication Flow
 *
 * Tests user authentication including login, registration, logout,
 * and password reset flows.
 *
 * Test Coverage:
 * - User registration
 * - Email/password login
 * - Session persistence
 * - Logout
 * - Password reset
 * - Protected routes
 * - Authentication state management
 */

import { test, expect, Page } from '@playwright/test';

// Test users
const TEST_USER = {
  email: 'test.user@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

const NEW_USER = {
  email: `new.user.${Date.now()}@example.com`,
  password: 'NewPassword123!',
  name: 'New Test User',
  confirmPassword: 'NewPassword123!',
};

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      await page.goto('/register');

      // Fill registration form
      await page.fill('[name="name"]', NEW_USER.name);
      await page.fill('[name="email"]', NEW_USER.email);
      await page.fill('[name="password"]', NEW_USER.password);
      await page.fill('[name="confirmPassword"]', NEW_USER.confirmPassword);

      // Accept terms
      await page.check('[name="acceptTerms"]');

      // Submit form
      await page.click('button[type="submit"]');

      // Verify redirect to dashboard or email verification
      await page.waitForURL(/\/dashboard|\/verify-email/, { timeout: 10000 });

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should show validation errors for invalid registration', async ({ page }) => {
      await page.goto('/register');

      // Try to submit with empty fields
      await page.click('button[type="submit"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="error-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-password"]')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');

      // Fill form with weak password
      await page.fill('[name="name"]', NEW_USER.name);
      await page.fill('[name="email"]', NEW_USER.email);
      await page.fill('[name="password"]', 'weak');
      await page.fill('[name="confirmPassword"]', 'weak');

      // Submit form
      await page.click('button[type="submit"]');

      // Verify password strength error
      await expect(page.locator('[data-testid="error-password"]')).toContainText(/minst 8 tegn/i);
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.goto('/register');

      // Fill form with mismatched passwords
      await page.fill('[name="name"]', NEW_USER.name);
      await page.fill('[name="email"]', NEW_USER.email);
      await page.fill('[name="password"]', NEW_USER.password);
      await page.fill('[name="confirmPassword"]', 'DifferentPassword123!');

      await page.click('button[type="submit"]');

      // Verify error
      await expect(page.locator('[data-testid="error-confirmPassword"]')).toContainText(/matcher ikke/i);
    });

    test('should show error for already registered email', async ({ page }) => {
      await page.goto('/register');

      // Try to register with existing email
      await page.fill('[name="name"]', TEST_USER.name);
      await page.fill('[name="email"]', TEST_USER.email); // Already exists
      await page.fill('[name="password"]', TEST_USER.password);
      await page.fill('[name="confirmPassword"]', TEST_USER.password);
      await page.check('[name="acceptTerms"]');

      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/allerede registrert/i);
    });
  });

  test.describe('User Login', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill login form
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Verify redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      // Verify user menu is visible
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText(TEST_USER.name);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill with invalid credentials
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/ugyldig/i);
    });

    test('should show error for non-existent user', async ({ page }) => {
      await page.goto('/login');

      // Fill with non-existent email
      await page.fill('[name="email"]', 'nonexistent@example.com');
      await page.fill('[name="password"]', 'Password123!');

      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/ikke funnet/i);
    });

    test('should remember me functionality', async ({ page, context }) => {
      await page.goto('/login');

      // Fill login form
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);

      // Check "Remember me"
      await page.check('[name="rememberMe"]');

      await page.click('button[type="submit"]');

      // Wait for login
      await page.waitForURL(/\/dashboard/);

      // Close page and create new one
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('/');

      // Verify user is still logged in
      await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page reload', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);

      // Reload page
      await page.reload();

      // Verify still logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should redirect to login when accessing protected route while logged out', async ({ page }) => {
      await page.goto('/bookings');

      // Should redirect to login
      await page.waitForURL(/\/login/);

      // Verify login page is shown
      await expect(page.locator('form[data-testid="login-form"]')).toBeVisible();
    });

    test('should redirect back to original URL after login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/bookings/create');

      // Should redirect to login
      await page.waitForURL(/\/login/);

      // Login
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Should redirect back to original URL
      await page.waitForURL(/\/bookings\/create/);
      await expect(page).toHaveURL(/\/bookings\/create/);
    });
  });

  test.describe('User Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);

      // Open user menu
      await page.click('[data-testid="user-menu"]');

      // Click logout
      await page.click('[data-testid="logout-button"]');

      // Verify redirect to home or login
      await page.waitForURL(/\/|\/login/);

      // Verify user menu is not visible
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });

    test('should clear session data on logout', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      await page.waitForURL(/\/|\/login/);

      // Try to access protected route
      await page.goto('/bookings');

      // Should redirect to login (session cleared)
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Password Reset', () => {
    test('should request password reset successfully', async ({ page }) => {
      await page.goto('/forgot-password');

      // Enter email
      await page.fill('[name="email"]', TEST_USER.email);

      // Submit form
      await page.click('button[type="submit"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText(/e-post sendt/i);
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/forgot-password');

      // Enter invalid email
      await page.fill('[name="email"]', 'invalid-email');

      await page.click('button[type="submit"]');

      // Verify validation error
      await expect(page.locator('[data-testid="error-email"]')).toContainText(/ugyldig e-postadresse/i);
    });

    test('should handle password reset with token', async ({ page }) => {
      // Simulate clicking reset link from email
      const resetToken = 'test-reset-token-123';
      await page.goto(`/reset-password?token=${resetToken}`);

      // Enter new password
      await page.fill('[name="password"]', 'NewPassword123!');
      await page.fill('[name="confirmPassword"]', 'NewPassword123!');

      await page.click('button[type="submit"]');

      // Verify success and redirect to login
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await page.waitForURL(/\/login/);
    });

    test('should validate password reset token expiration', async ({ page }) => {
      // Use expired token
      const expiredToken = 'expired-token-456';
      await page.goto(`/reset-password?token=${expiredToken}`);

      // Try to reset password
      await page.fill('[name="password"]', 'NewPassword123!');
      await page.fill('[name="confirmPassword"]', 'NewPassword123!');

      await page.click('button[type="submit"]');

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/utløpt|ugyldig/i);
    });
  });

  test.describe('Authentication UI', () => {
    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login');

      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);

      // Click submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Verify loading state
      await expect(submitButton).toBeDisabled();
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('[name="password"]');
      const toggleButton = page.locator('[data-testid="toggle-password"]');

      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle
      await toggleButton.click();

      // Password should be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click toggle again
      await toggleButton.click();

      // Password should be hidden again
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should have link to register page from login', async ({ page }) => {
      await page.goto('/login');

      // Click register link
      await page.click('a:has-text("Registrer deg")');

      // Verify navigation to register page
      await expect(page).toHaveURL(/\/register/);
    });

    test('should have link to login page from register', async ({ page }) => {
      await page.goto('/register');

      // Click login link
      await page.click('a:has-text("Logg inn")');

      // Verify navigation to login page
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Accessibility', () => {
    test('login form should be keyboard navigable', async ({ page }) => {
      await page.goto('/login');

      // Tab through form
      await page.keyboard.press('Tab'); // Email field
      await page.keyboard.type(TEST_USER.email);

      await page.keyboard.press('Tab'); // Password field
      await page.keyboard.type(TEST_USER.password);

      await page.keyboard.press('Tab'); // Remember me
      await page.keyboard.press('Tab'); // Submit button
      await page.keyboard.press('Enter');

      // Should submit form
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should have proper ARIA labels on auth forms', async ({ page }) => {
      await page.goto('/login');

      // Verify form has accessible name
      await expect(page.locator('form')).toHaveAttribute('aria-label');

      // Verify inputs have labels
      const emailInput = page.locator('[name="email"]');
      const emailInputId = await emailInput.getAttribute('id');
      await expect(page.locator(`label[for="${emailInputId}"]`)).toBeVisible();
    });

    test('should announce errors to screen readers', async ({ page }) => {
      await page.goto('/login');

      // Submit with invalid credentials
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', 'WrongPassword');
      await page.click('button[type="submit"]');

      // Verify error has role="alert"
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});

test.describe('Authentication - Social Login', () => {
  test('should initiate Google OAuth flow', async ({ page }) => {
    await page.goto('/login');

    // Click Google login button
    await page.click('[data-testid="google-login-button"]');

    // Verify redirect to Google OAuth
    await page.waitForURL(/accounts\.google\.com/, { timeout: 10000 });
  });

  test('should initiate Facebook OAuth flow', async ({ page }) => {
    await page.goto('/login');

    // Click Facebook login button
    await page.click('[data-testid="facebook-login-button"]');

    // Verify redirect to Facebook OAuth
    await page.waitForURL(/facebook\.com/, { timeout: 10000 });
  });
});
