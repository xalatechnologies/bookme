# Testing Infrastructure Documentation

## Overview

This document describes the comprehensive testing infrastructure for the BookMe application. The testing stack includes unit tests, integration tests, and end-to-end tests with proper mocking and test utilities.

## Testing Stack

### Core Testing Libraries

- **Vitest** - Fast unit test framework (Vite-native alternative to Jest)
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end browser testing
- **MSW (Mock Service Worker)** - API mocking for tests
- **@testing-library/user-event** - User interaction simulation

### Installation

If MSW is not installed, add it:

```bash
npm install -D msw@latest
```

All other dependencies are already included in `package.json`.

## Project Structure

```
tests/
├── setup/
│   ├── vitest-setup.ts          # Global test setup with MSW
│   ├── auth.setup.ts             # Authentication setup for E2E
│   └── supabase-helpers.ts       # Supabase test utilities
├── mocks/
│   ├── handlers.ts               # MSW API request handlers
│   ├── server.ts                 # MSW server configuration
│   └── data.ts                   # Mock data factory
├── fixtures/
│   ├── bookings.ts               # Sample booking data
│   ├── facilities.ts             # Sample facility data
│   └── users.ts                  # Sample user data & credentials
├── unit/
│   ├── services/
│   │   ├── bookings.service.test.ts
│   │   ├── facilities.service.test.ts
│   │   └── favorites.service.test.ts
│   └── hooks/
│       ├── useBookingFilters.test.ts
│       ├── useBookingStats.test.ts
│       └── useRecurringBookingGroups.test.ts
├── integration/
│   └── bookings/
│       └── booking-creation-flow.test.tsx
├── e2e/
│   ├── user/
│   │   └── complete-booking-flow.spec.ts
│   ├── auth/
│   │   └── login.spec.ts
│   └── facilities/
│       └── list.spec.ts
└── test-utils.tsx                # Custom render & test utilities
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### All Tests

```bash
# Run all tests (unit, integration, E2E)
npm run test:all
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for services and hooks
- **Integration Tests**: All critical user flows
- **E2E Tests**: Core booking and payment flows
- **No TypeScript errors** in tests
- **No skipped tests** in CI

## Writing Tests

### Unit Tests

Unit tests focus on individual functions and hooks in isolation.

#### Example: Service Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookingsService } from '@/services/supabase/bookings.service';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase');

describe('BookingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user bookings', async () => {
    const mockBookings = [{ id: '1', user_id: 'user-1' }];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
    } as any);

    const result = await bookingsService.getUserBookings('user-1');

    expect(result).toEqual(mockBookings);
  });
});
```

#### Example: Hook Test

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookingFilters } from '@/hooks/bookings/useBookingFilters';

describe('useBookingFilters', () => {
  it('should filter bookings by status', () => {
    const mockBookings = [
      { id: '1', status: 'paid' },
      { id: '2', status: 'pending' },
    ];

    const { result } = renderHook(() =>
      useBookingFilters(mockBookings, { status: 'paid' })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].status).toBe('paid');
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly.

#### Example: Component Integration Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { BookingForm } from '@/components/BookingForm';

describe('Booking Creation Flow', () => {
  it('should create a booking successfully', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<BookingForm onSuccess={onSuccess} />);

    await user.selectOptions(screen.getByLabelText(/facility/i), 'facility-1');
    await user.type(screen.getByLabelText(/date/i), '2025-03-01');
    await user.selectOptions(screen.getByLabelText(/start time/i), '10:00');
    await user.selectOptions(screen.getByLabelText(/end time/i), '12:00');

    await user.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### End-to-End Tests

E2E tests simulate real user interactions in a browser.

#### Example: Complete User Flow

```typescript
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to facilities
  await page.goto('/user/facilities');
  await page.locator('article').first().click();

  // Select date and time
  await page.click('[data-testid="date-picker"]');
  await page.click('button:has-text("15")');
  await page.selectOption('select[name="start-time"]', '10:00');
  await page.selectOption('select[name="end-time"]', '12:00');

  // Book
  await page.click('button:has-text("Book")');

  // Verify
  await expect(page.locator('text=Booking confirmed')).toBeVisible();
});
```

## Mock Service Worker (MSW)

MSW intercepts HTTP requests at the network level, providing realistic API mocking.

### How It Works

1. **Setup** (`tests/mocks/server.ts`) - Creates MSW server instance
2. **Handlers** (`tests/mocks/handlers.ts`) - Defines mock API responses
3. **Integration** (`tests/setup/vitest-setup.ts`) - Starts server before tests

### Adding New Mock Handlers

```typescript
// tests/mocks/handlers.ts
export const handlers = [
  http.get('/rest/v1/bookings', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    return HttpResponse.json(
      mockBookings.filter(b => b.user_id === userId)
    );
  }),

  http.post('/rest/v1/bookings', async ({ request }) => {
    const newBooking = await request.json();
    return HttpResponse.json(
      { id: 'new-id', ...newBooking },
      { status: 201 }
    );
  }),
];
```

### Override Handlers in Tests

```typescript
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

