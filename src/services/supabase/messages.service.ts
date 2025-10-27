/**
 * Messages Service
 *
 * Handles messaging operations with Supabase backend.
 * Thread-based messaging system with file attachments and real-time updates.
 *
 * Features:
 * - Thread-based conversations
 * - File attachments via Supabase Storage
 * - Read/delivery status tracking
 * - Message templates
 * - Real-time message updates
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases
type MessageThread = Database['public']['Tables']['message_threads']['Row'];
type MessageThreadInsert = Database['public']['Tables']['message_threads']['Insert'];
type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type ThreadParticipant = Database['public']['Tables']['message_thread_participants']['Row'];
type MessageAttachment = Database['public']['Tables']['message_attachments']['Row'];
type MessageTemplate = Database['public']['Tables']['message_templates']['Row'];

/**
 * Thread with participants and last message
 */
export interface ThreadWithDetails extends MessageThread {
  readonly participants: readonly ThreadParticipant[];
  readonly lastMessage?: Message;
}

/**
 * Message with sender info and attachments
 */
export interface MessageWithDetails extends Message {
  readonly attachments?: readonly MessageAttachment[];
}

/**
 * Query keys
 */
export const messageKeys = {
  all: ['messages'] as const,
  threads: () => [...messageKeys.all, 'threads'] as const,
  userThreads: (userId: string) => [...messageKeys.threads(), 'user', userId] as const,
  threadDetails: (threadId: string) => [...messageKeys.threads(), threadId] as const,
  threadMessages: (threadId: string) => [...messageKeys.all, 'thread', threadId] as const,
  templates: (orgId: string) => [...messageKeys.all, 'templates', orgId] as const,
  unreadCount: (userId: string) => [...messageKeys.all, 'unread', userId] as const,
};

// ============================================================================
// Service Functions
// ============================================================================

