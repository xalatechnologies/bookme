/**
 * Notifications Feature Hooks
 *
 * Exports all notification-related hooks for the application.
 */

export { useNotificationManagement } from './useNotificationManagement';
export type {
  IUseNotificationManagementReturn,
  INotificationUIState,
  INotificationGroup,
} from './useNotificationManagement';

export { useNotificationPreferences } from './useNotificationPreferences';
export type {
  IUseNotificationPreferencesReturn,
  INotificationPreference,
  INotificationTemplate,
  IContactInfo,
  ISuccessMessage,
} from './useNotificationPreferences';
