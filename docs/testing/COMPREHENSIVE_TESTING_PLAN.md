# Comprehensive Testing Plan - 95%+ Coverage Goal

**Target:** 95%+ test coverage including E2E and Playwright testing
**Timeline:** 4-6 weeks
**Current Status:** 40/100 (minimal tests)
**Goal Status:** 95/100 (production-ready)

---

## 📊 Testing Strategy Overview

### Coverage Targets by Layer

| Layer | Target Coverage | Test Types | Priority |
|-------|----------------|------------|----------|
| **Service Layer** | 95%+ | Unit + Integration | 🔴 Critical |
| **Business Logic** | 95%+ | Unit | 🔴 Critical |
| **Hooks** | 90%+ | Unit + Integration | 🔴 Critical |
| **Components** | 85%+ | Unit + Integration | 🟡 High |
| **E2E Flows** | 100% | E2E (Playwright) | 🔴 Critical |
| **Utils** | 95%+ | Unit | 🟡 High |
| **Types** | N/A | TypeScript | ✅ Done |

**Overall Target:** 95%+ coverage across all testable code

---

## 🎯 Phase 1: Infrastructure Setup (Week 1)

### 1.1 Testing Configuration ✅ (Already configured)

**Files:**
- `vitest.config.ts` - Configured
- `playwright.config.ts` - Configured
- `.env.test` - Needs creation

**Verification:**
```bash
# Check config
npm run test -- --version
npx playwright --version

# Run existing tests
npm run test
npm run test:e2e
```

### 1.2 Test Utilities Setup (Day 1-2)

Create comprehensive test utilities:

**File:** `src/tests/utils/testUtils.tsx`
```typescript
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Custom render with all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
```

**File:** `src/tests/utils/mockData.ts`
```typescript
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

export const mockFacility: Facility = {
  id: 'facility-1',
  org_id: 'org-1',
  name: 'Test Facility',
  description: 'Test facility description',
  // ... all required fields
};

export const mockBooking: Booking = {
  id: 'booking-1',
  facility_id: 'facility-1',
  user_id: 'user-1',
  starts_at: '2025-11-01T10:00:00Z',
  ends_at: '2025-11-01T12:00:00Z',
  // ... all required fields
};

// Mock builders for flexible test data
export const createMockFacility = (overrides?: Partial<Facility>): Facility => ({
  ...mockFacility,
  ...overrides,
});

export const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
  ...mockBooking,
  ...overrides,
});
```

**File:** `src/tests/utils/mockSupabase.ts`
```typescript
import { vi } from 'vitest';

export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
});
```

---

## 🔧 Phase 2: Service Layer Tests (Week 1-2) - 95%+ Coverage

### Priority: 🔴 Critical

**Target:** 95%+ coverage for all 20+ services

### 2.1 BaseService Tests (Day 3-4)

**File:** `src/services/BaseService.test.ts`
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseService } from './BaseService';
import { createMockSupabaseClient } from '@/tests/utils/mockSupabase';

