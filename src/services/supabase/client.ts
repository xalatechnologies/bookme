/**
 * Supabase Client Singleton
 *
 * Centralized Supabase client configuration for the entire application.
 * This module re-exports the configured Supabase client with type safety.
 *
 * @module services/supabase/client
 */

import { supabase } from '@/lib/clients/supabase';

/**
 * Re-export the configured Supabase client
 * Use this client throughout the service layer for consistency
 */
export { supabase };

/**
 * Helper to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
};

/**
 * Get the current user ID
 * @throws {Error} If user is not authenticated
 */
export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated');
  }

  return user.id;
};

/**
 * Get the current user's organization ID
 * Fetches from user_profiles table
 */
export const getCurrentUserOrgId = async (): Promise<string | null> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user org_id:', error);
    return null;
  }

  return data?.org_id ?? null;
};
