"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  SupportTicket,
  CreateSupportTicketData,
  UpdateSupportTicketData,
  CreateSupportTicketReplyData,
  SupportTicketFilter,
  SupportTicketSearchCriteria,
  SupportTicketStatistics,
  SupportTicketTemplate,
  SupportTicketActivity
} from "@/types/support";

/**
 * Support store interface for managing support tickets state
 * 
 * Provides CRUD operations for support tickets with localStorage persistence
 * and full state management including replies, assignments, and statistics.
 */
interface SupportState {
  readonly tickets: readonly SupportTicket[];
  readonly templates: readonly SupportTicketTemplate[];
  readonly activities: readonly SupportTicketActivity[];
  
  // Ticket management
  readonly createTicket: (ticket: CreateSupportTicketData) => string;
  readonly updateTicket: (id: string, updates: UpdateSupportTicketData) => void;
  readonly deleteTicket: (id: string) => void;
  readonly getTicketById: (id: string) => SupportTicket | undefined;
  readonly getUserTickets: (userId: string) => readonly SupportTicket[];
  readonly getAdminTickets: () => readonly SupportTicket[];
  readonly searchTickets: (criteria: SupportTicketSearchCriteria) => readonly SupportTicket[];
  readonly filterTickets: (filter: SupportTicketFilter) => readonly SupportTicket[];
  
  // Ticket status management
  readonly openTicket: (id: string) => void;
  readonly assignTicket: (id: string, assignedTo: string, assignedToName: string) => void;
  readonly resolveTicket: (id: string) => void;
  readonly closeTicket: (id: string) => void;
  readonly reopenTicket: (id: string) => void;
  readonly escalateTicket: (id: string, newPriority: SupportTicket['priority']) => void;
  
  // Reply management
  readonly addReply: (reply: CreateSupportTicketReplyData) => string;
  readonly updateReply: (ticketId: string, replyId: string, content: string) => void;
  readonly deleteReply: (ticketId: string, replyId: string) => void;
  readonly getTicketReplies: (ticketId: string) => SupportTicket['replies'];
  
