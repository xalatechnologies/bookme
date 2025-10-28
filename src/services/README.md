# Services Architecture

Centralized service layer for all application data operations.

## 📁 Structure

```
src/services/
├── supabase/                # Supabase-specific services
│   ├── auth.service.ts      # Authentication
│   ├── bookings.service.ts  # Booking operations
│   ├── facilities.service.ts # Facility management
│   ├── messages.service.ts  # Messaging system
│   ├── support.service.ts   # Support tickets
│   ├── users.service.ts     # User management
│   ├── groups.service.ts    # Group bookings
│   ├── recurring.service.ts # Recurring bookings
│   ├── cart.service.ts      # Shopping cart
│   ├── favorites.service.ts # User favorites
│   ├── reviews.service.ts   # Facility reviews
│   ├── notifications.service.ts # Notifications
│   ├── base.service.ts      # Base service class
│   ├── client.ts            # Supabase client
│   ├── errors.ts            # Error handling
│   ├── types.ts             # Type definitions
│   └── index.ts             # Barrel export
│
├── shared/                  # Shared utilities (NEW ✨)
│   ├── httpClient.ts        # HTTP request wrapper
│   ├── error-handler.ts     # Error handling utilities
│   └── index.ts             # Barrel export
│
├── bookings.service.ts      # Top-level bookings API (NEW ✨)
├── calendar.service.ts      # Calendar operations
├── facilities.service.ts    # Facilities API
├── history.service.ts       # History tracking
├── http.ts                  # Legacy HTTP client
└── index.ts                 # Main service export
```

## 🎯 Import Patterns

### ✅ Recommended: Use Centralized Exports

```typescript
// Import from main services index
import { 
  bookingsService, 
  facilitiesService,
  calendarService,
  httpClient,
  handleError 
} from '@/services';

// Or import specific Supabase services
import { authService, usersService } from '@/services';
```

### ⚠️ Also Valid: Direct Supabase Imports

```typescript
// Import directly from supabase folder
import { bookingsService } from '@/services/supabase';
```

### ❌ Avoid: Deep Imports

```typescript
// Don't do this
import { bookingsService } from '@/services/supabase/bookings.service';
```

## 🏗️ Architecture Layers

### Layer 1: Supabase Services (`/supabase`)

**Purpose**: Direct interaction with Supabase backend

**Features**:
- Full CRUD operations
- React Query hooks integration
- Type-safe database queries
- Relationship loading
- Real-time subscriptions
- Error handling with PostgreSQL codes

**Example**:
```typescript
import { bookingsService } from '@/services/supabase';

// Get bookings for a user
const bookings = await bookingsService.getUserBookings(userId);

// Create a new booking
const newBooking = await bookingsService.create({
  facility_id: facilityId,
  user_id: userId,
  starts_at: startTime,
  ends_at: endTime,
});
```

### Layer 2: Top-Level Service Wrappers (NEW ✨)

**Purpose**: Simplified, domain-focused APIs for components

**Features**:
- Clean, intuitive method names
- Reduced parameter complexity
- Domain-specific business logic
- Abstraction from backend details

**Example**:
```typescript
import { bookingsService } from '@/services';

// Simpler API - no need to know implementation details
const bookings = await bookingsService.getUserBookings(filters);

// Business logic abstracted
const available = await bookingsService.checkAvailability({
  facilityId,
  startTime,
  endTime,
});
```

### Layer 3: Shared Utilities (`/shared`)

**Purpose**: Common utilities used across all services

**Components**:
- **httpClient**: HTTP request wrapper with error handling
- **error-handler**: Centralized error processing

**Example**:
```typescript
import { httpClient, handleError, getUserErrorMessage } from '@/services/shared';

try {
  const data = await httpClient.get('/api/custom-endpoint');
} catch (error) {
  const errorInfo = handleError(error, 'fetching data');
  const userMessage = getUserErrorMessage(error);
  toast.error(userMessage);
}
```

## 📚 Usage Examples

### Using Bookings Service

```typescript
import { bookingsService } from '@/services';
import { useBookingStore } from '@/stores/bookingStore';

// In a component or hook
const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const userId = getCurrentUserId();
        const data = await bookingsService.getUserBookings(userId);
        setBookings(data);
      } catch (error) {
        console.error('Failed to load bookings:', error);
      }
    };
    
    loadBookings();
  }, []);
  
  // Render bookings...
};
```

### Using React Query Hooks (from Supabase services)

