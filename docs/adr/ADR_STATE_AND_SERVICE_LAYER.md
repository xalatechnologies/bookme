# ADR: State Management and Service Layer Architecture

## Status
**Accepted** - 2024-12-08

## Context

The BookMe application was experiencing architectural inconsistencies:

1. **State Management Duplication**: Both React Context and Zustand were used for overlapping concerns (e.g., CartContext wrapping cartStore)
2. **Direct Database Calls**: Many components and pages made direct Supabase calls instead of using the service layer
3. **Heavy Pages**: Complex pages like `Index.tsx` contained too much logic (data fetching, filtering, redirects, business logic)
4. **Unclear Boundaries**: No clear separation between UI components, business logic, and data access

This led to:
- Code duplication
- Difficult testing
- Inconsistent patterns
- Poor maintainability
- Violations of separation of concerns

## Decision

We will enforce a **strict layered architecture** with clear responsibilities:

### Layer 1: Supabase Client
- **Location**: `src/lib/clients/supabase.ts`
- **Responsibility**: Single Supabase client instance only
- **Access**: NEVER directly used by components/pages
- **Rule**: Only `services/supabase/*` may import this

### Layer 2: Supabase Services
- **Location**: `src/services/supabase/*`
- **Responsibility**: Pure data access operations (CRUD)
- **Access**: Called by business services or specialized hooks
- **Pattern**: One service per table/domain entity
- **Rules**:
  - Type-safe method signatures
  - No business logic
  - RLS policy documentation
  - Proper error handling

### Layer 3: Business Services  
- **Location**: `src/services/business/*`
- **Responsibility**: Business logic and orchestration
- **Access**: Called by hooks
- **Pattern**: Domain-specific orchestration
- **Rules**:
  - Can call multiple Supabase services
  - Implements business rules
  - Handles complex workflows
  - Returns formatted/computed data

### Layer 4: Hooks
- **Location**: `src/hooks/*`
- **Responsibility**: React integration and component logic
- **Access**: Called by components/pages
- **Pattern**: Feature-specific or shared hooks
- **Rules**:
  - Manages React state
  - Calls business or supabase services
  - Handles loading/error states
  - Provides data and actions to components

### Layer 5: State Management

#### React Context (for core user state)
- **AuthContext**: User, session, profile, memberships
- **UserProfileContext**: Display info, avatar
- **LanguageContext**: i18n language selection
- **Rule**: Use ONLY for app-wide user state

#### Zustand Stores (for UI and transient state)
- **UI Stores** (`*UIStore.ts`): Modals, panels, toggles, view modes
- **Domain Stores** (`*Store.ts`): Cart, favorites, drafts, selections
- **Rule**: Use for feature-scoped state and localStorage persistence

