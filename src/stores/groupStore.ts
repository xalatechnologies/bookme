"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { 
  BookingGroup, 
  CreateGroupData, 
  UpdateGroupData, 
  AddMemberData, 
  InviteMemberData,
  GroupInvitation,
  GroupBooking,
  CreateGroupBookingData,
  GroupStatistics
} from "@/types/group";

/**
 * Group store interface for managing booking groups state
 * 
 * Provides CRUD operations for groups, members, invitations, and group bookings
 * with localStorage persistence and full state management.
 */
interface GroupState {
  readonly groups: readonly BookingGroup[];
  readonly invitations: readonly GroupInvitation[];
  readonly groupBookings: readonly GroupBooking[];
  
  // Group management
  readonly createGroup: (group: CreateGroupData) => string;
  readonly updateGroup: (id: string, updates: UpdateGroupData) => void;
  readonly deleteGroup: (id: string) => void;
  readonly getGroupById: (id: string) => BookingGroup | undefined;
  readonly getUserGroups: (userId: string) => readonly BookingGroup[];
  readonly getGroupsByOwner: (ownerId: string) => readonly BookingGroup[];
  
  // Member management
  readonly addMember: (groupId: string, member: AddMemberData) => void;
  readonly removeMember: (groupId: string, userId: string) => void;
  readonly updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'member') => void;
  readonly getGroupMembers: (groupId: string) => readonly BookingGroup['members'];
  
  // Invitation management
  readonly inviteMember: (groupId: string, invitation: InviteMemberData) => string;
  readonly respondToInvitation: (invitationId: string, response: 'accepted' | 'declined', userId?: string) => void;
  readonly getPendingInvitations: (email: string) => readonly GroupInvitation[];
  readonly getUserInvitations: (userId: string) => readonly GroupInvitation[];
  readonly expireInvitation: (invitationId: string) => void;
  
  // Group booking management
  readonly createGroupBooking: (booking: CreateGroupBookingData) => string;
  readonly updateGroupBooking: (id: string, updates: Partial<GroupBooking>) => void;
  readonly cancelGroupBooking: (id: string) => void;
  readonly getGroupBookings: (groupId: string) => readonly GroupBooking[];
  readonly getUserGroupBookings: (userId: string) => readonly GroupBooking[];
  
  // Statistics and analytics
  readonly getGroupStatistics: (groupId: string) => GroupStatistics | undefined;
  readonly getMemberStatistics: (groupId: string, userId: string) => {
    readonly bookingCount: number;
    readonly totalCost: number;
    readonly averageCost: number;
    readonly lastBooking?: Date;
  };
  
  // Utility functions
  readonly clearAllData: () => void;
  readonly isUserMember: (groupId: string, userId: string) => boolean;
  readonly isUserOwner: (groupId: string, userId: string) => boolean;
  readonly isUserAdmin: (groupId: string, userId: string) => boolean;
  readonly canUserBook: (groupId: string, userId: string) => boolean;
}

/**
 * Generate unique ID for groups
 */
