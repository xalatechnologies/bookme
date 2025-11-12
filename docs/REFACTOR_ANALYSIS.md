# Booknor Codebase Analysis: Mock Data to Supabase Migration

## Executive Summary

The Booknor application is currently operating in a hybrid state with mock/dummy data layered throughout the codebase alongside emerging Supabase infrastructure. A comprehensive refactoring is needed to complete the migration from mock data to a fully Supabase-backed architecture with proper separation of concerns.

**Total Mock/Dummy Data Files Identified:** 7
**Zustand Stores Identified:** 10
**Service Files:** 14+
**Components with Mixed Logic:** 20+

---

## 1. MOCK DATA INVENTORY

### Location: `/src/data/`

#### 1.1 Core Facility Data
**File:** `/src/data/coreFacilities.ts` (212 lines)
- **Content:** 6 hardcoded Facility objects with full details
- **Status:** Read-only constant export, readonly arrays
- **Usage:** Direct imports in multiple components
- **Issues:**
  - Static data doesn't reflect Supabase updates
  - No versioning or sync mechanism
  - Properties don't align with database schema

#### 1.2 Zone Data
**File:** `/src/data/zones/dummyZones.ts` (210 lines)
- **Content:** 10 hardcoded Zone objects with facility associations
- **Helper Functions:**
  - `getZonesForFacility(facilityId: string)`
  - `getAllZones()`
- **Status:** Marked as dummy/readonly
- **Issues:**
  - Duplicate of zones available in Supabase
  - No real-time sync capability
  - Static pricing and availability

#### 1.3 Booking Data
**File:** `/src/data/bookings/dummyBookings.ts` (115 lines)
- **Content:** 6 sample Booking records with status indicators
- **Status:** Interface + constant export
- **Issues:**
  - Never syncs with actual database
  - Mock data persists even in production-like states
  - No relationship to actual user/facility data

#### 1.4 Additional Services Data
**File:** `/src/data/additionalServices/dummyServices.ts` (102 lines)
- **Content:** 10 AdditionalService objects (equipment, catering, technical, cleaning, staff)
- **Features:**
  - Category-based organization
  - Facility type associations
  - Availability flags
- **Issues:**
  - Static offerings don't reflect dynamic pricing
  - No facility-specific customization

#### 1.5 Admin Dashboard Data
**File:** `/src/data/admin/dashboardData.ts` (partial content)
- **Content:** Mock KPI cards, approval requests, recent events
- **Issues:**
  - Completely disconnected from real metrics
  - Hardcoded trends and statistics

#### 1.6 Trends & Facilities Admin Data
**Files:**
  - `/src/data/admin/trendData.ts` - Mock trend data
  - `/src/data/admin/facilitiesData.ts` - Admin-specific facility records

### Summary
- **Total Lines of Mock Data:** ~1,022 lines
- **Primary Issue:** All 7 files are static constants that serve as fallbacks
- **Critical Problem:** Multiple systems (hooks, stores, components) reference both mock data AND Supabase simultaneously, causing inconsistent state

---

## 2. STATE MANAGEMENT ARCHITECTURE

### 2.1 Zustand Stores (10 implementations)

#### Problem: Dual-Source State
All stores use mock/initial data rather than deriving from Supabase as the source of truth.

#### Store Inventory

**1. Facility Store** (`/src/stores/facilityStore.ts`)
```typescript
- Type: Zustand + DevTools + Persist middleware
- Initial Data: initialFacilities (hardcoded array in store file)
- Methods: updateFacility, addFacility, deleteFacility, getFacilityById, getPublishedFacilities, getAdminFacilities
- Issue: Initial data duplicates coreFacilities.ts; no Supabase sync
- Persistence: localStorage with partialize middleware
```

**2. Zone Store** (`/src/stores/zoneStore.ts`)
```typescript
- Type: Zustand + Persist
- Initial Data: Empty array []
- Methods: addZone, updateZone, deleteZone, getZonesForFacility, clearAllZones
- Issue: Expects manual population; no automatic Supabase fetch
- Storage Key: 'zone-storage'
```