it('should handle API errors', async () => {
  server.use(
    http.get('/rest/v1/bookings', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  // Your test code...
});
```

## Test Utilities

### Custom Render

Use the custom `render` from `@/tests/test-utils` to automatically wrap components with providers:

```typescript
import { render, screen } from '@/tests/test-utils';
import { MyComponent } from '@/components/MyComponent';

it('renders with providers', () => {
  render(<MyComponent />);
  // Component has access to QueryClient, AuthContext, Router, etc.
});
```

### Mock Data Factories

```typescript
import { createMockBooking, createMockFacility } from '@/tests/mocks/data';

const booking = createMockBooking({
  status: 'paid',
  total_cents: 150000,
});

const facility = createMockFacility({
  name: 'Custom Facility',
  hourly_rate: 1000,
});
```

## Best Practices

### 1. Test Organization

- **One file per component/service/hook**
- **Descriptive test names** that explain what is being tested
- **Arrange-Act-Assert pattern** for test structure

### 2. Test Independence

- Tests should **not depend on each other**
- **Clean up after each test** (handled automatically)
- **Reset mocks** between tests

### 3. Realistic Testing

- **Test user behavior**, not implementation details
- Use **semantic queries** (getByRole, getByLabelText)
- **Avoid testing CSS classes** or internal state

### 4. Performance

- **Mock external dependencies** (APIs, databases)
- **Parallel test execution** where possible
- **Fast feedback loop** (< 30s for unit tests)

### 5. Maintainability

- **Reuse test utilities** and fixtures
- **Keep tests simple** and focused
- **Update tests with code changes**

## Continuous Integration

Tests run automatically on every commit:

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm run test:unit

- name: Run E2E tests
  run: npm run test:e2e
```

## Debugging Tests

### Vitest UI

```bash
npm run test:ui
```

Opens an interactive UI showing:
- Test results
- Code coverage
- Test duration
- Stack traces

### Playwright Debug

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for:
- Step-by-step execution
- DOM inspection
- Network monitoring
- Screenshots

### VSCode Integration

Install extensions:
- **Vitest** - Run tests in VSCode
- **Playwright Test for VSCode** - Run E2E tests

## Troubleshooting

### MSW Not Working

```bash
# Ensure MSW is installed
npm install -D msw@latest

# Check MSW is properly imported in vitest-setup.ts
```

### Tests Timing Out

```typescript
// Increase timeout for specific tests
it('slow test', async () => {
  // ...
}, { timeout: 10000 });

// Or in vitest.config.ts
test: {
  testTimeout: 10000,
}
```

### Supabase Auth Errors

```typescript
// Mock Supabase auth in tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: mockSession },
      }),
    },
  },
}));
```

## Coverage Reports

Coverage reports are generated in:
- `coverage/` - HTML report (open `coverage/index.html`)
- `coverage/lcov.info` - LCOV format for CI

View coverage:

```bash
npm run test:coverage
open coverage/index.html
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

## Support

For questions or issues:
1. Check this documentation
2. Review existing tests for examples
3. Consult official documentation
4. Ask the team in #testing channel
