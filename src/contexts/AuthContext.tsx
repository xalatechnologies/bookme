/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Manages user session, login, logout, and real-time auth state changes.
 *
 * Features:
 * - Magic link authentication
 * - Session persistence
 * - Real-time auth state updates
 * - Auto token refresh
 * - User profile integration
 *
 * Usage:
 * ```tsx
 * import { useAuth } from '@/contexts/hooks/useAuth';
 *
 * function MyComponent() {
 *   const { user, session, loading, signIn, signOut } = useAuth();
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return <LoginPrompt />;
 *
 *   return <div>Welcome {user.email}</div>;
 * }
 * ```
 */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/clients/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Membership = Database['public']['Tables']['memberships']['Row'];

export interface AuthContextValue {
  /** Current authenticated user */
  readonly user: User | null;

  /** Current session */
  readonly session: Session | null;

  /** User profile from database */
  readonly profile: Profile | null;

  /** User's organization memberships */
  readonly memberships: readonly Membership[];

  /** Current organization ID (from default_org or first membership) */
  readonly currentOrgId: string | null;

  /** Loading state during initial auth check */
  readonly loading: boolean;

  /** Sign in with magic link (email only, passwordless) */
  readonly signIn: (email: string) => Promise<void>;

  /** Sign in with email and password */
  readonly signInWithPassword: (email: string, password: string) => Promise<void>;

  /** Sign out current user */
  readonly signOut: () => Promise<void>;

  /** Refresh user profile and memberships */
  readonly refreshProfile: () => Promise<void>;

  /** Set current organization */
  readonly setCurrentOrg: (orgId: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Auth Provider Component
 *
 * Wrap your app with this provider to enable authentication:
 *
 * @example
 * ```tsx
 * import { AuthProvider } from '@/contexts/AuthContext';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<readonly Membership[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);

      // Set current org from profile's default_org
      if (data.default_org) {
        setCurrentOrgId(data.default_org);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  }, []);

  /**
   * Fetch user's organization memberships
   */
  const fetchMemberships = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching memberships:', error);
        return;
      }

      setMemberships(data);

      // If no default org set, use first membership
      // Use a function updater to avoid dependency on currentOrgId
      setCurrentOrgId((prevOrgId) => {
        if (prevOrgId) return prevOrgId;
        return data.length > 0 ? data[0].org_id : null;
      });
    } catch (error) {
      console.error('Error in fetchMemberships:', error);
    }
  }, []);

  /**
   * Initialize auth state
   */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          // Fetch profile and memberships if user is authenticated
          if (initialSession?.user) {
            await Promise.all([
              fetchProfile(initialSession.user.id),
              fetchMemberships(initialSession.user.id),
            ]);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchProfile, fetchMemberships]);

  /**
   * Listen for auth state changes
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Fetch profile and memberships for new user (non-blocking)
          Promise.all([
            fetchProfile(newSession.user.id),
            fetchMemberships(newSession.user.id),
          ]).catch((error) => {
            console.error('Error fetching profile/memberships:', error);
          });
        } else {
          // Clear profile and memberships on logout
          setProfile(null);
          setMemberships([]);
          setCurrentOrgId(null);
        }

        // Set loading to false immediately, don't wait for profile/membership fetch
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchMemberships]);

  /**
   * Sign in with magic link
   */
  const signIn = useCallback(async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    // TODO: Show success message
    // toast.success('Check your email for the login link!');
  }, []);

  /**
   * Sign in with email and password
   */
  const signInWithPassword = useCallback(async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in with password:', error);
      throw error;
    }

    // Auth state will be updated automatically via onAuthStateChange listener
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();

      // Ignore "session missing" errors - just clear local state
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error signing out:', error);
        throw error;
      }
    } catch (error: unknown) {
      // If session is already missing, that's fine - just clear local state
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage !== 'Auth session missing!') {
        console.error('Error signing out:', error);
        throw error;
      }
    } finally {
      // Always clear state regardless of errors
      setUser(null);
      setSession(null);
      setProfile(null);
      setMemberships([]);
      setCurrentOrgId(null);
    }
  }, []);

  /**
   * Refresh user profile and memberships
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;

    await Promise.all([
      fetchProfile(user.id),
      fetchMemberships(user.id),
    ]);
  }, [user, fetchProfile, fetchMemberships]);

  /**
   * Set current organization
   */
  const setCurrentOrg = useCallback(async (orgId: string): Promise<void> => {
    if (!user) return;

    // Update profile's default_org in database
    const { error } = await supabase
      .from('profiles')
      .update({ default_org: orgId })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating default org:', error);
      throw error;
    }

    setCurrentOrgId(orgId);
    await refreshProfile();
  }, [user, refreshProfile]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    memberships,
    currentOrgId,
    loading,
    signIn,
    signInWithPassword,
    signOut,
    refreshProfile,
    setCurrentOrg,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
