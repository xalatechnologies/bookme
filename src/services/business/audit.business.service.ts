/**
 * Audit Business Logic Service
 *
 * Contains all business logic related to audit log operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations for security audit trails.
 */

import type { Database } from "@/types/database";

type AuditEvent = Database['public']['Tables']['audit_events']['Row'];
type Json = Database['public']['Json'];

/**
 * Audit filter configuration
 */
export interface IAuditFilters {
  readonly searchTerm?: string;
  readonly userIds?: readonly string[];
  readonly actions?: readonly string[];
  readonly entities?: readonly string[];
  readonly dateRange?: {
    readonly startDate: Date;
    readonly endDate: Date;
  };
}

/**
 * Audit sort configuration
 */
export interface IAuditSortConfig {
  readonly sortBy: 'created_at' | 'action' | 'entity' | 'actor_id';
  readonly sortOrder: 'asc' | 'desc';
}

/**
 * Formatted audit entry for display
 */
export interface IFormattedAuditEntry {
  readonly id: string;
  readonly timestamp: Date;
  readonly formattedTimestamp: string;
  readonly relativeTime: string;
  readonly action: string;
  readonly actionLabel: string;
  readonly actionIcon: string;
  readonly actionColor: string;
  readonly entity: string;
  readonly entityLabel: string;
  readonly entityId: string;
  readonly actorId: string | null;
  readonly actorName: string;
  readonly details: Record<string, unknown> | null;
  readonly formattedDetails: string;
  readonly severity: 'info' | 'warning' | 'critical';
}

/**
 * Grouped audit entries by date
 */
export interface IGroupedAuditEntries {
  readonly date: string;
  readonly formattedDate: string;
  readonly entries: readonly IFormattedAuditEntry[];
  readonly count: number;
}

/**
 * Audit statistics
 */
export interface IAuditStats {
  readonly totalEvents: number;
  readonly uniqueUsers: number;
  readonly actionBreakdown: Record<string, number>;
  readonly entityBreakdown: Record<string, number>;
  readonly eventsToday: number;
  readonly eventsThisWeek: number;
  readonly eventsThisMonth: number;
  readonly criticalEvents: number;
  readonly mostActiveUser: string | null;
  readonly mostCommonAction: string | null;
}

/**
 * CSV export data for audit logs
 */
export interface IAuditExportData {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly filename: string;
}

/**
 * Filter audit logs based on criteria
 *
 * @param auditLogs - Array of audit events to filter
 * @param filters - Filter configuration
 * @returns Filtered audit logs
 */
export const filterAuditLogs = (
  auditLogs: readonly AuditEvent[],
  filters: IAuditFilters
): readonly AuditEvent[] => {
  let filtered = [...auditLogs];

  // Search term filter (searches in action, entity, and details)
  if (filters.searchTerm && filters.searchTerm.trim() !== '') {
    const searchLower = filters.searchTerm.toLowerCase().trim();
    filtered = filtered.filter((log) => {
      const matchesAction = log.action.toLowerCase().includes(searchLower);
      const matchesEntity = log.entity.toLowerCase().includes(searchLower);
      const matchesEntityId = log.entity_id.toLowerCase().includes(searchLower);
      const matchesDetails = log.details
        ? JSON.stringify(log.details).toLowerCase().includes(searchLower)
        : false;

      return matchesAction || matchesEntity || matchesEntityId || matchesDetails;
    });
  }

  // User filter
  if (filters.userIds && filters.userIds.length > 0) {
    filtered = filtered.filter((log) =>
      log.actor_id && filters.userIds?.includes(log.actor_id)
    );
  }

  // Action filter
  if (filters.actions && filters.actions.length > 0) {
    filtered = filtered.filter((log) =>
      filters.actions?.includes(log.action)
    );
  }

  // Entity filter
  if (filters.entities && filters.entities.length > 0) {
    filtered = filtered.filter((log) =>
      filters.entities?.includes(log.entity)
    );
  }

  // Date range filter
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.created_at);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  return filtered;
};

