import { useState, useCallback, useMemo } from 'react';
import { useSupportStore } from '@/stores/supportStore';
import type { SupportTicket, SupportTicketFilter, SupportTicketSearchCriteria } from '@/types/support';

/**
 * Ticket status filter options
 */
export type TicketStatusFilter = 'all' | 'open' | 'in-progress' | 'waiting-user' | 'resolved' | 'closed';

/**
 * Ticket priority filter options
 */
export type TicketPriorityFilter = 'all' | 'urgent' | 'high' | 'medium' | 'low';

/**
 * Custom hook for support ticket management
 *
 * @param userId - Optional user ID for filtering user tickets
 * @param isAdmin - Whether the current user is an admin
 * @returns Ticket management state and actions
 */
export const useTickets = (userId?: string, isAdmin: boolean = false) => {
  const {
    getUserTickets,
    getAdminTickets,
    searchTickets,
    getTicketStatistics,
    updateTicketStatus,
    deleteTicket: removeTicket
  } = useSupportStore();

  const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriorityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /**
   * Get all tickets based on user role
   */
  const allTickets = useMemo(() => {
    return userId && !isAdmin ? getUserTickets(userId) : getAdminTickets();
  }, [userId, isAdmin, getUserTickets, getAdminTickets]);

  /**
   * Build search criteria from current filters
   */
  const searchCriteria: SupportTicketSearchCriteria = useMemo(() => ({
    query: searchQuery || undefined,
    filter: {
      status: statusFilter !== 'all' ? statusFilter as SupportTicket['status'] : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter as SupportTicket['priority'] : undefined,
      category: categoryFilter !== 'all' ? categoryFilter as SupportTicket['category'] : undefined,
      userId: userId && !isAdmin ? userId : undefined
    },
    sortBy,
    sortOrder
  }), [searchQuery, statusFilter, priorityFilter, categoryFilter, userId, isAdmin, sortBy, sortOrder]);

  /**
   * Get filtered and sorted tickets
   */
  const filteredTickets = useMemo(() => {
    return searchTickets(searchCriteria);
  }, [searchTickets, searchCriteria]);

  /**
   * Get tickets by specific status
   */
  const openTickets = useMemo(() =>
    filteredTickets.filter(t => t.status === 'open'),
    [filteredTickets]
  );

  const inProgressTickets = useMemo(() =>
    filteredTickets.filter(t => t.status === 'in-progress'),
    [filteredTickets]
  );

  const waitingUserTickets = useMemo(() =>
    filteredTickets.filter(t => t.status === 'waiting-user'),
    [filteredTickets]
  );

  const resolvedTickets = useMemo(() =>
    filteredTickets.filter(t => t.status === 'resolved'),
    [filteredTickets]
  );

  const closedTickets = useMemo(() =>
    filteredTickets.filter(t => t.status === 'closed'),
    [filteredTickets]
  );

  /**
   * Get urgent tickets
   */
  const urgentTickets = useMemo(() =>
    filteredTickets.filter(t => t.priority === 'urgent' && t.status !== 'closed'),
    [filteredTickets]
  );

  /**
   * Get ticket statistics
   */
  const statistics = useMemo(() =>
    getTicketStatistics(userId),
    [getTicketStatistics, userId]
  );

  /**
   * Update ticket status
   */
  const updateStatus = useCallback((ticketId: string, status: SupportTicket['status']) => {
    updateTicketStatus(ticketId, status);
  }, [updateTicketStatus]);

  /**
   * Delete a ticket
   */
  const deleteTicket = useCallback((ticketId: string) => {
    removeTicket(ticketId);
  }, [removeTicket]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() =>
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'all' ||
    searchQuery !== '',
    [statusFilter, priorityFilter, categoryFilter, searchQuery]
  );

  /**
   * Get ticket by ID
   */
  const getTicketById = useCallback((ticketId: string) => {
    return allTickets.find(t => t.id === ticketId);
  }, [allTickets]);

  return {
    // State
    allTickets,
    filteredTickets,
    openTickets,
    inProgressTickets,
    waitingUserTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    statistics,
    statusFilter,
    priorityFilter,
    categoryFilter,
    searchQuery,
    sortBy,
    sortOrder,
    hasActiveFilters,

    // Actions
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    updateStatus,
    deleteTicket,
    clearFilters,
    getTicketById
  };
};
