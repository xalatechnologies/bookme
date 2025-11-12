/**
 * Notification Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for notification management operations.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from '@/services/supabase/notifications.service';
import {
  filterNotifications,
  sortNotifications,
  prioritizeNotifications,
  calculateNotificationStats,
  calculateUnreadCount,
  calculateUnreadCountByType,
  calculateUnreadCountByPriority,
  getHighPriorityUnread,
  getUrgentNotifications,
  type INotificationFilters,
  type INotificationSortConfig,
} from '@/services/business/notification.business.service';
import type { Notification } from '@/types/notification';
import type { Database } from '@/types/database';

type DbNotification = Database['public']['Tables']['notifications']['Row'];

export interface INotificationUIState {
  readonly searchTerm: string;
  readonly typeFilter: readonly Notification['type'][];
  readonly priorityFilter: readonly Notification['priority'][];
  readonly readFilter?: boolean;
  readonly dateRange?: { readonly from: Date; readonly to: Date };
  readonly sortBy: 'created_at' | 'priority' | 'type';
  readonly sortOrder: 'asc' | 'desc';
  readonly groupBy: 'date' | 'type' | 'priority' | 'none';
  readonly selectedNotificationIds: readonly string[];
}

export interface INotificationGroup {
  readonly label: string;
  readonly notifications: readonly Notification[];
}

export interface IUseNotificationManagementReturn {
  // Data
  readonly notifications: readonly Notification[];
  readonly filteredNotifications: readonly Notification[];
  readonly groupedNotifications: readonly INotificationGroup[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly stats: ReturnType<typeof calculateNotificationStats>;
  readonly unreadCount: number;
  readonly unreadByType: ReadonlyMap<Notification['type'], number>;
  readonly unreadByPriority: ReadonlyMap<Notification['priority'], number>;
  readonly highPriorityUnread: readonly Notification[];
  readonly urgentNotifications: readonly Notification[];

  // UI State
  readonly uiState: INotificationUIState;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleTypeFilter: (type: Notification['type']) => void;
  readonly clearTypeFilters: () => void;
  readonly togglePriorityFilter: (priority: Notification['priority']) => void;
  readonly clearPriorityFilters: () => void;
  readonly setReadFilter: (read?: boolean) => void;
  readonly setDateRange: (range?: { from: Date; to: Date }) => void;
  readonly setSortBy: (sortBy: 'created_at' | 'priority' | 'type') => void;
  readonly setSortOrder: (order: 'asc' | 'desc') => void;
  readonly setGroupBy: (groupBy: 'date' | 'type' | 'priority' | 'none') => void;
  readonly toggleNotificationSelection: (id: string) => void;
  readonly selectAllNotifications: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;

  // Business Operations
  readonly markAsRead: (id: string) => Promise<void>;
  readonly markAllAsRead: () => Promise<void>;
  readonly deleteNotification: (id: string) => Promise<void>;
  readonly deleteAllRead: () => Promise<void>;
  readonly batchMarkAsRead: (ids: readonly string[]) => Promise<void>;
  readonly batchDelete: (ids: readonly string[]) => Promise<void>;
}

/**
 * Convert database notification to application notification
 */
const mapDbNotificationToNotification = (dbNotification: DbNotification): Notification => {
  return {
    id: dbNotification.id,
    userId: dbNotification.user_id,
    type: dbNotification.type as Notification['type'],
    title: dbNotification.title,
    content: dbNotification.content,
    priority: dbNotification.priority as Notification['priority'],
    read: dbNotification.read,
    actionUrl: dbNotification.action_url || undefined,
    metadata: dbNotification.metadata as Record<string, unknown> | undefined,
    createdAt: dbNotification.created_at,
    readAt: dbNotification.read_at || undefined,
  };
};

