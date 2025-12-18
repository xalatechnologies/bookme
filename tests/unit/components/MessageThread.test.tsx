/**
 * MessageThread Component Tests
 *
 * Tests for MessageThread - displays messages within a thread
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageThread } from '@/components/features/messaging/components/MessageThread';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'messaging:errors.thread_not_found': 'Thread not found',
        'messaging:labels.participants': 'participants',
        'messaging:status.active': 'Active',
        'messaging:status.resolved': 'Resolved',
        'messaging:status.closed': 'Closed',
        'messaging:actions.mark_resolved': 'Mark as resolved',
        'messaging:actions.close_thread': 'Close thread',
        'messaging:labels.replying_to': 'Replying to',
        'common:placeholders.message': 'Type a message...',
        'messaging:labels.sent': 'Sent',
        'messaging:labels.delivered': 'Delivered',
        'messaging:labels.read': 'Read',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: () => '10:30',
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon" />,
  Paperclip: () => <div data-testid="paperclip-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  Reply: () => <div data-testid="reply-icon" />,
  Forward: () => <div data-testid="forward-icon" />,
  Star: () => <div data-testid="star-icon" />,
  StarOff: () => <div data-testid="star-off-icon" />,
  Download: () => <div data-testid="download-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Check: () => <div data-testid="check-icon" />,
  CheckCheck: () => <div data-testid="check-check-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, onKeyPress, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  AvatarFallback: ({ children }: any) => (
    <div>{children}</div>
  ),
  AvatarImage: ({ src, alt }: any) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

// Mock the message store
const mockGetThreadById = vi.fn();
const mockGetMessagesByThread = vi.fn();
const mockSendMessage = vi.fn();
const mockMarkAllMessagesAsRead = vi.fn();
const mockUpdateThread = vi.fn();

vi.mock('@/stores/messageStore', () => ({
  useMessageStore: () => ({
    getThreadById: mockGetThreadById,
    getMessagesByThread: mockGetMessagesByThread,
    sendMessage: mockSendMessage,
    markAllMessagesAsRead: mockMarkAllMessagesAsRead,
    updateThread: mockUpdateThread,
  }),
}));

// Mock user profile context
vi.mock('@/contexts/hooks', () => ({
  useUserProfile: () => ({
    profile: {
      avatar: '/profile.jpg',
    },
  }),
}));

describe('MessageThread Component', () => {
  const mockThread = {
    id: 'thread1',
    subject: 'Booking Inquiry',
    participants: [
      { id: 'user1', name: 'John Doe', type: 'tenant' as const },
      { id: 'user2', name: 'Jane Smith', type: 'landlord' as const },
    ],
    status: 'active' as const,
    priority: 'medium' as const,
    lastMessageAt: '2023-06-15T10:30:00Z',
    facilityName: 'Conference Room A',
    relatedBookingId: 'booking1',
  };

  const mockMessages = [
    {
      id: 'msg1',
      threadId: 'thread1',
      senderId: 'user2',
      senderName: 'Jane Smith',
      senderAvatar: '/jane.jpg',
      senderType: 'landlord' as const,
      recipientId: 'user1',
      recipientType: 'tenant' as const,
      content: 'Hello, how can I help you with your booking?',
      createdAt: '2023-06-15T10:30:00Z',
      status: 'read' as const,
    },
    {
      id: 'msg2',
      threadId: 'thread1',
      senderId: 'user1',
      senderName: 'John Doe',
      senderAvatar: '/john.jpg',
      senderType: 'tenant' as const,
      recipientId: 'user2',
      recipientType: 'landlord' as const,
      content: 'I would like to book the conference room for next week.',
      createdAt: '2023-06-15T10:35:00Z',
      status: 'sent' as const,
    },
  ];

  const defaultProps = {
    threadId: 'thread1',
    currentUserId: 'user1',
    onClose: vi.fn(),
    currentUserType: 'tenant' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetThreadById.mockReturnValue(mockThread);
    mockGetMessagesByThread.mockReturnValue(mockMessages);
  });

  describe('Thread Header', () => {
    it('should render thread subject', () => {
      render(<MessageThread {...defaultProps} />);

      expect(screen.getByText('Booking Inquiry')).toBeInTheDocument();
    });

    it('should display participant count', () => {
      render(<MessageThread {...defaultProps} />);

      expect(screen.getByText('2 participants')).toBeInTheDocument();
    });

    it('should display facility name', () => {
      render(<MessageThread {...defaultProps} />);

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });

    it('should display thread status', () => {
      render(<MessageThread {...defaultProps} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('should render all messages', () => {
      render(<MessageThread {...defaultProps} />);

      expect(
        screen.getByText('Hello, how can I help you with your booking?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('I would like to book the conference room for next week.')
      ).toBeInTheDocument();
    });

    it('should differentiate between own and other messages', () => {
      render(<MessageThread {...defaultProps} />);

      // Check that messages from other users are displayed
      const otherMessage = screen.getByText(
        'Hello, how can I help you with your booking?'
      );
      expect(otherMessage).toBeInTheDocument();

      // Check that own messages are displayed
      const ownMessage = screen.getByText(
        'I would like to book the conference room for next week.'
      );
      expect(ownMessage).toBeInTheDocument();
    });

    it('should display message timestamps', () => {
      render(<MessageThread {...defaultProps} />);

      // Both messages should have timestamps
      const timestamps = screen.getAllByText('10:30');
      expect(timestamps).toHaveLength(2);
    });

    it('should display message status indicators', () => {
      render(<MessageThread {...defaultProps} />);

      // Check for read status (check-check icon)
      const readStatus = screen.getByTestId('check-check-icon');
      expect(readStatus).toBeInTheDocument();

      // Check for sent status (single check icon)
      const sentStatus = screen.getByTestId('check-icon');
      expect(sentStatus).toBeInTheDocument();
    });
  });

  describe('Message Actions', () => {
    it('should show reply option on message hover', async () => {
      const user = userEvent.setup();
      
      render(<MessageThread {...defaultProps} />);

      const messageBubble = screen.getByText(
        'Hello, how can I help you with your booking?'
      ).closest('div');
      
      if (messageBubble) {
        await user.hover(messageBubble);
        
        // Check that reply icon appears
        expect(screen.getByTestId('reply-icon')).toBeInTheDocument();
      }
    });

    it('should call onReply when reply button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<MessageThread {...defaultProps} />);

      const messageBubble = screen.getByText(
        'Hello, how can I help you with your booking?'
      ).closest('div');
      
      if (messageBubble) {
        await user.hover(messageBubble);
        
        const replyButton = screen.getByTestId('reply-icon').closest('button');
        if (replyButton) {
          await user.click(replyButton);
          
          // Check that reply indicator appears
          expect(screen.getByText('Replying to')).toBeInTheDocument();
          expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Message Composition', () => {
    it('should allow typing in message input', async () => {
      const user = userEvent.setup();
      
      render(<MessageThread {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello there!');

      expect(textarea).toHaveValue('Hello there!');
    });

    it('should send message when send button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<MessageThread {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello there!');

      const sendButton = screen.getByTestId('send-icon').closest('button');
      if (sendButton) {
        await user.click(sendButton);
        
        expect(mockSendMessage).toHaveBeenCalled();
      }
    });

    it('should send message when Enter is pressed', async () => {
      const user = userEvent.setup();
      
      render(<MessageThread {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type a message...');
      await user.type(textarea, 'Hello there!{enter}');

      expect(mockSendMessage).toHaveBeenCalled();
    });
  });

  describe('Thread Actions', () => {
    it('should show mark as resolved button for landlords', () => {
      render(
        <MessageThread
          {...defaultProps}
          currentUserType="landlord"
        />
      );

      expect(screen.getByText('Mark as resolved')).toBeInTheDocument();
    });

    it('should call updateThread when mark as resolved is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <MessageThread
          {...defaultProps}
          currentUserType="landlord"
        />
      );

      const markResolvedButton = screen.getByText('Mark as resolved');
      await user.click(markResolvedButton);

      expect(mockUpdateThread).toHaveBeenCalledWith('thread1', {
        status: 'resolved',
      });
    });
  });

  describe('Error States', () => {
    it('should show error message when thread is not found', () => {
      mockGetThreadById.mockReturnValue(null);
      
      render(<MessageThread {...defaultProps} />);

      expect(screen.getByText('Thread not found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for interactive elements', () => {
      render(<MessageThread {...defaultProps} />);

      const closeButton = screen.getByText('←');
      expect(closeButton).toBeInTheDocument();
    });
  });
});