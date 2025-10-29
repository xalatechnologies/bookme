/**
 * Real-time Messages Hook
 *
 * Subscribes to message changes in real-time using Supabase Realtime.
 * Automatically updates message threads and unread counts.
 *
 * Perfect for chat interfaces where instant message delivery is critical.
 *
 * @example
 * ```tsx
 * function MessageThread({ threadId }: { threadId: string }) {
 *   const { data: messages } = useThreadMessages(threadId);
 *
 *   // Enable real-time message updates
 *   useRealtimeMessages(threadId);
 *
 *   return <MessageList messages={messages} />;
 * }
 * ```
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/clients/supabase';
import { messageKeys } from '@/services/supabase/messages.service';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageThread = Database['public']['Tables']['message_threads']['Row'];

/**
 * Subscribe to real-time message updates for a thread
 *
 * @param threadId - Thread ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 *
 * @example
 * ```tsx
 * function ChatWindow({ threadId }: { threadId: string }) {
 *   const { data: messages } = useThreadMessages(threadId);
 *
 *   // Messages will update in real-time as they're sent
 *   useRealtimeMessages(threadId);
 *
 *   return (
 *     <div className="chat-window">
 *       {messages?.map(msg => (
 *         <MessageBubble key={msg.id} message={msg} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useRealtimeMessages = (
  threadId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!threadId || !enabled) return;

    console.log(`[Realtime] Subscribing to messages for thread: ${threadId}`);

    const channel = supabase
      .channel(`thread-${threadId}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log('[Realtime] New message:', payload.new);

          // Invalidate thread messages to show new message
          queryClient.invalidateQueries({
            queryKey: messageKeys.threadMessages(threadId),
          });

          // Also invalidate thread details (for last_message_at update)
          queryClient.invalidateQueries({
            queryKey: messageKeys.threadDetails(threadId),
          });

          // Play notification sound or show toast
          // playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log('[Realtime] Message updated:', payload.new);

          // Update message in cache (e.g., status changed from sent to read)
          queryClient.invalidateQueries({
            queryKey: messageKeys.threadMessages(threadId),
          });
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Messages subscription status for thread ${threadId}:`, status);
      });

    return () => {
      console.log(`[Realtime] Unsubscribing from thread: ${threadId}`);
      supabase.removeChannel(channel);
    };
  }, [threadId, enabled, queryClient]);
};

/**
 * Subscribe to real-time thread list updates for a user
 *
 * @param userId - User ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 *
 * @example
 * ```tsx
 * function MessageInbox() {
 *   const { user } = useAuth();
 *   const { data: threads } = useUserThreads(user?.id!);
 *
 *   // Thread list updates in real-time (new threads, unread counts)
 *   useRealtimeThreads(user?.id!);
 *
 *   return <ThreadList threads={threads} />;
 * }
 * ```
 */
export const useRealtimeThreads = (
  userId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log(`[Realtime] Subscribing to threads for user: ${userId}`);

    const channel = supabase
      .channel(`user-${userId}-threads`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_threads',
        },
        (payload: RealtimePostgresChangesPayload<MessageThread>) => {
          console.log('[Realtime] Thread change:', payload.eventType);

          // Invalidate user's threads to show updates
          queryClient.invalidateQueries({
            queryKey: messageKeys.userThreads(userId),
          });

          // Invalidate unread count
          queryClient.invalidateQueries({
            queryKey: messageKeys.unreadCount(userId),
          });
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from user threads: ${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, queryClient]);
};

/**
 * Subscribe to real-time unread message count updates
 *
 * @param userId - User ID to monitor
 * @param enabled - Whether to enable the subscription (default: true)
 *
 * @example
 * ```tsx
 * function NotificationBadge() {
 *   const { user } = useAuth();
 *   const { data: unreadCount } = useUnreadCount(user?.id!);
 *
 *   // Unread count updates in real-time
 *   useRealtimeUnreadCount(user?.id!);
 *
 *   return unreadCount > 0 ? <Badge>{unreadCount}</Badge> : null;
 * }
 * ```
 */
export const useRealtimeUnreadCount = (
  userId: string,
  enabled = true
): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log(`[Realtime] Subscribing to unread count for user: ${userId}`);

    // Subscribe to participant updates (last_read_at changes)
    const channel = supabase
      .channel(`user-${userId}-unread`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_thread_participants',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log('[Realtime] Participant updated (read status changed)');

          // Invalidate unread count
          queryClient.invalidateQueries({
            queryKey: messageKeys.unreadCount(userId),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          // Only invalidate if this is not the user's own message
          if (payload.new && payload.new.sender_id !== userId) {
            console.log('[Realtime] New message from someone else, update unread count');

            queryClient.invalidateQueries({
              queryKey: messageKeys.unreadCount(userId),
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from unread count: ${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, queryClient]);
};
