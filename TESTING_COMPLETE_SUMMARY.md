# 🧪 Comprehensive Testing - Complete Guide

## Overview

This document provides a **complete testing strategy** for the BookMe application covering E2E, integration, and unit testing with Playwright, Vitest, and React Testing Library.

---

## Testing Stack

### Testing Framework Summary

| Type | Framework | Purpose | Coverage Goal |
|------|-----------|---------|---------------|
| **E2E** | Playwright | Full user flows in browser | Critical paths |
| **Integration** | Vitest + Supabase | Services with real database | 85%+ |
| **Unit** | Vitest + React Testing Library | Components & utilities | 80%+ |
| **API** | Supabase Studio | Database operations | Manual verification |

---

## Quick Start

### 1. Install Dependencies

```bash
# Install all testing dependencies
npm install -D @playwright/test @vitejs/plugin-react
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @testing-library/react-hooks
npm install -D jsdom @faker-js/faker
```

### 2. Start Supabase

```bash
# Required for integration and E2E tests
supabase start
```

### 3. Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test -- tests/integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

---

## Documentation Structure

### 1. E2E Testing Setup (`E2E_TESTING_SETUP.md`)

**What's Covered:**
- Playwright installation and configuration
- Project structure for E2E tests
- Test environment setup
- Supabase test helpers
- Authentication setup
- Test data generation

**Key Files:**
- `playwright.config.ts` - Playwright configuration
- `tests/setup/playwright-setup.ts` - Global setup
- `tests/setup/supabase-helpers.ts` - Database helpers
- `tests/setup/test-data.ts` - Test data generators

**Configuration:**
```typescript
// playwright.config.ts highlights
{
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  fullyParallel: false, // For Supabase tests
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
}
```

### 2. E2E Test Suites (`E2E_TEST_SUITES.md`)

**What's Covered:**
- 7 complete test suites
- 40+ E2E test scenarios
- Real-world user flows
- Multi-browser testing
- Real-time feature testing

**Test Suites:**

1. **Authentication** (5 tests)
   - Login with magic link
   - Session persistence
   - Logout flow
   - Error handling

2. **Facility Management** (12 tests)
   - List facilities
   - Filter and search
   - View facility details
   - Create/update/delete facilities
   - Image gallery
   - Share functionality

3. **Booking Flow** (8 tests)
   - Create booking
   - Check availability
   - Handle conflicts
   - Price calculation
   - Additional services
   - Cancel booking

4. **Favorites** (4 tests)
   - Toggle favorite
   - Multi-tab sync
   - Favorites list
   - Authentication requirement

5. **Real-time Messaging** (3 tests)
   - Send/receive messages
   - Unread count updates
   - Mark as read

6. **Support Tickets** (3 tests)
   - Create ticket
   - Add messages
   - Close ticket

7. **Notifications** (5 tests)
   - Display notifications
   - Mark as read
   - Real-time updates
   - Mark all as read

**Example Test:**
```typescript
test('should create booking successfully', async ({ page }) => {
  await page.goto(`/facilities/${facilityId}`);
  await page.click('[data-testid="book-now-button"]');

  // Fill form
  await page.click('[data-testid="date-picker"]');
  await page.click('[data-testid="tomorrow"]');
  await page.click('[data-testid="start-time"]');
  await page.click('text=10:00');

  // Submit
  await page.click('[data-testid="submit-booking"]');

  // Verify
  await expect(page.locator('text=Booking confirmed')).toBeVisible();
});
```

### 3. Unit & Integration Testing (`UNIT_INTEGRATION_TESTING.md`)

**What's Covered:**
- Unit testing services
- Component testing
- Utility function testing
- Integration testing with Supabase
- Real-time hook testing

**Test Types:**

**Unit Tests:**
- Services (facilities, bookings, favorites, etc.)
- Components (FacilityCard, BookingForm, etc.)
- Utilities (data migration, helpers, etc.)

**Integration Tests:**
- Services with real Supabase database
- Real-time subscriptions
- Full CRUD operations

**Example Unit Test:**
```typescript
describe('useFacilities', () => {
  it('should fetch facilities successfully', async () => {
    const mockFacilities = [
      { id: '1', name: 'Test Facility 1' },
      { id: '2', name: 'Test Facility 2' },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockFacilities, error: null }),
    } as any);

    const { result } = renderHook(() => useFacilities('org-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockFacilities);
  });
});
```

**Example Integration Test:**
```typescript
describe('Facilities Service Integration', () => {
  it('should create and fetch facilities', async () => {
    // Create facility (real database)
    createResult.current.mutate(newFacility);

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
    });

    // Fetch facilities (real database)
    const { result } = renderHook(() => useFacilities(testOrgId), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toContainEqual(
        expect.objectContaining({ name: newFacility.name })
      );
    });
  });
});
```

---

## Test Coverage Summary

### By Test Type