**3. Cart Store** (`/src/stores/cartStore.ts`)
```typescript
- Type: Zustand + DevTools + Persist
- State: items[], totalPrice, itemCount
- Methods: addItem, removeItem, updateItem, clearCart, getTotalPrice, getItemCount, getRecurringItems, getOneTimeItems, getItemsByType
- Calculation: Local price calculation with VAT
- Issue: Cart items reference facility data that may be stale
- Storage Key: 'cart-store'
```

**4. Group Store** (`/src/stores/groupStore.ts` - 17.8KB)
- Complex state for group bookings
- Issue: No Supabase integration for group persistence

**5. Message Store** (`/src/stores/messageStore.ts` - 33.7KB)
- State for messaging system
- Issue: Duplicate with Supabase messages table

**6. Recurring Booking Store** (`/src/stores/recurringBookingStore.ts`)
- Manages recurring booking patterns
- Issue: No sync with recurring_bookings table

**7. Support Store** (`/src/stores/supportStore.ts` - 21.9KB)
- Support ticket management
- Issue: Mirrors support table but operates independently

**8. Favorites Store** (`/src/stores/favoritesStore.ts`)
- User favorites management
- Issue: Duplicate favorites table functionality

**9. Slot Selection Store** (`/src/stores/slotSelectionStore.ts`)
- Time slot selection state
- Issue: Transient but doesn't validate against real availability

**10. Field Config Store** (`/src/stores/fieldConfigStore.ts`)
- Custom field configuration
- Issue: Mixed with mock facility data

### 2.2 Context API Usage
**File:** `/src/contexts/AuthContext.tsx`
```typescript
- Type: React Context + Custom Hook (useAuth)
- Features:
  - Supabase authentication integration
  - Session persistence
  - Magic link authentication
  - User profile data
  - Organization memberships
- Status: Properly implemented with Supabase
- Note: This is the ONLY context fully integrated with Supabase
```

### 2.3 React Query Hooks (Partial Integration)

**Implemented:**
- `useQuery` in history service, calendar events
- `useMutation` in booking/facility operations
- `useQueryClient` for cache invalidation

**Issues:**
- Inconsistently applied across the codebase
- Some components use Zustand instead of React Query
- Query keys don't follow hierarchical structure in all services
- No global error handling

---

## 3. DATA FETCHING PATTERNS ANALYSIS

### 3.1 Components with Direct Data Fetching (13 identified)

#### User-Facing Components (Hooks/Fetch Pattern)

**useZones Hook** (`/src/hooks/useZones.ts`)
```typescript
Pattern: useState + useEffect + fallback logic
Sources: 
  1. First tries: useZoneStore().getZonesForFacility()
  2. Fallback: getZonesForFacility() from dummy data
  3. Simulated delay: 100ms setTimeout
Issue: No actual Supabase call; relies on pre-populated store
```

**useFacility Hook** (`/src/hooks/useFacility.ts`)
```typescript
Pattern: useState + useEffect + useFacilityStore
Sources:
  1. Uses: useFacilityStore().getFacilityById()
  2. Initial data: Pre-loaded in Zustand store
Issue: Store must be manually populated; no automatic fetching
```

**useHistory Hook** (`/src/hooks/useHistory.ts`)
- Implements: `useQuery` from React Query
- Source: Mock data or real Supabase
- Status: Mixed pattern

**useCalendarEvents Hook** (`/src/hooks/useCalendarEvents.ts`)
- Implements: `useQuery` from React Query
- Issue: May pull from mock or real data depending on filters

**useRealtimeBookings Hook** (`/src/hooks/useRealtimeBookings.ts`)
- Uses: `useQueryClient` for cache invalidation
- Supabase: Real-time subscription setup
- Status: Partially implemented

#### Admin Pages with Embedded Logic

**FacilitiesPage** (`/src/pages/admin/FacilitiesPage.tsx`)
```typescript
- Direct store access: useFacilityStore()
- Operations: .filter(), .sort() on in-memory data
- No Supabase queries
- Business Logic: Complex sorting/filtering in JSX
Issues:
  - All logic in component
  - Memory-intensive for large datasets
  - No pagination support
  - Client-side only (can't be server-rendered)
```

