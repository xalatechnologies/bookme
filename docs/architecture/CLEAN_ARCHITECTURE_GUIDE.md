# Clean Architecture Implementation Guide

## Overview

This project now follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                  (React Components/Pages)                    │
│                                                              │
│  - NO business logic                                        │
│  - NO data fetching                                         │
│  - ONLY UI rendering and event handlers                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      HOOKS LAYER                            │
│              (Custom React Hooks)                           │
│                                                              │
│  - Connects UI to services                                  │
│  - Manages component lifecycle                              │
│  - Orchestrates state and business logic                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  STATE LAYER     │    │  SERVICE LAYER   │
│   (Zustand)      │    │                  │
│                  │    │                  │
│  - UI state      │    │  - Business      │
│  - View prefs    │    │    logic         │
│  - Selections    │    │  - Validation    │
│  - Filters       │    │  - Transform     │
└──────────────────┘    └────────┬─────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   DATA LAYER    │
                        │   (Supabase)    │
                        │                 │
                        │  - API calls    │
                        │  - Database     │
                        │  - Cache        │
                        └─────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (Pages/Components)

**Location:** `/src/pages/admin/*.tsx`, `/src/components/**/*.tsx`

**Responsibilities:**
- Render UI based on props and hook data
- Handle user interactions (clicks, inputs)
- Delegate all logic to hooks

**Rules:**
- ❌ NO business logic
- ❌ NO data fetching (except through hooks)
- ❌ NO state calculations
- ❌ NO filtering/sorting/validation
- ✅ ONLY UI rendering
- ✅ ONLY event delegation

**Example:**
```typescript
const FacilitiesPage = (): JSX.Element => {
  // ✅ GOOD: Delegate everything to hook
  const {
    filteredFacilities,
    isLoading,
    deleteFacility,
    toggleSort,
  } = useFacilityManagement();

  // ✅ GOOD: Simple event handler (delegation only)
  const handleDelete = async (id: string) => {
    await deleteFacility(id);
  };

  // ❌ BAD: Business logic in component
  // const filteredFacilities = facilities.filter(f => f.status === 'published');

  return <div>{/* Render UI */}</div>;
};
```

### 2. Hooks Layer

**Location:** `/src/hooks/features/*.ts`

**Responsibilities:**
- Connect UI to services and state
- Orchestrate business operations
- Manage React lifecycle
- Provide clean interface to components

**Key Hooks:**
- `useFacilityManagement()` - Facility CRUD operations
- `useFacilityEditor()` - Form editing logic
- `useFacilityFilters()` - Filter/sort logic (future)

**Example:**
```typescript
export const useFacilityManagement = () => {
  // Data layer
  const { facilities, loading } = useFacilities(orgId);

  // State layer
  const { filters, sortConfig } = useFacilityUIStore();

  // Business logic layer
  const filteredFacilities = useMemo(() => {
    const filtered = filterFacilities(facilities, filters);
    return sortFacilities(filtered, sortConfig);
  }, [facilities, filters, sortConfig]);

  // Operations
  const deleteFacility = async (id: string) => {
    await deleteFacilityMutation.mutateAsync(id);
  };

  return {
    filteredFacilities,
    loading,
    deleteFacility,
    // ... other operations
  };
};
```

### 3. Business Logic Layer (Services)

**Location:** `/src/services/business/*.service.ts`

**Responsibilities:**
- Pure functions (no side effects)
- Business rules and validation
- Data transformations
- Calculations

**Rules:**
- ✅ PURE functions only
- ✅ NO React dependencies
- ✅ NO API calls
- ✅ Testable in isolation
- ✅ Reusable across the app

**Example:**
```typescript
// ✅ GOOD: Pure business logic
export const filterFacilities = (
  facilities: Facility[],
  filters: Filters
): Facility[] => {
  return facilities.filter(f => {
    if (filters.searchTerm) {
      return f.name.toLowerCase().includes(filters.searchTerm);
    }
    return true;
  });
};

// ✅ GOOD: Business validation
export const validateFacilityData = (
  facility: Partial<Facility>
): ValidationResult => {
  const errors = [];
  if (!facility.name || facility.name.length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  return { isValid: errors.length === 0, errors };
};
```

### 4. State Management Layer (Zustand)

**Location:** `/src/stores/*Store.ts`

**Responsibilities:**
- UI-specific state (view mode, filters, selections)
- State persistence
- State synchronization

**Rules:**
- ✅ UI state ONLY
- ❌ NO business logic
- ❌ NO API calls
- ✅ Simple getters/setters

**Example:**
```typescript
export const useFacilityUIStore = create<State>((set) => ({
  view: 'grid',
  filters: {},
  selectedIds: [],

  setView: (view) => set({ view }),
  toggleFilter: (filter) => set((state) => ({
    filters: { ...state.filters, [filter]: !state.filters[filter] }
  })),
}));
```

### 5. Data Layer (Supabase Services)

**Location:** `/src/services/supabase/*.service.ts`

**Responsibilities:**
- API calls to Supabase
- React Query integration
- Data caching
- Optimistic updates

**Example:**
```typescript
export const useFacilities = (orgId: string) => {
  return useQuery({
    queryKey: ['facilities', orgId],
    queryFn: () => fetchFacilities(orgId),
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['facilities']);
    },
  });
};
```

