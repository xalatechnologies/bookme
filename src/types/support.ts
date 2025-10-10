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
 * Support ticket search criteria interface
 */
export interface SupportTicketSearchCriteria {
  readonly query?: string;
  readonly filter?: SupportTicketFilter;
  readonly sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Support ticket statistics interface
 */
export interface SupportTicketStatistics {
  readonly totalTickets: number;
  readonly openTickets: number;
  readonly inProgressTickets: number;
  readonly resolvedTickets: number;
  readonly closedTickets: number;
  readonly averageResolutionTime: number; // in hours
  readonly ticketsByCategory: {
    readonly booking: number;
    readonly technical: number;
    readonly billing: number;
    readonly feedback: number;
    readonly other: number;
  };
  readonly ticketsByPriority: {
    readonly low: number;
    readonly medium: number;
    readonly high: number;
    readonly urgent: number;
  };
  readonly ticketsByStatus: {
    readonly open: number;
    readonly inProgress: number;
    readonly waitingUser: number;
    readonly resolved: number;
    readonly closed: number;
  };
}

/**
 * Support ticket template interface
 */
export interface SupportTicketTemplate {
  readonly id: string;
  readonly name: string;
  readonly category: SupportTicket['category'];
  readonly subject: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly isActive: boolean;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Support ticket assignment interface
 */
export interface SupportTicketAssignment {
  readonly ticketId: string;
  readonly assignedTo: string;
  readonly assignedToName: string;
  readonly assignedAt: string;
  readonly assignedBy: string;
  readonly assignedByName: string;
}

/**
 * Support ticket activity interface
 */
export interface SupportTicketActivity {
  readonly id: string;
  readonly ticketId: string;
  readonly type: 'created' | 'updated' | 'assigned' | 'replied' | 'resolved' | 'closed' | 'reopened';
  readonly userId: string;
  readonly userName: string;
  readonly description: string;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: string;
}

/**
 * Support ticket SLA (Service Level Agreement) interface
 */
export interface SupportTicketSLA {
  readonly priority: SupportTicket['priority'];
  readonly responseTime: number; // in hours
  readonly resolutionTime: number; // in hours
  readonly businessHours: {
    readonly start: string; // HH:mm format
    readonly end: string; // HH:mm format
    readonly timezone: string;
    readonly workingDays: readonly number[]; // 0-6 (Sunday-Saturday)
  };
}

/**
 * Support ticket escalation interface
 */
export interface SupportTicketEscalation {
  readonly ticketId: string;
  readonly escalatedAt: string;
  readonly escalatedBy: string;
  readonly escalatedTo: string;
  readonly reason: string;
  readonly previousPriority: SupportTicket['priority'];
  readonly newPriority: SupportTicket['priority'];
}