**Bookings Page** (`/src/pages/user/Bookings.tsx`)
```typescript
- Direct store access: useRecurringBookingStore(), useGroupStore()
- Embedded business logic:
  - Status filtering
  - Date range filtering
  - Facility filtering
  - Sorting logic
- No Supabase integration
```

**UserDashboard Page** (`/src/pages/user/UserDashboard.tsx`)
```typescript
- Uses: useFacilityStore()
- Business Logic:
  - Weather simulation
  - Recommendation logic (hard-coded)
  - Filtering and display logic
- Issues:
  - Multiple concerns mixed
  - No real user data
  - Hard-coded mock facilities
```

### 3.2 Service Files Analysis

#### HTTP Service Layer
**File:** `/src/services/http.ts`
```typescript
- Type: Generic HTTP client wrapper
- Methods: get, post, patch, delete
- Status: Minimal implementation
- Issue: Not used for primary data fetching
```

#### Facilities Service (Legacy)
**File:** `/src/services/facilities.service.ts` (61 lines)
```typescript
Pattern: Service class + React Query hooks
Functions:
  - facilitiesService.getAll() → Promise<IFacility[]>
  - facilitiesService.getById(id)
  - facilitiesService.create()
  - facilitiesService.update()
  - facilitiesService.delete()
Hooks:
  - useFacilities() - useQuery integration
  - useFacility(id) - Single facility query
  - useCreateFacility() - useMutation
  - useUpdateFacility() - useMutation
Status: Incomplete; uses httpClient instead of Supabase
Issue: Dual implementation (store + service)
```

#### Supabase Service Layer
**Directory:** `/src/services/supabase/` (12 files)

**Implemented Services:**

1. **bookings.service.ts** (60+ lines)
   - Functions: 
     - getBookings, getBookingById
     - createBooking, updateBooking, deleteBooking
     - checkAvailability, getAvailabilityByZone
   - Hooks:
     - useBookings, useBooking, useUserBookings
     - useCreateBooking, useUpdateBooking, useDeleteBooking
   - Query Keys: Properly structured
   - Status: Partially implemented

2. **facilities.service.ts** (60+ lines)
   - Query Keys: Properly structured (facilityKeys)
   - Status: Header only, full content cut off

3. **zones.service.ts**
   - CRUD operations for zones
   - Zone-facility relationships

4. **messages.service.ts**
   - Message CRUD operations
   - Thread management

5. **groups.service.ts**
   - Group booking operations

6. **support.service.ts**
   - Support ticket operations

7. **recurring.service.ts**
   - Recurring booking patterns

8. **notifications.service.ts**
   - Notification management

9. **favorites.service.ts**
   - User favorites management

10. **index.ts**
    - Export aggregation point

**Key Finding:** Supabase services exist but are NOT BEING USED by components/pages

---

## 4. BUSINESS LOGIC MIXED WITH UI LOGIC

### 4.1 Components with Embedded Business Logic (20+ identified)

#### Example 1: FacilitiesPage Admin Component
```typescript
Location: /src/pages/admin/FacilitiesPage.tsx (Lines 45-90+)

UI + Business Logic Mixed:
✗ Filtering logic (.filter() with conditions)
✗ Sorting logic (switch statement with comparisons)
✗ Time parsing logic (regex/string manipulation for "2 timer siden")
✗ Sort order toggle logic
✗ Selection state management (selectedFacilities Set)
✗ View toggle logic (list/grid/map)

Should Be:
- Service layer: filterAndSortFacilities(facilities, filters, sort)
- Hook: useFacilitiesWithFilters(filters, sort)
- Component: UI only
```

#### Example 2: BookingForm Component
```typescript
Location: /src/components/booking/BookingForm.tsx (Lines 76-200+)

UI + Business Logic:
✗ Form validation logic
✗ Price calculation (delegated but still coupled)
✗ Slot management (add/remove/clear)
✗ Terms validation
✗ Booking type switching

Partially Good:
✓ Uses helper components (PriceCalculation, SelectedSlotsDisplay)
✓ Props for callbacks
✗ Still does validation in component
```

