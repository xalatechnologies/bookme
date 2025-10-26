# Supabase Migration Plan: From localStorage to Backend

## Executive Summary

This document outlines the complete migration strategy from localStorage-based Zustand stores to Supabase-backed data persistence. The migration will modernize the frontend architecture while maintaining feature parity and data integrity.

---

## Current Architecture Analysis

### ✅ What We Have

**State Management:**
- Zustand stores with `persist` middleware → localStorage
- React Query (`@tanstack/react-query`) for caching
- HTTP client (`services/http.ts`) for REST API calls

**Existing Stores (with localStorage persistence):**
1. `facilityStore.ts` - Facilities data
2. `cartStore.ts` - Shopping cart
3. `favoritesStore.ts` - User favorites
4. `groupStore.ts` - Booking groups
5. `recurringBookingStore.ts` - Recurring bookings
6. `messageStore.ts` - Messages
7. `supportStore.ts` - Support tickets
8. `zoneStore.ts` - Zones/areas
9. `fieldConfigStore.ts` - Field configurations
10. `slotSelectionStore.ts` - Slot selection state (ephemeral)

**Services:**
- `services/facilities.service.ts` - React Query hooks for facilities
- `services/calendar.service.ts` - Calendar operations
- `services/history.service.ts` - History tracking
- `services/http.ts` - Generic HTTP client

**Hooks:**
- Various hooks mixing Zustand and React Query approaches
- Some hooks use stores directly, others use services

### ⚠️ Problems to Solve

1. **Dual Pattern Confusion**: Both Zustand stores AND React Query services exist
2. **localStorage Limitations**: No real-time sync, no multi-device, no server validation
3. **Mock Data**: Stores contain hardcoded initial data instead of fetching from backend
4. **Inconsistent Architecture**: Some features use services, others use stores directly
5. **No Authentication Context**: Missing user session management
6. **No Real-time Updates**: No subscriptions for collaborative features

---

## Target Architecture

### 🎯 Modern State Management Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─── React Query Hooks (API State)
                 │    └─── useQuery, useMutation
                 │         └─── Supabase Services
                 │              └─── Supabase Client
                 │
                 ├─── Zustand Stores (UI State Only)
                 │    └─── slotSelection, filters, modals
                 │
                 └─── React Context (Global State)
                      └─── Auth, Theme, Language
```

**Key Principles:**
1. **React Query** for all server state (facilities, bookings, messages, etc.)
2. **Zustand** ONLY for ephemeral UI state (selections, filters, modals)
3. **React Context** for truly global state (auth, theme, i18n)
4. **Supabase** as single source of truth for persisted data

---

## Migration Strategy

### Phase 1: Foundation (Week 1)

#### 1.1 Supabase Client Setup

**File: `src/lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

#### 1.2 Authentication Context

**File: `src/contexts/AuthContext.tsx`**
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  readonly user: User | null;
  readonly session: Session | null;
  readonly loading: boolean;
  readonly signIn: (email: string) => Promise<void>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### 1.3 React Query Configuration

**File: `src/lib/queryClient.ts`**
```typescript
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        const postgrestError = error as PostgrestError;
        if (postgrestError.code && parseInt(postgrestError.code) >= 400 && parseInt(postgrestError.code) < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query error:', error);
      // TODO: Add toast notification
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
      // TODO: Add toast notification
    },
  }),
});
```

#### 1.4 TypeScript Database Types

**Generate from Supabase:**
```bash
cd "/Volumes/Development/Xala Products/bookme"
npx supabase gen types typescript --local > ~/Documents/xaheen/bookme/src/types/database.ts
```

---

### Phase 2: Service Layer (Week 2)

Create Supabase services to replace localStorage. Each service handles CRUD operations for one domain.

#### 2.1 Facility Service

