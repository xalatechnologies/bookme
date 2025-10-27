/**
 * ProtectedRoute Component
 *
 * Route guard that requires authentication and optionally a specific role.
 * Redirects to login if not authenticated or shows unauthorized page if
 * user doesn't have required role.
 *
 * Features:
 * - Authentication check
 * - Role-based access control
 * - Automatic redirect to login
 * - Loading state handling
 * - Unauthorized error page
 *
 * @module components/auth/ProtectedRoute
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/auth/useRole';
import type { Database } from '@/types/database';

type OrgRole = Database['public']['Enums']['org_role'];

interface ProtectedRouteProps {
  /** Children to render if access is granted */
  readonly children: React.ReactNode;

  /** Required minimum role (optional) */
  readonly requiredRole?: OrgRole;

  /** Organization ID to check role for (uses current org if not specified) */
  readonly orgId?: string;

  /** Redirect path for unauthenticated users */
  readonly loginPath?: string;

  /** Redirect path for unauthorized users */
  readonly unauthorizedPath?: string;

  /** Custom loading component */
  readonly loadingComponent?: React.ReactNode;

  /** Custom unauthorized component */
  readonly unauthorizedComponent?: React.ReactNode;
}

/**
 * Default loading component
 */
const DefaultLoadingComponent = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

/**
 * Default unauthorized component
 */
const DefaultUnauthorizedComponent = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unauthorized Access
        </h2>

        <p className="text-gray-600 mb-6">
          You do not have permission to access this page.
          Please contact your administrator if you believe this is an error.
        </p>

        <a
          href="/"
          className="inline-block h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication and/or specific roles.
 *
 * @example
 * ```tsx
 * import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
 *
 * // Basic authentication
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 *
 * // Require specific role
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Custom loading and unauthorized components
 * <ProtectedRoute
 *   requiredRole="staff"
 *   loadingComponent={<CustomLoader />}
 *   unauthorizedComponent={<CustomUnauthorized />}
 * >
 *   <StaffPage />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute = ({
  children,
  requiredRole,
  orgId,
  loginPath = '/login',
  unauthorizedPath,
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps): JSX.Element => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, hasMinimumRole } = useRole(orgId);

  // Show loading state while checking authentication
  if (authLoading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If role is required, check role permissions
  if (requiredRole) {
    // Show loading while checking role
    if (roleLoading) {
      return <>{loadingComponent || <DefaultLoadingComponent />}</>;
    }

    // Check if user has required role
    const hasPermission = hasMinimumRole(requiredRole);

    if (!hasPermission) {
      // Use custom unauthorized path if provided
      if (unauthorizedPath) {
        return <Navigate to={unauthorizedPath} replace />;
      }

      // Show unauthorized component
      return (
        <>
          {unauthorizedComponent || <DefaultUnauthorizedComponent />}
        </>
      );
    }
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

/**
 * RequireAuth Component
 *
 * Simpler version that only requires authentication without role checks.
 * Does NOT use the useRole hook, avoiding unnecessary role fetching.
 *
 * @example
 * ```tsx
 * import { RequireAuth } from '@/components/auth/ProtectedRoute';
 *
 * <RequireAuth>
 *   <ProfilePage />
 * </RequireAuth>
 * ```
 */
export const RequireAuth = ({
  children,
  loginPath = '/login',
  loadingComponent,
}: {
  readonly children: React.ReactNode;
  readonly loginPath?: string;
  readonly loadingComponent?: React.ReactNode;
}): JSX.Element => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Show loading state while checking authentication
  if (authLoading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is authenticated
  return <>{children}</>;
};

/**
 * RequireRole Component
 *
 * Requires both authentication and a specific role.
 * Shorthand for ProtectedRoute with requiredRole.
 *
 * @example
 * ```tsx
 * import { RequireRole } from '@/components/auth/ProtectedRoute';
 *
 * <RequireRole role="admin">
 *   <AdminPanel />
 * </RequireRole>
 * ```
 */
export const RequireRole = ({
  children,
  role,
  orgId,
  loginPath = '/login',
  unauthorizedPath,
}: {
  readonly children: React.ReactNode;
  readonly role: OrgRole;
  readonly orgId?: string;
  readonly loginPath?: string;
  readonly unauthorizedPath?: string;
}): JSX.Element => {
  return (
    <ProtectedRoute
      requiredRole={role}
      orgId={orgId}
      loginPath={loginPath}
      unauthorizedPath={unauthorizedPath}
    >
      {children}
    </ProtectedRoute>
  );
};
