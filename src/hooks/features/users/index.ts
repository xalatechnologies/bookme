/**
 * User Management Hooks
 *
 * Barrel export for all user-related hooks.
 * These hooks follow clean architecture principles with clear separation
 * between data layer, business logic, and UI state management.
 *
 * @module hooks/features/users
 */

// Main user management hook
export {
  useUserManagement,
  type IUseUserManagementReturn,
} from './useUserManagement';

// User editor hook
export {
  useUserEditor,
  type IUseUserEditorOptions,
  type IUseUserEditorReturn,
  type IUserFormData,
} from './useUserEditor';

// User permissions hook
export {
  useUserPermissions,
  type IUseUserPermissionsReturn,
  type TResource,
  type TAction,
  type TRouteType,
} from './useUserPermissions';
