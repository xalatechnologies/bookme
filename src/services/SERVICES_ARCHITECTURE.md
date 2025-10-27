# BookMe Service Layer Architecture

## Overview

Comprehensive, type-safe service layer following SOLID principles for the BookMe facility booking platform.

## Architecture Principles

### 1. SOLID Principles

- **Single Responsibility**: Each service handles one domain (users, bookings, facilities)
- **Open/Closed**: Services extend BaseService for common operations, open for extension
- **Liskov Substitution**: All services can be used through BaseService interface
- **Interface Segregation**: Focused service interfaces with specific methods
- **Dependency Inversion**: Services depend on abstractions (Supabase client, error types)

### 2. Type Safety

- 100% TypeScript coverage
- No `any` types allowed
- Explicit return types for all methods
- Strongly typed database operations
- Type-safe error handling

### 3. Error Handling

- Custom error classes for semantic errors
- Consistent error handling across all services
- Field-level validation errors
- Error logging and context preservation

## Service Layer Structure

```
services/
├── supabase/
│   ├── client.ts                 # Supabase client singleton
│   ├── types.ts                  # Centralized type definitions
│   ├── errors.ts                 # Custom error classes
│   ├── base.service.ts           # Abstract base service
│   │
│   ├── auth.service.ts           # Authentication [NEW]
│   ├── users.service.ts          # User management [NEW]
│   ├── organizations.service.ts  # Organization management [NEW]
│   ├── cart.service.ts           # Shopping cart [NEW]
│   ├── reviews.service.ts        # Reviews & ratings [NEW]
│   │
│   ├── bookings.service.ts       # Booking management [ENHANCED]
│   ├── facilities.service.ts     # Facility management [ENHANCED]
│   ├── zones.service.ts          # Zone management [ENHANCED]
│   ├── favorites.service.ts      # User favorites [ENHANCED]
│   ├── messages.service.ts       # Messaging [ENHANCED]
│   ├── groups.service.ts         # Group bookings [ENHANCED]
│   ├── recurring.service.ts      # Recurring bookings [ENHANCED]
│   ├── support.service.ts        # Support tickets [ENHANCED]
│   ├── notifications.service.ts  # Notifications [ENHANCED]
│   │
│   ├── index.ts                  # Barrel exports
│   └── README.md                 # Service documentation
```

## Core Infrastructure

### Client (`client.ts`)

```typescript
// Singleton Supabase client with helpers
export const supabase: SupabaseClient<Database>;
export const getCurrentUserId(): Promise<string>;
export const getCurrentUserOrgId(): Promise<string | null>;
export const isAuthenticated(): Promise<boolean>;
```

### Types (`types.ts`)

```typescript
// Database types
export type Tables<T>;
export type Insertable<T>;
export type Updatable<T>;
export type Enums<T>;

// Entity types
export type Booking, Facility, Zone, Organization, UserProfile...

// Extended types with relations
export type BookingWithDetails, FacilityWithZones, UserProfileWithOrg...

// Response types
export type ServiceResponse<T>, PaginatedResponse<T>;

// Filter types
export type BookingFilters, FacilityFilters, UserFilters...
```

### Errors (`errors.ts`)

```typescript
// Base error
export class ServiceError extends Error;

// Specific errors
export class NotFoundError extends ServiceError;          // 404
export class UnauthorizedError extends ServiceError;      // 401
export class ForbiddenError extends ServiceError;         // 403
export class ValidationError extends ServiceError;        // 400
export class ConflictError extends ServiceError;          // 409
export class DatabaseError extends ServiceError;          // 500
export class RateLimitError extends ServiceError;         // 429
export class NetworkError extends ServiceError;           // 503
export class TransactionError extends ServiceError;       // 500
export class TimeoutError extends ServiceError;           // 408

// Utilities
export function handleSupabaseError(error: unknown): ServiceError;
export function isServiceError(error: unknown): boolean;
export function getErrorMessage(error: unknown): string;
export function logError(error: unknown, context?: string): void;
```

### Base Service (`base.service.ts`)