/**
 * Sort audit logs based on configuration
 *
 * @param auditLogs - Array of audit events to sort
 * @param sortConfig - Sort configuration
 * @returns Sorted audit logs
 */
export const sortAuditLogs = (
  auditLogs: readonly AuditEvent[],
  sortConfig: IAuditSortConfig
): readonly AuditEvent[] => {
  const sorted = [...auditLogs];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'action':
        comparison = a.action.localeCompare(b.action);
        break;
      case 'entity':
        comparison = a.entity.localeCompare(b.entity);
        break;
      case 'actor_id':
        comparison = (a.actor_id || '').localeCompare(b.actor_id || '');
        break;
      default:
        comparison = 0;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Format audit entry for display with rich metadata
 *
 * @param auditLog - Raw audit event from database
 * @returns Formatted audit entry with display-ready fields
 */
export const formatAuditEntry = (auditLog: AuditEvent): IFormattedAuditEntry => {
  const timestamp = new Date(auditLog.created_at);
  const actionMeta = getActionMetadata(auditLog.action);
  const entityMeta = getEntityMetadata(auditLog.entity);
  const severity = calculateSeverity(auditLog.action, auditLog.entity);

  return {
    id: auditLog.id,
    timestamp,
    formattedTimestamp: formatTimestamp(timestamp),
    relativeTime: formatRelativeTime(timestamp),
    action: auditLog.action,
    actionLabel: actionMeta.label,
    actionIcon: actionMeta.icon,
    actionColor: actionMeta.color,
    entity: auditLog.entity,
    entityLabel: entityMeta.label,
    entityId: auditLog.entity_id,
    actorId: auditLog.actor_id,
    actorName: auditLog.actor_id ? `User ${auditLog.actor_id.slice(0, 8)}` : 'System',
    details: auditLog.details as Record<string, unknown> | null,
    formattedDetails: formatDetails(auditLog.details),
    severity,
  };
};

/**
 * Group audit entries by date
 *
 * @param auditLogs - Array of formatted audit entries
 * @returns Grouped audit entries by date
 */
export const groupAuditLogsByDate = (
  auditLogs: readonly IFormattedAuditEntry[]
): readonly IGroupedAuditEntries[] => {
  const groups = new Map<string, IFormattedAuditEntry[]>();

  auditLogs.forEach((log) => {
    const dateKey = log.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, log]);
  });

  const result: IGroupedAuditEntries[] = [];
  groups.forEach((entries, date) => {
    result.push({
      date,
      formattedDate: formatDateGrouping(new Date(date)),
      entries,
      count: entries.length,
    });
  });

  // Sort by date descending (newest first)
  result.sort((a, b) => b.date.localeCompare(a.date));

  return result;
};

/**
 * Get unique action types from audit logs
 *
 * @param auditLogs - Array of audit events
 * @returns Array of unique action types
 */
export const getUniqueActions = (
  auditLogs: readonly AuditEvent[]
): readonly string[] => {
  const actions = new Set<string>();
  auditLogs.forEach((log) => actions.add(log.action));
  return Array.from(actions).sort();
};

/**
 * Get unique entity types from audit logs
 *
 * @param auditLogs - Array of audit events
 * @returns Array of unique entity types
 */
export const getUniqueEntities = (
  auditLogs: readonly AuditEvent[]
): readonly string[] => {
  const entities = new Set<string>();
  auditLogs.forEach((log) => entities.add(log.entity));
  return Array.from(entities).sort();
};

/**
 * Get unique user IDs from audit logs
 *
 * @param auditLogs - Array of audit events
 * @returns Array of unique user IDs
 */
export const getUniqueUsers = (
  auditLogs: readonly AuditEvent[]
): readonly string[] => {
  const users = new Set<string>();
  auditLogs.forEach((log) => {
    if (log.actor_id) {
      users.add(log.actor_id);
    }
  });
  return Array.from(users).sort();
};

/**
 * Calculate audit statistics
 *
 * @param auditLogs - Array of audit events
 * @returns Comprehensive audit statistics
 */