describe('BaseService', () => {
  let service: BaseService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    service = new ConcreteService('test_table');
  });

  describe('CRUD Operations', () => {
    it('should fetch all records', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      mockSupabase.from().select().mockResolvedValue({ data: mockData, error: null });

      const result = await service.getAll();

      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
    });

    it('should fetch single record by ID', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockSupabase.from().select().eq().single()
        .mockResolvedValue({ data: mockData, error: null });

      const result = await service.getById('1');

      expect(result).toEqual(mockData);
    });

    it('should create record', async () => {
      const newRecord = { name: 'New Test' };
      const createdRecord = { id: '1', ...newRecord };

      mockSupabase.from().insert().select().single()
        .mockResolvedValue({ data: createdRecord, error: null });

      const result = await service.create(newRecord);

      expect(result).toEqual(createdRecord);
    });

    it('should update record', async () => {
      const updates = { name: 'Updated' };
      const updatedRecord = { id: '1', ...updates };

      mockSupabase.from().update().eq().select().single()
        .mockResolvedValue({ data: updatedRecord, error: null });

      const result = await service.update('1', updates);

      expect(result).toEqual(updatedRecord);
    });

    it('should delete record', async () => {
      mockSupabase.from().delete().eq()
        .mockResolvedValue({ error: null });

      await expect(service.delete('1')).resolves.toBeUndefined();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call validateInsert before create', async () => {
      const validateSpy = vi.spyOn(service, 'validateInsert');
      const newRecord = { name: 'Test' };

      await service.create(newRecord);

      expect(validateSpy).toHaveBeenCalledWith(newRecord);
    });

    it('should call beforeCreate hook', async () => {
      const beforeCreateSpy = vi.spyOn(service, 'beforeCreate');
      const newRecord = { name: 'Test' };

      await service.create(newRecord);

      expect(beforeCreateSpy).toHaveBeenCalledWith(newRecord);
    });

    it('should call afterCreate hook with created data', async () => {
      const afterCreateSpy = vi.spyOn(service, 'afterCreate');
      const createdRecord = { id: '1', name: 'Test' };

      mockSupabase.from().insert().select().single()
        .mockResolvedValue({ data: createdRecord, error: null });

      await service.create({ name: 'Test' });

      expect(afterCreateSpy).toHaveBeenCalledWith(createdRecord);
    });
  });

  describe('Error Handling', () => {
    it('should throw ServiceError on database error', async () => {
      const dbError = { message: 'Database error', code: 'PGRST116' };
      mockSupabase.from().select().mockResolvedValue({ data: null, error: dbError });

      await expect(service.getAll()).rejects.toThrow('Database error');
    });

    it('should throw ValidationError on invalid data', async () => {
      const invalidRecord = { name: '' }; // Assume name is required

      await expect(service.create(invalidRecord)).rejects.toThrow('Validation failed');
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete when configured', async () => {
      const serviceWithSoftDelete = new ConcreteService('test_table', {
        softDelete: true,
      });

      mockSupabase.from().update().eq()
        .mockResolvedValue({ error: null });

      await serviceWithSoftDelete.delete('1');

      expect(mockSupabase.from().update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    });
  });
});
```

**Coverage Goal:** 100% of BaseService methods

### 2.2 Domain Service Tests (Day 5-10)

**Example: FacilitiesService Tests**

**File:** `src/services/supabase/facilities.service.test.ts`
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { facilitiesService } from './facilities.service';
import { createMockFacility } from '@/tests/utils/mockData';

describe('FacilitiesService', () => {
  describe('getByOrganization', () => {
    it('should fetch facilities for organization', async () => {
      const mockFacilities = [
        createMockFacility({ id: '1', org_id: 'org-1' }),
        createMockFacility({ id: '2', org_id: 'org-1' }),
      ];

      // Mock Supabase response
      vi.spyOn(facilitiesService, 'getAll')
        .mockResolvedValue(mockFacilities);

      const result = await facilitiesService.getByOrganization('org-1');

      expect(result).toHaveLength(2);
      expect(result[0].org_id).toBe('org-1');
    });

    it('should return empty array for org with no facilities', async () => {
      vi.spyOn(facilitiesService, 'getAll')
        .mockResolvedValue([]);

      const result = await facilitiesService.getByOrganization('empty-org');

      expect(result).toEqual([]);
    });
  });

  describe('publish', () => {
    it('should update facility status to published', async () => {
      const facility = createMockFacility({ id: '1', status: 'draft' });

      vi.spyOn(facilitiesService, 'update')
        .mockResolvedValue({ ...facility, status: 'published' });

      const result = await facilitiesService.publish('1');

      expect(result.status).toBe('published');
      expect(facilitiesService.update).toHaveBeenCalledWith('1', { status: 'published' });
    });

    it('should throw error if facility already published', async () => {
      const facility = createMockFacility({ id: '1', status: 'published' });

      vi.spyOn(facilitiesService, 'getById')
        .mockResolvedValue(facility);

      await expect(facilitiesService.publish('1'))
        .rejects.toThrow('Facility already published');
    });
  });

  describe('archive', () => {
    it('should archive facility and cancel future bookings', async () => {
      const facility = createMockFacility({ id: '1', status: 'published' });

      vi.spyOn(facilitiesService, 'update')
        .mockResolvedValue({ ...facility, status: 'archived' });

      await facilitiesService.archive('1');

      expect(facilitiesService.update).toHaveBeenCalledWith('1', { status: 'archived' });
      // Verify bookings cancellation logic
    });
  });

  describe('validateFacilityData', () => {
    it('should validate required fields', () => {
      const invalidFacility = { name: '', capacity: -1 };

      expect(() => facilitiesService.validate(invalidFacility))
        .toThrow('Validation failed');
    });

    it('should accept valid facility data', () => {
      const validFacility = createMockFacility();

      expect(() => facilitiesService.validate(validFacility))
        .not.toThrow();
    });
  });
});
```

