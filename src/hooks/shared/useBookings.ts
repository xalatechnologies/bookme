/**
 * useBookings Hook
 *
 * Provides a unified interface for booking operations with automatic
 * storage layer abstraction. Handles gradual migration from localStorage
 * to Supabase with three phases:
 *
 * Phase 1 (fallback): Read from Supabase with localStorage fallback
 * Phase 2 (dual-write): Write to both, read from Supabase with fallback
 * Phase 3 (supabase-only): All operations go to Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IStoredBooking } from '@/utils/localStorageTypes';
import {
  getStoredBookings,
  setStoredBookings,
} from '@/utils/localStorageTypes';
import {
  getMigrationPhase,
  type MigrationPhase,
  MigrationError,
} from '@/utils/storageMigration';

/**
 * Return type for useBookings hook
 */
interface UseBookingsReturn {
  readonly bookings: readonly IStoredBooking[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly addBooking: (booking: IStoredBooking) => Promise<void>;
  readonly updateBooking: (id: string, updates: Partial<IStoredBooking>) => Promise<void>;
  readonly deleteBooking: (id: string) => Promise<void>;
  readonly syncWithLocalStorage: () => Promise<void>;
  readonly refetch: () => Promise<void>;
}

/**
 * Convert Supabase booking row to IStoredBooking format
 */
const mapSupabaseToStoredBooking = (row: Record<string, unknown>): IStoredBooking => {
  return {
    id: String(row.id),
    facilityId: row.facility_id ? String(row.facility_id) : undefined,
    facilityName: row.facility_name ? String(row.facility_name) : undefined,
    facility: row.facility_name ? String(row.facility_name) : undefined,
    startDate: row.start_date ? String(row.start_date) : '',
    date: row.start_date ? String(row.start_date) : undefined,
    startTime: row.start_time ? String(row.start_time) : undefined,
    time: row.start_time ? String(row.start_time) : undefined,
    endTime: row.end_time ? String(row.end_time) : undefined,
    duration: row.duration ? Number(row.duration) : undefined,
    status: row.status as 'approved' | 'rejected' | 'pending' | 'cancelled' | undefined,
    price: row.price_cents ? Number(row.price_cents) / 100 : undefined,
    purpose: row.purpose ? String(row.purpose) : undefined,
    description: row.description ? String(row.description) : undefined,
    contactPerson: row.contact_person ? String(row.contact_person) : undefined,
    bookerName: row.booker_name ? String(row.booker_name) : undefined,
    bookerEmail: row.booker_email ? String(row.booker_email) : undefined,
    submittedAt: row.submitted_at ? String(row.submitted_at) : undefined,
    requestedAt: row.submitted_at ? String(row.submitted_at) : undefined,
    processedBy: row.processed_by ? String(row.processed_by) : undefined,
    processedAt: row.processed_at ? String(row.processed_at) : undefined,
    isRecurring: row.is_recurring ? Boolean(row.is_recurring) : undefined,
    parentBookingId: row.parent_booking_id ? String(row.parent_booking_id) : undefined,
  };
};

/**
 * Convert IStoredBooking to Supabase insert format
 */
const mapStoredBookingToSupabase = (
  booking: IStoredBooking,
  userId: string
): Record<string, unknown> => {
  return {
    id: booking.id,
    user_id: userId,
    facility_id: booking.facilityId,
    facility_name: booking.facilityName || booking.facility,
    start_date: booking.startDate || booking.date,
    start_time: booking.startTime || booking.time,
    end_time: booking.endTime,
    duration: typeof booking.duration === 'number'
      ? booking.duration
      : parseFloat(String(booking.duration || '0')),
    status: booking.status || 'pending',
    price_cents: typeof booking.price === 'number'
      ? Math.round(booking.price * 100)
      : Math.round(parseFloat(String(booking.price || '0')) * 100),
    purpose: booking.purpose,
    description: booking.description,
    contact_person: booking.contactPerson,
    booker_name: booking.bookerName,
    booker_email: booking.bookerEmail,
    submitted_at: booking.submittedAt || booking.requestedAt,
    processed_by: booking.processedBy,
    processed_at: booking.processedAt,
    is_recurring: booking.isRecurring || false,
    parent_booking_id: booking.parentBookingId,
  };
};

/**
 * Hook to manage bookings with storage migration support
 *
 * @param userId - The current user ID
 * @param bookingType - Type of bookings to fetch ('pending' or 'processed')
 * @param autoFetch - Whether to automatically fetch on mount
 *
 * @example
 * ```typescript
 * const {
 *   bookings,
 *   isLoading,
 *   addBooking,
 *   updateBooking,
 *   deleteBooking
 * } = useBookings(userId, 'pending', true);
 *
 * // Add a new booking
 * const handleAddBooking = async (booking: IStoredBooking) => {
 *   await addBooking(booking);
 * };
 *
 * // Update existing booking
 * const handleUpdateBooking = async (id: string, status: string) => {
 *   await updateBooking(id, { status });
 * };
 * ```
 */
export const useBookings = (
  userId: string | null,
  bookingType: 'pending' | 'processed' | 'all' = 'all',
  autoFetch: boolean = true
): UseBookingsReturn => {
  const [bookings, setBookings] = useState<readonly IStoredBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const phase = getMigrationPhase();

  /**
   * Fetch bookings based on current migration phase
   */
  const fetchBookings = useCallback(async (): Promise<void> => {
    if (!userId) {
      setBookings([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedBookings: IStoredBooking[] = [];

      // Phase 1: Try Supabase first, fallback to localStorage
      if (phase === 'fallback') {
        try {
          const query = supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId);

          // Filter by status if not 'all'
          if (bookingType === 'pending') {
            query.eq('status', 'pending');
          } else if (bookingType === 'processed') {
            query.in('status', ['approved', 'rejected', 'cancelled']);
          }

          const { data, error: supabaseError } = await query;

          if (supabaseError) {
            throw supabaseError;
          }

          if (data && data.length > 0) {
            fetchedBookings = data.map(mapSupabaseToStoredBooking);
          } else {
            // Fallback to localStorage
            const localKey = bookingType === 'all' ? null :
              bookingType === 'pending' ? 'pendingBookings' : 'processedBookings';

            if (localKey) {
              fetchedBookings = getStoredBookings(localKey);
            } else {
              const pending = getStoredBookings('pendingBookings');
              const processed = getStoredBookings('processedBookings');
              fetchedBookings = [...pending, ...processed];
            }
          }
        } catch (supabaseError) {
          console.error('Supabase fetch failed, using localStorage:', supabaseError);
          // Fallback to localStorage
          const localKey = bookingType === 'all' ? null :
            bookingType === 'pending' ? 'pendingBookings' : 'processedBookings';

          if (localKey) {
            fetchedBookings = getStoredBookings(localKey);
          } else {
            const pending = getStoredBookings('pendingBookings');
            const processed = getStoredBookings('processedBookings');
            fetchedBookings = [...pending, ...processed];
          }
        }
      }

      // Phase 2 & 3: Read from Supabase (with fallback in phase 2)
      if (phase === 'dual-write' || phase === 'supabase-only') {
        try {
          const query = supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId);

          // Filter by status if not 'all'
          if (bookingType === 'pending') {
            query.eq('status', 'pending');
          } else if (bookingType === 'processed') {
            query.in('status', ['approved', 'rejected', 'cancelled']);
          }

          const { data, error: supabaseError } = await query;

          if (supabaseError) {
            throw supabaseError;
          }

          fetchedBookings = data ? data.map(mapSupabaseToStoredBooking) : [];
        } catch (supabaseError) {
          // Only fallback in phase 2
          if (phase === 'dual-write') {
            console.error('Supabase fetch failed, using localStorage:', supabaseError);
            const localKey = bookingType === 'all' ? null :
              bookingType === 'pending' ? 'pendingBookings' : 'processedBookings';

            if (localKey) {
              fetchedBookings = getStoredBookings(localKey);
            } else {
              const pending = getStoredBookings('pendingBookings');
              const processed = getStoredBookings('processedBookings');
              fetchedBookings = [...pending, ...processed];
            }
          } else {
            throw supabaseError;
          }
        }
      }

      setBookings(fetchedBookings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to fetch bookings: ${errorMessage}`));
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, bookingType, phase]);

  /**
   * Add a new booking with phase-aware storage
   */
  const addBooking = useCallback(
    async (booking: IStoredBooking): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to add booking');
      }

      setError(null);

      try {
        // Phase 1: Write to localStorage only
        if (phase === 'fallback') {
          const key = booking.status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const existing = getStoredBookings(key);
          setStoredBookings(key, [...existing, booking]);
        }

        // Phase 2: Write to both
        if (phase === 'dual-write') {
          // Write to localStorage
          const localKey = booking.status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const existing = getStoredBookings(localKey);
          setStoredBookings(localKey, [...existing, booking]);

          // Write to Supabase
          const supabaseData = mapStoredBookingToSupabase(booking, userId);
          const { error: supabaseError } = await supabase
            .from('bookings')
            .insert(supabaseData);

          if (supabaseError) {
            throw new MigrationError(
              'Failed to write to Supabase',
              phase,
              'add_booking',
              supabaseError
            );
          }
        }

        // Phase 3: Write to Supabase only
        if (phase === 'supabase-only') {
          const supabaseData = mapStoredBookingToSupabase(booking, userId);
          const { error: supabaseError } = await supabase
            .from('bookings')
            .insert(supabaseData);

          if (supabaseError) {
            throw new MigrationError(
              'Failed to write to Supabase',
              phase,
              'add_booking',
              supabaseError
            );
          }
        }

        // Refetch to update local state
        await fetchBookings();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Failed to add booking: ${errorMessage}`));
        throw err;
      }
    },
    [userId, phase, fetchBookings]
  );

