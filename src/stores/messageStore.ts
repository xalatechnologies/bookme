"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  Message,
  MessageThread,
  CreateMessageData,
  CreateMessageThreadData,
  UpdateMessageThreadData,
  MessageSearchCriteria,
  MessageThreadFilter,
  MessageStatistics,
  MessageNotification,
  MessageTemplate
} from "@/types/message";

/**
 * Message store interface for managing messaging system state
 * 
 * Provides CRUD operations for messages, threads, and notifications
 * with localStorage persistence and full state management.
 */
interface MessageState {
  readonly messages: readonly Message[];
  readonly threads: readonly MessageThread[];
  readonly notifications: readonly MessageNotification[];
  readonly templates: readonly MessageTemplate[];
  
  // Message management
  readonly sendMessage: (message: CreateMessageData) => string;
  readonly markMessageAsRead: (messageId: string) => void;
  readonly markAllMessagesAsRead: (threadId: string) => void;
  readonly deleteMessage: (messageId: string) => void;
  readonly getMessageById: (id: string) => Message | undefined;
  readonly getMessagesByThread: (threadId: string) => readonly Message[];
  readonly searchMessages: (criteria: MessageSearchCriteria) => readonly Message[];
  
  // Thread management
  readonly createThread: (thread: CreateMessageThreadData) => string;
  readonly updateThread: (id: string, updates: UpdateMessageThreadData) => void;
  readonly closeThread: (id: string) => void;
  readonly resolveThread: (id: string) => void;
  readonly reopenThread: (id: string) => void;
  readonly getThreadById: (id: string) => MessageThread | undefined;
  readonly getUserThreads: (userId: string) => readonly MessageThread[];
  readonly getAdminThreads: () => readonly MessageThread[];
  readonly filterThreads: (filter: MessageThreadFilter) => readonly MessageThread[];
  readonly getUnreadThreads: (userId: string) => readonly MessageThread[];
  
  // Notification management
  readonly createNotification: (notification: Omit<MessageNotification, 'id' | 'createdAt'>) => string;
  readonly markNotificationAsRead: (notificationId: string) => void;
  readonly markAllNotificationsAsRead: (userId: string) => void;
  readonly deleteNotification: (notificationId: string) => void;
  readonly getUserNotifications: (userId: string) => readonly MessageNotification[];
  readonly getUnreadNotifications: (userId: string) => readonly MessageNotification[];
  
  // Template management
  readonly createTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  readonly updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  readonly deleteTemplate: (id: string) => void;
  readonly getTemplateById: (id: string) => MessageTemplate | undefined;
  readonly getTemplatesByCategory: (category: MessageTemplate['category']) => readonly MessageTemplate[];
  readonly getActiveTemplates: () => readonly MessageTemplate[];
  
  // Statistics and analytics
  readonly getMessageStatistics: (userId?: string) => MessageStatistics;
  readonly getThreadStatistics: (threadId: string) => {
    readonly messageCount: number;
    readonly participantCount: number;
    readonly averageResponseTime: number;
    readonly firstMessageAt: string;
    readonly lastMessageAt: string;
  };
  
  // Utility functions
  readonly clearAllData: () => void;
  readonly exportMessages: (threadId: string) => string;
  readonly importMessages: (data: string) => void;
}

/**
 * Generate unique ID for messages
 */