### Layer 6: Components & Pages
- **Responsibility**: UI rendering and user interaction
- **Access**: Consume hooks for data/actions
- **Rules**:
  - NO direct Supabase calls
  - NO direct service calls
  - Minimal local business logic
  - Primarily composition and presentation

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Components & Pages                          │
│  - Render UI                                                 │
│  - Handle user interactions                                  │
│  - Compose child components                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌──────────────────────┬──────────────────────────────────────┐
│   React Context      │      Zustand Stores                  │
│                      │                                       │
│  - AuthContext       │  UI: *UIStore.ts                     │
│  - UserProfile       │  Domain: *Store.ts                   │
│  - Language          │  (cart, favorites, etc.)             │
└──────────────────────┴──────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                         Hooks Layer                          │
│  - useAuth, useCart, useFacility, etc.                      │
│  - Manage React state (loading, error)                      │
│  - Call services and return data/actions                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Business Services Layer                    │
│  services/business/*                                        │
│  - Orchestrate multiple data sources                        │
│  - Implement business rules                                 │
│  - Format and compute derived data                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Services Layer                    │
│  services/supabase/*                                        │
│  - CRUD operations per table                                │
│  - Type-safe queries                                        │
│  - Error handling                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Client                         │
│  lib/clients/supabase.ts                                    │
│  - Single client instance                                   │
│  - ONLY imported by services/supabase/*                     │
└─────────────────────────────────────────────────────────────┘
```

## Example Implementations

### Bad ❌ (Before)

```tsx
// pages/Index.tsx
import { supabase } from '@/lib/clients/supabase';

export const Index = () => {
  const [facilities, setFacilities] = useState([]);
  
  useEffect(() => {
    // Direct Supabase call in page component
    supabase
      .from('facilities')
      .select('*')
      .eq('status', 'active')
      .then(({ data }) => setFacilities(data));
  }, []);
  
  // ... 200 more lines of logic in the page component
};
```

### Good ✅ (After)

```tsx
// services/supabase/facilities.service.ts
export const facilitiesService = {
  async getActiveFacilities(orgId: string) {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('status', 'active')
      .eq('org_id', orgId);
    
    if (error) throw error;
    return data;
  }
};

// services/business/facility.business.service.ts
export const facilityBusinessService = {
  async searchFacilities(filters: FacilityFilters, orgId: string) {
    const facilities = await facilitiesService.getActiveFacilities(orgId);
    
    // Business logic: filtering, sorting, mapping
    return facilities
      .filter(f => applyFilters(f, filters))
      .sort(applySorting);
  }
};

// hooks/useFacilitySearch.ts
export const useFacilitySearch = (filters: FacilityFilters) => {
  const { currentOrgId } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentOrgId) return;
    
    facilityBusinessService
      .searchFacilities(filters, currentOrgId)
      .then(setFacilities)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters, currentOrgId]);
  
  return { facilities, loading, error };
};

// pages/Index.tsx
export const Index = () => {
  const [filters, setFilters] = useState({});
  const { facilities, loading, error } = useFacilitySearch(filters);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <SearchFilters filters={filters} onChange={setFilters} />
      <FacilityList facilities={facilities} />
    </div>
  );
};
```

## Migration Strategy

### Phase 1: State Management Cleanup ✅
- [x] Document state management boundaries
- [x] Remove CartContext (duplicates cartStore)
- [x] Update all components to use Zustand stores directly
- [x] Verify no state duplication

### Phase 2: Service Layer (In Progress)
- [ ] Map all direct Supabase calls outside services
- [ ] Move direct calls to appropriate services
- [ ] Create missing business services
- [ ] Update components to use services via hooks

### Phase 3: Page Refactoring
- [ ] Create `useIndexPageLogic` hook
- [ ] Create `useAdminSettingsLogic` hook
- [ ] Create hooks for other heavy pages
- [ ] Refactor pages to use hooks

### Phase 4: Verification
- [ ] Audit all imports of `@/lib/clients/supabase`
- [ ] Ensure only `services/supabase/*` import client
- [ ] Update architecture documentation
- [ ] Add architecture tests (lint rules)

## Benefits

1. **Testability**: Each layer can be tested in isolation
2. **Maintainability**: Clear boundaries make changes predictable
3. **Reusability**: Services can be reused across features
4. **Type Safety**: Typed interfaces at each layer
5. **Performance**: Better code splitting and lazy loading
6. **Debugging**: Easier to trace data flow
7. **Onboarding**: New developers understand structure quickly

## Rules & Enforcement

### Strict Rules

1. **NO direct Supabase imports** in:
   - Components (`src/components/*`)
   - Pages (`src/pages/*`)
   - Contexts (`src/contexts/*`)
   - Stores (`src/stores/*`)

2. **Hooks MUST NOT** implement business logic
   - Use business services for logic
   - Hooks only manage React state

3. **Services MUST NOT** import React
   - Pure JavaScript/TypeScript only
   - No hooks, no JSX, no React state

4. **Each layer ONLY calls** layer directly below
   - Pages/Components → Hooks
   - Hooks → Business Services or Supabase Services
   - Business Services → Supabase Services
   - Supabase Services → Supabase Client

### Allowed Exceptions

1. **AuthContext**: May call Supabase auth directly (auth.signIn, auth.signOut)
   - Reason: Auth is fundamental and managed by Supabase client
   - Exception documented in AuthContext

2. **Real-time hooks**: May setup Supabase subscriptions directly
   - Reason: Real-time subscriptions require channel setup
   - Must use services for initial data fetch

3. **LanguageContext**: May save preference to profiles table
   - Reason: Language is global setting
   - Should use profiles service in future refactor

## Consequences

### Positive
- Clear separation of concerns
- Easier to test and maintain
- Better type safety
- Consistent patterns across codebase
- Reduced code duplication

### Negative
- More files to manage
- Slight learning curve for new patterns
- Refactoring effort required for existing code

### Mitigation
- Comprehensive documentation (this ADR + STATE_MANAGEMENT.md)
- Example implementations for common patterns
- Gradual migration approach
- Lint rules to enforce architecture

## References

- [State Management Documentation](../dev/STATE_MANAGEMENT.md)
- [Services Architecture](../../src/services/SERVICES_ARCHITECTURE.md)
- [Supabase Services README](../../src/services/supabase/README.md)

## Revision History

- **2024-12-08**: Initial ADR created
- **2024-12-08**: Phase 1 (State Management Cleanup) completed
