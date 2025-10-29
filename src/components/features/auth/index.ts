/**
 * Auth Feature - Complete Domain Export
 *
 * All authentication-related components, hooks, types, and constants.
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

// Types
export * from './types';

// Constants
export * from './constants';
