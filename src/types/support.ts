/**
 * Support ticket interface for the support system
 *
 * Supports comprehensive ticket management with categories, priorities,
 * status tracking, and full conversation history.
 */
export interface SupportTicket {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly category: 'booking' | 'technical' | 'billing' | 'feedback' | 'other';
  readonly subject: string;
  readonly description: string;
  readonly status: 'open' | 'in-progress' | 'waiting-user' | 'resolved' | 'closed';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly assignedTo?: string;
  readonly assignedToName?: string;
  readonly attachments?: readonly {
    readonly id: string;
    readonly name: string;
    readonly base64Data: string;
    readonly type: string;
    readonly size: number;
  }[];
  readonly replies: readonly {
    readonly id: string;
    readonly authorId: string;
    readonly authorName: string;
    readonly authorType: 'user' | 'admin';
    readonly content: string;
    readonly attachments?: readonly {
      readonly id: string;
      readonly name: string;
      readonly base64Data: string;
      readonly type: string;
      readonly size: number;
    }[];
    readonly createdAt: string;
  }[];
  readonly tags: readonly string[];
  readonly relatedBookingId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resolvedAt?: string;
  readonly closedAt?: string;
}

/**
 * Support ticket creation data interface
 */
export interface CreateSupportTicketData {
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly category: SupportTicket['category'];
  readonly subject: string;
  readonly description: string;
  readonly priority: SupportTicket['priority'];
  readonly attachments?: readonly {
    readonly name: string;
    readonly base64Data: string;
    readonly type: string;
    readonly size: number;
  }[];
  readonly relatedBookingId?: string;
  readonly tags?: readonly string[];
}

/**
 * Support ticket update data interface
 */
export interface UpdateSupportTicketData {
  readonly status?: SupportTicket['status'];
  readonly priority?: SupportTicket['priority'];
  readonly assignedTo?: string;
  readonly assignedToName?: string;
  readonly tags?: readonly string[];
  readonly resolvedAt?: string;
  readonly closedAt?: string;
}

/**
 * Support ticket reply data interface
 */
export interface CreateSupportTicketReplyData {
  readonly ticketId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorType: 'user' | 'admin';
  readonly content: string;
  readonly attachments?: readonly {
    readonly id?: string;
    readonly name: string;
    readonly base64Data: string;
    readonly type: string;
    readonly size: number;
  }[];
}

/**
 * Support ticket filter interface
 */
export interface SupportTicketFilter {
  readonly status?: SupportTicket['status'];
  readonly priority?: SupportTicket['priority'];
  readonly category?: SupportTicket['category'];
  readonly assignedTo?: string;
  readonly userId?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly tags?: readonly string[];
  readonly hasAttachments?: boolean;
}

/**
 * Support ticket search criteria
 */
export interface SupportTicketSearchCriteria {
  readonly query?: string;
  readonly filter?: SupportTicketFilter;
  readonly sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Support ticket statistics
 */
export interface SupportTicketStatistics {
  readonly total: number;
  readonly byStatus: Readonly<Record<SupportTicket['status'], number>>;
  readonly byPriority: Readonly<Record<SupportTicket['priority'], number>>;
  readonly byCategory: Readonly<Record<SupportTicket['category'], number>>;
  readonly avgResolutionTime: number;
  readonly pendingCount: number;
  readonly resolvedToday: number;
  readonly overdueCount: number;
}

/**
 * Support ticket template interface
 */
export interface SupportTicketTemplate {
  readonly id: string;
  readonly name: string;
  readonly category: SupportTicket['category'];
  readonly subject: string;
  readonly content: string;
  readonly tags?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Support ticket activity log entry
 */
export interface SupportTicketActivity {
  readonly id: string;
  readonly ticketId: string;
  readonly type: 'created' | 'updated' | 'replied' | 'assigned' | 'resolved' | 'closed' | 'reopened';
  readonly userId: string;
  readonly userName: string;
  readonly description: string;
  readonly timestamp: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Type guards
 */
export const isSupportTicket = (value: unknown): value is SupportTicket => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'userId' in value &&
    'category' in value &&
    'status' in value &&
    'priority' in value
  );
};

export const isSupportTicketFilter = (value: unknown): value is SupportTicketFilter => {
  return typeof value === 'object' && value !== null;
};
