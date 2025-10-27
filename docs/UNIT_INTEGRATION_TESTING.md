# Unit & Integration Testing Guide

## Overview

This guide provides comprehensive **unit and integration testing** strategies for the BookMe application using Vitest and React Testing Library.

---

## Unit Testing

### Testing Services

#### File: `tests/unit/services/facilities.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFacilities, useCreateFacility } from '@/services/supabase';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('Facilities Service', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useFacilities', () => {
    it('should fetch facilities successfully', async () => {
      const mockFacilities = [
        { id: '1', name: 'Test Facility 1', org_id: 'org-123' },
        { id: '2', name: 'Test Facility 2', org_id: 'org-123' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFacilities, error: null }),
      } as any);

      const { result } = renderHook(() => useFacilities('org-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockFacilities);
      expect(result.current.data).toHaveLength(2);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Failed to fetch');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as any);

      const { result } = renderHook(() => useFacilities('org-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when orgId is not provided', () => {
      const { result } = renderHook(() => useFacilities(''), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCreateFacility', () => {
    it('should create facility successfully', async () => {
      const newFacility = {
        org_id: 'org-123',
        name: 'New Facility',
        description: 'Test description',
        address: '123 Test St',
        type: 'sports',
        status: 'published',
        capacity: 50,
        price_per_hour: 500,
      };

      const createdFacility = { id: '123', ...newFacility };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdFacility, error: null }),
      } as any);

      const { result } = renderHook(() => useCreateFacility(), { wrapper });

      result.current.mutate(newFacility);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(createdFacility);
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Creation failed');

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      } as any);

      const { result } = renderHook(() => useCreateFacility(), { wrapper });

      result.current.mutate({} as any);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
```

#### File: `tests/unit/services/favorites.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleFavorite, useIsFavorite } from '@/services/supabase';

describe('Favorites Service', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useToggleFavorite', () => {
    it('should toggle favorite with optimistic update', async () => {
      // Set initial state
      queryClient.setQueryData(['favorites', 'is-favorite', 'user-123', 'facility-123'], false);

      const { result } = renderHook(() => useToggleFavorite(), { wrapper });

      // Trigger mutation
      result.current.mutate({ userId: 'user-123', facilityId: 'facility-123' });

      // Verify optimistic update
      const optimisticValue = queryClient.getQueryData([
        'favorites',
        'is-favorite',
        'user-123',
        'facility-123',
      ]);
      expect(optimisticValue).toBe(true);
    });

    it('should revert on error', async () => {
      // Mock error
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('Failed') }),
      } as any);

      queryClient.setQueryData(['favorites', 'is-favorite', 'user-123', 'facility-123'], false);

      const { result } = renderHook(() => useToggleFavorite(), { wrapper });

      result.current.mutate({ userId: 'user-123', facilityId: 'facility-123' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify reverted to original value
      const revertedValue = queryClient.getQueryData([
        'favorites',
        'is-favorite',
        'user-123',
        'facility-123',
      ]);
      expect(revertedValue).toBe(false);
    });
  });
});
```

### Testing Components

#### File: `tests/unit/components/FacilityCard.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FacilityCard } from '@/components/facility/FacilityCard';
import { useAuth } from '@/contexts/AuthContext';
import { useToggleFavorite } from '@/services/supabase';

// Mock hooks
vi.mock('@/contexts/AuthContext');
vi.mock('@/services/supabase');

