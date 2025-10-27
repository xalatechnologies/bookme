/**
 * Role-Based Access Control (RBAC) Service
 *
 * Provides role and permission checking utilities for the BookMe application.
 * Integrates with Supabase RLS policies and helper functions.
 *
 * Features:
 * - Role checking (platform admin, org admin, staff, customer)
 * - Permission checking (resource-based)
 * - Organization membership management
 * - Multi-tenant support
 *
 * @module services/supabase/rbac.service
 */

import { supabase } from './client';
import { handleSupabaseError } from './errors';
import type { Database } from '@/types/database';

type OrgRole = Database['public']['Enums']['org_role'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Permission definition for resource-based access control
 */
export interface Permission {
  readonly resource: string;
  readonly action: 'create' | 'read' | 'update' | 'delete';
}

/**
 * User role with organization context
 */
export interface UserRole {
  readonly userId: string;
  readonly orgId: string;
  readonly role: OrgRole;
}

/**
 * Permission check result with context
 */
export interface PermissionCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
}

/**
 * RBAC Service Class
 *
 * Provides methods for checking user roles and permissions.
 *
 * @example
 * ```typescript
 * import { rbacService } from '@/services/supabase/rbac.service';
 *
 * // Check if user is org admin
 * const isAdmin = await rbacService.isOrgAdmin(userId, orgId);
 *
 * // Check permission
 * const canCreate = await rbacService.hasPermission(userId, {
 *   resource: 'facilities',
 *   action: 'create'
 * }, orgId);
 *
 * // Get user's organizations
 * const orgs = await rbacService.getUserOrganizations(userId);
 * ```
 */
export class RBACService {
  /**
   * Check if user has a specific role in an organization
   *
   * @param userId - User ID to check
   * @param orgId - Organization ID
   * @param role - Required role
   * @returns True if user has the role
   */
  async hasRole(
    userId: string,
    orgId: string,
    role: OrgRole
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.role === role;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Check if user is organization admin or owner
   *
   * @param userId - User ID to check
   * @param orgId - Organization ID
   * @returns True if user is admin or owner
   */
  async isOrgAdmin(userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (error || !data) {
        return false;
      }

      return ['owner', 'admin'].includes(data.role);
    } catch (error) {
      console.error('Error checking org admin:', error);
      return false;
    }
  }

