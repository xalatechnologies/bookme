# Supabase Service Layer

Comprehensive, type-safe service layer for the Booknor application following SOLID principles.

## Architecture Overview

The service layer provides:

- **Type Safety**: 100% TypeScript coverage with no `any` types
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Error Handling**: Custom error classes with semantic error types
- **Base Service**: Abstract base class for common CRUD operations
- **Domain Services**: Specialized services for each business domain
- **Query Optimization**: Efficient database queries with proper indexing

## Directory Structure

```
src/services/supabase/
├── client.ts                 # Supabase client singleton
├── types.ts                  # Centralized type definitions
├── errors.ts                 # Custom error classes
├── base.service.ts           # Abstract base service
├── auth.service.ts           # Authentication
├── users.service.ts          # User management
├── organizations.service.ts  # Organization management
├── facilities.service.ts     # Facility management (existing)
├── bookings.service.ts       # Booking management (existing)
├── zones.service.ts          # Zone management (existing)
├── cart.service.ts           # Shopping cart
├── favorites.service.ts      # User favorites (existing)
├── reviews.service.ts        # Reviews and ratings
├── messages.service.ts       # Messaging (existing)
├── groups.service.ts         # Group bookings (existing)
├── recurring.service.ts      # Recurring bookings (existing)
├── support.service.ts        # Support tickets (existing)
├── notifications.service.ts  # Notifications (existing)
└── index.ts                  # Barrel exports
```

## Core Infrastructure

### Client (`client.ts`)

Supabase client singleton with helper functions:

```typescript
import { supabase, getCurrentUserId, getCurrentUserOrgId } from '@/services/supabase';

// Check authentication
const userId = await getCurrentUserId();
const orgId = await getCurrentUserOrgId();
```

### Types (`types.ts`)

Centralized type definitions:

```typescript
import type {
  // Database types
  Database,
  Tables,
  Insertable,
  Updatable,
  // Entity types
  Booking,
  Facility,
  UserProfile,
  // Extended types
  BookingWithDetails,
  FacilityWithZones,
  // Response types
  PaginatedResponse,
  ServiceResponse,
} from '@/services/supabase';
```

### Error Handling (`errors.ts`)

Custom error classes for semantic error handling:

```typescript
import {
  ServiceError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  DatabaseError,
} from '@/services/supabase';

try {
  const user = await usersService.getById(userId);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('User not found');
  } else if (error instanceof ValidationError) {
    console.log('Validation failed:', error.fields);
  }
}
```

## Base Service

Abstract base class providing common CRUD operations:

```typescript
export abstract class BaseService<TRow, TInsert, TUpdate> {
  async getAll(select?: string): Promise<TRow[]>;
  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<TRow>>;
  async getById(id: string): Promise<TRow>;
  async create(data: TInsert): Promise<TRow>;
  async update(id: string, data: TUpdate): Promise<TRow>;
  async delete(id: string): Promise<void>;
  async restore(id: string): Promise<TRow>; // For soft deletes
  async exists(id: string): Promise<boolean>;
  async count(): Promise<number>;

  // Lifecycle hooks (override in subclasses)
  protected async validateInsert(data: TInsert): Promise<void>;
  protected async validateUpdate(id: string, data: TUpdate): Promise<void>;
  protected async beforeCreate(data: TInsert): Promise<TInsert>;
  protected async afterCreate(data: TRow): Promise<void>;
  protected async beforeUpdate(id: string, data: TUpdate): Promise<TUpdate>;
  protected async afterUpdate(data: TRow): Promise<void>;
  protected async beforeDelete(id: string): Promise<void>;
  protected async afterDelete(id: string): Promise<void>;
}
```

### Creating a Custom Service

```typescript
import { BaseService } from '@/services/supabase';
import type { MyEntity, MyEntityInsert, MyEntityUpdate } from '@/services/supabase';

export class MyService extends BaseService<MyEntity, MyEntityInsert, MyEntityUpdate> {
  protected readonly config = {
    tableName: 'my_entities',
    idColumn: 'id',
    softDelete: false,
  };

  // Add custom methods
  async getByCustomField(value: string): Promise<MyEntity[]> {
    // Implementation
  }

  // Override validation
  protected async validateInsert(data: MyEntityInsert): Promise<void> {
    if (!data.required_field) {
      throw new ValidationError('Required field missing');
    }
  }
}

export const myService = new MyService();
```