```
E2E Tests (Playwright):
  - Test suites: 7
  - Total tests: 40+
  - Coverage: Critical user paths
  - Browsers: Chrome, Firefox, Safari, Mobile

Unit Tests (Vitest):
  - Services: 20+ test files
  - Components: 15+ test files
  - Utilities: 5+ test files
  - Coverage goal: 80%+

Integration Tests (Vitest + Supabase):
  - Service integration: 9 services
  - Real-time hooks: 3 hooks
  - Database operations: Full CRUD
  - Coverage goal: 85%+
```

### By Feature

| Feature | E2E | Integration | Unit | Total Tests |
|---------|-----|-------------|------|-------------|
| Auth | ✅ 5 | ✅ 2 | ✅ 3 | 10 |
| Facilities | ✅ 12 | ✅ 5 | ✅ 8 | 25 |
| Bookings | ✅ 8 | ✅ 6 | ✅ 10 | 24 |
| Favorites | ✅ 4 | ✅ 4 | ✅ 5 | 13 |
| Messages | ✅ 3 | ✅ 3 | ✅ 4 | 10 |
| Support | ✅ 3 | ✅ 2 | ✅ 3 | 8 |
| Notifications | ✅ 5 | ✅ 2 | ✅ 4 | 11 |
| Groups | - | ✅ 3 | ✅ 4 | 7 |
| Recurring | - | ✅ 3 | ✅ 4 | 7 |
| **Total** | **40** | **30** | **45** | **115** |

---

## Test Execution Strategy

### Development Workflow

```bash
# 1. Start development
supabase start
npm run dev

# 2. Write feature code
# ... implement feature ...

# 3. Write tests (TDD approach)
# - Write unit tests first
# - Write integration tests
# - Write E2E tests for critical path

# 4. Run tests locally
npm run test                    # Unit tests (fast)
npm run test -- tests/integration  # Integration tests
npm run test:e2e:headed        # E2E tests (see browser)

# 5. Run all before commit
npm run test:all
```

### CI/CD Pipeline

```yaml
# .github/workflows/tests.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:coverage -- tests/integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npx supabase start
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Data Management

### Test Data Strategy

1. **Use Faker for Random Data**
   ```typescript
   import { faker } from '@faker-js/faker';

   const testFacility = {
     name: faker.company.name(),
     address: faker.location.streetAddress(true),
     capacity: faker.number.int({ min: 10, max: 200 }),
   };
   ```

2. **Use Test Helpers**
   ```typescript
   import { createTestFacility, createTestBooking } from '@/tests/setup/supabase-helpers';

   const facility = await createTestFacility();
   const booking = await createTestBooking(facility.id, userId);
   ```

3. **Clean Up After Tests**
   ```typescript
   afterEach(async () => {
     await cleanupTestData();
   });
   ```

4. **Use Test Organization**
   ```typescript
   const TEST_ORG_ID = 'test-org-123';
   // All test data scoped to test organization
   ```

---

## Running Tests

### Quick Reference

```bash
# Unit Tests
npm run test                      # Run unit tests
npm run test:ui                   # UI mode (recommended)
npm run test:coverage             # With coverage report
npx vitest --watch               # Watch mode

# Integration Tests
npm run test -- tests/integration # All integration tests
npx vitest tests/integration/services/facilities.test.ts

# E2E Tests
npm run test:e2e                  # All E2E tests
npm run test:e2e:ui               # UI mode (interactive)
npm run test:e2e:headed           # See browser
npm run test:e2e:debug            # Debug mode
npm run test:e2e:chromium         # Specific browser
npx playwright test tests/e2e/facilities/list.spec.ts

# Reports
npm run test:e2e:report           # Playwright HTML report
open coverage/index.html          # Coverage report

# All Tests
npm run test:all                  # Unit + Integration + E2E
```

### Debugging Tests

**Unit/Integration Tests:**
```typescript
// Add debugger
it('should do something', () => {
  debugger; // Will pause here
  expect(result).toBe(expected);
});

// Run with --inspect
npx vitest --inspect-brk

// Use console.log
console.log('Debug value:', value);
```

**E2E Tests:**
```bash
# Debug mode (opens inspector)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# Slow down execution
npx playwright test --headed --slow-mo=1000
```

---

## Test Environment Variables

### `.env.test`

```bash
# Supabase (local)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-test-anon-key

# Test user
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123

# Test organization
TEST_ORG_ID=test-org-123
TEST_ORG_NAME=Test Organization

# Playwright
PLAYWRIGHT_BASE_URL=http://localhost:5173

# Feature flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_STORAGE=true
```

---

## Best Practices

### 1. Test Pyramid

```
         /\
        /E2E\       <- Few (40 tests) - Critical paths
       /------\
      /  INT   \    <- Some (30 tests) - Service integration
     /----------\
    /    UNIT    \  <- Many (45 tests) - Components & utilities
   /--------------\
```

### 2. Write Testable Code

```typescript
// ✅ Good - Pure function, easy to test
export const calculatePrice = (hours: number, pricePerHour: number) => {
  return hours * pricePerHour;
};

