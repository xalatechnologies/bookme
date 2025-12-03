# Feature-Based Architecture Strategy 🏗️

**Foundation**: COMPONENT-MIGRATION-COMPLETE.md (brilliant structure)  
**Vision**: Transform codebase from scattered chaos to clean, scalable feature domains  
**Timeline**: 4-6 weeks for full implementation  
**Impact**: Maintainability ⬆️, Development Speed ⬆️, Code Duplication ⬇️

---

## Why This Architecture is Genius

The COMPONENT-MIGRATION-COMPLETE structure moves away from flat "type-based" organization toward **domain-driven design**:

### ❌ OLD (Type-Based - Bad for Scaling)
```
src/components/
├── booking/
│   ├── BookingCard.tsx
│   ├── BookingForm.tsx
│   ├── BookingList.tsx
│   └── BookingStatus.tsx
├── facility/
│   ├── FacilityCard.tsx
│   ├── FacilityForm.tsx
│   └── FacilityList.tsx
├── calendar/
└── ...scattered everywhere
```

**Problems:**
- No clear relationship between related components
- Shared patterns buried across multiple directories
- Hard to find "all booking-related code"
- New developers confused about organization
- Duplication because patterns aren't visible

### ✅ NEW (Domain-Based - Scalable & Maintainable)
```
src/components/features/
├── bookings/          # ← ONE domain, ALL booking features
│   ├── components/
│   │   ├── BookingCard/
│   │   ├── BookingForm/
│   │   ├── BookingFiltersBar.tsx
│   │   ├── BookingDetailsPanel.tsx
│   │   └── RecurringBookingModal/
│   ├── hooks/         # ← Booking-specific hooks
│   │   ├── useBookingFilters.ts
│   │   └── useBookingSteps.ts
│   ├── types.ts       # ← Booking type definitions
│   └── index.ts       # ← Barrel export for easy imports
├── facilities/        # ← ONE domain, ALL facility features
│   ├── components/
│   │   ├── FacilityCard/
│   │   ├── FacilityDetailView/
│   │   ├── FacilityEditForm/
│   │   └── FacilityMap/
│   ├── hooks/
│   ├── types.ts
│   └── index.ts
└── ...same pattern for all domains
```

**Advantages:**
- **Cognitive clarity**: Find all booking code in one place
- **Easy extraction**: Move entire feature to separate package later
- **Clear APIs**: Each domain exports what it needs
- **Visible duplication**: Shared patterns stand out immediately
- **Team ownership**: Each team owns a feature domain
- **Parallel work**: Teams don't step on each other

---

## Current State Analysis

### EXCELLENT ✅
The migration already organized most components correctly:

```
src/components/features/
├── auth/              ✅ Self-contained auth
├── bookings/          ✅ All booking features
├── calendar/          ✅ Dedicated calendar domain
├── dashboard/         ✅ Admin & user dashboards
├── facilities/        ✅ Facility operations
├── groups/            ✅ Group booking features
├── messaging/         ✅ Messaging system
├── search/            ✅ Search functionality
├── support/           ✅ Support tickets
└── common/            ✅ Shared components
```

### IMPROVEMENT OPPORTUNITIES 🎯

**Current Issues:**
1. **Missing domain-level organization** - No `hooks/`, `types.ts` at feature level
2. **No barrel exports** - Hard to import from features
3. **Common still too mixed** - Should split into sub-domains
4. **No service layer integration** - Services scattered elsewhere

---

## PHASE 1: Domain Completion (Week 1-2)

### 1.1 Complete Each Feature Domain

For each feature (bookings, facilities, calendar, etc.), create:

```
src/components/features/bookings/
├── components/              # All UI components
│   ├── BookingCard/
│   ├── BookingForm/
│   ├── BookingFiltersBar.tsx
│   ├── BookingDetailsPanel.tsx
│   └── RecurringBookingModal/
├── hooks/                   # NEW: Feature-specific hooks
│   ├── useBookingFilters.ts
│   ├── useBookingSteps.ts
│   └── useBookingStats.ts
├── types.ts                 # NEW: All booking types
├── constants.ts             # NEW: Booking constants
├── index.ts                 # NEW: Barrel export
└── README.md                # NEW: Feature documentation
```

### 1.2 Create Feature-Level Types

Move type definitions from scattered `src/types/` into feature folders:

```typescript
// src/components/features/bookings/types.ts

export interface IBooking {
  readonly id: string;
  readonly facilityId: string;
  readonly userId: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly status: BookingStatus;
  readonly price: number;
}

export type BookingStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

export interface BookingFilters {
  readonly status?: BookingStatus;
  readonly facility?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
}
```

