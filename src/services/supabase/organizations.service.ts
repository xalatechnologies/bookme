/**
 * Organizations Service
 *
 * Manages organization data and organization-related operations.
 *
 * Features:
 * - Organization CRUD operations
 * - Member management
 * - Organization settings
 * - Statistics and analytics
 *
 * @module services/supabase/organizations
 */

import { BaseService } from './base.service';
import { supabase } from './client';
import { handleSupabaseError, NotFoundError, ValidationError } from './errors';
import type {
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  UserProfile,
  Facility,
  PaginatedResponse,
} from './types';

// ============================================================================
// Extended Types
// ============================================================================

export interface OrganizationWithDetails extends Organization {
  readonly member_count?: number;
  readonly facility_count?: number;
  readonly active_bookings_count?: number;
}

export interface OrganizationSettings {
  readonly businessHours?: {
    readonly [key: string]: {
      readonly open: string;
      readonly close: string;
      readonly closed?: boolean;
    };
  };
  readonly bookingRules?: {
    readonly minAdvanceBooking?: number; // hours
    readonly maxAdvanceBooking?: number; // days
    readonly cancellationPolicy?: string;
    readonly requiresApproval?: boolean;
  };
  readonly paymentSettings?: {
    readonly currency?: string;
    readonly acceptedMethods?: string[];
    readonly depositRequired?: boolean;
    readonly depositPercentage?: number;
  };
  readonly notifications?: {
    readonly emailNotifications?: boolean;
    readonly smsNotifications?: boolean;
    readonly bookingConfirmation?: boolean;
    readonly bookingReminders?: boolean;
  };
}

export interface OrganizationStats {
  readonly totalBookings: number;
  readonly totalRevenue: number;
  readonly activeFacilities: number;
  readonly totalMembers: number;
  readonly upcomingBookings: number;
  readonly monthlyRevenue: number;
  readonly monthlyBookings: number;
}

// ============================================================================
// Organizations Service
// ============================================================================

export class OrganizationsService extends BaseService<
  Organization,
  OrganizationInsert,
  OrganizationUpdate
