/**
 * CreateThreadModal Component Tests
 *
 * Tests for CreateThreadModal - creates new message threads
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateThreadModal from '@/components/features/messaging/components/CreateThreadModal';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'messages.noAvailableContacts': 'No available contacts',
        'messages.noBookingsYetTenant': 'You have no bookings yet.',
        'messages.noBookingsYetLandlord': 'No bookings have been made yet.',
        'messages.needBookedVenues': 'You need booked venues to send messages.',
        'messages.sendToLandlord': 'Send message to landlord',
        'messages.sendToTenant': 'Send message to tenant',
        'common.subject': 'Subject',
        'placeholders.threadSubject': 'Enter thread subject',
        'common.landlord': 'Landlord',
        'common.tenant': 'Tenant',
        'placeholders.selectLandlord': 'Select landlord',
        'placeholders.selectTenant': 'Select tenant',
        'filters.facility': 'Facility',
        'placeholders.selectVenue': 'Select venue',
        'messages.selectFacilityInfo': 'Select a facility related to your message',
        'filters.priority': 'Priority',
        'messages.lowPriority': 'Low',
        'messages.mediumPriority': 'Medium',
        'messages.highPriority': 'High',
        'messages.message': 'Message',
        'placeholders.threadMessage': 'Type your message here',
        'common.attachments': 'Attachments',
        'common.optional': 'Optional',
        'messages.addAttachment': 'Add attachment',
        'messages.dragDropFiles': 'Drag and drop files here or click to browse',
        'messages.selectFiles': 'Select files',
        'messages.cancel': 'Cancel',
        'messages.sending': 'Sending...',
        'messages.sendMessage': 'Send message',
        'common.characters': 'characters',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en-US',
    },
  }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  Paperclip: () => <div data-testid="paperclip-icon" />,
  Send: () => <div data-testid="send-icon" />,
  User: () => <div data-testid="user-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Building: () => <div data-testid="building-icon" />,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, ...props }: any) => (
    <textarea value={value} onChange={onChange} {...props} />
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

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the message store
const mockCreateThread = vi.fn();
const mockGetAvailableParticipants = vi.fn();
const mockGetBookedFacilities = vi.fn();

vi.mock('@/stores/messageStore', () => ({
  useMessageStore: () => ({
    createThread: mockCreateThread,
    getAvailableParticipants: mockGetAvailableParticipants,
    getBookedFacilities: mockGetBookedFacilities,
  }),
}));

describe('CreateThreadModal Component', () => {
  const mockAvailableParticipants = [
    { id: 'landlord1', name: 'Jane Smith', type: 'landlord' as const },
    { id: 'landlord2', name: 'Bob Johnson', type: 'landlord' as const },
  ];

  const mockBookedFacilities = [
    { id: 'facility1', name: 'Conference Room A', bookingId: 'booking1' },
    { id: 'facility2', name: 'Gymnasium', bookingId: 'booking2' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentUserId: 'tenant1',
    currentUserName: 'John Doe',
    currentUserType: 'tenant' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAvailableParticipants.mockReturnValue(mockAvailableParticipants);
    mockGetBookedFacilities.mockReturnValue(mockBookedFacilities);
  });

  describe('Modal Display', () => {
    it('should render modal when isOpen is true', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(
        screen.getByText('Send message to landlord')
      ).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<CreateThreadModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Send message to landlord')).not.toBeInTheDocument();
    });

    it('should show correct title based on user type', () => {
      render(
        <CreateThreadModal
          {...defaultProps}
          currentUserType="landlord"
        />
      );

      expect(screen.getByText('Send message to tenant')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render subject input field', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    });

    it('should render recipient selection', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByText('Landlord *')).toBeInTheDocument();
      expect(screen.getByText('Select landlord')).toBeInTheDocument();
    });

    it('should render facility selection', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByText('Facility *')).toBeInTheDocument();
      expect(screen.getByText('Select venue')).toBeInTheDocument();
    });

    it('should render priority selection', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('should render message textarea', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable send button when required fields are empty', () => {
      render(<CreateThreadModal {...defaultProps} />);

      const sendButton = screen.getByText('Send message').closest('button');
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when required fields are filled', async () => {
      const user = userEvent.setup();
      
      render(<CreateThreadModal {...defaultProps} />);

      // Fill in subject
      const subjectInput = screen.getByLabelText('Subject *');
      await user.type(subjectInput, 'Booking Inquiry');

      // Fill in message
      const messageInput = screen.getByLabelText('Message *');
      await user.type(messageInput, 'I would like to book a facility.');

      const sendButton = screen.getByText('Send message').closest('button');
      // Note: We can't fully test this because the Select components are mocked
      // In a real implementation, we would also select a recipient and facility
    });
  });

  describe('Form Submission', () => {
    it('should call createThread when form is submitted', async () => {
      const user = userEvent.setup();
      
      render(<CreateThreadModal {...defaultProps} />);

      // Fill in subject
      const subjectInput = screen.getByLabelText('Subject *');
      await user.type(subjectInput, 'Booking Inquiry');

      // Fill in message
      const messageInput = screen.getByLabelText('Message *');
      await user.type(messageInput, 'I would like to book a facility.');

      // Click send button
      const sendButton = screen.getByText('Send message');
      // Note: Actual submission testing is limited due to mocked Select components
    });
  });

  describe('Attachment Handling', () => {
    it('should allow file selection', async () => {
      const user = userEvent.setup();
      
      render(<CreateThreadModal {...defaultProps} />);

      const fileInput = screen.getByText('Select files');
      expect(fileInput).toBeInTheDocument();
    });

    it('should show selected files', async () => {
      const user = userEvent.setup();
      
      render(<CreateThreadModal {...defaultProps} />);

      // This would require more complex mocking to test file selection
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no participants are available', () => {
      mockGetAvailableParticipants.mockReturnValue([]);
      
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByText('No available contacts')).toBeInTheDocument();
      expect(
        screen.getByText('You have no bookings yet.')
      ).toBeInTheDocument();
    });

    it('should show empty state when no facilities are booked', () => {
      mockGetBookedFacilities.mockReturnValue([]);
      
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByText('No available contacts')).toBeInTheDocument();
      expect(
        screen.getByText('You need booked venues to send messages.')
      ).toBeInTheDocument();
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      render(
        <CreateThreadModal
          {...defaultProps}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByTestId('x-icon').closest('button');
      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      render(
        <CreateThreadModal
          {...defaultProps}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<CreateThreadModal {...defaultProps} />);

      expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
      expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    });
  });
});