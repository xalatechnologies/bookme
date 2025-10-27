# Service Layer Quick Reference

Quick reference guide for using the BookMe service layer.

## Import Patterns

```typescript
// Import specific services
import { authService, usersService, bookingsService } from '@/services/supabase';

// Import types
import type {
  UserProfile,
  Booking,
  BookingFilters,
  PaginatedResponse
} from '@/services/supabase';

// Import errors
import {
  NotFoundError,
  ValidationError,
  getErrorMessage
} from '@/services/supabase';
```

## Common Patterns

### 1. Get Single Record

```typescript
try {
  const user = await usersService.getById(userId);
  console.log(user);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Not found');
  }
}
```

### 2. Get Multiple Records

```typescript
const users = await usersService.getUsersByOrg(orgId, {
  role: 'user',
  isActive: true,
  search: 'john',
});
```

### 3. Get with Pagination

```typescript
const { data, count, hasMore } = await usersService.getUsersByOrgPaginated(orgId, {
  page: 1,
  pageSize: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
});
```

### 4. Create Record

```typescript
try {
  const booking = await bookingsService.create({
    facility_id: facilityId,
    user_id: userId,
    start_time: startTime,
    end_time: endTime,
    status: 'pending',
  });
  toast.success('Booking created');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation errors:', error.fields);
  }
  toast.error(getErrorMessage(error));
}
```

### 5. Update Record

```typescript
const updated = await usersService.update(userId, {
  full_name: 'New Name',
  phone: '+1234567890',
});
```

### 6. Delete Record

```typescript
await bookingsService.delete(bookingId);
```

### 7. Search

```typescript
const results = await usersService.searchUsers({
  query: 'john',
  orgId,
  limit: 10,
});
```

## Service Method Quick Reference

### Authentication

```typescript
// Sign up
const { user, session } = await authService.signUp({ email, password, fullName });

// Sign in
const { user, session } = await authService.signIn({ email, password });

// Sign out
await authService.signOut();

// Get current user
const user = await authService.getCurrentUser();

// Reset password
await authService.resetPassword({ email });

// Update password
await authService.updatePassword({ newPassword });
```

### Users

```typescript
// Get user with org
const user = await usersService.getUserWithOrg(userId);

// Get users by org
const users = await usersService.getUsersByOrg(orgId, filters);

// Search users
const results = await usersService.searchUsers({ query, orgId });

// Update role
await usersService.updateUserRole({ userId, role: 'admin' });

// User preferences
const prefs = await usersService.getUserPreferences(userId);
await usersService.updateUserPreferences(userId, { theme: 'dark' });

// User stats
const stats = await usersService.getUserStats(userId);
```

### Organizations

```typescript
// Get with details
const org = await organizationsService.getOrganizationWithDetails(orgId);

// Get members
const members = await organizationsService.getOrganizationMembers(orgId);

// Get facilities
const facilities = await organizationsService.getOrganizationFacilities(orgId);

// Settings
const settings = await organizationsService.getOrganizationSettings(orgId);
await organizationsService.updateOrganizationSettings(orgId, settings);

// Stats
const stats = await organizationsService.getOrganizationStats(orgId);

// Check admin
const isAdmin = await organizationsService.isOrganizationAdmin(userId, orgId);
```

### Bookings

```typescript
// Get user bookings
const bookings = await bookingsService.getUserBookings(userId);

// Get org bookings
const orgBookings = await bookingsService.getOrgBookings(orgId);

// Get by status
const confirmed = await bookingsService.getBookingsByStatus(userId, 'confirmed');

// Create booking
const booking = await bookingsService.createBooking(bookingData);

// Cancel booking
await bookingsService.cancelBooking(bookingId, reason);

// Check availability
const available = await bookingsService.checkAvailability({
  facilityId,
  zoneId,
  startTime,
  endTime,
});
```

### Facilities