export const messagesService = {
  /**
   * Fetch user's message threads
   */
  async getUserThreads(userId: string): Promise<ThreadWithDetails[]> {
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        participants:message_thread_participants (*)
      `)
      .eq('participants.user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data as ThreadWithDetails[];
  },

  /**
   * Fetch a single thread
   */
  async getThreadById(threadId: string): Promise<ThreadWithDetails> {
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        participants:message_thread_participants (*)
      `)
      .eq('id', threadId)
      .single();

    if (error) throw error;
    return data as ThreadWithDetails;
  },

  /**
   * Create a new message thread
   */
  async createThread(
    thread: MessageThreadInsert,
    participantIds: string[],
    initialMessage?: string
  ): Promise<MessageThread> {
    // Use RPC function from backend
    const { data, error } = await supabase.rpc('create_message_thread', {
      p_org_id: thread.org_id,
      p_subject: thread.subject,
      p_participant_ids: participantIds,
      p_initial_message: initialMessage || null,
      p_related_booking_id: thread.related_booking_id || null,
      p_related_facility_id: thread.related_facility_id || null,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get messages for a thread
   */
  async getThreadMessages(threadId: string): Promise<MessageWithDetails[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        attachments:message_attachments (*)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as MessageWithDetails[];
  },

  /**
   * Send a message
   */
  async sendMessage(message: MessageInsert): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark messages as read
   */
  async markAsRead(threadId: string, userId: string): Promise<void> {
    // Update last_read_at for participant
    const { error } = await supabase
      .from('message_thread_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_message_count', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data as number;
  },

  /**
   * Upload message attachment
   */
  async uploadAttachment(
    threadId: string,
    messageId: string,
    file: File
  ): Promise<MessageAttachment> {
    // Upload to Supabase Storage
    const fileName = `${threadId}/${messageId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create attachment record
    const { data, error } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: uploadData.path,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get message templates for organization
   */
  async getTemplates(orgId: string): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Search threads by subject or content
   */
  async searchThreads(userId: string, query: string): Promise<ThreadWithDetails[]> {
    const { data, error } = await supabase
      .from('message_threads')
      .select(`
        *,
        participants:message_thread_participants!inner (*)
      `)
      .eq('participants.user_id', userId)
      .ilike('subject', `%${query}%`)
      .order('last_message_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as ThreadWithDetails[];
  },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch user's message threads
 *
 * @example
 * ```tsx
 * function MessageInbox() {
 *   const { user } = useAuth();
 *   const { data: threads, isLoading } = useUserThreads(user?.id!);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       {threads?.map(thread => (
 *         <ThreadListItem key={thread.id} thread={thread} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserThreads = (
  userId: string,
  enabled = true
): UseQueryResult<ThreadWithDetails[], Error> => {
  return useQuery({
    queryKey: messageKeys.userThreads(userId),
    queryFn: () => messagesService.getUserThreads(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds (messages change frequently)
  });
};

/**
 * Hook to fetch a single thread
 */
export const useThread = (
  threadId: string,
  enabled = true
): UseQueryResult<ThreadWithDetails, Error> => {
  return useQuery({
    queryKey: messageKeys.threadDetails(threadId),
    queryFn: () => messagesService.getThreadById(threadId),
    enabled: !!threadId && enabled,
  });
};

/**
 * Hook to fetch thread messages
 *
 * @example
 * ```tsx
 * function MessageThread({ threadId }: { threadId: string }) {
 *   const { data: messages } = useThreadMessages(threadId);
 *
 *   return (
 *     <div>
 *       {messages?.map(msg => (
 *         <MessageBubble key={msg.id} message={msg} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useThreadMessages = (
  threadId: string,
  enabled = true
): UseQueryResult<MessageWithDetails[], Error> => {
  return useQuery({
    queryKey: messageKeys.threadMessages(threadId),
    queryFn: () => messagesService.getThreadMessages(threadId),
    enabled: !!threadId && enabled,
    staleTime: 10 * 1000, // 10 seconds
  });
};

/**
 * Hook to fetch unread message count
 */
export const useUnreadCount = (
  userId: string,
  enabled = true
): UseQueryResult<number, Error> => {
  return useQuery({
    queryKey: messageKeys.unreadCount(userId),
    queryFn: () => messagesService.getUnreadCount(userId),
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to fetch message templates
 */
export const useMessageTemplates = (
  orgId: string,
  enabled = true
): UseQueryResult<MessageTemplate[], Error> => {
  return useQuery({
    queryKey: messageKeys.templates(orgId),
    queryFn: () => messagesService.getTemplates(orgId),
    enabled: !!orgId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a message thread
 *
 * @example
 * ```tsx
 * function NewMessageButton() {
 *   const { currentOrgId } = useAuth();
 *   const createThread = useCreateThread();
 *
 *   const handleCreate = (participantIds: string[], subject: string) => {
 *     createThread.mutate({
 *       thread: { org_id: currentOrgId, subject },
 *       participantIds,
 *       initialMessage: 'Hello!'
 *     }, {
 *       onSuccess: (thread) => {
 *         navigate(`/messages/${thread.id}`);
 *       }
 *     });
 *   };
 *
 *   return <NewMessageDialog onSubmit={handleCreate} />;
 * }
 * ```
 */
export const useCreateThread = (): UseMutationResult<
  MessageThread,
  Error,
  { thread: MessageThreadInsert; participantIds: string[]; initialMessage?: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ thread, participantIds, initialMessage }) =>
      messagesService.createThread(thread, participantIds, initialMessage),
    onSuccess: () => {
      // Invalidate all thread queries
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
};

/**
 * Hook to send a message
 *
 * @example
 * ```tsx
 * function MessageComposer({ threadId }: { threadId: string }) {
 *   const { user } = useAuth();
 *   const sendMessage = useSendMessage();
 *
 *   const handleSend = (content: string) => {
 *     sendMessage.mutate({
 *       thread_id: threadId,
 *       sender_id: user!.id,
 *       content
 *     });
 *   };
 *
 *   return <MessageInput onSend={handleSend} />;
 * }
 * ```
 */
export const useSendMessage = (): UseMutationResult<Message, Error, MessageInsert> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messagesService.sendMessage,
    onSuccess: (newMessage) => {
      // Invalidate thread messages and threads list
      queryClient.invalidateQueries({
        queryKey: messageKeys.threadMessages(newMessage.thread_id),
      });
      queryClient.invalidateQueries({ queryKey: messageKeys.threads() });
    },
  });
};

/**
 * Hook to mark messages as read
 */
export const useMarkAsRead = (): UseMutationResult<
  void,
  Error,
  { threadId: string; userId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, userId }) => messagesService.markAsRead(threadId, userId),
    onSuccess: (_, { userId }) => {
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount(userId) });
    },
  });
};

/**
 * Hook to upload message attachment
 */
export const useUploadAttachment = (): UseMutationResult<
  MessageAttachment,
  Error,
  { threadId: string; messageId: string; file: File }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, messageId, file }) =>
      messagesService.uploadAttachment(threadId, messageId, file),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread messages
      queryClient.invalidateQueries({ queryKey: messageKeys.threadMessages(threadId) });
    },
  });
};