**File: `src/services/supabase/facilities.service.ts`**
```typescript
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Facility = Database['public']['Tables']['facilities']['Row'];
type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

// Service functions
export const facilitiesService = {
  async getAll(orgId: string): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(facility: FacilityInsert): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .insert(facility)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: FacilityUpdate): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // With zones
  async getWithZones(id: string): Promise<Facility & { zones: any[] }> {
    const { data, error } = await supabase
      .from('facilities')
      .select(`
        *,
        zones (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

// React Query hooks
export const useFacilities = (orgId: string) => {
  return useQuery({
    queryKey: ['facilities', orgId],
    queryFn: () => facilitiesService.getAll(orgId),
    enabled: !!orgId,
  });
};

export const useFacility = (id: string) => {
  return useQuery({
    queryKey: ['facilities', id],
    queryFn: () => facilitiesService.getById(id),
    enabled: !!id,
  });
};

export const useFacilityWithZones = (id: string) => {
  return useQuery({
    queryKey: ['facilities', id, 'zones'],
    queryFn: () => facilitiesService.getWithZones(id),
    enabled: !!id,
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: FacilityUpdate }) =>
      facilitiesService.update(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', id] });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};
```

#### 2.2 Bookings Service

**File: `src/services/supabase/bookings.service.ts`**
```typescript
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export const bookingsService = {
  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        facility:facilities (*),
        zone:zones (*)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(booking: BookingInsert): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: BookingUpdate): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancel(id: string): Promise<Booking> {
    return this.update(id, { status: 'cancelled' });
  },

  // Check availability
  async checkAvailability(
    facilityId: string,
    zoneId: string | null,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_availability', {
      p_facility_id: facilityId,
      p_zone_id: zoneId,
      p_start_time: startTime,
      p_end_time: endTime,
    });

    if (error) throw error;
    return data;
  },
};

