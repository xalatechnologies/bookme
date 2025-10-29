/**
 * Notifications Service
 *
 * Handles notification management with React Query hooks.
 * Provides CRUD operations, read status tracking, and notification preferences.
 *
 * @example
 * ```tsx
 * function NotificationCenter() {
 *   const { user } = useAuth();
 *   const { data: notifications, isLoading } = useNotifications(user?.id!);
 *
 *   // Enable real-time
 *   useRealtimeNotifications(user?.id!);
 *
 *   return <NotificationList notifications={notifications} />;
 * }
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];
type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];
type NotificationPreferencesUpdate = Database['public']['Tables']['notification_preferences']['Update'];

/**
 * Query keys for notifications
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  user: (userId: string) => [...notificationKeys.all, 'user', userId] as const,
  unread: (userId: string) => [...notificationKeys.all, 'unread', userId] as const,
  unreadCount: (userId: string) => [...notificationKeys.all, 'unread-count', userId] as const,
  byType: (userId: string, type: string) => [...notificationKeys.all, 'type', userId, type] as const,
  urgent: (userId: string) => [...notificationKeys.all, 'urgent', userId] as const,
  preferences: (userId: string) => [...notificationKeys.all, 'preferences', userId] as const,
};

/**
 * Notifications service
 */
export const notificationsService = {
  /**
   * Get all notifications for user
   */
  getAll: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get unread notifications
   */
  getUnread: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get notifications by type
   */
  getByType: async (userId: string, type: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get urgent notifications
   */
  getUrgent: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('priority', 'urgent')
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create notification
   */
  create: async (notification: NotificationInsert): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  /**
   * Delete notification
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) throw error;
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (userId: string): Promise<NotificationPreferences | null> => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences exist, return default
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (
    userId: string,
    preferences: NotificationPreferencesUpdate
  ): Promise<NotificationPreferences> => {
    // Try to update first
    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({ user_id: userId, ...preferences })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },
};

/**
 * Hook: Get all notifications
 */
export const useNotifications = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.user(userId),
    queryFn: () => notificationsService.getAll(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook: Get unread notifications
 */
export const useUnreadNotifications = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.unread(userId),
    queryFn: () => notificationsService.getUnread(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook: Get unread count
 */
export const useUnreadNotificationCount = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => notificationsService.getUnreadCount(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook: Get notifications by type
 */
export const useNotificationsByType = (
  userId: string,
  type: string,
  enabled = true
) => {
  return useQuery({
    queryKey: notificationKeys.byType(userId, type),
    queryFn: () => notificationsService.getByType(userId, type),
    enabled: !!userId && !!type && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook: Get urgent notifications
 */
export const useUrgentNotifications = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.urgent(userId),
    queryFn: () => notificationsService.getUrgent(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook: Create notification
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.create,
    onSuccess: (data) => {
      // Invalidate user notifications
      queryClient.invalidateQueries({
        queryKey: notificationKeys.user(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(data.user_id),
      });

      // Invalidate type-specific queries
      if (data.type) {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.byType(data.user_id, data.type),
        });
      }

      // Invalidate urgent if applicable
      if (data.priority === 'urgent') {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.urgent(data.user_id),
        });
      }
    },
  });
};

/**
 * Hook: Mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: (data) => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({
        queryKey: notificationKeys.user(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(data.user_id),
      });
    },
  });
};

/**
 * Hook: Mark all as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationsService.markAllAsRead(userId),
    onSuccess: (_, userId) => {
      // Invalidate all notification queries for user
      queryClient.invalidateQueries({
        queryKey: notificationKeys.user(userId),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(userId),
      });
    },
  });
};

/**
 * Hook: Delete notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      // Invalidate all notifications (we don't have userId here)
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

/**
 * Hook: Delete all read notifications
 */
export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationsService.deleteAllRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.user(userId),
      });
    },
  });
};

/**
 * Hook: Get notification preferences
 */
export const useNotificationPreferences = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: notificationKeys.preferences(userId),
    queryFn: () => notificationsService.getPreferences(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (preferences don't change often)
  });
};

/**
 * Hook: Update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      preferences,
    }: {
      userId: string;
      preferences: NotificationPreferencesUpdate;
    }) => notificationsService.updatePreferences(userId, preferences),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(data.user_id),
      });
    },
  });
};
