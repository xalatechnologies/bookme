/**
 * Supabase Client Configuration
 *
 * Configures the Supabase client with authentication and real-time capabilities.
 * This client is used throughout the application for all database operations.
 *
 * Features:
 * - Auto token refresh for seamless auth
 * - Session persistence across page reloads
 * - Real-time subscriptions for collaborative features
 * - Type-safe database operations with generated types
 *
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

/**
 * Supabase client instance
 *
 * Use this client for all database operations:
 * - `supabase.from('table_name')` for CRUD operations
 * - `supabase.auth` for authentication
 * - `supabase.storage` for file uploads
 * - `supabase.rpc()` for stored procedures
 * - `supabase.channel()` for real-time subscriptions
 *
 * @example
 * ```typescript
 * // Fetch facilities
 * const { data, error } = await supabase
 *   .from('facilities')
 *   .select('*')
 *   .eq('org_id', orgId);
 *
 * // Listen to booking changes
 * const channel = supabase
 *   .channel('bookings')
 *   .on('postgres_changes', {
 *     event: '*',
 *     schema: 'public',
 *     table: 'bookings'
 *   }, handleChange)
 *   .subscribe();
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh access tokens when they expire
    autoRefreshToken: true,

    // Persist auth session to localStorage for seamless experience
    persistSession: true,

    // Detect session from URL (for magic link login)
    detectSessionInUrl: true,

    // Store session in localStorage (default)
    storage: window.localStorage,

    // Flow type for OAuth (PKCE is more secure)
    flowType: 'pkce',
  },

  realtime: {
    params: {
      // Limit real-time events to prevent overwhelming the client
      eventsPerSecond: 10,
    },
  },

  global: {
    headers: {
      // Add custom headers if needed
      'x-application-name': 'bookme-frontend',
    },
  },

  db: {
    // Schema to use (default is 'public')
    schema: 'public',
  },
});

/**
 * Type-safe helpers for common operations
 */

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return user;
};

/**
 * Get the current session
 * @returns The current session or null if not authenticated
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Type exports for convenience
 */
export type { Database } from '@/types/database';
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