  /**
   * Update an existing booking
   */
  const updateBooking = useCallback(
    async (id: string, updates: Partial<IStoredBooking>): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to update booking');
      }

      setError(null);

      try {
        // Phase 1: Update localStorage only
        if (phase === 'fallback') {
          ['pendingBookings', 'processedBookings'].forEach((key) => {
            const existing = getStoredBookings(key as 'pendingBookings' | 'processedBookings');
            const updated = existing.map((b) =>
              b.id === id ? { ...b, ...updates } : b
            );
            if (existing.length !== updated.length || existing.some((b, i) => b !== updated[i])) {
              setStoredBookings(key as 'pendingBookings' | 'processedBookings', updated);
            }
          });
        }

        // Phase 2: Update both
        if (phase === 'dual-write') {
          // Update localStorage
          ['pendingBookings', 'processedBookings'].forEach((key) => {
            const existing = getStoredBookings(key as 'pendingBookings' | 'processedBookings');
            const updated = existing.map((b) =>
              b.id === id ? { ...b, ...updates } : b
            );
            if (existing.some((b, i) => b !== updated[i])) {
              setStoredBookings(key as 'pendingBookings' | 'processedBookings', updated);
            }
          });

          // Update Supabase
          const supabaseUpdates: Record<string, unknown> = {};
          if (updates.status) supabaseUpdates.status = updates.status;
          if (updates.processedBy) supabaseUpdates.processed_by = updates.processedBy;
          if (updates.processedAt) supabaseUpdates.processed_at = updates.processedAt;
          if (updates.description) supabaseUpdates.description = updates.description;

          const { error: supabaseError } = await supabase
            .from('bookings')
            .update(supabaseUpdates)
            .eq('id', id)
            .eq('user_id', userId);

          if (supabaseError) {
            throw new MigrationError(
              'Failed to update in Supabase',
              phase,
              'update_booking',
              supabaseError
            );
          }
        }

        // Phase 3: Update Supabase only
        if (phase === 'supabase-only') {
          const supabaseUpdates: Record<string, unknown> = {};
          if (updates.status) supabaseUpdates.status = updates.status;
          if (updates.processedBy) supabaseUpdates.processed_by = updates.processedBy;
          if (updates.processedAt) supabaseUpdates.processed_at = updates.processedAt;
          if (updates.description) supabaseUpdates.description = updates.description;

          const { error: supabaseError } = await supabase
            .from('bookings')
            .update(supabaseUpdates)
            .eq('id', id)
            .eq('user_id', userId);

          if (supabaseError) {
            throw new MigrationError(
              'Failed to update in Supabase',
              phase,
              'update_booking',
              supabaseError
            );
          }
        }

        // Refetch to update local state
        await fetchBookings();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Failed to update booking: ${errorMessage}`));
        throw err;
      }
    },
    [userId, phase, fetchBookings]
  );

  /**
   * Delete a booking
   */
  const deleteBooking = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to delete booking');
      }

      setError(null);

      try {
        // Phase 1: Delete from localStorage only
        if (phase === 'fallback') {
          ['pendingBookings', 'processedBookings'].forEach((key) => {
            const existing = getStoredBookings(key as 'pendingBookings' | 'processedBookings');
            const filtered = existing.filter((b) => b.id !== id);
            if (existing.length !== filtered.length) {
              setStoredBookings(key as 'pendingBookings' | 'processedBookings', filtered);
            }
          });
        }

        // Phase 2: Delete from both
        if (phase === 'dual-write') {
          // Delete from localStorage
          ['pendingBookings', 'processedBookings'].forEach((key) => {
            const existing = getStoredBookings(key as 'pendingBookings' | 'processedBookings');
            const filtered = existing.filter((b) => b.id !== id);
            if (existing.length !== filtered.length) {
              setStoredBookings(key as 'pendingBookings' | 'processedBookings', filtered);
            }
          });

          // Delete from Supabase
          const { error: supabaseError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

          if (supabaseError) {
            throw new MigrationError(
              'Failed to delete from Supabase',
              phase,
              'delete_booking',
              supabaseError
            );
          }
        }

        // Phase 3: Delete from Supabase only
        if (phase === 'supabase-only') {
          const { error: supabaseError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

          if (supabaseError) {
            throw new MigrationError(
              'Failed to delete from Supabase',
              phase,
              'delete_booking',
              supabaseError
            );
          }
        }

        // Refetch to update local state
        await fetchBookings();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Failed to delete booking: ${errorMessage}`));
        throw err;
      }
    },
    [userId, phase, fetchBookings]
  );

  /**
   * Sync localStorage with Supabase (useful during migration)
   */
  const syncWithLocalStorage = useCallback(async (): Promise<void> => {
    if (!userId || phase === 'supabase-only') {
      return;
    }

    setError(null);

    try {
      const pending = getStoredBookings('pendingBookings');
      const processed = getStoredBookings('processedBookings');
      const allLocal = [...pending, ...processed];

      for (const booking of allLocal) {
        const supabaseData = mapStoredBookingToSupabase(booking, userId);
        await supabase.from('bookings').upsert(supabaseData);
      }

      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to sync with localStorage: ${errorMessage}`));
    }
  }, [userId, phase, fetchBookings]);

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchBookings();
    }
  }, [autoFetch, userId, fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    addBooking,
    updateBooking,
    deleteBooking,
    syncWithLocalStorage,
    refetch: fetchBookings,
  };
};

/**
 * Export type for external use
 */
export type { UseBookingsReturn };
