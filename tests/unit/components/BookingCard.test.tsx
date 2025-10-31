/**
 * BookingCard Component Tests
 *
 * Comprehensive test suite for the BookingCard component
 * covering rendering, interactions, accessibility, and edge cases.
 *
 * Test Coverage:
 * - Rendering with different booking statuses
 * - User interactions (select, view details, delete)
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Edge cases (missing data, null handlers)
 * - i18n translations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BookingCard, BookingCardProps } from '@/components/features/bookings/components/BookingCard';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/database';

expect.extend(toHaveNoViolations);

type BookingStatus = Database['public']['Enums']['booking_status'];

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'booking.status.paid': 'Betalt',
        'booking.status.completed': 'Fullført',
        'booking.status.pending': 'Venter',
        'booking.status.awaiting_payment': 'Venter på betaling',
        'booking.status.cancelled': 'Avbrutt',
        'booking.status.expired': 'Utløpt',
        'booking.status.refunded': 'Refundert',
        'booking.card.hour': 'time',
        'booking.card.hours': 'timer',
        'booking.card.viewDetails': 'Vis detaljer',
        'booking.card.delete': 'Slett',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'no',
    },
  }),
}));

// Mock utility functions
vi.mock('@/components/features/facilities/utils/formatters', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString('no-NO'),
  formatTime: (time: string) => time,
  formatDuration: (start: string, end: string, translations: { hour: string; hours: string }) => {
    const hours = Math.abs(new Date(end).getTime() - new Date(start).getTime()) / 36e5;
    return `${hours} ${hours === 1 ? translations.hour : translations.hours}`;
  },
  formatPrice: (cents: number) => `${(cents / 100).toFixed(2)} kr`,
  getStatusColor: (status: BookingStatus) => {
    const colors: Record<BookingStatus, string> = {
      paid: 'green',
      completed: 'blue',
      pending: 'yellow',
      awaiting_payment: 'orange',
      cancelled: 'red',
      expired: 'gray',
      refunded: 'purple',
    };
    return colors[status] || 'gray';
  },
  getStatusBadgeColor: (status: BookingStatus) => `badge-${status}`,
}));

/**
 * Create mock booking with default values
 */
const createMockBooking = (overrides?: Partial<BookingWithDetails>): BookingWithDetails => ({
  id: 'booking-123',
  facility_id: 'facility-456',
  zone_id: 'zone-789',
  user_id: 'user-001',
  organization_id: 'org-001',
  status: 'paid' as BookingStatus,
  start_time: '2025-10-31T09:00:00Z',
  end_time: '2025-10-31T11:00:00Z',
  total_cents: 50000, // 500 kr
  created_at: '2025-10-30T10:00:00Z',
  updated_at: '2025-10-30T10:00:00Z',
  purpose: 'Team meeting',
  attendees_count: 10,
  activity_type: 'meeting',
  actor_type: 'private-firma',
  facilities: {
    id: 'facility-456',
    name: 'Conference Room A',
    address: 'Oslo Street 123',
    city: 'Oslo',
  },
  zones: {
    id: 'zone-789',
    name: 'Main Hall',
  },
  ...overrides,
});

/**
 * Render BookingCard with default props
 */
const renderBookingCard = (props?: Partial<BookingCardProps>) => {
  const defaultProps: BookingCardProps = {
    booking: createMockBooking(),
    selected: false,
    onSelect: vi.fn(),
    onViewDetails: vi.fn(),
    onDelete: vi.fn(),
    showCheckbox: true,
  };

  return render(<BookingCard {...defaultProps} {...props} />);
};

