/**
 * Message Management Hook
 *
 * Connects UI components to message business logic and data services.
 * Provides a clean interface for message management operations including
 * thread grouping, read/unread tracking, message filtering, and actions.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import { useMessageUIStore, type TMessageView, type TMessageSortBy } from '@/stores/messageUIStore';
import {
  filterMessages,
  sortMessages,
  groupMessagesByThread,
  markAsRead,
  validateMessageData,
  canDeleteMessage,
  canEditMessage,
  calculateUnreadCount,
  calculateUnreadCountPerThread,
  getMostRecentMessagePerThread,
  calculateThreadStats,
  formatMessageForDisplay,
  type IMessageFilters,
  type IMessageSortConfig,
  type IThreadGrouping,
} from '@/services/business/message.business.service';
import type { Message } from '@/types/message';

export interface IUseMessageManagementReturn {
  // Data (would be fetched from API in real implementation)
  readonly messages: readonly Message[];
  readonly filteredMessages: readonly Message[];
  readonly threadedMessages: IThreadGrouping;
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly unreadCount: number;
  readonly unreadCountPerThread: ReadonlyMap<string, number>;
  readonly mostRecentPerThread: ReadonlyMap<string, Message>;

  // UI State
  readonly view: TMessageView;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly unreadFilter: boolean | null;
  readonly senderFilter: readonly string[];
  readonly dateRange: { readonly start: string | null; readonly end: string | null };
  readonly sortBy: TMessageSortBy;
  readonly sortOrder: string;
  readonly selectedMessageIds: readonly string[];
  readonly activeThreadId: string | null;
  readonly modals: {
    readonly compose: boolean;
    readonly reply: boolean;
    readonly delete: boolean;
  };
  readonly activeMessageId: string | null;

  // UI Actions
  readonly setView: (view: TMessageView) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly setUnreadFilter: (unread: boolean | null) => void;
  readonly toggleSenderFilter: (sender: string) => void;
  readonly setDateRange: (range: { start: string | null; end: string | null }) => void;
  readonly toggleSort: (sortBy: TMessageSortBy) => void;
  readonly toggleMessageSelection: (id: string) => void;
  readonly selectAllMessages: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;
  readonly setActiveThreadId: (id: string | null) => void;
  readonly openModal: (modal: 'compose' | 'reply' | 'delete', messageId?: string) => void;
  readonly closeModal: (modal: 'compose' | 'reply' | 'delete') => void;
  readonly closeAllModals: () => void;
  readonly setActiveMessageId: (id: string | null) => void;

  // Business Operations
  readonly markMessagesAsRead: (userId: string, threadId?: string) => readonly Message[];
  readonly validateMessageData: (message: Partial<Message>) => { isValid: boolean; errors: string[] };
  readonly canDeleteMessage: (
    message: Message,
    userId: string,
    userRole?: 'tenant' | 'landlord' | 'admin'
  ) => { canDelete: boolean; reason?: string };
  readonly canEditMessage: (
    message: Message,
    userId: string,
    timeWindowMinutes?: number
  ) => { canEdit: boolean; reason?: string };
  readonly calculateThreadStats: (threadId: string) => ReturnType<typeof calculateThreadStats>;
  readonly formatMessageForDisplay: (message: Message) => ReturnType<typeof formatMessageForDisplay>;
}

/**
 * Hook for managing messages with business logic separation
 *
 * Provides comprehensive message management functionality including:
 * - Data fetching and caching (would use React Query in real implementation)
 * - UI state management via Zustand store
 * - Business logic validation and operations
 * - Thread grouping and organization
 * - Read/unread tracking
 * - Message filtering and search
 * - Sorting by multiple criteria
 * - Permission checks for edit/delete
 *
 * @returns Complete message management interface
 *
 * @example
 * ```tsx
 * function MessageInbox() {
 *   const {
 *     filteredMessages,
 *     unreadCount,
 *     searchTerm,
 *     setSearchTerm,
 *     markMessagesAsRead,
 *     canDeleteMessage,
 *     openModal,
 *   } = useMessageManagement(userId);
 *
 *   const handleMarkRead = (threadId: string) => {
 *     const updatedMessages = markMessagesAsRead(userId, threadId);
 *     console.log('Marked', updatedMessages.length, 'messages as read');
 *   };
 *
 *   const handleDelete = (message: Message) => {
 *     const validation = canDeleteMessage(message, userId);
 *     if (!validation.canDelete) {
 *       toast.error(validation.reason);
 *       return;
 *     }
 *     openModal('delete', message.id);
 *   };
 *
 *   return (
 *     <div>
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <Badge>Unread: {unreadCount}</Badge>
 *       <MessageList messages={filteredMessages} onDelete={handleDelete} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useMessageManagement = (
  messages: readonly Message[] = [],
  currentUserId: string = ''
): IUseMessageManagementReturn => {
  // In a real implementation, data would be fetched here
  // const { data: messages = [], isLoading, error } = useMessages(userId);
  const isLoading = false;
  const error = null;

  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    showFilters,
    searchTerm,
    unreadFilter,
    senderFilter,
    dateRange,
    sortBy,
    sortOrder,
    selectedMessageIds,
    activeThreadId,
    modals,
    activeMessageId,
    setView,
    toggleFilters,
    setSearchTerm,
    setUnreadFilter,
    toggleSenderFilter,
    setDateRange,
    toggleSort,
    toggleMessageSelection,
    selectAllMessages: selectAll,
    clearSelection,
    resetFilters,
    setActiveThreadId,
    openModal,
    closeModal,
    closeAllModals,
    setActiveMessageId,
  } = useMessageUIStore();

  // Business logic layer - filtering and sorting
  const filteredMessages = useMemo(() => {
    const filters: IMessageFilters = {
      searchTerm,
      senderId: senderFilter.length > 0 ? senderFilter[0] : undefined,
      dateRange: dateRange.start && dateRange.end
        ? {
            from: new Date(dateRange.start),
            to: new Date(dateRange.end),
          }
        : undefined,
    };

    const filtered = filterMessages(messages, filters);

    const sortConfig: IMessageSortConfig = {
      sortBy: sortBy === 'date'
        ? 'created_at'
        : sortBy === 'subject' || sortBy === 'unread'
        ? 'sender' // Map unsupported fields to supported ones
        : 'sender',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return sortMessages(filtered, sortConfig);
  }, [messages, searchTerm, senderFilter, dateRange, sortBy, sortOrder]);

  // Thread grouping
  const threadedMessages = useMemo(() => {
    return groupMessagesByThread(filteredMessages);
  }, [filteredMessages]);

  // Statistics
  const unreadCount = useMemo(
    () => calculateUnreadCount(messages, currentUserId),
    [messages, currentUserId]
  );

  const unreadCountPerThread = useMemo(
    () => calculateUnreadCountPerThread(messages, currentUserId),
    [messages, currentUserId]
  );

  const mostRecentPerThread = useMemo(
    () => getMostRecentMessagePerThread(messages),
    [messages]
  );

  // Business operations - wrapped with useCallback for stability
  const markMessagesAsRead = useCallback(
    (userId: string, threadId?: string): readonly Message[] => {
      return markAsRead(messages, userId, threadId);
    },
    [messages]
  );

  const canDeleteMessageCallback = useCallback(
    (
      message: Message,
      userId: string,
      userRole?: 'tenant' | 'landlord' | 'admin'
    ): { canDelete: boolean; reason?: string } => {
      return canDeleteMessage(message, userId, userRole);
    },
    []
  );

  const canEditMessageCallback = useCallback(
    (
      message: Message,
      userId: string,
      timeWindowMinutes: number = 15
    ): { canEdit: boolean; reason?: string } => {
      return canEditMessage(message, userId, timeWindowMinutes);
    },
    []
  );

  const calculateThreadStatsCallback = useCallback(
    (threadId: string): ReturnType<typeof calculateThreadStats> => {
      return calculateThreadStats(messages, threadId);
    },
    [messages]
  );

  const formatMessageForDisplayCallback = useCallback(
    (message: Message): ReturnType<typeof formatMessageForDisplay> => {
      return formatMessageForDisplay(message);
    },
    []
  );

  const selectAllMessages = useCallback(() => {
    selectAll(filteredMessages.map((m) => m.id));
  }, [filteredMessages, selectAll]);

  return {
    // Data
    messages,
    filteredMessages,
    threadedMessages,
    isLoading,
    error,

    // Statistics
    unreadCount,
    unreadCountPerThread,
    mostRecentPerThread,

    // UI State
    view,
    showFilters,
    searchTerm,
    unreadFilter,
    senderFilter,
    dateRange,
    sortBy,
    sortOrder,
    selectedMessageIds,
    activeThreadId,
    modals,
    activeMessageId,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    setUnreadFilter,
    toggleSenderFilter,
    setDateRange,
    toggleSort,
    toggleMessageSelection,
    selectAllMessages,
    clearSelection,
    resetFilters,
    setActiveThreadId,
    openModal,
    closeModal,
    closeAllModals,
    setActiveMessageId,

    // Business Operations
    markMessagesAsRead,
    validateMessageData,
    canDeleteMessage: canDeleteMessageCallback,
    canEditMessage: canEditMessageCallback,
    calculateThreadStats: calculateThreadStatsCallback,
    formatMessageForDisplay: formatMessageForDisplayCallback,
  };
};