const generateMessageId = (): string => {
  return `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for threads
 */
const generateThreadId = (): string => {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for notifications
 */
const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for templates
 */
const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Message store implementation
 * 
 * Manages messaging system state with localStorage persistence and full CRUD operations
 */
export const useMessageStore = create<MessageState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        threads: [],
        notifications: [],
        templates: [],

        sendMessage: (messageData: CreateMessageData): string => {
          const id = generateMessageId();
          const now = new Date().toISOString();
          
          const newMessage: Message = {
            id,
            ...messageData,
            status: 'sent',
            createdAt: now
          };

          set((state) => ({
            messages: [...state.messages, newMessage],
            threads: state.threads.map((thread) =>
              thread.id === messageData.threadId
                ? {
                    ...thread,
                    lastMessageAt: now,
                    updatedAt: now
                  }
                : thread
            )
          }));

          // Create notification for recipient
          const notification: MessageNotification = {
            id: generateNotificationId(),
            userId: messageData.recipientId,
            threadId: messageData.threadId,
            messageId: id,
            type: 'new_message',
            title: 'Ny melding',
            content: messageData.content.length > 100 
              ? messageData.content.substring(0, 100) + '...'
              : messageData.content,
            isRead: false,
            createdAt: now
          };

          set((state) => ({
            notifications: [...state.notifications, notification]
          }));

          return id;
        },

        markMessageAsRead: (messageId: string): void => {
          const now = new Date().toISOString();
          
          set((state) => ({
            messages: state.messages.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    status: 'read',
                    readAt: now
                  }
                : message
            )
          }));
        },

        markAllMessagesAsRead: (threadId: string): void => {
          const now = new Date().toISOString();
          
          set((state) => ({
            messages: state.messages.map((message) =>
              message.threadId === threadId && message.status !== 'read'
                ? {
                    ...message,
                    status: 'read',
                    readAt: now
                  }
                : message
            )
          }));
        },

        deleteMessage: (messageId: string): void => {
          set((state) => ({
            messages: state.messages.filter((message) => message.id !== messageId)
          }));
        },

        getMessageById: (id: string): Message | undefined => {
          return get().messages.find((message) => message.id === id);
        },

        getMessagesByThread: (threadId: string): readonly Message[] => {
          return get().messages
            .filter((message) => message.threadId === threadId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        },

        searchMessages: (criteria: MessageSearchCriteria): readonly Message[] => {
          let results = get().messages;

          if (criteria.query) {
            const query = criteria.query.toLowerCase();
            results = results.filter((message) =>
              message.content.toLowerCase().includes(query) ||
              message.senderName.toLowerCase().includes(query)
            );
          }

          if (criteria.threadId) {
            results = results.filter((message) => message.threadId === criteria.threadId);
          }

          if (criteria.senderId) {
            results = results.filter((message) => message.senderId === criteria.senderId);
          }

          if (criteria.recipientId) {
            results = results.filter((message) => message.recipientId === criteria.recipientId);
          }

          if (criteria.status) {
            results = results.filter((message) => message.status === criteria.status);
          }

          if (criteria.dateFrom) {
            results = results.filter((message) => new Date(message.createdAt) >= criteria.dateFrom!);
          }

          if (criteria.dateTo) {
            results = results.filter((message) => new Date(message.createdAt) <= criteria.dateTo!);
          }

          if (criteria.hasAttachments) {
            results = results.filter((message) => message.attachments && message.attachments.length > 0);
          }

          return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },

        createThread: (threadData: CreateMessageThreadData): string => {
          const id = generateThreadId();
          const now = new Date().toISOString();
          
          const newThread: MessageThread = {
            id,
            ...threadData,
            status: 'active',
            messages: [],
            lastMessageAt: now,
            createdAt: now
          };

          // Create initial message
          const initialMessageId = get().sendMessage({
            threadId: id,
            senderId: threadData.participants[0].id,
            senderName: threadData.participants[0].name,
            senderType: threadData.participants[0].type,
            recipientId: threadData.participants[1]?.id || threadData.participants[0].id,
            recipientType: threadData.participants[1]?.type || threadData.participants[0].type,
            content: threadData.initialMessage.content,
            attachments: threadData.initialMessage.attachments
          });

          set((state) => ({
            threads: [...state.threads, {
              ...newThread,
              messages: [initialMessageId]
            }]
          }));

          return id;
        },

        updateThread: (id: string, updates: UpdateMessageThreadData): void => {
          set((state) => ({
            threads: state.threads.map((thread) =>
              thread.id === id
                ? {
                    ...thread,
                    ...updates,
                    updatedAt: new Date().toISOString()
                  }
                : thread
            )
          }));
        },

        closeThread: (id: string): void => {
          set((state) => ({
            threads: state.threads.map((thread) =>
              thread.id === id
                ? {
                    ...thread,
                    status: 'closed',
                    updatedAt: new Date().toISOString()
                  }
                : thread
            )
          }));
        },

        resolveThread: (id: string): void => {
          set((state) => ({
            threads: state.threads.map((thread) =>
              thread.id === id
                ? {
                    ...thread,
                    status: 'resolved',
                    updatedAt: new Date().toISOString()
                  }
                : thread
            )
          }));
        },

        reopenThread: (id: string): void => {
          set((state) => ({
            threads: state.threads.map((thread) =>
              thread.id === id
                ? {
                    ...thread,
                    status: 'active',
                    updatedAt: new Date().toISOString()
                  }
                : thread
            )
          }));
        },

        getThreadById: (id: string): MessageThread | undefined => {
          return get().threads.find((thread) => thread.id === id);
        },

        getUserThreads: (userId: string): readonly MessageThread[] => {
          return get().threads.filter((thread) =>
            thread.participants.some((participant) => participant.id === userId)
          );
        },

        getAdminThreads: (): readonly MessageThread[] => {
          return get().threads.filter((thread) =>
            thread.participants.some((participant) => participant.type === 'admin')
          );
        },

        filterThreads: (filter: MessageThreadFilter): readonly MessageThread[] => {
          let results = get().threads;

          if (filter.status) {
            results = results.filter((thread) => thread.status === filter.status);
          }

          if (filter.priority) {
            results = results.filter((thread) => thread.priority === filter.priority);
          }

          if (filter.participantId) {
            results = results.filter((thread) =>
              thread.participants.some((participant) => participant.id === filter.participantId)
            );
          }

          if (filter.relatedBookingId) {
            results = results.filter((thread) => thread.relatedBookingId === filter.relatedBookingId);
          }

          if (filter.dateFrom) {
            results = results.filter((thread) => new Date(thread.createdAt) >= filter.dateFrom!);
          }

          if (filter.dateTo) {
            results = results.filter((thread) => new Date(thread.createdAt) <= filter.dateTo!);
          }

          if (filter.hasUnreadMessages) {
            results = results.filter((thread) => {
              const messages = get().messages.filter((message) => message.threadId === thread.id);
              return messages.some((message) => message.status !== 'read');
            });
          }

          return results.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        },

        getUnreadThreads: (userId: string): readonly MessageThread[] => {
          return get().threads.filter((thread) => {
            const messages = get().messages.filter((message) => 
              message.threadId === thread.id && 
              message.recipientId === userId && 
              message.status !== 'read'
            );
            return messages.length > 0;
          });
        },

        createNotification: (notificationData: Omit<MessageNotification, 'id' | 'createdAt'>): string => {
          const id = generateNotificationId();
          const now = new Date().toISOString();
          
          const newNotification: MessageNotification = {
            id,
            ...notificationData,
            createdAt: now
          };

          set((state) => ({
            notifications: [...state.notifications, newNotification]
          }));

          return id;
        },

        markNotificationAsRead: (notificationId: string): void => {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString()
                  }
                : notification
            )
          }));
        },

        markAllNotificationsAsRead: (userId: string): void => {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.userId === userId && !notification.isRead
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString()
                  }
                : notification
            )
          }));
        },

        deleteNotification: (notificationId: string): void => {
          set((state) => ({
            notifications: state.notifications.filter((notification) => notification.id !== notificationId)
          }));
        },

        getUserNotifications: (userId: string): readonly MessageNotification[] => {
          return get().notifications
            .filter((notification) => notification.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },

        getUnreadNotifications: (userId: string): readonly MessageNotification[] => {
          return get().notifications
            .filter((notification) => notification.userId === userId && !notification.isRead)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },

        createTemplate: (templateData: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): string => {
          const id = generateTemplateId();
          const now = new Date().toISOString();
          
          const newTemplate: MessageTemplate = {
            id,
            ...templateData,
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            templates: [...state.templates, newTemplate]
          }));

          return id;
        },

        updateTemplate: (id: string, updates: Partial<MessageTemplate>): void => {
          set((state) => ({
            templates: state.templates.map((template) =>
              template.id === id
                ? {
                    ...template,
                    ...updates,
                    updatedAt: new Date().toISOString()
                  }
                : template
            )
          }));
        },

        deleteTemplate: (id: string): void => {
          set((state) => ({
            templates: state.templates.filter((template) => template.id !== id)
          }));
        },

        getTemplateById: (id: string): MessageTemplate | undefined => {
          return get().templates.find((template) => template.id === id);
        },

        getTemplatesByCategory: (category: MessageTemplate['category']): readonly MessageTemplate[] => {
          return get().templates.filter((template) => template.category === category);
        },

        getActiveTemplates: (): readonly MessageTemplate[] => {
          return get().templates.filter((template) => template.isActive);
        },

        getMessageStatistics: (userId?: string): MessageStatistics => {
          const threads = userId ? get().getUserThreads(userId) : get().threads;
          const messages = userId 
            ? get().messages.filter((message) => 
                threads.some((thread) => thread.id === message.threadId)
              )
            : get().messages;

          const activeThreads = threads.filter((thread) => thread.status === 'active').length;
          const resolvedThreads = threads.filter((thread) => thread.status === 'resolved').length;
          const closedThreads = threads.filter((thread) => thread.status === 'closed').length;
          const unreadMessages = messages.filter((message) => message.status !== 'read').length;

          const threadsByPriority = {
            low: threads.filter((thread) => thread.priority === 'low').length,
            medium: threads.filter((thread) => thread.priority === 'medium').length,
            high: threads.filter((thread) => thread.priority === 'high').length
          };

          const messagesByType = {
            userToAdmin: messages.filter((message) => 
              message.senderType === 'user' && message.recipientType === 'admin'
            ).length,
            adminToUser: messages.filter((message) => 
              message.senderType === 'admin' && message.recipientType === 'user'
            ).length,
            userToUser: messages.filter((message) => 
              message.senderType === 'user' && message.recipientType === 'user'
            ).length,
            adminToAdmin: messages.filter((message) => 
              message.senderType === 'admin' && message.recipientType === 'admin'
            ).length
          };

          return {
            totalThreads: threads.length,
            activeThreads,
            resolvedThreads,
            closedThreads,
            unreadMessages,
            totalMessages: messages.length,
            averageResponseTime: 0, // This would be calculated based on actual response times
            threadsByPriority,
            messagesByType
          };
        },

        getThreadStatistics: (threadId: string): {
          readonly messageCount: number;
          readonly participantCount: number;
          readonly averageResponseTime: number;
          readonly firstMessageAt: string;
          readonly lastMessageAt: string;
        } => {
          const thread = get().getThreadById(threadId);
          const messages = get().getMessagesByThread(threadId);

          if (!thread || messages.length === 0) {
            return {
              messageCount: 0,
              participantCount: 0,
              averageResponseTime: 0,
              firstMessageAt: '',
              lastMessageAt: ''
            };
          }

          return {
            messageCount: messages.length,
            participantCount: thread.participants.length,
            averageResponseTime: 0, // This would be calculated based on actual response times
            firstMessageAt: messages[0]?.createdAt || '',
            lastMessageAt: messages[messages.length - 1]?.createdAt || ''
          };
        },

        clearAllData: (): void => {
          set({
            messages: [],
            threads: [],
            notifications: [],
            templates: []
          });
        },

        exportMessages: (threadId: string): string => {
          const thread = get().getThreadById(threadId);
          const messages = get().getMessagesByThread(threadId);
          
          const exportData = {
            thread,
            messages,
            exportedAt: new Date().toISOString()
          };

          return JSON.stringify(exportData, null, 2);
        },

        importMessages: (data: string): void => {
          try {
            const importData = JSON.parse(data);
            // This would validate and import the data
            console.log('Importing messages:', importData);
          } catch (error) {
            console.error('Error importing messages:', error);
          }
        }
      }),
      {
        name: "message-store",
        version: 1
      }
    ),
    {
      name: "message-store"
    }
  )
);