  // Template management
  readonly createTemplate: (template: Omit<SupportTicketTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  readonly updateTemplate: (id: string, updates: Partial<SupportTicketTemplate>) => void;
  readonly deleteTemplate: (id: string) => void;
  readonly getTemplateById: (id: string) => SupportTicketTemplate | undefined;
  readonly getTemplatesByCategory: (category: SupportTicket['category']) => readonly SupportTicketTemplate[];
  readonly getActiveTemplates: () => readonly SupportTicketTemplate[];
  
  // Activity tracking
  readonly logActivity: (activity: Omit<SupportTicketActivity, 'id' | 'timestamp'>) => string;
  readonly getTicketActivities: (ticketId: string) => readonly SupportTicketActivity[];
  readonly getUserActivities: (userId: string) => readonly SupportTicketActivity[];
  
  // Statistics and analytics
  readonly getTicketStatistics: (userId?: string) => SupportTicketStatistics;
  readonly getTicketMetrics: (ticketId: string) => {
    readonly responseTime: number;
    readonly resolutionTime: number;
    readonly replyCount: number;
    readonly activityCount: number;
  };
  
  // Utility functions
  readonly clearAllData: () => void;
  readonly exportTickets: (ticketIds: readonly string[]) => string;
  readonly importTickets: (data: string) => void;
}

/**
 * Generate unique ID for support tickets
 */
const generateTicketId = (): string => {
  return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for replies
 */
const generateReplyId = (): string => {
  return `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for activities
 */
const generateActivityId = (): string => {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for templates
 */
const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Support store implementation
 * 
 * Manages support tickets state with localStorage persistence and full CRUD operations
 */
export const useSupportStore = create<SupportState>()(
  devtools(
    persist(
      (set, get) => ({
        tickets: [],
        templates: [],
        activities: [],

        createTicket: (ticketData: CreateSupportTicketData): string => {
          const id = generateTicketId();
          const now = new Date().toISOString();
          
          const newTicket: SupportTicket = {
            id,
            ...ticketData,
            status: 'open',
            assignedTo: undefined,
            assignedToName: undefined,
            replies: [],
            tags: ticketData.tags || [],
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            tickets: [...state.tickets, newTicket]
          }));

          // Log creation activity
          get().logActivity({
            ticketId: id,
            type: 'created',
            userId: ticketData.userId,
            userName: ticketData.userName,
            description: `Ticket opprettet: ${ticketData.subject}`,
            metadata: {
              category: ticketData.category,
              priority: ticketData.priority
            }
          });

          return id;
        },

        updateTicket: (id: string, updates: UpdateSupportTicketData): void => {
          const now = new Date().toISOString();
          
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.id === id
                ? {
                    ...ticket,
                    ...updates,
                    updatedAt: now
                  }
                : ticket
            )
          }));

          // Log update activity
          const ticket = get().getTicketById(id);
          if (ticket) {
            get().logActivity({
              ticketId: id,
              type: 'updated',
              userId: ticket.userId,
              userName: ticket.userName,
              description: `Ticket oppdatert`,
              metadata: updates
            });
          }
        },

        deleteTicket: (id: string): void => {
          set((state) => ({
            tickets: state.tickets.filter((ticket) => ticket.id !== id),
            activities: state.activities.filter((activity) => activity.ticketId !== id)
          }));
        },

        getTicketById: (id: string): SupportTicket | undefined => {
          return get().tickets.find((ticket) => ticket.id === id);
        },

        getUserTickets: (userId: string): readonly SupportTicket[] => {
          return get().tickets
            .filter((ticket) => ticket.userId === userId)
            .slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },

        getAdminTickets: (): readonly SupportTicket[] => {
          return get().tickets
            .slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },

        searchTickets: (criteria: SupportTicketSearchCriteria): readonly SupportTicket[] => {
          let results = get().tickets;

          // Apply search query
          if (criteria.query) {
            const query = criteria.query.toLowerCase();
            results = results.filter((ticket) =>
              ticket.subject.toLowerCase().includes(query) ||
              ticket.description.toLowerCase().includes(query) ||
              ticket.userName.toLowerCase().includes(query) ||
              ticket.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }

          // Apply filters
          if (criteria.filter) {
            const filter = criteria.filter;
            
            if (filter.status) {
              results = results.filter((ticket) => ticket.status === filter.status);
            }
            
            if (filter.priority) {
              results = results.filter((ticket) => ticket.priority === filter.priority);
            }
            
            if (filter.category) {
              results = results.filter((ticket) => ticket.category === filter.category);
            }
            
            if (filter.assignedTo) {
              results = results.filter((ticket) => ticket.assignedTo === filter.assignedTo);
            }
            
            if (filter.userId) {
              results = results.filter((ticket) => ticket.userId === filter.userId);
            }
            
            if (filter.dateFrom) {
              results = results.filter((ticket) => new Date(ticket.createdAt) >= filter.dateFrom!);
            }
            
            if (filter.dateTo) {
              results = results.filter((ticket) => new Date(ticket.createdAt) <= filter.dateTo!);
            }
            
            if (filter.tags && filter.tags.length > 0) {
              results = results.filter((ticket) =>
                filter.tags!.some(tag => ticket.tags.includes(tag))
              );
            }
            
            if (filter.hasAttachments !== undefined) {
              results = results.filter((ticket) => 
                filter.hasAttachments ? 
                  (ticket.attachments && ticket.attachments.length > 0) :
                  (!ticket.attachments || ticket.attachments.length === 0)
              );
            }
          }

          // Apply sorting
          if (criteria.sortBy) {
            results = [...results].sort((a, b) => {
              let aValue: string | number, bValue: string | number;
              
              switch (criteria.sortBy) {
                case 'createdAt':
                  aValue = new Date(a.createdAt).getTime();
                  bValue = new Date(b.createdAt).getTime();
                  break;
                case 'updatedAt':
                  aValue = new Date(a.updatedAt).getTime();
                  bValue = new Date(b.updatedAt).getTime();
                  break;
                case 'priority':
                  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                  aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
                  bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
                  break;
                case 'status':
                  const statusOrder = { open: 1, 'in-progress': 2, 'waiting-user': 3, resolved: 4, closed: 5 };
                  aValue = statusOrder[a.status as keyof typeof statusOrder];
                  bValue = statusOrder[b.status as keyof typeof statusOrder];
                  break;
                default:
                  return 0;
              }
              
              if (criteria.sortOrder === 'asc') {
                return aValue - bValue;
              } else {
                return bValue - aValue;
              }
            });
          }

          return results;
        },

        filterTickets: (filter: SupportTicketFilter): readonly SupportTicket[] => {
          return get().searchTickets({ filter });
        },

        openTicket: (id: string): void => {
          get().updateTicket(id, { status: 'open' });
        },

        assignTicket: (id: string, assignedTo: string, assignedToName: string): void => {
          get().updateTicket(id, { 
            status: 'in-progress',
            assignedTo,
            assignedToName
          });
        },

        resolveTicket: (id: string): void => {
          const now = new Date().toISOString();
          get().updateTicket(id, { 
            status: 'resolved',
            resolvedAt: now
          });
        },

        closeTicket: (id: string): void => {
          const now = new Date().toISOString();
          get().updateTicket(id, { 
            status: 'closed',
            closedAt: now
          });
        },

        reopenTicket: (id: string): void => {
          get().updateTicket(id, { 
            status: 'open',
            resolvedAt: undefined,
            closedAt: undefined
          });
        },

        escalateTicket: (id: string, newPriority: SupportTicket['priority']): void => {
          const ticket = get().getTicketById(id);
          if (ticket) {
            get().updateTicket(id, { priority: newPriority });
            
            get().logActivity({
              ticketId: id,
              type: 'updated',
              userId: ticket.userId,
              userName: ticket.userName,
              description: `Ticket eskalert til ${newPriority} prioritet`,
              metadata: {
                previousPriority: ticket.priority,
                newPriority
              }
            });
          }
        },

        addReply: (replyData: CreateSupportTicketReplyData): string => {
          const replyId = generateReplyId();
          const now = new Date().toISOString();
          
          const newReply: SupportTicket['replies'][0] = {
            id: replyId,
            ...replyData,
            attachments: replyData.attachments?.map((att, index) => ({
              id: att.id || `${replyId}-att-${index}`,
              ...att
            })),
            createdAt: now
          };

          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.id === replyData.ticketId
                ? {
                    ...ticket,
                    replies: [...ticket.replies, newReply],
                    updatedAt: now
                  }
                : ticket
            )
          }));

          // Log reply activity
          get().logActivity({
            ticketId: replyData.ticketId,
            type: 'replied',
            userId: replyData.authorId,
            userName: replyData.authorName,
            description: `Svar lagt til av ${replyData.authorName}`
          });

          return replyId;
        },

        updateReply: (ticketId: string, replyId: string, content: string): void => {
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.id === ticketId
                ? {
                    ...ticket,
                    replies: ticket.replies.map((reply) =>
                      reply.id === replyId
                        ? { ...reply, content }
                        : reply
                    ),
                    updatedAt: new Date().toISOString()
                  }
                : ticket
            )
          }));
        },

        deleteReply: (ticketId: string, replyId: string): void => {
          set((state) => ({
            tickets: state.tickets.map((ticket) =>
              ticket.id === ticketId
                ? {
                    ...ticket,
                    replies: ticket.replies.filter((reply) => reply.id !== replyId),
                    updatedAt: new Date().toISOString()
                  }
                : ticket
            )
          }));
        },

        getTicketReplies: (ticketId: string): SupportTicket['replies'] => {
          const ticket = get().getTicketById(ticketId);
          return ticket?.replies || [];
        },

        createTemplate: (templateData: Omit<SupportTicketTemplate, 'id' | 'createdAt' | 'updatedAt'>): string => {
          const id = generateTemplateId();
          const now = new Date().toISOString();
          
          const newTemplate: SupportTicketTemplate = {
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

        updateTemplate: (id: string, updates: Partial<SupportTicketTemplate>): void => {
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

        getTemplateById: (id: string): SupportTicketTemplate | undefined => {
          return get().templates.find((template) => template.id === id);
        },

        getTemplatesByCategory: (category: SupportTicket['category']): readonly SupportTicketTemplate[] => {
          return get().templates.filter((template) => template.category === category);
        },

        getActiveTemplates: (): readonly SupportTicketTemplate[] => {
          return get().templates.filter((template) => template.isActive);
        },

        logActivity: (activityData: Omit<SupportTicketActivity, 'id' | 'timestamp'>): string => {
          const id = generateActivityId();
          const now = new Date().toISOString();
          
          const newActivity: SupportTicketActivity = {
            id,
            ...activityData,
            timestamp: now
          };

          set((state) => ({
            activities: [...state.activities, newActivity]
          }));

          return id;
        },

        getTicketActivities: (ticketId: string): readonly SupportTicketActivity[] => {
          return get().activities
            .filter((activity) => activity.ticketId === ticketId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        },

        getUserActivities: (userId: string): readonly SupportTicketActivity[] => {
          return get().activities
            .filter((activity) => activity.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        },

        getTicketStatistics: (userId?: string): SupportTicketStatistics => {
          const tickets = userId ? get().getUserTickets(userId) : get().tickets;
          
          const totalTickets = tickets.length;
          const openTickets = tickets.filter(t => t.status === 'open').length;
          const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
          const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
          const closedTickets = tickets.filter(t => t.status === 'closed').length;

          const ticketsByCategory = {
            booking: tickets.filter(t => t.category === 'booking').length,
            technical: tickets.filter(t => t.category === 'technical').length,
            billing: tickets.filter(t => t.category === 'billing').length,
            feedback: tickets.filter(t => t.category === 'feedback').length,
            other: tickets.filter(t => t.category === 'other').length
          };

          const ticketsByPriority = {
            low: tickets.filter(t => t.priority === 'low').length,
            medium: tickets.filter(t => t.priority === 'medium').length,
            high: tickets.filter(t => t.priority === 'high').length,
            urgent: tickets.filter(t => t.priority === 'urgent').length
          };

          const ticketsByStatus = {
            open: openTickets,
            inProgress: inProgressTickets,
            waitingUser: tickets.filter(t => t.status === 'waiting-user').length,
            resolved: resolvedTickets,
            closed: closedTickets
          };

          return {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            closedTickets,
            averageResolutionTime: 0, // This would be calculated based on actual resolution times
            ticketsByCategory,
            ticketsByPriority,
            ticketsByStatus
          };
        },

        getTicketMetrics: (ticketId: string): {
          readonly responseTime: number;
          readonly resolutionTime: number;
          readonly replyCount: number;
          readonly activityCount: number;
        } => {
          const ticket = get().getTicketById(ticketId);
          const activities = get().getTicketActivities(ticketId);
          
          if (!ticket) {
            return {
              responseTime: 0,
              resolutionTime: 0,
              replyCount: 0,
              activityCount: 0
            };
          }

          const replyCount = ticket.replies.length;
          const activityCount = activities.length;
          
          // Calculate response time (time to first admin reply)
          const firstAdminReply = ticket.replies.find(r => r.authorType === 'admin');
          const responseTime = firstAdminReply ? 
            (new Date(firstAdminReply.createdAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60) : 0;
          
          // Calculate resolution time
          const resolutionTime = ticket.resolvedAt ? 
            (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60) : 0;

          return {
            responseTime,
            resolutionTime,
            replyCount,
            activityCount
          };
        },

        clearAllData: (): void => {
          set({
            tickets: [],
            templates: [],
            activities: []
          });
        },

        exportTickets: (ticketIds: readonly string[]): string => {
          const tickets = get().tickets.filter(ticket => ticketIds.includes(ticket.id));
          const exportData = {
            tickets,
            exportedAt: new Date().toISOString()
          };
          return JSON.stringify(exportData, null, 2);
        },

        importTickets: (data: string): void => {
          try {
            const importData = JSON.parse(data);
            // This would validate and import the data
          } catch (error) {
          }
        }
      }),
      {
        name: "support-store",
        version: 1
      }
    ),
    {
      name: "support-store"
    }
  )
);
