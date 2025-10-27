# BookMe Full-Stack Migration Plan

**Current State:** Frontend-only application using localStorage
**Target State:** Full-stack application with Supabase backend
**Approach:** Ground-up backend integration while preserving UI/UX

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Target Architecture](#target-architecture)
4. [Migration Phases](#migration-phases)
5. [Technical Strategy](#technical-strategy)
6. [Database Schema Design](#database-schema-design)
7. [Authentication & RBAC](#authentication--rbac)
8. [Service Layer Architecture](#service-layer-architecture)
9. [State Management Migration](#state-management-migration)
10. [Component Refactoring Strategy](#component-refactoring-strategy)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)

---

## Executive Summary

### Scope
Migrate BookMe from a frontend-only application to a full-stack application with:
- **Backend:** Supabase (PostgreSQL + Auth + Real-time + Storage)
- **State Management:** React Query + Custom Hooks (replacing Zustand)
- **Architecture:** Service Layer Pattern with proper separation of concerns
- **UI/UX:** **NO CHANGES** - Keep existing interface intact

### Key Metrics
- **Pages to Migrate:** 26 pages (13 user + 13 admin)
- **Stores to Replace:** 10+ Zustand stores
- **Contexts to Update:** 5 contexts
- **Components to Refactor:** 100+ components

### Timeline Estimate
- **Phase 1 (Foundation):** 2-3 weeks
- **Phase 2-4 (Core Features):** 4-6 weeks
- **Phase 5 (Advanced):** 2-3 weeks
- **Phase 6 (Polish):** 1-2 weeks
**Total:** 9-14 weeks

---

## Current Architecture Analysis

### Frontend Stack
```
React 18 + TypeScript
├── State: Zustand stores (10+)
├── Routing: React Router
├── UI: Tailwind CSS + shadcn/ui
├── Data: localStorage
└── i18n: React contexts
```

### Zustand Stores (To Be Replaced)
1. **cartStore** - Shopping cart for bookings
2. **recurringBookingStore** - Recurring booking management
3. **groupStore** - Group booking functionality
4. **messageStore** - User messages and notifications
5. **fieldConfigStore** - Dynamic form field configuration
6. **supportStore** - Support ticket management
7. **favoritesStore** - User favorites
8. **zoneStore** - Facility zone management
9. **slotSelectionStore** - Time slot selection
10. **facilityStore** - Facility data management

### Existing Contexts (To Be Updated)
1. **AuthContext** - User authentication
2. **AdminAuthContext** - Admin authentication
3. **UserProfileContext** - User profile data
4. **CartContext** - Cart management (duplicates cartStore)
5. **LanguageContext** - Internationalization

### Pages by Priority

#### High Priority (Core Functionality)
1. **User Bookings** - View/manage bookings
2. **User Facilities** - Browse/search facilities
3. **User Dashboard** - Overview and stats
4. **Checkout** - Payment and booking completion
5. **User Profile** - Profile management
6. **Admin Overview** - Admin dashboard
7. **Admin Bookings** - Booking management
8. **Admin Facilities** - Facility management

#### Medium Priority (Extended Features)
9. **User Calendar** - Calendar view
10. **User Favorites** - Saved favorites
11. **User Messages** - Messaging system
12. **User History** - Booking history
13. **User Notifications** - Notification center
14. **Admin Users/Roles** - User management
15. **Admin Reports** - Analytics and reports

#### Lower Priority (Admin Tools)
16. **Admin Settings** - System configuration
17. **Admin Audit Log** - Activity tracking
18. **Admin Approvals** - Approval workflows
19. **Admin Integrations** - Third-party integrations

---

## Target Architecture

### Full-Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Pages     │  │  Components  │  │   UI Library     │  │
│  │  (UI Logic) │  │  (Reusable)  │  │  (shadcn/ui)     │  │
│  └──────┬──────┘  └──────────────┘  └──────────────────┘  │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐           │
│  │       Custom Hooks (Composition)             │           │
│  │  - useBookingListPage()                      │           │
│  │  - useFacilitySearch()                       │           │
│  │  - useUserDashboard()                        │           │
│  └──────┬───────────────────────────────────────┘           │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐           │
│  │    Business Logic Hooks (Pure Functions)     │           │
│  │  - useBookingFilters()                       │           │
│  │  - useBookingStats()                         │           │
│  │  - useRecurringGroups()                      │           │
│  └──────┬───────────────────────────────────────┘           │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐           │
│  │      React Query (Caching & Sync)            │           │
│  │  - Query: Fetch data                         │           │
│  │  - Mutation: Update data                     │           │
│  │  - Invalidation: Cache management            │           │
│  └──────┬───────────────────────────────────────┘           │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐           │
│  │       Service Layer (Data Access)            │           │
│  │  - bookings.service.ts                       │           │
│  │  - facilities.service.ts                     │           │
│  │  - auth.service.ts                           │           │
│  └──────┬───────────────────────────────────────┘           │
│         │                                                    │
└─────────┼─────────────────────────────────────────────────────┘
          │
          │  Supabase Client SDK
          │
┌─────────▼─────────────────────────────────────────────────────┐
│                     Supabase Backend                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐│
│  │  PostgreSQL  │  │  Auth (JWT)  │  │  Storage (S3-like)   ││
│  │  (Database)  │  │  + RBAC      │  │  (File uploads)      ││
│  └──────────────┘  └──────────────┘  └──────────────────────┘│
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐│
│  │  Row Level   │  │   Real-time  │  │    Edge Functions    ││
│  │  Security    │  │  Pub/Sub     │  │    (Serverless)      ││
│  └──────────────┘  └──────────────┘  └──────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits of New Architecture

1. **Separation of Concerns**
   - UI logic separate from business logic
   - Business logic separate from data access
   - Data access separate from backend

2. **Testability**
   - Pure functions easy to unit test
   - Hooks can be tested independently
   - Services can be mocked

3. **Reusability**
   - Hooks can be shared across pages
   - Services can be shared across app
   - Components remain UI-focused

4. **Performance**
   - React Query automatic caching
   - Smart refetch strategies
   - Optimistic updates
   - Background data sync

5. **Type Safety**
   - Generated TypeScript types from database
   - End-to-end type safety
   - Compile-time error detection

---

## Migration Phases

### Phase 1: Foundation (Week 1-3)

**Goal:** Establish backend infrastructure and authentication

#### Tasks:
1. **Database Schema Design**
   - Analyze existing localStorage data structures
   - Design normalized PostgreSQL schema
   - Create migrations with proper indexes
   - Set up multi-tenancy (org_id)
   - Define all foreign key relationships

2. **Authentication & RBAC Setup**
   - Configure Supabase Auth
   - Create user roles (user, org_admin, super_admin)
   - Set up Row Level Security (RLS) policies
   - Create admin and user test accounts
   - Integrate with existing AuthContext

3. **Service Layer Foundation**
   - Create base service structure
   - Implement Supabase client singleton
   - Create auth.service.ts
   - Create type definitions from database
   - Set up error handling patterns

4. **React Query Setup**
   - Install and configure React Query
   - Create query client with proper defaults
   - Set up dev tools
   - Define cache strategies
   - Create query key factory

#### Deliverables:
- ✅ Complete database schema
- ✅ Working authentication system
- ✅ Service layer foundation
- ✅ React Query configured
- ✅ Test users and data

#### Files to Create:
```
backend/
└── supabase/
    ├── migrations/
    │   ├── 001_create_organizations.sql
    │   ├── 002_create_profiles.sql
    │   ├── 003_create_facilities.sql
    │   ├── 004_create_bookings.sql
    │   ├── 005_create_rbac.sql
    │   └── 006_create_rls_policies.sql
    └── seed.sql

src/
├── services/
│   └── supabase/
│       ├── client.ts
│       ├── auth.service.ts
│       └── types.ts
└── lib/
    └── react-query.ts
```

---

### Phase 2: Core User Features (Week 4-6)

**Goal:** Migrate core user-facing functionality

#### 2.1 Bookings Module

**Priority:** HIGHEST - Core business function

##### Tasks:
1. Create bookings.service.ts
2. Create booking hooks (filters, stats, groups)
3. Refactor Bookings page
4. Refactor BookingDetails component
5. Test booking creation/cancellation

##### Files:
```
src/
├── services/supabase/
│   └── bookings.service.ts
├── hooks/bookings/
│   ├── useBookingFilters.ts
│   ├── useBookingStats.ts
│   ├── useRecurringBookingGroups.ts
│   └── useBookingListPage.ts
└── components/bookings/
    ├── BookingCard.tsx
    ├── BookingDetailsPanel.tsx
    ├── BookingFiltersBar.tsx
    └── RecurringBookingGroup.tsx
```

#### 2.2 Facilities Module

**Priority:** HIGH - User discovery

##### Tasks:
1. Create facilities.service.ts
2. Create facility hooks (search, filters)
3. Refactor UserFacilities page
4. Refactor FacilityDetails component
5. Test facility browsing and search

##### Files:
```
src/
├── services/supabase/
│   └── facilities.service.ts
├── hooks/facilities/
│   ├── useFacilitySearch.ts
│   ├── useFacilityFilters.ts
│   └── useFacilityPage.ts
└── components/facilities/
    ├── FacilityCard.tsx
    ├── FacilityDetailsPanel.tsx
    └── FacilitySearchBar.tsx
```

#### 2.3 User Dashboard

**Priority:** HIGH - User overview

##### Tasks:
1. Create dashboard.service.ts
2. Create dashboard hooks
3. Refactor UserDashboard page
4. Create dashboard components
5. Test stats and recent activity

##### Files:
```
src/
├── services/supabase/
│   └── dashboard.service.ts
├── hooks/dashboard/
│   ├── useDashboardStats.ts
│   └── useDashboardPage.ts
└── components/dashboard/
    ├── StatsCard.tsx
    ├── RecentBookings.tsx
    └── QuickActions.tsx
```

#### 2.4 Checkout & Cart

**Priority:** HIGH - Revenue generation

##### Tasks:
1. Create cart.service.ts
2. Migrate CartContext to React Query
3. Refactor Checkout page
4. Test payment flow (mock initially)
5. Test cart persistence

##### Files:
```
src/
├── services/supabase/
│   └── cart.service.ts
├── hooks/cart/
│   ├── useCart.ts
│   └── useCheckout.ts
└── components/cart/
    ├── CartItem.tsx
    ├── CartSummary.tsx
    └── CheckoutForm.tsx
```

---

### Phase 3: Extended User Features (Week 7-9)

**Goal:** Add remaining user features

#### 3.1 Calendar View

##### Tasks:
1. Create calendar.service.ts
2. Create calendar hooks
3. Refactor CalendarPage
4. Integrate with bookings
5. Test date selection and filtering

#### 3.2 Favorites

##### Tasks:
1. Create favorites.service.ts
2. Replace favoritesStore with hooks
3. Refactor UserFavorites page
4. Test add/remove favorites

#### 3.3 Messages

##### Tasks:
1. Create messages.service.ts
2. Replace messageStore with hooks
3. Refactor UserMessages page
4. Implement real-time updates
5. Test message send/receive

#### 3.4 Profile & Settings

##### Tasks:
1. Create profile.service.ts
2. Update UserProfileContext
3. Refactor UserProfile page
4. Refactor UserSettings page
5. Test profile updates

---

### Phase 4: Admin Features (Week 10-12)

**Goal:** Migrate admin functionality

#### 4.1 Admin Dashboard

##### Tasks:
1. Create admin-dashboard.service.ts
2. Create admin hooks
3. Refactor Admin Overview page
4. Test admin stats and analytics

#### 4.2 Admin Bookings Management

##### Tasks:
1. Extend bookings.service.ts with admin methods
2. Create admin booking hooks
3. Refactor Admin BookingsPage
4. Test booking approval/cancellation

#### 4.3 Admin Facilities Management

##### Tasks:
1. Extend facilities.service.ts with admin methods
2. Create admin facility hooks
3. Refactor Admin FacilitiesPage
4. Refactor FacilityEditPage
5. Test facility CRUD operations

#### 4.4 Users & Roles Management

##### Tasks:
1. Create users.service.ts
2. Create rbac.service.ts
3. Refactor UsersRolesPage
4. Test role assignment and permissions

---

### Phase 5: Advanced Features (Week 13-14)

**Goal:** Add advanced functionality

#### 5.1 Reports & Analytics

##### Tasks:
1. Create reports.service.ts
2. Create reporting hooks
3. Refactor ReportsPage
4. Test report generation

#### 5.2 Audit Log

##### Tasks:
1. Create audit.service.ts
2. Implement audit triggers in database
3. Refactor AuditLogPage
4. Test audit trail

#### 5.3 Integrations

##### Tasks:
1. Create integrations.service.ts
2. Set up Edge Functions for webhooks
3. Refactor IntegrationsPage
4. Test third-party integrations

---

### Phase 6: Polish & Optimization (Week 15-16)

**Goal:** Optimize and prepare for production

#### Tasks:
1. **Performance Optimization**
   - Optimize React Query cache strategies
   - Add pagination where needed
   - Implement infinite scroll
   - Optimize database queries with indexes

2. **Error Handling**
   - Centralized error handling
   - User-friendly error messages
   - Error boundaries
   - Retry logic

3. **Testing**
   - Unit tests for services
   - Integration tests for hooks
   - E2E tests for critical flows
   - Load testing

4. **Documentation**
   - API documentation
   - Component usage guides
   - Deployment guides
   - Troubleshooting guides

---

## Technical Strategy

### 1. Data Migration Strategy

#### Approach: Dual-Mode Operation

During migration, support both localStorage and Supabase:

```typescript
// Example: Graceful fallback
const { data: bookings } = useUserBookings(userId);

// If Supabase fails, fallback to localStorage
const fallbackBookings = useLocalStorageFallback('bookings', bookings);
```

#### Migration Steps:
1. Keep existing localStorage code
2. Add Supabase queries alongside
3. Test Supabase version thoroughly
4. Switch to Supabase as primary
5. Remove localStorage code

### 2. State Management Migration

#### Replace Zustand with React Query + Hooks

**Before (Zustand):**
```typescript
// Store
const useFacilityStore = create<FacilityStore>((set) => ({
  facilities: [],
  loading: false,
  fetchFacilities: async () => {
    set({ loading: true });
    const data = await fetch('/api/facilities');
    set({ facilities: data, loading: false });
  },
}));

// Component
const { facilities, fetchFacilities } = useFacilityStore();
```

**After (React Query + Hooks):**
```typescript
// Service
export const getFacilities = async (): Promise<Facility[]> => {
  const { data, error } = await supabase
    .from('facilities')
    .select('*');
  if (error) throw error;
  return data;
};

// Hook
export const useFacilities = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Component
const { data: facilities, isLoading } = useFacilities();
```

### 3. Component Refactoring Pattern

#### Keep UI, Update Data Source

**Before:**
```typescript
export const BookingCard = ({ booking }: Props) => {
  const handleCancel = async () => {
    // Direct localStorage manipulation
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updated = bookings.filter(b => b.id !== booking.id);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  return (
    <Card>
      {/* UI remains the same */}
      <Button onClick={handleCancel}>Cancel</Button>
    </Card>
  );
};
```

**After:**
```typescript
export const BookingCard = ({ booking }: Props) => {
  const cancelMutation = useCancelBooking();

  const handleCancel = async () => {
    // Use service + React Query
    await cancelMutation.mutateAsync(booking.id);
  };

  return (
    <Card>
      {/* UI remains the same - NO CHANGES */}
      <Button onClick={handleCancel}>Cancel</Button>
    </Card>
  );
};
```

### 4. Type Safety Strategy

#### Generate Types from Database

```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

#### Use Generated Types

```typescript
import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
```

---

## Database Schema Design

### Core Tables

#### 1. organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Oslo',
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  default_org UUID REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. facilities
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  facility_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NO',
  location GEOGRAPHY(POINT, 4326),
  capacity INTEGER,
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_facilities_org_id ON facilities(org_id);
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_facilities_location ON facilities USING GIST(location);
```

#### 4. zones
```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER,
  price_per_hour_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_zones_facility_id ON zones(facility_id);
```

#### 5. bookings
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  zone_id UUID REFERENCES zones(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NOK',
  recurring_booking_id UUID,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_facility_id ON bookings(facility_id);
CREATE INDEX idx_bookings_starts_at ON bookings(starts_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_recurring ON bookings(recurring_booking_id);
```

### Additional Tables

- **memberships** - User-organization relationships
- **additional_services** - Extra services (equipment, staff, etc.)
- **favorites** - User favorite facilities
- **reviews** - Facility reviews
- **messages** - User-admin messaging
- **notifications** - System notifications
- **audit_log** - Activity tracking
- **payment_transactions** - Payment records

---

## Authentication & RBAC

### User Roles

1. **user** - Regular user
   - Can browse facilities
   - Can create bookings
   - Can manage own bookings
   - Can view own profile

2. **org_admin** - Organization administrator
   - All user permissions
   - Can manage organization facilities
   - Can view organization bookings
   - Can manage organization users

3. **super_admin** - Platform administrator
   - All org_admin permissions
   - Can manage all organizations
   - Can access audit logs
   - Can configure system settings

### Row Level Security (RLS) Examples

#### Bookings RLS
```sql
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Org admins can view org bookings
CREATE POLICY "Org admins can view org bookings"
  ON bookings FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid()
      AND role IN ('org_admin', 'super_admin')
    )
  );

-- Users can insert bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel own bookings
CREATE POLICY "Users can cancel own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'awaiting_payment', 'paid')
  );
```

---

## Service Layer Architecture

### Service Pattern

Each service handles one domain:

```typescript
// bookings.service.ts
export const bookingsService = {
  // Queries
  getAll: async (userId: string): Promise<Booking[]> => { /* ... */ },
  getById: async (id: string): Promise<Booking> => { /* ... */ },
  getUpcoming: async (userId: string): Promise<Booking[]> => { /* ... */ },

  // Mutations
  create: async (booking: BookingInsert): Promise<Booking> => { /* ... */ },
  update: async (id: string, updates: BookingUpdate): Promise<Booking> => { /* ... */ },
  cancel: async (id: string): Promise<void> => { /* ... */ },

  // Admin
  approve: async (id: string): Promise<Booking> => { /* ... */ },
  reject: async (id: string, reason: string): Promise<Booking> => { /* ... */ },
};
```

### React Query Integration

```typescript
// useUserBookings.ts
export const useUserBookings = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => bookingsService.getAll(userId),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// useCancelBooking.ts
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsService.cancel,
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
```

---

## State Management Migration

### Zustand Store → React Query Migration Map

| Zustand Store | React Query Solution | Service | Notes |
|---------------|---------------------|---------|-------|
| cartStore | useCart() | cart.service.ts | Cart in database for persistence |
| facilityStore | useFacilities() | facilities.service.ts | Direct database queries |
| favoritesStore | useFavorites() | favorites.service.ts | User favorites table |
| messageStore | useMessages() | messages.service.ts | Real-time subscriptions |
| recurringBookingStore | useRecurringBookings() | bookings.service.ts | Part of bookings |
| groupStore | useGroups() | groups.service.ts | Group bookings table |
| supportStore | useTickets() | support.service.ts | Support tickets table |
| zoneStore | useZones() | zones.service.ts | Facility zones |
| slotSelectionStore | UI State | N/A | Keep as local state |
| fieldConfigStore | useFieldConfig() | config.service.ts | Config table |

### Context Migration

| Context | Strategy | Notes |
|---------|----------|-------|
| AuthContext | Keep + Enhance | Add Supabase auth integration |
| AdminAuthContext | Merge with AuthContext | Use role-based checks |
| UserProfileContext | Replace with useProfile() | React Query hook |
| CartContext | Replace with useCart() | React Query hook |
| LanguageContext | Keep | No backend needed |

---

## Component Refactoring Strategy

### Refactoring Principles

1. **Preserve UI/UX**
   - Keep all existing styles
   - Keep all existing layouts
   - Keep all existing interactions
   - Only change data source

2. **Small Incremental Changes**
   - Refactor one component at a time
   - Test after each change
   - Deploy incrementally

3. **Backward Compatibility**
   - Support both old and new during transition
   - Use feature flags if needed
   - Graceful degradation

### Refactoring Checklist

For each component:

- [ ] Identify data dependencies
- [ ] Identify state mutations
- [ ] Create service methods if needed
- [ ] Create React Query hooks
- [ ] Replace Zustand with hooks
- [ ] Update prop types if needed
- [ ] Test all interactions
- [ ] Test error states
- [ ] Test loading states
- [ ] Update documentation

---

## Testing Strategy

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage for services and hooks
- **Integration Tests:** All critical user flows
- **E2E Tests:** Core booking and payment flows

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   │   ├── bookings.service.test.ts
│   │   └── facilities.service.test.ts
│   └── hooks/
│       ├── useBookingFilters.test.ts
│       └── useBookingStats.test.ts
├── integration/
│   ├── bookings/
│   │   └── booking-flow.test.tsx
│   └── admin/
│       └── facility-management.test.tsx
└── e2e/
    ├── user-booking-flow.spec.ts
    └── admin-approval-flow.spec.ts
```

---

## Deployment Plan

### Environment Setup

1. **Development**
   - Local Supabase (Docker)
   - Test data seeded
   - Debug mode enabled

2. **Staging**
   - Supabase Cloud (test project)
   - Production-like data
   - Performance monitoring

3. **Production**
   - Supabase Cloud (production project)
   - Real data
   - Full monitoring and alerts

### Deployment Strategy

1. **Feature Flags**
   - Enable features gradually
   - A/B test new vs old
   - Quick rollback if needed

2. **Blue-Green Deployment**
   - Deploy to staging (green)
   - Test thoroughly
   - Switch traffic to green
   - Keep blue as fallback

3. **Database Migrations**
   - Test migrations on staging
   - Backup before production migration
   - Run migrations during low-traffic
   - Monitor for issues

---

## Risk Mitigation

### Risks & Solutions

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Comprehensive backup strategy |
| Performance degradation | MEDIUM | Load testing, caching, indexes |
| Breaking changes | HIGH | Feature flags, gradual rollout |
| User adoption resistance | MEDIUM | Preserve UI/UX, clear communication |
| Downtime during migration | MEDIUM | Blue-green deployment, rollback plan |
| Security vulnerabilities | HIGH | RLS policies, security audit |

---

## Success Criteria

### Phase Completion Criteria

Each phase is complete when:

1. ✅ All planned features implemented
2. ✅ All tests passing (unit + integration)
3. ✅ No TypeScript errors
4. ✅ Performance benchmarks met
5. ✅ Documentation updated
6. ✅ Code reviewed and approved
7. ✅ Deployed to staging and tested

### Overall Success Metrics

1. **Functionality**
   - All features work as before
   - No data loss
   - No UX regressions

2. **Performance**
   - Page load < 2 seconds
   - API response < 500ms (p95)
   - No memory leaks

3. **Code Quality**
   - Test coverage > 80%
   - No critical bugs
   - Type-safe throughout

4. **User Satisfaction**
   - No increase in support tickets
   - Positive user feedback
   - Smooth transition

---

## Next Steps

### Immediate Actions

1. **Review and Approve Plan**
   - Stakeholder review
   - Technical review
   - Timeline confirmation

2. **Set Up Project Tracking**
   - Create GitHub issues for each task
   - Set up project board
   - Assign responsibilities

3. **Begin Phase 1**
   - Start with database schema design
   - Set up authentication
   - Create service layer foundation

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** 🎯 READY TO START
