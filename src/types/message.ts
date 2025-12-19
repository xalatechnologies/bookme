/**
 * Message interface for the messaging system
 * 
 * Supports direct messaging between users and admins with attachments,
 * status tracking, and thread management.
 */
export interface Message {
  readonly id: string;
  readonly threadId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly senderAvatar?: string;
  readonly senderType: 'tenant' | 'landlord';
  readonly recipientId: string;
  readonly recipientType: 'tenant' | 'landlord';
  readonly content: string;
  readonly attachments?: readonly {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly base64Data: string;
    readonly size: number;
  }[];
  readonly status: 'sent' | 'delivered' | 'read';
  readonly createdAt: string;
  readonly readAt?: string;
}

/**
 * Message thread interface for organizing conversations
 * 
 * Groups related messages together with participants, status, and metadata.
 */
export interface MessageThread {
  readonly id: string;
  readonly subject: string;
  readonly participants: readonly {
    readonly id: string;
    readonly name: string;
    readonly type: 'tenant' | 'landlord';
  }[];
  readonly relatedBookingId?: string;
  readonly facilityId?: string;
  readonly facilityName?: string;
  readonly status: 'active' | 'resolved' | 'closed';
  readonly priority: 'low' | 'medium' | 'high';
  readonly messages: readonly string[]; // message IDs
  readonly lastMessageAt: string;
  readonly createdAt: string;
}

/**
 * Message attachment interface
 */
export interface MessageAttachment {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly base64Data: string;
  readonly size: number;
  readonly uploadedAt: string;
}

/**
 * Message creation data interface
 */
export interface CreateMessageData {
  readonly threadId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly senderAvatar?: string;
  readonly senderType: 'tenant' | 'landlord';
  readonly recipientId: string;
  readonly recipientType: 'tenant' | 'landlord';
  readonly content: string;
  readonly attachments?: readonly {
    readonly name: string;
    readonly type: string;
    readonly base64Data: string;
    readonly size: number;
  }[];
}

/**
 * Message thread creation data interface
 */
export interface CreateMessageThreadData {
  readonly subject: string;
  readonly participants: readonly {
    readonly id: string;
    readonly name: string;
    readonly type: 'tenant' | 'landlord';
  }[];
  readonly relatedBookingId?: string;
  readonly facilityId?: string;
  readonly facilityName?: string;
  readonly priority: 'low' | 'medium' | 'high';
  readonly initialMessage: {
    readonly content: string;
    readonly attachments?: readonly {
      readonly name: string;
      readonly type: string;
      readonly base64Data: string;
      readonly size: number;
    }[];
  };
}

/**
 * Message thread update data interface
 */
export interface UpdateMessageThreadData {
  readonly subject?: string;
  readonly status?: 'active' | 'resolved' | 'closed';
  readonly priority?: 'low' | 'medium' | 'high';
}

/**
 * Message search criteria interface
 */
export interface MessageSearchCriteria {
  readonly query?: string;
  readonly threadId?: string;
  readonly senderId?: string;
  readonly recipientId?: string;
  readonly status?: Message['status'];
  readonly threadStatus?: MessageThread['status'];
  readonly priority?: MessageThread['priority'];
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly hasAttachments?: boolean;
}

/**
 * Message thread filter interface
 */
export interface MessageThreadFilter {
  readonly status?: MessageThread['status'];
  readonly priority?: MessageThread['priority'];
  readonly participantId?: string;
  readonly relatedBookingId?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly hasUnreadMessages?: boolean;
}

/**
 * Message statistics interface
 */
export interface MessageStatistics {
  readonly totalThreads: number;
  readonly activeThreads: number;
  readonly resolvedThreads: number;
  readonly closedThreads: number;
  readonly unreadMessages: number;
  readonly totalMessages: number;
  readonly averageResponseTime: number; // in minutes
  readonly threadsByPriority: {
    readonly low: number;
    readonly medium: number;
    readonly high: number;
  };
  readonly messagesByType: {
    readonly tenantToLandlord: number;
    readonly landlordToTenant: number;
    readonly tenantToTenant: number;
    readonly landlordToLandlord: number;
  };
}

/**
 * Message notification interface
 */
export interface MessageNotification {
  readonly id: string;
  readonly userId: string;
  readonly threadId: string;
  readonly messageId: string;
  readonly type: 'new_message' | 'thread_created' | 'thread_resolved' | 'thread_closed';
  readonly title: string;
  readonly content: string;
  readonly isRead: boolean;
  readonly createdAt: string;
  readonly readAt?: string;
}

/**
 * Message template interface for common responses
 */
export interface MessageTemplate {
  readonly id: string;
  readonly name: string;
  readonly category: 'booking' | 'support' | 'general' | 'admin';
  readonly content: string;
  readonly variables: readonly string[]; // Available template variables
  readonly isActive: boolean;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Message thread participant interface
 */
export interface MessageThreadParticipant {
  readonly id: string;
  readonly name: string;
  readonly type: 'user' | 'admin';
  readonly joinedAt: string;
  readonly lastReadAt?: string;
  readonly isActive: boolean;
}

/**
 * Message thread activity interface
 */
export interface MessageThreadActivity {
  readonly id: string;
  readonly threadId: string;
  readonly type: 'message_sent' | 'thread_created' | 'thread_resolved' | 'thread_closed' | 'participant_added' | 'participant_removed';
  readonly userId: string;
  readonly userName: string;
  readonly description: string;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}




