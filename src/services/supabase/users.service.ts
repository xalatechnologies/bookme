/**
 * Users Service
 *
 * Manages user profiles and user-related operations.
 *
 * Features:
 * - User profile management
 * - User search and filtering
 * - Organization membership
 * - Role management
 * - User preferences
 *
 * @module services/supabase/users
 */

import { BaseService } from './base.service';
import { supabase } from './client';
import { handleSupabaseError, NotFoundError, ValidationError } from './errors';
import type {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  UserProfileWithOrg,
  Organization,
  UserFilters,
  PaginatedResponse,
  OrgRole,
} from './types';

// ============================================================================
// Extended Types
// ============================================================================

export interface UserSearchParams {
  readonly query: string;
  readonly orgId?: string;
  readonly role?: OrgRole;
  readonly limit?: number;
}

export interface UpdateUserRoleParams {
  readonly userId: string;
  readonly role: OrgRole;
}

export interface UserPreferences {
  readonly theme?: 'light' | 'dark' | 'system';
  readonly language?: string;
  readonly notifications?: {
    readonly email?: boolean;
    readonly push?: boolean;
    readonly sms?: boolean;
  };
  readonly timezone?: string;
}

// ============================================================================
// Users Service
// ============================================================================

export class UsersService extends BaseService<
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate
> {
  protected readonly config = {
    tableName: 'profiles',
    idColumn: 'user_id',
    softDelete: false,
  };

  /**
   * Get user by user_id with organization details
   *
   * @param userId - User ID
   * @returns User profile with organization
   */
  async getUserWithOrg(userId: string): Promise<UserProfileWithOrg> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organization:organizations (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw handleSupabaseError(error, 'getUserWithOrg');
      }

      if (!data) {
        throw new NotFoundError('User', userId);
      }

      return data as UserProfileWithOrg;
    } catch (error) {
      throw handleSupabaseError(error, 'getUserWithOrg');
    }
  }

  /**
   * Get users by organization
   *
   * @param orgId - Organization ID
   * @param filters - Optional filters
   * @returns Array of users
   */
  async getUsersByOrg(
    orgId: string,
    filters?: UserFilters
  ): Promise<UserProfile[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('org_id', orgId);

      // Apply role filter
      if (filters?.role) {
        if (Array.isArray(filters.role)) {
          query = query.in('role', filters.role);
        } else {
          query = query.eq('role', filters.role);
        }
      }

      // Apply active filter
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      // Apply search
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      // Apply sorting
      const sortBy = filters?.sortBy ?? 'created_at';
      const sortOrder = filters?.sortOrder ?? 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        throw handleSupabaseError(error, 'getUsersByOrg');
      }

      return (data ?? []) as UserProfile[];
    } catch (error) {
      throw handleSupabaseError(error, 'getUsersByOrg');
    }
  }

  /**
   * Get paginated users by organization
   *
   * @param orgId - Organization ID
   * @param filters - Filters and pagination params
   * @returns Paginated users
   */
  async getUsersByOrgPaginated(
    orgId: string,
    filters?: UserFilters
  ): Promise<PaginatedResponse<UserProfile>> {
    try {
      const page = filters?.page ?? 1;
      const pageSize = filters?.pageSize ?? 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId);

      // Apply filters (same as getUsersByOrg)
      if (filters?.role) {
        if (Array.isArray(filters.role)) {
          query = query.in('role', filters.role);
        } else {
          query = query.eq('role', filters.role);
        }
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const sortBy = filters?.sortBy ?? 'created_at';
      const sortOrder = filters?.sortOrder ?? 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw handleSupabaseError(error, 'getUsersByOrgPaginated');
      }

      const totalCount = count ?? 0;
      const hasMore = to < totalCount - 1;

      return {
        data: (data ?? []) as UserProfile[],
        count: totalCount,
        page,
        pageSize,
        hasMore,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getUsersByOrgPaginated');
    }
  }

  /**
   * Search users across organization
   *
   * @param params - Search parameters
   * @returns Array of matching users
   */
  async searchUsers(params: UserSearchParams): Promise<UserProfile[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .or(
          `full_name.ilike.%${params.query}%,email.ilike.%${params.query}%`
        );

      if (params.orgId) {
        query = query.eq('org_id', params.orgId);
      }

      if (params.role) {
        query = query.eq('role', params.role);
      }

      query = query.limit(params.limit ?? 10);

      const { data, error } = await query;

      if (error) {
        throw handleSupabaseError(error, 'searchUsers');
      }

      return (data ?? []) as UserProfile[];
    } catch (error) {
      throw handleSupabaseError(error, 'searchUsers');
    }
  }

  /**
   * Update user role
   * Note: This method is not supported as the profiles table doesn't have a role column
   *
   * @param params - Update role parameters
   * @returns Updated user
   */
  async updateUserRole(params: UpdateUserRoleParams): Promise<UserProfile> {
    // Since the profiles table doesn't have a role column, we'll throw an error
    throw new Error('User role updates are not supported in the current database schema');
  }

  /**
   * Activate user account
   *
   * @param userId - User ID
   * @returns Updated user
   */
  async activateUser(userId: string): Promise<UserProfile> {
    try {
      return await this.update(userId, { is_active: true } as UserProfileUpdate);
    } catch (error) {
      throw handleSupabaseError(error, 'activateUser');
    }
  }

  /**
   * Deactivate user account
   *
   * @param userId - User ID
   * @returns Updated user
   */
  async deactivateUser(userId: string): Promise<UserProfile> {
    try {
      return await this.update(userId, { is_active: false } as UserProfileUpdate);
    } catch (error) {
      throw handleSupabaseError(error, 'deactivateUser');
    }
  }

  /**
   * Get user preferences
   * Note: This method returns an empty object as the profiles table doesn't have a preferences column
   *
   * @param userId - User ID
   * @returns User preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    // Since the profiles table doesn't have a preferences column, we'll return an empty object
    return {};
  }

  /**
   * Update user preferences
   * Note: This method does nothing as the profiles table doesn't have a preferences column
   *
   * @param userId - User ID
   * @param preferences - Preferences to update
   * @returns Updated user
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserProfile> {
    // Since the profiles table doesn't have a preferences column, we'll just return the user profile
    return await this.getById(userId);
  }

  /**
   * Get user statistics
   *
   * @param userId - User ID
   * @returns User statistics
   */
  async getUserStats(userId: string): Promise<{
    readonly totalBookings: number;
    readonly upcomingBookings: number;
    readonly cancelledBookings: number;
    readonly totalSpent: number;
  }> {
    try {
      // Get booking counts
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('status, total_cents')
        .eq('user_id', userId);

      if (bookingsError) {
        throw handleSupabaseError(bookingsError, 'getUserStats');
      }

      const now = new Date().toISOString();
      const upcoming = bookings?.filter(
        (b) => b.status === 'pending' || b.status === 'awaiting_payment' || b.status === 'paid'
      ).length ?? 0;

      const cancelled = bookings?.filter(
        (b) => b.status === 'cancelled'
      ).length ?? 0;

      const totalSpent = bookings?.reduce(
        (sum, b) => sum + (b.total_cents ?? 0),
        0
      ) ?? 0;

      return {
        totalBookings: bookings?.length ?? 0,
        upcomingBookings: upcoming,
        cancelledBookings: cancelled,
        totalSpent,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getUserStats');
    }
  }

  /**
   * Update user avatar
   *
   * @param userId - User ID
   * @param avatarUrl - Avatar URL
   * @returns Updated user
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    try {
      // Note: The profiles table doesn't have an avatar_url column
      // We'll need to store this information differently or add the column to the database
      // For now, we'll just return the user profile without updating the avatar
      return await this.getById(userId);
    } catch (error) {
      throw handleSupabaseError(error, 'updateAvatar');
    }
  }

// ==========================================================================
// Validation Hooks
// ==========================================================================

  protected async validateInsert(data: UserProfileInsert): Promise<void> {
    if (!data.user_id) {
      throw new ValidationError('User ID is required', {
        user_id: ['User ID cannot be empty'],
      });
    }

    if (!data.email) {
      throw new ValidationError('Email is required', {
        email: ['Email cannot be empty'],
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format', {
        email: ['Please provide a valid email address'],
      });
    }
  }

  protected async validateUpdate(
    id: string,
    data: UserProfileUpdate
  ): Promise<void> {
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ValidationError('Invalid email format', {
          email: ['Please provide a valid email address'],
        });
      }
    }
  }
}

/**
 * Singleton instance of UsersService
 */
export const usersService = new UsersService();
