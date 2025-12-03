/**
 * Bookings Hook with Migration Support
 * Phase-aware hook for managing bookings across localStorage and Supabase
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { IStoredBooking } from '@/utils/localStorageTypes';
// Migration configuration
const MIGRATION_PHASES = {
  LOCALSTORAGE_ONLY: 0,
  READ_FALLBACK: 1,
  WRITE_BOTH: 2,
  SUPABASE_ONLY: 3,
} as const;

type MigrationPhase = typeof MIGRATION_PHASES[keyof typeof MIGRATION_PHASES];

const getCurrentMigrationPhase = (): MigrationPhase => {
  const phase = localStorage.getItem('migrationPhase');
  return phase ? parseInt(phase, 10) as MigrationPhase : MIGRATION_PHASES.LOCALSTORAGE_ONLY;
};

const logMigrationEvent = (event: string, data?: Record<string, unknown>): void => {
  console.log(`[Migration] ${event}`, data);
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface UseBookingsOptions {
  readonly userId?: string;
  readonly status?: 'pending' | 'awaiting_payment' | 'paid' | 'cancelled' | 'expired' | 'completed' | 'refunded';
  readonly autoSync?: boolean; // Auto-sync localStorage to Supabase on mount
}

export interface UseBookingsReturn {
  readonly bookings: readonly IStoredBooking[];
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly phase: MigrationPhase;
  readonly addBooking: (booking: IStoredBooking) => Promise<void>;
  readonly updateBooking: (id: string, updates: Partial<IStoredBooking>) => Promise<void>;
  readonly deleteBooking: (id: string) => Promise<void>;
  readonly syncWithLocalStorage: () => Promise<void>;
  readonly refresh: () => Promise<void>;
}

/**
 * Phase-aware bookings hook
 */