#### Example 3: UserDashboard Page
```typescript
Location: /src/pages/user/UserDashboard.tsx (Lines 70-200+)

Problems:
✗ Hard-coded weather simulation
✗ Hard-coded facility recommendations
✗ Manual filtering logic
✗ State management mixed with rendering
✗ Multiple concerns: favorites, bookings, weather, recommendations

Missing:
- useDashboardData() hook
- dashboardService layer
- separate recommendation logic
```

#### Example 4: Bookings User Page
```typescript
Location: /src/pages/user/Bookings.tsx (Lines 72-200+)

Embedded Logic:
✗ Complex filtering (status, facility, date range)
✗ Search logic
✗ Checkbox state management
✗ Sort logic
✗ Expanded/collapsed state
✗ Booking type detection

All in JSX:
- No useMemo for filtered results
- No custom hook for filtering
- No service layer
```

### 4.2 Pattern Issues Identified

**Issue #1: Data Layer Responsibilities**
```
Current Flow:
Component → useState/useStore → dummy data/mock service
                ↓
            Business logic in JSX
                ↓
            Display

Should Be:
Component → useQuery/useHook → Supabase Service → Database
                ↓
            UI only
                ↓
            Display
```

**Issue #2: Store Abuse**
- Zustand stores used for transient state (should use useState)
- Zustand stores used for server state (should use React Query)
- No clear separation of concerns

**Issue #3: Hook Inconsistency**
```
Pattern Inconsistency:
✗ useZones() - useState + dummy data fallback
✗ useFacility() - useState + Zustand store
✗ useHistory() - useQuery (correct pattern)
✓ useRealtimeBookings() - useQueryClient + subscriptions
```

---

## 5. EXISTING SUPABASE INTEGRATION

### 5.1 Properly Implemented
1. **AuthContext.tsx** - Full authentication integration
2. **Real-time subscriptions** - useRealtimeBookings, useRealtimeMessages, useRealtimeNotifications
3. **Database types** - Generated types from `types/database.ts`

### 5.2 Partially Implemented
1. **Service files** - Created but not connected to components
2. **React Query hooks** - Created but not widely used
3. **Real-time listeners** - Set up but cache invalidation scattered

### 5.3 Not Yet Integrated
1. **Facilities** - Still using Zustand + mock data
2. **Zones** - Still using Zustand + hook fallback
3. **User Dashboard** - Using mock data exclusively
4. **Admin pages** - Using Zustand exclusively
5. **Bookings CRUD** - Partial service, no component integration
6. **Cart** - Zustand only, no Supabase sync

---

## 6. REFACTORING ROADMAP

### Phase 1: Data Layer Cleanup (Week 1-2)
```
Priority: HIGH
Tasks:
1. Remove /src/data/ directory entirely
2. Remove hardcoded initialFacilities from facilityStore
3. Remove dummyZones, dummyBookings, dummyServices
4. Consolidate to single source of truth (Supabase)
```

### Phase 2: Store Consolidation (Week 2-3)
```
Priority: HIGH
Tasks:
1. Keep only UI state in Zustand:
   - cartStore (transient booking state)
   - slotSelectionStore (time slot selection)
   - uiStateStore (expanded/collapsed, view toggles)

2. Convert to React Query:
   - facilityStore → useFacilities() hook
   - zoneStore → useZones() hook
   - messageStore → useMessages() hook
   - groupStore → useGroups() hook
   - supportStore → useSupport() tickets hook
   - recurringBookingStore → useRecurringBookings() hook
   - favoritesStore → useFavorites() hook
   - fieldConfigStore → useFieldConfigs() hook

3. Architecture:
   Zustand (Transient) ← React Query (Server) ← Supabase
```

### Phase 3: Service Layer Expansion (Week 3-4)
```
Priority: HIGH
Ensure all Supabase service files have:
1. Proper type definitions
2. Query key structure
3. Error handling
4. Loading states
5. Cache invalidation
6. Optimistic updates where appropriate
```

