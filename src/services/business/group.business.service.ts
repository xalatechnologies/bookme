/**
 * Group Business Logic Service
 *
 * Contains all business logic related to group operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { BookingGroup, GroupBooking } from "@/types/group";

export interface IGroupFilters {
  readonly searchTerm?: string;
  readonly ownerId?: string;
  readonly memberCount?: { readonly min: number; readonly max: number };
  readonly hasActiveBookings?: boolean;
}

export interface IGroupSortConfig {
  readonly sortBy: 'name' | 'members' | 'bookings' | 'created_at' | 'updated_at';
  readonly sortOrder: 'asc' | 'desc';
}

export interface IGroupStats {
  readonly totalMembers: number;
  readonly totalBookings: number;
  readonly totalCost: number;
  readonly averageCostPerMember: number;
}

/**
 * Filter groups based on search and filter criteria
 */
export const filterGroups = (
  groups: readonly BookingGroup[],
  filters: IGroupFilters
): readonly BookingGroup[] => {
  return groups.filter(group => {
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.members.some(member =>
          member.name.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower)
        );

      if (!matchesSearch) return false;
    }

    // Owner filter
    if (filters.ownerId) {
      if (group.ownerId !== filters.ownerId) return false;
    }

    // Member count filter
    if (filters.memberCount) {
      const { min, max } = filters.memberCount;
      if (group.members.length < min || group.members.length > max) return false;
    }

    // Active bookings filter
    if (filters.hasActiveBookings !== undefined) {
      const hasBookings = group.bookings.length > 0;
      if (filters.hasActiveBookings !== hasBookings) return false;
    }

    return true;
  });
};

/**
 * Sort groups based on sort configuration
 */
export const sortGroups = (
  groups: readonly BookingGroup[],
  sortConfig: IGroupSortConfig
): readonly BookingGroup[] => {
  const sorted = [...groups].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'members':
        comparison = a.members.length - b.members.length;
        break;
      case 'bookings':
        comparison = a.bookings.length - b.bookings.length;
        break;
      case 'created_at':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Validate group data
 */
export const validateGroupData = (group: Partial<BookingGroup>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!group.name || group.name.trim().length < 3) {
    errors.push('Group name must be at least 3 characters');
  }

  if (!group.description || group.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!group.ownerId) {
    errors.push('Owner ID is required');
  }

  if (group.settings) {
    if (typeof group.settings.maxBookingsPerMember !== 'number' || group.settings.maxBookingsPerMember < 1) {
      errors.push('Max bookings per member must be at least 1');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate if a group can be deleted
 */
export const canDeleteGroup = (group: BookingGroup): { canDelete: boolean; reason?: string } => {
  // Business rule: Can't delete groups with active bookings
  if (group.bookings.length > 0) {
    return {
      canDelete: false,
      reason: 'Cannot delete group with active bookings. Cancel all bookings first.'
    };
  }

  // Business rule: Only owners can delete groups
  // This check would be done by caller with userId comparison
  return { canDelete: true };
};

/**
 * Validate if a member can leave a group
 */
export const canLeaveGroup = (
  group: BookingGroup,
  userId: string
): { canLeave: boolean; reason?: string } => {
  // Business rule: Owners cannot leave their own groups
  if (group.ownerId === userId) {
    return {
      canLeave: false,
      reason: 'Group owner cannot leave. Transfer ownership or delete the group instead.'
    };
  }

  // Check if user is actually a member
  const isMember = group.members.some(member => member.userId === userId);
  if (!isMember) {
    return {
      canLeave: false,
      reason: 'User is not a member of this group.'
    };
  }

  return { canLeave: true };
};

/**
 * Validate if a user can invite members to a group
 */
export const canInviteMember = (
  group: BookingGroup,
  userId: string
): { canInvite: boolean; reason?: string } => {
  const member = group.members.find(m => m.userId === userId);

  if (!member) {
    return {
      canInvite: false,
      reason: 'User is not a member of this group.'
    };
  }

  // Business rule: Only owners and admins can invite
  if (member.role !== 'owner' && member.role !== 'admin') {
    return {
      canInvite: false,
      reason: 'Only group owners and admins can invite members.'
    };
  }

  return { canInvite: true };
};

/**
 * Calculate group statistics
 */
export const calculateGroupStats = (
  group: BookingGroup,
  groupBookings: readonly GroupBooking[]
): IGroupStats => {
  const bookingsForGroup = groupBookings.filter(b => b.groupId === group.id);

  const totalMembers = group.members.length;
  const totalBookings = bookingsForGroup.length;
  const totalCost = bookingsForGroup.reduce((sum, booking) => sum + booking.costSharing.totalCost, 0);
  const averageCostPerMember = totalMembers > 0 ? totalCost / totalMembers : 0;

  return {
    totalMembers,
    totalBookings,
    totalCost,
    averageCostPerMember,
  };
};

/**
 * Split cost between members
 */
export const splitCostBetweenMembers = (
  totalCost: number,
  memberIds: readonly string[],
  customShares?: ReadonlyMap<string, number>
): readonly { readonly userId: string; readonly share: number }[] => {
  // If custom shares provided, use them
  if (customShares && customShares.size > 0) {
    const totalShares = Array.from(customShares.values()).reduce((sum, share) => sum + share, 0);

    return memberIds.map(memberId => {
      const memberShare = customShares.get(memberId) || 0;
      const shareAmount = (memberShare / totalShares) * totalCost;

      return {
        userId: memberId,
        share: Math.round(shareAmount * 100) / 100, // Round to 2 decimals
      };
    });
  }

  // Equal split by default
  const sharePerMember = totalCost / memberIds.length;

  return memberIds.map(memberId => ({
    userId: memberId,
    share: Math.round(sharePerMember * 100) / 100, // Round to 2 decimals
  }));
};

/**
 * Get active members from a group
 */
export const getActiveMembers = (group: BookingGroup): readonly BookingGroup['members'] => {
  return group.members.filter(member => {
    // In real implementation, check last activity timestamp
    return true; // For now, all members are considered active
  });
};

/**
 * Check if member has permission for action
 */
export const hasPermission = (
  group: BookingGroup,
  userId: string,
  action: 'book' | 'invite' | 'remove_member' | 'modify_settings'
): boolean => {
  const member = group.members.find(m => m.userId === userId);

  if (!member) return false;

  switch (action) {
    case 'book':
      return group.settings.allowMemberBookings || member.role === 'owner' || member.role === 'admin';
    case 'invite':
      return member.role === 'owner' || member.role === 'admin';
    case 'remove_member':
      return member.role === 'owner' || member.role === 'admin';
    case 'modify_settings':
      return member.role === 'owner';
    default:
      return false;
  }
};

/**
 * Format group for display
 */
export const formatGroupForDisplay = (group: BookingGroup) => {
  return {
    ...group,
    formattedCreatedAt: new Date(group.createdAt).toLocaleDateString('no-NO'),
    formattedUpdatedAt: new Date(group.updatedAt).toLocaleDateString('no-NO'),
    memberCount: group.members.length,
    bookingCount: group.bookings.length,
    hasInvitations: group.invitations.some(inv => inv.status === 'pending'),
  };
};
