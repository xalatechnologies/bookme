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

// Interface for booking objects stored in localStorage
interface IBooking {
  readonly id: string;
  readonly facility: string;
  readonly date: string;
  readonly time: string;
  readonly duration: string;
  readonly status: "confirmed" | "pending" | "rejected" | "cancelled";
  readonly location: string;
  readonly price: string;
  readonly description: string;
  readonly purpose?: string;
  readonly contactPerson?: string;
  readonly paymentStatus?: "paid" | "pending" | "failed";
  readonly facilityImage?: string;
  readonly rating?: number;
  readonly canRate?: boolean;
  readonly submittedAt?: string;
  readonly bookerId?: string;
  readonly bookerName?: string;
  readonly facilityId?: string;
  readonly facilityName?: string;
}

/**
 * Participant interface for messaging
 */
interface Participant {
  readonly id: string;
  readonly name: string;
  readonly type: 'tenant' | 'landlord';
}

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
  readonly deleteThread: (id: string) => void;
  readonly closeThread: (id: string) => void;
  readonly resolveThread: (id: string) => void;
  readonly reopenThread: (id: string) => void;
  readonly getThreadById: (id: string) => MessageThread | undefined;
  readonly getUserThreads: (userId: string) => readonly MessageThread[];
  readonly getLandlordThreads: () => readonly MessageThread[];
  readonly filterThreads: (filter: MessageThreadFilter) => readonly MessageThread[];
  readonly getUnreadThreads: (userId: string) => readonly MessageThread[];
  readonly getAvailableParticipants: (userId: string, userType: 'tenant' | 'landlord') => readonly Participant[];
  readonly getBookedFacilities: (userId: string, userType: 'tenant' | 'landlord') => readonly { id: string; name: string; bookingId: string }[];
  
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
        messages: [
          {
            id: "msg_1",
            threadId: "thread_1",
            senderId: "tenant-1",
            senderName: "Hamid Rahmani",
            senderAvatar: "/placeholder.svg",
            senderType: "tenant",
            recipientId: "landlord-1",
            recipientType: "landlord",
            content: "Hei! Jeg har et spørsmål om booking av Åssiden Tennisbane. Kan jeg booke den på lørdag kl 14:00?",
            status: "read",
            createdAt: "2024-01-15T10:30:00Z",
            readAt: "2024-01-15T10:35:00Z"
          },
          {
            id: "msg_2",
            threadId: "thread_1",
            senderId: "landlord-1",
            senderName: "Amin Ismail (Drammen Kommune)",
            senderAvatar: "/placeholder.svg",
            senderType: "landlord",
            recipientId: "tenant-1",
            recipientType: "tenant",
            content: "Hei Hamid! Ja, Åssiden Tennisbane er ledig på lørdag kl 14:00. Du kan booke den direkte i systemet. Trenger du hjelp med noe annet?",
            status: "read",
            createdAt: "2024-01-15T10:45:00Z",
            readAt: "2024-01-15T10:50:00Z"
          },
          {
            id: "msg_3",
            threadId: "thread_2",
            senderId: "tenant-1",
            senderName: "Hamid Rahmani",
            senderAvatar: "/placeholder.svg",
            senderType: "tenant",
            recipientId: "landlord-1",
            recipientType: "landlord",
            content: "Jeg har et problem med betalingen min for gymsalen. Beløpet ble trukket to ganger. Kan dere hjelpe meg?",
            status: "delivered",
            createdAt: "2024-01-15T14:20:00Z"
          }
        ],
        threads: [
          {
            id: "thread_1",
            subject: "Booking av Åssiden Tennisbane - lørdag",
            participants: [
              { id: "tenant-1", name: "Hamid Rahmani", type: "tenant" },
              { id: "landlord-1", name: "Amin Ismail (Drammen Kommune)", type: "landlord" }
            ],
            relatedBookingId: "booking_123",
            facilityId: "facility-1",
            facilityName: "Åssiden Tennisbane",
            status: "resolved",
            priority: "medium",
            messages: ["msg_1", "msg_2"],
            lastMessageAt: "2024-01-15T10:45:00Z",
            createdAt: "2024-01-15T10:30:00Z"
          },
          {
            id: "thread_2",
            subject: "Problem med betaling for gymsal",
            participants: [
              { id: "tenant-1", name: "Hamid Rahmani", type: "tenant" },
              { id: "landlord-1", name: "Amin Ismail (Drammen Kommune)", type: "landlord" }
            ],
            facilityId: "facility-2",
            facilityName: "Gymsal",
            status: "active",
            priority: "high",
            messages: ["msg_3"],
            lastMessageAt: "2024-01-15T14:20:00Z",
            createdAt: "2024-01-15T14:20:00Z"
          }
        ],
        notifications: [],
        templates: [
          {
            id: "template_1",
            name: "Velkommen til Booknor",
            category: "general",
            content: "Hei og velkommen til Booknor! Vi er glade for at du har valgt vår tjeneste. Hvis du har spørsmål, ikke nøl med å kontakte oss.",
            variables: ["user_name"],
            isActive: true,
            createdBy: "landlord-1",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          },
          {
            id: "template_2",
            name: "Booking bekreftet",
            category: "booking",
            content: "Din booking er bekreftet! Du har booket {facility_name} på {date} kl {time}. Booking ID: {booking_id}",
            variables: ["facility_name", "date", "time", "booking_id"],
            isActive: true,
            createdBy: "landlord-1",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z"
          }
        ],

        sendMessage: (messageData: CreateMessageData): string => {
          const id = generateMessageId();
          const now = new Date().toISOString();
          
          const newMessage: Message = {
            id,
            ...messageData,
            attachments: messageData.attachments?.map(att => ({
              id: `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: att.name,
              type: att.type,
              base64Data: att.base64Data,
              size: att.size
            })),
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
            senderAvatar: "/placeholder.svg",
            senderType: threadData.participants[0].type,
            recipientId: threadData.participants[1]?.id || threadData.participants[0].id,
            recipientType: threadData.participants[1]?.type || threadData.participants[0].type,
            content: threadData.initialMessage.content,
            attachments: threadData.initialMessage.attachments?.map(att => ({
              name: att.name,
              type: att.type,
              base64Data: att.base64Data,
              size: att.size
            }))
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

        deleteThread: (id: string): void => {
          set((state) => ({
            threads: state.threads.filter((thread) => thread.id !== id),
            messages: state.messages.filter((message) => message.threadId !== id)
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

        getLandlordThreads: (): readonly MessageThread[] => {
          return get().threads.filter((thread) =>
            thread.participants.some((participant) => participant.type === 'landlord')
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
            tenantToLandlord: messages.filter((message) => 
              message.senderType === 'tenant' && message.recipientType === 'landlord'
            ).length,
            landlordToTenant: messages.filter((message) => 
              message.senderType === 'landlord' && message.recipientType === 'tenant'
            ).length,
            tenantToTenant: messages.filter((message) => 
              message.senderType === 'tenant' && message.recipientType === 'tenant'
            ).length,
            landlordToLandlord: messages.filter((message) => 
              message.senderType === 'landlord' && message.recipientType === 'landlord'
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

        // Get available participants for creating new threads based on active bookings
        getAvailableParticipants: (userId: string, userType: 'tenant' | 'landlord'): readonly Participant[] => {
          if (userType === 'tenant') {
            // For tenants: get landlords from their active bookings (both pending and processed)
            const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]')
              .filter((booking: IBooking) => booking.bookerId === userId || booking.bookerName === 'Hamid Rahmani');
            
            const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]')
              .filter((booking: IBooking) => (booking.bookerId === userId || booking.bookerName === 'Hamid Rahmani') && booking.status === 'approved');
            
            const allBookings = [...pendingBookings, ...processedBookings];
            
            // If user has any bookings, they can message the landlord
            if (allBookings.length > 0) {
              return [{
                id: 'landlord-1',
                name: 'Amin Ismail (Drammen Kommune)',
                type: 'landlord' as const
              }];
            }
            
            // For testing: return landlord even if no bookings
            return [{
              id: 'landlord-1',
              name: 'Amin Ismail (Drammen Kommune)',
              type: 'landlord' as const
            }];
          } else {
            // For landlords: get tenants from their facility bookings (both pending and processed)
            const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
            const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]')
              .filter((booking: IBooking) => booking.status === 'approved');
            
            const allBookings = [...pendingBookings, ...processedBookings];
            const tenantNames = [...new Set(allBookings.map((booking: IBooking) => booking.bookerName))];
            
            if (tenantNames.length > 0) {
              return tenantNames.map((tenantName, index) => ({
                id: `tenant-${index + 1}`,
                name: tenantName,
                type: 'tenant' as const
              }));
            }
            
            // For testing: return test tenant even if no bookings
            return [{
              id: 'tenant-1',
              name: 'Hamid Rahmani',
              type: 'tenant' as const
            }];
          }
        },

        // Get booked facilities for a user
        getBookedFacilities: (userId: string, userType: 'tenant' | 'landlord'): readonly { id: string; name: string; bookingId: string }[] => {
          if (userType === 'tenant') {
            const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]')
              .filter((booking: IBooking) => booking.bookerId === userId || booking.bookerName === 'Hamid Rahmani');
            
            const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]')
              .filter((booking: IBooking) => (booking.bookerId === userId || booking.bookerName === 'Hamid Rahmani') && booking.status === 'approved');
            
            const allBookings = [...pendingBookings, ...processedBookings];
            
            // Get unique facilities from bookings
            const facilities = allBookings.map((booking: IBooking) => ({
              id: booking.facilityId || 'facility-1',
              name: booking.facilityName || 'Åssiden Tennisbane',
              bookingId: booking.id
            }));
            
            // Remove duplicates based on facilityId
            const uniqueFacilities = facilities.filter((facility, index, self) => 
              index === self.findIndex(f => f.id === facility.id)
            );
            
            // For testing: return test facility even if no bookings
            if (uniqueFacilities.length === 0) {
              return [{
                id: 'facility-1',
                name: 'Åssiden Tennisbane',
                bookingId: 'test-booking-1'
              }];
            }
            
            return uniqueFacilities;
          } else {
            // For landlords, get facilities from all bookings
            const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
            const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]')
              .filter((booking: IBooking) => booking.status === 'approved');
            
            const allBookings = [...pendingBookings, ...processedBookings];
            
            const facilities = allBookings.map((booking: IBooking) => ({
              id: booking.facilityId || 'facility-1',
              name: booking.facilityName || 'Åssiden Tennisbane',
              bookingId: booking.id
            }));
            
            const uniqueFacilities = facilities.filter((facility, index, self) => 
              index === self.findIndex(f => f.id === facility.id)
            );
            
            // For testing: return test facility even if no bookings
            if (uniqueFacilities.length === 0) {
              return [{
                id: 'facility-1',
                name: 'Åssiden Tennisbane',
                bookingId: 'test-booking-1'
              }];
            }
            
            return uniqueFacilities;
          }
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
          } catch (error) {
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