### Phase 4: Component Refactoring (Week 4-6)
```
Priority: MEDIUM-HIGH
Tasks:
1. Extract business logic from components
2. Create custom hooks for complex operations
3. Use React Query hooks instead of direct store access
4. Implement proper error boundaries
5. Add loading states consistently

Components to Refactor:
- FacilitiesPage (extract filtering/sorting to hook)
- Bookings page (extract filter logic)
- UserDashboard (extract recommendations, filters)
- BookingForm (extract validation logic)
- All admin pages (use hooks instead of stores)
```

### Phase 5: Real-time Features (Week 6-7)
```
Priority: MEDIUM
Tasks:
1. Connect real-time subscriptions to React Query
2. Implement proper cache invalidation
3. Handle connection state
4. Add offline support where appropriate
```

### Phase 6: Testing & Documentation (Week 7-8)
```
Priority: HIGH
Tasks:
1. Unit tests for services
2. Integration tests for hooks
3. E2E tests for user flows
4. Update documentation
```

---

## 7. DETAILED REFACTORING EXAMPLES

### Example 1: useZones Hook Refactoring

**BEFORE:**
```typescript
// /src/hooks/useZones.ts (current - 65 lines)
export const useZones = (facilityId: string | number): ZonesState => {
  const [state, setState] = useState<ZonesState>({...});
  const { getZonesForFacility: storeGetZonesForFacility } = useZoneStore();
  
  useEffect(() => {
    const fetchZones = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Fake delay
      const facilityIdStr = typeof facilityId === 'number' ? facilityId.toString() : facilityId;
      let zones = storeGetZonesForFacility(facilityIdStr);
      if (zones.length === 0) {
        const dummyZones = getZonesForFacility(facilityIdStr);
        zones = dummyZones;
      }
      setState({ zones, loading: false, error: null });
    };
    if (facilityId) fetchZones();
  }, [facilityId, storeGetZonesForFacility]);
  
  return state;
};
```

**AFTER:**
```typescript
// /src/hooks/useZones.ts (refactored - 12 lines)
import { useQuery } from '@tanstack/react-query';
import { zoneService } from '@/services/supabase/zones.service';

export const useZones = (facilityId: string | number) => {
  return useQuery({
    queryKey: zoneService.zoneKeys.byFacility(String(facilityId)),
    queryFn: () => zoneService.getZonesByFacility(String(facilityId)),
    enabled: !!facilityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage: const { data: zones, isLoading, error } = useZones(facilityId);
```

### Example 2: useFacility Hook Refactoring

**BEFORE:**
```typescript
// /src/hooks/useFacility.ts (current - 70 lines)
export const useFacility = (id: string | number): FacilityState => {
  const [state, setState] = useState<FacilityState>({...});
  const { getFacilityById } = useFacilityStore();
  
  useEffect(() => {
    const fetchFacility = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const facilityId = typeof id === 'number' ? id.toString() : id;
      const facility = getFacilityById(facilityId);
      if (!facility) {
        setState({ facility: null, loading: false, error: null, notFound: true });
        return;
      }
      setState({ facility, loading: false, error: null, notFound: false });
    };
    if (id) fetchFacility();
  }, [id, getFacilityById]);
  
  return state;
};
```

**AFTER:**
```typescript
// /src/hooks/useFacility.ts (refactored - 15 lines)
import { useQuery } from '@tanstack/react-query';
import { facilityService } from '@/services/supabase/facilities.service';

export const useFacility = (id: string | number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: facilityService.facilityKeys.detail(String(id)),
    queryFn: () => facilityService.getFacilityById(String(id)),
    enabled: !!id,
  });
  
  return {
    facility: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    notFound: !data && !isLoading && !error,
  };
};
```

### Example 3: FacilitiesPage Refactoring

**BEFORE:**
```typescript
// /src/pages/admin/FacilitiesPage.tsx (current - 200+ lines)
const FacilitiesPage = (_props: IFacilitiesPageProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<TSortBy>("name");
  const [sortOrder, setSortOrder] = useState<TSortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<readonly string[]>([]);
  
  const { facilities } = useFacilityStore();
  
  // Business Logic in JSX
  const filteredFacilities = adminFacilities
    .filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(facility.status);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "capacity":
          comparison = a.capacity - b.capacity;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  return (
    <div>
      {/* UI with filteredFacilities */}
    </div>
  );
};
```

