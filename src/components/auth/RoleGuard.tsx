/**
 * RoleGuard Component
 *
 * Conditionally renders children based on user's role.
 * Used for showing/hiding UI elements based on permissions.
 *
 * Features:
 * - Role-based rendering
 * - Minimum role check
 * - Exact role match
 * - Fallback component support
 * - Loading state handling
 *
 * @module components/auth/RoleGuard
 */

import React from 'react';
import { useRole } from '@/hooks/auth/useRole';
import type { Database } from '@/types/database';

type OrgRole = Database['public']['Enums']['org_role'];

interface RoleGuardProps {
  /** Children to render if role check passes */
  readonly children: React.ReactNode;

  /** Required minimum role */
  readonly minRole?: OrgRole;

  /** Required exact role (cannot be used with minRole) */
  readonly exactRole?: OrgRole;

  /** Required roles (any of these roles) */
  readonly anyRole?: readonly OrgRole[];

  /** Organization ID to check role for */
  readonly orgId?: string;

  /** Fallback component to render if role check fails */
  readonly fallback?: React.ReactNode;

  /** Loading component to show while checking role */
  readonly loadingComponent?: React.ReactNode;

  /** Show nothing if role check fails (default: false) */
  readonly hideOnFail?: boolean;
}

/**
 * Default loading component
 */
const DefaultLoadingComponent = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-6 w-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
    </div>
  );
};

/**
 * RoleGuard Component
 *
 * Conditionally renders children based on user's role in an organization.
 *
 * @example
 * ```tsx
 * import { RoleGuard } from '@/components/auth/RoleGuard';
 *
 * // Show for admin and above
 * <RoleGuard minRole="admin">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * // Show only for exact role
 * <RoleGuard exactRole="staff">
 *   <StaffOnlyFeature />
 * </RoleGuard>
 *
 * // Show for any of these roles
 * <RoleGuard anyRole={['admin', 'staff']}>
 *   <ModeratorPanel />
 * </RoleGuard>
 *
 * // With fallback
 * <RoleGuard minRole="admin" fallback={<UpgradePrompt />}>
 *   <PremiumFeature />
 * </RoleGuard>
 *
 * // Hide if check fails
 * <RoleGuard minRole="staff" hideOnFail>
 *   <StaffButton />
 * </RoleGuard>
 * ```
 */
export const RoleGuard = ({
  children,
  minRole,
  exactRole,
  anyRole,
  orgId,
  fallback,
  loadingComponent,
  hideOnFail = false,
}: RoleGuardProps): JSX.Element | null => {
  const { role, loading, hasMinimumRole, isPlatformAdmin } = useRole(orgId);

  // Show loading state
  if (loading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // Platform admin passes all checks
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // No role specified - allow all authenticated users
  if (!minRole && !exactRole && !anyRole) {
    return <>{children}</>;
  }

  let hasPermission = false;

  // Check minimum role
  if (minRole) {
    hasPermission = hasMinimumRole(minRole);
  }

  // Check exact role
  if (exactRole) {
    hasPermission = role === exactRole;
  }

  // Check any of the roles
  if (anyRole && anyRole.length > 0) {
    hasPermission = role !== null && anyRole.includes(role);
  }

  // Render based on permission
  if (hasPermission) {
    return <>{children}</>;
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Hide if specified
  if (hideOnFail) {
    return null;
  }

  // Default: show nothing
  return null;
};

/**
 * AdminOnly Component
 *
 * Shorthand for RoleGuard with minRole="admin".
 *
 * @example
 * ```tsx
 * import { AdminOnly } from '@/components/auth/RoleGuard';
 *
 * <AdminOnly>
 *   <AdminSettings />
 * </AdminOnly>
 * ```
 */
export const AdminOnly = ({
  children,
  orgId,
  fallback,
}: {
  readonly children: React.ReactNode;
  readonly orgId?: string;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <RoleGuard minRole="admin" orgId={orgId} fallback={fallback} hideOnFail>
      {children}
    </RoleGuard>
  );
};

/**
 * StaffOnly Component
 *
 * Shorthand for RoleGuard with minRole="staff".
 *
 * @example
 * ```tsx
 * import { StaffOnly } from '@/components/auth/RoleGuard';
 *
 * <StaffOnly>
 *   <StaffDashboard />
 * </StaffOnly>
 * ```
 */
export const StaffOnly = ({
  children,
  orgId,
  fallback,
}: {
  readonly children: React.ReactNode;
  readonly orgId?: string;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <RoleGuard minRole="staff" orgId={orgId} fallback={fallback} hideOnFail>
      {children}
    </RoleGuard>
  );
};

/**
 * OwnerOnly Component
 *
 * Shorthand for RoleGuard with exactRole="owner".
 *
 * @example
 * ```tsx
 * import { OwnerOnly } from '@/components/auth/RoleGuard';
 *
 * <OwnerOnly>
 *   <DeleteOrganizationButton />
 * </OwnerOnly>
 * ```
 */
export const OwnerOnly = ({
  children,
  orgId,
  fallback,
}: {
  readonly children: React.ReactNode;
  readonly orgId?: string;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <RoleGuard exactRole="owner" orgId={orgId} fallback={fallback} hideOnFail>
      {children}
    </RoleGuard>
  );
};

/**
 * PlatformAdminOnly Component
 *
 * Shows content only to platform administrators.
 *
 * @example
 * ```tsx
 * import { PlatformAdminOnly } from '@/components/auth/RoleGuard';
 *
 * <PlatformAdminOnly>
 *   <PlatformSettings />
 * </PlatformAdminOnly>
 * ```
 */
export const PlatformAdminOnly = ({
  children,
  fallback,
}: {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  const { isPlatformAdmin, loading } = useRole();

  if (loading) {
    return <DefaultLoadingComponent />;
  }

  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return null;
};
