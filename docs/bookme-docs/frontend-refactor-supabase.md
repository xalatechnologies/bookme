# Frontend Refactor to Supabase

## Before

The application was using a mock HTTP client for data fetching:
- Data was stored in localStorage via Zustand stores
- Services used `httpClient.get('/facilities')` pattern
- No real backend integration
- All data was static/mock

## After

The application now uses Supabase as the backend:
- Real database integration
- Services extend `BaseSupabaseService` for consistent error handling
- React Query hooks for data fetching and caching
- Proper TypeScript typing with shared types

## New Folder Structure

```
src/
├── services/
│   ├── supabase/
│   │   ├── base.service.ts
│   │   ├── facilities.service.ts
│   │   └── bookings.service.ts
│   ├── facilities.service.ts (React Query hooks)
│   └── http.ts (legacy, to be removed)
├── hooks/
│   └── useBookings.ts
├── types/
│   ├── facility.ts
│   ├── booking.ts
│   └── organization.ts
└── lib/
    └── clients/
        └── supabase.ts
```

## Service Rules

1. **All Supabase services must extend `BaseSupabaseService`**
   - Located at `/src/services/supabase/base.service.ts`
   - Provides protected `client` instance
   - Provides standardized `handle` method for error handling

2. **Services should only contain data fetching logic**
   - No state management in services
   - Services are pure functions that interact with Supabase

3. **React Query hooks should wrap services**
   - Located in `/src/services/facilities.service.ts` (for facilities)
   - Provide caching, loading states, and error handling
   - Exported for use in components

4. **Types should be centralized**
   - All domain types in `/src/types/`
   - Services and stores import from types directory
   - No duplicate type definitions

5. **Environment variables**
   - Supabase configuration in `.env` file
   - Variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Validation in client initialization

## Migration Path

1. Created Supabase client at `/src/lib/clients/supabase.ts`
2. Created base service with error handling
3. Migrated facilities service to Supabase
4. Created bookings service
5. Created React Query hooks
6. Centralized type definitions
7. Updated stores to use centralized types

## Benefits

- Real backend integration
- Consistent error handling
- Better type safety
- Improved data fetching with caching
- Scalable architecture
- Reduced coupling between components and data