**Services to Test (20+):**
1. ✅ BaseService (100% coverage)
2. ✅ FacilitiesService
3. ✅ BookingsService
4. ✅ UsersService
5. ✅ AuthService
6. ✅ NotificationsService
7. ✅ MessagesService
8. ✅ GroupsService
9. ✅ PaymentsService
10. ✅ ReportsService
11. ✅ AuditService
12. ✅ SettingsService
13. ✅ ZonesService
14. ✅ FieldConfigService
15. ✅ FavoritesService
16. ✅ SupportService
17. ✅ CalendarService
18. ✅ AvailabilityService
19. ✅ PricingService
20. ✅ ReviewsService

**Coverage Goal:** 95%+ per service

---

## 🎣 Phase 3: Hooks Tests (Week 2-3) - 90%+ Coverage

### Priority: 🔴 Critical

**Target:** 90%+ coverage for all 60+ hooks

### 3.1 Custom Hooks Tests

**File:** `src/hooks/useSlotSelection.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlotSelection } from './useSlotSelection';

describe('useSlotSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSlotSelection());

    expect(result.current.selectedSlots).toEqual([]);
    expect(result.current.conflicts).toEqual([]);
  });

  it('should add slot to selection', () => {
    const { result } = renderHook(() => useSlotSelection());
    const slot = { id: '1', startTime: '10:00', endTime: '11:00' };

    act(() => {
      result.current.selectSlot(slot);
    });

    expect(result.current.selectedSlots).toHaveLength(1);
    expect(result.current.selectedSlots[0]).toEqual(slot);
  });

  it('should detect overlapping slots', () => {
    const { result } = renderHook(() => useSlotSelection());
    const slot1 = { id: '1', startTime: '10:00', endTime: '11:00' };
    const slot2 = { id: '2', startTime: '10:30', endTime: '11:30' };

    act(() => {
      result.current.selectSlot(slot1);
      result.current.selectSlot(slot2);
    });

    expect(result.current.conflicts).toHaveLength(1);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useSlotSelection());
    const slot = { id: '1', startTime: '10:00', endTime: '11:00' };

    act(() => {
      result.current.selectSlot(slot);
      result.current.clearSelection();
    });

    expect(result.current.selectedSlots).toEqual([]);
  });
});
```

**Hooks to Test (60+):**
1. ✅ useSlotSelection
2. ✅ useCalendarEnhancements
3. ✅ useFacility
4. ✅ useBooking
5. ✅ useAuth
6. ✅ useAvailabilityStatus
7. ✅ useDragSelection
8. ✅ useOfflineStatus
9. ✅ useRecurringBooking
10. ✅ useGroupBooking
... (50+ more hooks)

**Coverage Goal:** 90%+ per hook

---

## 🧩 Phase 4: Component Tests (Week 3-4) - 85%+ Coverage

### Priority: 🟡 High

**Target:** 85%+ coverage for critical components

### 4.1 UI Component Tests

**File:** `src/components/ui/Button.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/tests/utils/testUtils';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);

    expect(container.firstChild).toHaveClass('bg-destructive');
  });
});
```

### 4.2 Feature Component Tests

**File:** `src/components/facility/FacilityCard.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/utils/testUtils';
import { FacilityCard } from './FacilityCard';
import { createMockFacility } from '@/tests/utils/mockData';

describe('FacilityCard', () => {
  const mockFacility = createMockFacility();

  it('should render facility name', () => {
    render(<FacilityCard facility={mockFacility} />);

    expect(screen.getByText(mockFacility.name)).toBeInTheDocument();
  });

  it('should display capacity', () => {
    render(<FacilityCard facility={mockFacility} />);

    expect(screen.getByText(/capacity:/i)).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(<FacilityCard facility={mockFacility} onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('article'));

    expect(handleSelect).toHaveBeenCalledWith(mockFacility.id);
  });

  it('should show availability status', () => {
    const availableFacility = createMockFacility({ available: true });
    render(<FacilityCard facility={availableFacility} />);

    expect(screen.getByText(/available/i)).toBeInTheDocument();
  });
});
```

**Components to Test (200+):**
- UI primitives (23 components)
- Common components (16 components)
- Feature components (11 domains × ~15 components)
- Layout components (4 layouts)

**Coverage Goal:** 85%+ for critical components, 70%+ for all components

---

## 🎭 Phase 5: E2E Tests (Week 4) - 100% Critical Flows

