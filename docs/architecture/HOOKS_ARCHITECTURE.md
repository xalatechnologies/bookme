# 🎣 Hooks Architecture & Patterns

Complete guide for implementing custom hooks with Supabase and React Query.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Hook Patterns](#hook-patterns)
3. [Custom Hook Examples](#custom-hook-examples)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Performance Optimization](#performance-optimization)

## 🏗️ Architecture Overview

### Data Flow

```
Supabase Database
    ↓
Service Layer (services/supabase/*.service.ts)
    ↓
React Query Hooks (useQuery, useMutation)
    ↓
Custom Business Logic Hooks (hooks/*.ts)
    ↓
Components (Pure UI)
```

### Hook Hierarchy

```
Level 1: React Query Hooks (from services)
├── useFacilities()
├── useFacility(id)
├── useCreateFacility()
└── useUpdateFacility()

Level 2: Business Logic Hooks (custom)
├── useFacilityFilters()
├── useFacilitySearch()
├── useFacilityAvailability()
└── useFacilityBooking()

Level 3: Component-Specific Hooks
├── useFacilityListPage()
├── useFacilityDetailPage()
└── useBookingFormState()
```

## 🎯 Hook Patterns

### Pattern 1: Data Fetching Hook

**Purpose:** Fetch data from Supabase via React Query

```typescript
// services/supabase/facilities.service.ts
export function useFacilities(orgId: string, enabled = true) {
  return useQuery({
    queryKey: ['facilities', 'list', orgId],
    queryFn: () => facilitiesService.getAll(orgId),
    enabled: !!orgId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Usage:**
```typescript
function FacilitiesList() {
  const { data: facilities, isLoading, error } = useFacilities('org-id');

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <div>{facilities.map(f => <FacilityCard key={f.id} facility={f} />)}</div>;
}
```

### Pattern 2: Filtering & Sorting Hook

**Purpose:** Apply business logic to fetched data

```typescript
// hooks/useFacilityFilters.ts
export interface FacilityFilters {
  type?: string;
  minCapacity?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'name' | 'price-asc' | 'price-desc' | 'rating';
}

export function useFacilityFilters(
  facilities: Facility[] | undefined,
  filters: FacilityFilters
) {
  return useMemo(() => {
    if (!facilities) return [];

    let result = [...facilities];

    // Type filter
    if (filters.type) {
      result = result.filter(f => f.type === filters.type);
    }

    // Capacity filter
    if (filters.minCapacity) {
      result = result.filter(f => f.capacity >= filters.minCapacity);
    }

    // Price filter
    if (filters.maxPrice) {
      result = result.filter(f => f.price_per_hour <= filters.maxPrice);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        f =>
          f.name.toLowerCase().includes(searchLower) ||
          f.description.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price_per_hour - b.price_per_hour);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price_per_hour - a.price_per_hour);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [facilities, filters]);
}
```

**Usage:**
```typescript
function FacilitiesPage() {
  const [filters, setFilters] = useState<FacilityFilters>({});
  const { data: facilities, isLoading } = useFacilities('org-id');
  const filteredFacilities = useFacilityFilters(facilities, filters);

  return (
    <div>
      <FacilityFilters filters={filters} onChange={setFilters} />
      <FacilityList facilities={filteredFacilities} isLoading={isLoading} />
    </div>
  );
}
```

### Pattern 3: Composite Hook (Page-Level)

**Purpose:** Combine multiple hooks for a complete page

```typescript
// hooks/useFacilityListPage.ts
export function useFacilityListPage(orgId: string) {
  // State
  const [filters, setFilters] = useState<FacilityFilters>({});
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');

  // Data fetching
  const {
    data: allFacilities,
    isLoading,
    error,
  } = useFacilities(orgId);

  // Filtering
  const facilities = useFacilityFilters(allFacilities, filters);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const paginatedFacilities = useMemo(() => {
    const start = (page - 1) * pageSize;
    return facilities.slice(start, start + pageSize);
  }, [facilities, page]);

  // Favorites
  const favoriteIds = useFavoriteIds(orgId);
  const facilitiesWithFavorites = useMemo(() => {
    return paginatedFacilities.map(f => ({
      ...f,
      isFavorite: favoriteIds.has(f.id),
    }));
  }, [paginatedFacilities, favoriteIds]);

  // Actions
  const handleFilterChange = useCallback((newFilters: Partial<FacilityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page
  }, []);

  const handleViewChange = useCallback((newView: typeof view) => {
    setView(newView);
  }, []);

  return {
    // Data
    facilities: facilitiesWithFavorites,
    totalCount: facilities.length,
    isLoading,
    error,

    // State
    filters,
    view,
    page,
    pageSize,
    totalPages: Math.ceil(facilities.length / pageSize),

    // Actions
    setFilters: handleFilterChange,
    setView: handleViewChange,
    setPage,
  };
}
```

**Usage:**
```typescript
function FacilitiesPage() {
  const {
    facilities,
    totalCount,
    isLoading,
    filters,
    view,
    page,
    totalPages,
    setFilters,
    setView,
    setPage,
  } = useFacilityListPage('org-id');

  return (
    <div>
      <PageHeader title="Facilities" count={totalCount} />
      <FacilityFilters filters={filters} onChange={setFilters} />
      <ViewToggle view={view} onChange={setView} />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <FacilityList facilities={facilities} view={view} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
```

### Pattern 4: Form State Hook

**Purpose:** Manage complex form state with validation

```typescript
// hooks/useBookingForm.ts
export interface BookingFormData {
  facilityId: string;
  zoneId?: string;
  startTime: string;
  endTime: string;
  additionalServices: string[];
  notes?: string;
}

export function useBookingForm(facilityId: string) {
  const [formData, setFormData] = useState<BookingFormData>({
    facilityId,
    startTime: '',
    endTime: '',
    additionalServices: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  // Fetch facility for validation
  const { data: facility } = useFacility(facilityId);

  // Check availability
  const { data: isAvailable, isLoading: checkingAvailability } = useQuery({
    queryKey: ['availability', facilityId, formData.startTime, formData.endTime],
    queryFn: () =>
      bookingsService.checkAvailability(
        facilityId,
        formData.startTime,
        formData.endTime
      ),
    enabled: !!formData.startTime && !!formData.endTime,
  });

  // Calculate price
  const totalPrice = useMemo(() => {
    if (!facility || !formData.startTime || !formData.endTime) return 0;

    const hours = calculateHours(formData.startTime, formData.endTime);
    let price = facility.price_per_hour * hours;

    // Add zone adjustment
    if (formData.zoneId) {
      const zone = facility.zones?.find(z => z.id === formData.zoneId);
      if (zone) price += zone.price_adjustment;
    }

    // Add services
    formData.additionalServices.forEach(serviceId => {
      const service = facility.services?.find(s => s.id === serviceId);
      if (service) price += service.price;
    });

    return price;
  }, [facility, formData]);

  // Validation
  const validate = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!isAvailable && formData.startTime && formData.endTime) {
      newErrors.startTime = 'This time slot is not available';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAvailable]);

  // Submit
  const createBooking = useCreateBooking();

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      await createBooking.mutateAsync({
        facility_id: formData.facilityId,
        zone_id: formData.zoneId,
        start_time: formData.startTime,
        end_time: formData.endTime,
        total_price: totalPrice,
        status: 'pending',
      });
    } catch (error) {
      console.error('Booking failed:', error);
      throw error;
    }
  }, [formData, totalPrice, validate, createBooking]);

  return {
    formData,
    setFormData,
    errors,
    totalPrice,
    isAvailable,
    checkingAvailability,
    isSubmitting: createBooking.isPending,
    handleSubmit,
  };
}
```

**Usage:**
```typescript
function BookingForm({ facilityId }: { facilityId: string }) {
  const {
    formData,
    setFormData,
    errors,
    totalPrice,
    isAvailable,
    handleSubmit,
  } = useBookingForm(facilityId);

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <DateTimePicker
        value={formData.startTime}
        onChange={time => setFormData(prev => ({ ...prev, startTime: time }))}
        error={errors.startTime}
      />

      <DateTimePicker
        value={formData.endTime}
        onChange={time => setFormData(prev => ({ ...prev, endTime: time }))}
        error={errors.endTime}
      />

      <PriceDisplay amount={totalPrice} />

      {!isAvailable && <Alert>Time slot not available</Alert>}

      <Button type="submit">Book Now</Button>
    </form>
  );
}
```

### Pattern 5: Real-time Hook

**Purpose:** Subscribe to real-time updates

```typescript
// hooks/useRealtimeBookings.ts
export function useRealtimeBookings(facilityId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`facility-${facilityId}-bookings`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `facility_id=eq.${facilityId}`,
        },
        (payload) => {
          // Invalidate queries to refetch
          queryClient.invalidateQueries({
            queryKey: ['bookings', 'facility', facilityId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [facilityId, queryClient]);
}
```

**Usage:**
```typescript
function FacilityCalendar({ facilityId }: { facilityId: string }) {
  const { data: bookings } = useFacilityBookings(facilityId);
  useRealtimeBookings(facilityId); // Auto-updates when bookings change

  return <Calendar bookings={bookings} />;
}
```

## 🎭 State Management

### Server State (React Query)

Use for data from Supabase:
- Facilities
- Bookings
- Users
- Messages
- Notifications

### Client State (useState/useReducer)

Use for UI state:
- Form inputs
- Modal open/close
- Filter selections
- Current page/tab

### Transient State (Zustand - Keep These)

Use for shopping cart and booking flow:
- `cartStore` - Items being added to booking
- `slotSelectionStore` - Selected time slots during booking

## 🚨 Error Handling

### Pattern: Centralized Error Hook

```typescript
// hooks/useErrorHandler.ts
export function useErrorHandler() {
  const { toast } = useToast();

  return useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context}:`, error);

    const message = error instanceof Error
      ? error.message
      : 'An unexpected error occurred';

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);
}
```

**Usage:**
```typescript
function Component() {
  const handleError = useErrorHandler();
  const { data, error } = useFacilities('org-id');

  useEffect(() => {
    if (error) {
      handleError(error, 'fetching facilities');
    }
  }, [error, handleError]);

  // ...
}
```

## ⚡ Performance Optimization

### 1. Memoization

```typescript
// ✅ GOOD: Memoize expensive computations
const filteredData = useMemo(() => {
  return data?.filter(item => item.active);
}, [data]);

// ❌ BAD: Filtering on every render
const filteredData = data?.filter(item => item.active);
```

### 2. Callback Optimization

```typescript
// ✅ GOOD: Stable callback reference
const handleClick = useCallback((id: string) => {
  console.log('Clicked:', id);
}, []);

// ❌ BAD: New function on every render
const handleClick = (id: string) => {
  console.log('Clicked:', id);
};
```

### 3. Query Optimization

```typescript
// ✅ GOOD: Disable when not needed
const { data } = useFacility(facilityId, {
  enabled: !!facilityId && isModalOpen,
});

// ❌ BAD: Always fetching
const { data } = useFacility(facilityId);
```

### 4. Pagination

```typescript
// ✅ GOOD: Paginate large lists
function usePaginatedFacilities(orgId: string, page: number, pageSize = 12) {
  return useQuery({
    queryKey: ['facilities', orgId, 'page', page],
    queryFn: () => facilitiesService.getPaginated(orgId, page, pageSize),
  });
}

// ❌ BAD: Fetch all and paginate client-side
const { data } = useFacilities(orgId);
const paginated = data?.slice(page * pageSize, (page + 1) * pageSize);
```

## 📦 Hook Organization

```
src/
├── hooks/
│   ├── facilities/
│   │   ├── useFacilityFilters.ts
│   │   ├── useFacilitySearch.ts
│   │   ├── useFacilityAvailability.ts
│   │   └── useFacilityListPage.ts
│   ├── bookings/
│   │   ├── useBookingForm.ts
│   │   ├── useBookingValidation.ts
│   │   └── useBookingPrice.ts
│   ├── shared/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useErrorHandler.ts
│   └── index.ts
```

## ✅ Best Practices

1. **One Responsibility** - Each hook should do one thing well
2. **Descriptive Names** - Name hooks after what they do
3. **Return Objects** - Return objects, not arrays (easier to extend)
4. **Document Parameters** - Add JSDoc comments
5. **Handle Loading/Error** - Always provide loading and error states
6. **Optimize Dependencies** - Minimize useEffect/useMemo dependencies
7. **Test Hooks** - Write unit tests for complex hooks
8. **Type Safety** - Use TypeScript for all hooks

## 🎯 Migration Checklist

- [ ] Create custom hooks for each feature
- [ ] Extract business logic from components
- [ ] Use React Query for all server state
- [ ] Keep only transient state in Zustand
- [ ] Add error handling to all hooks
- [ ] Add loading states to all data hooks
- [ ] Memoize expensive computations
- [ ] Test hooks in isolation
- [ ] Document hook APIs
- [ ] Update components to use new hooks

## 🔄 Migration Examples by Feature

### Example 1: Facilities Feature

**Current Structure (Before):**
```typescript
// facilityStore.ts - DELETE THIS
export const useFacilityStore = create<FacilityState>((set) => ({
  facilities: [],
  fetchFacilities: async () => {
    const data = await fetchFromSupabase();
    set({ facilities: data });
  },
}));
```

**New Structure (After):**
```typescript
// services/supabase/facilities.service.ts - KEEP THIS
export const useFacilities = (orgId: string) => {
  return useQuery({
    queryKey: ['facilities', orgId],
    queryFn: () => facilitiesService.getAll(orgId),
  });
};

// hooks/facilities/useFacilityFilters.ts - ADD THIS
export const useFacilityFilters = (facilities, filters) => {
  return useMemo(() => {
    // Business logic here
  }, [facilities, filters]);
};

// hooks/facilities/useFacilityListPage.ts - ADD THIS
export const useFacilityListPage = (orgId: string) => {
  const { data: facilities } = useFacilities(orgId);
  const [filters, setFilters] = useState({});
  const filtered = useFacilityFilters(facilities, filters);

  return { facilities: filtered, filters, setFilters };
};
```

### Example 2: Bookings Feature

**Current Structure (Before):**
```typescript
// Multiple concerns in component
function BookingPage() {
  const [facilities, setFacilities] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    // Fetch facilities
    // Calculate price
    // Check availability
  }, []);

  return <div>{/* Complex UI */}</div>;
}
```

**New Structure (After):**
```typescript
// hooks/bookings/useBookingForm.ts
export const useBookingForm = (facilityId: string) => {
  const [formData, setFormData] = useState({});
  const { data: isAvailable } = useAvailability(facilityId, formData);
  const totalPrice = useBookingPrice(facilityId, formData);

  return { formData, setFormData, isAvailable, totalPrice };
};

// Component becomes simple
function BookingPage() {
  const { formData, setFormData, isAvailable, totalPrice } = useBookingForm(facilityId);

  return <BookingForm
    formData={formData}
    onChange={setFormData}
    price={totalPrice}
    isAvailable={isAvailable}
  />;
}
```

## 📚 Hook Testing Examples

### Testing Data Fetching Hooks

```typescript
// hooks/__tests__/useFacilities.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFacilities } from '../useFacilities';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

test('fetches facilities successfully', async () => {
  const { result } = renderHook(() => useFacilities('org-id'), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
  expect(result.current.data.length).toBeGreaterThan(0);
});
```

### Testing Business Logic Hooks

```typescript
// hooks/__tests__/useFacilityFilters.test.ts
import { renderHook } from '@testing-library/react';
import { useFacilityFilters } from '../useFacilityFilters';

test('filters facilities by type', () => {
  const facilities = [
    { id: '1', type: 'sports', price_per_hour: 100 },
    { id: '2', type: 'conference', price_per_hour: 200 },
  ];

  const { result } = renderHook(() =>
    useFacilityFilters(facilities, { type: 'sports' })
  );

  expect(result.current).toHaveLength(1);
  expect(result.current[0].type).toBe('sports');
});

test('filters by price range', () => {
  const facilities = [
    { id: '1', type: 'sports', price_per_hour: 100 },
    { id: '2', type: 'conference', price_per_hour: 200 },
  ];

  const { result } = renderHook(() =>
    useFacilityFilters(facilities, { maxPrice: 150 })
  );

  expect(result.current).toHaveLength(1);
  expect(result.current[0].price_per_hour).toBe(100);
});
```

---

**Next:** [Component Refactoring Patterns](./COMPONENT_REFACTORING_PATTERNS.md)