```typescript
// Get all facilities
const facilities = await facilitiesService.getAll();

// Get published facilities
const published = await facilitiesService.getPublishedFacilities(orgId);

// Get with zones
const facility = await facilitiesService.getFacilityWithZones(facilityId);

// Search facilities
const results = await facilitiesService.searchFacilities(query, filters);

// Create facility
const facility = await facilitiesService.create(facilityData);
```

### Cart

```typescript
// Get cart
const cart = await cartService.getCart(userId);

// Get cart with details (pricing)
const summary = await cartService.getCartWithDetails(userId);

// Add to cart
await cartService.addToCart(userId, {
  facilityId,
  zoneId,
  startTime,
  endTime,
  services: [{ serviceId, quantity, priceCents }],
});

// Remove from cart
await cartService.removeFromCart(userId, itemId);

// Update cart item
await cartService.updateCartItem(userId, itemId, updates);

// Clear cart
await cartService.clearCart(userId);

// Get count
const count = await cartService.getCartItemCount(userId);
```

### Reviews

```typescript
// Create review
const review = await reviewsService.createReview({
  facilityId,
  userId,
  bookingId,
  rating: 5,
  comment: 'Great!',
});

// Get reviews
const { data, count } = await reviewsService.getReviews({
  facilityId,
  minRating: 4,
  sortBy: 'recent',
});

// Get rating stats
const stats = await reviewsService.getFacilityRatingStats(facilityId);

// Check if can review
const canReview = await reviewsService.canUserReview(userId, facilityId);

// Mark helpful
await reviewsService.markReviewAsHelpful(reviewId, userId);
```

### Favorites

```typescript
// Get favorites
const favorites = await favoritesService.getFavorites(userId);

// Check if favorite
const isFav = await favoritesService.isFavorite(userId, facilityId);

// Add favorite
await favoritesService.addFavorite(userId, facilityId);

// Remove favorite
await favoritesService.removeFavorite(userId, facilityId);

// Toggle favorite
await favoritesService.toggleFavorite(userId, facilityId);
```

## Error Handling Cheat Sheet

### Catch Specific Errors

```typescript
try {
  // operation
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle 404
  } else if (error instanceof ValidationError) {
    // Handle validation - error.fields available
  } else if (error instanceof UnauthorizedError) {
    // Handle 401 - redirect to login
  } else if (error instanceof ForbiddenError) {
    // Handle 403 - show permission error
  } else if (error instanceof ConflictError) {
    // Handle 409 - duplicate/conflict
  } else {
    // Handle unexpected errors
  }
}
```

### Display Error Messages

```typescript
import { getErrorMessage } from '@/services/supabase';

try {
  await someOperation();
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

### Form Validation Errors

```typescript
try {
  await service.create(formData);
} catch (error) {
  if (error instanceof ValidationError && error.fields) {
    // error.fields = { email: ['Invalid format'], name: ['Too short'] }
    Object.entries(error.fields).forEach(([field, messages]) => {
      form.setError(field, { message: messages[0] });
    });
  }
}
```

## Type Safety Cheat Sheet

### Filters

```typescript
import type { BookingFilters } from '@/services/supabase';

const filters: BookingFilters = {
  status: ['confirmed', 'pending'], // Type-safe enum array
  facilityId: 'facility-123',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  sortBy: 'start_time',
  sortOrder: 'asc',
  page: 1,
  pageSize: 20,
};
```

### Updates

```typescript
import type { UserProfileUpdate } from '@/services/supabase';

const updates: UserProfileUpdate = {
  full_name: 'John Doe',
  phone: '+1234567890',
  // TypeScript error on invalid fields
};
```

### Enums

```typescript
import type { BookingStatus, UserRole } from '@/services/supabase';

const status: BookingStatus = 'confirmed'; // Type-safe
const role: UserRole = 'admin'; // Type-safe
```

## React Component Examples

### Authentication Check

```typescript
import { useEffect, useState } from 'react';
import { authService } from '@/services/supabase';