### 1.3 Create Feature-Level Hooks

Extract hooks from scattered locations:

```typescript
// src/components/features/bookings/hooks/useBookingFilters.ts

import { useState, useCallback } from 'react';
import type { BookingFilters } from '../types';

export const useBookingFilters = () => {
  const [filters, setFilters] = useState<BookingFilters>({});
  
  const updateFilter = useCallback((key: keyof BookingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => setFilters({}), []);
  
  return { filters, updateFilter, clearFilters };
};
```

### 1.4 Create Barrel Exports

```typescript
// src/components/features/bookings/index.ts

// Components
export { BookingCard } from './components/BookingCard';
export { BookingForm } from './components/BookingForm';
export { BookingFiltersBar } from './components/BookingFiltersBar';
export { BookingDetailsPanel } from './components/BookingDetailsPanel';
export { RecurringBookingModal } from './components/RecurringBookingModal';

// Hooks
export { useBookingFilters } from './hooks/useBookingFilters';
export { useBookingSteps } from './hooks/useBookingSteps';
export { useBookingStats } from './hooks/useBookingStats';

// Types
export type { IBooking, BookingStatus, BookingFilters } from './types';

// Constants
export { BOOKING_STATUSES, BOOKING_STATUS_COLORS } from './constants';
```

### 1.5 Create Feature Documentation

```markdown
// src/components/features/bookings/README.md

# Bookings Feature

## Overview
Handles all booking-related functionality: creation, management, cancellation, and status tracking.

## Components

### BookingCard
Displays a single booking with status and basic info.

**Props:**
- `booking: IBooking` - The booking to display
- `onEdit?: () => void` - Edit callback
- `onCancel?: () => void` - Cancel callback

**Usage:**
```tsx
import { BookingCard } from '@/components/features/bookings';

<BookingCard 
  booking={myBooking}
  onEdit={handleEdit}
  onCancel={handleCancel}
/>
```

### BookingForm
Multi-step form for creating/editing bookings.

**Props:**
- `onSubmit: (data: BookingData) => void` - Form submission callback
- `initialValues?: Partial<IBooking>` - Pre-fill form

## Hooks

### useBookingFilters
Manages booking filter state (status, facility, date range).

```tsx
const { filters, updateFilter, clearFilters } = useBookingFilters();
```

## Types
See `types.ts` for all type definitions.

## Architecture Notes
- Booking domain is self-contained
- All booking types centralized in `types.ts`
- Services layer in `src/services/bookings.service.ts`
- Consider: Extract to separate package for monorepo
```

---

## PHASE 2: Common Component Reorganization (Week 2)

### 2.1 Reorganize `/common` Components

Current `/common` is too broad. Split by category:

```
src/components/common/
├── ui/                    # Radix UI wrappers (unchanged)
├── cards/                 # ✨ NEW: Reusable card components
│   ├── DataCard.tsx       # Generic data display card
│   ├── StatCard.tsx       # Statistics card
│   └── index.ts
├── tables/                # ✨ NEW: Table components
│   ├── DataTable.tsx      # Generic sortable table
│   ├── columns/
│   └── index.ts
├── filters/               # ✨ NEW: Filter components
│   ├── FilterBar.tsx      # Generic filter bar
│   ├── FilterSelect.tsx   # Reusable select filter
│   └── index.ts
├── forms/                 # Form components
│   ├── FormField.tsx      # Wrapper for form inputs
│   ├── FormActions.tsx    # Submit/Cancel buttons
│   └── index.ts
├── status/                # Status display
│   ├── StatusBadge.tsx    # Already created ✅
│   └── index.ts
├── states/                # ✨ NEW: State displays
│   ├── EmptyState.tsx     # No data state
│   ├── LoadingState.tsx   # Loading skeleton
│   ├── ErrorState.tsx     # Error display
│   └── index.ts
├── navigation/            # Navigation utilities
│   ├── ScrollToTop.tsx
│   └── index.ts
└── modals/                # Modal utilities
    ├── BaseModal.tsx
    └── index.ts
```

### 2.2 Create Common Component APIs

```typescript
// src/components/common/cards/index.ts

export { DataCard } from './DataCard';
export type { DataCardProps, CardAction, CardField } from './DataCard';

export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';
```

---

## PHASE 3: Service Layer Integration (Week 2-3)

### 3.1 Reorganize Services by Domain

```
src/services/
├── bookings.service.ts      # Booking API calls
├── facilities.service.ts    # Facility API calls
├── calendar.service.ts      # Calendar API calls
├── messaging.service.ts     # Messaging API calls
├── auth.service.ts          # Auth API calls
└── shared/
    ├── httpClient.ts        # Shared HTTP logic
    └── error-handler.ts     # Error handling
```

