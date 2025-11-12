/**
 * Migration Utilities
 * Helper functions for localStorage → Supabase migration
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

import { createClient } from '@supabase/supabase-js';
import type { Database, MigrationResult, ValidationResult } from '@/types/supabase/database.types';
import type { IStoredBooking } from '@/utils/localStorageTypes';
import { logMigrationEvent, defaultMigrationConfig } from '@/config/migrationConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Progress callback for migration operations
 */
export interface MigrationProgress {
  readonly phase: 'bookings' | 'preferences' | 'drafts';
  readonly current: number;
  readonly total: number;
  readonly percentage: number;
}

/**
 * Migrate all localStorage bookings to Supabase
 */
export async function migrateBookingsToSupabase(
  userId: string,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  logMigrationEvent('migrateBookingsToSupabase:start', { userId });

  const errors: string[] = [];
  let bookingsMigrated = 0;

  try {
    // Read bookings from localStorage
    const pendingStored = localStorage.getItem('pendingBookings');
    const processedStored = localStorage.getItem('processedBookings');

    const pending: IStoredBooking[] = pendingStored ? JSON.parse(pendingStored) : [];
    const processed: IStoredBooking[] = processedStored ? JSON.parse(processedStored) : [];
    const allBookings = [...pending, ...processed];

    const total = allBookings.length;

    onProgress?.({
      phase: 'bookings',
      current: 0,
      total,
      percentage: 0,
    });

    // Migrate in batches
    for (let i = 0; i < allBookings.length; i += defaultMigrationConfig.batchSize) {
      const batch = allBookings.slice(i, i + defaultMigrationConfig.batchSize);

      for (const booking of batch) {
        try {
          // Use SQL function for proper data transformation
          const { error } = await supabase.rpc('migrate_localstorage_booking', {
            p_booking_data: booking as unknown as Record<string, unknown>,
          });

          if (error) {
            errors.push(`Booking ${booking.id}: ${error.message}`);
          } else {
            bookingsMigrated++;
          }
        } catch (err) {
          errors.push(`Booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`);
        }

        const current = i + batch.indexOf(booking) + 1;
        onProgress?.({
          phase: 'bookings',
          current,
          total,
          percentage: (current / total) * 100,
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logMigrationEvent('migrateBookingsToSupabase:complete', {
      bookingsMigrated,
      errors: errors.length,
    });

    return {
      success: errors.length === 0,
      bookings_migrated: bookingsMigrated,
      preferences_migrated: 0,
      drafts_migrated: 0,
      errors,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logMigrationEvent('migrateBookingsToSupabase:error', { error });

    return {
      success: false,
      bookings_migrated: bookingsMigrated,
      preferences_migrated: 0,
      drafts_migrated: 0,
      errors: [...errors, `Migration failed: ${error}`],
    };
  }
}

/**
 * Validate data consistency between localStorage and Supabase
 */
export async function validateDataConsistency(userId: string): Promise<boolean> {
  logMigrationEvent('validateDataConsistency:start', { userId });

  try {
    // Get bookings from localStorage
    const pendingStored = localStorage.getItem('pendingBookings');
    const processedStored = localStorage.getItem('processedBookings');

    const localBookings: IStoredBooking[] = [
      ...(pendingStored ? JSON.parse(pendingStored) : []),
      ...(processedStored ? JSON.parse(processedStored) : []),
    ];

    // Get bookings from Supabase
    const { data: supabaseBookings, error } = await supabase
      .from('bookings')
      .select('id, status, total_price, start_datetime, end_datetime')
      .eq('user_id', userId)
      .eq('migrated_from_localstorage', true);

    if (error) throw error;

    // Compare counts
    if (localBookings.length !== (supabaseBookings?.length || 0)) {
      logMigrationEvent('validateDataConsistency:countMismatch', {
        local: localBookings.length,
        supabase: supabaseBookings?.length || 0,
      });
      return false;
    }

    // Validate each booking
    for (const localBooking of localBookings) {
      const supabaseBooking = supabaseBookings?.find(b => b.id === localBooking.id);

      if (!supabaseBooking) {
        logMigrationEvent('validateDataConsistency:missingBooking', {
          bookingId: localBooking.id,
        });
        return false;
      }

      // Validate key fields
      if (
        localBooking.status !== supabaseBooking.status ||
        localBooking.startDateTime !== supabaseBooking.start_datetime ||
        localBooking.endDateTime !== supabaseBooking.end_datetime
      ) {
        logMigrationEvent('validateDataConsistency:dataMismatch', {
          bookingId: localBooking.id,
        });
        return false;
      }
    }

    logMigrationEvent('validateDataConsistency:success');
    return true;
  } catch (err) {
    logMigrationEvent('validateDataConsistency:error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Rollback migration by restoring from localStorage
 */
export async function rollbackToLocalStorage(userId: string): Promise<void> {
  logMigrationEvent('rollbackToLocalStorage:start', { userId });

  try {
    // Mark all migrated bookings as needing re-migration
    const { error } = await supabase
      .from('bookings')
      .update({ migrated_from_localstorage: false })
      .eq('user_id', userId)
      .eq('migrated_from_localstorage', true);

    if (error) throw error;

    logMigrationEvent('rollbackToLocalStorage:success');
  } catch (err) {
    logMigrationEvent('rollbackToLocalStorage:error', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Clear localStorage after successful migration
 */
export async function cleanupLocalStorage(keys: string[]): Promise<void> {
  logMigrationEvent('cleanupLocalStorage:start', { keys });

  try {
    for (const key of keys) {
      localStorage.removeItem(key);
    }

    logMigrationEvent('cleanupLocalStorage:success', { cleared: keys.length });
  } catch (err) {
    logMigrationEvent('cleanupLocalStorage:error', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Get migration validation results from Supabase
 */
export async function getMigrationValidation(): Promise<ValidationResult | null> {
  try {
    const { data, error } = await supabase.rpc('validate_booking_migration');

    if (error) throw error;

    return data?.[0] || null;
  } catch (err) {
    logMigrationEvent('getMigrationValidation:error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Export migration data to downloadable JSON
 */
export function exportMigrationData(): void {
  const data = {
    bookings: {
      pending: localStorage.getItem('pendingBookings'),
      processed: localStorage.getItem('processedBookings'),
    },
    preferences: localStorage.getItem('userPreferences'),
    drafts: localStorage.getItem('draftBooking'),
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `booknor-migration-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  logMigrationEvent('exportMigrationData:success');
}

/**
 * Import migration data from JSON file
 */
export async function importMigrationData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.bookings?.pending) {
          localStorage.setItem('pendingBookings', data.bookings.pending);
        }
        if (data.bookings?.processed) {
          localStorage.setItem('processedBookings', data.bookings.processed);
        }
        if (data.preferences) {
          localStorage.setItem('userPreferences', data.preferences);
        }
        if (data.drafts) {
          localStorage.setItem('draftBooking', data.drafts);
        }

        logMigrationEvent('importMigrationData:success');
        resolve();
      } catch (err) {
        logMigrationEvent('importMigrationData:error', {
          error: err instanceof Error ? err.message : String(err),
        });
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
