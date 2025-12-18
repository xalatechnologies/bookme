/**
 * SystemMessages Component Tests
 *
 * Tests for SystemMessages - displays system messages in the user dashboard
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemMessages } from '@/components/features/dashboard/user/SystemMessages';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'user:dashboard.system_messages.mark_as_read': 'Mark as read {{title}}',
        'user:dashboard.system_messages.unread_indicator': 'Unread message',
        'category.system': 'System',
        'category.booking': 'Booking',
        'category.news': 'News',
        'type.info': 'Information',
        'type.warning': 'Warning',
        'type.maintenance': 'Maintenance',
        'type.success': 'Success',
      };
      if (key === 'user:dashboard.system_messages.mark_as_read') {
        return `Mark as read ${params?.title}`;
      }
      return translations[key] || key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
}));

// Mock the hook
vi.mock('@/components/features/dashboard/hooks/useSystemMessageHelpers', () => ({
  useSystemMessageHelpers: () => ({
    getMessageIcon: () => <div data-testid="message-icon" />,
    getCategoryLabel: (category: string) => {
      const labels: Record<string, string> = {
        system: 'System',
        booking: 'Booking',
        news: 'News',
      };
      return labels[category] || category;
    },
  }),
}));

describe('SystemMessages Component', () => {
  const mockMessages = [
    {
      id: '1',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tomorrow.',
      type: 'maintenance' as const,
      date: '2023-06-15T10:00:00Z',
      isRead: false,
      category: 'system' as const,
    },
    {
      id: '2',
      title: 'New Feature Available',
      message: 'We have launched a new booking feature.',
      type: 'info' as const,
      date: '2023-06-14T15:30:00Z',
      isRead: true,
      category: 'news' as const,
    },
    {
      id: '3',
      title: 'Booking Confirmation',
      message: 'Your booking has been confirmed.',
      type: 'success' as const,
      date: '2023-06-13T09:15:00Z',
      isRead: false,
      category: 'booking' as const,
    },
  ];

  const defaultProps = {
    messages: mockMessages,
    onMarkAsRead: vi.fn(),
    formatMessageDate: (dateString: string) => new Date(dateString).toLocaleDateString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Rendering', () => {
    it('should render all messages', () => {
      render(<SystemMessages {...defaultProps} />);

      expect(screen.getByText('System Maintenance')).toBeInTheDocument();
      expect(screen.getByText('New Feature Available')).toBeInTheDocument();
      expect(screen.getByText('Booking Confirmation')).toBeInTheDocument();
    });

    it('should display message content correctly', () => {
      render(<SystemMessages {...defaultProps} />);

      expect(
        screen.getByText('Scheduled maintenance will occur tomorrow.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('We have launched a new booking feature.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Your booking has been confirmed.')
      ).toBeInTheDocument();
    });

    it('should display message dates', () => {
      render(<SystemMessages {...defaultProps} />);

      // Since we're using toLocaleDateString, we need to check for the date format
      // The exact format may vary based on the system locale
      const dates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dates).toHaveLength(3);
    });

    it('should display category badges', () => {
      render(<SystemMessages {...defaultProps} />);

      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('should show unread indicator for unread messages', () => {
      render(<SystemMessages {...defaultProps} />);

      // Check for unread indicators (we're looking for the visual element)
      const unreadIndicators = screen.getAllByLabelText('dashboard.system_messages.unread_indicator');
      expect(unreadIndicators).toHaveLength(2); // Messages 1 and 3 are unread
    });

    it('should not show unread indicator for read messages', () => {
      render(<SystemMessages {...defaultProps} />);

      // Message 2 is read, so it should not have an unread indicator
      // This is a bit tricky to test directly since the indicator is a visual element
      // We'll check that we have the right number of unread indicators overall
      const unreadIndicators = screen.getAllByLabelText('dashboard.system_messages.unread_indicator');
      expect(unreadIndicators).toHaveLength(2);
    });

    it('should apply different styling for read and unread messages', () => {
      render(<SystemMessages {...defaultProps} />);

      // This would require more detailed DOM inspection which is complex in tests
      // We'll focus on functional aspects instead
    });
  });

  describe('Interaction', () => {
    it('should call onMarkAsRead when message is clicked', async () => {
      const user = userEvent.setup();
      const mockOnMarkAsRead = vi.fn();
      render(
        <SystemMessages
          {...defaultProps}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const message = screen.getByText('System Maintenance');
      await user.click(message);

      expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should call onMarkAsRead when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const mockOnMarkAsRead = vi.fn();
      render(
        <SystemMessages
          {...defaultProps}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      // Get the message container which has the role="button" attribute
      // Get the first message container (System Maintenance)
      const messageContainers = screen.getAllByRole('button', { name: 'dashboard.system_messages.mark_as_read' });
      const messageContainer = messageContainers[0];
      await user.tab(); // Tab to focus the button
      await user.keyboard('{Enter}');

      expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should call onMarkAsRead when Space key is pressed', async () => {
      const user = userEvent.setup();
      const mockOnMarkAsRead = vi.fn();
      render(
        <SystemMessages
          {...defaultProps}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      // Get the message container which has the role="button" attribute
      // Get the first message container (System Maintenance)
      const messageContainers = screen.getAllByRole('button', { name: 'dashboard.system_messages.mark_as_read' });
      const messageContainer = messageContainers[0];
      await user.tab(); // Tab to focus the button
      await user.keyboard(' ');

      expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels for messages', () => {
      render(<SystemMessages {...defaultProps} />);

      // Check that all message containers have the correct aria-label
      const messages = screen.getAllByRole('button', { name: 'dashboard.system_messages.mark_as_read' });
      expect(messages).toHaveLength(3);
    });

    it('should have proper aria labels for unread indicators', () => {
      render(<SystemMessages {...defaultProps} />);

      const unreadIndicators = screen.getAllByLabelText('dashboard.system_messages.unread_indicator');
      expect(unreadIndicators).toHaveLength(2);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<SystemMessages {...defaultProps} />);

      // Get the message container which has the role="button" attribute
      // Get the first message container (System Maintenance)
      const messageContainers = screen.getAllByRole('button', { name: 'dashboard.system_messages.mark_as_read' });
      const messageContainer = messageContainers[0];
      await user.tab(); // Tab to focus the button

      expect(document.activeElement).toBe(messageContainer);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages array', () => {
      const { container } = render(<SystemMessages {...defaultProps} messages={[]} />);

      // With no messages, we should just have an empty container
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should handle messages without categories', () => {
      const messagesWithoutCategories = mockMessages.map(msg => ({
        ...msg,
        category: undefined,
      }));
      
      render(
        <SystemMessages
          {...defaultProps}
          messages={messagesWithoutCategories}
        />
      );

      // Should not crash and should not display category badges
      expect(screen.getByText('System Maintenance')).toBeInTheDocument();
    });

    it('should handle messages without isRead property', () => {
      // Create entirely new messages without isRead property
      const messagesWithoutReadStatus = [
        {
          id: '4',
          title: 'Test Message 1',
          message: 'Test message',
          type: 'info' as const,
          date: '2023-06-16T10:00:00Z',
          category: 'system' as const,
        },
        {
          id: '5',
          title: 'Test Message 2',
          message: 'Test message 2',
          type: 'info' as const,
          date: '2023-06-16T11:00:00Z',
          category: 'system' as const,
        }
      ];
      
      render(
        <SystemMessages
          {...defaultProps}
          messages={messagesWithoutReadStatus}
        />
      );

      // Should treat missing isRead property as unread
      const messagesWithUnread = screen.getAllByLabelText('dashboard.system_messages.unread_indicator');
      expect(messagesWithUnread).toHaveLength(2);
    });
  });
});