# Booknor Testing Guide

Complete testing infrastructure with E2E, integration, and unit tests for the Booknor application.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [E2E Testing](#e2e-testing)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Installation

```bash
# Install all dependencies including testing packages
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Environment Setup

Create `.env.test` file with test environment variables:

```bash
# Supabase (local test instance)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-test-anon-key

# Test credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123
TEST_ORG_ID=test-org-123

# Playwright
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

### Run All Tests

```bash
npm run test:all
```

## Test Structure

```
tests/
├── e2e/                          # End-to-end tests (Playwright)
│   ├── auth/
│   │   └── login.spec.ts         # Authentication flows
│   ├── facilities/
│   │   ├── list.spec.ts          # Facility list page
│   │   └── detail.spec.ts        # Facility detail page
│   ├── bookings/
│   │   ├── create.spec.ts        # Booking creation
│   │   └── manage.spec.ts        # Booking management
│   ├── favorites/
│   │   └── toggle.spec.ts        # Favorites functionality
│   ├── messages/
│   │   └── chat.spec.ts          # Messaging system
│   ├── support/
│   │   └── tickets.spec.ts       # Support tickets
│   └── notifications/
│       └── bell.spec.ts          # Notifications
│
├── unit/                         # Unit tests (Vitest)
│   ├── services/
│   │   ├── facilities.service.test.ts
│   │   ├── bookings.service.test.ts
│   │   └── ...                   # Other service tests
│   └── components/               # Component unit tests
│
├── integration/                  # Integration tests (Vitest)
│   └── services/
│       └── facilities-integration.test.ts
│
└── setup/                        # Test setup and helpers
    ├── vitest-setup.ts           # Vitest global setup
    ├── supabase-helpers.ts       # Supabase test utilities
    └── auth.setup.ts             # Playwright auth setup
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run specific test file
npm run test -- tests/unit/services/facilities.service.test.ts
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Prerequisites:
# - Supabase local dev must be running
npx supabase start
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# View test report
npm run test:e2e:report
```

### Coverage

```bash
# Generate coverage report
npm run test:coverage

# Coverage reports are generated in:
# - coverage/ (HTML report)
# - Open coverage/index.html in browser
```

## E2E Testing

### Test Files Created

| Test Suite | File | Tests | Description |
|------------|------|-------|-------------|
| Authentication | `tests/e2e/auth/login.spec.ts` | 9 tests | Login, logout, session management |
| Facilities List | `tests/e2e/facilities/list.spec.ts` | 12 tests | List view, filters, search, pagination |
| Facility Detail | `tests/e2e/facilities/detail.spec.ts` | 14 tests | Detail view, booking flow, availability |
| Booking Creation | `tests/e2e/bookings/create.spec.ts` | 11 tests | Create bookings, validation, payment |
| Booking Management | `tests/e2e/bookings/manage.spec.ts` | 15 tests | View, cancel, modify bookings |
| Favorites | `tests/e2e/favorites/toggle.spec.ts` | 12 tests | Add/remove favorites, persistence |
| Messages | `tests/e2e/messages/chat.spec.ts` | 15 tests | Chat interface, real-time updates |
| Support Tickets | `tests/e2e/support/tickets.spec.ts` | 16 tests | Create, manage, respond to tickets |
| Notifications | `tests/e2e/notifications/bell.spec.ts` | 17 tests | Bell icon, dropdown, preferences |

**Total E2E Tests: 121+**

### Running Specific E2E Suites

```bash
# Run only auth tests
npx playwright test tests/e2e/auth

# Run only facilities tests
npx playwright test tests/e2e/facilities

# Run only bookings tests
npx playwright test tests/e2e/bookings
```

### E2E Test Patterns

All E2E tests follow these patterns:

```typescript
// 1. Setup with authenticated user
test.use({ storageState: 'tests/setup/.auth/user.json' });

// 2. Navigation before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/page-url');
  await page.waitForLoadState('networkidle');
});

// 3. Flexible element selection
const element = page.locator(
  '[data-testid="element-id"], .fallback-class, text=/pattern/i'
);

// 4. Graceful handling of optional features
if (await element.isVisible()) {
  await element.click();
}

// 5. Real-time update testing
await page.waitForTimeout(2000); // Wait for WebSocket updates
```

## Unit Testing

### Test Files Created

| Service | File | Tests | Coverage |
|---------|------|-------|----------|
| Facilities | `tests/unit/services/facilities.service.test.ts` | 15+ tests | Service + Hooks |
| Bookings | `tests/unit/services/bookings.service.test.ts` | 15+ tests | Service + Hooks |

**Total Unit Tests: 30+**

### Unit Test Patterns

```typescript
// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Create React Query wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Test service functions
describe('facilitiesService.getAll', () => {
  it('should fetch all facilities', async () => {
    const mockData = [{ id: '1', name: 'Facility' }];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const result = await facilitiesService.getAll('org-1');
    expect(result).toEqual(mockData);
  });
});

// Test React Query hooks
describe('useFacilities', () => {
  it('should fetch facilities list', async () => {
    const { result } = renderHook(() => useFacilities('org-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Integration Testing

### Test Files Created

| Component | File | Tests | Description |
|-----------|------|-------|-------------|
| Facilities | `tests/integration/services/facilities-integration.test.ts` | 20+ tests | Real Supabase integration |

**Total Integration Tests: 20+**

### Running Integration Tests

Integration tests require a running Supabase instance:

```bash
# 1. Start Supabase local dev
npx supabase start

# 2. Run integration tests
npm run test:integration

# 3. Stop Supabase when done
npx supabase stop
```

### Integration Test Categories

1. **CRUD Operations** - Create, read, update, delete
2. **Filtering and Search** - Type, status, search queries
3. **Data Validation** - Invalid data handling
4. **Row Level Security** - Multi-tenant isolation
5. **Concurrent Operations** - Race conditions
6. **Availability Queries** - Complex queries
7. **Image Upload** - File handling
8. **Amenities Management** - Array fields

## Test Coverage

### Coverage Goals

- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 80%+
- **Statements**: 80%+

### Excluded from Coverage

- `node_modules/`
- `tests/`
- `**/*.d.ts`
- `**/*.config.*`
- `**/mockData`
- `dist/`
- `src/types/database.ts` (generated file)

### View Coverage Report

```bash
# Generate and open coverage report
npm run test:coverage
open coverage/index.html
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Common Issues

#### 1. Playwright browsers not installed

```bash
Error: Executable doesn't exist at /path/to/playwright
```

**Solution:**
```bash
npx playwright install
```

#### 2. Supabase connection errors in integration tests

```bash
Error: fetch failed
```

**Solution:**
```bash
# Ensure Supabase is running
npx supabase start

# Check .env.test has correct URL
VITE_SUPABASE_URL=http://127.0.0.1:54321
```

#### 3. Test timeouts

```bash
Error: Timeout of 10000ms exceeded
```

**Solution:**
```typescript
// Increase timeout in specific test
test('slow test', async () => {
  // ...
}, { timeout: 30000 });

// Or globally in config
export default defineConfig({
  test: {
    testTimeout: 30000,
  },
});
```

#### 4. Auth state not persisting

```bash
Error: Redirected to login page
```

**Solution:**
```bash
# Re-run auth setup
npx playwright test tests/setup/auth.setup.ts

# Or delete and regenerate auth files
rm -rf tests/setup/.auth
npx playwright test --project=setup
```

#### 5. Port already in use

```bash
Error: Port 5173 is already in use
```

**Solution:**
```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or use different port in .env.test
PLAYWRIGHT_BASE_URL=http://localhost:5174
```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:e2e:debug

# Run specific test in debug
npx playwright test tests/e2e/auth/login.spec.ts --debug

# Use --headed to see browser
npm run test:e2e:headed
```

### Viewing Test Reports

```bash
# Playwright HTML report
npm run test:e2e:report

# Vitest coverage report
npm run test:coverage
open coverage/index.html

# Vitest UI mode
npm run test:ui
```

## Test Data Management

### Cleanup

```typescript
// tests/setup/supabase-helpers.ts provides:

// Clean all test data
await cleanupTestData();

// Create test facility
const facility = await createTestFacility({
  name: 'Test Facility',
  type: 'sports',
});

// Create test booking
const booking = await createTestBooking(facilityId, userId);

// Seed test data
await seedTestData();
```

### Best Practices

1. **Isolation** - Each test should be independent
2. **Cleanup** - Always clean up test data
3. **Idempotency** - Tests should produce same results on re-run
4. **Realistic Data** - Use realistic test data
5. **Async Handling** - Properly await async operations

## Next Steps

1. **Install dependencies**: `npm install`
2. **Install browsers**: `npx playwright install`
3. **Start Supabase**: `npx supabase start`
4. **Run tests**: `npm run test:all`
5. **View reports**: `npm run test:e2e:report`

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)

---

**Test Coverage**: 171+ total tests across E2E, unit, and integration suites
- E2E Tests: 121+
- Unit Tests: 30+
- Integration Tests: 20+