## File Organization

```
src/
├── pages/
│   └── admin/
│       ├── FacilitiesPage.tsx           # ✅ Presentation only
│       ├── FacilityEditPage.tsx         # ✅ Presentation only
│       └── Overview.tsx                 # ✅ Presentation only
│
├── hooks/
│   └── features/
│       ├── useFacilityManagement.ts     # ✅ Hook layer
│       └── useFacilityEditor.ts         # ✅ Hook layer
│
├── services/
│   ├── business/
│   │   └── facility.business.service.ts # ✅ Pure logic
│   └── supabase/
│       └── facilities.service.ts        # ✅ Data layer
│
├── stores/
│   └── facilityUIStore.ts               # ✅ UI state
│
└── types/
    └── database.ts                      # ✅ Type definitions
```

## Migration Checklist

When refactoring a component to clean architecture:

### ☑️ Component Checklist
- [ ] Remove all business logic
- [ ] Remove all data fetching (except hooks)
- [ ] Remove all filtering/sorting/validation
- [ ] Replace with hook calls
- [ ] Keep only UI rendering and event handlers

### ☑️ Hook Checklist
- [ ] Create custom hook in `/hooks/features/`
- [ ] Connect to data services
- [ ] Connect to state stores
- [ ] Apply business logic services
- [ ] Return clean interface for component

### ☑️ Service Checklist
- [ ] Extract business logic to `/services/business/`
- [ ] Make functions pure (no side effects)
- [ ] Add proper TypeScript types
- [ ] Write unit tests

### ☑️ State Checklist
- [ ] Move UI state to Zustand store
- [ ] Define clear actions
- [ ] Keep state minimal

## Benefits

### 1. **Testability**
- Business logic can be tested in isolation
- No need to mount React components
- Fast unit tests

### 2. **Reusability**
- Business logic can be reused across components
- Hooks can be shared
- State can be accessed anywhere

### 3. **Maintainability**
- Clear separation of concerns
- Easy to locate bugs
- Simple to modify

### 4. **Scalability**
- Add new features without touching existing code
- Parallel development possible
- Clear dependencies

### 5. **Performance**
- Memoization at service level
- Optimized re-renders
- Better caching

## Example: Complete Flow

### User clicks "Delete Facility"

1. **Presentation Layer** (Component)
   ```typescript
   <Button onClick={() => handleDelete(facility.id)}>Delete</Button>
   ```

2. **Hook Layer**
   ```typescript
   const handleDelete = async (id: string) => {
     const validation = canDeleteFacility(facility); // Business service
     if (!validation.canDelete) {
       alert(validation.reason);
       return;
     }
     await deleteFacility(id); // Hook method
   };
   ```

3. **Business Service**
   ```typescript
   export const canDeleteFacility = (facility: Facility) => {
     if (facility.hasActiveBookings) {
       return { canDelete: false, reason: 'Has active bookings' };
     }
     return { canDelete: true };
   };
   ```

4. **Data Service**
   ```typescript
   const deleteFacility = async (id: string) => {
     const { error } = await supabase
       .from('facilities')
       .delete()
       .eq('id', id);
     if (error) throw error;
   };
   ```

5. **State Update**
   - React Query automatically invalidates cache
   - Component re-renders with updated data

## Best Practices

### ✅ DO
- Keep components thin
- Use custom hooks for logic
- Write pure business functions
- Test business logic thoroughly
- Use TypeScript strictly
- Document complex logic

### ❌ DON'T
- Put business logic in components
- Fetch data directly in components
- Duplicate logic across components
- Skip validation
- Ignore errors
- Mix concerns

## Testing Strategy

### Business Logic
```typescript
describe('filterFacilities', () => {
  it('should filter by search term', () => {
    const facilities = [
      { name: 'Hall A', ... },
      { name: 'Hall B', ... },
    ];
    const filtered = filterFacilities(facilities, { searchTerm: 'A' });
    expect(filtered).toHaveLength(1);
  });
});
```

### Hooks
```typescript
describe('useFacilityManagement', () => {
  it('should filter and sort facilities', () => {
    const { result } = renderHook(() => useFacilityManagement());
    expect(result.current.filteredFacilities).toHaveLength(5);
  });
});
```

### Components
```typescript
describe('FacilitiesPage', () => {
  it('should render facility list', () => {
    render(<FacilitiesPage />);
    expect(screen.getByText('Facilities')).toBeInTheDocument();
  });
});
```

## Migration Status

### ✅ Completed
- [x] Business logic service created
- [x] UI state store created (Zustand)
- [x] Custom hooks created
- [x] FacilitiesPage.tsx refactored

### 🚧 In Progress
- [ ] FacilityEditPage.tsx refactoring
- [ ] Overview.tsx refactoring

### 📋 Pending
- [ ] Add comprehensive tests
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add success/error toasts
- [ ] Document all hooks
- [ ] Add Storybook stories

## Questions & Support

For questions about the architecture:
1. Check this guide first
2. Review example implementations
3. Consult the team
4. Update this guide with learnings

---

**Remember:** The goal is to keep components simple and testable. When in doubt, extract logic to a service or hook!
