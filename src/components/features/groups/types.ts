/**
 * Groups Domain Types
 */

export interface IGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  ownerId: string;
}

export interface IGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface IGroupInvitation {
  id: string;
  groupId: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export type GroupRole = 'owner' | 'admin' | 'member';
