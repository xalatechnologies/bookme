/**
 * Support Domain Constants
 */

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TICKET_CATEGORY = {
  TECHNICAL: 'technical',
  BILLING: 'billing',
  BOOKING: 'booking',
  GENERAL: 'general',
} as const;

export const I18N_NAMESPACE = 'support' as const;

export const SUPPORT_I18N_KEYS = {
  TITLE: 'title',
  CREATE_TICKET: 'createTicket',
  MY_TICKETS: 'myTickets',
  STATUS: {
    OPEN: 'status.open',
    IN_PROGRESS: 'status.inProgress',
    RESOLVED: 'status.resolved',
    CLOSED: 'status.closed',
  },
  PRIORITY: {
    LOW: 'priority.low',
    MEDIUM: 'priority.medium',
    HIGH: 'priority.high',
    URGENT: 'priority.urgent',
  },
} as const;

export const SUPPORT_PERMISSIONS = {
  CREATE_TICKET: ['user', 'facility_manager', 'admin'],
  VIEW_OWN_TICKETS: ['user', 'facility_manager', 'admin'],
  VIEW_ALL_TICKETS: ['facility_manager', 'admin'],
  ASSIGN_TICKETS: ['facility_manager', 'admin'],
  CLOSE_TICKETS: ['facility_manager', 'admin'],
} as const;

export function hasSupportPermission(
  userRoles: string[],
  requiredPermission: keyof typeof SUPPORT_PERMISSIONS
): boolean {
  const allowedRoles = SUPPORT_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

export const SUPPORT_DESIGN = {
  STATUS_COLORS: {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  },
  PRIORITY_COLORS: {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  },
} as const;

export const SUPPORT_ANIMATIONS = {
  DURATION: {
    MESSAGE_APPEAR: 200,
  },
} as const;

export const SUPPORT_PERFORMANCE = {
  CACHE_TIMES: {
    TICKETS_LIST: 2 * 60 * 1000,
    TICKET_DETAILS: 30 * 1000,
  },
  PAGINATION: {
    TICKETS_PER_PAGE: 15,
    MESSAGES_PER_PAGE: 50,
  },
} as const;
