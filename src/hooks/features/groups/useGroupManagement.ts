/**
 * Group Management Hook
 *
 * Connects UI components to group business logic and data services.
 * Provides a clean interface for group management operations including
 * member management, cost splitting, invitation handling, and permissions.
 * Follows clean architecture principles with clear separation of concerns.
 *
 * **Phase 6 Update:** Now fetches data internally using React Query services.
 * Components no longer need to pass data as props.
 */

import { useMemo, useCallback } from 'react';
import { useGroupUIStore, type TGroupView, type TGroupSortBy } from '@/stores/groupUIStore';
import {
  useUserGroups,
  useGroupBookings,
  type GroupWithMembers,
} from '@/services/supabase/groups.service';
import { useAuth } from '@/contexts/AuthContext';
import {
  filterGroups,
  sortGroups,
  validateGroupData,
  canDeleteGroup,
  canLeaveGroup,
  canInviteMember,
  calculateGroupStats,
  splitCostBetweenMembers,
  getActiveMembers,
  hasPermission,
  formatGroupForDisplay,
  type IGroupFilters,
  type IGroupSortConfig,
  type IGroupStats,
} from '@/services/business/group.business.service';
import type { BookingGroup, GroupBooking } from '@/types/group';

export interface IUseGroupManagementReturn {
  // Data (would be fetched from API in real implementation)
  readonly groups: readonly BookingGroup[];
  readonly filteredGroups: readonly BookingGroup[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // UI State
  readonly view: TGroupView;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly memberCountRange: { readonly min: number; readonly max: number };
  readonly statusFilter: readonly string[];
  readonly sortBy: TGroupSortBy;
  readonly sortOrder: string;
  readonly selectedGroupIds: readonly string[];
  readonly modals: {
    readonly create: boolean;
    readonly edit: boolean;
    readonly invite: boolean;
    readonly leave: boolean;
    readonly delete: boolean;
  };
  readonly activeGroupId: string | null;

  // UI Actions
  readonly setView: (view: TGroupView) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly setMemberCountRange: (range: { min: number; max: number }) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly toggleSort: (sortBy: TGroupSortBy) => void;
  readonly toggleGroupSelection: (id: string) => void;
  readonly selectAllGroups: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;
  readonly openModal: (modal: 'create' | 'edit' | 'invite' | 'leave' | 'delete', groupId?: string) => void;
  readonly closeModal: (modal: 'create' | 'edit' | 'invite' | 'leave' | 'delete') => void;
  readonly closeAllModals: () => void;
  readonly setActiveGroupId: (id: string | null) => void;

  // Business Operations
  readonly validateGroupData: (group: Partial<BookingGroup>) => { isValid: boolean; errors: string[] };
  readonly canDeleteGroup: (group: BookingGroup) => { canDelete: boolean; reason?: string };
  readonly canLeaveGroup: (group: BookingGroup, userId: string) => { canLeave: boolean; reason?: string };
  readonly canInviteMember: (group: BookingGroup, userId: string) => { canInvite: boolean; reason?: string };
  readonly calculateGroupStats: (group: BookingGroup, groupBookings: readonly GroupBooking[]) => IGroupStats;
  readonly splitCostBetweenMembers: (
    totalCost: number,
    memberIds: readonly string[],
    customShares?: ReadonlyMap<string, number>
  ) => readonly { readonly userId: string; readonly share: number }[];
  readonly getActiveMembers: (group: BookingGroup) => readonly BookingGroup['members'];
  readonly hasPermission: (
    group: BookingGroup,
    userId: string,
    action: 'book' | 'invite' | 'remove_member' | 'modify_settings'
  ) => boolean;
  readonly formatGroupForDisplay: (group: BookingGroup) => ReturnType<typeof formatGroupForDisplay>;
}

/**
 * Hook for managing groups with business logic separation
 *
 * **Phase 6 Complete:** Now fetches data internally using React Query.
 *
 * Provides comprehensive group management functionality including:
 * - ✅ Data fetching with React Query (automatic caching, refetching)
 * - ✅ UI state management via Zustand store
 * - ✅ Business logic validation and operations
 * - ✅ Filtering by name, members, bookings
 * - ✅ Sorting by multiple criteria
 * - ✅ Member management and permissions
 * - ✅ Cost splitting calculations
 * - ✅ Invitation handling
 *
 * @returns Complete group management interface with loading/error states
 *
 * @example
 * ```tsx
 * function GroupManagementPage() {
 *   const {
 *     filteredGroups,
 *     isLoading,
 *     error,
 *     searchTerm,
 *     setSearchTerm,
 *     canInviteMember,
 *     splitCostBetweenMembers,
 *     openModal,
 *   } = useGroupManagement();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   const handleInvite = (group: BookingGroup, userId: string) => {
 *     const validation = canInviteMember(group, userId);
 *     if (!validation.canInvite) {
 *       toast.error(validation.reason);
 *       return;
 *     }
 *     openModal('invite', group.id);
 *   };
 *
 *   return (
 *     <div>
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <GroupGrid groups={filteredGroups} onInvite={handleInvite} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useGroupManagement = (): IUseGroupManagementReturn => {
  // Authentication - get current user
  const { user } = useAuth();

  // Data layer - React Query fetches data automatically
  const {
    data: groups = [],
    isLoading: groupsLoading,
    error: groupsError,
  } = useUserGroups(user?.id || '', !!user);

  // Fetch bookings for active group (if one is selected)
  const { activeGroupId } = useGroupUIStore();
  const {
    data: groupBookingsData = [],
    isLoading: bookingsLoading,
  } = useGroupBookings(activeGroupId || '', !!activeGroupId);

  // Combine loading states
  const isLoading = groupsLoading || (!!activeGroupId && bookingsLoading);
  const error = groupsError as Error | null;

  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    showFilters,
    searchTerm,
    memberCountRange,
    statusFilter,
    sortBy,
    sortOrder,
    selectedGroupIds,
    modals,
    activeGroupId,
    setView,
    toggleFilters,
    setSearchTerm,
    setMemberCountRange,
    toggleStatusFilter,
    toggleSort,
    toggleGroupSelection,
    selectAllGroups: selectAll,
    clearSelection,
    resetFilters,
    openModal,
    closeModal,
    closeAllModals,
    setActiveGroupId,
  } = useGroupUIStore();

  // Business logic layer - filtering and sorting
  const filteredGroups = useMemo(() => {
    const filters: IGroupFilters = {
      searchTerm,
      memberCount: memberCountRange,
    };

    const filtered = filterGroups(groups, filters);

    const sortConfig: IGroupSortConfig = {
      sortBy: sortBy === 'member_count'
        ? 'members'
        : sortBy === 'status'
        ? 'name' // Map status to name since status doesn't exist in sort config
        : sortBy === 'updated_at'
        ? 'updated_at'
        : sortBy === 'created_at'
        ? 'created_at'
        : 'name',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return sortGroups(filtered, sortConfig);
  }, [groups, searchTerm, memberCountRange, sortBy, sortOrder]);

  // Business operations - wrapped with useCallback for stability
  const calculateGroupStatsCallback = useCallback(
    (group: BookingGroup, bookings?: readonly GroupBooking[]): IGroupStats => {
      // Use provided bookings or fetched bookings from active group
      const bookingsToUse = bookings || groupBookingsData;
      return calculateGroupStats(group, bookingsToUse);
    },
    [groupBookingsData]
  );

  const splitCostBetweenMembersCallback = useCallback(
    (
      totalCost: number,
      memberIds: readonly string[],
      customShares?: ReadonlyMap<string, number>
    ): readonly { readonly userId: string; readonly share: number }[] => {
      return splitCostBetweenMembers(totalCost, memberIds, customShares);
    },
    []
  );

  const getActiveMembersCallback = useCallback(
    (group: BookingGroup): readonly BookingGroup['members'] => {
      return getActiveMembers(group);
    },
    []
  );

  const hasPermissionCallback = useCallback(
    (
      group: BookingGroup,
      userId: string,
      action: 'book' | 'invite' | 'remove_member' | 'modify_settings'
    ): boolean => {
      return hasPermission(group, userId, action);
    },
    []
  );

  const formatGroupForDisplayCallback = useCallback(
    (group: BookingGroup): ReturnType<typeof formatGroupForDisplay> => {
      return formatGroupForDisplay(group);
    },
    []
  );

  const canLeaveGroupCallback = useCallback(
    (group: BookingGroup, userId: string): { canLeave: boolean; reason?: string } => {
      return canLeaveGroup(group, userId);
    },
    []
  );

  const canInviteMemberCallback = useCallback(
    (group: BookingGroup, userId: string): { canInvite: boolean; reason?: string } => {
      return canInviteMember(group, userId);
    },
    []
  );

  const selectAllGroups = useCallback(() => {
    selectAll(filteredGroups.map((g) => g.id));
  }, [filteredGroups, selectAll]);

  return {
    // Data
    groups,
    filteredGroups,
    isLoading,
    error,

    // UI State
    view,
    showFilters,
    searchTerm,
    memberCountRange,
    statusFilter,
    sortBy,
    sortOrder,
    selectedGroupIds,
    modals,
    activeGroupId,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    setMemberCountRange,
    toggleStatusFilter,
    toggleSort,
    toggleGroupSelection,
    selectAllGroups,
    clearSelection,
    resetFilters,
    openModal,
    closeModal,
    closeAllModals,
    setActiveGroupId,

    // Business Operations
    validateGroupData,
    canDeleteGroup,
    canLeaveGroup: canLeaveGroupCallback,
    canInviteMember: canInviteMemberCallback,
    calculateGroupStats: calculateGroupStatsCallback,
    splitCostBetweenMembers: splitCostBetweenMembersCallback,
    getActiveMembers: getActiveMembersCallback,
    hasPermission: hasPermissionCallback,
    formatGroupForDisplay: formatGroupForDisplayCallback,
  };
};