```typescript
import { useUserBookings, useCreateBooking } from '@/services/supabase';

const MyBookingsPage = () => {
  const userId = getCurrentUserId();
  
  // Automatic caching, refetching, and loading states
  const { data: bookings, isLoading, error } = useUserBookings(userId);
  
  const { mutate: createBooking } = useCreateBooking({
    onSuccess: () => {
      toast.success('Booking created!');
    },
  });
  
  const handleBook = (bookingData) => {
    createBooking(bookingData);
  };
  
  // Render...
};
```

### Error Handling

```typescript
import { handleError, getUserErrorMessage, ErrorSeverity } from '@/services/shared';

try {
  await bookingsService.createBooking(bookingData);
} catch (error) {
  const errorInfo = handleError(error, 'creating booking');
  
  // Log for debugging
  console.error('[Booking Error]', errorInfo);
  
  // Show user-friendly message
  const message = getUserErrorMessage(error);
  toast.error(message);
  
  // Handle by severity
  if (errorInfo.severity === ErrorSeverity.CRITICAL) {
    // Report to error tracking service
  }
}
```

## 🔧 Creating New Services

### Step 1: Create Supabase Service (if needed)

```typescript
// src/services/supabase/myfeature.service.ts

import { BaseService } from './base.service';
import type { MyEntity, MyEntityInsert, MyEntityUpdate } from './types';

export class MyFeatureService extends BaseService<
  MyEntity,
  MyEntityInsert,
  MyEntityUpdate
> {
  protected readonly config = {
    tableName: 'my_entities',
    softDelete: true,
  };
  
  // Add custom methods here
  async getByCustomField(value: string): Promise<MyEntity[]> {
    // Implementation
  }
}

export const myFeatureService = new MyFeatureService();
```

### Step 2: Create Top-Level Wrapper (optional)

```typescript
// src/services/myfeature.service.ts

import { myFeatureService as supabaseService } from './supabase';

export const myFeatureService = {
  async getAll() {
    return supabaseService.getAll();
  },
  
  async getById(id: string) {
    return supabaseService.getById(id);
  },
  
  // Simplified methods
} as const;
```

### Step 3: Export from Index

```typescript
// src/services/index.ts

export { myFeatureService } from './myfeature.service';
```

## 🎯 Best Practices

### 1. Use Appropriate Layer

- **Components**: Import from `/services` or `/services/supabase`
- **Hooks**: Use React Query hooks from `/services/supabase`
- **Utilities**: Import from `/services/shared`

### 2. Handle Errors Consistently

```typescript
import { handleError, logError } from '@/services/shared';

try {
  await service.doSomething();
} catch (error) {
  logError(error, 'doSomething');
  throw error; // Re-throw if component needs to handle it
}
```

### 3. Use Type Exports

```typescript
import type { Booking, BookingInsert } from '@/services';

const booking: Booking = await bookingsService.getById(id);
```

### 4. Leverage React Query

For data fetching with caching:

```typescript
import { useUserBookings } from '@/services/supabase';

// Automatic:
// - Caching
// - Refetching on window focus
// - Loading/error states
// - Deduplication
const { data, isLoading, error, refetch } = useUserBookings(userId);
```

## 🚀 Migration Guide

### From Old Pattern

```typescript
// Old: Direct Supabase calls
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error(error);
  return;
}
```

### To New Pattern

```typescript
// New: Use service layer
import { bookingsService } from '@/services';

try {
  const bookings = await bookingsService.getUserBookings(userId);
  // Use bookings
} catch (error) {
  console.error('Failed to fetch bookings:', error);
}
```

## 📊 Service Layer Benefits

### ✅ Centralized Logic
- All data operations in one place
- Easier to maintain and update
- Consistent patterns across features

### ✅ Type Safety
- Full TypeScript support
- Auto-completion in IDE
- Compile-time error checking

### ✅ Error Handling
- Consistent error processing
- User-friendly error messages
- Centralized logging

### ✅ Testing
- Easy to mock for unit tests
- Isolated business logic
- Predictable interfaces

### ✅ Caching & Performance
- React Query integration
- Automatic cache invalidation
- Optimistic updates

## 🔗 Related Documentation

- [Supabase Services README](./supabase/README.md) - Detailed Supabase service docs
- [Services Architecture](./SERVICES_ARCHITECTURE.md) - Architecture overview
- [Feature-Based Architecture](../../docs/FEATURE_BASED_ARCHITECTURE_STRATEGY.md) - Overall app architecture

---

**Last Updated**: October 28, 2025
**Status**: ✅ Phase 3 Complete
