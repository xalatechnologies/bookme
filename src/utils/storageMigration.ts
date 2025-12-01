/**
 * Storage Migration Utilities
 *
 * Provides a gradual migration path from localStorage to Supabase with three phases:
 * - Phase 1: Read from Supabase with localStorage fallback (SAFE)
 * - Phase 2: Write to both Supabase and localStorage (TRANSITION)
 * - Phase 3: Supabase only (FINAL)
 *
 * This module ensures zero data loss during migration and provides
 * validation and consistency checking utilities.
 */

import { supabase } from '@/lib/clients/supabase';
import type { IBookingFilters } from '@/utils/localStorageTypes';
import { getStoredBookings } from '@/utils/localStorageTypes';

/**
 * Migration phase configuration
 */
export type MigrationPhase = 'fallback' | 'dual-write' | 'supabase-only';

/**
 * Migration error types for better error handling
 */
export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly phase: MigrationPhase,
    public readonly operation: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}

/**
 * Migration configuration with feature flags
 */
export interface MigrationConfig {
  readonly phase: MigrationPhase;
  readonly enableLogging: boolean;
  readonly validateConsistency: boolean;
  readonly retryAttempts: number;
  readonly retryDelayMs: number;
}

/**
 * Default migration configuration
 * Override via environment variables or runtime config
 */
export const migrationConfig: MigrationConfig = {
  phase: (import.meta.env.VITE_STORAGE_MIGRATION_PHASE as MigrationPhase) || 'fallback',
  enableLogging: import.meta.env.VITE_ENABLE_MIGRATION_LOGGING === 'true',
  validateConsistency: import.meta.env.VITE_VALIDATE_STORAGE_CONSISTENCY !== 'false',
  retryAttempts: 3,
  retryDelayMs: 1000};

/**
 * Get the current migration phase from config
 */
export const getMigrationPhase = (): MigrationPhase => {
  return migrationConfig.phase;
};

/**
 * Log migration events if logging is enabled
 */
const logMigration = (message: string, data?: unknown): void => {
  if (migrationConfig.enableLogging) {
    console.log(`[Storage Migration] ${message}`, data || '');
  }
};

/**
 * Log migration errors
 */
const logMigrationError = (message: string, error: unknown): void => {
  console.error(`[Storage Migration Error] ${message}`, error);
};

/**
 * Exponential backoff retry utility
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  attempts: number = migrationConfig.retryAttempts
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        const delay = migrationConfig.retryDelayMs * Math.pow(2, i);
        logMigration(`Retry attempt ${i + 1}/${attempts} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Validate data consistency between localStorage and Supabase
 * Returns true if data is consistent, false otherwise
 */
export const validateDataConsistency = async (
  userId: string
): Promise<boolean> => {
  try {
    logMigration('Starting data consistency validation', { userId });

    // Get bookings from localStorage
    const localPending = getStoredBookings('pendingBookings');
    const localProcessed = getStoredBookings('processedBookings');
    const localBookings = [...localPending, ...localProcessed];

    // Get bookings from Supabase
    const { data: supabaseBookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      logMigrationError('Failed to fetch Supabase bookings for validation', error);
      return false;
    }

    if (!supabaseBookings) {
      return localBookings.length === 0;
    }

    // Compare counts
    if (localBookings.length !== supabaseBookings.length) {
      logMigration('Booking count mismatch', {
        local: localBookings.length,
        supabase: supabaseBookings.length});
      return false;
    }

    // Check if all local bookings exist in Supabase
    const supabaseIds = new Set(supabaseBookings.map((b) => b.id));
    const missingBookings = localBookings.filter((b) => !supabaseIds.has(b.id));

    if (missingBookings.length > 0) {
      logMigration('Found bookings in localStorage missing from Supabase', {
        count: missingBookings.length,
        ids: missingBookings.map((b) => b.id)});
      return false;
    }

    logMigration('Data consistency validation passed');
    return true;
  } catch (error) {
    logMigrationError('Data consistency validation failed', error);
    return false;
  }
};

/**
 * One-time migration utility to move all localStorage bookings to Supabase
 * This is typically run once at the beginning of Phase 1
 */
