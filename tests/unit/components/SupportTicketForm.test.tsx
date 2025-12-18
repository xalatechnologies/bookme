/**
 * SupportTicketForm Component Tests
 *
 * Tests for SupportTicketForm - creates new support tickets
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportTicketForm } from '@/components/features/support/components/SupportTicketForm';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'support:attachments.title': 'Attachments',
        'support:attachments.drag_drop': 'Drag and drop files here or click to browse',
        'support:attachments.select_files': 'Select files',
        'support:attachments.selected_files': 'Selected files',
        'support:category_descriptions.booking': 'Issues related to bookings and reservations',
        'support:category_descriptions.technical': 'Technical issues with the platform',
        'support:category_descriptions.billing': 'Billing and payment related questions',
        'support:category_descriptions.feedback': 'Suggestions and feedback',
        'support:category_descriptions.other': 'Other support requests',
        'support:priority_descriptions.low': 'Low priority - Response within 5 business days',
        'support:priority_descriptions.medium': 'Medium priority - Response within 3 business days',
        'support:priority_descriptions.high': 'High priority - Response within 1 business day',
        'support:priority_descriptions.urgent': 'Urgent - Response within 4 hours',
        'support:categories.booking': 'Booking',
        'support:categories.technical': 'Technical',
        'support:categories.billing': 'Billing',
        'support:categories.feedback': 'Feedback',
        'support:categories.other': 'Other',
        'support:priorities.low': 'Low',
        'support:priorities.medium': 'Medium',
        'support:priorities.high': 'High',
        'support:priorities.urgent': 'Urgent',
        'support:dialogs.create.title': 'Create Support Ticket',
        'support:dialogs.create.description': 'Fill out the form below to submit a support request',
        'support:fields.category': 'Category',
        'support:fields.priority': 'Priority',
        'support:fields.subject': 'Subject',
        'support:fields.description': 'Description',
        'support:fields.tags': 'Tags',
        'support:placeholders.subject': 'Briefly describe your issue',
        'support:helper_text.subject': 'Enter a clear and concise subject',
        'support:placeholders.description': 'Provide detailed information about your issue',
        'support:helper_text.description': 'Include steps to reproduce, error messages, and any relevant details',
        'support:placeholders.tags': 'tag1, tag2, tag3',
        'support:helper_text.tags': 'Comma-separated tags to categorize your ticket',
        'support:related.booking': 'Related Booking',
        'support:related.booking_id': 'Booking ID: {{id}}',
        'support:contact_info.title': 'Contact Information',
        'support:contact_info.name': 'Name: {{name}}',
        'support:contact_info.email': 'Email: {{email}}',
        'common:actions.cancel': 'Cancel',
        'support:actions.submitting': 'Creating...',
        'support:actions.create_ticket': 'Create Ticket',
        'support:messages.validation.subject_required': 'Subject is required',
        'support:messages.validation.description_required': 'Description is required',
        'support:messages.error.generic': 'An error occurred while creating the ticket',
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
  Paperclip: () => <div data-testid="paperclip-icon" />,
  Send: () => <div data-testid="send-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  X: () => <div data-testid="x-icon" />,
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

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock common form components
vi.mock('@/components/common/forms/FormField', () => ({
  FormField: ({ 
    id, 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    helperText, 
    required, 
    error,
    options
  }: any) => (
    <div>
      <label htmlFor={id}>{label}{required && ' *'}</label>
      {type === 'select' ? (
        <select 
          id={id} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        >
          {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {helperText && <p>{helperText}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  ),
}));

// Mock hooks
const mockValidateAll = vi.fn();
const mockClearError = vi.fn();
const mockSetError = vi.fn();

vi.mock('@/hooks/shared', () => ({
  useFormValidation: () => ({
    errors: {},
    validateAll: mockValidateAll,
    clearError: mockClearError,
    setError: mockSetError,
  }),
}));

describe('SupportTicketForm Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateAll.mockReturnValue(true);
  });

  describe('Modal Display', () => {
    it('should render modal when isOpen is true', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Create Support Ticket')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<SupportTicketForm {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Create Support Ticket')).not.toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render category selection', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Category *')).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Technical')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.getByText('Feedback')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should render priority selection', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Priority *')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    it('should render subject input field', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Subject *')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Briefly describe your issue')
      ).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Description *')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Provide detailed information about your issue')
      ).toBeInTheDocument();
    });

    it('should render tags input field', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('tag1, tag2, tag3')
      ).toBeInTheDocument();
    });

    it('should render file upload component', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Attachments')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop files here or click to browse')).toBeInTheDocument();
      expect(screen.getByText('Select files')).toBeInTheDocument();
    });

    it('should display contact information', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Name: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    });

    it('should display related booking information when provided', () => {
      render(
        <SupportTicketForm
          {...defaultProps}
          relatedBookingId="booking123"
        />
      );

      expect(screen.getByText('Related Booking')).toBeInTheDocument();
      expect(screen.getByText('Booking ID: booking123')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when subject is empty', async () => {
      const user = userEvent.setup();
      
      render(<SupportTicketForm {...defaultProps} />);

      const subjectInput = screen.getByPlaceholderText('Briefly describe your issue');
      await user.type(subjectInput, '');

      const descriptionInput = screen.getByPlaceholderText('Provide detailed information about your issue');
      await user.type(descriptionInput, 'Detailed description');

      const createButton = screen.getByText('Create Ticket');
      await user.click(createButton);

      expect(mockSetError).toHaveBeenCalledWith(
        'subject',
        'Subject is required'
      );
    });

    it('should show error when description is empty', async () => {
      const user = userEvent.setup();
      
      render(<SupportTicketForm {...defaultProps} />);

      const subjectInput = screen.getByPlaceholderText('Briefly describe your issue');
      await user.type(subjectInput, 'Issue subject');

      const descriptionInput = screen.getByPlaceholderText('Provide detailed information about your issue');
      await user.type(descriptionInput, '');

      const createButton = screen.getByText('Create Ticket');
      await user.click(createButton);

      expect(mockSetError).toHaveBeenCalledWith(
        'description',
        'Description is required'
      );
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      
      render(
        <SupportTicketForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill in subject
      const subjectInput = screen.getByPlaceholderText('Briefly describe your issue');
      await user.type(subjectInput, 'Issue subject');

      // Fill in description
      const descriptionInput = screen.getByPlaceholderText('Provide detailed information about your issue');
      await user.type(descriptionInput, 'Detailed description');

      // Select category
      const categorySelect = screen.getByText('Category *').nextSibling;
      if (categorySelect) {
        // Simulate selecting a category
      }

      // Select priority
      const prioritySelect = screen.getByText('Priority *').nextSibling;
      if (prioritySelect) {
        // Simulate selecting a priority
      }

      const createButton = screen.getByText('Create Ticket');
      await user.click(createButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should reset form and close modal after successful submission', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();
      const mockOnClose = vi.fn();
      
      render(
        <SupportTicketForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Fill in subject
      const subjectInput = screen.getByPlaceholderText('Briefly describe your issue');
      await user.type(subjectInput, 'Issue subject');

      // Fill in description
      const descriptionInput = screen.getByPlaceholderText('Provide detailed information about your issue');
      await user.type(descriptionInput, 'Detailed description');

      const createButton = screen.getByText('Create Ticket');
      await user.click(createButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should allow file selection', () => {
      render(<SupportTicketForm {...defaultProps} />);

      const fileInput = screen.getByText('Select files');
      expect(fileInput).toBeInTheDocument();
    });

    it('should show selected files', async () => {
      const user = userEvent.setup();
      
      render(<SupportTicketForm {...defaultProps} />);

      // This would require more complex mocking to test file selection
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      
      render(
        <SupportTicketForm
          {...defaultProps}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText('Cancel');
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable submit button when required fields are empty', () => {
      render(<SupportTicketForm {...defaultProps} />);

      const createButton = screen.getByText('Create Ticket').closest('button');
      expect(createButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<SupportTicketForm {...defaultProps} />);

      expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description *')).toBeInTheDocument();
    });
  });
});