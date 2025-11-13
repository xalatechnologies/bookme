import { useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import type { AuthContextValue } from '../AuthContext';

/**
 * Hook to use auth context
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signOut } = useAuth();
 *
 *   return (
 *     <div>
 *       <p>Logged in as: {user?.email}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, loading } = useRequireAuth();
 *
 *   if (loading) return <LoadingSpinner />;
 *
 *   return <div>Protected content for {user.email}</div>;
 * }
 * ```
 */
export const useRequireAuth = (): Omit<AuthContextValue, 'signIn'> => {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login page
      // TODO: Implement redirect logic
      console.warn('User not authenticated, redirect to login');
    }
  }, [auth.loading, auth.user]);

  return auth;
};
