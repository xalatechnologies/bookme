/**
 * PermissionGuard Component
 *
 * Conditionally renders children based on user's permissions.
 * More granular than RoleGuard - checks specific resource/action permissions.
 *
 * Features:
 * - Resource-based permission checks
 * - Action-specific rendering
 * - Multiple permission checks (all/any)
 * - Fallback component support
 * - Loading state handling
 *
 * @module components/auth/PermissionGuard
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import type { Permission } from '@/services/supabase/rbac.service';

interface PermissionGuardProps {
  /** Children to render if permission check passes */
  readonly children: React.ReactNode;

  /** Single permission to check */
  readonly permission?: Permission;

  /** Multiple permissions (all must pass) */
  readonly allPermissions?: readonly Permission[];

  /** Multiple permissions (any can pass) */
  readonly anyPermission?: readonly Permission[];

  /** Organization ID for context */
  readonly orgId?: string;

  /** Fallback component if permission check fails */
  readonly fallback?: React.ReactNode;

  /** Loading component */
  readonly loadingComponent?: React.ReactNode;

  /** Hide if permission check fails */
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
 * PermissionGuard Component
 *
 * Conditionally renders children based on user's permissions.
 *
 * @example
 * ```tsx
 * import { PermissionGuard } from '@/components/auth/PermissionGuard';
 *
 * // Single permission check
 * <PermissionGuard
 *   permission={{ resource: 'facilities', action: 'create' }}
 *   orgId={orgId}
 * >
 *   <CreateFacilityButton />
 * </PermissionGuard>
 *
 * // Multiple permissions (all required)
 * <PermissionGuard
 *   allPermissions={[
 *     { resource: 'facilities', action: 'read' },
 *     { resource: 'facilities', action: 'update' }
 *   ]}
 * >
 *   <EditFacilityForm />
 * </PermissionGuard>
 *
 * // Multiple permissions (any allowed)
 * <PermissionGuard
 *   anyPermission={[
 *     { resource: 'bookings', action: 'update' },
 *     { resource: 'bookings', action: 'delete' }
 *   ]}
 * >
 *   <ManageBookingsPanel />
 * </PermissionGuard>
 *
 * // With fallback
 * <PermissionGuard
 *   permission={{ resource: 'facilities', action: 'create' }}
 *   fallback={<UpgradePrompt />}
 * >
 *   <PremiumFeature />
 * </PermissionGuard>
 * ```
 */
export const PermissionGuard = ({
  children,
  permission,
  allPermissions,
  anyPermission,
  orgId,
  fallback,
  loadingComponent,
  hideOnFail = false,
}: PermissionGuardProps): JSX.Element | null => {
  const { user } = useAuth();
  const { can, loading: permissionsLoading } = usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || permissionsLoading) {
        setLoading(true);
        return;
      }

      try {
        let result = false;

        // Single permission check
        if (permission) {
          result = await can(permission.resource, permission.action, orgId);
        }

        // All permissions must pass
        if (allPermissions && allPermissions.length > 0) {
          const checks = await Promise.all(
            allPermissions.map((perm) =>
              can(perm.resource, perm.action, orgId)
            )
          );
          result = checks.every((check) => check);
        }

        // Any permission can pass
        if (anyPermission && anyPermission.length > 0) {
          const checks = await Promise.all(
            anyPermission.map((perm) =>
              can(perm.resource, perm.action, orgId)
            )
          );
          result = checks.some((check) => check);
        }

        setHasPermission(result);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [user, permission, allPermissions, anyPermission, orgId, can, permissionsLoading]);

  // Show loading state
  if (loading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // User has permission
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
 * CanCreate Component
 *
 * Shorthand for PermissionGuard with action="create".
 *
 * @example
 * ```tsx
 * import { CanCreate } from '@/components/auth/PermissionGuard';
 *
 * <CanCreate resource="facilities" orgId={orgId}>
 *   <CreateButton />
 * </CanCreate>
 * ```
 */
export const CanCreate = ({
  resource,
  orgId,
  children,
  fallback,
}: {
  readonly resource: string;
  readonly orgId?: string;
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <PermissionGuard
      permission={{ resource, action: 'create' }}
      orgId={orgId}
      fallback={fallback}
      hideOnFail
    >
      {children}
    </PermissionGuard>
  );
};

/**
 * CanUpdate Component
 *
 * Shorthand for PermissionGuard with action="update".
 *
 * @example
 * ```tsx
 * import { CanUpdate } from '@/components/auth/PermissionGuard';
 *
 * <CanUpdate resource="facilities" orgId={orgId}>
 *   <EditButton />
 * </CanUpdate>
 * ```
 */
export const CanUpdate = ({
  resource,
  orgId,
  children,
  fallback,
}: {
  readonly resource: string;
  readonly orgId?: string;
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <PermissionGuard
      permission={{ resource, action: 'update' }}
      orgId={orgId}
      fallback={fallback}
      hideOnFail
    >
      {children}
    </PermissionGuard>
  );
};

/**
 * CanDelete Component
 *
 * Shorthand for PermissionGuard with action="delete".
 *
 * @example
 * ```tsx
 * import { CanDelete } from '@/components/auth/PermissionGuard';
 *
 * <CanDelete resource="bookings" orgId={orgId}>
 *   <DeleteButton />
 * </CanDelete>
 * ```
 */
export const CanDelete = ({
  resource,
  orgId,
  children,
  fallback,
}: {
  readonly resource: string;
  readonly orgId?: string;
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <PermissionGuard
      permission={{ resource, action: 'delete' }}
      orgId={orgId}
      fallback={fallback}
      hideOnFail
    >
      {children}
    </PermissionGuard>
  );
};

/**
 * CanManage Component
 *
 * Shorthand for checking both update and delete permissions.
 *
 * @example
 * ```tsx
 * import { CanManage } from '@/components/auth/PermissionGuard';
 *
 * <CanManage resource="facilities" orgId={orgId}>
 *   <ManagementPanel />
 * </CanManage>
 * ```
 */
export const CanManage = ({
  resource,
  orgId,
  children,
  fallback,
}: {
  readonly resource: string;
  readonly orgId?: string;
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}): JSX.Element | null => {
  return (
    <PermissionGuard
      anyPermission={[
        { resource, action: 'update' },
        { resource, action: 'delete' },
      ]}
      orgId={orgId}
      fallback={fallback}
      hideOnFail
    >
      {children}
    </PermissionGuard>
  );
};
