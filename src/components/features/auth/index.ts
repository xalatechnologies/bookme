/**
 * Authentication Components
 *
 * Export all authentication-related components for easy importing.
 *
 * @module components/auth
 */

// Protected Routes
export {
  ProtectedRoute,
  RequireAuth,
  RequireRole,
} from './components/ProtectedRoute';

// Role Guards
export {
  RoleGuard,
  AdminOnly,
  StaffOnly,
  OwnerOnly,
  PlatformAdminOnly,
} from './components/RoleGuard';

// Permission Guards
export {
  PermissionGuard,
  CanCreate,
  CanUpdate,
  CanDelete,
  CanManage,
} from './components/PermissionGuard';
