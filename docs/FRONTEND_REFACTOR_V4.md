# Frontend Refactor V4 - BookMe

## Old vs. New Structure

### Old Structure (Before Refactor)
```
src/
  components/           # Mixed UI + data fetching
  contexts/             # React contexts
  hooks/                # Some hooks, but mixed with components
  services/             # Mixed React + Supabase logic
    supabase/           # Duplicate services
  stores/               # Zustand stores
  types/                # Scattered type definitions
```

### New Structure (After Refactor)
```
src/
  app/ or pages/                  # Routing / entry points
  components/                     # Pure presentational components (no data fetching)
    facilities/
    bookings/
    layout/
    ui/
  features/                       # Feature-level containers
    facilities/
    bookings/
    organizations/
  hooks/                          # React hooks for data (React Query)
    useFacilities.ts
    useBookings.ts
    useOrganizations.ts
    useCurrentUser.ts
    useAvailability.ts
  services/
    supabase/                     # Pure Supabase data services (no React imports)
      base.service.ts
      facilities.service.ts
      bookings.service.ts
      organizations.service.ts
    http/                         # Optional HTTP client if needed
      httpClient.ts
  lib/
    clients/
      supabase.ts                 # Single Supabase client
  mappers/                        # DB → UI data mappers
    facility.mapper.ts
    booking.mapper.ts
  stores/                         # Zustand or context state (if used)
  types/                          # Shared domain interfaces
    facility.ts
    booking.ts
    organization.ts
    user.ts
  utils/                          # Generic helpers
  docs/
    FRONTEND_REFACTOR_V4.md       # This document
```

## Naming Conventions

1. **Services**: `*.service.ts` - Pure data access logic
2. **Hooks**: `use*.ts` - React integration with React Query
3. **Mappers**: `*.mapper.ts` - Data transformation logic
4. **Types**: `*.ts` - Domain interfaces and types
5. **Components**: `*.tsx` - Pure UI with no data fetching

## Rules for Adding New Features

### 1. Service Layer (Data Access)
- Located in `src/services/supabase/`
- Extend `BaseSupabaseService`
- Only contain async CRUD methods
- No React imports allowed
- Use mappers to transform data shapes
- Handle errors with `this.handle()`

Example:
```typescript
// src/services/supabase/facilities.service.ts
import { BaseSupabaseService } from './base.service';
import type { IFacility } from '@/types/facility';

class FacilitiesService extends BaseSupabaseService {
  async getAll() {
    const res = await this.client.from('facilities').select('*');
    return this.handle<readonly IFacility[]>(res);
  }
}
```

### 2. Hook Layer (React Integration)
- Located in `src/hooks/`
- Use React Query for caching and state management
- Import services from `src/services/supabase/`
- Export React Query hooks

Example:
```typescript
// src/hooks/useFacilities.ts
import { useQuery } from '@tanstack/react-query';
import { facilitiesService } from '@/services/supabase/facilities.service';

export const useFacilities = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: facilitiesService.getAll,
  });
};
```

### 3. Component Layer (UI)
- Located in `src/components/`
- Import only from `src/hooks/`
- Pure presentational components
- No direct data fetching
- No Supabase imports

Example:
```typescript
// src/components/facilities/FacilitiesList.tsx
import { useFacilities } from '@/hooks/useFacilities';

export function FacilitiesList() {
  const { data: facilities, isLoading } = useFacilities();
  // Render UI
}
```

### 4. Type Layer (Domain Models)
- Located in `src/types/`
- Centralized type definitions
- Imported by services, hooks, and components
- No implementation logic

Example:
```typescript
// src/types/facility.ts
export interface IFacility {
  id: string;
  name: string;
  description: string;
  // ... other properties
}
```

### 5. Mapper Layer (Data Transformation)
- Located in `src/mappers/`
- Transform between DB shapes and UI shapes
- Handle snake_case ↔ camelCase conversion
- Pure functions with no side effects

Example:
```typescript
// src/mappers/facility.mapper.ts
import type { IFacility } from '@/types/facility';

export function mapFacilityFromDb(row: any): IFacility {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    // ... map other properties
  };
}
```

## Do's and Don'ts

### ✅ Do's
- Services only import from `@/types/` and `@/mappers/`
- Hooks only import from `@/services/supabase/` and `@/types/`
- Components only import from `@/hooks/` and `@/types/`
- Use mappers to transform data shapes
- Centralize types in `src/types/`
- Separate data access from React concerns

### ❌ Don'ts
- Don't import React in service files
- Don't import Supabase directly in components
- Don't mix data fetching with UI logic
- Don't duplicate type definitions
- Don't put React Query hooks in service files
- Don't put UI logic in service files

## Migration Path

1. **Identify mixed files**: Files importing both React and Supabase
2. **Split concerns**: Move React Query logic to hooks, Supabase logic to services
3. **Centralize types**: Move interfaces to `src/types/`
4. **Add mappers**: Create transformation functions for data shapes
5. **Update imports**: Components import from hooks, hooks import from services
6. **Verify separation**: No React imports in services, no Supabase in components

## Benefits

1. **Clear separation of concerns**: Data access, React integration, and UI are distinct
2. **Improved testability**: Each layer can be tested independently
3. **Better reusability**: Services can be used outside React contexts
4. **Easier maintenance**: Changes to one layer don't affect others
5. **Enhanced scalability**: New features follow consistent patterns
6. **Reduced coupling**: Components depend only on hooks, not implementation details