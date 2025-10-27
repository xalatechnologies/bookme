# BookMe Integration Guide: Connecting Frontend to Supabase Backend

This guide explains how to integrate the Vite/React frontend with the Docker-based Supabase backend for full-stack development.

## Overview

**Current State**:
- Frontend: Vite + React 19 + TypeScript with mock data and localStorage
- Backend: Docker Compose Supabase stack (PostgreSQL + Auth + Storage + Realtime)

**Goal**: Connect the frontend to the local Supabase backend for real database operations, authentication, and file storage.

---

## Prerequisites

### 1. Backend Setup

Ensure the Supabase backend is running:

```bash
# Navigate to Docker project
cd "/Volumes/Development/Xala Products/bookme"

# Start Supabase services
./scripts/start-dev.sh

# Verify services are running
docker-compose ps

# Apply database migrations
./scripts/apply-migrations.sh
```

**Verify services are accessible**:
- Supabase Studio: http://localhost:54323
- Supabase API: http://localhost:54321
- PostgreSQL: localhost:54322
- Mailpit: http://localhost:8025

### 2. Frontend Setup

In the current Vite/React project:

```bash
cd ~/Documents/xaheen/bookme

# Install Supabase client if not already installed
npm install @supabase/supabase-js

# Start development server
npm run dev
```

---

## Database Schema Overview

The Supabase backend provides these core tables:

### Organizations (Multi-tenancy)
```sql
organizations
├── id (uuid)
├── name
├── slug (unique)
├── timezone (default: 'Europe/Oslo')
└── status (default: 'active')
```

### Facilities
```sql
facilities
├── id (uuid)
├── org_id (references organizations)
├── title
├── description
├── status ('draft' | 'published')
├── address, city, postal_code, country
├── location (geography point - PostGIS)
├── amenities (jsonb array)
└── images (jsonb array)
```

### Bookings
```sql
bookings
├── id (uuid)
├── org_id (references organizations)
├── facility_id (references facilities)
├── user_id (references auth.users)
├── status (booking_status enum)
│   ├── 'pending'
│   ├── 'awaiting_payment'
│   ├── 'paid'
│   ├── 'cancelled'
│   ├── 'expired'
│   ├── 'completed'
│   └── 'refunded'
├── starts_at (timestamptz)
├── ends_at (timestamptz)
├── total_cents (bigint)
├── currency (default: 'NOK')
└── price_breakdown (jsonb)
```

### Supporting Tables
- `profiles` - User profile mirror (non-PII)
- `memberships` - Organization roles (owner, admin, staff, customer)
- `availability_rules` - Facility availability schedules
- `blackouts` - Unavailable time periods
- `pricing_rules` - Dynamic pricing with weekend/peak multipliers
- `payments` - Payment tracking (Stripe, Vipps)
- `reviews` - Facility reviews (1-5 stars)
- `favorites` - User favorite facilities
- `notifications` - Notification outbox
- `audit_events` - Audit trail

---

## Step 1: Configure Environment Variables

Create `.env.local` in the frontend project:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.Zop9sdXRThXPZUnKA-ZqM5Sw47TKZ14edXuBvuFPXn0

# Optional: Service role key for admin operations (never expose to client!)
# VITE_SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-docker-env>
```

**Important**: Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## Step 2: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types will be generated later
export type Database = {
  public: {
    Tables: {
      facilities: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string | null;
          status: string;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          amenities: unknown;
          images: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['facilities']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['facilities']['Insert']>;
      };
      // Add other table types as needed
    };
  };
};
```

---

## Step 3: Migrate from localStorage to Supabase

### Current Architecture (localStorage)

```
User Action → Zustand Store → localStorage
                  ↓
            React Components
```

### New Architecture (Supabase)

```
User Action → Supabase Client → PostgreSQL
                  ↓
            React Query Cache → React Components
```

### Strategy: Incremental Migration

Replace stores one at a time to minimize disruption:

1. **Phase 1**: Facilities (read-only migration)
2. **Phase 2**: Bookings (write operations)
3. **Phase 3**: User data (auth integration)
4. **Phase 4**: Real-time features

---

## Step 4: Install React Query

For data fetching and caching:

```bash
npm install @tanstack/react-query
```