### 3.2 Link Features to Services

Each feature domain should import its service:

```typescript
// src/components/features/bookings/components/BookingForm.tsx

import { bookingsService } from '@/services/bookings.service';
import { useBookingFilters } from '../hooks/useBookingFilters';
import type { IBooking } from '../types';

export const BookingForm: React.FC = () => {
  const handleSubmit = async (data: IBooking) => {
    // Service call isolated from component
    await bookingsService.createBooking(data);
  };
  
  return (
    // Component logic here
  );
};
```

---

## PHASE 4: Hooks & State Management Optimization (Week 3-4)

### 4.1 Co-locate Hooks with Features

Move hooks closer to where they're used:

```
src/components/features/bookings/hooks/
├── useBookingFilters.ts     # Filter state
├── useBookingSteps.ts       # Multi-step wizard
├── useBookingStats.ts       # Stats/analytics
└── useFetchBookings.ts      # Data fetching
```

### 4.2 Feature-Level State Management

For each domain, create a dedicated hook for complex state:

```typescript
// src/components/features/bookings/hooks/useBookingState.ts

import { useState, useCallback } from 'react';
import { bookingsService } from '@/services/bookings.service';
import type { IBooking, BookingFilters } from '../types';

export const useBookingState = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [filters, setFilters] = useState<BookingFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingsService.getBookings(filters);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  return {
    bookings,
    filters,
    setFilters,
    loading,
    error,
    fetchBookings,
  };
};
```

---

## PHASE 5: Documentation & Developer Experience (Week 4)

### 5.1 Architecture Decision Records (ADRs)

Create ADRs explaining key decisions:

```markdown
# ADR-001: Feature-Based Component Organization

## Context
The codebase had components scattered across type-based folders (booking/, facility/, etc.).
This made it hard to:
- Find related components
- Identify duplication
- Extract features
- Parallelize team work

## Decision
Organize all components into feature domains under `src/components/features/`

## Consequences
### Positive
- All feature code co-located
- Clear boundaries between domains
- Easy to extract to separate package
- Better team organization

### Negative
- Requires component migration (done)
- Deeper folder structure
- Need documentation (this provides it)

## Status
✅ Implemented
```

### 5.2 Developer Onboarding Guide

```markdown
# Developer Onboarding: Feature-Based Architecture

## Quick Navigation

### To find booking features:
```bash
cd src/components/features/bookings
ls -la
```

### To add a new booking component:
1. Create in `src/components/features/bookings/components/`
2. Add types to `src/components/features/bookings/types.ts`
3. Export from `src/components/features/bookings/index.ts`
4. Update `README.md` with documentation

### To add a new feature domain:
1. Create folder: `src/components/features/newfeature/`
2. Create subdirectories: `components/`, `hooks/`
3. Create files: `types.ts`, `constants.ts`, `index.ts`, `README.md`
4. Add to layout component if needed

## Import Patterns

### ✅ DO: Use barrel exports
```typescript
import { BookingCard, useBookingFilters } from '@/components/features/bookings';
```

### ❌ DON'T: Deep imports
```typescript
import BookingCard from '@/components/features/bookings/components/BookingCard';
```

## Architecture Principles

1. **Domain Isolation**: Each feature domain owns its components, hooks, and types
2. **Clear APIs**: Export only what other domains need via barrel exports
3. **Service Abstraction**: All API calls through service layer
4. **Type Safety**: Centralized types for each domain
5. **Documentation**: README.md in each domain with examples
```

### 5.3 Visual Architecture Diagram