const generateGroupId = (): string => {
  return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for invitations
 */
const generateInvitationId = (): string => {
  return `invitation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for group bookings
 */
const generateGroupBookingId = (): string => {
  return `group_booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Group store implementation
 * 
 * Manages booking groups state with localStorage persistence and full CRUD operations
 */
export const useGroupStore = create<GroupState>()(
  devtools(
    persist(
      (set, get) => ({
        groups: [],
        invitations: [],
        groupBookings: [],

        createGroup: (groupData: CreateGroupData): string => {
          const id = generateGroupId();
          const now = new Date().toISOString();
          
          const newGroup: BookingGroup = {
            id,
            ...groupData,
            members: [{
              userId: groupData.ownerId,
              name: "Group Owner", // This should come from user context
              email: "owner@example.com", // This should come from user context
              role: 'owner',
              joinedAt: now
            }],
            invitations: [],
            bookings: [],
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            groups: [...state.groups, newGroup]
          }));

          return id;
        },

        updateGroup: (id: string, updates: UpdateGroupData): void => {
          set((state) => ({
            groups: state.groups.map((group) =>
              group.id === id
                ? {
                    ...group,
                    ...updates,
                    updatedAt: new Date().toISOString()
                  }
                : group
            )
          }));
        },

        deleteGroup: (id: string): void => {
          set((state) => ({
            groups: state.groups.filter((group) => group.id !== id),
            groupBookings: state.groupBookings.filter((booking) => booking.groupId !== id)
          }));
        },

        getGroupById: (id: string): BookingGroup | undefined => {
          return get().groups.find((group) => group.id === id);
        },

        getUserGroups: (userId: string): readonly BookingGroup[] => {
          return get().groups.filter((group) =>
            group.members.some((member) => member.userId === userId)
          );
        },

        getGroupsByOwner: (ownerId: string): readonly BookingGroup[] => {
          return get().groups.filter((group) => group.ownerId === ownerId);
        },

        addMember: (groupId: string, member: AddMemberData): void => {
          set((state) => ({
            groups: state.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    members: [
                      ...group.members,
                      {
                        ...member,
                        joinedAt: new Date().toISOString()
                      }
                    ],
                    updatedAt: new Date().toISOString()
                  }
                : group
            )
          }));
        },

        removeMember: (groupId: string, userId: string): void => {
          set((state) => ({
            groups: state.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    members: group.members.filter((member) => member.userId !== userId),
                    updatedAt: new Date().toISOString()
                  }
                : group
            )
          }));
        },

        updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'member'): void => {
          set((state) => ({
            groups: state.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    members: group.members.map((member) =>
                      member.userId === userId
                        ? { ...member, role }
                        : member
                    ),
                    updatedAt: new Date().toISOString()
                  }
                : group
            )
          }));
        },

        getGroupMembers: (groupId: string): readonly BookingGroup['members'] => {
          const group = get().groups.find((group) => group.id === groupId);
          return group?.members || [];
        },

        inviteMember: (groupId: string, invitation: InviteMemberData): string => {
          const id = generateInvitationId();
          const now = new Date().toISOString();
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

          const newInvitation: GroupInvitation = {
            id,
            groupId,
            ...invitation,
            status: 'pending',
            invitedAt: now,
            expiresAt
          };

          set((state) => ({
            invitations: [...state.invitations, newInvitation],
            groups: state.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    invitations: [
                      ...group.invitations,
                      {
                        email: invitation.email,
                        status: 'pending',
                        invitedAt: now,
                        invitedBy: invitation.invitedBy
                      }
                    ],
                    updatedAt: new Date().toISOString()
                  }
                : group
            )
          }));

          return id;
        },

        respondToInvitation: (invitationId: string, response: 'accepted' | 'declined', userId?: string): void => {
          const invitation = get().invitations.find((inv) => inv.id === invitationId);
          if (!invitation) return;

          const now = new Date().toISOString();

          set((state) => ({
            invitations: state.invitations.map((inv) =>
              inv.id === invitationId
                ? {
                    ...inv,
                    status: response,
                    ...(response === 'accepted' && { acceptedAt: now }),
                    ...(response === 'declined' && { declinedAt: now })
                  }
                : inv
            ),
            groups: response === 'accepted' && userId
              ? state.groups.map((group) =>
                  group.id === invitation.groupId
                    ? {
                        ...group,
                        members: [
                          ...group.members,
                          {
                            userId,
                            name: "New Member", // This should come from user context
                            email: invitation.email,
                            role: 'member',
                            joinedAt: now
                          }
                        ],
                        invitations: group.invitations.map((inv) =>
                          inv.email === invitation.email
                            ? { ...inv, status: 'accepted' }
                            : inv
                        ),
                        updatedAt: now
                      }
                    : group
                )
              : state.groups
          }));
        },

        getPendingInvitations: (email: string): readonly GroupInvitation[] => {
          return get().invitations.filter(
            (invitation) => invitation.email === email && invitation.status === 'pending'
          );
        },

        getUserInvitations: (userId: string): readonly GroupInvitation[] => {
          return get().invitations.filter((invitation) => invitation.invitedBy === userId);
        },

        expireInvitation: (invitationId: string): void => {
          set((state) => ({
            invitations: state.invitations.map((invitation) =>
              invitation.id === invitationId
                ? { ...invitation, status: 'expired' }
                : invitation
            )
          }));
        },

        createGroupBooking: (bookingData: CreateGroupBookingData): string => {
          const id = generateGroupBookingId();
          const now = new Date().toISOString();

          const newBooking: GroupBooking = {
            id,
            ...bookingData,
            status: 'pending',
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            groupBookings: [...state.groupBookings, newBooking],
            groups: state.groups.map((group) =>
              group.id === bookingData.groupId
                ? {
                    ...group,
                    bookings: [...group.bookings, id],
                    updatedAt: now
                  }
                : group
            )
          }));

          return id;
        },

        updateGroupBooking: (id: string, updates: Partial<GroupBooking>): void => {
          set((state) => ({
            groupBookings: state.groupBookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    ...updates,
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        cancelGroupBooking: (id: string): void => {
          set((state) => ({
            groupBookings: state.groupBookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: 'cancelled',
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        getGroupBookings: (groupId: string): readonly GroupBooking[] => {
          return get().groupBookings.filter((booking) => booking.groupId === groupId);
        },

        getUserGroupBookings: (userId: string): readonly GroupBooking[] => {
          return get().groupBookings.filter((booking) => booking.createdBy === userId);
        },

        getGroupStatistics: (groupId: string): GroupStatistics | undefined => {
          const group = get().groups.find((group) => group.id === groupId);
          if (!group) return undefined;

          const bookings = get().groupBookings.filter((booking) => booking.groupId === groupId);
          const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed');
          const pendingBookings = bookings.filter((booking) => booking.status === 'pending');
          const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled');

          const totalCost = bookings.reduce((sum, booking) => sum + booking.costSharing.totalCost, 0);
          const averageCostPerBooking = bookings.length > 0 ? totalCost / bookings.length : 0;

          // Find most active member
          const memberStats = group.members.map((member) => {
            const memberBookings = bookings.filter((booking) => booking.createdBy === member.userId);
            return {
              userId: member.userId,
              name: member.name,
              bookingCount: memberBookings.length
            };
          });

          const mostActiveMember = memberStats.reduce((max, member) =>
            member.bookingCount > max.bookingCount ? member : max
          );

          return {
            totalMembers: group.members.length,
            activeMembers: group.members.filter((member) => member.isActive !== false).length,
            totalBookings: bookings.length,
            confirmedBookings: confirmedBookings.length,
            pendingBookings: pendingBookings.length,
            cancelledBookings: cancelledBookings.length,
            totalCost,
            averageCostPerBooking,
            mostActiveMember,
            recentActivity: [] // This would be populated with actual activity data
          };
        },

        getMemberStatistics: (groupId: string, userId: string): {
          readonly bookingCount: number;
          readonly totalCost: number;
          readonly averageCost: number;
          readonly lastBooking?: Date;
        } => {
          const bookings = get().groupBookings.filter(
            (booking) => booking.groupId === groupId && booking.createdBy === userId
          );

          const totalCost = bookings.reduce((sum, booking) => sum + booking.costSharing.totalCost, 0);
          const averageCost = bookings.length > 0 ? totalCost / bookings.length : 0;
          const lastBooking = bookings.length > 0 
            ? new Date(Math.max(...bookings.map(b => new Date(b.createdAt).getTime())))
            : undefined;

          return {
            bookingCount: bookings.length,
            totalCost,
            averageCost,
            lastBooking
          };
        },

        clearAllData: (): void => {
          set({
            groups: [],
            invitations: [],
            groupBookings: []
          });
        },

        isUserMember: (groupId: string, userId: string): boolean => {
          const group = get().groups.find((group) => group.id === groupId);
          return group?.members.some((member) => member.userId === userId) || false;
        },

        isUserOwner: (groupId: string, userId: string): boolean => {
          const group = get().groups.find((group) => group.id === groupId);
          return group?.ownerId === userId || false;
        },

        isUserAdmin: (groupId: string, userId: string): boolean => {
          const group = get().groups.find((group) => group.id === groupId);
          const member = group?.members.find((member) => member.userId === userId);
          return member?.role === 'admin' || member?.role === 'owner' || false;
        },

        canUserBook: (groupId: string, userId: string): boolean => {
          const group = get().groups.find((group) => group.id === groupId);
          if (!group) return false;

          const member = group.members.find((member) => member.userId === userId);
          if (!member) return false;

          if (!group.settings.allowMemberBookings) return false;

          // Check if user has reached max bookings limit
          const userBookings = get().groupBookings.filter(
            (booking) => booking.groupId === groupId && booking.createdBy === userId
          );
          
          return userBookings.length < group.settings.maxBookingsPerMember;
        }
      }),
      {
        name: "group-store",
        version: 1
      }
    ),
    {
      name: "group-store"
    }
  )
);