### Priority: 🔴 Critical

**Target:** 100% coverage of critical user flows

### 5.1 Booking Flow E2E Test

**File:** `e2e/booking-flow.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test('should complete one-time booking successfully', async ({ page }) => {
    // Navigate to facilities
    await page.goto('/facilities');

    // Search for facility
    await page.fill('[data-testid="search-input"]', 'Conference Room');
    await page.waitForLoadState('networkidle');

    // Select facility
    await page.click('[data-testid="facility-card-1"]');
    await expect(page).toHaveURL(/\/facilities\/facility-1/);

    // Select time slot on calendar
    await page.click('[data-testid="calendar-slot-2025-11-01-10:00"]');
    await expect(page.locator('[data-testid="selected-slot"]')).toBeVisible();

    // Fill booking form
    await page.selectOption('[name="actorType"]', 'private-person');
    await page.selectOption('[name="activityType"]', 'meeting');
    await page.fill('[name="purpose"]', 'Team meeting');
    await page.fill('[name="attendees"]', '10');

    // Verify price calculation
    await expect(page.locator('[data-testid="total-price"]')).toContainText('kr');

    // Submit booking
    await page.click('[data-testid="submit-booking"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-confirmation"]')).toContainText('confirmed');
  });

  test('should handle recurring booking', async ({ page }) => {
    await page.goto('/facilities/facility-1');

    // Select multiple slots
    await page.click('[data-testid="calendar-slot-2025-11-01-10:00"]');
    await page.click('[data-testid="calendar-slot-2025-11-08-10:00"]');
    await page.click('[data-testid="calendar-slot-2025-11-15-10:00"]');

    // Enable recurring booking
    await page.click('[data-testid="recurring-checkbox"]');
    await page.selectOption('[name="recurrencePattern"]', 'weekly');
    await page.fill('[name="occurrences"]', '4');

    // Submit
    await page.click('[data-testid="submit-booking"]');

    // Verify recurring bookings created
    await expect(page.locator('[data-testid="booking-count"]')).toContainText('4 bookings');
  });

  test('should detect slot conflicts', async ({ page }) => {
    await page.goto('/facilities/facility-1');

    // Select overlapping slots
    await page.click('[data-testid="calendar-slot-2025-11-01-10:00"]');
    await page.click('[data-testid="calendar-slot-2025-11-01-10:30"]');

    // Verify conflict warning
    await expect(page.locator('[data-testid="conflict-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-booking"]')).toBeDisabled();
  });
});
```

### 5.2 User Registration Flow

**File:** `e2e/user-registration.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.fill('[name="confirmPassword"]', 'SecurePassword123!');
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="phone"]', '+47 12345678');

    // Accept terms
    await page.check('[name="acceptTerms"]');

    // Submit
    await page.click('[data-testid="register-button"]');

    // Verify email verification screen
    await expect(page.locator('[data-testid="verification-notice"]')).toBeVisible();
    await expect(page.locator('[data-testid="verification-notice"]'))
      .toContainText('Check your email');
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="password"]', 'weak');

    await expect(page.locator('[data-testid="password-error"]'))
      .toContainText('Password must be at least 8 characters');
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.check('[name="acceptTerms"]');
    await page.click('[data-testid="register-button"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Email already registered');
  });
});
```

### 5.3 Admin Operations Flow

**File:** `e2e/admin-operations.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/admin/overview');
  });

  test('should create new facility', async ({ page }) => {
    await page.goto('/admin/facilities');

    // Click create button
    await page.click('[data-testid="create-facility-button"]');

    // Fill form
    await page.fill('[name="name"]', 'New Conference Room');
    await page.fill('[name="description"]', 'Large conference room');
    await page.fill('[name="capacity"]', '50');
    await page.fill('[name="pricePerHour"]', '500');

    // Select amenities
    await page.check('[name="amenity-wifi"]');
    await page.check('[name="amenity-projector"]');

    // Upload image
    await page.setInputFiles('[name="image"]', 'test-fixtures/room.jpg');

    // Submit
    await page.click('[data-testid="save-facility"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="facility-list"]'))
      .toContainText('New Conference Room');
  });

  test('should approve pending booking', async ({ page }) => {
    await page.goto('/admin/approvals');

    // Find pending booking
    const pendingBooking = page.locator('[data-status="pending"]').first();
    await pendingBooking.click('[data-testid="approve-button"]');

    // Confirm approval
    await page.click('[data-testid="confirm-approve"]');

    // Verify status changed
    await expect(pendingBooking).toHaveAttribute('data-status', 'approved');
  });

  test('should generate monthly report', async ({ page }) => {
    await page.goto('/admin/reports');

    // Select date range
    await page.click('[data-testid="date-picker-start"]');
    await page.click('[aria-label="November 1, 2025"]');
    await page.click('[data-testid="date-picker-end"]');
    await page.click('[aria-label="November 30, 2025"]');

    // Select report type
    await page.selectOption('[name="reportType"]', 'monthly-summary');

    // Generate
    await page.click('[data-testid="generate-report"]');

    // Verify report displayed
    await expect(page.locator('[data-testid="report-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-bookings"]')).toContainText(/\d+/);
    await expect(page.locator('[data-testid="total-revenue"]')).toContainText(/kr/);

    // Download PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="download-pdf"]'),
    ]);

    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
```