export const calculateAuditStats = (
  auditLogs: readonly AuditEvent[]
): IAuditStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  // Action breakdown
  const actionBreakdown: Record<string, number> = {};
  auditLogs.forEach((log) => {
    actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
  });

  // Entity breakdown
  const entityBreakdown: Record<string, number> = {};
  auditLogs.forEach((log) => {
    entityBreakdown[log.entity] = (entityBreakdown[log.entity] || 0) + 1;
  });

  // User activity
  const userActivity: Record<string, number> = {};
  auditLogs.forEach((log) => {
    if (log.actor_id) {
      userActivity[log.actor_id] = (userActivity[log.actor_id] || 0) + 1;
    }
  });

  const mostActiveUser = Object.entries(userActivity).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostCommonAction = Object.entries(actionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Time-based counts
  const eventsToday = auditLogs.filter((log) =>
    new Date(log.created_at) >= today
  ).length;

  const eventsThisWeek = auditLogs.filter((log) =>
    new Date(log.created_at) >= weekAgo
  ).length;

  const eventsThisMonth = auditLogs.filter((log) =>
    new Date(log.created_at) >= monthAgo
  ).length;

  // Critical events (deletion, security-related actions)
  const criticalActions = ['delete', 'revoke', 'suspend', 'ban', 'security_alert'];
  const criticalEvents = auditLogs.filter((log) =>
    criticalActions.some((action) => log.action.toLowerCase().includes(action))
  ).length;

  return {
    totalEvents: auditLogs.length,
    uniqueUsers: getUniqueUsers(auditLogs).length,
    actionBreakdown,
    entityBreakdown,
    eventsToday,
    eventsThisWeek,
    eventsThisMonth,
    criticalEvents,
    mostActiveUser,
    mostCommonAction,
  };
};

/**
 * Export audit logs to CSV format
 *
 * @param auditLogs - Array of formatted audit entries
 * @returns CSV export data structure
 */
export const exportAuditLogsToCSV = (
  auditLogs: readonly IFormattedAuditEntry[]
): IAuditExportData => {
  const headers = [
    'Timestamp',
    'Action',
    'Entity',
    'Entity ID',
    'Actor',
    'Severity',
    'Details',
  ];

  const rows = auditLogs.map((log) => [
    log.formattedTimestamp,
    log.actionLabel,
    log.entityLabel,
    log.entityId,
    log.actorName,
    log.severity,
    log.formattedDetails,
  ]);

  return {
    headers,
    rows,
    filename: `audit-logs-${formatDateForFilename(new Date())}`,
  };
};

/**
 * Generate CSV content from export data
 *
 * @param exportData - CSV export data structure
 * @returns CSV content as string
 */
export const generateAuditCSVContent = (exportData: IAuditExportData): string => {
  const csvLines: string[] = [];

  // Add headers
  csvLines.push(exportData.headers.map((h) => `"${h}"`).join(','));

  // Add rows
  exportData.rows.forEach((row) => {
    csvLines.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  });

  return csvLines.join('\n');
};

/**
 * Get action metadata (label, icon, color)
 *
 * @param action - Action string from audit log
 * @returns Action metadata for display
 */
const getActionMetadata = (
  action: string
): { label: string; icon: string; color: string } => {
  const actionLower = action.toLowerCase();

  // Create
  if (actionLower.includes('create') || actionLower.includes('add')) {
    return {
      label: formatActionLabel(action),
      icon: 'Plus',
      color: 'text-green-600 dark:text-green-400',
    };
  }

  // Update
  if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('modify')) {
    return {
      label: formatActionLabel(action),
      icon: 'Edit',
      color: 'text-blue-600 dark:text-blue-400',
    };
  }

  // Delete
  if (actionLower.includes('delete') || actionLower.includes('remove')) {
    return {
      label: formatActionLabel(action),
      icon: 'Trash',
      color: 'text-red-600 dark:text-red-400',
    };
  }

  // Login/Logout
  if (actionLower.includes('login') || actionLower.includes('signin')) {
    return {
      label: formatActionLabel(action),
      icon: 'LogIn',
      color: 'text-green-600 dark:text-green-400',
    };
  }

  if (actionLower.includes('logout') || actionLower.includes('signout')) {
    return {
      label: formatActionLabel(action),
      icon: 'LogOut',
      color: 'text-gray-600 dark:text-gray-400',
    };
  }

  // Security
  if (actionLower.includes('revoke') || actionLower.includes('suspend') || actionLower.includes('ban')) {
    return {
      label: formatActionLabel(action),
      icon: 'Shield',
      color: 'text-orange-600 dark:text-orange-400',
    };
  }

  // Default
  return {
    label: formatActionLabel(action),
    icon: 'Activity',
    color: 'text-gray-600 dark:text-gray-400',
  };
};