**AFTER:**
```typescript
// /src/hooks/useFacilitiesWithFilters.ts (new)
export const useFacilitiesWithFilters = (
  filters: FacilityFilters,
  sort: SortConfig
) => {
  const { data: facilities = [], isLoading, error } = useFacilities();
  
  return useMemo(() => {
    return facilities
      .filter(facility => matchesAllFilters(facility, filters))
      .sort((a, b) => applySorting(a, b, sort));
  }, [facilities, filters, sort]);
};

// /src/pages/admin/FacilitiesPage.tsx (refactored - 80 lines)
const FacilitiesPage = (_props: IFacilitiesPageProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<TSortBy>("name");
  const [sortOrder, setSortOrder] = useState<TSortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<readonly string[]>([]);
  
  const filters = useMemo(() => ({
    search: searchTerm,
    statuses: statusFilter,
  }), [searchTerm, statusFilter]);
  
  const sort = useMemo(() => ({
    by: sortBy,
    order: sortOrder,
  }), [sortBy, sortOrder]);
  
  const filteredFacilities = useFacilitiesWithFilters(filters, sort);
  
  return (
    <div>
      {/* UI only - render filteredFacilities */}
    </div>
  );
};
```

### Example 4: UserDashboard Refactoring

**BEFORE:**
```typescript
// /src/pages/user/UserDashboard.tsx (current - 200+ lines)
const UserDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [messageFilter, setMessageFilter] = useState<string>("all");
  const [weather, setWeather] = useState<IWeatherData | null>(null);
  
  const { getPublishedFacilities } = useFacilityStore();
  
  // Hard-coded recommendations
  const recommendations: IUserFacility[] = [
    // mock data
  ];
  
  // Weather simulation
  useEffect(() => {
    const conditions = ["sunny", "cloudy", "rainy"] as const;
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    setWeather({
      temperature: Math.floor(Math.random() * 20) + 10,
      condition: randomCondition,
      description: getWeatherDescription(randomCondition),
    });
  }, []);
  
  return (
    <div>
      {/* Complex JSX mixing recommendations, weather, filters */}
    </div>
  );
};
```