describe('FacilityCard', () => {
  const mockFacility = {
    id: 'facility-123',
    name: 'Test Facility',
    description: 'Test description',
    address: '123 Test St',
    type: 'sports',
    capacity: 50,
    pricePerHour: 500,
    amenities: ['WiFi', 'Parking'],
    images: ['https://via.placeholder.com/400'],
    rating: 4.5,
    reviewCount: 10,
  };

  const mockOnAddressClick = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      currentOrgId: 'org-123',
      loading: false,
    } as any);

    vi.mocked(useToggleFavorite).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  it('should render facility information', () => {
    render(
      <FacilityCard
        facility={mockFacility}
        onAddressClick={mockOnAddressClick}
        viewMode="grid"
      />,
      { wrapper }
    );

    expect(screen.getByText('Test Facility')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('50 personer')).toBeInTheDocument();
  });

  it('should display amenities', () => {
    render(
      <FacilityCard
        facility={mockFacility}
        onAddressClick={mockOnAddressClick}
        viewMode="grid"
      />,
      { wrapper }
    );

    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Parking')).toBeInTheDocument();
  });

  it('should handle favorite click', async () => {
    const mockToggle = vi.fn();
    vi.mocked(useToggleFavorite).mockReturnValue({
      mutate: mockToggle,
      isPending: false,
    } as any);

    render(
      <FacilityCard
        facility={mockFacility}
        onAddressClick={mockOnAddressClick}
        viewMode="grid"
      />,
      { wrapper }
    );

    const favoriteButton = screen.getByLabelText(/favorite/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledWith({
        userId: 'user-123',
        facilityId: 'facility-123',
      });
    });
  });

  it('should handle address click', () => {
    render(
      <FacilityCard
        facility={mockFacility}
        onAddressClick={mockOnAddressClick}
        viewMode="grid"
      />,
      { wrapper }
    );

    const addressElement = screen.getByText('123 Test St');
    fireEvent.click(addressElement);

    expect(mockOnAddressClick).toHaveBeenCalledWith(expect.any(Object), mockFacility);
  });

  it('should navigate to facility detail on card click', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate,
    }));

    render(
      <FacilityCard
        facility={mockFacility}
        onAddressClick={mockOnAddressClick}
        viewMode="grid"
      />,
      { wrapper }
    );

    const card = screen.getByRole('button', { name: /se detaljer/i });
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith(`/facilities/${mockFacility.id}`);
  });

  it('should show loading state when toggling favorite', () => {
    vi.mocked(useToggleFavorite).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(
      <FacilityCard
        facility={mockFacility}
        onAddressClick={mockOnAddressClick}
        viewMode="grid"
      />,
      { wrapper }
    );

    // Verify loading spinner or disabled state
    const favoriteButton = screen.getByLabelText(/favorite/i);
    expect(favoriteButton).toBeDisabled();
  });
});
```

### Testing Utilities

#### File: `tests/unit/utils/dataMigration.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  migrateFacilities,
  migrateBookings,
  migrateFavorites,
  hasMigrationCompleted,
} from '@/utils/dataMigration';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase');

describe('Data Migration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('hasMigrationCompleted', () => {
    it('should return false when no migration status', () => {
      expect(hasMigrationCompleted()).toBe(false);
    });

    it('should return true when migration completed', () => {
      localStorage.setItem(
        'supabase-migration-status',
        JSON.stringify({
          completed: true,
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        })
      );

      expect(hasMigrationCompleted()).toBe(true);
    });

    it('should return false for invalid migration status', () => {
      localStorage.setItem('supabase-migration-status', 'invalid-json');

      expect(hasMigrationCompleted()).toBe(false);
    });
  });

  describe('migrateFacilities', () => {
    it('should migrate facilities from localStorage', async () => {
      const mockFacilities = [
        {
          id: 'fac-1',
          name: 'Facility 1',
          orgId: 'org-123',
        },
        {
          id: 'fac-2',
          name: 'Facility 2',
          orgId: 'org-123',
        },
      ];

      localStorage.setItem(
        'facility-store',
        JSON.stringify({
          state: { facilities: mockFacilities },
        })
      );

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await migrateFacilities('user-123', 'org-123');

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip demo facilities', async () => {
      const mockFacilities = [
        { id: 'demo-1', name: 'Demo Facility' },
        { id: 'real-1', name: 'Real Facility' },
      ];

      localStorage.setItem(
        'facility-store',
        JSON.stringify({
          state: { facilities: mockFacilities },
        })
      );

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await migrateFacilities('user-123', 'org-123');

      expect(result.migratedCount).toBe(1);
    });

    it('should handle migration errors', async () => {
      const mockFacilities = [{ id: 'fac-1', name: 'Facility 1' }];

      localStorage.setItem(
        'facility-store',
        JSON.stringify({
          state: { facilities: mockFacilities },
        })
      );

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: new Error('Insert failed') }),
      } as any);

      const result = await migrateFacilities('user-123', 'org-123');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('migrateFavorites', () => {
    it('should migrate favorites', async () => {
      localStorage.setItem(
        'favorites-store',
        JSON.stringify({
          state: { favorites: ['fac-1', 'fac-2', 'fac-3'] },
        })
      );

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await migrateFavorites('user-123');

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(3);
    });

    it('should skip existing favorites', async () => {
      localStorage.setItem(
        'favorites-store',
        JSON.stringify({
          state: { favorites: ['fac-1', 'fac-2'] },
        })
      );

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ facility_id: 'fac-1' }],
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const result = await migrateFavorites('user-123');

      expect(result.skipped).toBe(1);
      expect(result.migratedCount).toBe(1);
    });
  });
});
```

---

## Integration Testing

### Testing Services with Real Supabase

#### File: `tests/integration/services/facilities.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFacilities,
  useCreateFacility,
  useUpdateFacility,
  useDeleteFacility,
} from '@/services/supabase';
import { supabase } from '@/lib/supabase';
import { faker } from '@faker-js/faker';

