/**
 * Support Business Logic Service
 *
 * Contains all business logic related to support ticket operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type {
  SupportTicket,
  SupportTicketFilter,
  SupportTicketStatistics,
} from "@/types/support";

export interface ISupportTicketFilters {
  readonly searchTerm?: string;
  readonly statusFilter?: readonly string[];
  readonly priorityFilter?: readonly string[];
  readonly categoryFilter?: readonly string[];
  readonly assigneeFilter?: readonly string[];
}

export interface ISupportTicketSortConfig {
  readonly sortBy: 'created_at' | 'priority' | 'status' | 'last_updated';
  readonly sortOrder: 'asc' | 'desc';
}

/**
 * Filter support tickets based on search and filter criteria
 *
 * @param tickets - Array of support tickets to filter
 * @param filters - Filter configuration including search term and various filters
 * @returns Filtered array of support tickets
 */
export const filterTickets = (
  tickets: readonly SupportTicket[],
  filters: ISupportTicketFilters
): readonly SupportTicket[] => {
  return tickets.filter(ticket => {
    // Search filter - searches across subject, description, and username
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.userName.toLowerCase().includes(searchLower) ||
        ticket.userEmail.toLowerCase().includes(searchLower) ||
        (ticket.tags && ticket.tags.some(tag => tag.toLowerCase().includes(searchLower)));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      if (!filters.statusFilter.includes(ticket.status)) return false;
    }

    // Priority filter
    if (filters.priorityFilter && filters.priorityFilter.length > 0) {
      if (!filters.priorityFilter.includes(ticket.priority)) return false;
    }

    // Category filter
    if (filters.categoryFilter && filters.categoryFilter.length > 0) {
      if (!filters.categoryFilter.includes(ticket.category)) return false;
    }

    // Assignee filter
    if (filters.assigneeFilter && filters.assigneeFilter.length > 0) {
      if (!ticket.assignedTo || !filters.assigneeFilter.includes(ticket.assignedTo)) return false;
    }

    return true;
  });
};

/**
 * Sort support tickets based on sort configuration
 *
 * @param tickets - Array of support tickets to sort
 * @param sortConfig - Sort configuration with field and order
 * @returns Sorted array of support tickets
 */