export const useUserBookings = (userId: string) => {
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => bookingsService.getUserBookings(userId),
    enabled: !!userId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
```

#### 2.3 Cart Service (Special Case)

Cart is a **hybrid**: server-side for persisted cart, client-side for temporary selections.

**File: `src/services/supabase/cart.service.ts`**
```typescript
// Cart items that should be persisted to server
export const cartService = {
  async getUserCart(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async addItem(item: any): Promise<any> {
    const { data, error } = await supabase
      .from('cart_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// Keep Zustand store for UI state only
export const useCartStore = create<CartUIState>()(
  devtools((set, get) => ({
    // NO persistence middleware
    selectedSlots: [],
    isDrawerOpen: false,
    // ... UI state only
  }))
);
```

#### 2.4 Additional Services to Create

Following the same pattern, create these services:

- `src/services/supabase/zones.service.ts`
- `src/services/supabase/groups.service.ts`
- `src/services/supabase/recurring.service.ts`
- `src/services/supabase/messages.service.ts`
- `src/services/supabase/support.service.ts`
- `src/services/supabase/favorites.service.ts`
- `src/services/supabase/notifications.service.ts`

---

### Phase 3: Real-time Subscriptions (Week 3)

Add real-time updates for collaborative features.

**File: `src/hooks/useRealtimeBookings.ts`**
```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useRealtimeBookings = (facilityId: string): void => {
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
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [facilityId, queryClient]);
};
```

**File: `src/hooks/useRealtimeMessages.ts`**
```typescript
export const useRealtimeMessages = (threadId: string): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);
};
```

---

### Phase 4: Refactor Components (Week 4)

#### Before (using Zustand store):
```typescript
import { useFacilityStore } from '@/stores/facilityStore';

export const FacilityList = (): JSX.Element => {
  const { facilities, updateFacility } = useFacilityStore();

  return (
    <div>
      {facilities.map(facility => (
        <FacilityCard key={facility.id} facility={facility} />
      ))}
    </div>
  );
};
```

#### After (using React Query):
```typescript
import { useFacilities } from '@/services/supabase/facilities.service';
import { useAuth } from '@/contexts/AuthContext';

export const FacilityList = (): JSX.Element => {
  const { user } = useAuth();
  const { data: facilities, isLoading, error } = useFacilities(user?.org_id!);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {facilities?.map(facility => (
        <FacilityCard key={facility.id} facility={facility} />
      ))}
    </div>
  );
};
```

---

### Phase 5: Data Migration (Week 5)

Create a migration script to move existing localStorage data to Supabase.

**File: `src/utils/migrateLocalStorageData.ts`**
```typescript
import { supabase } from '@/lib/supabase';

interface MigrationResult {
  readonly success: boolean;
  readonly migrated: number;
  readonly failed: number;
  readonly errors: readonly string[];
}

export const migrateLocalStorageData = async (
  userId: string,
  orgId: string
): Promise<MigrationResult> => {
  const errors: string[] = [];
  let migrated = 0;
  let failed = 0;

  try {
    // 1. Migrate favorites
    const favoritesData = localStorage.getItem('favorites-store');
    if (favoritesData) {
      const { state } = JSON.parse(favoritesData);
      const favorites = state.favorites || [];

      for (const facilityId of favorites) {
        try {
          await supabase.from('user_favorites').insert({
            user_id: userId,
            facility_id: facilityId,
          });
          migrated++;
        } catch (error) {
          failed++;
          errors.push(`Failed to migrate favorite ${facilityId}: ${error}`);
        }
      }
    }

    // 2. Migrate cart items
    const cartData = localStorage.getItem('cart-store');
    if (cartData) {
      const { state } = JSON.parse(cartData);
      const items = state.items || [];

      for (const item of items) {
        try {
          await supabase.from('cart_items').insert({
            user_id: userId,
            facility_id: item.facilityId,
            zone_id: item.zoneId,
            start_time: item.startTime,
            end_time: item.endTime,
            // ... map other fields
          });
          migrated++;
        } catch (error) {
          failed++;
          errors.push(`Failed to migrate cart item: ${error}`);
        }
      }
    }

    // 3. Clear localStorage after successful migration
    if (failed === 0) {
      localStorage.removeItem('favorites-store');
      localStorage.removeItem('cart-store');
      localStorage.removeItem('facility-store');
      // ... clear other stores
    }

    return {
      success: failed === 0,
      migrated,
      failed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      migrated,
      failed,
      errors: [...errors, `Migration error: ${error}`],
    };
  }
};
```

**Run migration on first login:**
```typescript
// In AuthProvider
useEffect(() => {
  if (user && !hasRunMigration) {
    migrateLocalStorageData(user.id, user.org_id)
      .then(result => {
        console.log('Migration result:', result);
        setHasRunMigration(true);
      });
  }
}, [user]);
```

---

## Store-by-Store Migration Plan

### 1. facilityStore → facilities.service ✅

**Before:**
- Zustand store with persist
- Hardcoded initial data
- localStorage persistence

**After:**
- React Query hooks
- Supabase fetch
- Server as source of truth

**Migration Steps:**
1. Create `facilities.service.ts` ✅
2. Replace `useFacilityStore()` with `useFacilities()` in components
3. Remove hardcoded facility data
4. Delete `facilityStore.ts` (or convert to UI state only)

### 2. cartStore → Hybrid Approach

**Keep Zustand for:**
- `selectedSlots` (ephemeral UI state)
- `isDrawerOpen` (UI state)

**Move to Supabase:**
- Persisted cart items for logged-in users

**Migration:**
1. Create `cart.service.ts` for server persistence
2. Keep `cartStore.ts` for UI state (remove persist middleware)
3. Sync between server and client on load

### 3. favoritesStore → favorites.service

**Before:**
- Array of facility IDs in localStorage

**After:**
- `user_favorites` table in Supabase
- RLS policies for user access

**Migration:**
1. Create `favorites.service.ts`
2. Migrate localStorage favorites to database
3. Replace store with React Query hooks

### 4. groupStore → groups.service

**Complex migration** due to group bookings table structure:

**Migration:**
1. Create `groups.service.ts`
2. Implement all group operations (create, invite, manage members)
3. Add real-time subscriptions for group activity
4. Replace store completely

### 5. recurringBookingStore → recurring.service

**Migration:**
1. Create `recurring.service.ts`
2. Use backend `recurring_bookings` and `recurring_booking_occurrences` tables
3. Server-side occurrence generation
4. Real-time updates for recurring series

### 6. messageStore → messages.service + Real-time

**Migration:**
1. Create `messages.service.ts`
2. Implement thread-based messaging
3. Add real-time subscriptions
4. File upload to Supabase Storage

### 7. supportStore → support.service

**Migration:**
1. Create `support.service.ts`
2. Implement ticket CRUD operations
3. Add reply and attachment handling
4. SLA tracking

### 8. zoneStore → zones.service

**Migration:**
1. Create `zones.service.ts`
2. Fetch zones per facility
3. Availability checking with backend function
4. Replace store with React Query

### 9. slotSelectionStore → KEEP as Zustand

**DO NOT MIGRATE** - This is pure UI state:
- Selected time slots
- Drag selection state
- Temporary selections before booking

**Keep as Zustand without persist.**

### 10. fieldConfigStore → settings.service (Optional)

**Consider:**
- Move to user preferences table
- Or keep as localStorage for UI settings

---

## Testing Checklist

### Unit Tests
- [ ] All Supabase services have tests
- [ ] React Query hooks are tested
- [ ] Migration script is tested
- [ ] Error handling is tested

### Integration Tests
- [ ] Auth flow works end-to-end
- [ ] CRUD operations for each entity
- [ ] Real-time subscriptions work
- [ ] File uploads work
- [ ] RLS policies are correct

### E2E Tests
- [ ] User can sign in with magic link
- [ ] User can create a booking
- [ ] User can join a group
- [ ] Messages send and receive in real-time
- [ ] Cart persists across sessions
- [ ] Favorites sync across devices

---

## Rollout Strategy

### Stage 1: Internal Testing (Dev Environment)
1. Deploy new migrations to dev Supabase
2. Enable feature flag `USE_SUPABASE=true`
3. Test with development accounts
4. Verify data migration works

### Stage 2: Beta Testing (10% of users)
1. Deploy to staging environment
2. Select beta users
3. Run migration script on login
4. Monitor errors and performance
5. Collect feedback

### Stage 3: Gradual Rollout (100% of users)
1. Deploy to production
2. Enable for all users gradually:
   - Week 1: 25% of users
   - Week 2: 50% of users
   - Week 3: 75% of users
   - Week 4: 100% of users
3. Monitor performance and errors
4. Keep fallback to localStorage for 2 weeks

---

## Rollback Plan

### If Critical Issues Occur:

1. **Disable feature flag**: Set `USE_SUPABASE=false`
2. **Revert to localStorage**: Zustand stores still exist
3. **Restore data**: Export from Supabase, import to localStorage
4. **Fix issues**: Debug and fix problems
5. **Re-enable gradually**: Start rollout again

### Fallback Code Pattern:

```typescript
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export const useFacilities = (orgId: string) => {
  if (USE_SUPABASE) {
    return useSupabaseFacilities(orgId);
  } else {
    return useLocalStorageFacilities();
  }
};
```

---

## Performance Considerations

### Optimizations:
1. **Prefetching**: Prefetch data on route transitions
2. **Pagination**: Load data in pages, not all at once
3. **Caching**: Aggressive caching with React Query
4. **Real-time throttling**: Limit real-time events to 10/second
5. **Lazy loading**: Load zones/messages on demand

### Monitoring:
- Query execution time
- Cache hit rate
- Real-time connection stability
- API error rate
- User experience metrics

---

## File Structure After Migration

```
src/
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── queryClient.ts            # React Query config
├── contexts/
│   ├── AuthContext.tsx           # Auth state
│   └── index.ts
├── services/
│   └── supabase/
│       ├── facilities.service.ts
│       ├── bookings.service.ts
│       ├── zones.service.ts
│       ├── groups.service.ts
│       ├── recurring.service.ts
│       ├── messages.service.ts
│       ├── support.service.ts
│       ├── favorites.service.ts
│       ├── cart.service.ts
│       └── index.ts
├── stores/
│   ├── slotSelectionStore.ts    # UI state only
│   ├── uiStore.ts                # Modals, drawers, etc.
│   └── index.ts
├── hooks/
│   ├── useRealtimeBookings.ts
│   ├── useRealtimeMessages.ts
│   └── index.ts
├── utils/
│   ├── migrateLocalStorageData.ts
│   └── index.ts
└── types/
    ├── database.ts               # Generated from Supabase
    └── index.ts
```

---

## Summary of Changes

### Remove:
- ❌ Zustand `persist` middleware from most stores
- ❌ Hardcoded mock data in stores
- ❌ Direct localStorage access
- ❌ Old `http.ts` client (replace with Supabase)

### Add:
- ✅ Supabase client and auth
- ✅ React Query configuration
- ✅ AuthContext for session management
- ✅ Supabase services for each domain
- ✅ Real-time subscription hooks
- ✅ Data migration utility
- ✅ TypeScript database types

### Keep:
- ✅ React Query for API state
- ✅ Zustand for UI state (without persist)
- ✅ Component structure (just swap hooks)
- ✅ TypeScript types (adapt to database types)

---

## Timeline

| Week | Phase | Tasks | Status |
|------|-------|-------|--------|
| 1 | Foundation | Supabase client, Auth, React Query config | ⏳ Pending |
| 2 | Services | Create all Supabase services | ⏳ Pending |
| 3 | Real-time | Add real-time subscriptions | ⏳ Pending |
| 4 | Components | Refactor components to use services | ⏳ Pending |
| 5 | Migration | Data migration script and testing | ⏳ Pending |
| 6 | Testing | E2E tests, beta testing | ⏳ Pending |
| 7-8 | Rollout | Gradual rollout to production | ⏳ Pending |

---

## Next Steps

1. **Generate TypeScript types** from Supabase schema
2. **Set up AuthContext** and protect routes
3. **Create facilities.service.ts** as first service (template)
4. **Refactor FacilityList component** to use new service
5. **Test end-to-end** with real Supabase backend
6. **Replicate pattern** for other domains
7. **Add real-time** for collaborative features
8. **Create migration script** for existing users
9. **Write tests** for all services
10. **Deploy and monitor**

---

**Status**: Ready to begin implementation
**Created**: 2024-10-26
**Estimated Completion**: 8 weeks
**Risk Level**: Medium (well-planned migration with rollback)