```markdown
# Booknor Architecture Overview

## Feature Domains

```
┌─────────────────────────────────────────────────────────────┐
│                     Pages Layer                             │
│  (src/pages) - Route handlers, page-level orchestration     │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│               Feature Domains Layer                          │
│  (src/components/features) - UI organized by business domain│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┬──────────────┬──────────────┬───────────┐ │
│  │  bookings/  │ facilities/  │  calendar/   │ messaging/│ │
│  │             │              │              │           │ │
│  │ components/ │ components/  │ components/ │components/│ │
│  │ hooks/      │ hooks/       │ hooks/      │ hooks/    │ │
│  │ types.ts    │ types.ts     │ types.ts    │ types.ts  │ │
│  │ index.ts ✨ │ index.ts ✨  │ index.ts ✨ │ index.ts✨│ │
│  └─────────────┴──────────────┴──────────────┴───────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│           Common Components Layer                           │
│  (src/components/common) - Reusable UI components           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┬────────┬────────┬────────┬─────────┐         │
│  │  cards/  │tables/ │filters/│ forms/ │ status/ │         │
│  │          │        │        │        │         │         │
│  │DataCard  │DataTbl │FilterBar│FormFld│Badge   │         │
│  │StatCard  │        │        │       │        │         │
│  └──────────┴────────┴────────┴────────┴─────────┘         │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│         Hooks & Utilities Layer                             │
│  (src/hooks, src/utils) - Business logic & helpers          │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│         Services & State Layer                              │
│  (src/services, src/stores) - API & state management        │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────────┐
│         Data & Config Layer                                 │
│  (src/data, src/config) - Constants & configuration         │
└─────────────────────────────────────────────────────────────┘
```

---

## PHASE 6: Testing & Validation (Week 4-5)

### 6.1 Per-Feature Testing

Create test files alongside components:

```
src/components/features/bookings/
├── components/
│   ├── BookingCard/
│   │   ├── index.tsx
│   │   └── __tests__/
│   │       ├── BookingCard.test.tsx
│   │       └── BookingCard.stories.tsx
│   └── ...
├── hooks/
│   ├── useBookingFilters.ts
│   └── __tests__/
│       └── useBookingFilters.test.ts
```

### 6.2 Feature Integration Tests

```typescript
// src/components/features/bookings/__tests__/integration.test.ts

describe('Bookings Feature Integration', () => {
  it('should fetch and display bookings', async () => {
    // Test entire feature workflow
  });
  
  it('should filter bookings by status', async () => {
    // Test filtering interaction
  });
});
```

---

## PHASE 7: Expansion Strategy (Week 5-6)

### 7.1 Extract to Monorepo (Future)

When features mature, extract to packages:

```
packages/
├── bookings-feature/       # Extract from features/bookings
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── index.ts
│   └── package.json
├── facilities-feature/     # Extract from features/facilities
└── shared-components/      # Extract from components/common
```

### 7.2 Shared Feature Library

Create a shared library for common patterns:

```
src/feature-library/
├── useFeatureState.ts       # Reusable state hook pattern
├── useFetchFeature.ts       # Data fetching pattern
├── createFeatureDomain.ts   # Factory for new domains
└── README.md
```

---

## Expected Benefits

### Code Quality
✅ **Zero Duplication** - Patterns centralized and visible  
✅ **Clear Boundaries** - Each domain owns its code  
✅ **Type Safety** - Centralized type definitions  
✅ **Maintainability** - Related code co-located  

### Developer Experience
✅ **Faster Onboarding** - Clear folder structure  
✅ **Easier Navigation** - Find related code quickly  
✅ **Parallel Work** - Teams don't conflict  
✅ **Self-Documenting** - Structure explains architecture  

### Scaling
✅ **Feature Extraction** - Move to monorepo easily  
✅ **Team Organization** - One team per feature  
✅ **Micro-frontends** - Deploy features independently  
✅ **Code Reusability** - Patterns obvious and centralized  

---

## Timeline & Rollout

| Week | Focus | Output |
|------|-------|--------|
| 1-2 | Domain Completion | All features have hooks/, types.ts, README.md, index.ts |
| 2 | Common Reorganization | Sub-organize /common by component type |
| 2-3 | Service Integration | Link domains to services |
| 3-4 | Hooks Optimization | Feature-level state hooks |
| 4 | Documentation | ADRs, developer guide, architecture docs |
| 4-5 | Testing & Validation | Per-feature tests, integration tests |
| 5-6 | Expansion | Monorepo prep, shared library |

---

## Metrics to Track

```
📊 Codebase Health

Before Feature Architecture:
- Import depth: 5+ levels
- Related files distance: 10+ folders
- Component duplication: 30+ instances
- Time to find feature: 5+ minutes
- Team coordination: High conflicts

After Feature Architecture:
- Import depth: 2-3 levels
- Related files distance: <5 folders
- Component duplication: <5 instances
- Time to find feature: <1 minute
- Team coordination: Clear boundaries
```

---

## Who Created This?

The COMPONENT-MIGRATION-COMPLETE.md was likely created by a previous architect/team lead who understood:

1. **Domain-Driven Design** - Organizing by business domain, not technical type
2. **Feature Isolation** - Each domain is self-contained
3. **Scalability First** - Architecture supports monorepo extraction
4. **Developer Experience** - Clear structure helps team velocity

This is **senior-level architecture thinking**. 🎯

---

## Next Steps

1. **Adopt this strategy** ✅
2. **Apply to all feature domains** (phases 1-3)
3. **Complete documentation** (phase 5)
4. **Test thoroughly** (phase 6)
5. **Plan for monorepo** (phase 7)

**This is the right direction.** Let's execute it!