export const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authService.isAuthenticated();
      setIsAuth(authenticated);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" />;
  return children;
};
```

### User Profile Component

```typescript
import { useEffect, useState } from 'react';
import { usersService } from '@/services/supabase';
import type { UserProfileWithOrg } from '@/services/supabase';

export const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<UserProfileWithOrg | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await usersService.getUserWithOrg(userId);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.full_name}</h1>
      <p>{user.email}</p>
      <p>Organization: {user.organization?.name}</p>
    </div>
  );
};
```

### Cart Component

```typescript
import { useEffect, useState } from 'react';
import { cartService } from '@/services/supabase';
import type { CartSummary } from '@/services/supabase';

export const Cart = ({ userId }: { userId: string }) => {
  const [cart, setCart] = useState<CartSummary | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      const summary = await cartService.getCartWithDetails(userId);
      setCart(summary);
    };
    fetchCart();
  }, [userId]);

  if (!cart) return null;

  return (
    <div>
      <h2>Cart ({cart.itemCount} items)</h2>
      <div>Subtotal: ${cart.subtotal / 100}</div>
      <div>Services: ${cart.servicesTotal / 100}</div>
      <div>Total: ${cart.total / 100}</div>
    </div>
  );
};
```

## Performance Tips

### 1. Select Only Needed Fields

```typescript
// Bad - fetches all fields
const users = await usersService.getAll();

// Good - only needed fields
const users = await usersService.getAll('user_id, full_name, email');
```

### 2. Use Pagination

```typescript
// Bad - fetches all records
const allUsers = await usersService.getUsersByOrg(orgId);

// Good - paginated
const { data, hasMore } = await usersService.getUsersByOrgPaginated(orgId, {
  page: 1,
  pageSize: 20,
});
```

### 3. Efficient Counting

```typescript
// Bad - fetches all data just to count
const users = await usersService.getAll();
const count = users.length;

// Good - efficient count
const count = await usersService.count();
```

## Testing Examples

```typescript
import { usersService } from '@/services/supabase';
import { NotFoundError, ValidationError } from '@/services/supabase';

describe('UsersService', () => {
  it('should get user by id', async () => {
    const user = await usersService.getById('user-123');
    expect(user.user_id).toBe('user-123');
  });

  it('should throw NotFoundError for invalid id', async () => {
    await expect(
      usersService.getById('invalid')
    ).rejects.toThrow(NotFoundError);
  });

  it('should validate email format', async () => {
    await expect(
      usersService.create({
        user_id: 'user-123',
        email: 'invalid',
      })
    ).rejects.toThrow(ValidationError);
  });
});
```

## Common Gotchas

1. **Always await async operations**
   ```typescript
   // Bad
   const user = usersService.getById(userId);

   // Good
   const user = await usersService.getById(userId);
   ```

2. **Handle errors properly**
   ```typescript
   // Bad - silent failure
   const user = await usersService.getById(userId);

   // Good - explicit error handling
   try {
     const user = await usersService.getById(userId);
   } catch (error) {
     handleError(error);
   }
   ```

3. **Use type-safe filters**
   ```typescript
   // Bad - untyped object
   const filters = { status: 'invalid-status' };

   // Good - typed filter
   const filters: BookingFilters = { status: 'confirmed' };
   ```

4. **Check for null/undefined**
   ```typescript
   // Bad - assumes data exists
   const name = user.organization.name;

   // Good - null-safe
   const name = user.organization?.name ?? 'No organization';
   ```

## Quick Troubleshooting

### "Cannot find module" error
- Check import path: `@/services/supabase`
- Verify tsconfig.json has path mapping

### "Type 'X' is not assignable to type 'Y'"
- Use proper types from `@/services/supabase`
- Check if using Insert/Update types correctly

### "Method does not exist on service"
- Verify service instance (e.g., `usersService` not `UsersService`)
- Check if method is in base service or specific service

### "Supabase error: JWT expired"
- Use `authService.refreshSession()`
- Implement auth state listener

### "Cannot read property of undefined"
- Check for null values with optional chaining
- Handle async operations with proper loading states
