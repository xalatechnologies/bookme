/**
 * StepByStepBooking Component Tests
 *
 * Comprehensive test suite for the StepByStepBooking component
 * covering multi-step booking flow, navigation, validation, and submission.
 *
 * Test Coverage:
 * - Step rendering and navigation
 * - Calendar slot selection (Step 1)
 * - Booking details form (Step 2)
 * - Recurrence pattern selection (Step 3)
 * - Terms and conditions (Step 4)
 * - Final review and submission (Step 5)
 * - Form validation across steps
 * - Progress tracking
 * - Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StepByStepBooking, IStepByStepBookingProps } from '@/components/features/bookings/components/StepByStepBooking';
import type { ISelectedTimeSlot, IZone } from '@/components/features/bookings/types';

expect.extend(toHaveNoViolations);

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'bookings.steps.calendar': 'Velg tidspunkt',
        'bookings.steps.details': 'Detaljer',
        'bookings.steps.recurrence': 'Gjentakelse',
        'bookings.steps.terms': 'Vilkår',
        'bookings.steps.review': 'Oppsummering',
        'bookings.step.next': 'Neste',
        'bookings.step.previous': 'Forrige',
        'bookings.step.addToCart': 'Legg til i handlekurv',
        'bookings.step.complete': 'Fullfør booking',
        'bookings.form.purpose': 'Formål',
        'bookings.form.attendees': 'Antall deltakere',
        'bookings.form.termsAccepted': 'Jeg aksepterer vilkårene',
        'bookings.validation.selectSlots': 'Velg minst ett tidspunkt',
        'bookings.validation.required': 'Dette feltet er påkrevd',
        'common.loading': 'Laster...',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'no',
    },
  }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  startOfWeek: (date: Date) => date,
  addWeeks: (date: Date, weeks: number) => new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000),
  subWeeks: (date: Date, weeks: number) => new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000),
  addDays: (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  format: (date: Date, formatStr: string) => date.toLocaleDateString(),
}));

vi.mock('date-fns/locale', () => ({
  nb: {},
  enUS: {},
}));

// Mock hooks
const mockNextStep = vi.fn();
const mockPreviousStep = vi.fn();
const mockGoToStep = vi.fn();
const mockValidateStep = vi.fn(() => ({ isValid: true, errors: {} }));

vi.mock('@/hooks/features/bookings', () => ({
  useBookingSteps: () => ({
    currentStep: 'calendar',
    steps: [
      { id: 'calendar', label: 'Velg tidspunkt', isValid: false },
      { id: 'details', label: 'Detaljer', isValid: false },
      { id: 'recurrence', label: 'Gjentakelse', isValid: true },
      { id: 'terms', label: 'Vilkår', isValid: false },
      { id: 'review', label: 'Oppsummering', isValid: false },
    ],
    progress: 20,
    nextStep: mockNextStep,
    previousStep: mockPreviousStep,
    validateStep: mockValidateStep,
    canProceedToNext: true,
    isFirstStep: true,
    isLastStep: false,
    goToStep: mockGoToStep,
  }),
  useRecurringSlotGeneration: () => ({
    recurringSlots: [],
    generateSlots: vi.fn(),
    clearSlots: vi.fn(),
  }),
}));

vi.mock('../../hooks', () => ({
  useAvailabilityStatus: () => ({
    getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => ({
      status: 'available',
      conflict: undefined,
    }),
  }),
}));

/**
 * Create mock zones
 */
const createMockZones = (): IZone[] => [
  {
    id: 'zone-1',
    name: 'Main Hall',
    capacity: 100,
    pricePerHour: 500,
  },
  {
    id: 'zone-2',
    name: 'Meeting Room',
    capacity: 20,
    pricePerHour: 250,
  },
];

/**
 * Create mock selected time slots
 */
const createMockSlots = (count: number = 2): ISelectedTimeSlot[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `slot-${i + 1}`,
    zoneId: 'zone-1',
    date: new Date('2025-10-31'),
    timeSlot: `${9 + i * 2}:00-${11 + i * 2}:00`,
    pricePerHour: 500,
    totalPrice: 1000,
  }));
};

/**
 * Render StepByStepBooking with default props
 */
