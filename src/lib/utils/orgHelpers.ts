/**
 * Organization Helper Utilities
 * 
 * Provides helper functions for working with organization context
 * in a multi-tenant environment.
 * 
 * Key Functions:
 * - getCurrentOrgIdForUser: Get the current organization ID for a user
 * - getUserOrganizations: Get all organizations a user belongs to
 * - isUserOrgMember: Check if user is a member of an organization
 * 
 * Usage in Services:
 * ```ts
 * import { getCurrentOrgIdForUser } from '@/lib/utils/orgHelpers';
 * 
 * async function getFacilities(userId: string) {
 *   const orgId = await getCurrentOrgIdForUser(userId);
 *   return facilitiesService.getAll(orgId);
 * }
 * ```
 */

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';

type _Profile = Database['public']['Tables']['profiles']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

/**
 * Get the current organization ID for a user
 * 
 * Priority:
 * 1. User's default_org from profile
 * 2. First active membership org_id
 * 3. null if no organizations
 * 
 * @param userId - User ID to get organization for
 * @returns Organization ID or null
 * 
 * @example
 * ```ts
 * const orgId = await getCurrentOrgIdForUser(user.id);
 * if (!orgId) {
 *   throw new Error('User has no organization');
 * }
 * ```
 */
export async function getCurrentOrgIdForUser(userId: string): Promise<string | null> {
  try {
    // First, try to get default_org from user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('default_org')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is acceptable
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    // If user has a default org set, use it
    if (profile?.default_org) {
      return profile.default_org;
    }

    // Otherwise, get first active membership
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (membershipError) {
      console.error('Error fetching user memberships:', membershipError);
      throw membershipError;
    }

    // Return first membership's org_id or null
    return memberships && memberships.length > 0 ? memberships[0].org_id : null;
  } catch (error) {
    console.error('Error in getCurrentOrgIdForUser:', error);
    throw error;
  }
}

/**
 * Get all organizations a user belongs to
 * 
 * @param userId - User ID to get organizations for
 * @returns Array of organizations with membership info
 * 
 * @example
 * ```ts
 * const orgs = await getUserOrganizations(user.id);
 * console.log(`User belongs to ${orgs.length} organizations`);
 * ```
 */
export interface UserOrganization extends Organization {
  readonly membership: {
    readonly role: Membership['role'];
    readonly joined_at: Membership['created_at'];
  };
}

export async function getUserOrganizations(userId: string): Promise<UserOrganization[]> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select(`
        role,
        created_at,
        organization:organizations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user organizations:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Transform data to match UserOrganization interface
    return data
      .filter(item => item.organization !== null)
      .map(item => ({
        ...(item.organization as Organization),
        membership: {
          role: item.role,
          joined_at: item.created_at,
        },
      }));
  } catch (error) {
    console.error('Error in getUserOrganizations:', error);
    throw error;
  }
}

/**
 * Check if a user is a member of an organization
 * 
 * @param userId - User ID to check
 * @param orgId - Organization ID to check
 * @param requiredRole - Optional minimum role required (e.g., 'staff', 'admin')
 * @returns true if user is a member with required role
 * 
 * @example
 * ```ts
 * const isStaff = await isUserOrgMember(user.id, orgId, 'staff');
 * if (!isStaff) {
 *   throw new Error('Insufficient permissions');
 * }
 * ```
 */
export async function isUserOrgMember(
  userId: string,
  orgId: string,
  requiredRole?: 'user' | 'staff' | 'admin' | 'owner'
): Promise<boolean> {
  try {
    const query = supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId);

    const { data, error } = await query.single();

    if (error) {
      // If no membership found, user is not a member
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking user membership:', error);
      throw error;
    }

    // If no required role, just check membership exists
    if (!requiredRole) {
      return data !== null;
    }

    // Check if user has required role or higher
    const roleHierarchy = ['user', 'staff', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(data.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  } catch (error) {
    console.error('Error in isUserOrgMember:', error);
    throw error;
  }
}

/**
 * Get user's role in an organization
 * 
 * @param userId - User ID
 * @param orgId - Organization ID
 * @returns User's role or null if not a member
 * 
 * @example
 * ```ts
 * const role = await getUserOrgRole(user.id, orgId);
 * console.log(`User role: ${role}`);
 * ```
 */
export async function getUserOrgRole(
  userId: string,
  orgId: string
): Promise<Membership['role'] | null> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not a member
      }
      console.error('Error fetching user role:', error);
      throw error;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in getUserOrgRole:', error);
    throw error;
  }
}

/**
 * Set user's default organization
 * 
 * @param userId - User ID
 * @param orgId - Organization ID to set as default
 * 
 * @example
 * ```ts
 * await setUserDefaultOrg(user.id, selectedOrgId);
 * ```
 */
export async function setUserDefaultOrg(
  userId: string,
  orgId: string
): Promise<void> {
  try {
    // Verify user is a member of this org
    const isMember = await isUserOrgMember(userId, orgId);
    if (!isMember) {
      throw new Error('User is not a member of this organization');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ default_org: orgId })
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default org:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in setUserDefaultOrg:', error);
    throw error;
  }
}

/**
 * Get all org IDs for a user (for query filtering)
 * 
 * Useful for filtering queries across multiple organizations
 * 
 * @param userId - User ID
 * @returns Array of organization IDs
 * 
 * @example
 * ```ts
 * const orgIds = await getUserOrgIds(user.id);
 * const facilities = await supabase
 *   .from('facilities')
 *   .select('*')
 *   .in('org_id', orgIds);
 * ```
 */
export async function getUserOrgIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select('org_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user org IDs:', error);
      throw error;
    }

    return data?.map(m => m.org_id) || [];
  } catch (error) {
    console.error('Error in getUserOrgIds:', error);
    throw error;
  }
}

/**
 * Export all helper functions as a single object for convenience
 */
export const orgHelpers = {
  getCurrentOrgIdForUser,
  getUserOrganizations,
  isUserOrgMember,
  getUserOrgRole,
  setUserDefaultOrg,
  getUserOrgIds,
};

export default orgHelpers;
