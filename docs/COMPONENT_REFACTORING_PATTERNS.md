# 🎨 Component Refactoring Patterns

Complete guide for refactoring BookMe components to separate UI from business logic.

## 📋 Table of Contents

1. [Refactoring Principles](#refactoring-principles)
2. [Component Analysis](#component-analysis)
3. [Step-by-Step Refactoring](#step-by-step-refactoring)
4. [Real Examples from BookMe](#real-examples-from-bookme)
5. [Testing After Refactoring](#testing-after-refactoring)
6. [Common Pitfalls](#common-pitfalls)

## 🎯 Refactoring Principles

### The Golden Rule

**Components should ONLY contain:**
- JSX rendering logic
- Event handler delegation
- UI state (modals, dropdowns, etc.)

**Components should NEVER contain:**
- Data fetching logic
- Business rules
- Complex calculations
- Data transformations
- State management beyond UI

### Before vs After

```typescript
// ❌ BAD: Business logic in component
function FacilityList() {
  const [facilities, setFacilities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ type: '', maxPrice: 0 });

  useEffect(() => {
    // Fetch from Zustand store
    const data = useFacilityStore.getState().facilities;
    setFacilities(data);
  }, []);

  useEffect(() => {
    // Business logic: filtering
    let result = facilities;
    if (filters.type) {
      result = result.filter(f => f.type === filters.type);
    }
    if (filters.maxPrice) {
      result = result.filter(f => f.price_per_hour <= filters.maxPrice);
    }
    result.sort((a, b) => a.price_per_hour - b.price_per_hour);
    setFiltered(result);
  }, [facilities, filters]);

  return (
    <div>
      {/* 100+ lines of JSX */}
    </div>
  );
}

// ✅ GOOD: Pure UI component
function FacilityList() {
  const {
    facilities,
    filters,
    setFilters,
    isLoading
  } = useFacilityListPage('org-id');

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <FacilityFilters filters={filters} onChange={setFilters} />
      <FacilityGrid facilities={facilities} />
    </div>
  );
}
```

## 📊 Component Analysis

### Current BookMe Components (Need Refactoring)

| Component | Lines | Business Logic | Priority |
|-----------|-------|----------------|----------|
| `Bookings.tsx` | 150+ | Heavy | High |
| `UserDashboard.tsx` | 120+ | Heavy | High |
| `FacilitiesPage.tsx` | 100+ | Medium | High |
| `Messages.tsx` | 90+ | Medium | Medium |
| `Support.tsx` | 80+ | Medium | Medium |
| `Notifications.tsx` | 70+ | Light | Low |

### Refactoring Roadmap

**Week 1-2: Core Features**
- [ ] FacilitiesPage.tsx → Extract facility filtering/sorting
- [ ] Bookings.tsx → Extract booking logic and validation

**Week 3-4: User Features**
- [ ] UserDashboard.tsx → Extract dashboard data aggregation
- [ ] Messages.tsx → Extract message handling and real-time logic

**Week 5-6: Support Features**
- [ ] Support.tsx → Extract ticket management
- [ ] Notifications.tsx → Extract notification handling

## 🔧 Step-by-Step Refactoring

### Step 1: Identify Business Logic

Look for these patterns in components:

```typescript
// ❌ Business logic indicators:
useEffect(() => {
  // Data fetching
  // Calculations
  // Transformations
}, [dependencies]);

const filteredData = data.filter(/* complex logic */);
const sortedData = data.sort(/* sorting logic */);
const calculatedValue = /* complex calculation */;
```

### Step 2: Extract to Custom Hook

Move business logic to a dedicated hook:

```typescript
// hooks/facilities/useFacilityListPage.ts
export function useFacilityListPage(orgId: string) {
  // All business logic here
  const { data: facilities, isLoading } = useFacilities(orgId);
  const [filters, setFilters] = useState<FacilityFilters>({});
  const filtered = useFacilityFilters(facilities, filters);

  return {
    facilities: filtered,
    filters,
    setFilters,
    isLoading,
  };
}
```

### Step 3: Simplify Component

Component becomes pure UI:

```typescript
// pages/FacilitiesPage.tsx
export function FacilitiesPage() {
  const { facilities, filters, setFilters, isLoading } = useFacilityListPage('org-id');

  return (
    <PageLayout>
      <FacilityFilters filters={filters} onChange={setFilters} />
      {isLoading ? <Loading /> : <FacilityGrid facilities={facilities} />}
    </PageLayout>
  );
}
```

### Step 4: Test Both Layers

```typescript
// Test the hook
test('useFacilityListPage filters correctly', () => {
  const { result } = renderHook(() => useFacilityListPage('org-id'));
  // Test business logic
});

// Test the component
test('FacilitiesPage renders correctly', () => {
  render(<FacilitiesPage />);
  // Test UI rendering
});
```

## 💼 Real Examples from BookMe

### Example 1: Facilities Page Refactoring

**Current Structure (Before):**

```typescript
// src/pages/FacilitiesPage.tsx - BEFORE
import { useState, useEffect } from 'react';
import { useFacilityStore } from '@/stores/facilityStore';

export function FacilitiesPage() {
  const facilities = useFacilityStore(state => state.facilities);
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const [filters, setFilters] = useState({
    type: '',
    minCapacity: 0,
    maxPrice: 0,
    search: '',
    sort: 'name',
  });
  const [filteredFacilities, setFilteredFacilities] = useState(facilities);

  // ❌ Business logic in component
  useEffect(() => {
    let result = [...facilities];

    // Type filter
    if (filters.type) {
      result = result.filter(f => f.type === filters.type);
    }

    // Capacity filter
    if (filters.minCapacity > 0) {
      result = result.filter(f => f.capacity >= filters.minCapacity);
    }

    // Price filter
    if (filters.maxPrice > 0) {
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

    setFilteredFacilities(result);
  }, [facilities, filters]);

  return (
    <div className="container mx-auto p-6">
      {/* 100+ lines of JSX */}
    </div>
  );
}
```

**Refactored Structure (After):**

```typescript
// hooks/facilities/useFacilityListPage.ts - NEW
import { useState, useMemo } from 'react';
import { useFacilities } from '@/services/supabase/facilities.service';
import { useFacilityFilters } from './useFacilityFilters';

export interface FacilityListPageState {
  facilities: Facility[];
  filters: FacilityFilters;
  view: 'grid' | 'list' | 'map';
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  setFilters: (filters: FacilityFilters) => void;
  setView: (view: 'grid' | 'list' | 'map') => void;
}

export function useFacilityListPage(orgId: string): FacilityListPageState {
  // Server state
  const { data: allFacilities, isLoading, error } = useFacilities(orgId);

  // UI state
  const [filters, setFilters] = useState<FacilityFilters>({
    type: '',
    minCapacity: 0,
    maxPrice: 0,
    search: '',
    sort: 'name',
  });
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');

  // Business logic
  const facilities = useFacilityFilters(allFacilities, filters);

  return {
    facilities,
    filters,
    view,
    isLoading,
    error,
    totalCount: allFacilities?.length || 0,
    setFilters,
    setView,
  };
}

// hooks/facilities/useFacilityFilters.ts - NEW
import { useMemo } from 'react';
import type { Facility, FacilityFilters } from '@/types/database';

export function useFacilityFilters(
  facilities: Facility[] | undefined,
  filters: FacilityFilters
): Facility[] {
  return useMemo(() => {
    if (!facilities) return [];

    let result = [...facilities];

    // Type filter
    if (filters.type) {
      result = result.filter(f => f.type === filters.type);
    }

    // Capacity filter
    if (filters.minCapacity > 0) {
      result = result.filter(f => f.capacity >= filters.minCapacity);
    }

    // Price filter
    if (filters.maxPrice > 0) {
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

// pages/FacilitiesPage.tsx - AFTER (SIMPLIFIED)
import { useFacilityListPage } from '@/hooks/facilities/useFacilityListPage';
import { FacilityFilters } from '@/components/facilities/FacilityFilters';
import { FacilityGrid } from '@/components/facilities/FacilityGrid';
import { FacilityList } from '@/components/facilities/FacilityList';
import { FacilityMap } from '@/components/facilities/FacilityMap';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function FacilitiesPage() {
  const {
    facilities,
    filters,
    view,
    isLoading,
    error,
    totalCount,
    setFilters,
    setView,
  } = useFacilityListPage('org-drammen-001');

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Facilities ({totalCount})</h1>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <FacilityFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {view === 'grid' && <FacilityGrid facilities={facilities} />}
          {view === 'list' && <FacilityList facilities={facilities} />}
          {view === 'map' && <FacilityMap facilities={facilities} />}
        </>
      )}
    </div>
  );
}
```

**Benefits:**
- ✅ Component reduced from 150+ to 40 lines
- ✅ Business logic extracted to testable hook
- ✅ Easy to add new filters without touching component
- ✅ Reusable hook for other pages
- ✅ Clear separation of concerns

### Example 2: Bookings Page Refactoring

**Current Structure (Before):**

```typescript
// src/pages/Bookings.tsx - BEFORE
import { useState, useEffect } from 'react';
import { useBookingStore } from '@/stores/bookingStore';
import { useFacilityStore } from '@/stores/facilityStore';

export function Bookings() {
  const bookings = useBookingStore(state => state.bookings);
  const facilities = useFacilityStore(state => state.facilities);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', dateRange: 'all' });
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });

  // ❌ Complex business logic in component
  useEffect(() => {
    let result = bookings;

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(b => b.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      result = result.filter(b => {
        const bookingDate = new Date(b.start_time);
        switch (filters.dateRange) {
          case 'today':
            return bookingDate.toDateString() === now.toDateString();
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= now && bookingDate <= weekFromNow;
          case 'month':
            return bookingDate.getMonth() === now.getMonth();
        }
      });
    }

    setFilteredBookings(result);
  }, [bookings, filters]);

  // ❌ More business logic
  useEffect(() => {
    const now = new Date();
    const stats = {
      total: bookings.length,
      upcoming: bookings.filter(b => new Date(b.start_time) > now).length,
      completed: bookings.filter(b => b.status === 'completed').length,
    };
    setStats(stats);
  }, [bookings]);

  return (
    <div className="container mx-auto p-6">
      {/* 150+ lines of JSX */}
    </div>
  );
}
```

**Refactored Structure (After):**

```typescript
// hooks/bookings/useBookingListPage.ts - NEW
import { useState, useMemo } from 'react';
import { useBookings } from '@/services/supabase/bookings.service';
import { useBookingFilters } from './useBookingFilters';
import { useBookingStats } from './useBookingStats';

export interface BookingListPageState {
  bookings: Booking[];
  stats: BookingStats;
  filters: BookingFilters;
  selectedBooking: Booking | null;
  isLoading: boolean;
  setFilters: (filters: BookingFilters) => void;
  setSelectedBooking: (booking: Booking | null) => void;
}

export function useBookingListPage(userId: string): BookingListPageState {
  // Server state
  const { data: allBookings, isLoading } = useBookings(userId);

  // UI state
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    dateRange: 'all',
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Business logic
  const bookings = useBookingFilters(allBookings, filters);
  const stats = useBookingStats(allBookings);

  return {
    bookings,
    stats,
    filters,
    selectedBooking,
    isLoading,
    setFilters,
    setSelectedBooking,
  };
}

// hooks/bookings/useBookingFilters.ts - NEW
import { useMemo } from 'react';
import type { Booking, BookingFilters } from '@/types/database';

export function useBookingFilters(
  bookings: Booking[] | undefined,
  filters: BookingFilters
): Booking[] {
  return useMemo(() => {
    if (!bookings) return [];

    let result = [...bookings];

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(b => b.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      result = result.filter(b => {
        const bookingDate = new Date(b.start_time);
        switch (filters.dateRange) {
          case 'today':
            return bookingDate.toDateString() === now.toDateString();
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= now && bookingDate <= weekFromNow;
          case 'month':
            return bookingDate.getMonth() === now.getMonth();
          default:
            return true;
        }
      });
    }

    return result;
  }, [bookings, filters]);
}

// hooks/bookings/useBookingStats.ts - NEW
import { useMemo } from 'react';
import type { Booking } from '@/types/database';

export interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

export function useBookingStats(bookings: Booking[] | undefined): BookingStats {
  return useMemo(() => {
    if (!bookings) {
      return { total: 0, upcoming: 0, completed: 0, cancelled: 0, revenue: 0 };
    }

    const now = new Date();

    return {
      total: bookings.length,
      upcoming: bookings.filter(b => new Date(b.start_time) > now).length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      revenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_price, 0),
    };
  }, [bookings]);
}

// pages/Bookings.tsx - AFTER (SIMPLIFIED)
import { useBookingListPage } from '@/hooks/bookings/useBookingListPage';
import { BookingFilters } from '@/components/bookings/BookingFilters';
import { BookingList } from '@/components/bookings/BookingList';
import { BookingStats } from '@/components/bookings/BookingStats';
import { BookingDetail } from '@/components/bookings/BookingDetail';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function Bookings() {
  const {
    bookings,
    stats,
    filters,
    selectedBooking,
    isLoading,
    setFilters,
    setSelectedBooking,
  } = useBookingListPage('user-id');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <BookingStats stats={stats} />
      <BookingFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <BookingList
          bookings={bookings}
          onSelect={setSelectedBooking}
        />
      )}

      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
```

**Benefits:**
- ✅ Component reduced from 150+ to 35 lines
- ✅ Statistics calculation extracted to reusable hook
- ✅ Filter logic extracted and testable
- ✅ Easy to add new statistics
- ✅ Can use stats hook in dashboard too

### Example 3: User Dashboard Refactoring

**Current Structure (Before):**

```typescript
// src/pages/UserDashboard.tsx - BEFORE
export function UserDashboard() {
  const bookings = useBookingStore(state => state.bookings);
  const favorites = useFavoriteStore(state => state.favorites);
  const notifications = useNotificationStore(state => state.notifications);

  // ❌ Complex aggregation logic
  const [dashboardData, setDashboardData] = useState({
    upcomingBookings: [],
    recentActivity: [],
    stats: {},
  });

  useEffect(() => {
    // Complex data aggregation
    const now = new Date();
    const upcoming = bookings.filter(b => new Date(b.start_time) > now);
    const recent = [...bookings, ...notifications]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    setDashboardData({
      upcomingBookings: upcoming,
      recentActivity: recent,
      stats: {
        totalBookings: bookings.length,
        totalFavorites: favorites.length,
        unreadNotifications: notifications.filter(n => !n.read).length,
      },
    });
  }, [bookings, favorites, notifications]);

  return <div>{/* Complex JSX */}</div>;
}
```

**Refactored Structure (After):**

```typescript
// hooks/dashboard/useUserDashboard.ts - NEW
export function useUserDashboard(userId: string) {
  const { data: bookings } = useBookings(userId);
  const { data: favorites } = useFavorites(userId);
  const { data: notifications } = useNotifications(userId);

  const upcomingBookings = useUpcomingBookings(bookings);
  const recentActivity = useRecentActivity(bookings, notifications);
  const stats = useDashboardStats(bookings, favorites, notifications);

  return {
    upcomingBookings,
    recentActivity,
    stats,
    isLoading: !bookings || !favorites || !notifications,
  };
}

// pages/UserDashboard.tsx - AFTER
export function UserDashboard() {
  const { upcomingBookings, recentActivity, stats, isLoading } = useUserDashboard('user-id');

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardStats stats={stats} />
      <UpcomingBookings bookings={upcomingBookings} />
      <RecentActivity activities={recentActivity} />
    </div>
  );
}
```

## 🧪 Testing After Refactoring

### Testing Hooks

```typescript
// hooks/__tests__/useFacilityFilters.test.ts
import { renderHook } from '@testing-library/react';
import { useFacilityFilters } from '../useFacilityFilters';

describe('useFacilityFilters', () => {
  const mockFacilities = [
    { id: '1', name: 'Gym', type: 'sports', price_per_hour: 100 },
    { id: '2', name: 'Room', type: 'conference', price_per_hour: 200 },
  ];

  it('filters by type', () => {
    const { result } = renderHook(() =>
      useFacilityFilters(mockFacilities, { type: 'sports' })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].type).toBe('sports');
  });

  it('filters by price', () => {
    const { result } = renderHook(() =>
      useFacilityFilters(mockFacilities, { maxPrice: 150 })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].price_per_hour).toBe(100);
  });

  it('combines multiple filters', () => {
    const { result } = renderHook(() =>
      useFacilityFilters(mockFacilities, {
        type: 'sports',
        maxPrice: 150,
      })
    );

    expect(result.current).toHaveLength(1);
  });
});
```

### Testing Components

```typescript
// pages/__tests__/FacilitiesPage.test.tsx
import { render, screen } from '@testing-library/react';
import { FacilitiesPage } from '../FacilitiesPage';

// Mock the hook
jest.mock('@/hooks/facilities/useFacilityListPage', () => ({
  useFacilityListPage: () => ({
    facilities: [
      { id: '1', name: 'Test Facility', type: 'sports', price_per_hour: 100 },
    ],
    filters: {},
    setFilters: jest.fn(),
    view: 'grid',
    setView: jest.fn(),
    isLoading: false,
    totalCount: 1,
  }),
}));

describe('FacilitiesPage', () => {
  it('renders facility list', () => {
    render(<FacilitiesPage />);
    expect(screen.getByText('Test Facility')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Mock loading state
    render(<FacilitiesPage />);
    // Test loading UI
  });
});
```

## ⚠️ Common Pitfalls

### Pitfall 1: Moving Too Much Logic

```typescript
// ❌ BAD: Hook is doing too much
export function useFacilityPage() {
  // Fetching
  // Filtering
  // Sorting
  // Pagination
  // Favorites
  // Comments
  // All in one hook!
}

// ✅ GOOD: Compose smaller hooks
export function useFacilityPage() {
  const facilities = useFacilities();
  const filtered = useFacilityFilters(facilities);
  const paginated = usePagination(filtered);

  return { facilities: paginated };
}
```

### Pitfall 2: Prop Drilling

```typescript
// ❌ BAD: Passing everything through props
<Parent>
  <Child facilities={facilities} filters={filters} setFilters={setFilters} />
</Parent>

// ✅ GOOD: Use the hook directly
function Child() {
  const { facilities, filters, setFilters } = useFacilityListPage();
  return <div>{/* render */}</div>;
}
```

### Pitfall 3: Not Memoizing

```typescript
// ❌ BAD: No memoization
export function useExpensiveCalculation(data) {
  return data.map(/* expensive operation */);
}

// ✅ GOOD: Properly memoized
export function useExpensiveCalculation(data) {
  return useMemo(() => {
    return data.map(/* expensive operation */);
  }, [data]);
}
```

## 📝 Refactoring Checklist

For each component:

- [ ] Identify business logic to extract
- [ ] Create custom hook(s) for business logic
- [ ] Update component to use hook
- [ ] Remove Zustand store usage
- [ ] Add React Query for data fetching
- [ ] Write tests for hook
- [ ] Write tests for component
- [ ] Update imports
- [ ] Remove old code
- [ ] Document hook API

## 🎯 Success Criteria

A well-refactored component should:

1. **Be under 50 lines** (excluding JSX)
2. **Have no useEffect** for data fetching
3. **Have no complex calculations**
4. **Use custom hooks** for all business logic
5. **Be easily testable** in isolation
6. **Have clear prop types**
7. **Handle loading/error states** gracefully

## 📚 Additional Resources

- [HOOKS_ARCHITECTURE.md](./HOOKS_ARCHITECTURE.md) - Hook patterns and examples
- [MOCK_TO_SUPABASE_MIGRATION.md](./MOCK_TO_SUPABASE_MIGRATION.md) - Complete migration guide
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Ready to start refactoring?** Begin with FacilitiesPage.tsx as shown in Example 1!
