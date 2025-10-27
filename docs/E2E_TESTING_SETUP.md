# E2E Testing Setup Guide - Playwright + Supabase

## Overview

This guide provides **complete end-to-end testing setup** using Playwright for the BookMe application with Supabase backend.

**Technology Stack:**
- **Playwright** - E2E testing framework
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Supabase Test Helpers** - Database seeding and cleanup

---

## Installation

### Step 1: Install Playwright

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Install Playwright browser dependencies
npx playwright install-deps
```

### Step 2: Install Testing Dependencies

```bash
# Install Vitest and testing utilities
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @testing-library/react-hooks
npm install -D jsdom happy-dom

# Install MSW for API mocking (optional)
npm install -D msw

# Install Faker for test data generation
npm install -D @faker-js/faker
```

---

## Project Structure

```
bookme/
├── tests/
│   ├── e2e/                          # Playwright E2E tests
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   └── signup.spec.ts
│   │   ├── facilities/
│   │   │   ├── list.spec.ts
│   │   │   ├── detail.spec.ts
│   │   │   ├── create.spec.ts
│   │   │   └── search.spec.ts
│   │   ├── bookings/
│   │   │   ├── create.spec.ts
│   │   │   ├── availability.spec.ts
│   │   │   ├── cancel.spec.ts
│   │   │   └── recurring.spec.ts
│   │   ├── favorites/
│   │   │   └── toggle.spec.ts
│   │   ├── messages/
│   │   │   ├── chat.spec.ts
│   │   │   └── threads.spec.ts
│   │   ├── support/
│   │   │   └── tickets.spec.ts
│   │   ├── notifications/
│   │   │   └── bell.spec.ts
│   │   └── fixtures/
│   │       ├── auth.ts
│   │       ├── facilities.ts
│   │       └── bookings.ts
│   ├── integration/                  # Integration tests
│   │   ├── services/
│   │   │   ├── facilities.test.ts
│   │   │   ├── bookings.test.ts
│   │   │   └── ...
│   │   └── hooks/
│   │       ├── useRealtimeBookings.test.ts
│   │       └── ...
│   ├── unit/                         # Unit tests
│   │   ├── components/
│   │   │   ├── FacilityCard.test.tsx
│   │   │   └── ...
│   │   └── utils/
│   │       ├── dataMigration.test.ts
│   │       └── ...
│   └── setup/
│       ├── playwright-setup.ts       # Global Playwright setup
│       ├── supabase-helpers.ts       # Database helpers
│       └── test-data.ts              # Test data generators
├── playwright.config.ts              # Playwright configuration
├── vitest.config.ts                  # Vitest configuration
└── .env.test                         # Test environment variables
```

---

## Configuration Files

### 1. Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Run tests in files in parallel
  fullyParallel: false, // Set to false for Supabase tests to avoid conflicts

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Maximum time each action can take
    actionTimeout: 10 * 1000,

    // Custom viewport
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - runs before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/setup/.auth/user.json', // Reuse auth state
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/setup/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'tests/setup/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'tests/setup/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'tests/setup/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
});
```

### 2. Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./tests/setup/vitest-setup.ts'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // Test patterns
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],

    // Mock config
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Test Environment Variables

Create `.env.test`:

```bash
# Test Supabase instance
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-test-anon-key

# Test feature flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_STORAGE=true

# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123

# Test organization
TEST_ORG_ID=test-org-123
TEST_ORG_NAME=Test Organization

# Playwright
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

---

## Setup Files

### 1. Global Playwright Setup

Create `tests/setup/playwright-setup.ts`:

```typescript
import { test as setup, expect } from '@playwright/test';
import { supabase } from '@/lib/supabase';
import { seedTestData } from './test-data';

const authFile = 'tests/setup/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Seed test data before authentication
  await seedTestData();

  // Navigate to login page
  await page.goto('/login');

  // Fill in email
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);

  // Click send magic link
  await page.click('button:has-text("Send magic link")');

  // Wait for success message
  await expect(page.locator('text=Check your email')).toBeVisible();

  // In test environment, we can directly set the session
  // In production, user would click link in email
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  });

  if (error) throw error;

  // Set auth state in browser
  await page.evaluate((session) => {
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  }, data.session);

  // Verify we're logged in
  await page.goto('/');
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});

setup('cleanup after tests', async () => {
  // This runs after all tests
  await cleanupTestData();
});
```

### 2. Supabase Test Helpers

Create `tests/setup/supabase-helpers.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

/**
 * Clean all test data from database
 */
