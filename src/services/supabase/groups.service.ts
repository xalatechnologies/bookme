/**
 * Groups Service
 *
 * Handles booking group operations with Supabase backend.
 * Groups enable collaborative bookings with multiple members.
 *
 * Features:
 * - Group management (create, update, delete)
 * - Member management (add, remove, update roles)
 * - Invitation system with expiration
 * - Cost sharing and payment tracking
 * - Group-specific bookings
 */

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases
type Group = Database['public']['Tables']['booking_groups']['Row'];
type GroupInsert = Database['public']['Tables']['booking_groups']['Insert'];
type GroupUpdate = Database['public']['Tables']['booking_groups']['Update'];
type GroupMember = Database['public']['Tables']['booking_group_members']['Row'];
type GroupInvitation = Database['public']['Tables']['booking_group_invitations']['Row'];
type GroupBooking = Database['public']['Tables']['group_bookings']['Row'];
type CostShare = Database['public']['Tables']['group_booking_cost_shares']['Row'];

/**
 * Group with members
 */
export interface GroupWithMembers extends Group {
  readonly members: readonly GroupMember[];
}

/**
 * Query keys
 */
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  userGroups: (userId: string) => [...groupKeys.lists(), 'user', userId] as const,
  orgGroups: (orgId: string) => [...groupKeys.lists(), 'org', orgId] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  withMembers: (id: string) => [...groupKeys.detail(id), 'members'] as const,
  invitations: (userId: string) => [...groupKeys.all, 'invitations', userId] as const,
  groupBookings: (groupId: string) => [...groupKeys.detail(groupId), 'bookings'] as const,
};

// ============================================================================
// Service Functions
// ============================================================================