  /**
   * Check if user is staff member (staff, admin, or owner)
   *
   * @param userId - User ID to check
   * @param orgId - Organization ID
   * @returns True if user is staff member
   */
  async isOrgStaff(userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (error || !data) {
        return false;
      }

      return ['owner', 'admin', 'staff'].includes(data.role);
    } catch (error) {
      console.error('Error checking org staff:', error);
      return false;
    }
  }

  /**
   * Check if user is platform admin (super admin)
   *
   * Platform admins are identified by the JWT claim 'role' = 'platform_admin'
   *
   * @param userId - User ID to check
   * @returns True if user is platform admin
   */
  async isPlatformAdmin(userId: string): Promise<boolean> {
    try {
      // Call the database function to check
      const { data, error } = await supabase.rpc('is_platform_admin');

      if (error) {
        console.error('Error checking platform admin:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking platform admin:', error);
      return false;
    }
  }

  /**
   * Get user's role in an organization
   *
   * @param userId - User ID
   * @param orgId - Organization ID
   * @returns User's role or null if not a member
   */
  async getUserRole(userId: string, orgId: string): Promise<OrgRole | null> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Get user's highest role across all organizations
   *
   * @param userId - User ID
   * @returns Highest role or 'customer' as default
   */
  async getUserHighestRole(userId: string): Promise<OrgRole> {
    try {
      // Check if platform admin first
      const isPlatformAdmin = await this.isPlatformAdmin(userId);
      if (isPlatformAdmin) {
        return 'owner'; // Platform admin has highest privileges
      }

      const { data, error } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: false }); // Order by role importance

      if (error || !data || data.length === 0) {
        return 'customer';
      }

      // Map roles to priority (owner > admin > staff > customer)
      const rolePriority: Record<OrgRole, number> = {
        owner: 4,
        admin: 3,
        staff: 2,
        customer: 1,
      };

      const highestRole = data.reduce((highest, current) => {
        return rolePriority[current.role] > rolePriority[highest.role]
          ? current
          : highest;
      });

      return highestRole.role;
    } catch (error) {
      console.error('Error getting highest role:', error);
      return 'customer';
    }
  }

  /**
   * Get all organizations user belongs to
   *
   * @param userId - User ID
   * @returns Array of organization IDs
   */
  async getUserOrganizations(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', userId);

      if (error || !data) {
        return [];
      }

      return data.map((m) => m.org_id);
    } catch (error) {
      console.error('Error getting user organizations:', error);
      return [];
    }
  }

  /**
   * Get organizations where user has specific minimum role
   *
   * @param userId - User ID
   * @param minRole - Minimum required role
   * @returns Array of organization IDs
   */
  async getUserOrganizationsWithRole(
    userId: string,
    minRole: OrgRole
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('org_id, role')
        .eq('user_id', userId);

      if (error || !data) {
        return [];
      }

      // Role priority mapping
      const rolePriority: Record<OrgRole, number> = {
        owner: 4,
        admin: 3,
        staff: 2,
        customer: 1,
      };

      const minPriority = rolePriority[minRole];

      return data
        .filter((m) => rolePriority[m.role] >= minPriority)
        .map((m) => m.org_id);
    } catch (error) {
      console.error('Error getting organizations with role:', error);
      return [];
    }
  }

  /**
   * Get user's memberships with full details
   *
   * @param userId - User ID
   * @returns Array of memberships
   */
  async getUserMemberships(userId: string): Promise<Membership[]> {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw handleSupabaseError(error, 'getUserMemberships');
      }

      return data || [];
    } catch (error) {
      throw handleSupabaseError(error, 'getUserMemberships');
    }
  }

  /**
   * Check if user has permission for a specific resource action
   *
   * This implements the permission matrix:
   * - Platform Admin: All permissions
   * - Owner/Admin: Full permissions within org
   * - Staff: Manage facilities, bookings, reviews
   * - Customer: Create bookings, manage own data
   *
   * @param userId - User ID
   * @param permission - Permission to check
   * @param orgId - Optional organization ID for context
   * @returns True if user has permission
   */
  async hasPermission(
    userId: string,
    permission: Permission,
    orgId?: string
  ): Promise<boolean> {
    try {
      // Check if platform admin (has all permissions)
      const isPlatformAdmin = await this.isPlatformAdmin(userId);
      if (isPlatformAdmin) {
        return true;
      }

      // Get user's role in the organization
      let role: OrgRole;
      if (orgId) {
        const userRole = await this.getUserRole(userId, orgId);
        if (!userRole) {
          role = 'customer'; // Not a member, default to customer
        } else {
          role = userRole;
        }
      } else {
        role = await this.getUserHighestRole(userId);
      }

      // Permission matrix based on role
      const { resource, action } = permission;

      switch (role) {
        case 'owner':
        case 'admin':
          // Owners and admins have full permissions
          return true;

        case 'staff':
          // Staff can manage facilities, bookings, availability, but not org settings
          return this.checkStaffPermissions(resource, action);

        case 'customer':
          // Customers have limited permissions
          return this.checkCustomerPermissions(resource, action);

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check staff permissions
   *
   * @param resource - Resource type
   * @param action - Action type
   * @returns True if staff has permission
   */
  private checkStaffPermissions(
    resource: string,
    action: string
  ): boolean {
    const staffPermissions: Record<string, string[]> = {
      facilities: ['create', 'read', 'update', 'delete'],
      bookings: ['create', 'read', 'update', 'delete'],
      availability_rules: ['create', 'read', 'update', 'delete'],
      blackouts: ['create', 'read', 'update', 'delete'],
      reviews: ['read', 'delete'], // Can moderate reviews
      pricing_rules: ['create', 'read', 'update', 'delete'],
      zones: ['create', 'read', 'update', 'delete'],
    };

    return staffPermissions[resource]?.includes(action) || false;
  }

  /**
   * Check customer permissions
   *
   * @param resource - Resource type
   * @param action - Action type
   * @returns True if customer has permission
   */
  private checkCustomerPermissions(
    resource: string,
    action: string
  ): boolean {
    const customerPermissions: Record<string, string[]> = {
      bookings: ['create', 'read', 'update'], // Can manage own bookings
      facilities: ['read'], // Can view published facilities
      profile: ['read', 'update'], // Can manage own profile
      favorites: ['create', 'read', 'delete'], // Can manage favorites
      reviews: ['create', 'read'], // Can create and view reviews
    };

    return customerPermissions[resource]?.includes(action) || false;
  }

  /**
   * Check permission with detailed result
   *
   * @param userId - User ID
   * @param permission - Permission to check
   * @param orgId - Optional organization ID
   * @returns Permission check result with reason
   */
  async checkPermissionWithReason(
    userId: string,
    permission: Permission,
    orgId?: string
  ): Promise<PermissionCheckResult> {
    try {
      const allowed = await this.hasPermission(userId, permission, orgId);

      if (allowed) {
        return { allowed: true };
      }

      // Get user role to provide reason
      let role: OrgRole;
      if (orgId) {
        const userRole = await this.getUserRole(userId, orgId);
        role = userRole || 'customer';
      } else {
        role = await this.getUserHighestRole(userId);
      }

      return {
        allowed: false,
        reason: `User with role '${role}' does not have permission to ${permission.action} ${permission.resource}`,
      };
    } catch (error) {
      console.error('Error checking permission:', error);
      return {
        allowed: false,
        reason: 'Error checking permission',
      };
    }
  }

  /**
   * Can user manage facility
   *
   * @param userId - User ID
   * @param facilityId - Facility ID
   * @returns True if user can manage facility
   */
  async canManageFacility(
    userId: string,
    facilityId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_manage_facility', {
        facility_id_param: facilityId,
      });

      if (error) {
        console.error('Error checking facility management:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking facility management:', error);
      return false;
    }
  }

  /**
   * Can user view booking
   *
   * @param userId - User ID
   * @param bookingId - Booking ID
   * @returns True if user can view booking
   */
  async canViewBooking(userId: string, bookingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_view_booking', {
        booking_id_param: bookingId,
      });

      if (error) {
        console.error('Error checking booking view:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking booking view:', error);
      return false;
    }
  }

  /**
   * Can user manage booking
   *
   * @param userId - User ID
   * @param bookingId - Booking ID
   * @returns True if user can manage booking
   */
  async canManageBooking(userId: string, bookingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_manage_booking', {
        booking_id_param: bookingId,
      });

      if (error) {
        console.error('Error checking booking management:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking booking management:', error);
      return false;
    }
  }
}

/**
 * Singleton instance of RBACService
 */
export const rbacService = new RBACService();