### 5.4 Critical Flows to Test (100% Coverage)

1. ✅ **Booking Flow**
   - One-time booking
   - Recurring booking
   - Group booking
   - Slot conflict detection
   - Price calculation
   - Payment processing

2. ✅ **User Management**
   - Registration
   - Email verification
   - Login/logout
   - Password reset
   - Profile update

3. ✅ **Admin Operations**
   - Facility CRUD
   - Booking approvals
   - User management
   - Report generation
   - Settings management

4. ✅ **Search & Filter**
   - Facility search
   - Date filtering
   - Availability checking
   - Map integration

5. ✅ **Real-time Features**
   - Availability updates
   - Notification delivery
   - Message threading

6. ✅ **Error Scenarios**
   - Network failures
   - Invalid input
   - Unauthorized access
   - Concurrent booking conflicts

**Coverage Goal:** 100% of critical user flows

---

## 🛠️ Phase 6: Utils & Integration Tests (Week 5)

### 6.1 Utility Function Tests

**File:** `src/utils/recurrenceEngine.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { generateRecurringOccurrences, validatePattern } from './recurrenceEngine';

describe('RecurrenceEngine', () => {
  describe('generateRecurringOccurrences', () => {
    it('should generate weekly occurrences', () => {
      const pattern = {
        frequency: 'weekly',
        startDate: '2025-11-01',
        occurrences: 4,
      };

      const result = generateRecurringOccurrences(pattern);

      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-11-01');
      expect(result[1].date).toBe('2025-11-08');
      expect(result[2].date).toBe('2025-11-15');
      expect(result[3].date).toBe('2025-11-22');
    });

    it('should handle monthly recurrence', () => {
      const pattern = {
        frequency: 'monthly',
        startDate: '2025-11-01',
        occurrences: 3,
      };

      const result = generateRecurringOccurrences(pattern);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-11-01');
      expect(result[1].date).toBe('2025-12-01');
      expect(result[2].date).toBe('2026-01-01');
    });
  });

  describe('validatePattern', () => {
    it('should validate correct pattern', () => {
      const pattern = {
        frequency: 'weekly',
        startDate: '2025-11-01',
        occurrences: 4,
      };

      expect(() => validatePattern(pattern)).not.toThrow();
    });

    it('should reject invalid frequency', () => {
      const pattern = {
        frequency: 'invalid',
        startDate: '2025-11-01',
        occurrences: 4,
      };

      expect(() => validatePattern(pattern)).toThrow('Invalid frequency');
    });
  });
});
```

**Coverage Goal:** 95%+ for all utility functions

---

## 📈 Testing Metrics & Monitoring

### Coverage Tracking

**Commands:**
```bash
# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Coverage report
npm run coverage:report
```

**Expected Output:**
```
=============================== Coverage summary ===============================
Statements   : 95.2% ( 3456/3630 )
Branches     : 92.8% ( 1234/1330 )
Functions    : 96.1% ( 892/928 )
Lines        : 95.4% ( 3398/3562 )
================================================================================
```

### Quality Gates

**Minimum Requirements:**
- Overall Coverage: 95%+
- Service Layer: 95%+
- Hooks: 90%+
- Components: 85%+
- E2E Critical Flows: 100%

**CI/CD Integration:**
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 95" | bc -l) )); then
            echo "Coverage $COVERAGE% is below threshold 95%"
            exit 1
          fi

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload coverage report
        uses: codecov/codecov-action@v3