```typescript
export abstract class BaseService<TRow, TInsert, TUpdate> {
  // CRUD operations
  async getAll(select?: string): Promise<TRow[]>;
  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<TRow>>;
  async getById(id: string, select?: string): Promise<TRow>;
  async create(data: TInsert): Promise<TRow>;
  async update(id: string, data: TUpdate): Promise<TRow>;
  async delete(id: string): Promise<void>;
  async restore(id: string): Promise<TRow>;
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

## Domain Services

### Authentication Service [NEW]

**Purpose**: Handle all authentication operations

**Methods**:
- `signUp(params: SignUpParams): Promise<AuthResponse>`
- `signIn(params: SignInParams): Promise<AuthResponse>`
- `signInWithGoogle(redirectTo?: string): Promise<void>`
- `signOut(): Promise<void>`
- `getCurrentUser(): Promise<User | null>`
- `getCurrentSession(): Promise<Session | null>`
- `isAuthenticated(): Promise<boolean>`
- `resetPassword(params: ResetPasswordParams): Promise<void>`
- `updatePassword(params: UpdatePasswordParams): Promise<void>`
- `updateProfile(params: UpdateProfileParams): Promise<User>`
- `refreshSession(): Promise<Session>`
- `resendVerificationEmail(email: string): Promise<void>`
- `onAuthStateChange(callback): () => void`

**Features**:
- Email/password authentication
- OAuth (Google)
- Password reset
- Session management
- Email validation
- Password strength validation

### Users Service [NEW]

**Purpose**: Manage user profiles and user-related operations

**Methods**:
- `getUserWithOrg(userId: string): Promise<UserProfileWithOrg>`
- `getUsersByOrg(orgId: string, filters?: UserFilters): Promise<UserProfile[]>`
- `getUsersByOrgPaginated(orgId: string, filters?: UserFilters): Promise<PaginatedResponse<UserProfile>>`
- `searchUsers(params: UserSearchParams): Promise<UserProfile[]>`
- `updateUserRole(params: UpdateUserRoleParams): Promise<UserProfile>`
- `activateUser(userId: string): Promise<UserProfile>`
- `deactivateUser(userId: string): Promise<UserProfile>`
- `getUserPreferences(userId: string): Promise<UserPreferences>`
- `updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserProfile>`
- `getUserStats(userId: string): Promise<UserStats>`

**Features**:
- User profile management
- Organization membership
- Role management (user, admin, org_admin)
- User preferences (theme, language, notifications)
- User search and filtering
- User statistics (bookings, spending)

### Organizations Service [NEW]

**Purpose**: Manage organizations and organization settings

**Methods**:
- `getOrganizationWithDetails(id: string): Promise<OrganizationWithDetails>`
- `getOrganizationMembers(orgId: string): Promise<UserProfile[]>`
- `getOrganizationFacilities(orgId: string): Promise<Facility[]>`
- `getOrganizationSettings(orgId: string): Promise<OrganizationSettings>`
- `updateOrganizationSettings(orgId: string, settings: Partial<OrganizationSettings>): Promise<Organization>`
- `getOrganizationStats(orgId: string): Promise<OrganizationStats>`
- `searchOrganizations(query: string, limit?: number): Promise<Organization[]>`
- `isOrganizationAdmin(userId: string, orgId: string): Promise<boolean>`

**Features**:
- Organization CRUD operations
- Member management
- Facility management
- Organization settings (business hours, booking rules, payment settings)
- Statistics (revenue, bookings, members)
- Validation (duplicate names, active bookings check)

### Cart Service [NEW]

**Purpose**: Manage shopping cart for booking facilities

**Methods**:
- `getCart(userId: string): Promise<Cart>`
- `getCartWithDetails(userId: string): Promise<CartSummary>`
- `addToCart(userId: string, params: AddToCartParams): Promise<Cart>`
- `removeFromCart(userId: string, itemId: string): Promise<Cart>`
- `updateCartItem(userId: string, itemId: string, updates: Partial<AddToCartParams>): Promise<Cart>`
- `clearCart(userId: string): Promise<void>`
- `getCartItemCount(userId: string): Promise<number>`

**Features**:
- Add/remove items
- Update cart items
- Calculate totals (subtotal, services, total)
- Cart persistence (localStorage)
- Cart expiration (24 hours)
- Validation (time ranges, facility/zone existence)

### Reviews Service [NEW]

**Purpose**: Manage facility reviews and ratings

**Methods**:
- `createReview(params: CreateReviewParams): Promise<Review>`
- `updateReview(reviewId: string, userId: string, params: UpdateReviewParams): Promise<Review>`
- `deleteReview(reviewId: string, userId: string): Promise<void>`
- `getReviewWithDetails(reviewId: string): Promise<ReviewWithDetails>`
- `getReviews(filters: ReviewFilters): Promise<PaginatedResponse<ReviewWithDetails>>`
- `getFacilityRatingStats(facilityId: string): Promise<FacilityRatingStats>`
- `getUserReviewForFacility(userId: string, facilityId: string): Promise<Review | null>`
- `canUserReview(userId: string, facilityId: string): Promise<boolean>`
- `markReviewAsHelpful(reviewId: string, userId: string): Promise<void>`

**Features**:
- Create/update/delete reviews
- Rating (1-5 stars)
- Photo uploads
- Review filtering (rating, photos, sorting)
- Rating statistics (average, distribution)
- Authorization (only review own bookings)
- Helpful votes

## Enhanced Existing Services

### Bookings Service [ENHANCED]

**New Features**:
- Extends BaseService for common operations
- Enhanced error handling with custom errors
- Type-safe filters and queries
- Better documentation

### Facilities Service [ENHANCED]

**New Features**:
- Extends BaseService
- Improved type safety
- Enhanced error handling
- Better query optimization

### Zones Service [ENHANCED]

**New Features**:
- Extends BaseService
- Type-safe availability checks
- Enhanced error handling

## Usage Examples

### Authentication Flow

```typescript
import { authService } from '@/services/supabase';

// Sign up
const { user, session } = await authService.signUp({
  email: 'user@example.com',
  password: 'SecurePass123',
  fullName: 'John Doe',
});

