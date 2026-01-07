/**
 * Backoffice RBAC helpers (derived from backoffice docs).
 * We map existing org_role + platform admin flag to broader backoffice roles.
 */

export type BackofficeRole =
  | "super-admin"
  | "tenant-admin"
  | "org-admin"
  | "listing-manager"
  | "booking-manager";

// Priority order for minimum-role checks
const BACKOFFICE_PRIORITY: Record<BackofficeRole, number> = {
  "super-admin": 500,
  "tenant-admin": 400,
  "org-admin": 300,
  "listing-manager": 200,
  "booking-manager": 100,
};

export function isBackofficeRole(role: unknown): role is BackofficeRole {
  return (
    role === "super-admin" ||
    role === "tenant-admin" ||
    role === "org-admin" ||
    role === "listing-manager" ||
    role === "booking-manager"
  );
}

export function hasBackofficeMinimumRole(
  userRole: BackofficeRole | null | undefined,
  minRole: BackofficeRole
): boolean {
  if (!userRole) return false;
  return BACKOFFICE_PRIORITY[userRole] >= BACKOFFICE_PRIORITY[minRole];
}

/**
 * Map existing org roles + platform admin to backoffice roles.
 * This is an approximation until dedicated backoffice roles exist in DB.
 */
export function mapOrgRoleToBackofficeRole(options: {
  orgRole: "owner" | "admin" | "staff" | "customer" | null;
  isPlatformAdmin: boolean;
}): BackofficeRole | null {
  const { orgRole, isPlatformAdmin } = options;
  if (isPlatformAdmin) return "super-admin";
  if (!orgRole) return null;

  switch (orgRole) {
    case "owner":
    case "admin":
      return "org-admin";
    case "staff":
      return "booking-manager";
    default:
      return null;
  }
}