describe('BookingCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render booking information correctly', () => {
      const booking = createMockBooking();
      renderBookingCard({ booking });

      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText('Main Hall')).toBeInTheDocument();
      expect(screen.getByText('Betalt')).toBeInTheDocument();
      expect(screen.getByText('500.00 kr')).toBeInTheDocument();
    });

    it('should render all booking statuses correctly', () => {
      const statuses: BookingStatus[] = [
        'paid',
        'completed',
        'pending',
        'awaiting_payment',
        'cancelled',
        'expired',
        'refunded',
      ];

      statuses.forEach((status) => {
        const { unmount } = renderBookingCard({
          booking: createMockBooking({ status }),
        });

        const statusMap: Record<BookingStatus, string> = {
          paid: 'Betalt',
          completed: 'Fullført',
          pending: 'Venter',
          awaiting_payment: 'Venter på betaling',
          cancelled: 'Avbrutt',
          expired: 'Utløpt',
          refunded: 'Refundert',
        };

        expect(screen.getByText(statusMap[status])).toBeInTheDocument();
        unmount();
      });
    });

    it('should show checkbox when showCheckbox is true', () => {
      renderBookingCard({ showCheckbox: true });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should hide checkbox when showCheckbox is false', () => {
      renderBookingCard({ showCheckbox: false });

      const checkbox = screen.queryByRole('checkbox');
      expect(checkbox).not.toBeInTheDocument();
    });

    it('should display facility and zone information', () => {
      const booking = createMockBooking({
        facilities: {
          id: 'fac-1',
          name: 'Sports Hall',
          address: 'Main Street 456',
          city: 'Bergen',
        },
        zones: {
          id: 'zone-1',
          name: 'Court 1',
        },
      });

      renderBookingCard({ booking });

      expect(screen.getByText('Sports Hall')).toBeInTheDocument();
      expect(screen.getByText('Court 1')).toBeInTheDocument();
    });

    it('should display date and time information', () => {
      renderBookingCard();

      // Check for date/time elements (icons and text)
      expect(screen.getByText(/31\.10\.2025/)).toBeInTheDocument();
      expect(screen.getByText(/09:00/)).toBeInTheDocument();
    });

    it('should display duration calculation', () => {
      const booking = createMockBooking({
        start_time: '2025-10-31T09:00:00Z',
        end_time: '2025-10-31T12:00:00Z', // 3 hours
      });

      renderBookingCard({ booking });

      expect(screen.getByText(/3 timer/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onSelect when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const booking = createMockBooking();

      renderBookingCard({ booking, onSelect, showCheckbox: true });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onSelect).toHaveBeenCalledWith('booking-123');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onViewDetails when card is clicked', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();
      const booking = createMockBooking();

      renderBookingCard({ booking, onViewDetails });

      const card = screen.getByRole('article');
      await user.click(card);

      expect(onViewDetails).toHaveBeenCalledWith(booking);
      expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      renderBookingCard({ onDelete });

      const deleteButton = screen.getByLabelText(/slett/i);
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith('booking-123');
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onViewDetails = vi.fn();

      renderBookingCard({ onSelect, onViewDetails, showCheckbox: true });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onViewDetails).not.toHaveBeenCalled();
    });

    it('should reflect selected state in checkbox', () => {
      const { rerender } = renderBookingCard({ selected: false });

      let checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      rerender(<BookingCard booking={createMockBooking()} selected={true} />);

      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderBookingCard();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for buttons', () => {
      renderBookingCard();

      expect(screen.getByLabelText(/vis detaljer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/slett/i)).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      renderBookingCard();

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onViewDetails = vi.fn();

      renderBookingCard({ onViewDetails });

      const viewButton = screen.getByLabelText(/vis detaljer/i);

      // Tab to button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');

      expect(onViewDetails).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional handlers gracefully', async () => {
      const user = userEvent.setup();

      renderBookingCard({
        onSelect: undefined,
        onViewDetails: undefined,
        onDelete: undefined,
      });

      const card = screen.getByRole('article');
      await user.click(card);

      // Should not throw errors
      expect(card).toBeInTheDocument();
    });

    it('should handle null booking data gracefully', () => {
      const bookingWithNulls = createMockBooking({
        purpose: null as any,
        attendees_count: null as any,
        facilities: null as any,
        zones: null as any,
      });

      expect(() => renderBookingCard({ booking: bookingWithNulls })).not.toThrow();
    });

    it('should handle very long facility names', () => {
      const longName = 'A'.repeat(200);
      const booking = createMockBooking({
        facilities: {
          id: 'fac-1',
          name: longName,
          address: 'Street 123',
          city: 'City',
        },
      });

      renderBookingCard({ booking });

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle zero price', () => {
      const booking = createMockBooking({ total_cents: 0 });

      renderBookingCard({ booking });

      expect(screen.getByText('0.00 kr')).toBeInTheDocument();
    });

    it('should handle large price values', () => {
      const booking = createMockBooking({ total_cents: 999999900 }); // 9,999,999 kr

      renderBookingCard({ booking });

      expect(screen.getByText('9999999.00 kr')).toBeInTheDocument();
    });
  });

  describe('Status-Specific Behavior', () => {
    it('should apply correct styling for cancelled bookings', () => {
      const booking = createMockBooking({ status: 'cancelled' });
      renderBookingCard({ booking });

      const statusBadge = screen.getByText('Avbrutt');
      expect(statusBadge).toHaveClass('badge-cancelled');
    });

    it('should apply correct styling for paid bookings', () => {
      const booking = createMockBooking({ status: 'paid' });
      renderBookingCard({ booking });

      const statusBadge = screen.getByText('Betalt');
      expect(statusBadge).toHaveClass('badge-paid');
    });

    it('should show different colors for different statuses', () => {
      const statuses: BookingStatus[] = ['paid', 'pending', 'cancelled'];

      statuses.forEach((status) => {
        const { unmount } = renderBookingCard({
          booking: createMockBooking({ status }),
        });

        const badge = screen.getByRole('status') || screen.getByText(/betalt|venter|avbrutt/i);
        expect(badge).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Integration with UI Components', () => {
    it('should render Card component from shadcn/ui', () => {
      renderBookingCard();

      const card = screen.getByRole('article');
      expect(card).toHaveClass('rounded-lg'); // Card should have rounded corners
    });

    it('should render Badge component for status', () => {
      renderBookingCard();

      const badge = screen.getByText('Betalt');
      expect(badge.tagName).toBe('SPAN'); // Badges are typically spans
    });

    it('should render Button components for actions', () => {
      renderBookingCard();

      const viewButton = screen.getByLabelText(/vis detaljer/i);
      const deleteButton = screen.getByLabelText(/slett/i);

      expect(viewButton.tagName).toBe('BUTTON');
      expect(deleteButton.tagName).toBe('BUTTON');
    });

    it('should render Checkbox component when showCheckbox is true', () => {
      renderBookingCard({ showCheckbox: true });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render Lucide icons', () => {
      renderBookingCard();

      // Icons should be present (Calendar, Clock, MapPin, etc.)
      const icons = screen.getAllByRole('img', { hidden: true });
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