/**
 * Get entity metadata (label)
 *
 * @param entity - Entity string from audit log
 * @returns Entity metadata for display
 */
const getEntityMetadata = (entity: string): { label: string } => {
  const entityMap: Record<string, string> = {
    'booking': 'Booking',
    'bookings': 'Booking',
    'facility': 'Facility',
    'facilities': 'Facility',
    'user': 'User',
    'users': 'User',
    'organization': 'Organization',
    'organizations': 'Organization',
    'role': 'Role',
    'roles': 'Role',
    'permission': 'Permission',
    'permissions': 'Permission',
    'service': 'Service',
    'services': 'Service',
    'zone': 'Zone',
    'zones': 'Zone',
  };

  return {
    label: entityMap[entity.toLowerCase()] || formatEntityLabel(entity),
  };
};

/**
 * Calculate severity level based on action and entity
 *
 * @param action - Action string
 * @param entity - Entity string
 * @returns Severity level
 */
const calculateSeverity = (
  action: string,
  entity: string
): 'info' | 'warning' | 'critical' => {
  const actionLower = action.toLowerCase();
  const entityLower = entity.toLowerCase();

  // Critical actions
  const criticalActions = ['delete', 'remove', 'revoke', 'suspend', 'ban'];
  if (criticalActions.some((a) => actionLower.includes(a))) {
    return 'critical';
  }

  // Warning actions
  const warningActions = ['update', 'edit', 'modify'];
  const sensitiveEntities = ['user', 'role', 'permission', 'organization'];

  if (
    warningActions.some((a) => actionLower.includes(a)) &&
    sensitiveEntities.some((e) => entityLower.includes(e))
  ) {
    return 'warning';
  }

  // Default to info
  return 'info';
};

/**
 * Format timestamp for display
 *
 * @param date - Date to format
 * @returns Formatted timestamp string
 */
const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 *
 * @param date - Date to format
 * @returns Relative time string
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatTimestamp(date);
  }
};

/**
 * Format date for grouping (e.g., "Today", "Yesterday", "Dec 15, 2024")
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
const formatDateGrouping = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (inputDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

/**
 * Format action label (convert snake_case to Title Case)
 *
 * @param action - Action string
 * @returns Formatted action label
 */
const formatActionLabel = (action: string): string => {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format entity label (convert snake_case to Title Case)
 *
 * @param entity - Entity string
 * @returns Formatted entity label
 */
const formatEntityLabel = (entity: string): string => {
  return entity
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format details JSON for display
 *
 * @param details - Details JSON object
 * @returns Formatted details string
 */
const formatDetails = (details: Json | null): string => {
  if (!details) {
    return 'No additional details';
  }

  try {
    const detailsObj = details as Record<string, unknown>;
    const entries = Object.entries(detailsObj);

    if (entries.length === 0) {
      return 'No additional details';
    }

    return entries
      .map(([key, value]) => {
        const formattedKey = formatActionLabel(key);
        const formattedValue = typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
        return `${formattedKey}: ${formattedValue}`;
      })
      .join(', ');
  } catch (error) {
    return 'Unable to parse details';
  }
};

/**
 * Format date for filename (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns Formatted date string for filename
 */
const formatDateForFilename = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
