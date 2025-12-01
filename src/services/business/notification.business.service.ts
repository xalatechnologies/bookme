/**
 * Notification Business Logic Service
 *
 * Contains all business logic related to notification operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { Notification } from "@/types/notification";

export interface INotificationFilters {
  readonly searchTerm?: string;
  readonly type?: readonly Notification['type'][];
  readonly priority?: readonly Notification['priority'][];
  readonly read?: boolean;
  readonly dateRange?: { readonly from: Date; readonly to: Date };
}

export interface INotificationSortConfig {
  readonly sortBy: 'created_at' | 'priority' | 'type';
  readonly sortOrder: 'asc' | 'desc';
}

export interface INotificationGrouping {
  readonly [type: string]: readonly Notification[];
}

/**
 * Filter notifications based on search and filter criteria
 */
export const filterNotifications = (
  notifications: readonly Notification[],
  filters: INotificationFilters
): readonly Notification[] => {
  return notifications.filter(notification => {
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        notification.title.toLowerCase().includes(searchLower) ||
        notification.content.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(notification.type)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(notification.priority)) return false;
    }

    // Read status filter
    if (filters.read !== undefined) {
      if (notification.read !== filters.read) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const notificationDate = new Date(notification.createdAt);
      if (notificationDate < filters.dateRange.from || notificationDate > filters.dateRange.to) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort notifications based on sort configuration
 */
export const sortNotifications = (
  notifications: readonly Notification[],
  sortConfig: INotificationSortConfig
): readonly Notification[] => {
  const sorted = [...notifications].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'created_at':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Group notifications by type
 */
export const groupNotificationsByType = (
  notifications: readonly Notification[]
): INotificationGrouping => {
  return notifications.reduce((grouped, notification) => {
    const type = notification.type;
    const existing = grouped[type] || [];

    return {
      ...grouped,
      [type]: [...existing, notification]};
  }, {} as INotificationGrouping);
};

/**
 * Mark notifications as read
 */
export const markAsRead = (
  notifications: readonly Notification[],
  notificationIds: readonly string[]
): readonly Notification[] => {
  const now = new Date().toISOString();
  const idSet = new Set(notificationIds);

  return notifications.map(notification => {
    if (idSet.has(notification.id) && !notification.read) {
      return {
        ...notification,
        read: true,
        readAt: now};
    }
    return notification;
  });
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = (
  notifications: readonly Notification[],
  userId: string
): readonly Notification[] => {
  const now = new Date().toISOString();

  return notifications.map(notification => {
    if (notification.userId === userId && !notification.read) {
      return {
        ...notification,
        read: true,
        readAt: now};
    }
    return notification;
  });
};

/**
 * Prioritize notifications by urgency
 * Returns notifications sorted by priority and recency
 */
export const prioritizeNotifications = (
  notifications: readonly Notification[]
): readonly Notification[] => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  return [...notifications].sort((a, b) => {
    // First sort by priority (high to low)
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by unread status (unread first)
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }

    // Finally by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Calculate unread count for a user
 */
export const calculateUnreadCount = (
  notifications: readonly Notification[],
  userId: string
): number => {
  return notifications.filter(
    notification => notification.userId === userId && !notification.read
  ).length;
};

/**
 * Calculate unread count by type
 */
export const calculateUnreadCountByType = (
  notifications: readonly Notification[],
  userId: string
): ReadonlyMap<Notification['type'], number> => {
  const unreadByType = new Map<Notification['type'], number>();

  notifications.forEach(notification => {
    if (notification.userId === userId && !notification.read) {
      const currentCount = unreadByType.get(notification.type) || 0;
      unreadByType.set(notification.type, currentCount + 1);
    }
  });

  return unreadByType;
};

/**
 * Calculate unread count by priority
 */
export const calculateUnreadCountByPriority = (
  notifications: readonly Notification[],
  userId: string
): ReadonlyMap<Notification['priority'], number> => {
  const unreadByPriority = new Map<Notification['priority'], number>();

  notifications.forEach(notification => {
    if (notification.userId === userId && !notification.read) {
      const currentCount = unreadByPriority.get(notification.priority) || 0;
      unreadByPriority.set(notification.priority, currentCount + 1);
    }
  });

  return unreadByPriority;
};

/**
 * Get high priority unread notifications
 */
export const getHighPriorityUnread = (
  notifications: readonly Notification[],
  userId: string
): readonly Notification[] => {
  return notifications.filter(
    notification =>
      notification.userId === userId &&
      !notification.read &&
      notification.priority === 'high'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Check if notification is urgent (high priority and recent)
 */
export const isUrgent = (
  notification: Notification,
  urgentWindowHours: number = 24
): boolean => {
  if (notification.priority !== 'high') return false;
  if (notification.read) return false;

  const notificationTime = new Date(notification.createdAt).getTime();
  const now = Date.now();
  const urgentWindowMs = urgentWindowHours * 60 * 60 * 1000;

  return (now - notificationTime) <= urgentWindowMs;
};

/**
 * Get notifications requiring immediate attention
 */
export const getUrgentNotifications = (
  notifications: readonly Notification[],
  userId: string,
  urgentWindowHours: number = 24
): readonly Notification[] => {
  return notifications.filter(notification =>
    notification.userId === userId &&
    isUrgent(notification, urgentWindowHours)
  );
};

/**
 * Calculate notification statistics
 */
export const calculateNotificationStats = (
  notifications: readonly Notification[],
  userId: string
) => {
  const userNotifications = notifications.filter(n => n.userId === userId);

  const total = userNotifications.length;
  const unread = userNotifications.filter(n => !n.read).length;
  const byPriority = {
    high: userNotifications.filter(n => n.priority === 'high').length,
    medium: userNotifications.filter(n => n.priority === 'medium').length,
    low: userNotifications.filter(n => n.priority === 'low').length};
  const byType = {
    booking: userNotifications.filter(n => n.type === 'booking').length,
    message: userNotifications.filter(n => n.type === 'message').length,
    system: userNotifications.filter(n => n.type === 'system').length,
    payment: userNotifications.filter(n => n.type === 'payment').length,
    reminder: userNotifications.filter(n => n.type === 'reminder').length};
  const urgent = getUrgentNotifications(notifications, userId).length;

  return {
    total,
    unread,
    read: total - unread,
    byPriority,
    byType,
    urgent,
    readPercentage: total > 0 ? Math.round((total - unread) / total * 100) : 0};
};

/**
 * Validate notification data
 */
export const validateNotificationData = (
  notification: Partial<Notification>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!notification.userId) {
    errors.push('User ID is required');
  }

  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (notification.title && notification.title.length > 100) {
    errors.push('Title exceeds maximum length of 100 characters');
  }

  if (!notification.content || notification.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (notification.content && notification.content.length > 500) {
    errors.push('Content exceeds maximum length of 500 characters');
  }

  if (!notification.type) {
    errors.push('Notification type is required');
  }

  if (!notification.priority) {
    errors.push('Priority is required');
  }

  return {
    isValid: errors.length === 0,
    errors};
};

/**
 * Format notification for display
 */
export const formatNotificationForDisplay = (notification: Notification) => {
  const now = Date.now();
  const createdAt = new Date(notification.createdAt).getTime();
  const minutesAgo = Math.floor((now - createdAt) / (1000 * 60));

  let timeAgo: string;
  if (minutesAgo < 1) {
    timeAgo = 'Just now';
  } else if (minutesAgo < 60) {
    timeAgo = `${minutesAgo}m ago`;
  } else if (minutesAgo < 1440) {
    timeAgo = `${Math.floor(minutesAgo / 60)}h ago`;
  } else {
    timeAgo = `${Math.floor(minutesAgo / 1440)}d ago`;
  }

  return {
    ...notification,
    formattedCreatedAt: new Date(notification.createdAt).toLocaleString('no-NO'),
    formattedReadAt: notification.readAt ? new Date(notification.readAt).toLocaleString('no-NO') : undefined,
    timeAgo,
    isUnread: !notification.read,
    isUrgent: isUrgent(notification)};
};