## Domain Services

### Authentication Service

```typescript
import { authService } from '@/services/supabase';

// Sign up
const { user, session } = await authService.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123',
  fullName: 'John Doe',
});

// Sign in
const { user, session } = await authService.signIn({
  email: 'user@example.com',
  password: 'SecurePassword123',
});

// Sign out
await authService.signOut();

// Get current user
const user = await authService.getCurrentUser();

// Reset password
await authService.resetPassword({
  email: 'user@example.com',
});

// Update password
await authService.updatePassword({
  newPassword: 'NewSecurePassword123',
});

// Listen to auth state changes
const unsubscribe = authService.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

### Users Service

```typescript
import { usersService } from '@/services/supabase';

// Get user with organization
const user = await usersService.getUserWithOrg(userId);

// Get users by organization
const users = await usersService.getUsersByOrg(orgId, {
  role: 'user',
  isActive: true,
  search: 'john',
});

// Search users
const results = await usersService.searchUsers({
  query: 'john',
  orgId,
  limit: 10,
});

// Update user role
await usersService.updateUserRole({
  userId,
  role: 'admin',
});

// User preferences
const prefs = await usersService.getUserPreferences(userId);
await usersService.updateUserPreferences(userId, {
  theme: 'dark',
  language: 'en',
});

// User statistics
const stats = await usersService.getUserStats(userId);
```

### Organizations Service

```typescript
import { organizationsService } from '@/services/supabase';

// Get organization with details
const org = await organizationsService.getOrganizationWithDetails(orgId);

// Get members
const members = await organizationsService.getOrganizationMembers(orgId);

// Get facilities
const facilities = await organizationsService.getOrganizationFacilities(orgId);

// Organization settings
const settings = await organizationsService.getOrganizationSettings(orgId);
await organizationsService.updateOrganizationSettings(orgId, {
  bookingRules: {
    minAdvanceBooking: 2,
    maxAdvanceBooking: 30,
    requiresApproval: false,
  },
});

// Organization statistics
const stats = await organizationsService.getOrganizationStats(orgId);
// Returns: totalBookings, totalRevenue, activeFacilities, totalMembers, etc.
```

### Cart Service

```typescript
import { cartService } from '@/services/supabase';

// Get cart
const cart = await cartService.getCart(userId);

// Get cart with details (includes pricing)
const summary = await cartService.getCartWithDetails(userId);
// Returns: itemCount, subtotal, servicesTotal, total, items[]

// Add to cart
await cartService.addToCart(userId, {
  facilityId,
  zoneId,
  startTime: '2025-11-01T10:00:00Z',
  endTime: '2025-11-01T12:00:00Z',
  services: [
    { serviceId: 'service-1', quantity: 2, priceCents: 1000 }
  ],
  notes: 'Special requirements',
});

// Remove from cart
await cartService.removeFromCart(userId, itemId);

// Update cart item
await cartService.updateCartItem(userId, itemId, {
  startTime: '2025-11-01T11:00:00Z',
});

// Clear cart
await cartService.clearCart(userId);

// Get item count
const count = await cartService.getCartItemCount(userId);
```

### Reviews Service

```typescript
import { reviewsService } from '@/services/supabase';

// Create review
const review = await reviewsService.createReview({
  facilityId,
  userId,
  bookingId,
  rating: 5,
  comment: 'Great facility!',
  photos: ['url1', 'url2'],
});

// Get reviews for facility
const { data: reviews, count, hasMore } = await reviewsService.getReviews({
  facilityId,
  minRating: 4,
  sortBy: 'recent',
  page: 1,
  pageSize: 10,
});

// Get facility rating statistics
const stats = await reviewsService.getFacilityRatingStats(facilityId);
// Returns: averageRating, totalReviews, ratingDistribution, recentReviews

// Check if user can review
const canReview = await reviewsService.canUserReview(userId, facilityId);

// Mark as helpful
await reviewsService.markReviewAsHelpful(reviewId, userId);

