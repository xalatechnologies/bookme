/**
 * Message Business Logic Service
 *
 * Contains all business logic related to message operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { Message, MessageThread } from "@/types/message";

export interface IMessageFilters {
  readonly searchTerm?: string;
  readonly senderId?: string;
  readonly recipientId?: string;
  readonly status?: readonly Message['status'][];
  readonly hasAttachments?: boolean;
  readonly dateRange?: { readonly from: Date; readonly to: Date };
}

export interface IMessageSortConfig {
  readonly sortBy: 'created_at' | 'sender' | 'status';
  readonly sortOrder: 'asc' | 'desc';
}

export interface IThreadGrouping {
  readonly [threadId: string]: readonly Message[];
}

/**
 * Filter messages based on search and filter criteria
 */
export const filterMessages = (
  messages: readonly Message[],
  filters: IMessageFilters
): readonly Message[] => {
  return messages.filter(message => {
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        message.content.toLowerCase().includes(searchLower) ||
        message.senderName.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Sender filter
    if (filters.senderId) {
      if (message.senderId !== filters.senderId) return false;
    }

    // Recipient filter
    if (filters.recipientId) {
      if (message.recipientId !== filters.recipientId) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(message.status)) return false;
    }

    // Attachments filter
    if (filters.hasAttachments !== undefined) {
      const hasAttachments = Boolean(message.attachments && message.attachments.length > 0);
      if (filters.hasAttachments !== hasAttachments) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const messageDate = new Date(message.createdAt);
      if (messageDate < filters.dateRange.from || messageDate > filters.dateRange.to) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Sort messages based on sort configuration
 */
export const sortMessages = (
  messages: readonly Message[],
  sortConfig: IMessageSortConfig
): readonly Message[] => {
  const sorted = [...messages].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'created_at':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'sender':
        comparison = a.senderName.localeCompare(b.senderName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Group messages by thread
 */
export const groupMessagesByThread = (
  messages: readonly Message[]
): IThreadGrouping => {
  return messages.reduce((grouped, message) => {
    const threadId = message.threadId;
    const existing = grouped[threadId] || [];

    return {
      ...grouped,
      [threadId]: [...existing, message],
    };
  }, {} as IThreadGrouping);
};

/**
 * Mark messages as read for a specific user
 */
export const markAsRead = (
  messages: readonly Message[],
  userId: string,
  threadId?: string
): readonly Message[] => {
  const now = new Date().toISOString();

  return messages.map(message => {
    // Only mark messages where the user is the recipient
    const isRecipient = message.recipientId === userId;
    const isInThread = !threadId || message.threadId === threadId;
    const isUnread = message.status !== 'read';

    if (isRecipient && isInThread && isUnread) {
      return {
        ...message,
        status: 'read' as const,
        readAt: now,
      };
    }

    return message;
  });
};

/**
 * Validate message data
 */
export const validateMessageData = (message: Partial<Message>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!message.content || message.content.trim().length === 0) {
    errors.push('Message content cannot be empty');
  }

  if (message.content && message.content.length > 10000) {
    errors.push('Message content exceeds maximum length of 10,000 characters');
  }

  if (!message.senderId) {
    errors.push('Sender ID is required');
  }

  if (!message.recipientId) {
    errors.push('Recipient ID is required');
  }

  if (!message.threadId) {
    errors.push('Thread ID is required');
  }

  // Validate attachments
  if (message.attachments && message.attachments.length > 0) {
    const totalSize = message.attachments.reduce((sum, att) => sum + att.size, 0);
    const maxSize = 25 * 1024 * 1024; // 25MB total

    if (totalSize > maxSize) {
      errors.push('Total attachment size exceeds 25MB limit');
    }

    if (message.attachments.length > 10) {
      errors.push('Cannot attach more than 10 files per message');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate if a message can be deleted
 */
export const canDeleteMessage = (
  message: Message,
  userId: string,
  userRole?: 'tenant' | 'landlord' | 'admin'
): { canDelete: boolean; reason?: string } => {
  // Business rule: Users can delete their own messages
  if (message.senderId === userId) {
    return { canDelete: true };
  }

  // Business rule: Admins can delete any message
  if (userRole === 'admin') {
    return { canDelete: true };
  }

  return {
    canDelete: false,
    reason: 'You can only delete your own messages.'
  };
};

/**
 * Validate if a message can be edited
 */
export const canEditMessage = (
  message: Message,
  userId: string,
  timeWindowMinutes: number = 15
): { canEdit: boolean; reason?: string } => {
  // Business rule: Users can only edit their own messages
  if (message.senderId !== userId) {
    return {
      canEdit: false,
      reason: 'You can only edit your own messages.'
    };
  }

  // Business rule: Cannot edit read messages
  if (message.status === 'read') {
    return {
      canEdit: false,
      reason: 'Cannot edit messages that have been read.'
    };
  }

  // Business rule: Can only edit within time window
  const messageTime = new Date(message.createdAt).getTime();
  const now = Date.now();
  const timeWindowMs = timeWindowMinutes * 60 * 1000;

  if (now - messageTime > timeWindowMs) {
    return {
      canEdit: false,
      reason: `Messages can only be edited within ${timeWindowMinutes} minutes of sending.`
    };
  }

  return { canEdit: true };
};

/**
 * Calculate unread count for a user
 */
export const calculateUnreadCount = (
  messages: readonly Message[],
  userId: string
): number => {
  return messages.filter(
    message => message.recipientId === userId && message.status !== 'read'
  ).length;
};

/**
 * Calculate unread count per thread
 */
export const calculateUnreadCountPerThread = (
  messages: readonly Message[],
  userId: string
): ReadonlyMap<string, number> => {
  const unreadByThread = new Map<string, number>();

  messages.forEach(message => {
    if (message.recipientId === userId && message.status !== 'read') {
      const currentCount = unreadByThread.get(message.threadId) || 0;
      unreadByThread.set(message.threadId, currentCount + 1);
    }
  });

  return unreadByThread;
};

/**
 * Get most recent message per thread
 */
export const getMostRecentMessagePerThread = (
  messages: readonly Message[]
): ReadonlyMap<string, Message> => {
  const mostRecentByThread = new Map<string, Message>();

  messages.forEach(message => {
    const existing = mostRecentByThread.get(message.threadId);

    if (!existing || new Date(message.createdAt) > new Date(existing.createdAt)) {
      mostRecentByThread.set(message.threadId, message);
    }
  });

  return mostRecentByThread;
};

/**
 * Calculate message statistics for a thread
 */
export const calculateThreadStats = (
  messages: readonly Message[],
  threadId: string
) => {
  const threadMessages = messages.filter(m => m.threadId === threadId);

  const totalMessages = threadMessages.length;
  const unreadMessages = threadMessages.filter(m => m.status !== 'read').length;
  const messagesWithAttachments = threadMessages.filter(
    m => m.attachments && m.attachments.length > 0
  ).length;

  const senders = new Set(threadMessages.map(m => m.senderId));
  const participantCount = senders.size;

  return {
    totalMessages,
    unreadMessages,
    messagesWithAttachments,
    participantCount,
  };
};

/**
 * Format message for display
 */
export const formatMessageForDisplay = (message: Message) => {
  return {
    ...message,
    formattedCreatedAt: new Date(message.createdAt).toLocaleString('no-NO'),
    formattedReadAt: message.readAt ? new Date(message.readAt).toLocaleString('no-NO') : undefined,
    isUnread: message.status !== 'read',
    hasAttachments: Boolean(message.attachments && message.attachments.length > 0),
    attachmentCount: message.attachments?.length || 0,
    contentPreview: message.content.length > 100
      ? message.content.substring(0, 100) + '...'
      : message.content,
  };
};