Configure in `src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AdminAuthProvider>
          <App />
        </AdminAuthProvider>
      </LanguageProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## Step 5: Migrate Facility Store

### Create Supabase Facility Service

Create `src/services/facilityService.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import type { Facility } from '@/types/facility';

export const facilityService = {
  async getAll(orgId: string): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Facility[];
  },

  async getById(id: string): Promise<Facility | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as Facility;
  },

  async create(facility: Omit<Facility, 'id' | 'created_at' | 'updated_at'>): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .insert(facility)
      .select()
      .single();

    if (error) throw error;
    return data as Facility;
  },

  async update(id: string, updates: Partial<Facility>): Promise<Facility> {
    const { data, error } = await supabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Facility;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async search(query: string, filters?: {
    city?: string;
    amenities?: string[];
  }): Promise<Facility[]> {
    let queryBuilder = supabase
      .from('facilities')
      .select('*')
      .eq('status', 'published');

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters?.city) {
      queryBuilder = queryBuilder.eq('city', filters.city);
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      queryBuilder = queryBuilder.contains('amenities', filters.amenities);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Facility[];
  }
};
```

### Create React Query Hooks

Create `src/hooks/useFacilities.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityService } from '@/services/facilityService';
import type { Facility } from '@/types/facility';

// Query keys
export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (orgId: string) => [...facilityKeys.lists(), orgId] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
};

// Fetch all facilities
export const useFacilities = (orgId: string) => {
  return useQuery({
    queryKey: facilityKeys.list(orgId),
    queryFn: () => facilityService.getAll(orgId),
  });
};

// Fetch single facility
export const useFacility = (id: string) => {
  return useQuery({
    queryKey: facilityKeys.detail(id),
    queryFn: () => facilityService.getById(id),
    enabled: !!id,
  });
};

// Create facility mutation
export const useCreateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
    },
  });
};

// Update facility mutation
export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Facility> }) =>
      facilityService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
    },
  });
};

// Delete facility mutation
export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilityService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
    },
  });
};

// Search facilities
export const useSearchFacilities = (query: string, filters?: {
  city?: string;
  amenities?: string[];
}) => {
  return useQuery({
    queryKey: [...facilityKeys.lists(), 'search', query, filters],
    queryFn: () => facilityService.search(query, filters),
    enabled: query.length > 0,
  });
};
```

### Update Components

Replace store usage with React Query hooks:

```typescript
// Before (using Zustand store)
import { useFacilityStore } from '@/stores/facilityStore';

const FacilityList = (): JSX.Element => {
  const { facilities, isLoading } = useFacilityStore();
  // ...
};

// After (using React Query)
import { useFacilities } from '@/hooks/useFacilities';

const FacilityList = (): JSX.Element => {
  const orgId = 'your-org-id'; // Get from auth context
  const { data: facilities, isLoading } = useFacilities(orgId);
  // ...
};
```

---

## Step 6: Implement Authentication

### Replace AdminAuthContext

Create `src/contexts/SupabaseAuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  readonly user: User | null;
  readonly session: Session | null;
  readonly isLoading: boolean;
  readonly signIn: (email: string) => Promise<void>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within SupabaseAuthProvider');
  }
  return context;
};
```

### Update Login Flow

Replace magic link authentication:

```typescript
import { useAuth } from '@/contexts/SupabaseAuthContext';

const LoginPage = (): JSX.Element => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email);
      setSent(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (sent) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Check your email</h2>
        <p>We sent a magic link to {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="w-full h-14 px-4 mb-4 border rounded-lg"
      />
      <button
        type="submit"
        className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Send Magic Link
      </button>
    </form>
  );
};
```

---

## Step 7: Implement Row Level Security (RLS)

The backend already has RLS policies. Ensure they're properly configured:

### Key RLS Policies

**Facilities** (public read, org write):
```sql
-- Users can view published facilities
create policy "Public facilities are viewable by everyone"
  on facilities for select
  using (status = 'published');

-- Org members can manage their facilities
create policy "Org members can manage facilities"
  on facilities for all
  using (org_id in (
    select org_id from memberships
    where user_id = auth.uid()
  ));
```

**Bookings** (user-scoped):
```sql
-- Users can view their own bookings
create policy "Users can view own bookings"
  on bookings for select
  using (user_id = auth.uid());

-- Users can create bookings
create policy "Users can create bookings"
  on bookings for insert
  with check (user_id = auth.uid());