**AFTER:**
```typescript
// /src/hooks/useDashboardData.ts (new)
export const useDashboardData = (userId: string) => {
  const { data: userBookings } = useUserBookings(userId);
  const { data: facilities } = useFacilities();
  const { data: messages } = useUserMessages(userId);
  const { data: recommendations } = useRecommendations(userId);
  
  const isLoading = false; // derived from above
  const error = null; // derived from above
  
  return {
    userBookings,
    facilities,
    messages,
    recommendations,
    isLoading,
    error,
  };
};

// /src/pages/user/UserDashboard.tsx (refactored - 80 lines)
const UserDashboard = (): JSX.Element => {
  const { user } = useAuth();
  const { 
    userBookings, 
    facilities, 
    messages, 
    recommendations, 
    isLoading, 
    error 
  } = useDashboardData(user?.id ?? '');
  
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [messageFilter, setMessageFilter] = useState<string>("all");
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div>
      {/* UI only - render recommendations, bookings, messages */}
    </div>
  );
};
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Data Removal
- [ ] Delete `/src/data/` directory entirely
- [ ] Remove all imports of coreFacilities from files
- [ ] Remove all imports of dummyZones, dummyBookings, dummyServices
- [ ] Update facilityStore to initialize from Supabase
- [ ] Search and replace hardcoded mock data references

### Phase 2: Store Refactoring
**Convert to React Query:**
- [ ] facilityStore → useAdminFacilities() + useFacilities()
- [ ] zoneStore → useZones() + useAdminZones()
- [ ] messageStore → useMessages() + useThreads()
- [ ] groupStore → useGroups() + useGroupInvitations()
- [ ] supportStore → useSupportTickets() + useSupportReplies()
- [ ] recurringBookingStore → useRecurringBookings() + useRecurringPatterns()
- [ ] favoritesStore → useFavorites() + useToggleFavorite()
- [ ] fieldConfigStore → useFieldConfigs() + useUpdateFieldConfig()

**Keep in Zustand (transient state only):**
- [ ] cartStore (expand with optimistic updates from Supabase)
- [ ] slotSelectionStore (UI state only)

### Phase 3: Service Enhancement
- [ ] Complete all Supabase service files
- [ ] Add proper error handling to all services
- [ ] Implement query key structures consistently
- [ ] Add cache invalidation patterns
- [ ] Implement optimistic updates where appropriate
- [ ] Add loading state utilities

### Phase 4: Component Refactoring
- [ ] Extract filtering logic: `useFacilitiesWithFilters`
- [ ] Extract sorting logic: `useSortedData`
- [ ] Extract search logic: `useSearchFilter`
- [ ] Extract validation logic: Service layer
- [ ] Extract recommendation logic: `useRecommendations`
- [ ] Extract dashboard data: `useDashboardData`
- [ ] Create `useBookingFilters`, `useBookingSort`
- [ ] Create `useAdminBookingsFiltered`

### Phase 5: Real-time & Sync
- [ ] Connect all useRealtime hooks to React Query
- [ ] Implement proper cache invalidation
- [ ] Add connection state management
- [ ] Test offline scenarios

### Phase 6: Testing
- [ ] Service layer unit tests
- [ ] Hook integration tests
- [ ] E2E tests for major user flows
- [ ] Migration tests for data consistency

---

## 9. DEPENDENCY ANALYSIS

### Files to Remove
1. `/src/data/coreFacilities.ts` - Move data to Supabase
2. `/src/data/zones/dummyZones.ts` - Move data to Supabase
3. `/src/data/bookings/dummyBookings.ts` - Move data to Supabase
4. `/src/data/additionalServices/dummyServices.ts` - Move data to Supabase
5. `/src/data/admin/dashboardData.ts` - Calculate from real metrics
6. `/src/data/admin/trendData.ts` - Calculate from real data
7. `/src/data/admin/facilitiesData.ts` - Query from Supabase

### Files to Refactor (High Impact)
1. `/src/hooks/useZones.ts` - Use React Query
2. `/src/hooks/useFacility.ts` - Use React Query
3. `/src/pages/admin/FacilitiesPage.tsx` - Extract filter/sort logic
4. `/src/pages/user/Bookings.tsx` - Extract filter/sort logic
5. `/src/pages/user/UserDashboard.tsx` - Extract dashboard logic
6. `/src/stores/facilityStore.ts` - Convert to hooks + useAuth initialization
7. `/src/stores/zoneStore.ts` - Convert to hooks
8. `/src/stores/messageStore.ts` - Convert to hooks
9. `/src/stores/groupStore.ts` - Convert to hooks
10. `/src/stores/supportStore.ts` - Convert to hooks

### Files to Create (New Infrastructure)
1. `/src/hooks/useFacilitiesWithFilters.ts` - Combined filtering
2. `/src/hooks/useDashboardData.ts` - Dashboard aggregation
3. `/src/hooks/useBookingFilters.ts` - Booking filters
4. `/src/hooks/useSortedData.ts` - Generic sorting
5. `/src/hooks/useSearchFilter.ts` - Generic search
6. `/src/utils/filterUtils.ts` - Filter helpers
7. `/src/utils/sortUtils.ts` - Sort helpers
8. `/src/utils/searchUtils.ts` - Search helpers
9. Complete all services in `/src/services/supabase/`

### Files to Update (Imports/References)
- ~50+ component files that import from `/src/data/`
- ~15+ component files that use Zustand stores directly
- ~10+ page files with embedded business logic

---

## 10. RISK ANALYSIS & MITIGATION

### High Risk Areas
1. **Data Loss During Migration**
   - Risk: Deleting mock data before Supabase is verified
   - Mitigation: Verify data exists in Supabase first; keep mock data in git history; backup current state

2. **Breaking Changes in Components**
   - Risk: Hook signatures change
   - Mitigation: Gradual migration; support both old and new APIs temporarily

3. **Performance Regressions**
   - Risk: More requests to Supabase
   - Mitigation: Implement proper caching; batch queries; optimize query keys

4. **Offline Functionality Loss**
   - Risk: Removing Zustand breaks offline
   - Mitigation: Use React Query offline support; keep critical stores in Zustand

### Medium Risk Areas
1. Real-time sync conflicts
2. Cache invalidation bugs
3. Optimistic update failures
4. Permission/RLS issues

### Mitigation Strategies
1. Comprehensive E2E tests before/after
2. Feature flags for gradual rollout
3. Detailed logging for debugging
4. Monitoring for errors post-deployment
5. Rollback plan ready

---

## 11. TIMELINE & RESOURCE ESTIMATE

**Total Duration:** 6-8 weeks
**Team Size:** 2 developers (1 senior, 1 mid-level)
**Effort:** ~320-400 hours

**Breakdown:**
- Phase 1 (Data Removal): 40 hours
- Phase 2 (Store Conversion): 80 hours
- Phase 3 (Services): 60 hours
- Phase 4 (Components): 100 hours
- Phase 5 (Real-time): 40 hours
- Phase 6 (Testing): 60 hours

**Weekly Velocity:** 50-80 hours

---

## 12. SUCCESS CRITERIA

1. [ ] All mock data removed from `/src/data/`
2. [ ] 100% of data flows through Supabase
3. [ ] All Zustand stores converted to React Query hooks (except transient state)
4. [ ] All components use hooks instead of direct store access
5. [ ] All business logic extracted from components
6. [ ] Real-time features fully functional
7. [ ] Test coverage > 80% for critical paths
8. [ ] No breaking changes to user-facing features
9. [ ] Performance metrics maintained or improved
10. [ ] Documentation updated for new patterns

---

## 13. POST-REFACTORING ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                          React Components                        │
│                      (UI only - no logic)                        │
└────────────────┬────────────────────────────────┬────────────────┘
                 │                                │
         ┌───────▼────────┐            ┌──────────▼──────────┐
         │  React Hooks   │            │  Zustand Stores    │
         │  (custom)      │            │  (transient only)  │
         │  - useZones    │            │  - cartStore       │
         │  - useFacility │            │  - slotSelection   │
         │  - useBookings │            └────────────────────┘
         │  - etc.        │
         └───────┬────────┘
                 │
         ┌───────▼──────────────────┐
         │   React Query            │
         │   (server state)         │
         │   - useQuery             │
         │   - useMutation          │
         │   - useQueryClient       │
         └───────┬──────────────────┘
                 │
         ┌───────▼──────────────────┐
         │  Supabase Services       │
         │  - facilities.service    │
         │  - bookings.service      │
         │  - zones.service         │
         │  - messages.service      │
         │  - etc.                  │
         └───────┬──────────────────┘
                 │
         ┌───────▼──────────────────┐
         │      Supabase Client     │
         │      Real-time Support   │
         └───────┬──────────────────┘
                 │
         ┌───────▼──────────────────┐
         │      Supabase Server     │
         │      - PostgreSQL DB     │
         │      - RLS/Auth          │
         │      - Real-time         │
         └──────────────────────────┘
```

---

## Summary of Key Findings

| Category | Finding | Impact | Priority |
|----------|---------|--------|----------|
| Mock Data | 7 files, ~1,022 lines of dummy data | HIGH | CRITICAL |
| State Management | 10 Zustand stores, most should use React Query | HIGH | HIGH |
| Data Fetching | 13 components with mixed/direct fetching | HIGH | HIGH |
| Business Logic | 20+ components with embedded logic | MEDIUM | HIGH |
| Service Layer | Exists but unused | MEDIUM | MEDIUM |
| Real-time | Partially implemented | MEDIUM | MEDIUM |
| Testing | Limited coverage | MEDIUM | MEDIUM |

**Overall Assessment:** The codebase is at an inflection point. Mock data infrastructure remains dominant, but Supabase infrastructure is being built. A coordinated migration effort is needed to consolidate toward Supabase as the single source of truth while maintaining functionality.

