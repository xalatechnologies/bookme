/**
 * Support Tickets Service
 *
 * Handles support ticket management with React Query hooks.
 * Provides CRUD operations, status management, and ticket messaging.
 *
 * @example
 * ```tsx
 * function SupportTickets() {
 *   const { user } = useAuth();
 *   const { data: tickets, isLoading } = useUserTickets(user?.id!);
 *
 *   return <TicketList tickets={tickets} />;
 * }
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert'];
type SupportTicketUpdate = Database['public']['Tables']['support_tickets']['Update'];
type TicketMessage = Database['public']['Tables']['support_ticket_messages']['Row'];
type TicketMessageInsert = Database['public']['Tables']['support_ticket_messages']['Insert'];

/**
 * Support ticket with messages
 */
export interface TicketWithMessages extends SupportTicket {
  messages?: TicketMessage[];
  messageCount?: number;
}

/**
 * Query keys for support tickets
 */
export const supportKeys = {
  all: ['support'] as const,
  lists: () => [...supportKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...supportKeys.lists(), filters] as const,
  userTickets: (userId: string) => [...supportKeys.all, 'user', userId] as const,
  orgTickets: (orgId: string) => [...supportKeys.all, 'org', orgId] as const,
  details: () => [...supportKeys.all, 'detail'] as const,
  detail: (id: string) => [...supportKeys.details(), id] as const,
  ticketMessages: (ticketId: string) => [...supportKeys.all, 'messages', ticketId] as const,
  openTickets: (userId: string) => [...supportKeys.all, 'open', userId] as const,
  closedTickets: (userId: string) => [...supportKeys.all, 'closed', userId] as const,
};

/**
 * Support tickets service
 */
export const supportService = {
  /**
   * Get all tickets for a user
   */
  getUserTickets: async (userId: string): Promise<SupportTicket[]> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all tickets for an organization (admin view)
   */
  getOrgTickets: async (orgId: string): Promise<SupportTicket[]> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('org_id', orgId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get single ticket with messages
   */
  getTicket: async (id: string): Promise<TicketWithMessages | null> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, support_ticket_messages(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      return {
        ...data,
        messages: data.support_ticket_messages || [],
        messageCount: data.support_ticket_messages?.length || 0,
      };
    }

    return null;
  },

  /**
   * Get ticket messages
   */
  getTicketMessages: async (ticketId: string): Promise<TicketMessage[]> => {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get open tickets for user
   */
  getOpenTickets: async (userId: string): Promise<SupportTicket[]> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['open', 'in-progress'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get closed tickets for user
   */
  getClosedTickets: async (userId: string): Promise<SupportTicket[]> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['resolved', 'closed'])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new support ticket
   */
  create: async (ticket: SupportTicketInsert): Promise<SupportTicket> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update ticket status
   */
  updateStatus: async (
    id: string,
    status: SupportTicket['status']
  ): Promise<SupportTicket> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update ticket
   */
  update: async (id: string, updates: SupportTicketUpdate): Promise<SupportTicket> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Assign ticket to agent
   */
  assignTicket: async (id: string, agentId: string): Promise<SupportTicket> => {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: agentId,
        status: 'in-progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add message to ticket
   */
  addMessage: async (message: TicketMessageInsert): Promise<TicketMessage> => {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;

    // Update ticket's updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.ticket_id);

    return data;
  },

  /**
   * Close ticket
   */
  closeTicket: async (id: string): Promise<SupportTicket> => {
    return supportService.updateStatus(id, 'closed');
  },

  /**
   * Reopen ticket
   */
  reopenTicket: async (id: string): Promise<SupportTicket> => {
    return supportService.updateStatus(id, 'open');
  },
};

/**
 * Hook: Get user's support tickets
 */
export const useUserTickets = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: supportKeys.userTickets(userId),
    queryFn: () => supportService.getUserTickets(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook: Get organization's support tickets (admin)
 */
export const useOrgTickets = (orgId: string, enabled = true) => {
  return useQuery({
    queryKey: supportKeys.orgTickets(orgId),
    queryFn: () => supportService.getOrgTickets(orgId),
    enabled: !!orgId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook: Get single ticket with messages
 */
export const useTicket = (id: string, enabled = true) => {
  return useQuery({
    queryKey: supportKeys.detail(id),
    queryFn: () => supportService.getTicket(id),
    enabled: !!id && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook: Get ticket messages
 */
export const useTicketMessages = (ticketId: string, enabled = true) => {
  return useQuery({
    queryKey: supportKeys.ticketMessages(ticketId),
    queryFn: () => supportService.getTicketMessages(ticketId),
    enabled: !!ticketId && enabled,
    staleTime: 30 * 1000, // 30 seconds (more frequent for chat-like experience)
  });
};

/**
 * Hook: Get open tickets
 */
export const useOpenTickets = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: supportKeys.openTickets(userId),
    queryFn: () => supportService.getOpenTickets(userId),
    enabled: !!userId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook: Get closed tickets
 */
export const useClosedTickets = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: supportKeys.closedTickets(userId),
    queryFn: () => supportService.getClosedTickets(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes (closed tickets change rarely)
  });
};

/**
 * Hook: Create support ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supportService.create,
    onSuccess: (data) => {
      // Invalidate user tickets
      queryClient.invalidateQueries({
        queryKey: supportKeys.userTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.openTickets(data.user_id),
      });
      // Invalidate org tickets
      queryClient.invalidateQueries({
        queryKey: supportKeys.orgTickets(data.org_id),
      });
    },
  });
};

/**
 * Hook: Update ticket status
 */
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportTicket['status'] }) =>
      supportService.updateStatus(id, status),
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: supportKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.userTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.orgTickets(data.org_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.openTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.closedTickets(data.user_id),
      });
    },
  });
};

/**
 * Hook: Update ticket
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SupportTicketUpdate }) =>
      supportService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: supportKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.userTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.orgTickets(data.org_id),
      });
    },
  });
};

/**
 * Hook: Assign ticket to agent
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      supportService.assignTicket(id, agentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: supportKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.orgTickets(data.org_id),
      });
    },
  });
};

/**
 * Hook: Add message to ticket
 */
export const useAddTicketMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supportService.addMessage,
    onSuccess: (data) => {
      // Invalidate ticket messages
      queryClient.invalidateQueries({
        queryKey: supportKeys.ticketMessages(data.ticket_id),
      });
      // Invalidate ticket detail (for message count)
      queryClient.invalidateQueries({
        queryKey: supportKeys.detail(data.ticket_id),
      });
    },
  });
};

/**
 * Hook: Close ticket
 */
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supportService.closeTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: supportKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.userTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.orgTickets(data.org_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.openTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.closedTickets(data.user_id),
      });
    },
  });
};

/**
 * Hook: Reopen ticket
 */
export const useReopenTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supportService.reopenTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: supportKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.userTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.orgTickets(data.org_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.openTickets(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: supportKeys.closedTickets(data.user_id),
      });
    },
  });
};