> {
  protected readonly config = {
    tableName: 'organizations',
    idColumn: 'id',
    softDelete: false,
  };

  /**
   * Get organization with member and facility counts
   *
   * @param id - Organization ID
   * @returns Organization with details
   */
  async getOrganizationWithDetails(id: string): Promise<OrganizationWithDetails> {
    try {
      const org = await this.getById(id);

      // Get member count
      const { count: memberCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', id);

      // Get facility count
      const { count: facilityCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', id);

      // Get active bookings count
      const { count: activeBookingsCount } = await supabase
        .from('bookings')
        .select('*, facility:facilities!inner(*)', { count: 'exact', head: true })
        .eq('facility.org_id', id)
        .in('status', ['confirmed', 'pending']);

      return {
        ...org,
        member_count: memberCount ?? 0,
        facility_count: facilityCount ?? 0,
        active_bookings_count: activeBookingsCount ?? 0,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getOrganizationWithDetails');
    }
  }

  /**
   * Get all members of an organization
   *
   * @param orgId - Organization ID
   * @returns Array of user profiles
   */
  async getOrganizationMembers(orgId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        throw handleSupabaseError(error, 'getOrganizationMembers');
      }

      return (data ?? []) as UserProfile[];
    } catch (error) {
      throw handleSupabaseError(error, 'getOrganizationMembers');
    }
  }

  /**
   * Get all facilities of an organization
   *
   * @param orgId - Organization ID
   * @returns Array of facilities
   */
  async getOrganizationFacilities(orgId: string): Promise<Facility[]> {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        throw handleSupabaseError(error, 'getOrganizationFacilities');
      }

      return (data ?? []) as Facility[];
    } catch (error) {
      throw handleSupabaseError(error, 'getOrganizationFacilities');
    }
  }

  /**
   * Get organization settings
   *
   * @param orgId - Organization ID
   * @returns Organization settings
   */
  async getOrganizationSettings(orgId: string): Promise<OrganizationSettings> {
    try {
      const org = await this.getById(orgId);
      return (org.settings as OrganizationSettings) ?? {};
    } catch (error) {
      throw handleSupabaseError(error, 'getOrganizationSettings');
    }
  }

  /**
   * Update organization settings
   *
   * @param orgId - Organization ID
   * @param settings - Settings to update
   * @returns Updated organization
   */
  async updateOrganizationSettings(
    orgId: string,
    settings: Partial<OrganizationSettings>
  ): Promise<Organization> {
    try {
      const currentSettings = await this.getOrganizationSettings(orgId);
      const updatedSettings = { ...currentSettings, ...settings };

      return await this.update(orgId, {
        settings: updatedSettings as unknown as Record<string, unknown>,
      } as OrganizationUpdate);
    } catch (error) {
      throw handleSupabaseError(error, 'updateOrganizationSettings');
    }
  }

  /**
   * Get organization statistics
   *
   * @param orgId - Organization ID
   * @returns Organization statistics
   */
  async getOrganizationStats(orgId: string): Promise<OrganizationStats> {
    try {
      // Get all bookings for the organization
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, facility:facilities!inner(*)')
        .eq('facility.org_id', orgId);

      if (bookingsError) {
        throw handleSupabaseError(bookingsError, 'getOrganizationStats');
      }

      // Get facility count
      const { count: facilityCount } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'published');

      // Get member count
      const { count: memberCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId);

      // Calculate statistics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalRevenue = bookings?.reduce(
        (sum, b) => sum + (b.total_price_cents ?? 0),
        0
      ) ?? 0;

      const upcomingBookings = bookings?.filter(
        (b) => b.status === 'confirmed' || b.status === 'pending'
      ).length ?? 0;

      const monthlyBookings = bookings?.filter(
        (b) => new Date(b.created_at) >= firstDayOfMonth
      ) ?? [];

      const monthlyRevenue = monthlyBookings.reduce(
        (sum, b) => sum + (b.total_price_cents ?? 0),
        0
      );

      return {
        totalBookings: bookings?.length ?? 0,
        totalRevenue,
        activeFacilities: facilityCount ?? 0,
        totalMembers: memberCount ?? 0,
        upcomingBookings,
        monthlyRevenue,
        monthlyBookings: monthlyBookings.length,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getOrganizationStats');
    }
  }

  /**
   * Search organizations
   *
   * @param query - Search query
   * @param limit - Maximum results
   * @returns Array of organizations
   */
  async searchOrganizations(query: string, limit = 10): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw handleSupabaseError(error, 'searchOrganizations');
      }

      return (data ?? []) as Organization[];
    } catch (error) {
      throw handleSupabaseError(error, 'searchOrganizations');
    }
  }

  /**
   * Get organizations with pagination
   *
   * @param page - Page number
   * @param pageSize - Items per page
   * @returns Paginated organizations
   */
  async getOrganizationsPaginated(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Organization>> {
    try {
      return await this.getPaginated({ page, pageSize });
    } catch (error) {
      throw handleSupabaseError(error, 'getOrganizationsPaginated');
    }
  }

  /**
   * Check if user is organization admin
   *
   * @param userId - User ID
   * @param orgId - Organization ID
   * @returns True if user is admin
   */
  async isOrganizationAdmin(userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (error) {
        return false;
      }

      return data?.role === 'admin' || data?.role === 'org_admin';
    } catch (error) {
      return false;
    }
  }

  // ==========================================================================
  // Validation Hooks
  // ==========================================================================

  protected async validateInsert(data: OrganizationInsert): Promise<void> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Organization name is required', {
        name: ['Name cannot be empty'],
      });
    }

    if (data.name.length < 3) {
      throw new ValidationError('Organization name too short', {
        name: ['Name must be at least 3 characters long'],
      });
    }

    // Check for duplicate name
    const { data: existing, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', data.name)
      .single();

    if (!error && existing) {
      throw new ValidationError('Organization name already exists', {
        name: ['An organization with this name already exists'],
      });
    }
  }

  protected async validateUpdate(
    id: string,
    data: OrganizationUpdate
  ): Promise<void> {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Organization name is required', {
          name: ['Name cannot be empty'],
        });
      }

      if (data.name.length < 3) {
        throw new ValidationError('Organization name too short', {
          name: ['Name must be at least 3 characters long'],
        });
      }

      // Check for duplicate name (excluding current org)
      const { data: existing, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', data.name)
        .neq('id', id)
        .single();

      if (!error && existing) {
        throw new ValidationError('Organization name already exists', {
          name: ['An organization with this name already exists'],
        });
      }
    }
  }

  protected async beforeDelete(id: string): Promise<void> {
    // Check if organization has active bookings
    const { count } = await supabase
      .from('bookings')
      .select('*, facility:facilities!inner(*)', { count: 'exact', head: true })
      .eq('facility.org_id', id)
      .in('status', ['confirmed', 'pending']);

    if (count && count > 0) {
      throw new ValidationError(
        'Cannot delete organization with active bookings',
        {
          organization: [
            `This organization has ${count} active bookings. Please cancel them first.`,
          ],
        }
      );
    }
  }
}

/**
 * Singleton instance of OrganizationsService
 */
export const organizationsService = new OrganizationsService();
