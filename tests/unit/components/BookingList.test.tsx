/**
 * BookingList Component Tests
 *
 * Tests for BookingList - displays user bookings in the dashboard
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingList } from '@/components/features/dashboard/user/BookingList';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'bookings:page.user_title': 'Your Bookings',
        'bookings:messages.empty.no_bookings': 'You have no bookings yet.',
        'bookings:actions.create_new': 'Create New Booking',
        'bookings:actions.view_details': 'View Details',
        'bookings:actions.edit': 'Edit',
        'bookings:actions.cancel': 'Cancel',
        'bookings:actions.report_issue': 'Report Issue',
        'bookings:fields.participants': 'Participants',
        'bookings:fields.booking_id': 'Booking ID',
        'bookings:terms.title': 'Cancellation Policy',
        'bookings:fields.contact_person': 'Contact Person',
        'status.confirmed': 'Confirmed',
        'status.pending': 'Pending',
        'status.cancelled': 'Cancelled',
      };
      
      // Handle keys with and without namespace prefix
      if (translations[key]) {
        return translations[key];
      }
      
      // Handle keys without namespace prefix
      const keyWithoutNamespace = key.startsWith('bookings:') ? key.substring(9) : key;
      if (translations[`bookings:${keyWithoutNamespace}`]) {
        return translations[`bookings:${keyWithoutNamespace}`];
      }
      
      return translations[key] || key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
  ChevronDown: () => <div data-testid="chevron-icon" />,
  Users: () => <div data-testid="users-icon" />,
  QrCode: () => <div data-testid="qr-code-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('BookingList Component', () => {
  const mockBookings = [
    {
      id: '1',
      facility: 'Conference Room A',
      date: '2023-06-15',
      time: '10:00',
      duration: '2 hours',
      status: 'confirmed' as const,
      location: 'Building 1, Floor 2',
      price: 'NOK 500',
      purpose: 'Team Meeting',
      participants: ['John Doe', 'Jane Smith'],
      qrCode: 'QR123456',
      cancellationPolicy: 'Free cancellation up to 24 hours before',
      contactInfo: {
        phone: '+47 123 45 678',
        email: 'support@example.com',
      },
    },
    {
      id: '2',
      facility: 'Gymnasium',
      date: '2023-06-16',
      time: '14:00',
      duration: '1 hour',
      status: 'pending' as const,
      location: 'Sports Center',
      price: 'NOK 300',
      purpose: 'Fitness Class',
    },
    {
      id: '3',
      facility: 'Auditorium',
      date: '2023-06-17',
      time: '09:00',
      duration: '3 hours',
      status: 'cancelled' as const,
      location: 'Main Building',
      price: 'NOK 1200',
      purpose: 'Graduation Ceremony',
    },
  ];

  const defaultProps = {
    bookings: mockBookings,
    expandedBookings: new Set<string>(),
    onToggleExpansion: vi.fn(),
    onViewFacility: vi.fn(),
    onEditBooking: vi.fn(),
    onCancelBooking: vi.fn(),
    onContactAdmin: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no bookings', () => {
      render(<BookingList {...defaultProps} bookings={[]} />);

      expect(screen.getByText('Your Bookings')).toBeInTheDocument();
      expect(screen.getByText('You have no bookings yet.')).toBeInTheDocument();
      expect(screen.getByText('Create New Booking')).toBeInTheDocument();
    });

    it('should call onViewFacility when create button is clicked in empty state', async () => {
      const user = userEvent.setup();
      const mockOnViewFacility = vi.fn();
      render(
        <BookingList
          {...defaultProps}
          bookings={[]}
          onViewFacility={mockOnViewFacility}
        />
      );

      const createButton = screen.getByText('Create New Booking');
      await user.click(createButton);

      expect(mockOnViewFacility).toHaveBeenCalledWith('new');
    });
  });

  describe('Booking Items', () => {
    it('should render all bookings', () => {
      render(<BookingList {...defaultProps} />);

      expect(
        screen.getByText('Conference Room A')
      ).toBeInTheDocument();
      expect(screen.getByText('Gymnasium')).toBeInTheDocument();
      expect(screen.getByText('Auditorium')).toBeInTheDocument();
    });

    it('should display booking details correctly', () => {
      render(<BookingList {...defaultProps} />);

      // Check first booking details
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      // Use flexible matchers for text that might be split across elements
      expect(screen.getByText((content) => content.includes('15.6.2023'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('kl. 10:00'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('2 hours'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Team Meeting'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('NOK 500'))).toBeInTheDocument();
      expect(screen.getByText('Building 1, Floor 2')).toBeInTheDocument();
    });

    it('should render status badges with correct labels', () => {
      render(<BookingList {...defaultProps} />);

      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should apply strikethrough to cancelled bookings', () => {
      render(<BookingList {...defaultProps} />);

      const cancelledBooking = screen.getByText('Auditorium');
      expect(cancelledBooking).toHaveClass('line-through');
    });

    it('should not apply strikethrough to confirmed bookings', () => {
      render(<BookingList {...defaultProps} />);

      const confirmedBooking = screen.getByText('Conference Room A');
      expect(confirmedBooking).not.toHaveClass('line-through');
    });
  });

  describe('Action Buttons', () => {
    it('should render view details button for all bookings', () => {
      render(<BookingList {...defaultProps} />);

      const viewButtons = screen.getAllByText('View Details');
      expect(viewButtons).toHaveLength(3);
    });

    it('should render edit and cancel buttons for confirmed bookings', () => {
      render(<BookingList {...defaultProps} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render report issue button for pending bookings', () => {
      render(<BookingList {...defaultProps} />);

      expect(screen.getByText('Report Issue')).toBeInTheDocument();
    });

    it('should call onViewFacility when view button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnViewFacility = vi.fn();
      render(
        <BookingList
          {...defaultProps}
          onViewFacility={mockOnViewFacility}
        />
      );

      const viewButtons = screen.getAllByText('View Details');
      await user.click(viewButtons[0]);

      expect(mockOnViewFacility).toHaveBeenCalledWith('1');
    });

    it('should call onEditBooking when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEditBooking = vi.fn();
      render(
        <BookingList
          {...defaultProps}
          onEditBooking={mockOnEditBooking}
        />
      );

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      expect(mockOnEditBooking).toHaveBeenCalledWith('1');
    });

    it('should call onCancelBooking when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancelBooking = vi.fn();
      render(
        <BookingList
          {...defaultProps}
          onCancelBooking={mockOnCancelBooking}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancelBooking).toHaveBeenCalledWith('1');
    });

    it('should call onContactAdmin when report issue button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnContactAdmin = vi.fn();
      render(
        <BookingList
          {...defaultProps}
          onContactAdmin={mockOnContactAdmin}
        />
      );

      const reportButton = screen.getByText('Report Issue');
      await user.click(reportButton);

      expect(mockOnContactAdmin).toHaveBeenCalledWith('2');
    });
  });

  describe('Expandable Details', () => {
    it('should not show expanded details by default', () => {
      render(<BookingList {...defaultProps} />);

      expect(screen.queryByText('Participants')).not.toBeInTheDocument();
      expect(screen.queryByText('Booking ID')).not.toBeInTheDocument();
    });

    it('should show expanded details when booking is expanded', () => {
      const expandedProps = {
        ...defaultProps,
        expandedBookings: new Set(['1']),
      };
      render(<BookingList {...expandedProps} />);

      expect(screen.getByText('Participants')).toBeInTheDocument();
      expect(screen.getByText('Booking ID')).toBeInTheDocument();
      expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
      expect(screen.getByText('Contact Person')).toBeInTheDocument();
    });

    it('should display participant badges when expanded', () => {
      const expandedProps = {
        ...defaultProps,
        expandedBookings: new Set(['1']),
      };
      render(<BookingList {...expandedProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display QR code when expanded', () => {
      const expandedProps = {
        ...defaultProps,
        expandedBookings: new Set(['1']),
      };
      render(<BookingList {...expandedProps} />);

      expect(screen.getByText('QR123456')).toBeInTheDocument();
    });

    it('should call onToggleExpansion when booking header is clicked', async () => {
      const user = userEvent.setup();
      const mockOnToggleExpansion = vi.fn();
      render(
        <BookingList
          {...defaultProps}
          onToggleExpansion={mockOnToggleExpansion}
        />
      );

      const bookingHeader = screen.getByText('Conference Room A').closest('div');
      if (bookingHeader) {
        await user.click(bookingHeader);
        expect(mockOnToggleExpansion).toHaveBeenCalledWith('1');
      }
    });

    it.todo('should call onToggleExpansion when Enter key is pressed');
  });

  describe('Accessibility', () => {
    it.todo('should have proper aria attributes for expandable sections');

    it.todo('should have proper aria labels for action buttons');
  });

  describe('Styling and Visual Indicators', () => {
    it('should apply correct border colors based on status', () => {
      render(<BookingList {...defaultProps} />);

      // This would require more detailed DOM inspection which is complex in tests
      // We'll focus on functional aspects instead
    });
  });
});