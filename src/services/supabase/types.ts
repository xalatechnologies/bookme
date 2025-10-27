/**
 * Supabase Service Types
 *
 * Centralized type definitions for Supabase services.
 * Re-exports database types and defines service-specific types.
 *
 * @module services/supabase/types
 */

import type { Database } from '@/types/database';

// ============================================================================
// Database Table Types
// ============================================================================

export type { Database };

/**
 * Extract Row type from a table
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/**
 * Extract Insert type from a table
 */
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Extract Update type from a table
 */
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Extract Enum type
 */
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// ============================================================================
// Common Entity Types
// ============================================================================

export type Booking = Tables<'bookings'>;
export type BookingInsert = Insertable<'bookings'>;
export type BookingUpdate = Updatable<'bookings'>;

export type Facility = Tables<'facilities'>;
export type FacilityInsert = Insertable<'facilities'>;
export type FacilityUpdate = Updatable<'facilities'>;

export type Zone = Tables<'zones'>;
export type ZoneInsert = Insertable<'zones'>;
export type ZoneUpdate = Updatable<'zones'>;

export type Organization = Tables<'organizations'>;
export type OrganizationInsert = Insertable<'organizations'>;
export type OrganizationUpdate = Updatable<'organizations'>;

export type UserProfile = Tables<'user_profiles'>;
export type UserProfileInsert = Insertable<'user_profiles'>;
export type UserProfileUpdate = Updatable<'user_profiles'>;

export type AdditionalService = Tables<'additional_services'>;
export type AdditionalServiceInsert = Insertable<'additional_services'>;
export type AdditionalServiceUpdate = Updatable<'additional_services'>;

export type BookingService = Tables<'booking_services'>;
export type BookingServiceInsert = Insertable<'booking_services'>;
export type BookingServiceUpdate = Updatable<'booking_services'>;

export type Favorite = Tables<'favorites'>;
export type FavoriteInsert = Insertable<'favorites'>;
export type FavoriteUpdate = Updatable<'favorites'>;

export type Review = Tables<'reviews'>;
export type ReviewInsert = Insertable<'reviews'>;
export type ReviewUpdate = Updatable<'reviews'>;

export type Message = Tables<'messages'>;
export type MessageInsert = Insertable<'messages'>;
export type MessageUpdate = Updatable<'messages'>;

export type MessageThread = Tables<'message_threads'>;
export type MessageThreadInsert = Insertable<'message_threads'>;
export type MessageThreadUpdate = Updatable<'message_threads'>;

export type Notification = Tables<'notifications'>;
export type NotificationInsert = Insertable<'notifications'>;
export type NotificationUpdate = Updatable<'notifications'>;

export type RecurringBooking = Tables<'recurring_bookings'>;
export type RecurringBookingInsert = Insertable<'recurring_bookings'>;
export type RecurringBookingUpdate = Updatable<'recurring_bookings'>;

export type Group = Tables<'groups'>;
export type GroupInsert = Insertable<'groups'>;
export type GroupUpdate = Updatable<'groups'>;

export type GroupMember = Tables<'group_members'>;
export type GroupMemberInsert = Insertable<'group_members'>;
export type GroupMemberUpdate = Updatable<'group_members'>;

// ============================================================================
// Enum Types
// ============================================================================

export type BookingStatus = Enums<'booking_status'>;
export type FacilityStatus = Enums<'facility_status'>;
export type UserRole = Enums<'user_role'>;
export type PaymentStatus = Enums<'payment_status'>;
export type NotificationType = Enums<'notification_type'>;
export type ServiceCategory = Enums<'service_category'>;
export type RecurrencePattern = Enums<'recurrence_pattern'>;

// ============================================================================
// Service Response Types
// ============================================================================

/**
 * Generic service response wrapper
 */
export interface ServiceResponse<T> {
  readonly data: T | null;
  readonly error: Error | null;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly count: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  readonly page?: number;
  readonly pageSize?: number;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  readonly startDate?: string;
  readonly endDate?: string;
}

/**
 * Sort parameters
 */
export interface SortParams {
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Extended Entity Types with Relations
// ============================================================================

/**
 * Booking with related facility and zone
 */
export interface BookingWithDetails extends Booking {
  readonly facility?: Facility | null;
  readonly zone?: Zone | null;
  readonly user?: UserProfile | null;
  readonly services?: BookingService[] | null;
}

/**
 * Facility with zones and organization
 */
export interface FacilityWithZones extends Facility {
  readonly zones?: Zone[] | null;
  readonly organization?: Organization | null;
}

/**
 * User profile with organization details
 */
export interface UserProfileWithOrg extends UserProfile {
  readonly organization?: Organization | null;
}

/**
 * Review with user and facility details
 */
export interface ReviewWithDetails extends Review {
  readonly user?: UserProfile | null;
  readonly facility?: Facility | null;
}

/**
 * Message with sender details
 */
export interface MessageWithSender extends Message {
  readonly sender?: UserProfile | null;
}

/**
 * Thread with messages and participants
 */
export interface ThreadWithDetails extends MessageThread {
  readonly messages?: MessageWithSender[] | null;
  readonly participants?: UserProfile[] | null;
  readonly unread_count?: number;
}

/**
 * Group with members
 */
export interface GroupWithMembers extends Group {
  readonly members?: (GroupMember & { user?: UserProfile })[] | null;
  readonly member_count?: number;
}

/**
 * Recurring booking with occurrences
 */
export interface RecurringBookingWithOccurrences extends RecurringBooking {
  readonly occurrences?: Booking[] | null;
  readonly facility?: Facility | null;
  readonly zone?: Zone | null;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Booking filters
 */
export interface BookingFilters extends PaginationParams, SortParams, DateRangeFilter {
  readonly status?: BookingStatus | BookingStatus[];
  readonly facilityId?: string;
  readonly zoneId?: string;
  readonly userId?: string;
  readonly orgId?: string;
}

/**
 * Facility filters
 */
export interface FacilityFilters extends PaginationParams, SortParams {
  readonly orgId?: string;
  readonly status?: FacilityStatus | FacilityStatus[];
  readonly search?: string;
  readonly category?: string;
  readonly hasZones?: boolean;
}

/**
 * User filters
 */
export interface UserFilters extends PaginationParams, SortParams {
  readonly orgId?: string;
  readonly role?: UserRole | UserRole[];
  readonly search?: string;
  readonly isActive?: boolean;
}

/**
 * Message filters
 */
export interface MessageFilters extends PaginationParams, SortParams {
  readonly threadId?: string;
  readonly senderId?: string;
  readonly recipientId?: string;
  readonly isRead?: boolean;
}

/**
 * Notification filters
 */
export interface NotificationFilters extends PaginationParams, SortParams {
  readonly userId?: string;
  readonly type?: NotificationType | NotificationType[];
  readonly isRead?: boolean;
  readonly priority?: string;
}