export const migrateBookingsToSupabase = async (
  userId: string
): Promise<{ success: boolean; migrated: number; errors: string[] }> => {
  const result = {
    success: true,
    migrated: 0,
    errors: [] as string[]};

  try {
    logMigration('Starting bookings migration to Supabase', { userId });

    // Get all bookings from localStorage
    const localPending = getStoredBookings('pendingBookings');
    const localProcessed = getStoredBookings('processedBookings');
    const allBookings = [...localPending, ...localProcessed];

    if (allBookings.length === 0) {
      logMigration('No bookings to migrate');
      return result;
    }

    // Check which bookings already exist in Supabase
    const { data: existingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId);

    if (fetchError) {
      throw new MigrationError(
        'Failed to fetch existing bookings',
        'fallback',
        'migrate',
        fetchError
      );
    }

    const existingIds = new Set(existingBookings?.map((b) => b.id) || []);

    // Filter out bookings that already exist
    const bookingsToMigrate = allBookings.filter((b) => !existingIds.has(b.id));

    if (bookingsToMigrate.length === 0) {
      logMigration('All bookings already exist in Supabase');
      return result;
    }

    // Migrate each booking
    for (const booking of bookingsToMigrate) {
      try {
        const { error } = await supabase.from('bookings').insert({
          id: booking.id,
          user_id: userId,
          facility_id: booking.facilityId,
          facility_name: booking.facilityName || booking.facility,
          start_date: booking.startDate || booking.date,
          start_time: booking.startTime || booking.time,
          end_time: booking.endTime,
          duration: typeof booking.duration === 'number' ? booking.duration : parseFloat(String(booking.duration || '0')),
          status: booking.status || 'pending',
          price_cents: typeof booking.price === 'number' ? booking.price * 100 : parseFloat(String(booking.price || '0')) * 100,
          purpose: booking.purpose,
          description: booking.description,
          contact_person: booking.contactPerson,
          booker_name: booking.bookerName,
          booker_email: booking.bookerEmail,
          submitted_at: booking.submittedAt || booking.requestedAt,
          processed_by: booking.processedBy,
          processed_at: booking.processedAt,
          is_recurring: booking.isRecurring || false,
          parent_booking_id: booking.parentBookingId} as any);

        if (error) {
          result.errors.push(`Failed to migrate booking ${booking.id}: ${error.message}`);
          result.success = false;
        } else {
          result.migrated++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to migrate booking ${booking.id}: ${errorMessage}`);
        result.success = false;
      }
    }

    logMigration('Migration completed', result);
    return result;
  } catch (error) {
    logMigrationError('Migration failed', error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    return result;
  }
};

/**
 * Clear localStorage bookings after successful migration
 * Only use this in Phase 3 (supabase-only) after validation
 */
export const clearLocalStorageBookings = async (
  userId: string,
  validateFirst: boolean = true
): Promise<boolean> => {
  try {
    if (validateFirst) {
      const isConsistent = await validateDataConsistency(userId);
      if (!isConsistent) {
        logMigration('Cannot clear localStorage: data inconsistency detected');
        return false;
      }
    }

    logMigration('Clearing localStorage bookings');
    localStorage.removeItem('pendingBookings');
    localStorage.removeItem('processedBookings');
    return true;
  } catch (error) {
    logMigrationError('Failed to clear localStorage', error);
    return false;
  }
};

/**
 * Sync preferences between localStorage and Supabase
 */
export const syncUserPreferences = async (
  userId: string,
  preferences: {
    language?: 'en' | 'no';
    filters?: IBookingFilters;
    uiSettings?: {
      collapsedPanels?: readonly string[];
      viewMode?: 'grid' | 'list';
    };
  }
): Promise<void> => {
  const phase = getMigrationPhase();

  try {
    // Phase 1 & 2: Write to localStorage
    if (phase === 'fallback' || phase === 'dual-write') {
      localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(preferences));
      logMigration('Saved preferences to localStorage', { userId });
    }

    // Phase 2 & 3: Write to Supabase
    if (phase === 'dual-write' || phase === 'supabase-only') {
      await retryWithBackoff(async () => {
        const { error } = await supabase
          .from('user_preferences' as any)
          .upsert({
            user_id: userId,
            language: preferences.language,
            filters: preferences.filters as unknown as Record<string, unknown>,
            ui_settings: preferences.uiSettings as unknown as Record<string, unknown>,
            updated_at: new Date().toISOString()});

        if (error) {
          throw new MigrationError(
            'Failed to save preferences to Supabase',
            phase,
            'sync_preferences',
            error
          );
        }

        logMigration('Saved preferences to Supabase', { userId });
      });
    }
  } catch (error) {
    logMigrationError('Failed to sync user preferences', error);
    throw error;
  }
};

/**
 * Get health status of the storage migration
 */
export const getMigrationHealth = async (
  userId: string
): Promise<{
  phase: MigrationPhase;
  supabaseConnected: boolean;
  dataConsistent: boolean;
  localBookingsCount: number;
  supabaseBookingsCount: number;
}> => {
  const health = {
    phase: getMigrationPhase(),
    supabaseConnected: false,
    dataConsistent: false,
    localBookingsCount: 0,
    supabaseBookingsCount: 0};

  try {
    // Check local storage
    const localPending = getStoredBookings('pendingBookings');
    const localProcessed = getStoredBookings('processedBookings');
    health.localBookingsCount = localPending.length + localProcessed.length;

    // Check Supabase connection and count
    const { data, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (!error) {
      health.supabaseConnected = true;
      health.supabaseBookingsCount = data?.length || 0;
    }

    // Validate consistency if both are available
    if (health.supabaseConnected) {
      health.dataConsistent = await validateDataConsistency(userId);
    }

    return health;
  } catch (error) {
    logMigrationError('Failed to get migration health', error);
    return health;
  }
};

/**
 * Export migration utilities for testing and monitoring
 */
export const migrationUtils = {
  validateDataConsistency,
  migrateBookingsToSupabase,
  clearLocalStorageBookings,
  syncUserPreferences,
  getMigrationHealth,
  logMigration,
  logMigrationError
};