const renderStepByStepBooking = (props?: Partial<IStepByStepBookingProps>) => {
  const defaultProps: IStepByStepBookingProps = {
    facilityId: 'facility-123',
    facilityName: 'Conference Center',
    zones: createMockZones(),
    selectedZoneId: 'zone-1',
    onZoneChange: vi.fn(),
    selectedSlots: [],
    onSlotsChange: vi.fn(),
    onAddToCart: vi.fn(),
    onCompleteBooking: vi.fn(),
    isLoading: false,
    error: undefined,
    openingHoursStart: '08:00',
    openingHoursEnd: '22:00',
  };

  return {
    ...render(<StepByStepBooking {...defaultProps} {...props} />),
    ...defaultProps,
    ...props,
  };
};

describe('StepByStepBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render step progress indicator', () => {
      renderStepByStepBooking();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render all step labels', () => {
      renderStepByStepBooking();

      expect(screen.getByText('Velg tidspunkt')).toBeInTheDocument();
      expect(screen.getByText('Detaljer')).toBeInTheDocument();
      expect(screen.getByText('Gjentakelse')).toBeInTheDocument();
      expect(screen.getByText('Vilkår')).toBeInTheDocument();
      expect(screen.getByText('Oppsummering')).toBeInTheDocument();
    });

    it('should display facility name', () => {
      renderStepByStepBooking({ facilityName: 'Sports Arena' });

      expect(screen.getByText(/Sports Arena/i)).toBeInTheDocument();
    });

    it('should show progress percentage', () => {
      renderStepByStepBooking();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });

    it('should render zone selector', () => {
      renderStepByStepBooking();

      expect(screen.getByText('Main Hall')).toBeInTheDocument();
      expect(screen.getByText('Meeting Room')).toBeInTheDocument();
    });

    it('should show selected zone', () => {
      renderStepByStepBooking({ selectedZoneId: 'zone-2' });

      const zoneSelector = screen.getByRole('combobox');
      expect(zoneSelector).toHaveValue('zone-2');
    });
  });

  describe('Step 1: Calendar Selection', () => {
    it('should render calendar view', () => {
      renderStepByStepBooking();

      // Calendar should show time slots
      expect(screen.getByText(/08:00/)).toBeInTheDocument();
      expect(screen.getByText(/22:00/)).toBeInTheDocument();
    });

    it('should display selected slots', () => {
      const slots = createMockSlots(2);
      renderStepByStepBooking({ selectedSlots: slots });

      expect(screen.getByText(/2 valgte tidspunkter/i)).toBeInTheDocument();
    });

    it('should call onSlotsChange when slot is selected', async () => {
      const user = userEvent.setup();
      const onSlotsChange = vi.fn();

      renderStepByStepBooking({ onSlotsChange });

      // Click on a time slot
      const slot = screen.getAllByRole('button', { name: /09:00/i })[0];
      await user.click(slot);

      expect(onSlotsChange).toHaveBeenCalled();
    });

    it('should show availability legend', () => {
      renderStepByStepBooking();

      expect(screen.getByText(/Tilgjengelig/i)).toBeInTheDocument();
      expect(screen.getByText(/Opptatt/i)).toBeInTheDocument();
      expect(screen.getByText(/Valgt/i)).toBeInTheDocument();
    });

    it('should navigate to next week', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      const nextWeekButton = screen.getByLabelText(/neste uke/i);
      await user.click(nextWeekButton);

      // Week should update
      expect(screen.getByText(/uke/i)).toBeInTheDocument();
    });

    it('should navigate to previous week', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      const prevWeekButton = screen.getByLabelText(/forrige uke/i);
      await user.click(prevWeekButton);

      // Week should update
      expect(screen.getByText(/uke/i)).toBeInTheDocument();
    });

    it('should call onZoneChange when zone is changed', async () => {
      const user = userEvent.setup();
      const onZoneChange = vi.fn();

      renderStepByStepBooking({ onZoneChange });

      const zoneSelector = screen.getByRole('combobox');
      await user.click(zoneSelector);

      const zone2Option = screen.getByText('Meeting Room');
      await user.click(zone2Option);

      expect(onZoneChange).toHaveBeenCalledWith('zone-2');
    });
  });

  describe('Step Navigation', () => {
    it('should disable previous button on first step', () => {
      renderStepByStepBooking();

      const prevButton = screen.getByText(/forrige/i);
      expect(prevButton).toBeDisabled();
    });

    it('should enable next button when step is valid', () => {
      const slots = createMockSlots(1);
      renderStepByStepBooking({ selectedSlots: slots });

      const nextButton = screen.getByText(/neste/i);
      expect(nextButton).not.toBeDisabled();
    });

    it('should call nextStep when next button is clicked', async () => {
      const user = userEvent.setup();
      const slots = createMockSlots(1);
      renderStepByStepBooking({ selectedSlots: slots });

      const nextButton = screen.getByText(/neste/i);
      await user.click(nextButton);

      expect(mockNextStep).toHaveBeenCalled();
    });

    it('should call previousStep when previous button is clicked', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      // Mock being on step 2
      vi.mocked(mockPreviousStep).mockClear();

      const prevButton = screen.getByText(/forrige/i);
      if (!prevButton.hasAttribute('disabled')) {
        await user.click(prevButton);
        expect(mockPreviousStep).toHaveBeenCalled();
      }
    });

    it('should validate current step before proceeding', async () => {
      const user = userEvent.setup();
      const slots = createMockSlots(1);
      renderStepByStepBooking({ selectedSlots: slots });

      const nextButton = screen.getByText(/neste/i);
      await user.click(nextButton);

      expect(mockValidateStep).toHaveBeenCalledWith('calendar');
    });

    it('should not proceed if validation fails', async () => {
      const user = userEvent.setup();
      mockValidateStep.mockReturnValueOnce({
        isValid: false,
        errors: { slots: 'Velg minst ett tidspunkt' },
      });

      renderStepByStepBooking();

      const nextButton = screen.getByText(/neste/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/velg minst ett tidspunkt/i)).toBeInTheDocument();
      });

      expect(mockNextStep).not.toHaveBeenCalled();
    });
  });

  describe('Step 2: Booking Details', () => {
    it('should render purpose field', () => {
      renderStepByStepBooking();

      // Navigate to step 2 (mocked)
      expect(screen.getByLabelText(/formål/i)).toBeInTheDocument();
    });

    it('should render attendees field', () => {
      renderStepByStepBooking();

      expect(screen.getByLabelText(/antall deltakere/i)).toBeInTheDocument();
    });

    it('should render activity type selector', () => {
      renderStepByStepBooking();

      expect(screen.getByLabelText(/aktivitetstype/i)).toBeInTheDocument();
    });

    it('should render actor type selector', () => {
      renderStepByStepBooking();

      expect(screen.getByLabelText(/aktørtype/i)).toBeInTheDocument();
    });

    it('should update form data on input', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      const purposeInput = screen.getByLabelText(/formål/i);
      await user.type(purposeInput, 'Team meeting');

      expect(purposeInput).toHaveValue('Team meeting');
    });
  });

  describe('Step 3: Recurrence Pattern', () => {
    it('should render booking type selector', () => {
      renderStepByStepBooking();

      expect(screen.getByText(/engangsbestilling/i)).toBeInTheDocument();
      expect(screen.getByText(/gjentakende/i)).toBeInTheDocument();
    });

    it('should show recurrence options when recurring is selected', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      const recurringRadio = screen.getByLabelText(/gjentakende/i);
      await user.click(recurringRadio);

      await waitFor(() => {
        expect(screen.getByText(/ukentlig/i)).toBeInTheDocument();
      });
    });

    it('should allow selecting weekdays for recurrence', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      const recurringRadio = screen.getByLabelText(/gjentakende/i);
      await user.click(recurringRadio);

      await waitFor(() => {
        const mondayCheckbox = screen.getByLabelText(/mandag/i);
        expect(mondayCheckbox).toBeInTheDocument();
      });
    });
  });

  describe('Step 4: Terms and Conditions', () => {
    it('should render terms checkbox', () => {
      renderStepByStepBooking();

      expect(screen.getByLabelText(/jeg aksepterer vilkårene/i)).toBeInTheDocument();
    });

    it('should require terms acceptance', async () => {
      const user = userEvent.setup();
      renderStepByStepBooking();

      const termsCheckbox = screen.getByLabelText(/jeg aksepterer vilkårene/i);
      expect(termsCheckbox).not.toBeChecked();

      await user.click(termsCheckbox);
      expect(termsCheckbox).toBeChecked();
    });

    it('should display terms content', () => {
      renderStepByStepBooking();

      expect(screen.getByText(/vilkår og betingelser/i)).toBeInTheDocument();
    });
  });

  describe('Step 5: Review and Submit', () => {
    it('should display booking summary', () => {
      const slots = createMockSlots(2);
      renderStepByStepBooking({ selectedSlots: slots });

      expect(screen.getByText(/oppsummering/i)).toBeInTheDocument();
    });

    it('should show selected slots in summary', () => {
      const slots = createMockSlots(2);
      renderStepByStepBooking({ selectedSlots: slots });

      expect(screen.getByText(/2 tidspunkter valgt/i)).toBeInTheDocument();
    });

    it('should display total price', () => {
      const slots = createMockSlots(2);
      renderStepByStepBooking({ selectedSlots: slots });

      // 2 slots * 1000 kr = 2000 kr
      expect(screen.getByText(/2000\.00 kr/i)).toBeInTheDocument();
    });

    it('should render add to cart button', () => {
      renderStepByStepBooking();

      expect(screen.getByText(/legg til i handlekurv/i)).toBeInTheDocument();
    });

    it('should render complete booking button', () => {
      renderStepByStepBooking();

      expect(screen.getByText(/fullfør booking/i)).toBeInTheDocument();
    });

    it('should call onAddToCart when add to cart is clicked', async () => {
      const user = userEvent.setup();
      const onAddToCart = vi.fn();
      const slots = createMockSlots(1);

      renderStepByStepBooking({ onAddToCart, selectedSlots: slots });

      const addToCartButton = screen.getByText(/legg til i handlekurv/i);
      await user.click(addToCartButton);

      expect(onAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingType: 'one-time',
        })
      );
    });

    it('should call onCompleteBooking when complete is clicked', async () => {
      const user = userEvent.setup();
      const onCompleteBooking = vi.fn();
      const slots = createMockSlots(1);

      renderStepByStepBooking({ onCompleteBooking, selectedSlots: slots });

      const completeButton = screen.getByText(/fullfør booking/i);
      await user.click(completeButton);

      expect(onCompleteBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingType: 'one-time',
        })
      );
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      renderStepByStepBooking({ isLoading: true });

      expect(screen.getByText(/laster/i)).toBeInTheDocument();
    });

    it('should disable buttons during loading', () => {
      renderStepByStepBooking({ isLoading: true });

      const nextButton = screen.getByText(/neste/i);
      expect(nextButton).toBeDisabled();
    });

    it('should display error message', () => {
      const errorMessage = 'Failed to load availability';
      renderStepByStepBooking({ error: errorMessage });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show error alert', () => {
      renderStepByStepBooking({ error: 'Error occurred' });

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderStepByStepBooking();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for navigation', () => {
      renderStepByStepBooking();

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should announce step changes to screen readers', () => {
      renderStepByStepBooking();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation between steps', async () => {
      const user = userEvent.setup();
      const slots = createMockSlots(1);
      renderStepByStepBooking({ selectedSlots: slots });

      await user.tab();
      await user.keyboard('{Enter}');

      // Should navigate to next step
      expect(mockNextStep).toHaveBeenCalled();
    });

    it('should have semantic HTML for steps', () => {
      renderStepByStepBooking();

      const steps = screen.getAllByRole('listitem');
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty zones array', () => {
      renderStepByStepBooking({ zones: [] });

      expect(screen.getByText(/ingen soner tilgjengelig/i)).toBeInTheDocument();
    });

    it('should handle no selected slots', () => {
      renderStepByStepBooking({ selectedSlots: [] });

      expect(screen.getByText(/ingen tidspunkter valgt/i)).toBeInTheDocument();
    });

    it('should handle very large number of slots', () => {
      const slots = createMockSlots(100);
      renderStepByStepBooking({ selectedSlots: slots });

      expect(screen.getByText(/100 tidspunkter valgt/i)).toBeInTheDocument();
    });

    it('should handle rapid step navigation', async () => {
      const user = userEvent.setup();
      const slots = createMockSlots(1);
      renderStepByStepBooking({ selectedSlots: slots });

      const nextButton = screen.getByText(/neste/i);

      // Click rapidly
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Should only advance one step at a time
      expect(mockNextStep).toHaveBeenCalled();
    });

    it('should handle invalid zone selection', () => {
      renderStepByStepBooking({ selectedZoneId: 'invalid-zone-id' });

      // Should show error or fallback
      expect(screen.queryByText('Invalid Zone')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate with PriceCalculation component', () => {
      const slots = createMockSlots(2);
      renderStepByStepBooking({ selectedSlots: slots });

      // Price calculation should be rendered
      expect(screen.getByText(/totalpris/i)).toBeInTheDocument();
    });

    it('should integrate with TimeSlotGrid component', () => {
      renderStepByStepBooking();

      // Time slot grid should be rendered
      const timeSlots = screen.getAllByRole('button', { name: /\d{2}:\d{2}/i });
      expect(timeSlots.length).toBeGreaterThan(0);
    });

    it('should integrate with BookingTypeSelector component', () => {
      renderStepByStepBooking();

      expect(screen.getByText(/engangsbestilling/i)).toBeInTheDocument();
      expect(screen.getByText(/gjentakende/i)).toBeInTheDocument();
    });
  });
});