export const cleanupTestData = async () => {
  const testOrgId = process.env.TEST_ORG_ID!;

  // Delete in reverse dependency order
  await supabase.from('notifications').delete().eq('org_id', testOrgId);
  await supabase.from('support_ticket_messages').delete().eq('org_id', testOrgId);
  await supabase.from('support_tickets').delete().eq('org_id', testOrgId);
  await supabase.from('message_attachments').delete().eq('org_id', testOrgId);
  await supabase.from('messages').delete().eq('org_id', testOrgId);
  await supabase.from('message_threads').delete().eq('org_id', testOrgId);
  await supabase.from('recurring_booking_occurrences').delete();
  await supabase.from('recurring_bookings').delete().eq('org_id', testOrgId);
  await supabase.from('group_booking_members').delete();
  await supabase.from('group_bookings').delete().eq('org_id', testOrgId);
  await supabase.from('additional_services').delete();
  await supabase.from('bookings').delete();
  await supabase.from('favorites').delete();
  await supabase.from('zones').delete();
  await supabase.from('facilities').delete().eq('org_id', testOrgId);

  console.log('✅ Test data cleaned up');
};

/**
 * Create test facility
 */
export const createTestFacility = async (overrides = {}) => {
  const facility = {
    org_id: process.env.TEST_ORG_ID!,
    name: 'Test Facility',
    description: 'A test facility for E2E testing',
    address: '123 Test Street, Test City',
    type: 'sports',
    status: 'published',
    capacity: 50,
    price_per_hour: 500,
    amenities: ['WiFi', 'Parking', 'AC'],
    images: ['https://via.placeholder.com/800x600'],
    ...overrides,
  };

  const { data, error } = await supabase
    .from('facilities')
    .insert(facility)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create test booking
 */
export const createTestBooking = async (facilityId: string, userId: string, overrides = {}) => {
  const booking = {
    facility_id: facilityId,
    user_id: userId,
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // 2 hours
    status: 'confirmed',
    total_price: 1000,
    ...overrides,
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create test user
 */
export const createTestUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        org_id: process.env.TEST_ORG_ID!,
      },
    },
  });

  if (error) throw error;
  return data.user;
};

/**
 * Wait for real-time update
 */
export const waitForRealtimeUpdate = (ms = 2000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
```

### 3. Test Data Generators

Create `tests/setup/test-data.ts`:

```typescript
import { faker } from '@faker-js/faker';
import { createTestFacility, createTestUser } from './supabase-helpers';

/**
 * Seed complete test dataset
 */
export const seedTestData = async () => {
  console.log('🌱 Seeding test data...');

  // Create test user
  const user = await createTestUser(
    process.env.TEST_USER_EMAIL!,
    process.env.TEST_USER_PASSWORD!
  );

  // Create test facilities
  const facilities = await Promise.all([
    createTestFacility({
      name: 'Sports Center',
      type: 'sports',
      capacity: 100,
    }),
    createTestFacility({
      name: 'Conference Hall',
      type: 'conference',
      capacity: 50,
    }),
    createTestFacility({
      name: 'Music Studio',
      type: 'studio',
      capacity: 20,
    }),
  ]);

  console.log('✅ Test data seeded:', {
    user: user?.email,
    facilities: facilities.length,
  });

  return { user, facilities };
};

/**
 * Generate random facility data
 */
export const generateFacilityData = () => ({
  name: faker.company.name() + ' ' + faker.word.noun(),
  description: faker.lorem.paragraph(),
  address: faker.location.streetAddress(true),
  type: faker.helpers.arrayElement(['sports', 'conference', 'studio', 'other']),
  capacity: faker.number.int({ min: 10, max: 200 }),
  price_per_hour: faker.number.int({ min: 100, max: 2000 }),
  amenities: faker.helpers.arrayElements(
    ['WiFi', 'Parking', 'AC', 'Projector', 'Kitchen', 'Restrooms'],
    3
  ),
});

/**
 * Generate random booking data
 */
export const generateBookingData = (facilityId: string, userId: string) => ({
  facility_id: facilityId,
  user_id: userId,
  start_time: faker.date.future().toISOString(),
  end_time: faker.date.future().toISOString(),
  status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled']),
  total_price: faker.number.int({ min: 500, max: 5000 }),
  notes: faker.lorem.sentence(),
});
```

### 4. Vitest Setup

Create `tests/setup/vitest-setup.ts`:

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Extend expect with custom matchers
expect.extend({
  toBeInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const isInViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth;

    return {
      pass: isInViewport,
      message: () =>
        isInViewport
          ? `Expected element not to be in viewport`
          : `Expected element to be in viewport`,
    };
  },
});
```

---

## Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:report": "playwright show-report",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

---

## Next Steps

1. **Create E2E test suites** - Follow next document
2. **Create unit tests** - Test individual components
3. **Create integration tests** - Test services with Supabase
4. **Set up CI/CD** - Run tests automatically

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Status:** Ready to Implement