export const sortTickets = (
  tickets: readonly SupportTicket[],
  sortConfig: ISupportTicketSortConfig
): readonly SupportTicket[] => {
  const sorted = [...tickets].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'created_at':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'last_updated':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'priority': {
        const priorityOrder: Record<SupportTicket['priority'], number> = {
          low: 1,
          medium: 2,
          high: 3,
          urgent: 4,
        };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'status': {
        const statusOrder: Record<SupportTicket['status'], number> = {
          'open': 1,
          'in-progress': 2,
          'waiting-user': 3,
          'resolved': 4,
          'closed': 5,
        };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Validate support ticket data
 *
 * @param ticket - Partial ticket data to validate
 * @returns Validation result with isValid flag and error messages
 */
export const validateTicketData = (
  ticket: Partial<SupportTicket>
): { isValid: boolean; errors: readonly string[] } => {
  const errors: string[] = [];

  if (!ticket.subject || ticket.subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters');
  }

  if (!ticket.description || ticket.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!ticket.category) {
    errors.push('Category is required');
  }

  if (!ticket.priority) {
    errors.push('Priority is required');
  }

  if (!ticket.userEmail || !ticket.userEmail.includes('@')) {
    errors.push('Valid email is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Prioritize tickets by urgency (high priority, unresolved, older first)
 *
 * Business rule: Urgent + unresolved + older tickets appear first
 *
 * @param tickets - Array of support tickets to prioritize
 * @returns Prioritized array of support tickets
 */
export const prioritizeTickets = (
  tickets: readonly SupportTicket[]
): readonly SupportTicket[] => {
  const sorted = [...tickets].sort((a, b) => {
    // Priority 1: Urgent tickets first
    const priorityOrder: Record<SupportTicket['priority'], number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Priority 2: Unresolved tickets before resolved
    const aResolved = a.status === 'resolved' || a.status === 'closed' ? 1 : 0;
    const bResolved = b.status === 'resolved' || b.status === 'closed' ? 1 : 0;
    const resolvedDiff = aResolved - bResolved;
    if (resolvedDiff !== 0) return resolvedDiff;

    // Priority 3: Older tickets first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return sorted;
};

/**
 * Check if a ticket can be closed
 *
 * Business rule: Ticket must be resolved or have at least one response
 *
 * @param ticket - Support ticket to check
 * @returns Object with canClose flag and optional reason
 */
export const canCloseTicket = (
  ticket: SupportTicket
): { canClose: boolean; reason?: string } => {
  // Cannot close if still open and unresponded
  if (ticket.status === 'open' && ticket.replies.length === 0) {
    return {
      canClose: false,
      reason: 'Cannot close unresponded tickets. Please add a response first.',
    };
  }

  // Cannot close if still in-progress without resolution
  if (ticket.status === 'in-progress' && !ticket.resolvedAt) {
    return {
      canClose: false,
      reason: 'Cannot close in-progress tickets. Please mark as resolved first.',
    };
  }

  // Can close if resolved or has responses
  return { canClose: true };
};

/**
 * Check if a ticket can be escalated
 *
 * Business rule: Time-based and priority-based escalation rules
 *
 * @param ticket - Support ticket to check
 * @param currentTimeMs - Current time in milliseconds (for testing)
 * @returns Object with canEscalate flag and optional reason
 */
export const canEscalateTicket = (
  ticket: SupportTicket,
  currentTimeMs: number = Date.now()
): { canEscalate: boolean; reason?: string } => {
  // Cannot escalate if already urgent
  if (ticket.priority === 'urgent') {
    return {
      canEscalate: false,
      reason: 'Ticket is already at highest priority level.',
    };
  }

  // Cannot escalate if closed
  if (ticket.status === 'closed') {
    return {
      canEscalate: false,
      reason: 'Cannot escalate closed tickets.',
    };
  }

  // Can escalate if waiting longer than 4 hours or no response yet
  const createdTime = new Date(ticket.createdAt).getTime();
  const elapsedHours = (currentTimeMs - createdTime) / (1000 * 60 * 60);
  const hasResponse = ticket.replies.length > 0;

  if (!hasResponse && elapsedHours >= 4) {
    return {
      canEscalate: true,
      reason: 'No response after 4 hours. Escalation recommended.',
    };
  }

  // Can escalate for high priority unresolved tickets after 2 hours
  if (ticket.priority === 'high' && ticket.status !== 'resolved' && elapsedHours >= 2) {
    return {
      canEscalate: true,
      reason: 'High priority ticket unresolved for 2 hours. Escalation recommended.',
    };
  }

  return { canEscalate: true };
};

/**
 * Calculate support ticket statistics
 *
 * @param tickets - Array of support tickets
 * @returns Statistics object with counts and metrics
 */
export const calculateTicketStats = (
  tickets: readonly SupportTicket[]
): SupportTicketStatistics => {
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in-progress').length;
  const waitingUser = tickets.filter(t => t.status === 'waiting-user').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;
  const closed = tickets.filter(t => t.status === 'closed').length;

  // Calculate average resolution time for resolved tickets (in hours)
  let averageResolutionTime = 0;
  const resolvedTickets = tickets.filter(t => t.resolvedAt);
  if (resolvedTickets.length > 0) {
    const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
      const createdTime = new Date(ticket.createdAt).getTime();
      const resolvedTime = new Date(ticket.resolvedAt!).getTime();
      return sum + (resolvedTime - createdTime) / (1000 * 60 * 60);
    }, 0);
    averageResolutionTime = totalResolutionTime / resolvedTickets.length;
  }

  // Count by category
  const ticketsByCategory = {
    booking: tickets.filter(t => t.category === 'booking').length,
    technical: tickets.filter(t => t.category === 'technical').length,
    billing: tickets.filter(t => t.category === 'billing').length,
    feedback: tickets.filter(t => t.category === 'feedback').length,
    other: tickets.filter(t => t.category === 'other').length,
  };

  // Count by priority
  const ticketsByPriority = {
    low: tickets.filter(t => t.priority === 'low').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    high: tickets.filter(t => t.priority === 'high').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  };

  // Count by status
  const ticketsByStatus = {
    open,
    inProgress,
    waitingUser,
    resolved,
    closed,
  };

  return {
    totalTickets: total,
    openTickets: open,
    inProgressTickets: inProgress,
    resolvedTickets: resolved,
    closedTickets: closed,
    averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
    ticketsByCategory,
    ticketsByPriority,
    ticketsByStatus,
  };
};

export interface FormattedTicket extends SupportTicket {
  readonly formattedCreatedAt: string;
  readonly formattedUpdatedAt: string;
  readonly formattedResolvedAt?: string;
  readonly ticketAge: string;
  readonly statusLabel: string;
  readonly priorityLabel: string;
  readonly categoryLabel: string;
  readonly hasResponses: boolean;
  readonly isUnassigned: boolean;
  readonly isUnresolved: boolean;
}

/**
 * Format ticket data for display
 *
 * Formats dates, calculates age, provides user-friendly labels
 *
 * @param ticket - Support ticket to format
 * @param locale - Locale for date formatting (default: 'no-NO')
 * @returns Formatted ticket with display-ready fields
 */
export const formatTicketForDisplay = (
  ticket: SupportTicket,
  locale: string = 'no-NO'
): FormattedTicket => {
  const now = new Date();
  const createdDate = new Date(ticket.createdAt);
  const ageMs = now.getTime() - createdDate.getTime();
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);

  let ticketAge: string;
  if (ageDays > 0) {
    ticketAge = `${ageDays}d`;
  } else if (ageHours > 0) {
    ticketAge = `${ageHours}h`;
  } else {
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    ticketAge = `${ageMinutes}m`;
  }

  // Status label mapping
  const statusLabels: Record<SupportTicket['status'], string> = {
    'open': 'Open',
    'in-progress': 'In Progress',
    'waiting-user': 'Waiting for User',
    'resolved': 'Resolved',
    'closed': 'Closed',
  };

  // Priority label mapping
  const priorityLabels: Record<SupportTicket['priority'], string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent',
  };

  // Category label mapping
  const categoryLabels: Record<SupportTicket['category'], string> = {
    'booking': 'Booking',
    'technical': 'Technical',
    'billing': 'Billing',
    'feedback': 'Feedback',
    'other': 'Other',
  };

  return {
    ...ticket,
    formattedCreatedAt: createdDate.toLocaleDateString(locale),
    formattedUpdatedAt: new Date(ticket.updatedAt).toLocaleDateString(locale),
    formattedResolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString(locale) : undefined,
    ticketAge,
    statusLabel: statusLabels[ticket.status],
    priorityLabel: priorityLabels[ticket.priority],
    categoryLabel: categoryLabels[ticket.category],
    hasResponses: ticket.replies.length > 0,
    isUnassigned: !ticket.assignedTo,
    isUnresolved: ticket.status !== 'resolved' && ticket.status !== 'closed',
  };
};

/**
 * Get unique categories from a list of tickets
 *
 * @param tickets - Array of support tickets
 * @returns Array of unique categories
 */
export const getUniqueCategoriesFromTickets = (
  tickets: readonly SupportTicket[]
): readonly SupportTicket['category'][] => {
  return Array.from(new Set(tickets.map(t => t.category)));
};

/**
 * Get unique priorities from a list of tickets
 *
 * @param tickets - Array of support tickets
 * @returns Array of unique priorities
 */
export const getUniquePrioritiesFromTickets = (
  tickets: readonly SupportTicket[]
): readonly SupportTicket['priority'][] => {
  return Array.from(new Set(tickets.map(t => t.priority)));
};

/**
 * Get unique assignees from a list of tickets
 *
 * @param tickets - Array of support tickets
 * @returns Array of unique assignee IDs
 */
export const getUniqueAssigneesFromTickets = (
  tickets: readonly SupportTicket[]
): readonly string[] => {
  const assignees = tickets
    .filter(t => t.assignedTo)
    .map(t => t.assignedTo!);
  return Array.from(new Set(assignees));
};

/**
 * Get unique statuses from all possible ticket statuses
 *
 * @returns Array of all possible ticket statuses
 */
export const getAllTicketStatuses = (): readonly SupportTicket['status'][] => {
  return ['open', 'in-progress', 'waiting-user', 'resolved', 'closed'];
};

/**
 * Check if ticket requires urgent attention
 *
 * Business rule: Urgent, unresolved, and no response within time window
 *
 * @param ticket - Support ticket to check
 * @param currentTimeMs - Current time in milliseconds (for testing)
 * @returns Boolean indicating if ticket needs urgent attention
 */
export const isTicketUrgent = (
  ticket: SupportTicket,
  currentTimeMs: number = Date.now()
): boolean => {
  // Always urgent if priority is urgent
  if (ticket.priority === 'urgent') return true;

  // Urgent if high priority and unresolved for 2+ hours with no response
  if (ticket.priority === 'high' && ticket.status !== 'resolved' && ticket.status !== 'closed') {
    const createdTime = new Date(ticket.createdAt).getTime();
    const elapsedHours = (currentTimeMs - createdTime) / (1000 * 60 * 60);
    if (elapsedHours >= 2 && ticket.replies.length === 0) return true;
  }

  // Urgent if any ticket has been open for 24+ hours with no response
  if (ticket.status === 'open' && ticket.replies.length === 0) {
    const createdTime = new Date(ticket.createdAt).getTime();
    const elapsedHours = (currentTimeMs - createdTime) / (1000 * 60 * 60);
    if (elapsedHours >= 24) return true;
  }

  return false;
};