export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const { userId, status, autoSync = false } = options;

  const [bookings, setBookings] = useState<readonly IStoredBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [phase] = useState<MigrationPhase>(getCurrentMigrationPhase());

  // Read bookings based on phase
  const readBookings = useCallback(async (): Promise<readonly IStoredBooking[]> => {
    logMigrationEvent('readBookings', { phase, userId, status });

    try {
      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY: {
          // Phase 0: Only localStorage
          const key = status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const stored = localStorage.getItem(key);
          return stored ? JSON.parse(stored) : [];
        }

        case MIGRATION_PHASES.READ_FALLBACK: {
          // Phase 1: Try Supabase, fallback to localStorage
          if (userId) {
            try {
              const query = supabase
                .from('bookings')
                .select('*')
                .eq('user_id', userId);

              if (status) {
                query.eq('status', status);
              }

              const { data: supabaseData, error: supabaseError } = await query;

              if (supabaseError) throw supabaseError;

              if (supabaseData && supabaseData.length > 0) {
                logMigrationEvent('readBookings:supabase', { count: supabaseData.length });
                return supabaseData.map(mapSupabaseToStoredBooking);
              }
            } catch (supabaseError) {
              logMigrationEvent('readBookings:supabase:fallback', { error: supabaseError });
            }
          }

          // Fallback to localStorage
          const key = status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const stored = localStorage.getItem(key);
          return stored ? JSON.parse(stored) : [];
        }

        case MIGRATION_PHASES.WRITE_BOTH:
        case MIGRATION_PHASES.SUPABASE_ONLY: {
          // Phase 2 & 3: Read from Supabase
          if (userId) {
            const query = supabase
              .from('bookings')
              .select('*')
              .eq('user_id', userId);

            if (status) {
              query.eq('status', status);
            }

            const { data: supabaseData, error: supabaseError } = await query;

            if (supabaseError) throw supabaseError;

            return (supabaseData || []).map(mapSupabaseToStoredBooking);
          }

          // Phase 2: Fallback to localStorage if no userId
          if (phase === MIGRATION_PHASES.WRITE_BOTH) {
            const key = status === 'pending' ? 'pendingBookings' : 'processedBookings';
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
          }

          return [];
        }

        default:
          return [];
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('readBookings:error', { error: error.message });
      throw error;
    }
  }, [phase, userId, status]);

  // Write booking based on phase
  const writeBooking = useCallback(async (booking: IStoredBooking): Promise<void> => {
    logMigrationEvent('writeBooking', { phase, bookingId: booking.id });

    try {
      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY:
        case MIGRATION_PHASES.READ_FALLBACK: {
          // Phase 0 & 1: Write to localStorage
          const key = booking.status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const stored = localStorage.getItem(key);
          const existing: IStoredBooking[] = stored ? JSON.parse(stored) : [];
          const updated = [...existing.filter(b => b.id !== booking.id), booking];
          localStorage.setItem(key, JSON.stringify(updated));
          break;
        }

        case MIGRATION_PHASES.WRITE_BOTH: {
          // Phase 2: Write to both
          // localStorage
          const key = booking.status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const stored = localStorage.getItem(key);
          const existing: IStoredBooking[] = stored ? JSON.parse(stored) : [];
          const updated = [...existing.filter(b => b.id !== booking.id), booking];
          localStorage.setItem(key, JSON.stringify(updated));

          // Supabase
          if (userId) {
            const { error: supabaseError } = await supabase
              .from('bookings')
              .upsert(mapStoredBookingToSupabase(booking, userId));

            if (supabaseError) throw supabaseError;
          }
          break;
        }

        case MIGRATION_PHASES.SUPABASE_ONLY: {
          // Phase 3: Only Supabase
          if (userId) {
            const { error: supabaseError } = await supabase
              .from('bookings')
              .upsert(mapStoredBookingToSupabase(booking, userId));

            if (supabaseError) throw supabaseError;
          }
          break;
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('writeBooking:error', { error: error.message });
      throw error;
    }
  }, [phase, userId]);

  // Refresh function - must be defined before other callbacks that use it
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await readBookings();
      setBookings(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [readBookings]);

  // Public methods
  const addBooking = useCallback(async (booking: IStoredBooking): Promise<void> => {
    try {
      setError(null);
      await writeBooking(booking);
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [writeBooking, refresh]);

  const updateBooking = useCallback(async (
    id: string,
    updates: Partial<IStoredBooking>
  ): Promise<void> => {
    try {
      setError(null);
      const existing = bookings.find(b => b.id === id);
      if (!existing) {
        throw new Error(`Booking ${id} not found`);
      }

      const updated = { ...existing, ...updates };
      await writeBooking(updated);
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [bookings, writeBooking, refresh]);

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY:
        case MIGRATION_PHASES.READ_FALLBACK: {
          // Remove from localStorage
          const key = status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const stored = localStorage.getItem(key);
          const existing: IStoredBooking[] = stored ? JSON.parse(stored) : [];
          const updated = existing.filter(b => b.id !== id);
          localStorage.setItem(key, JSON.stringify(updated));
          break;
        }

        case MIGRATION_PHASES.WRITE_BOTH: {
          // Remove from both
          const key = status === 'pending' ? 'pendingBookings' : 'processedBookings';
          const stored = localStorage.getItem(key);
          const existing: IStoredBooking[] = stored ? JSON.parse(stored) : [];
          const updated = existing.filter(b => b.id !== id);
          localStorage.setItem(key, JSON.stringify(updated));

          if (userId) {
            await supabase.from('bookings').delete().eq('id', id);
          }
          break;
        }

        case MIGRATION_PHASES.SUPABASE_ONLY: {
          if (userId) {
            await supabase.from('bookings').delete().eq('id', id);
          }
          break;
        }
      }

      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [phase, userId, status, refresh]);

  const syncWithLocalStorage = useCallback(async (): Promise<void> => {
    if (!userId) {
      throw new Error('userId required for sync');
    }

    try {
      logMigrationEvent('syncWithLocalStorage:start');

      // Read all bookings from localStorage
      const pendingStored = localStorage.getItem('pendingBookings');
      const processedStored = localStorage.getItem('processedBookings');

      const pending: IStoredBooking[] = pendingStored ? JSON.parse(pendingStored) : [];
      const processed: IStoredBooking[] = processedStored ? JSON.parse(processedStored) : [];
      const all = [...pending, ...processed];

      // Migrate to Supabase
      for (const booking of all) {
        const { error } = await supabase
          .from('bookings')
          .upsert(mapStoredBookingToSupabase(booking, userId));

        if (error) {
          logMigrationEvent('syncWithLocalStorage:error', { bookingId: booking.id, error });
        }
      }

      logMigrationEvent('syncWithLocalStorage:complete', { count: all.length });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('syncWithLocalStorage:error', { error: error.message });
      throw error;
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-sync if enabled
  useEffect(() => {
    if (autoSync && userId && phase >= MIGRATION_PHASES.WRITE_BOTH) {
      syncWithLocalStorage().catch(err => {
        console.error('Auto-sync failed:', err);
      });
    }
  }, [autoSync, userId, phase, syncWithLocalStorage]);

  return {
    bookings,
    isLoading,
    error,
    phase,
    addBooking,
    updateBooking,
    deleteBooking,
    syncWithLocalStorage,
    refresh,
  };
}

// Mapping functions
function mapSupabaseToStoredBooking(row: Record<string, unknown>): IStoredBooking {
  return {
    id: String(row.id || ''),
    facilityName: row.facility_name ? String(row.facility_name) : undefined,
    facility: row.facility ? String(row.facility) : undefined,
    facilityId: row.facility_id ? String(row.facility_id) : undefined,
    startDate: row.starts_at ? String(row.starts_at) : '',
    date: row.booking_date ? String(row.booking_date) : undefined,
    startTime: row.start_time ? String(row.start_time) : undefined,
    endTime: row.end_time ? String(row.end_time) : undefined,
    time: row.time ? String(row.time) : undefined,
    duration: typeof row.duration === 'string' || typeof row.duration === 'number' ? row.duration : undefined,
    status: row.status as IStoredBooking['status'],
    price: typeof row.total_cents === 'string' || typeof row.total_cents === 'number' ? row.total_cents : undefined,
    purpose: row.purpose ? String(row.purpose) : undefined,
    description: row.notes ? String(row.notes) : undefined,
    contactPerson: row.contact_person ? String(row.contact_person) : undefined,
    bookerName: row.booker_name ? String(row.booker_name) : undefined,
    bookerEmail: row.booker_email ? String(row.booker_email) : undefined,
    submittedAt: row.created_at ? String(row.created_at) : undefined,
    requestedAt: row.created_at ? String(row.created_at) : undefined,
    processedBy: row.processed_by ? String(row.processed_by) : undefined,
    processedAt: row.updated_at ? String(row.updated_at) : undefined,
    isRecurring: Boolean(row.is_recurring),
    parentBookingId: row.parent_booking_id ? String(row.parent_booking_id) : undefined,
  };
}

function mapStoredBookingToSupabase(booking: IStoredBooking, userId: string): Database['public']['Tables']['bookings']['Insert'] {
  return {
    user_id: userId,
    facility_id: booking.facilityId || '',
    org_id: '', // TODO: Get from context
    starts_at: booking.startDate,
    ends_at: booking.startDate, // TODO: Calculate from duration
    status: booking.status === 'approved' ? 'paid' : booking.status === 'rejected' ? 'cancelled' : (booking.status || 'pending'),
    total_cents: typeof booking.price === 'number' ? booking.price * 100 : parseFloat(String(booking.price || '0').replace(/[^0-9.]/g, '')) * 100,
    currency: 'NOK',
    notes: booking.description || null,
    is_recurring: booking.isRecurring || false,
  };
}