// ❌ Bad - Side effects, hard to test
export const calculateAndSavePrice = (hours, pricePerHour) => {
  const price = hours * pricePerHour;
  localStorage.setItem('price', price.toString());
  return price;
};
```

### 3. Test User Behavior

```typescript
// ✅ Good - Tests what user sees
it('should show error when email is invalid', () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'invalid' },
  });
  fireEvent.click(screen.getByText('Submit'));
  expect(screen.getByText('Invalid email')).toBeVisible();
});

// ❌ Bad - Tests implementation
it('should set error state', () => {
  const { result } = renderHook(() => useLoginForm());
  result.current.setEmail('invalid');
  expect(result.current.error).toBe('Invalid email');
});
```

### 4. Use Data Test IDs

```tsx
// In component
<button data-testid="submit-button">Submit</button>

// In test
screen.getByTestId('submit-button')
```

### 5. Mock External Dependencies

```typescript
// Mock Supabase
vi.mock('@/lib/supabase');

// Mock Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock Auth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, currentOrgId: 'org-123' }),
}));
```

---

## Coverage Goals

### Minimum Coverage Requirements

```
Overall:        80%+
Services:       90%+
Components:     80%+
Utilities:      90%+
Hooks:          85%+
```

### View Coverage Report

```bash
# Generate coverage
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Configuration

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  exclude: [
    'node_modules/',
    'tests/',
    '**/*.d.ts',
    '**/*.config.*',
  ],
  all: true,
  lines: 80,
  functions: 80,
  branches: 80,
  statements: 80,
}
```

---

## Troubleshooting

### Common Issues

**Issue: Tests timeout**
```typescript
// Solution: Increase timeout
test('slow test', async () => {
  // ...
}, { timeout: 10000 });
```

**Issue: Supabase connection fails**
```bash
# Solution: Ensure Supabase is running
supabase status
supabase start
```

**Issue: Flaky tests**
```typescript
// Solution: Add proper waits
await waitFor(() => {
  expect(element).toBeVisible();
});

// Or use Playwright's auto-waiting
await page.waitForSelector('[data-testid="element"]');
```

**Issue: Browser not found (Playwright)**
```bash
# Solution: Install browsers
npx playwright install
npx playwright install-deps
```

---

## Performance Optimization

### Fast Test Execution

```typescript
// 1. Run tests in parallel
// vitest.config.ts
export default {
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
};

// 2. Use test.concurrent for independent tests
test.concurrent('test 1', async () => { /* ... */ });
test.concurrent('test 2', async () => { /* ... */ });

// 3. Mock external APIs
vi.mock('@/lib/supabase');

// 4. Use shallow rendering when possible
import { shallow } from '@testing-library/react';
```

---

## Documentation Files

### Complete Testing Documentation

1. **E2E_TESTING_SETUP.md**
   - Playwright installation
   - Configuration
   - Test helpers
   - Data generators

2. **E2E_TEST_SUITES.md**
   - 7 test suites
   - 40+ scenarios
   - Complete implementations
   - Best practices

3. **UNIT_INTEGRATION_TESTING.md**
   - Unit testing guide
   - Component testing
   - Integration testing
   - Real-time testing

4. **TESTING_COMPLETE_SUMMARY.md** (This document)
   - Complete overview
   - Quick reference
   - Best practices
   - Troubleshooting

---

## Summary

### What You Get

✅ **Complete E2E test suite** (40+ tests)
✅ **Unit test examples** (45+ tests)
✅ **Integration test patterns** (30+ tests)
✅ **Test helpers and utilities**
✅ **Data generators**
✅ **CI/CD integration**
✅ **Coverage reporting**
✅ **Best practices guide**

### Test Count Summary

- **E2E Tests:** 40+ (Playwright)
- **Integration Tests:** 30+ (Vitest + Supabase)
- **Unit Tests:** 45+ (Vitest + RTL)
- **Total:** **115+ tests**

### Coverage Summary

- **Overall:** 80%+ goal
- **Services:** 90%+ goal
- **Components:** 80%+ goal
- **Critical paths:** 100% E2E coverage

---

## Next Steps

1. **Install dependencies**
   ```bash
   npm install -D @playwright/test vitest @testing-library/react
   ```

2. **Set up configuration files**
   - Copy `playwright.config.ts`
   - Copy `vitest.config.ts`
   - Create `.env.test`

3. **Create test structure**
   ```bash
   mkdir -p tests/{e2e,integration,unit,setup}
   ```

4. **Write your first test**
   - Start with unit test
   - Then integration test
   - Finally E2E test

5. **Run tests**
   ```bash
   npm run test           # Unit tests
   npm run test:e2e       # E2E tests
   npm run test:all       # Everything
   ```

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Status:** ✅ Complete
**Test Coverage:** 115+ tests across all types
**Documentation:** 4 comprehensive guides
**Ready for:** Production testing
