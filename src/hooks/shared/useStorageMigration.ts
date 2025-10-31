/**
 * useStorageMigration Hook
 *
 * Manages the storage migration phase and provides utilities for
 * transitioning between localStorage and Supabase storage.
 *
 * This hook provides:
 * - Current migration phase state
 * - Health check utilities
 * - Migration execution functions
 * - Consistency validation
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getMigrationPhase,
  validateDataConsistency,
  migrateBookingsToSupabase,
  clearLocalStorageBookings,
  getMigrationHealth,
  type MigrationPhase,
} from '@/utils/storageMigration';

/**
 * Migration health status
 */
interface MigrationHealth {
  readonly phase: MigrationPhase;
  readonly supabaseConnected: boolean;
  readonly dataConsistent: boolean;
  readonly localBookingsCount: number;
  readonly supabaseBookingsCount: number;
}

/**
 * Migration result from operations
 */
interface MigrationResult {
  readonly success: boolean;
  readonly migrated: number;
  readonly errors: readonly string[];
}

/**
 * Return type for useStorageMigration hook
 */
interface UseStorageMigrationReturn {
  readonly phase: MigrationPhase;
  readonly health: MigrationHealth | null;
  readonly isChecking: boolean;
  readonly error: Error | null;
  readonly checkHealth: () => Promise<void>;
  readonly validateConsistency: () => Promise<boolean>;
  readonly migrateToSupabase: () => Promise<MigrationResult>;
  readonly clearLocalStorage: (validateFirst?: boolean) => Promise<boolean>;
}

/**
 * Hook to manage storage migration state and operations
 *
 * @param userId - The current user ID for migration operations
 * @param autoCheck - Whether to automatically check health on mount
 *
 * @example
 * ```typescript
 * const {
 *   phase,
 *   health,
 *   checkHealth,
 *   migrateToSupabase
 * } = useStorageMigration(userId, true);
 *
 * // Check migration health
 * useEffect(() => {
 *   if (health && !health.dataConsistent) {
 *     console.warn('Data inconsistency detected');
 *   }
 * }, [health]);
 *
 * // Manually trigger migration
 * const handleMigrate = async () => {
 *   const result = await migrateToSupabase();
 *   if (result.success) {
 *     console.log(`Migrated ${result.migrated} bookings`);
 *   }
 * };
 * ```
 */
export const useStorageMigration = (
  userId: string | null,
  autoCheck: boolean = false
): UseStorageMigrationReturn => {
  const [phase] = useState<MigrationPhase>(getMigrationPhase());
  const [health, setHealth] = useState<MigrationHealth | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check migration health status
   */
  const checkHealth = useCallback(async (): Promise<void> => {
    if (!userId) {
      setError(new Error('User ID is required for health check'));
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const healthStatus = await getMigrationHealth(userId);
      setHealth(healthStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Health check failed: ${errorMessage}`));
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  /**
   * Validate data consistency between storage layers
   */
  const validateConsistency = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setError(new Error('User ID is required for consistency validation'));
      return false;
    }

    setError(null);

    try {
      const isConsistent = await validateDataConsistency(userId);
      return isConsistent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Consistency validation failed: ${errorMessage}`));
      return false;
    }
  }, [userId]);

  /**
   * Migrate all localStorage bookings to Supabase
   */
  const migrateToSupabase = useCallback(async (): Promise<MigrationResult> => {
    if (!userId) {
      const errorResult: MigrationResult = {
        success: false,
        migrated: 0,
        errors: ['User ID is required for migration'],
      };
      setError(new Error('User ID is required for migration'));
      return errorResult;
    }

    setError(null);

    try {
      const result = await migrateBookingsToSupabase(userId);

      // Refresh health status after migration
      await checkHealth();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorResult: MigrationResult = {
        success: false,
        migrated: 0,
        errors: [errorMessage],
      };
      setError(new Error(`Migration failed: ${errorMessage}`));
      return errorResult;
    }
  }, [userId, checkHealth]);

  /**
   * Clear localStorage after successful migration
   */
  const clearLocalStorage = useCallback(
    async (validateFirst: boolean = true): Promise<boolean> => {
      if (!userId) {
        setError(new Error('User ID is required to clear localStorage'));
        return false;
      }

      setError(null);

      try {
        const success = await clearLocalStorageBookings(userId, validateFirst);

        // Refresh health status after clearing
        if (success) {
          await checkHealth();
        }

        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Failed to clear localStorage: ${errorMessage}`));
        return false;
      }
    },
    [userId, checkHealth]
  );

  /**
   * Auto-check health on mount if enabled
   */
  useEffect(() => {
    if (autoCheck && userId) {
      checkHealth();
    }
  }, [autoCheck, userId, checkHealth]);

  return {
    phase,
    health,
    isChecking,
    error,
    checkHealth,
    validateConsistency,
    migrateToSupabase,
    clearLocalStorage,
  };
};

/**
 * Export type for external use
 */
export type { UseStorageMigrationReturn, MigrationHealth, MigrationResult };
