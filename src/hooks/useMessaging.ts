import { useState, useCallback, useMemo } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import type { MessageThread, Message } from '@/types/message';

/**
 * Message status filter options
 */
export type MessageFilterStatus = 'all' | 'unread' | 'active' | 'resolved' | 'archived';

/**
 * Custom hook for messaging functionality
 *
 * @param userId - Current user ID
 * @param userType - User type (tenant or landlord)
 * @returns Messaging state and actions
 */
export const useMessaging = (userId: string, userType: 'tenant' | 'landlord' = 'tenant') => {
  const {
    getUserThreads,
    getMessagesByThread,
    sendMessage,
    markAllMessagesAsRead,
    updateThread,
    deleteThread,
    getAvailableParticipants
  } = useMessageStore();

  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Get all threads for the current user
   */
  const threads = useMemo(() => {
    return getUserThreads(userId);
  }, [userId, getUserThreads]);

  /**
   * Filter threads based on status and search query
   */
  const filteredThreads = useMemo(() => {
    let filtered = [...threads];

    // Apply status filter
    switch (statusFilter) {
      case 'unread':
        filtered = filtered.filter(thread => {
          const messages = getMessagesByThread(thread.id);
          return messages.some(m => m.recipientId === userId && m.status !== 'read');
        });
        break;
      case 'active':
        filtered = filtered.filter(thread => thread.status === 'active');
        break;
      case 'resolved':
        filtered = filtered.filter(thread => thread.status === 'resolved');
        break;
      case 'archived':
        filtered = filtered.filter(thread => thread.status === 'closed');
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(thread =>
        thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.participants.some(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort by last message date
    return filtered.sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [threads, statusFilter, searchQuery, userId, getMessagesByThread]);

  /**
   * Get unread count for a specific thread
   */
  const getUnreadCount = useCallback((threadId: string): number => {
    const messages = getMessagesByThread(threadId);
    return messages.filter(m => m.recipientId === userId && m.status !== 'read').length;
  }, [userId, getMessagesByThread]);

  /**
   * Get total unread count across all threads
   */
  const totalUnreadCount = useMemo(() => {
    return threads.reduce((count, thread) => {
      return count + getUnreadCount(thread.id);
    }, 0);
  }, [threads, getUnreadCount]);

  /**
   * Get last message content for a thread
   */
  const getLastMessage = useCallback((threadId: string): string => {
    const messages = getMessagesByThread(threadId);
    const lastMessage = messages[messages.length - 1];
    return lastMessage ? lastMessage.content : '';
  }, [getMessagesByThread]);

  /**
   * Send a new message to the selected thread
   */
  const sendMessageToThread = useCallback(async (
    threadId: string,
    content: string,
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      base64Data: string;
      size: number;
    }>
  ): Promise<void> => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    const recipient = thread.participants.find(p => p.id !== userId);
    if (!recipient) return;

    sendMessage({
      threadId,
      senderId: userId,
      senderName: userType === 'tenant' ? 'Current User' : 'Admin',
      senderAvatar: '',
      senderType: userType,
      recipientId: recipient.id,
      recipientType: recipient.type,
      content,
      attachments
    });
  }, [threads, userId, userType, sendMessage]);

  /**
   * Select a thread and mark messages as read
   */
  const selectThread = useCallback((threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setSelectedThread(thread);
      markAllMessagesAsRead(threadId);
    }
  }, [threads, markAllMessagesAsRead]);

  /**
   * Mark a thread as resolved
   */
  const markThreadAsResolved = useCallback((threadId: string) => {
    updateThread(threadId, { status: 'resolved' });
  }, [updateThread]);

  /**
   * Mark a thread as closed
   */
  const closeThread = useCallback((threadId: string) => {
    updateThread(threadId, { status: 'closed' });
  }, [updateThread]);

  /**
   * Delete a thread
   */
  const removeThread = useCallback((threadId: string) => {
    deleteThread(threadId);
    if (selectedThread?.id === threadId) {
      setSelectedThread(null);
    }
  }, [deleteThread, selectedThread]);

  /**
   * Get available participants for creating new threads
   */
  const availableParticipants = useMemo(() => {
    return getAvailableParticipants(userId, userType);
  }, [userId, userType, getAvailableParticipants]);

  return {
    // State
    threads,
    filteredThreads,
    selectedThread,
    statusFilter,
    searchQuery,
    totalUnreadCount,
    availableParticipants,

    // Actions
    setStatusFilter,
    setSearchQuery,
    selectThread,
    setSelectedThread,
    sendMessageToThread,
    getUnreadCount,
    getLastMessage,
    markThreadAsResolved,
    closeThread,
    removeThread
  };
};
