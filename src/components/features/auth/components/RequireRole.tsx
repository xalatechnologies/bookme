"use client";

import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "@/hooks/auth/useRole";
import type { Database } from '@/types/database';

type OrgRole = Database['public']['Enums']['org_role'];

/**
 * Role hierarchy for comparison (ENGLISH)
 * Higher number = higher privilege
 *
 * UPDATED: Now uses English role names
 * - case_handler (was: saksbehandler)
 * - editor (was: redaktør)
 * - read_only (was: lesetilgang)
 */
const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 100,
  admin: 80,
  staff: 60,
  customer: 10,
};

interface IRequireRoleProps {
  /**
   * Minimum role required to access this route
   * @default 'staff' - Admin routes require at least staff level
   */
  readonly minRole?: OrgRole;

  /**
   * Exact role required (instead of minimum)
   * Use this when you need EXACTLY this role, not hierarchy
   */
  readonly exactRole?: OrgRole;

  /**
   * Optional organization ID for role checking
   * If not provided, uses current org from context
   */
  readonly orgId?: string;

  readonly children: React.ReactNode;
}

/**
 * RequireRole Guard
 *
 * Protects admin routes by requiring specific role levels.
 * Uses real Supabase authentication and database roles.
 *
 * @example
 * ```tsx
 * // Require at least staff role
 * <RequireRole minRole="staff">
 *   <StaffPanel />
 * </RequireRole>
 *
 * // Require exactly admin role
 * <RequireRole exactRole="admin">
 *   <AdminOnlyFeature />
 * </RequireRole>
 * ```
 */
export const RequireRole = ({
  minRole = 'staff',
  exactRole,
  orgId,
  children
}: IRequireRoleProps): JSX.Element => {
  const { role, loading, isPlatformAdmin } = useRole(orgId);

  // Show loading spinner while checking role
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster...</p>
        </div>
      </div>
    );
  }

  // Platform admin bypasses all role checks
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Check exact role match if specified
  if (exactRole) {
    if (role === exactRole) {
      return <>{children}</>;
    }

    // Access denied - exact role not matched
    return <Navigate to="/access-denied" replace />;
  }

  // Check minimum role hierarchy
  if (role && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole]) {
    return <>{children}</>;
  }

  // Access denied - insufficient role
  return <Navigate to="/access-denied" replace />;
};

/**
 * Helper: AdminOnly
 * Requires at least admin role
 */
export const AdminOnly = ({ children, orgId }: {
  children: React.ReactNode;
  orgId?: string;
}): JSX.Element => (
  <RequireRole minRole="admin" orgId={orgId}>
    {children}
  </RequireRole>
);

/**
 * Helper: StaffOnly
 * Requires at least staff role
 */
export const StaffOnly = ({ children, orgId }: {
  children: React.ReactNode;
  orgId?: string;
}): JSX.Element => (
  <RequireRole minRole="staff" orgId={orgId}>
    {children}
  </RequireRole>
);

/**
 * Helper: OwnerOnly
 * Requires owner role or platform admin
 */
export const OwnerOnly = ({ children, orgId }: {
  children: React.ReactNode;
  orgId?: string;
}): JSX.Element => (
  <RequireRole minRole="owner" orgId={orgId}>
    {children}
  </RequireRole>
);
