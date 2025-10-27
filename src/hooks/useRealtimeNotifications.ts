/**
 * Real-time Notifications Hook
 *
 * Subscribes to notification changes in real-time using Supabase Realtime.
 * Shows instant notifications to users and updates notification badge counts.
 *
 * @example
 * ```tsx
 * function NotificationCenter() {
 *   const { user } = useAuth();
 *   const { data: notifications } = useNotifications(user?.id!);
 *
 *   // Enable real-time notification updates
 *   useRealtimeNotifications(user?.id!);
 *
 *   return <NotificationList notifications={notifications} />;
 * }
 * ```
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];

/**
 * Query keys for notifications (matching future notifications.service.ts)
 */
const notificationKeys = {
  all: ['notifications'] as const,
  user: (userId: string) => [...notificationKeys.all, 'user', userId] as const,
  unread: (userId: string) => [...notificationKeys.all, 'unread', userId] as const,
  unreadCount: (userId: string) => [...notificationKeys.all, 'unread-count', userId] as const,
};

/**
 * Subscribe to real-time notification updates for a user
 *
 * @param userId - User ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 * @param onNewNotification - Optional callback when new notification arrives
 *
 * @example
 * ```tsx
 * function App() {
 *   const { user } = useAuth();
 *
 *   // Show toast for new notifications
 *   useRealtimeNotifications(user?.id!, true, (notification) => {
 *     toast.info(notification.subject);
 *   });
 *
 *   return <YourApp />;
 * }
 * ```
 */
export const useRealtimeNotifications = (
  userId: string,
  enabled = true,
  onNewNotification?: (notification: Notification) => void
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log(`[Realtime] Subscribing to notifications for user: ${userId}`);

    const channel = supabase
      .channel(`user-${userId}-notifications`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          console.log('[Realtime] New notification:', payload.new);

          if (payload.new) {
            // Invalidate notification queries
            queryClient.invalidateQueries({
              queryKey: notificationKeys.user(userId),
            });
            queryClient.invalidateQueries({
              queryKey: notificationKeys.unread(userId),
            });
            queryClient.invalidateQueries({
              queryKey: notificationKeys.unreadCount(userId),
            });

            // Call custom handler if provided
            if (onNewNotification) {
              onNewNotification(payload.new);
            }

            // Could also trigger browser notification here
            // showBrowserNotification(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          console.log('[Realtime] Notification updated:', payload.new);

          // Invalidate queries (e.g., notification marked as read)
          queryClient.invalidateQueries({
            queryKey: notificationKeys.user(userId),
          });
          queryClient.invalidateQueries({
            queryKey: notificationKeys.unread(userId),
          });
          queryClient.invalidateQueries({
            queryKey: notificationKeys.unreadCount(userId),
          });
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Notifications subscription status for user ${userId}:`, status);
      });

    return () => {
      console.log(`[Realtime] Unsubscribing from notifications: ${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, onNewNotification, queryClient]);
};

/**
 * Subscribe to unread notification count updates
 *
 * @param userId - User ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 *
 * @example
 * ```tsx
 * function NotificationBadge() {
 *   const { user } = useAuth();
 *   const { data: count } = useUnreadNotificationCount(user?.id!);
 *
 *   // Badge updates in real-time
 *   useRealtimeNotificationCount(user?.id!);
 *
 *   return count > 0 ? <span className="badge">{count}</span> : null;
 * }
 * ```
 */
export const useRealtimeNotificationCount = (
  userId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log(`[Realtime] Subscribing to notification count for user: ${userId}`);

    const channel = supabase
      .channel(`user-${userId}-notification-count`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log('[Realtime] Notification count changed');

          // Invalidate unread count
          queryClient.invalidateQueries({
            queryKey: notificationKeys.unreadCount(userId),
          });
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from notification count: ${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, queryClient]);
};

/**
 * Subscribe to high-priority/urgent notifications only
 *
 * @param userId - User ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 * @param onUrgentNotification - Callback for urgent notifications
 *
 * @example
 * ```tsx
 * function UrgentAlerts() {
 *   const { user } = useAuth();
 *
 *   useRealtimeUrgentNotifications(user?.id!, true, (notification) => {
 *     // Play alert sound
 *     playAlertSound();
 *     // Show prominent notification
 *     showModal({
 *       title: notification.subject,
 *       message: notification.body,
 *       type: 'urgent'
 *     });
 *   });
 *
 *   return null; // This is just for side effects
 * }
 * ```
 */
export const useRealtimeUrgentNotifications = (
  userId: string,
  enabled = true,
  onUrgentNotification?: (notification: Notification) => void
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log(`[Realtime] Subscribing to urgent notifications for user: ${userId}`);

    const channel = supabase
      .channel(`user-${userId}-urgent-notifications`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          if (payload.new && payload.new.priority === 'urgent') {
            console.log('[Realtime] URGENT notification:', payload.new);

            // Invalidate queries
            queryClient.invalidateQueries({
              queryKey: notificationKeys.user(userId),
            });

            // Call urgent handler
            if (onUrgentNotification) {
              onUrgentNotification(payload.new);
            }

            // Could request browser notification permission
            // requestNotificationPermission();
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from urgent notifications: ${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, onUrgentNotification, queryClient]);
};

/**
 * Helper function to show browser notification
 * (to be called from the hooks above)
 */
export const showBrowserNotification = (notification: Notification): void => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(notification.subject, {
      body: notification.body,
      icon: '/logo.png',
      badge: '/badge.png',
      tag: notification.id,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(notification.subject, {
          body: notification.body,
          icon: '/logo.png',
        });
      }
    });
  }
};

/**
 * Helper to request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  const permission = await Notification.requestPermission();
  return permission;
};
