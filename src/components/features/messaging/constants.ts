/**
 * Messaging Feature Constants
 */

// ============================================================================
// MESSAGE STATUS
// ============================================================================

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
} as const;

export const THREAD_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

// ============================================================================
// LOCALIZATION
// ============================================================================

export const I18N_NAMESPACE = 'messaging' as const;

export const MESSAGING_I18N_KEYS = {
  INBOX: 'inbox.title',
  NEW_MESSAGE: 'newMessage.title',
  ACTIONS: {
    SEND: 'actions.send',
    REPLY: 'actions.reply',
    ARCHIVE: 'actions.archive',
    DELETE: 'actions.delete',
  },
  MESSAGES: {
    NO_MESSAGES: 'messages.noMessages',
    LOADING: 'messages.loading',
  },
} as const;

// ============================================================================
// RBAC
// ============================================================================

export const MESSAGING_PERMISSIONS = {
  VIEW_MESSAGES: ['user', 'facility_manager', 'admin'],
  SEND_MESSAGES: ['user', 'facility_manager', 'admin'],
  DELETE_MESSAGES: ['user', 'facility_manager', 'admin'],
  VIEW_ALL_THREADS: ['facility_manager', 'admin'],
} as const;

export function hasMessagingPermission(
  userRoles: string[],
  requiredPermission: keyof typeof MESSAGING_PERMISSIONS
): boolean {
  const allowedRoles = MESSAGING_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const MESSAGING_DESIGN = {
  THREAD_ITEM: {
    BASE: 'p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors',
    UNREAD: 'bg-blue-50 font-semibold',
  },
  MESSAGE: {
    SENT: 'ml-auto bg-blue-600 text-white rounded-lg p-3 max-w-[70%]',
    RECEIVED: 'mr-auto bg-gray-200 text-gray-900 rounded-lg p-3 max-w-[70%]',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const MESSAGING_ANIMATIONS = {
  DURATION: {
    MESSAGE_APPEAR: 200,
  },
  TRANSITIONS: {
    MESSAGE: 'transition-all duration-200 ease-in-out',
  },
} as const;

// ============================================================================
// PERFORMANCE
// ============================================================================

export const MESSAGING_PERFORMANCE = {
  CACHE: {
    STALE_TIME: 1 * 60 * 1000, // 1 minute
    CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  },
  DEBOUNCE: {
    TYPING_INDICATOR: 300,
  },
  PAGINATION: {
    MESSAGES_PER_PAGE: 50,
  },
} as const;