/**
 * Hook for managing notifications with business logic separation
 *
 * Provides comprehensive notification management functionality including:
 * - Data fetching and caching via React Query
 * - UI state management
 * - Business logic validation and operations
 * - Filtering, sorting, grouping, and search
 * - CRUD operations with optimistic updates
 * - Batch operations for multiple notifications
 *
 * @returns Complete notification management interface
 *
 * @example
 * ```tsx
 * function NotificationCenter() {
 *   const {
 *     filteredNotifications,
 *     isLoading,
 *     stats,
 *     searchTerm,
 *     setSearchTerm,
 *     markAsRead,
 *     markAllAsRead,
 *   } = useNotificationManagement();
 *
 *   const handleMarkAsRead = async (notificationId: string) => {
 *     await markAsRead(notificationId);
 *     toast.success('Notification marked as read');
 *   };
 *
 *   return (
 *     <div>
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <NotificationStats stats={stats} />
 *       <NotificationList
 *         notifications={filteredNotifications}
 *         onMarkAsRead={handleMarkAsRead}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useNotificationManagement = (): IUseNotificationManagementReturn => {
  // Auth context
  const { user } = useAuth();
  const userId = user?.id || '';

  // Data layer - fetch notifications from Supabase
  const {
    data: dbNotifications = [],
    isLoading,
    error,
  } = useNotifications(userId);

  // Convert database notifications to application notifications
  const notifications = useMemo(
    () => dbNotifications.map(mapDbNotificationToNotification),
    [dbNotifications]
  );

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllReadMutation = useDeleteAllReadNotifications();

  // UI state layer
  const [uiState, setUiState] = useState<INotificationUIState>({
    searchTerm: '',
    typeFilter: [],
    priorityFilter: [],
    readFilter: undefined,
    dateRange: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
    groupBy: 'date',
    selectedNotificationIds: [],
  });

  // Business logic layer - filtering and sorting
  const filteredNotifications = useMemo(() => {
    const filters: INotificationFilters = {
      searchTerm: uiState.searchTerm,
      type: uiState.typeFilter,
      priority: uiState.priorityFilter,
      read: uiState.readFilter,
      dateRange: uiState.dateRange,
    };

    const filtered = filterNotifications(notifications, filters);

    const sortConfig: INotificationSortConfig = {
      sortBy: uiState.sortBy,
      sortOrder: uiState.sortOrder,
    };

    return sortNotifications(filtered, sortConfig);
  }, [notifications, uiState]);

  // Group notifications based on groupBy setting
  const groupedNotifications = useMemo((): readonly INotificationGroup[] => {
    if (uiState.groupBy === 'none') {
      return [{ label: 'All', notifications: filteredNotifications }];
    }

    if (uiState.groupBy === 'type') {
      const groups = new Map<string, Notification[]>();
      filteredNotifications.forEach((notification) => {
        const key = notification.type;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(notification);
      });

      return Array.from(groups.entries()).map(([type, notifications]) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        notifications,
      }));
    }

    if (uiState.groupBy === 'priority') {
      const priorityOrder = ['high', 'medium', 'low'];
      const groups = new Map<string, Notification[]>();

      filteredNotifications.forEach((notification) => {
        const key = notification.priority;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(notification);
      });

      return priorityOrder
        .filter((priority) => groups.has(priority))
        .map((priority) => ({
          label: priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority',
          notifications: groups.get(priority)!,
        }));
    }

    // Group by date (default)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      thisWeek: [] as Notification[],
      older: [] as Notification[],
    };

    filteredNotifications.forEach((notification) => {
      const notificationDate = new Date(notification.createdAt);
      const notificationDay = new Date(
        notificationDate.getFullYear(),
        notificationDate.getMonth(),
        notificationDate.getDate()
      );

      if (notificationDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notificationDay >= thisWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    const result: INotificationGroup[] = [];
    if (groups.today.length > 0) {
      result.push({ label: 'Today', notifications: groups.today });
    }
    if (groups.yesterday.length > 0) {
      result.push({ label: 'Yesterday', notifications: groups.yesterday });
    }
    if (groups.thisWeek.length > 0) {
      result.push({ label: 'This Week', notifications: groups.thisWeek });
    }
    if (groups.older.length > 0) {
      result.push({ label: 'Older', notifications: groups.older });
    }

    return result;
  }, [filteredNotifications, uiState.groupBy]);

  // Statistics
  const stats = useMemo(() => calculateNotificationStats(notifications, userId), [notifications, userId]);
  const unreadCount = useMemo(() => calculateUnreadCount(notifications, userId), [notifications, userId]);
  const unreadByType = useMemo(
    () => calculateUnreadCountByType(notifications, userId),
    [notifications, userId]
  );
  const unreadByPriority = useMemo(
    () => calculateUnreadCountByPriority(notifications, userId),
    [notifications, userId]
  );
  const highPriorityUnread = useMemo(
    () => getHighPriorityUnread(notifications, userId),
    [notifications, userId]
  );
  const urgentNotifications = useMemo(
    () => getUrgentNotifications(notifications, userId),
    [notifications, userId]
  );

  // UI Actions
  const setSearchTerm = useCallback((term: string) => {
    setUiState((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const toggleTypeFilter = useCallback((type: Notification['type']) => {
    setUiState((prev) => {
      const typeFilter = prev.typeFilter.includes(type)
        ? prev.typeFilter.filter((t) => t !== type)
        : [...prev.typeFilter, type];
      return { ...prev, typeFilter };
    });
  }, []);

  const clearTypeFilters = useCallback(() => {
    setUiState((prev) => ({ ...prev, typeFilter: [] }));
  }, []);

  const togglePriorityFilter = useCallback((priority: Notification['priority']) => {
    setUiState((prev) => {
      const priorityFilter = prev.priorityFilter.includes(priority)
        ? prev.priorityFilter.filter((p) => p !== priority)
        : [...prev.priorityFilter, priority];
      return { ...prev, priorityFilter };
    });
  }, []);

  const clearPriorityFilters = useCallback(() => {
    setUiState((prev) => ({ ...prev, priorityFilter: [] }));
  }, []);

  const setReadFilter = useCallback((read?: boolean) => {
    setUiState((prev) => ({ ...prev, readFilter: read }));
  }, []);

  const setDateRange = useCallback((range?: { from: Date; to: Date }) => {
    setUiState((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const setSortBy = useCallback((sortBy: 'created_at' | 'priority' | 'type') => {
    setUiState((prev) => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setUiState((prev) => ({ ...prev, sortOrder }));
  }, []);

  const setGroupBy = useCallback((groupBy: 'date' | 'type' | 'priority' | 'none') => {
    setUiState((prev) => ({ ...prev, groupBy }));
  }, []);

  const toggleNotificationSelection = useCallback((id: string) => {
    setUiState((prev) => {
      const selectedNotificationIds = prev.selectedNotificationIds.includes(id)
        ? prev.selectedNotificationIds.filter((nId) => nId !== id)
        : [...prev.selectedNotificationIds, id];
      return { ...prev, selectedNotificationIds };
    });
  }, []);

  const selectAllNotifications = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      selectedNotificationIds: filteredNotifications.map((n) => n.id),
    }));
  }, [filteredNotifications]);

  const clearSelection = useCallback(() => {
    setUiState((prev) => ({ ...prev, selectedNotificationIds: [] }));
  }, []);

  const resetFilters = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      searchTerm: '',
      typeFilter: [],
      priorityFilter: [],
      readFilter: undefined,
      dateRange: undefined,
    }));
  }, []);

  // Business Operations
  const markAsRead = useCallback(
    async (id: string): Promise<void> => {
      await markAsReadMutation.mutateAsync(id);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!userId) return;
    await markAllAsReadMutation.mutateAsync(userId);
  }, [userId, markAllAsReadMutation]);

  const deleteNotification = useCallback(
    async (id: string): Promise<void> => {
      await deleteNotificationMutation.mutateAsync(id);
      // Remove from selection if selected
      setUiState((prev) => ({
        ...prev,
        selectedNotificationIds: prev.selectedNotificationIds.filter((nId) => nId !== id),
      }));
    },
    [deleteNotificationMutation]
  );

  const deleteAllRead = useCallback(async (): Promise<void> => {
    if (!userId) return;
    await deleteAllReadMutation.mutateAsync(userId);
    clearSelection();
  }, [userId, deleteAllReadMutation, clearSelection]);

  const batchMarkAsRead = useCallback(
    async (ids: readonly string[]): Promise<void> => {
      await Promise.all(ids.map((id) => markAsReadMutation.mutateAsync(id)));
      clearSelection();
    },
    [markAsReadMutation, clearSelection]
  );

  const batchDelete = useCallback(
    async (ids: readonly string[]): Promise<void> => {
      await Promise.all(ids.map((id) => deleteNotificationMutation.mutateAsync(id)));
      clearSelection();
    },
    [deleteNotificationMutation, clearSelection]
  );

  return {
    // Data
    notifications,
    filteredNotifications,
    groupedNotifications,
    isLoading,
    error,

    // Statistics
    stats,
    unreadCount,
    unreadByType,
    unreadByPriority,
    highPriorityUnread,
    urgentNotifications,

    // UI State
    uiState,
    setSearchTerm,
    toggleTypeFilter,
    clearTypeFilters,
    togglePriorityFilter,
    clearPriorityFilters,
    setReadFilter,
    setDateRange,
    setSortBy,
    setSortOrder,
    setGroupBy,
    toggleNotificationSelection,
    selectAllNotifications,
    clearSelection,
    resetFilters,

    // Business Operations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    batchMarkAsRead,
    batchDelete,
  };
};