describe('Facilities Service Integration', () => {
  let queryClient: QueryClient;
  let testOrgId: string;
  let createdFacilityIds: string[] = [];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    testOrgId = 'test-org-integration';
  });

  afterEach(async () => {
    // Cleanup created facilities
    for (const id of createdFacilityIds) {
      await supabase.from('facilities').delete().eq('id', id);
    }
    createdFacilityIds = [];
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create and fetch facilities', async () => {
    const { result: createResult } = renderHook(() => useCreateFacility(), { wrapper });

    const newFacility = {
      org_id: testOrgId,
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      address: faker.location.streetAddress(true),
      type: 'sports',
      status: 'published',
      capacity: 50,
      price_per_hour: 500,
      amenities: ['WiFi', 'Parking'],
      images: [],
    };

    // Create facility
    createResult.current.mutate(newFacility);

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
    });

    const createdFacility = createResult.current.data!;
    createdFacilityIds.push(createdFacility.id);

    // Fetch facilities
    const { result: fetchResult } = renderHook(() => useFacilities(testOrgId), { wrapper });

    await waitFor(() => {
      expect(fetchResult.current.isSuccess).toBe(true);
    });

    expect(fetchResult.current.data).toContainEqual(
      expect.objectContaining({
        id: createdFacility.id,
        name: newFacility.name,
      })
    );
  });

  it('should update facility', async () => {
    // Create facility first
    const { data: facility } = await supabase
      .from('facilities')
      .insert({
        org_id: testOrgId,
        name: 'Original Name',
        address: '123 Test St',
        type: 'sports',
        status: 'published',
        capacity: 50,
        price_per_hour: 500,
      })
      .select()
      .single();

    createdFacilityIds.push(facility!.id);

    // Update facility
    const { result: updateResult } = renderHook(() => useUpdateFacility(), { wrapper });

    updateResult.current.mutate({
      id: facility!.id,
      updates: { name: 'Updated Name' },
    });

    await waitFor(() => {
      expect(updateResult.current.isSuccess).toBe(true);
    });

    // Verify update
    const { data: updated } = await supabase
      .from('facilities')
      .select()
      .eq('id', facility!.id)
      .single();

    expect(updated?.name).toBe('Updated Name');
  });

  it('should delete facility', async () => {
    // Create facility
    const { data: facility } = await supabase
      .from('facilities')
      .insert({
        org_id: testOrgId,
        name: 'To Delete',
        address: '123 Test St',
        type: 'sports',
        status: 'published',
        capacity: 50,
        price_per_hour: 500,
      })
      .select()
      .single();

    // Delete facility
    const { result: deleteResult } = renderHook(() => useDeleteFacility(), { wrapper });

    deleteResult.current.mutate(facility!.id);

    await waitFor(() => {
      expect(deleteResult.current.isSuccess).toBe(true);
    });

    // Verify deletion (soft delete - status changed)
    const { data: deleted } = await supabase
      .from('facilities')
      .select()
      .eq('id', facility!.id)
      .single();

    expect(deleted?.status).toBe('deleted');
  });

  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useCreateFacility(), { wrapper });

    // Try to create with invalid data
    result.current.mutate({
      org_id: testOrgId,
      // Missing required fields
    } as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

### Testing Real-time Hooks

#### File: `tests/integration/hooks/useRealtimeBookings.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFacilityBookings } from '@/services/supabase';
import { useRealtimeBookings } from '@/hooks';
import { supabase } from '@/lib/supabase';

describe('useRealtimeBookings Integration', () => {
  let queryClient: QueryClient;
  let testFacilityId: string;
  let createdBookingIds: string[] = [];

  beforeEach(async () => {
    queryClient = new QueryClient();

    // Create test facility
    const { data: facility } = await supabase
      .from('facilities')
      .insert({
        org_id: 'test-org',
        name: 'Realtime Test Facility',
        address: '123 Test St',
        type: 'sports',
        status: 'published',
        capacity: 50,
        price_per_hour: 500,
      })
      .select()
      .single();

    testFacilityId = facility!.id;
  });

  afterEach(async () => {
    // Cleanup
    for (const id of createdBookingIds) {
      await supabase.from('bookings').delete().eq('id', id);
    }
    await supabase.from('facilities').delete().eq('id', testFacilityId);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should receive real-time booking updates', async () => {
    // Render hooks
    const { result: bookingsResult } = renderHook(
      () => useFacilityBookings(testFacilityId),
      { wrapper }
    );

    const { result: realtimeResult } = renderHook(
      () => useRealtimeBookings(testFacilityId),
      { wrapper }
    );

    // Wait for initial data
    await waitFor(() => {
      expect(bookingsResult.current.isSuccess).toBe(true);
    });

    const initialCount = bookingsResult.current.data?.length || 0;

    // Create new booking (simulates real-time event)
    const { data: newBooking } = await supabase
      .from('bookings')
      .insert({
        facility_id: testFacilityId,
        user_id: 'test-user',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        total_price: 1000,
      })
      .select()
      .single();

    createdBookingIds.push(newBooking!.id);

    // Wait for real-time update
    await waitFor(
      () => {
        const currentCount = bookingsResult.current.data?.length || 0;
        expect(currentCount).toBe(initialCount + 1);
      },
      { timeout: 5000 }
    );

    // Verify new booking in data
    expect(bookingsResult.current.data).toContainEqual(
      expect.objectContaining({
        id: newBooking!.id,
      })
    );
  });
});
```

---

## Running Tests

### Run Unit Tests

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run specific test file
npx vitest tests/unit/services/facilities.test.ts

# Run in watch mode
npx vitest --watch

# Run with coverage
npm run test:coverage
```

### Run Integration Tests

```bash
# Run integration tests (requires Supabase running)
npx vitest tests/integration

# Run specific integration test
npx vitest tests/integration/services/facilities.test.ts
```

### Run All Tests

```bash
# Run unit, integration, and E2E tests
npm run test:all
```

---

## Test Coverage Goals

```
Overall Coverage: 80%+

By Category:
- Services:    90%+ (high business logic)
- Components:  80%+ (UI coverage)
- Utilities:   90%+ (pure functions)
- Hooks:       85%+ (integration critical)
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation
it('should call useState', () => {
  const spy = vi.spyOn(React, 'useState');
  render(<Component />);
  expect(spy).toHaveBeenCalled();
});

// ✅ Good - Testing behavior
it('should update count when button clicked', () => {
  render(<Component />);
  fireEvent.click(screen.getByText('Increment'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Use Data Test IDs

```typescript
// In component
<button data-testid="submit-button">Submit</button>

// In test
screen.getByTestId('submit-button');
```

### 3. Mock External Dependencies

```typescript
// Mock Supabase
vi.mock('@/lib/supabase');

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup(); // React Testing Library
  vi.clearAllMocks(); // Vitest
});
```

### 5. Test Edge Cases

```typescript
it('should handle empty results', () => {
  // Test with empty array
});

it('should handle errors gracefully', () => {
  // Test error scenarios
});

it('should handle loading states', () => {
  // Test loading indicators
});
```

---

**Created:** 2025-10-26
**Version:** 1.0.0
**Coverage Goal:** 80%+
**Test Types:** Unit, Integration, E2E
