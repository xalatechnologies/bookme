/**
 * Messaging Feature Types
 *
 * Type definitions for messaging components
 */

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type ThreadStatus = 'active' | 'archived' | 'deleted';

export interface IMessage {
  readonly id: string;
  readonly threadId: string;
  readonly senderId: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly status: MessageStatus;
  readonly attachments?: readonly string[];
}

export interface IThread {
  readonly id: string;
  readonly title: string;
  readonly participants: readonly string[];
  readonly status: ThreadStatus;
  readonly lastMessageAt: Date;
  readonly unreadCount: number;
}

export interface IMessageFilters {
  readonly status?: ThreadStatus | 'all';
  readonly search?: string;
  readonly unreadOnly?: boolean;
}
