/**
 * BookingForm Component Tests
 *
 * Comprehensive test suite for the BookingForm component
 * covering form validation, user input, state management, and submission.
 *
 * Test Coverage:
 * - Form rendering and initial state
 * - User input handling
 * - Form validation
 * - Slot selection and management
 * - Price calculation
 * - Form submission (add to cart, complete booking)
 * - Error handling
 * - Accessibility
 * - i18n translations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/user Event';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BookingForm, IBookingFormProps } from '@/components/features/bookings/components/BookingForm';
import type { IBookingFormData, ISelectedTimeSlot } from '@/components/features/bookings/types';

expect.extend(toHaveNoViolations);

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'bookings.form.title': 'Bestillingsskjema',
        'bookings.form.purpose': 'Formål',
        'bookings.form.purposePlaceholder': 'Beskriv formålet med bookingen',
        'bookings.form.attendees': 'Antall deltakere',
        'bookings.form.activityType': 'Aktivitetstype',
        'bookings.form.actorType': 'Aktørtype',
        'bookings.form.additionalInfo': 'Tilleggsinformasjon',
        'bookings.form.bookingType': 'Bookingtype',
        'bookings.form.oneTime': 'Engangsbestilling',
        'bookings.form.recurring': 'Gjentakende',
        'bookings.form.termsAccepted': 'Jeg aksepterer vilkårene',
        'bookings.form.addToCart': 'Legg til i handlekurv',
        'bookings.form.completeBooking': 'Fullfør booking',
        'validation.required': 'Dette feltet er påkrevd',
        'validation.minAttendees': 'Minimum 1 deltaker',
        'validation.termsRequired': 'Du må akseptere vilkårene',
        'common.loading': 'Laster...',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'no',
    },
  }),
}));

// Mock validation hook
vi.mock('@/hooks/features/bookings', () => ({
  useBookingFormValidation: () => ({
    validate: (data: IBookingFormData) => {
      const errors: Partial<Record<keyof IBookingFormData, string>> = {};

      if (!data.purpose) {
        errors.purpose = 'Dette feltet er påkrevd';
      }

      if (data.attendees < 1) {
        errors.attendees = 'Minimum 1 deltaker';
      }

      if (!data.termsAccepted) {
        errors.termsAccepted = 'Du må akseptere vilkårene';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
  }),
}));

/**
 * Create mock selected time slots
 */
const createMockSlots = (count: number = 2): ISelectedTimeSlot[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `slot-${i + 1}`,
    date: '2025-10-31',
    startTime: `${9 + i * 2}:00`,
    endTime: `${11 + i * 2}:00`,
    pricePerHour: 250,
    totalPrice: 500,
  }));
};

/**
 * Render BookingForm with default props
 */
const renderBookingForm = (props?: Partial<IBookingFormProps>) => {
  const defaultProps: IBookingFormProps = {
    facilityId: 'facility-123',
    facilityName: 'Conference Room A',
    zoneId: 'zone-456',
    selectedSlots: createMockSlots(),
    onSlotsChange: vi.fn(),
    onAddToCart: vi.fn(),
    onCompleteBooking: vi.fn(),
    isLoading: false,
    error: undefined,
  };

  return render(<BookingForm {...defaultProps} {...props} />);
};

