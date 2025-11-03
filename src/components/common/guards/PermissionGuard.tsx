/**
 * PermissionGuard - Declarative RBAC Wrapper Component
 *
 * A flexible permission guard that integrates with all domain permission systems.
 * Provides declarative RBAC in JSX with automatic fallback rendering.
 *
 * @example
 * ```tsx
 * <PermissionGuard domain="bookings" permission="APPROVE">
 *   <ApproveButton />
 * </PermissionGuard>
 *
 * <PermissionGuard
 *   domain="auth"
 *   permission="MANAGE_USERS"
 *   fallback={<AccessDenied />}
 * >
 *   <UserManagementPanel />
 * </PermissionGuard>
 * ```
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

// Import all domain permission helpers
import {
  hasBookingPermission,
  BOOKING_PERMISSIONS,
} from "@/components/features/bookings";
import {
  hasFacilityPermission,
  FACILITY_PERMISSIONS,
} from "@/components/features/facilities";
import {
  hasCalendarPermission,
  CALENDAR_PERMISSIONS,
} from "@/components/features/calendar";
import {
  hasMessagingPermission,
  MESSAGING_PERMISSIONS,
} from "@/components/features/messaging";
import {
  hasCartPermission,
  CART_PERMISSIONS,
} from "@/components/features/cart";
import {
  hasAuthPermission,
  AUTH_PERMISSIONS,
} from "@/components/features/auth";
import {
  hasDashboardPermission,
  DASHBOARD_PERMISSIONS,
} from "@/components/features/dashboard";
import {
  hasSearchPermission,
  SEARCH_PERMISSIONS,
} from "@/components/features/search";
import {
  hasSupportPermission,
  SUPPORT_PERMISSIONS,
} from "@/components/features/support";

/**
 * Supported domains for permission checking
 */
export type PermissionDomain =
  | "bookings"
  | "facilities"
  | "calendar"
  | "messaging"
  | "cart"
  | "auth"
  | "dashboard"
  | "search"
  | "support";

/**
 * PermissionGuard Props
 */
export interface PermissionGuardProps {
  /** Domain to check permissions for */
  domain: PermissionDomain;
  /** Permission key to check */
  permission: string;
  /** Children to render if permission granted */
  children: React.ReactNode;
  /** Fallback to render if permission denied */
  fallback?: React.ReactNode;
  /** Show default "no permission" message */
  showMessage?: boolean;
  /** Additional className for fallback wrapper */
  className?: string;
}

/**
 * Default AccessDenied component
 */
const DefaultAccessDenied: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation("common");

  return (
    <div className="text-center py-8 px-4">
      <div className="text-gray-400 dark:text-gray-600 mb-2">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {message || t("permissions.access_denied", "Access denied")}
      </p>
    </div>
  );
};

/**
 * PermissionGuard Component
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  domain,
  permission,
  children,
  fallback,
  showMessage = false,
  className = "",
}) => {
  const { user, memberships } = useAuth();
  const { t } = useTranslation("common");

  // If no user, deny access
  if (!user) {
    if (fallback) return <>{fallback}</>;
    if (showMessage) return <DefaultAccessDenied />;
    return null;
  }

  // Get user roles from memberships (role column)
  const userRoles = memberships.map((m) => m.role).filter(Boolean);

  // Domain-specific permission checking
  let hasPermission = false;

  try {
    switch (domain) {
      case "bookings":
        hasPermission = hasBookingPermission(
          userRoles,
          permission as keyof typeof BOOKING_PERMISSIONS
        );
        break;
      case "facilities":
        hasPermission = hasFacilityPermission(
          userRoles,
          permission as keyof typeof FACILITY_PERMISSIONS
        );
        break;
      case "calendar":
        hasPermission = hasCalendarPermission(
          userRoles,
          permission as keyof typeof CALENDAR_PERMISSIONS
        );
        break;
      case "messaging":
        hasPermission = hasMessagingPermission(
          userRoles,
          permission as keyof typeof MESSAGING_PERMISSIONS
        );
        break;
      case "cart":
        hasPermission = hasCartPermission(
          userRoles,
          permission as keyof typeof CART_PERMISSIONS
        );
        break;
      case "auth":
        hasPermission = hasAuthPermission(
          userRoles,
          permission as keyof typeof AUTH_PERMISSIONS
        );
        break;
      case "dashboard":
        hasPermission = hasDashboardPermission(
          userRoles,
          permission as keyof typeof DASHBOARD_PERMISSIONS
        );
        break;
      case "search":
        hasPermission = hasSearchPermission(
          userRoles,
          permission as keyof typeof SEARCH_PERMISSIONS
        );
        break;
      case "support":
        hasPermission = hasSupportPermission(
          userRoles,
          permission as keyof typeof SUPPORT_PERMISSIONS
        );
        break;
      default:
        console.warn(`Unknown permission domain: ${domain}`);
        hasPermission = false;
    }
  } catch (error) {
    console.error(
      `Permission check failed for ${domain}.${permission}:`,
      error
    );
    hasPermission = false;
  }

  // Render based on permission
  if (hasPermission) {
    return <>{children}</>;
  }

  // Permission denied
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  if (showMessage) {
    return (
      <div className={className}>
        <DefaultAccessDenied
          message={t("permissions.insufficient_permissions", {
            domain,
            permission,
            defaultValue: "Insufficient permissions to access {{domain}}.{{permission}}"
          })}
        />
      </div>
    );
  }

  return null;
};

/**
 * Convenience components for common permissions
 */

export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard domain="auth" permission="MANAGE_USERS" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ManagerOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <PermissionGuard
    domain="dashboard"
    permission="VIEW_ADMIN_DASHBOARD"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);