```

---

## Step 8: Add Real-time Subscriptions

Subscribe to booking changes:

```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useBookingSubscription = (facilityId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`bookings:${facilityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `facility_id=eq.${facilityId}`,
        },
        (payload) => {
          console.log('Booking change:', payload);
          // Invalidate React Query cache
          queryClient.invalidateQueries({ queryKey: ['bookings', facilityId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [facilityId]);
};
```

---

## Step 9: File Upload (Images)

Upload facility images to Supabase Storage:

```typescript
export const uploadFacilityImage = async (
  facilityId: string,
  file: File
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${facilityId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('facility-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('facility-images')
    .getPublicUrl(data.path);

  return publicUrl;
};
```

---

## Step 10: Testing the Integration

### 1. Test Database Connection

```typescript
// src/utils/testConnection.ts
import { supabase } from '@/lib/supabase';

export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('organizations').select('count');
    if (error) throw error;
    console.log('✅ Supabase connection successful', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};
```

### 2. Test in Browser Console

```javascript
// In browser console
import { testConnection } from './utils/testConnection';
await testConnection();
```

### 3. Verify in Supabase Studio

Access http://localhost:54323 and:
- Check **Table Editor** for data
- Check **Authentication** for users
- Check **Storage** for uploaded images
- Check **Database** > **Replication** for real-time events

---

## Migration Checklist

- [ ] Docker Supabase stack running
- [ ] Migrations applied successfully
- [ ] Environment variables configured in `.env.local`
- [ ] Supabase client installed and configured
- [ ] React Query installed and configured
- [ ] Facility service migrated from localStorage to Supabase
- [ ] Authentication migrated to Supabase Auth
- [ ] Booking service migrated
- [ ] File upload implemented for facility images
- [ ] Real-time subscriptions working
- [ ] RLS policies tested and verified
- [ ] Error handling and loading states implemented
- [ ] Old Zustand stores removed or deprecated

---

## Rollback Strategy

If issues arise, you can temporarily switch back to localStorage:

1. Use feature flags:
```typescript
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export const getFacilities = USE_SUPABASE
  ? facilityService.getAll
  : facilityStore.getAll;
```

2. Keep Zustand stores as fallback until migration is complete
3. Test thoroughly in development before removing localStorage code

---

## Performance Optimization

### 1. Caching Strategy

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

### 2. Pagination

```typescript
export const usePaginatedFacilities = (page: number, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['facilities', 'paginated', page],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('facilities')
        .select('*', { count: 'exact' })
        .range(from, to);

      if (error) throw error;
      return { data, count };
    },
  });
};
```

### 3. Prefetching

```typescript
// Prefetch next page
const prefetchNextPage = () => {
  queryClient.prefetchQuery({
    queryKey: ['facilities', 'paginated', page + 1],
    queryFn: () => fetchFacilities(page + 1),
  });
};
```

---

## Next Steps

1. **Migrate remaining features**: Cart, favorites, user profile
2. **Implement payment integration**: Stripe/Vipps webhooks
3. **Set up email notifications**: Using Supabase Edge Functions
4. **Add analytics**: Track user behavior and booking patterns
5. **Deploy to production**: Migrate from local to hosted Supabase

---

## Troubleshooting

### Connection Issues

**Problem**: "Failed to fetch" errors
**Solution**:
- Verify Docker containers are running: `docker-compose ps`
- Check Supabase API is accessible: `curl http://localhost:54321`
- Verify CORS settings in Supabase dashboard

### Authentication Issues

**Problem**: Magic links not working
**Solution**:
- Check Mailpit at http://localhost:8025 for emails
- Verify `SITE_URL` in backend `.env` matches frontend URL
- Check auth redirect URLs in Supabase Studio

### RLS Policy Issues

**Problem**: "permission denied" errors
**Solution**:
- Check RLS policies in Supabase Studio > Authentication > Policies
- Verify user is authenticated: `supabase.auth.getUser()`
- Test with service role key (temporarily) to isolate RLS issues

### Real-time Issues

**Problem**: Subscriptions not receiving updates
**Solution**:
- Enable replication for tables in Supabase Studio > Database > Replication
- Check subscription channel is active
- Verify WebSocket connection in Network tab

---

**For more information**:
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [BookMe Backend README](/Volumes/Development/Xala Products/bookme/README.md)
