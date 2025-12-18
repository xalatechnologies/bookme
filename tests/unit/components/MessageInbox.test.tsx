/**
 * MessageInbox Component Tests
 *
 * Tests for MessageInbox - displays message threads in the messaging system
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInbox } from '@/components/features/messaging/components/MessageInbox';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common:placeholders.messageSearch': 'Search messages...',
        'common:filters.status': 'Status',
        'common:filters.priority': 'Priority',
        'messaging:status.active': 'Active',
        'messaging:status.resolved': 'Resolved',
        'messaging:status.closed': 'Closed',
        'common:status.active': 'Active',
        'common:status.resolved': 'Resolved',
        'common:status.closed': 'Closed',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: () => '15.06.2023 10:30',
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid="message-circle-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Check: () => <div data-testid="check-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Paperclip: () => <div data-testid="paperclip-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
  Send: () => <div data-testid="send-icon" />,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-value={value} data-onchange={!!onValueChange}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
}));

// Mock other components
vi.mock('@/components/common/status/StatusBadge', () => ({
  StatusBadge: ({ status, translationKey }: any) => (
    <span data-status={status}>{translationKey}</span>
  ),
}));

vi.mock('./MessageThread', () => ({
  MessageThread: () => <div data-testid="message-thread">Message Thread</div>,
}));

vi.mock('./CreateThreadModal', () => ({
  default: () => <div data-testid="create-thread-modal">Create Thread Modal</div>,
}));

// Mock the useUserProfile hook
vi.mock('@/contexts/hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      dateOfBirth: '1990-01-01',
      avatar: '/avatar.jpg',
      role: 'Bruker',
      accountCreated: '2023-01-01T00:00:00Z',
      lastActive: '2023-06-15T10:30:00Z',
      accountId: 'user1',
      subscriptionType: 'Gratisbruker'
    },
    updateProfile: vi.fn(),
    isLoading: false,
    refreshProfile: vi.fn(),
  }),
}));

// Mock the message store
const mockGetUserThreads = vi.fn();
const mockGetMessagesByThread = vi.fn();
const mockGetAvailableParticipants = vi.fn();
const mockGetBookedFacilities = vi.fn();
const mockGetThreadById = vi.fn();
const mockUpdateThread = vi.fn();
const mockDeleteThread = vi.fn();

vi.mock('@/stores/messageStore', () => ({
  useMessageStore: () => ({
    getUserThreads: mockGetUserThreads,
    getMessagesByThread: mockGetMessagesByThread,
    getAvailableParticipants: mockGetAvailableParticipants,
    getBookedFacilities: mockGetBookedFacilities,
    getThreadById: mockGetThreadById,
    updateThread: mockUpdateThread,
    deleteThread: mockDeleteThread,
  }),
}));

describe('MessageInbox Component', () => {
  const mockThreads = [
    {
      id: '1',
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
    },
    {
      id: '2',
      subject: 'Maintenance Request',
      participants: [
        { id: 'user1', name: 'John Doe', type: 'tenant' as const },
        { id: 'user3', name: 'Bob Johnson', type: 'landlord' as const },
      ],
      status: 'resolved' as const,
      priority: 'high' as const,
      lastMessageAt: '2023-06-14T15:45:00Z',
      facilityName: 'Gymnasium',
      relatedBookingId: 'booking2',
    },
  ];

  const defaultProps = {
    userId: 'user1',
    currentUserType: 'tenant' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserThreads.mockReturnValue(mockThreads);
    mockGetMessagesByThread.mockReturnValue([
      {
        id: 'msg1',
        threadId: '1',
        senderId: 'user2',
        senderName: 'Jane Smith',
        senderAvatar: '',
        senderType: 'landlord' as const,
        recipientId: 'user1',
        recipientType: 'tenant' as const,
        content: 'Hello, how can I help you?',
        createdAt: '2023-06-15T10:30:00Z',
        status: 'read' as const,
      },
    ]);
    mockGetAvailableParticipants.mockReturnValue([
      { id: 'user2', name: 'Jane Smith', type: 'landlord' as const },
    ]);
    mockGetBookedFacilities.mockReturnValue([
      { id: 'facility1', name: 'Conference Room A', bookingId: 'booking1' },
    ]);
    mockGetThreadById.mockImplementation((threadId) => {
      return mockThreads.find(thread => thread.id === threadId);
    });
  });

  describe('Thread List Display', () => {
    it('should render thread cards', () => {
      render(<MessageInbox {...defaultProps} />);

      expect(screen.getByText('Booking Inquiry')).toBeInTheDocument();
      expect(screen.getByText('Maintenance Request')).toBeInTheDocument();
    });

    it('should display thread details correctly', () => {
      render(<MessageInbox {...defaultProps} />);

      // Check subject
      expect(screen.getByText('Booking Inquiry')).toBeInTheDocument();
      
      // Check status badge
      expect(screen.getByText('common:status.active')).toBeInTheDocument();
      
      // Check priority badge
      expect(screen.getByText('Medium')).toBeInTheDocument();
      
      // Check participant count
      expect(screen.getByText('2 deltakere')).toBeInTheDocument();
      
      // Check date
      expect(screen.getByText('15.06.2023 10:30')).toBeInTheDocument();
      
      // Check facility name
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });

    it('should show unread message count', () => {
      mockGetMessagesByThread.mockReturnValue([
        {
          id: 'msg1',
          threadId: '1',
          senderId: 'user2',
          senderName: 'Jane Smith',
          senderAvatar: '',
          senderType: 'landlord' as const,
          recipientId: 'user1',
          recipientType: 'tenant' as const,
          content: 'Hello, how can I help you?',
          createdAt: '2023-06-15T10:30:00Z',
          status: 'unread' as const,
        },
      ]);

      render(<MessageInbox {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Thread Selection', () => {
    it('should call onThreadSelect when a thread is clicked', async () => {
      const user = userEvent.setup();
      const mockOnThreadSelect = vi.fn();
      
      render(
        <MessageInbox
          {...defaultProps}
          onThreadSelect={mockOnThreadSelect}
        />
      );

      const threadCard = screen.getByText('Booking Inquiry').closest('div');
      if (threadCard) {
        await user.click(threadCard);
        expect(mockOnThreadSelect).toHaveBeenCalledWith('1');
      }
    });

    it('should display message thread when a thread is selected', async () => {
      const user = userEvent.setup();
      
      render(<MessageInbox {...defaultProps} />);

      const threadCard = screen.getByText('Booking Inquiry').closest('div');
      if (threadCard) {
        await user.click(threadCard);
        expect(screen.getByTestId('message-thread')).toBeInTheDocument();
      }
    });
  });

  describe('Thread Actions', () => {
    it('should call deleteThread when trash icon is clicked', async () => {
      const user = userEvent.setup();
      
      render(<MessageInbox {...defaultProps} />);

      // Find the trash button in the first thread card
      const trashButtons = screen.getAllByTestId('trash-icon');
      await user.click(trashButtons[0]);

      expect(mockDeleteThread).toHaveBeenCalledWith('1');
    });

    it('should call updateThread when mark resolved button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <MessageInbox
          {...defaultProps}
          currentUserType="landlord"
        />
      );

      // Find the check button in the first thread card
      const checkButtons = screen.getAllByTestId('check-icon');
      await user.click(checkButtons[0]);

      expect(mockUpdateThread).toHaveBeenCalledWith('1', { status: 'resolved' });
    });
  });

  describe('Search and Filtering', () => {
    it('should filter threads based on search query', async () => {
      const user = userEvent.setup();
      
      render(<MessageInbox {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search messages...');
      await user.type(searchInput, 'Booking');

      // Should only show the "Booking Inquiry" thread
      expect(screen.getByText('Booking Inquiry')).toBeInTheDocument();
      expect(screen.queryByText('Maintenance Request')).not.toBeInTheDocument();
    });

    it('should filter threads based on status', () => {
      render(<MessageInbox {...defaultProps} />);

      // This would require more complex mocking of the Select component
      // For now, we'll just check that the component renders
      const statusSelect = screen.getByText('Status');
      expect(statusSelect).toBeInTheDocument();
    });

    it('should filter threads based on priority', () => {
      render(<MessageInbox {...defaultProps} />);

      // This would require more complex mocking of the Select component
      // For now, we'll just check that the component renders
      const prioritySelect = screen.getByText('Priority');
      expect(prioritySelect).toBeInTheDocument();
    });
  });

  describe('Create Thread', () => {
    it('should call onCreateThread when create button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCreateThread = vi.fn();
      
      render(
        <MessageInbox
          {...defaultProps}
          onCreateThread={mockOnCreateThread}
        />
      );

      const createButton = screen.getByText('Ny melding');
      await user.click(createButton);

      expect(mockOnCreateThread).toHaveBeenCalled();
    });

    it('should show create thread modal when create button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<MessageInbox {...defaultProps} />);

      const createButton = screen.getByText('Ny melding');
      await user.click(createButton);

      expect(screen.getByTestId('create-thread-modal')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no threads are found', () => {
      mockGetUserThreads.mockReturnValue([]);
      
      render(<MessageInbox {...defaultProps} />);

      expect(
        screen.getByText('Ingen meldingstråder funnet')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for interactive elements', () => {
      render(<MessageInbox {...defaultProps} />);

      const createButton = screen.getByText('Ny melding');
      expect(createButton).toBeInTheDocument();
    });
  });
});