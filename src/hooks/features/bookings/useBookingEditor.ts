/**
 * Booking Editor Hook
 *
 * Manages booking creation and editing with business logic separation.
 * Handles form state, validation, and save operations.
 * Follows clean architecture principles with proper layer separation.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useBooking,
  useCreateBooking,
  useUpdateBooking,
} from '@/services/supabase/bookings.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useAuth } from '@/contexts/AuthContext';
import {
  validateBookingData,
  detectBookingConflicts,
  calculateBookingPrice,
  type ActorType,
  type BookingValidationResult,
  type BookingConflict,
  type PriceBreakdown,
} from '@/services/business/booking.business.service';
import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export interface IUseBookingEditorOptions {
  readonly bookingId?: string;
  readonly isNewBooking?: boolean;
  readonly onSaveSuccess?: (booking: Booking) => void;
  readonly onSaveError?: (error: Error) => void;
}

export interface IUseBookingEditorReturn {
  // Data
  readonly booking: Booking | null;
  readonly editedBooking: Partial<Booking> | null;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: Error | null;

  // Validation
  readonly validationErrors: readonly string[];
  readonly isValid: boolean;
  readonly conflicts: readonly BookingConflict[];
  readonly hasConflicts: boolean;

  // Pricing
  readonly priceBreakdown: PriceBreakdown | null;

  // State
  readonly hasUnsavedChanges: boolean;
  readonly showSaveMessage: boolean;

  // Actions
  readonly updateField: (field: keyof Booking, value: any) => void;
  readonly updateFields: (fields: Partial<Booking>) => void;
  readonly calculatePrice: (basePrice: number, actorType: ActorType) => void;
  readonly checkConflicts: (existingBookings: readonly Booking[]) => void;
  readonly save: () => Promise<void>;
  readonly cancel: () => void;
  readonly reset: () => void;
}

/**
 * Hook for editing bookings with clean architecture
 *
 * Provides comprehensive booking form management including:
 * - Form state management with change tracking
 * - Real-time validation with business rules
 * - Price calculation with actor-based discounts
 * - Conflict detection with existing bookings
 * - Save operations with error handling
 * - Optimistic UI updates
 *
 * @param options - Configuration options for the editor
 * @returns Complete booking editor interface
 *
 * @example
 * ```tsx
 * function BookingEditorPage({ bookingId }: { bookingId?: string }) {
 *   const {
 *     editedBooking,
 *     isLoading,
 *     isSaving,
 *     validationErrors,
 *     isValid,
 *     hasConflicts,
 *     priceBreakdown,
 *     updateField,
 *     calculatePrice,
 *     checkConflicts,
 *     save,
 *     cancel,
 *   } = useBookingEditor({
 *     bookingId,
 *     isNewBooking: !bookingId,
 *     onSaveSuccess: (booking) => {
 *       toast.success('Booking saved!');
 *       navigate(`/bookings/${booking.id}`);
 *     },
 *   });
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     if (!isValid || hasConflicts) return;
 *     await save();
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <FacilitySelect
 *         value={editedBooking?.facility_id}
 *         onChange={(id) => updateField('facility_id', id)}
 *       />
 *       <DateTimeRangePicker
 *         startTime={editedBooking?.starts_at}
 *         endTime={editedBooking?.ends_at}
 *         onChange={(start, end) => {
 *           updateFields({ starts_at: start, ends_at: end });
 *           checkConflicts(existingBookings);
 *         }}
 *       />
 *       {hasConflicts && <ConflictWarning />}
 *       {priceBreakdown && <PriceBreakdown breakdown={priceBreakdown} />}
 *       <button type="submit" disabled={!isValid || hasConflicts || isSaving}>
 *         {isSaving ? 'Saving...' : 'Save Booking'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export const useBookingEditor = (
  options: IUseBookingEditorOptions
): IUseBookingEditorReturn => {
  const { bookingId, isNewBooking = false, onSaveSuccess, onSaveError } = options;

  const navigate = useNavigate();
  const orgId = useOrganizationId();
  const { user } = useAuth();

  // Data layer - fetch booking if editing
  const {
    data: booking = null,
    isLoading,
    error,
  } = useBooking(bookingId || '', !isNewBooking);
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();

  // Local state
  const [editedBooking, setEditedBooking] = useState<Partial<Booking> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [conflicts, setConflicts] = useState<readonly BookingConflict[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  // Initialize edited booking
  useEffect(() => {
    if (isNewBooking) {
      // Create new booking template
      const now = new Date();
      const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const defaultEnd = new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      setEditedBooking({
        facility_id: '',
        zone_id: null,
        user_id: user?.id || '',
        org_id: orgId,
        starts_at: defaultStart.toISOString(),
        ends_at: defaultEnd.toISOString(),
        status: 'pending',
        total_cents: 0,
        currency: 'NOK',
        is_recurring: false,
        recurrence_pattern: null,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else if (booking) {
      setEditedBooking({ ...booking });
    }
  }, [booking, isNewBooking, orgId, user]);

  // Validation
  const validation: BookingValidationResult = validateBookingData(editedBooking || {});

  // Actions
  const updateField = useCallback((field: keyof Booking, value: any): void => {
    setEditedBooking((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  const updateFields = useCallback((fields: Partial<Booking>): void => {
    setEditedBooking((prev) => {
      if (!prev) return prev;
      return { ...prev, ...fields };
    });
    setHasUnsavedChanges(true);
  }, []);

  const calculatePrice = useCallback(
    (basePrice: number, actorType: ActorType): void => {
      const currency = editedBooking?.currency || 'NOK';
      const breakdown = calculateBookingPrice(basePrice, actorType, currency);
      setPriceBreakdown(breakdown);

      // Update total_cents in edited booking
      updateField('total_cents', Math.round(breakdown.total));
    },
    [editedBooking?.currency, updateField]
  );

  const checkConflicts = useCallback(
    (existingBookings: readonly Booking[]): void => {
      if (!editedBooking?.facility_id || !editedBooking?.starts_at || !editedBooking?.ends_at) {
        setConflicts([]);
        return;
      }

      const detectedConflicts = detectBookingConflicts(
        existingBookings,
        editedBooking.starts_at,
        editedBooking.ends_at,
        editedBooking.facility_id,
        editedBooking.zone_id,
        bookingId // Exclude current booking when editing
      );

      setConflicts(detectedConflicts);
    },
    [editedBooking, bookingId]
  );

  const save = useCallback(async (): Promise<void> => {
    if (!editedBooking) {
      throw new Error('No booking data to save');
    }

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (conflicts.length > 0) {
      throw new Error('Cannot save booking with conflicts. Please choose a different time slot.');
    }

    try {
      if (isNewBooking) {
        // Create new booking
        const newBooking = await createBookingMutation.mutateAsync(
          editedBooking as BookingInsert
        );
        setHasUnsavedChanges(false);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);

        if (onSaveSuccess) {
          onSaveSuccess(newBooking);
        } else {
          navigate(`/bookings/${newBooking.id}`);
        }
      } else if (bookingId) {
        // Update existing booking
        await updateBookingMutation.mutateAsync({
          id: bookingId,
          updates: editedBooking as BookingUpdate,
        });
        setHasUnsavedChanges(false);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);

        if (onSaveSuccess && booking) {
          onSaveSuccess(booking);
        }
      }
    } catch (error) {
      console.error('Failed to save booking:', error);
      if (onSaveError && error instanceof Error) {
        onSaveError(error);
      }
      throw error;
    }
  }, [
    editedBooking,
    validation,
    conflicts,
    isNewBooking,
    bookingId,
    booking,
    createBookingMutation,
    updateBookingMutation,
    navigate,
    onSaveSuccess,
    onSaveError,
  ]);

  const cancel = useCallback((): void => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
    }

    if (isNewBooking) {
      navigate('/bookings');
    } else if (booking) {
      setEditedBooking({ ...booking });
      setHasUnsavedChanges(false);
    }
  }, [hasUnsavedChanges, isNewBooking, booking, navigate]);

  const reset = useCallback((): void => {
    if (booking) {
      setEditedBooking({ ...booking });
      setHasUnsavedChanges(false);
      setConflicts([]);
      setPriceBreakdown(null);
    }
  }, [booking]);

  return {
    // Data
    booking,
    editedBooking,
    isLoading,
    isSaving: createBookingMutation.isPending || updateBookingMutation.isPending,
    error,

    // Validation
    validationErrors: validation.errors,
    isValid: validation.isValid,
    conflicts,
    hasConflicts: conflicts.length > 0,

    // Pricing
    priceBreakdown,

    // State
    hasUnsavedChanges,
    showSaveMessage,

    // Actions
    updateField,
    updateFields,
    calculatePrice,
    checkConflicts,
    save,
    cancel,
    reset,
  };
};