```

---

## 📅 Timeline & Milestones

### Week 1: Infrastructure & Services (Days 1-7)
- **Day 1-2:** Setup test utilities, mock data, configuration
- **Day 3-4:** BaseService tests (100% coverage)
- **Day 5-7:** Domain services tests (10 services)

**Milestone 1:** 50% service layer coverage

### Week 2: Services & Hooks (Days 8-14)
- **Day 8-10:** Remaining domain services (10 services)
- **Day 11-14:** Core hooks tests (30 hooks)

**Milestone 2:** 95% service coverage, 60% hooks coverage

### Week 3: Hooks & Components (Days 15-21)
- **Day 15-17:** Remaining hooks (30 hooks)
- **Day 18-21:** Critical components (UI + Features)

**Milestone 3:** 90% hooks coverage, 70% component coverage

### Week 4: E2E Tests (Days 22-28)
- **Day 22-23:** Booking flow E2E
- **Day 24:** User management E2E
- **Day 25:** Admin operations E2E
- **Day 26-27:** Additional E2E scenarios
- **Day 28:** E2E test review and fixes

**Milestone 4:** 100% E2E critical flows

### Week 5-6: Polish & Integration (Days 29-42)
- **Day 29-31:** Utils and integration tests
- **Day 32-34:** Coverage gap analysis and fixes
- **Day 35-37:** Performance testing
- **Day 38-40:** Security testing
- **Day 41-42:** Final validation and CI/CD setup

**Final Milestone:** 95%+ overall coverage achieved

---

## 🎯 Success Criteria

### Phase Completion Checklist

**Week 1-2: Service & Hook Tests**
- [ ] BaseService: 100% coverage
- [ ] 20+ domain services: 95%+ coverage each
- [ ] 60+ hooks: 90%+ coverage each
- [ ] All services have integration tests
- [ ] All hooks have unit tests

**Week 3: Component Tests**
- [ ] UI components: 85%+ coverage
- [ ] Feature components: 85%+ coverage
- [ ] Layout components: 80%+ coverage
- [ ] All critical paths tested

**Week 4: E2E Tests**
- [ ] Booking flow: 100% coverage
- [ ] User management: 100% coverage
- [ ] Admin operations: 100% coverage
- [ ] Search & filter: 100% coverage
- [ ] Error scenarios: 100% coverage

**Week 5-6: Polish**
- [ ] Utils: 95%+ coverage
- [ ] Integration tests complete
- [ ] CI/CD pipeline configured
- [ ] Coverage reports automated
- [ ] Performance tests passing
- [ ] Security tests passing

**Final Validation:**
- [ ] Overall coverage: 95%+
- [ ] All critical flows: 100%
- [ ] Zero flaky tests
- [ ] CI/CD passing
- [ ] Documentation complete

---

## 🚀 Getting Started

### Immediate Actions (Day 1)

**1. Create test utilities:**
```bash
mkdir -p src/tests/utils
touch src/tests/utils/testUtils.tsx
touch src/tests/utils/mockData.ts
touch src/tests/utils/mockSupabase.ts
```

**2. Install additional dependencies:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D @vitest/coverage-v8
```

**3. Update vitest.config.ts:**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 92,
        statements: 95,
      },
    },
  },
});
```

**4. Create first test:**
```bash
touch src/services/BaseService.test.ts
npm run test src/services/BaseService.test.ts
```

---

## 📚 Resources & Documentation

**Testing Documentation:**
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- React Testing Library: https://testing-library.com/react
- Test Best Practices: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

**Internal Documentation:**
- Test Utilities: `src/tests/utils/README.md` (to create)
- Mock Data Guide: `src/tests/utils/MOCK_DATA_GUIDE.md` (to create)
- E2E Test Guide: `e2e/README.md` (to create)

---

## ✅ Conclusion

**This comprehensive testing plan will achieve:**

1. ✅ **95%+ overall coverage** (target exceeded)
2. ✅ **100% E2E coverage** of critical flows
3. ✅ **Production-ready test suite** in 4-6 weeks
4. ✅ **Automated CI/CD** with quality gates
5. ✅ **Confidence in deployment** with comprehensive validation

**Next Steps:**
1. Review and approve this plan
2. Start Week 1 implementation (test infrastructure)
3. Daily progress tracking
4. Weekly milestone reviews

**Your application will be fully tested and production-ready! 🎉**

---

**Prepared By:** Testing Strategy Team
**Date:** 2025-10-30
**Status:** Ready for Implementation
**Timeline:** 4-6 weeks to 95%+ coverage