export const groupsService = {
  /**
   * Fetch groups where user is a member
   */
  async getUserGroups(userId: string): Promise<GroupWithMembers[]> {
    const { data, error } = await supabase
      .from('booking_groups')
      .select(`
        *,
        members:booking_group_members (*)
      `)
      .eq('members.user_id', userId)
      .eq('members.is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GroupWithMembers[];
  },

  /**
   * Fetch a single group with members
   */
  async getById(id: string): Promise<GroupWithMembers> {
    const { data, error } = await supabase
      .from('booking_groups')
      .select(`
        *,
        members:booking_group_members (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as GroupWithMembers;
  },

  /**
   * Create a new group
   */
  async create(group: GroupInsert, ownerId: string): Promise<Group> {
    const { data, error } = await supabase
      .from('booking_groups')
      .insert(group)
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    await supabase.from('booking_group_members').insert({
      group_id: data.id,
      user_id: ownerId,
      role: 'owner',
      is_active: true,
    });

    return data;
  },

  /**
   * Update a group
   */
  async update(id: string, updates: GroupUpdate): Promise<Group> {
    const { data, error } = await supabase
      .from('booking_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a group
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('booking_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Invite a user to a group
   */
  async inviteUser(
    groupId: string,
    email: string,
    invitedBy: string
  ): Promise<GroupInvitation> {
    const { data, error } = await supabase
      .from('booking_group_invitations')
      .insert({
        group_id: groupId,
        email,
        invited_by: invitedBy,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Accept a group invitation
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<GroupMember> {
    // Use RPC function from backend
    const { data, error } = await supabase.rpc('accept_group_invitation', {
      p_invitation_id: invitationId,
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get pending invitations for a user
   */
  async getUserInvitations(email: string): Promise<GroupInvitation[]> {
    const { data, error } = await supabase
      .from('booking_group_invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    groupId: string,
    userId: string,
    role: 'owner' | 'admin' | 'member'
  ): Promise<GroupMember> {
    const { data, error } = await supabase
      .from('booking_group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove a member from group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('booking_group_members')
      .update({ is_active: false })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Get group bookings
   */
  async getGroupBookings(groupId: string): Promise<GroupBooking[]> {
    const { data, error } = await supabase
      .from('group_bookings')
      .select(`
        *,
        booking:bookings (*)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get cost shares for a booking
   */
  async getCostShares(bookingId: string): Promise<CostShare[]> {
    const { data, error } = await supabase
      .from('group_booking_cost_shares')
      .select('*')
      .eq('booking_id', bookingId);

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch user's groups
 *
 * @example
 * ```tsx
 * function MyGroups() {
 *   const { user } = useAuth();
 *   const { data: groups, isLoading } = useUserGroups(user?.id!);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       {groups?.map(group => (
 *         <GroupCard key={group.id} group={group} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserGroups = (
  userId: string,
  enabled = true
): UseQueryResult<GroupWithMembers[], Error> => {
  return useQuery({
    queryKey: groupKeys.userGroups(userId),
    queryFn: () => groupsService.getUserGroups(userId),
    enabled: !!userId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Hook to fetch a single group
 */
export const useGroup = (
  id: string,
  enabled = true
): UseQueryResult<GroupWithMembers, Error> => {
  return useQuery({
    queryKey: groupKeys.withMembers(id),
    queryFn: () => groupsService.getById(id),
    enabled: !!id && enabled,
  });
};

/**
 * Hook to fetch user's pending invitations
 *
 * @example
 * ```tsx
 * function InvitationsList() {
 *   const { user } = useAuth();
 *   const { data: invitations } = useUserInvitations(user?.email!);
 *   const acceptInvitation = useAcceptInvitation();
 *
 *   return (
 *     <div>
 *       {invitations?.map(inv => (
 *         <div key={inv.id}>
 *           <p>Invitation to {inv.group_id}</p>
 *           <button onClick={() => acceptInvitation.mutate({
 *             invitationId: inv.id,
 *             userId: user!.id
 *           })}>
 *             Accept
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useUserInvitations = (
  email: string,
  enabled = true
): UseQueryResult<GroupInvitation[], Error> => {
  return useQuery({
    queryKey: groupKeys.invitations(email),
    queryFn: () => groupsService.getUserInvitations(email),
    enabled: !!email && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch group bookings
 */
export const useGroupBookings = (
  groupId: string,
  enabled = true
): UseQueryResult<GroupBooking[], Error> => {
  return useQuery({
    queryKey: groupKeys.groupBookings(groupId),
    queryFn: () => groupsService.getGroupBookings(groupId),
    enabled: !!groupId && enabled,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to create a group
 *
 * @example
 * ```tsx
 * function CreateGroupForm() {
 *   const { user } = useAuth();
 *   const createGroup = useCreateGroup();
 *
 *   const handleSubmit = (data: GroupInsert) => {
 *     createGroup.mutate({
 *       group: data,
 *       ownerId: user!.id
 *     }, {
 *       onSuccess: (group) => {
 *         toast.success('Group created!');
 *         navigate(`/groups/${group.id}`);
 *       }
 *     });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useCreateGroup = (): UseMutationResult<
  Group,
  Error,
  { group: GroupInsert; ownerId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ group, ownerId }) => groupsService.create(group, ownerId),
    onSuccess: (_, { ownerId }) => {
      // Invalidate user's groups
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(ownerId) });
    },
  });
};

/**
 * Hook to update a group
 */
export const useUpdateGroup = (): UseMutationResult<
  Group,
  Error,
  { id: string; updates: GroupUpdate }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => groupsService.update(id, updates),
    onSuccess: (updatedGroup, { id }) => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.setQueryData(groupKeys.detail(id), updatedGroup);
    },
  });
};

/**
 * Hook to delete a group
 */
export const useDeleteGroup = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsService.delete,
    onSuccess: () => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};

/**
 * Hook to invite a user to a group
 *
 * @example
 * ```tsx
 * function InviteUserButton({ groupId }: { groupId: string }) {
 *   const { user } = useAuth();
 *   const inviteUser = useInviteUser();
 *
 *   const handleInvite = (email: string) => {
 *     inviteUser.mutate({
 *       groupId,
 *       email,
 *       invitedBy: user!.id
 *     }, {
 *       onSuccess: () => toast.success('Invitation sent!')
 *     });
 *   };
 *
 *   return <InviteForm onSubmit={handleInvite} />;
 * }
 * ```
 */
export const useInviteUser = (): UseMutationResult<
  GroupInvitation,
  Error,
  { groupId: string; email: string; invitedBy: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, email, invitedBy }) =>
      groupsService.inviteUser(groupId, email, invitedBy),
    onSuccess: (_, { email }) => {
      // Invalidate invitations for the invited user
      queryClient.invalidateQueries({ queryKey: groupKeys.invitations(email) });
    },
  });
};

/**
 * Hook to accept a group invitation
 */
export const useAcceptInvitation = (): UseMutationResult<
  GroupMember,
  Error,
  { invitationId: string; userId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, userId }) =>
      groupsService.acceptInvitation(invitationId, userId),
    onSuccess: (_, { userId }) => {
      // Invalidate user's groups and invitations
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(userId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};

/**
 * Hook to update member role
 */
export const useUpdateMemberRole = (): UseMutationResult<
  GroupMember,
  Error,
  { groupId: string; userId: string; role: 'owner' | 'admin' | 'member' }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId, role }) =>
      groupsService.updateMemberRole(groupId, userId, role),
    onSuccess: (_, { groupId }) => {
      // Invalidate group details
      queryClient.invalidateQueries({ queryKey: groupKeys.withMembers(groupId) });
    },
  });
};

/**
 * Hook to remove a member from group
 */
export const useRemoveMember = (): UseMutationResult<
  void,
  Error,
  { groupId: string; userId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }) => groupsService.removeMember(groupId, userId),
    onSuccess: (_, { groupId, userId }) => {
      // Invalidate group and user queries
      queryClient.invalidateQueries({ queryKey: groupKeys.withMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(userId) });
    },
  });
};