// Sign in
const { user, session } = await authService.signIn({
  email: 'user@example.com',
  password: 'SecurePass123',
});

// Check authentication
const isAuth = await authService.isAuthenticated();

// Sign out
await authService.signOut();
```

### User Management

```typescript
import { usersService } from '@/services/supabase';

// Get user with organization
const user = await usersService.getUserWithOrg(userId);

// Search users
const results = await usersService.searchUsers({
  query: 'john',
  orgId,
  limit: 10,
});

// Update preferences
await usersService.updateUserPreferences(userId, {
  theme: 'dark',
  language: 'en',
});
```

### Organization Management

```typescript
import { organizationsService } from '@/services/supabase';

// Get organization with details
const org = await organizationsService.getOrganizationWithDetails(orgId);
// Returns: { ...org, member_count, facility_count, active_bookings_count }

// Update settings
await organizationsService.updateOrganizationSettings(orgId, {
  bookingRules: {
    minAdvanceBooking: 2,
    maxAdvanceBooking: 30,
  },
});

// Get statistics
const stats = await organizationsService.getOrganizationStats(orgId);
// Returns: totalBookings, totalRevenue, activeFacilities, monthlyRevenue, etc.
```

### Cart Operations

```typescript
import { cartService } from '@/services/supabase';

// Add to cart
await cartService.addToCart(userId, {
  facilityId,
  zoneId,
  startTime: '2025-11-01T10:00:00Z',
  endTime: '2025-11-01T12:00:00Z',
  services: [{ serviceId, quantity: 2, priceCents: 1000 }],
});

// Get cart summary
const summary = await cartService.getCartWithDetails(userId);
// Returns: { itemCount, subtotal, servicesTotal, total, items[] }
```

### Review Management

```typescript
import { reviewsService } from '@/services/supabase';

// Create review
await reviewsService.createReview({
  facilityId,
  userId,
  bookingId,
  rating: 5,
  comment: 'Great facility!',
});

// Get facility ratings
const stats = await reviewsService.getFacilityRatingStats(facilityId);
// Returns: { averageRating, totalReviews, ratingDistribution, recentReviews }
```

## Error Handling Patterns

### 1. Specific Error Handling

```typescript
try {
  const user = await usersService.getById(userId);
} catch (error) {
  if (error instanceof NotFoundError) {
    toast.error('User not found');
  } else if (error instanceof ValidationError) {
    console.log('Fields:', error.fields);
  } else if (error instanceof UnauthorizedError) {
    router.push('/login');
  }
}
```

### 2. Form Validation

```typescript
try {
  await usersService.create(formData);
} catch (error) {
  if (error instanceof ValidationError && error.fields) {
    Object.entries(error.fields).forEach(([field, messages]) => {
      form.setError(field, { message: messages[0] });
    });
  }
}
```

### 3. Generic Error Display

```typescript
import { getErrorMessage } from '@/services/supabase';

try {
  await someOperation();
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

## Migration Path

### Phase 1: Core Infrastructure ✅
- [x] Client singleton
- [x] Type definitions
- [x] Error classes
- [x] Base service

### Phase 2: Authentication & Users ✅
- [x] Authentication service
- [x] Users service
- [x] Organizations service

### Phase 3: Feature Services ✅
- [x] Cart service
- [x] Reviews service

### Phase 4: Enhance Existing Services ✅
- [x] Update existing services to use BaseService
- [x] Add comprehensive error handling
- [x] Improve type safety

### Phase 5: Testing & Documentation ✅
- [x] Service layer documentation
- [x] Usage examples
- [x] Migration guide

## Best Practices

1. **Always use services** - Never call Supabase directly in components
2. **Handle errors properly** - Use try-catch with specific error types
3. **Use type-safe operations** - Leverage TypeScript for compile-time safety
4. **Validate input** - Services validate before database operations
5. **Keep services focused** - Single responsibility per service
6. **Document complex operations** - Use JSDoc for clarity
7. **Test thoroughly** - Unit tests for all service methods
8. **Log errors** - Use logError() for debugging

## Performance Considerations

1. **Select specific fields** - Don't fetch unnecessary data
2. **Use pagination** - For large datasets
3. **Cache where appropriate** - React Query for data caching
4. **Optimize queries** - Use proper indexes and filters
5. **Batch operations** - Group related operations

## Future Enhancements

1. **Transaction support** - Multi-step operations with rollback
2. **Caching layer** - Redis for frequently accessed data
3. **Real-time subscriptions** - WebSocket for live updates
4. **Audit logging** - Track all data changes
5. **Rate limiting** - Prevent abuse
6. **Data migration tools** - Version control for database schema
7. **GraphQL support** - Alternative to REST
8. **Webhooks** - External integrations

## Summary

The BookMe service layer provides:

- **Type Safety**: 100% TypeScript with no `any` types
- **SOLID Design**: Maintainable and extensible architecture
- **Error Handling**: Semantic errors with proper context
- **Consistency**: Unified interface across all services
- **Documentation**: Comprehensive guides and examples
- **Testing**: Easily testable with dependency injection
- **Performance**: Optimized queries and caching

All services follow the same patterns, making the codebase predictable and easy to maintain.