// Update review
await reviewsService.updateReview(reviewId, userId, {
  rating: 4,
  comment: 'Updated review',
});

// Delete review
await reviewsService.deleteReview(reviewId, userId);
```

## Error Handling Best Practices

### 1. Try-Catch with Specific Error Types

```typescript
try {
  const user = await usersService.getById(userId);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found
    console.log('User not found');
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    console.log('Validation failed:', error.fields);
  } else if (error instanceof UnauthorizedError) {
    // Handle unauthorized
    console.log('Authentication required');
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

### 2. Form Validation

```typescript
try {
  await usersService.create(userData);
} catch (error) {
  if (error instanceof ValidationError && error.fields) {
    // Display field-specific errors
    Object.entries(error.fields).forEach(([field, messages]) => {
      messages.forEach(message => {
        form.setError(field, { message });
      });
    });
  }
}
```

### 3. Toast Notifications

```typescript
try {
  await bookingsService.createBooking(bookingData);
  toast.success('Booking created successfully');
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

## Type Safety Examples

### 1. Strongly Typed Filters

```typescript
import type { BookingFilters } from '@/services/supabase';

const filters: BookingFilters = {
  status: ['confirmed', 'pending'],
  facilityId: 'facility-123',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  sortBy: 'start_time',
  sortOrder: 'asc',
  page: 1,
  pageSize: 20,
};

const bookings = await bookingsService.getBookings(filters);
```

### 2. Type-Safe Updates

```typescript
import type { UserProfileUpdate } from '@/services/supabase';

const updates: UserProfileUpdate = {
  full_name: 'John Doe',
  phone: '+1234567890',
  // TypeScript will error on invalid fields
};

await usersService.update(userId, updates);
```

### 3. Discriminated Unions

```typescript
import type { BookingStatus } from '@/services/supabase';

const status: BookingStatus = 'confirmed'; // Type-safe enum
const bookings = await bookingsService.getBookingsByStatus(userId, status);
```

## Performance Optimization

### 1. Select Specific Fields

```typescript
// Only select needed fields
const users = await usersService.getAll('user_id, full_name, email');
```

### 2. Pagination

```typescript
// Use pagination for large datasets
const { data, count, hasMore } = await usersService.getPaginated({
  page: 1,
  pageSize: 20,
});
```

### 3. Counting Without Data

```typescript
// Efficient counting
const count = await usersService.count();
```

## Testing Services

```typescript
import { usersService } from '@/services/supabase';
import { NotFoundError, ValidationError } from '@/services/supabase';

describe('UsersService', () => {
  it('should get user by id', async () => {
    const user = await usersService.getById('user-123');
    expect(user).toBeDefined();
    expect(user.user_id).toBe('user-123');
  });

  it('should throw NotFoundError for invalid id', async () => {
    await expect(
      usersService.getById('invalid-id')
    ).rejects.toThrow(NotFoundError);
  });

  it('should validate email on create', async () => {
    await expect(
      usersService.create({
        user_id: 'user-123',
        email: 'invalid-email',
      })
    ).rejects.toThrow(ValidationError);
  });
});
```

## Migration Guide

### From Direct Supabase Calls to Services

**Before:**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

if (error) {
  console.error(error);
  return null;
}
```

**After:**
```typescript
try {
  const user = await usersService.getById(userId);
  return user;
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('User not found');
  }
  return null;
}
```

## Contributing

When adding new services:

1. **Extend BaseService** for common CRUD operations
2. **Define types** in `types.ts` or service file
3. **Implement validation** in lifecycle hooks
4. **Add custom methods** for domain-specific operations
5. **Export from index.ts** for centralized access
6. **Document usage** in this README
7. **Write tests** for all public methods

## Best Practices

1. **Always use services** instead of direct Supabase calls
2. **Handle errors properly** with try-catch and specific error types
3. **Use type-safe filters** for queries
4. **Validate input** before database operations
5. **Use transactions** for multi-step operations
6. **Log errors** for debugging and monitoring
7. **Keep services focused** on a single domain
8. **Don't expose internal implementation** details
9. **Use dependency injection** for testing
10. **Document complex operations** with JSDoc comments