describe('BookingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      renderBookingForm();

      expect(screen.getByLabelText(/formål/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/antall deltakere/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/aktivitetstype/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/aktørtype/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tilleggsinformasjon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/jeg aksepterer vilkårene/i)).toBeInTheDocument();
    });

    it('should display selected slots', () => {
      const slots = createMockSlots(3);
      renderBookingForm({ selectedSlots: slots });

      expect(screen.getByText(/3 valgte tidspunkter/i)).toBeInTheDocument();
    });

    it('should display facility information', () => {
      renderBookingForm({
        facilityName: 'Sports Hall',
      });

      expect(screen.getByText('Sports Hall')).toBeInTheDocument();
    });

    it('should show booking type selector', () => {
      renderBookingForm();

      expect(screen.getByText(/engangsbestilling/i)).toBeInTheDocument();
      expect(screen.getByText(/gjentakende/i)).toBeInTheDocument();
    });

    it('should display price calculation', () => {
      const slots = createMockSlots(2);
      renderBookingForm({ selectedSlots: slots });

      // Total: 500 kr * 2 slots = 1000 kr
      expect(screen.getByText(/1000\.00 kr/i)).toBeInTheDocument();
    });

    it('should show action buttons', () => {
      renderBookingForm();

      expect(screen.getByText(/legg til i handlekurv/i)).toBeInTheDocument();
      expect(screen.getByText(/fullfør booking/i)).toBeInTheDocument();
    });

    it('should display loading state', () => {
      renderBookingForm({ isLoading: true });

      expect(screen.getByText(/laster/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /legg til i handlekurv/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /fullfør booking/i })).toBeDisabled();
    });

    it('should display error message', () => {
      const errorMessage = 'Booking failed. Please try again.';
      renderBookingForm({ error: errorMessage });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('User Input Handling', () => {
    it('should update purpose field on input', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const purposeInput = screen.getByLabelText(/formål/i);
      await user.type(purposeInput, 'Team workshop');

      expect(purposeInput).toHaveValue('Team workshop');
    });

    it('should update attendees field on input', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const attendeesInput = screen.getByLabelText(/antall deltakere/i);
      await user.clear(attendeesInput);
      await user.type(attendeesInput, '15');

      expect(attendeesInput).toHaveValue(15);
    });

    it('should select activity type from dropdown', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const activitySelect = screen.getByLabelText(/aktivitetstype/i);
      await user.click(activitySelect);

      const meetingOption = screen.getByText('Møte');
      await user.click(meetingOption);

      expect(activitySelect).toHaveValue('meeting');
    });

    it('should select actor type from dropdown', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const actorSelect = screen.getByLabelText(/aktørtype/i);
      await user.click(actorSelect);

      const privateOption = screen.getByText('Privatperson');
      await user.click(privateOption);

      expect(actorSelect).toHaveValue('private-person');
    });

    it('should toggle terms acceptance checkbox', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const termsCheckbox = screen.getByLabelText(/jeg aksepterer vilkårene/i);
      expect(termsCheckbox).not.toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).not.toBeChecked();
    });

    it('should update additional info textarea', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const additionalInfoTextarea = screen.getByLabelText(/tilleggsinformasjon/i);
      await user.type(additionalInfoTextarea, 'Need projector and whiteboard');

      expect(additionalInfoTextarea).toHaveValue('Need projector and whiteboard');
    });

    it('should switch between booking types', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const oneTimeRadio = screen.getByLabelText(/engangsbestilling/i);
      const recurringRadio = screen.getByLabelText(/gjentakende/i);

      expect(oneTimeRadio).toBeChecked();
      expect(recurringRadio).not.toBeChecked();

      await user.click(recurringRadio);

      expect(oneTimeRadio).not.toBeChecked();
      expect(recurringRadio).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty purpose', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();

      renderBookingForm({ onCompleteBooking });

      const submitButton = screen.getByText(/fullfør booking/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/dette feltet er påkrevd/i)).toBeInTheDocument();
      });

      expect(onCompleteBooking).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid attendees count', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();

      renderBookingForm({ onCompleteBooking });

      const attendeesInput = screen.getByLabelText(/antall deltakere/i);
      await user.clear(attendeesInput);
      await user.type(attendeesInput, '0');

      const submitButton = screen.getByText(/fullfør booking/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/minimum 1 deltaker/i)).toBeInTheDocument();
      });

      expect(onCompleteBooking).not.toHaveBeenCalled();
    });

    it('should show validation error for unchecked terms', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();

      renderBookingForm({ onCompleteBooking });

      const purposeInput = screen.getByLabelText(/formål/i);
      await user.type(purposeInput, 'Valid purpose');

      const submitButton = screen.getByText(/fullfør booking/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/du må akseptere vilkårene/i)).toBeInTheDocument();
      });

      expect(onCompleteBooking).not.toHaveBeenCalled();
    });

    it('should clear validation errors on valid input', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      // Trigger validation error
      const submitButton = screen.getByText(/fullfør booking/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/dette feltet er påkrevd/i)).toBeInTheDocument();
      });

      // Fix validation error
      const purposeInput = screen.getByLabelText(/formål/i);
      await user.type(purposeInput, 'Valid purpose');

      await waitFor(() => {
        expect(screen.queryByText(/dette feltet er påkrevd/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Slot Management', () => {
    it('should call onSlotsChange when slots are modified', async () => {
      const user = userEvent.setup();
      const onSlotsChange = vi.fn();
      const slots = createMockSlots(2);

      renderBookingForm({ selectedSlots: slots, onSlotsChange });

      // Remove a slot
      const removeButton = screen.getAllByLabelText(/fjern tidspunkt/i)[0];
      await user.click(removeButton);

      expect(onSlotsChange).toHaveBeenCalled();
    });

    it('should update price calculation when slots change', () => {
      const slots1 = createMockSlots(2); // 1000 kr total
      const { rerender } = renderBookingForm({ selectedSlots: slots1 });

      expect(screen.getByText(/1000\.00 kr/i)).toBeInTheDocument();

      const slots2 = createMockSlots(3); // 1500 kr total
      rerender(
        <BookingForm
          facilityId="facility-123"
          facilityName="Conference Room A"
          zoneId="zone-456"
          selectedSlots={slots2}
          onSlotsChange={vi.fn()}
          onAddToCart={vi.fn()}
          onCompleteBooking={vi.fn()}
        />
      );

      expect(screen.getByText(/1500\.00 kr/i)).toBeInTheDocument();
    });

    it('should disable submit when no slots selected', () => {
      renderBookingForm({ selectedSlots: [] });

      const addToCartButton = screen.getByText(/legg til i handlekurv/i);
      const completeButton = screen.getByText(/fullfør booking/i);

      expect(addToCartButton).toBeDisabled();
      expect(completeButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onAddToCart with correct data', async () => {
      const user = userEvent.setup();
      const onAddToCart = vi.fn();

      renderBookingForm({ onAddToCart });

      // Fill form
      await user.type(screen.getByLabelText(/formål/i), 'Team meeting');
      await user.clear(screen.getByLabelText(/antall deltakere/i));
      await user.type(screen.getByLabelText(/antall deltakere/i), '10');
      await user.click(screen.getByLabelText(/jeg aksepterer vilkårene/i));

      // Submit
      const addToCartButton = screen.getByText(/legg til i handlekurv/i);
      await user.click(addToCartButton);

      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledWith(
          expect.objectContaining({
            purpose: 'Team meeting',
            attendees: 10,
            termsAccepted: true,
            bookingType: 'one-time',
          })
        );
      });
    });

    it('should call onCompleteBooking with correct data', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();

      renderBookingForm({ onCompleteBooking });

      // Fill form
      await user.type(screen.getByLabelText(/formål/i), 'Workshop');
      await user.clear(screen.getByLabelText(/antall deltakere/i));
      await user.type(screen.getByLabelText(/antall deltakere/i), '20');
      await user.click(screen.getByLabelText(/jeg aksepterer vilkårene/i));

      // Submit
      const completeButton = screen.getByText(/fullfør booking/i);
      await user.click(completeButton);

      await waitFor(() => {
        expect(onCompleteBooking).toHaveBeenCalledWith(
          expect.objectContaining({
            purpose: 'Workshop',
            attendees: 20,
            termsAccepted: true,
            bookingType: 'one-time',
          })
        );
      });
    });

    it('should not submit with invalid data', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();

      renderBookingForm({ onCompleteBooking });

      // Leave form empty
      const completeButton = screen.getByText(/fullfør booking/i);
      await user.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText(/dette feltet er påkrevd/i)).toBeInTheDocument();
      });

      expect(onCompleteBooking).not.toHaveBeenCalled();
    });

    it('should disable submit buttons during loading', () => {
      renderBookingForm({ isLoading: true });

      const addToCartButton = screen.getByText(/legg til i handlekurv/i);
      const completeButton = screen.getByText(/fullfør booking/i);

      expect(addToCartButton).toBeDisabled();
      expect(completeButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderBookingForm();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
      renderBookingForm();

      expect(screen.getByLabelText(/formål/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/antall deltakere/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/aktivitetstype/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/aktørtype/i)).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      renderBookingForm();

      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const purposeInput = screen.getByLabelText(/formål/i);

      // Tab to first input
      await user.tab();
      expect(purposeInput).toHaveFocus();

      // Type in input
      await user.keyboard('Test purpose');
      expect(purposeInput).toHaveValue('Test purpose');
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const submitButton = screen.getByText(/fullfør booking/i);
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/dette feltet er påkrevd/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle form with no selected slots', () => {
      renderBookingForm({ selectedSlots: [] });

      expect(screen.getByText(/ingen tidspunkter valgt/i)).toBeInTheDocument();
    });

    it('should handle very large attendees count', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const attendeesInput = screen.getByLabelText(/antall deltakere/i);
      await user.clear(attendeesInput);
      await user.type(attendeesInput, '9999');

      expect(attendeesInput).toHaveValue(9999);
    });

    it('should handle very long purpose text', async () => {
      const user = userEvent.setup();
      renderBookingForm();

      const longText = 'A'.repeat(500);
      const purposeInput = screen.getByLabelText(/formål/i);
      await user.type(purposeInput, longText);

      expect(purposeInput).toHaveValue(longText);
    });

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();

      renderBookingForm({ onCompleteBooking });

      // Fill form
      await user.type(screen.getByLabelText(/formål/i), 'Valid purpose');
      await user.click(screen.getByLabelText(/jeg aksepterer vilkårene/i));

      // Click submit button multiple times rapidly
      const submitButton = screen.getByText(/fullfør booking/i);
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only submit once
      await waitFor(() => {
        expect(onCompleteBooking).toHaveBeenCalledTimes(1);
      });
    });
  });
});
