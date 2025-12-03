/**
 * Navigation Utilities - Role-Based Navigation
 *
 * Provides role-based navigation configurations for different user types.
 * Only CUSTOMER role navigation is defined here, as other roles use separate layouts.
 *
 * @module utils/navigation
 */

import {
  LayoutDashboard,
  Calendar,
  History,
  Receipt,
  Building2,
  Heart,
  User,
  Bell,
  MessageCircle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { OrgRole } from "@/constants/roles";

/**
 * Navigation menu item interface
 */
export interface INavigationItem {
  readonly id: string;
  readonly labelKey: string;
  readonly path: string;
  readonly icon: LucideIcon;
}

/**
 * Navigation menu group interface
 */
export interface INavigationGroup {
  readonly titleKey: string;
  readonly items: readonly INavigationItem[];
}

/**
 * Navigation configuration for a role
 */
export interface IRoleNavigation {
  readonly role: OrgRole;
  readonly groups: readonly INavigationGroup[];
}

/**
 * CUSTOMER role navigation configuration
 * 
 * Designed for end-user self-service portal experience:
 * - Simple, focused navigation
 * - Personal booking management
 * - Account settings
 * - Help and support
 * 
 * This navigation does NOT include:
 * - User management
 * - Facility management
 * - System administration
 * - Reports or analytics
 * - Audit logs or data retention
 */
export const CUSTOMER_NAVIGATION: IRoleNavigation = {
  role: "customer",
  groups: [
    {
      titleKey: "overview",
      items: [
        {
          id: "dashboard",
          labelKey: "dashboard",
          path: "/user",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      titleKey: "booking",
      items: [
        {
          id: "bookings",
          labelKey: "bookings",
          path: "/user/bookings",
          icon: Calendar,
        },
        {
          id: "calendar",
          labelKey: "calendar",
          path: "/user/calendar",
          icon: Calendar,
        },
        {
          id: "history",
          labelKey: "history_and_receipts",
          path: "/user/history",
          icon: History,
        },
      ],
    },
    {
      titleKey: "explore_facilities",
      items: [
        {
          id: "facilities",
          labelKey: "rooms",
          path: "/facilities",
          icon: Building2,
        },
        {
          id: "favorites",
          labelKey: "favorites",
          path: "/user/favorites",
          icon: Heart,
        },
      ],
    },
    {
      titleKey: "account",
      items: [
        {
          id: "profile",
          labelKey: "settings",
          path: "/user/profile",
          icon: User,
        },
        {
          id: "notifications",
          labelKey: "alerts",
          path: "/user/notifications",
          icon: Bell,
        },
        {
          id: "messages",
          labelKey: "messages",
          path: "/user/messages",
          icon: MessageCircle,
        },
      ],
    },
    {
      titleKey: "support",
      items: [
        {
          id: "help",
          labelKey: "help_and_contact",
          path: "/user/help",
          icon: HelpCircle,
        },
      ],
    },
  ],
} as const;

/**
 * Get navigation configuration for a specific role
 * 
 * Currently only CUSTOMER role uses this navigation system.
 * Other roles (OWNER, ADMIN, STAFF) have separate layouts in:
 * - /admin/* routes → AdminLayout
 * - /staff/* routes → StaffLayout (if exists)
 * 
 * @param role - User's organization role
 * @returns Navigation configuration for the role, or CUSTOMER navigation as fallback
 * 
 * @example
 * ```tsx
 * const navigation = getUserNavigation(userRole);
 * const menuGroups = navigation.groups;
 * ```
 */
export const getUserNavigation = (role: OrgRole): IRoleNavigation => {
  // Only CUSTOMER role uses /user routes
  // All other roles should use their respective admin/staff areas
  if (role === "customer") {
    return CUSTOMER_NAVIGATION;
  }

  // Fallback to CUSTOMER navigation for any user accessing /user routes
  // This ensures a safe default even if other roles access user area
  return CUSTOMER_NAVIGATION;
};

/**
 * Check if a role should have access to /user routes
 * 
 * Primary use case: CUSTOMER role
 * Other roles MAY access /user routes but should be redirected to their proper areas
 * 
 * @param role - User's organization role
 * @returns true if role should access /user routes
 */
export const canAccessUserRoutes = (role: OrgRole): boolean => {
  // All authenticated users CAN access /user routes
  // But admin/staff SHOULD use their dedicated areas instead
  return true;
};

/**
 * Get recommended redirect path for a role
 * 
 * Used to redirect users to their appropriate dashboard after login
 * 
 * @param role - User's organization role
 * @returns Recommended path for the role
 * 
 * @example
 * ```tsx
 * const redirectPath = getRecommendedPath(userRole);
 * navigate(redirectPath);
 * ```
 */
export const getRecommendedPath = (role: OrgRole): string => {
  switch (role) {
    case "owner":
    case "admin":
      return "/admin/overview";
    case "case_handler":
    case "editor":
    case "staff":
      return "/admin/overview"; // or /staff if staff area exists
    case "read_only":
      return "/admin/overview"; // Read-only view of admin area
    case "customer":
    default:
      return "/user";
  }
};
