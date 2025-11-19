/**
 * Storage Migration Hook
 * Provides phase-aware storage abstraction for localStorage → Supabase migration
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import {
  getCurrentMigrationPhase,
  MIGRATION_PHASES,
  type MigrationPhase,
  logMigrationEvent,
  defaultMigrationConfig
} from '@/components/config/migrationConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface UseStorageMigrationOptions<T> {
  readonly localStorageKey: string;
  readonly supabaseTable?: keyof Database['public']['Tables'];
  readonly supabaseColumn?: string;
  readonly defaultValue: T;
  readonly userId?: string;
  readonly parser?: (raw: string) => T;
  readonly serializer?: (value: T) => string;
}

export interface UseStorageMigrationReturn<T> {
  readonly data: T;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly phase: MigrationPhase;
  readonly setData: (value: T) => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly syncWithLocalStorage: () => Promise<void>;
}

/**
 * Phase-aware storage hook that abstracts localStorage and Supabase
 */
export function useStorageMigration<T>({
  localStorageKey,
  supabaseTable,
  supabaseColumn,
  defaultValue,
  userId,
  parser = JSON.parse,
  serializer = JSON.stringify,
}: UseStorageMigrationOptions<T>): UseStorageMigrationReturn<T> {
  const [data, setDataState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [phase] = useState<MigrationPhase>(getCurrentMigrationPhase());

  // Read data based on current phase
  const readData = useCallback(async (): Promise<T> => {
    logMigrationEvent('readData', { phase, localStorageKey, supabaseTable });

    try {
      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY: {
          // Phase 0: Only localStorage
          const stored = localStorage.getItem(localStorageKey);
          return stored ? parser(stored) : defaultValue;
        }

        case MIGRATION_PHASES.READ_FALLBACK: {
          // Phase 1: Try Supabase, fallback to localStorage
          if (supabaseTable && supabaseColumn && userId) {
            try {
              const { data: supabaseData, error: supabaseError } = await supabase
                .from(supabaseTable)
                .select(supabaseColumn)
                .eq('user_id', userId)
                .single();

              if (supabaseError) throw supabaseError;

              if (supabaseData && (supabaseData as Record<string, any>)[supabaseColumn]) {
                logMigrationEvent('readData:supabase', { success: true });
                return (supabaseData as Record<string, any>)[supabaseColumn] as T;
              }
            } catch (supabaseError) {
              logMigrationEvent('readData:supabase:fallback', { error: supabaseError });
            }
          }

          // Fallback to localStorage
          const stored = localStorage.getItem(localStorageKey);
          return stored ? parser(stored) : defaultValue;
        }

        case MIGRATION_PHASES.WRITE_BOTH:
        case MIGRATION_PHASES.SUPABASE_ONLY: {
          // Phase 2 & 3: Read from Supabase with optional localStorage fallback
          if (supabaseTable && supabaseColumn && userId) {
            const { data: supabaseData, error: supabaseError } = await supabase
              .from(supabaseTable)
              .select(supabaseColumn)
              .eq('user_id', userId)
              .single();

            if (supabaseError) throw supabaseError;

            if (supabaseData && (supabaseData as Record<string, any>)[supabaseColumn]) {
              return (supabaseData as Record<string, any>)[supabaseColumn] as T;
            }
          }

          // Only fallback to localStorage in Phase 2
          if (phase === MIGRATION_PHASES.WRITE_BOTH) {
            const stored = localStorage.getItem(localStorageKey);
            return stored ? parser(stored) : defaultValue;
          }

          return defaultValue;
        }

        default:
          return defaultValue;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('readData:error', { error: error.message });
      throw error;
    }
  }, [phase, localStorageKey, supabaseTable, supabaseColumn, userId, parser, defaultValue]);

  // Write data based on current phase
  const writeData = useCallback(async (value: T): Promise<void> => {
    logMigrationEvent('writeData', { phase, localStorageKey, supabaseTable });

    try {
      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY: {
          // Phase 0: Only localStorage
          localStorage.setItem(localStorageKey, serializer(value));
          break;
        }

        case MIGRATION_PHASES.READ_FALLBACK: {
          // Phase 1: Still only localStorage (reads from Supabase)
          localStorage.setItem(localStorageKey, serializer(value));
          break;
        }

        case MIGRATION_PHASES.WRITE_BOTH: {
          // Phase 2: Write to both
          localStorage.setItem(localStorageKey, serializer(value));

          if (supabaseTable && supabaseColumn && userId) {
            const payload = {
              user_id: userId,
              [supabaseColumn]: value,
            };

            const { error: supabaseError } = await supabase
              .from(supabaseTable)
              .upsert(payload as any);

            if (supabaseError) throw supabaseError;
          }
          break;
        }

        case MIGRATION_PHASES.SUPABASE_ONLY: {
          // Phase 3: Only Supabase
          if (supabaseTable && supabaseColumn && userId) {
            const payload: Record<string, unknown> = {
              user_id: userId,
              [supabaseColumn]: value,
            };

            const { error: supabaseError } = await supabase
              .from(supabaseTable)
              .upsert(payload as any);

            if (supabaseError) throw supabaseError;

            // Optionally clear localStorage
            if (defaultMigrationConfig.autoCleanupAfterMigration) {
              localStorage.removeItem(localStorageKey);
            }
          }
          break;
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('writeData:error', { error: error.message });
      throw error;
    }
  }, [phase, localStorageKey, supabaseTable, supabaseColumn, userId, serializer]);

  // Public setData method
  const setData = useCallback(async (value: T): Promise<void> => {
    try {
      setError(null);
      await writeData(value);
      setDataState(value);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [writeData]);

  // Refresh data from storage
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const freshData = await readData();
      setDataState(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [readData]);

  // Sync localStorage data to Supabase (one-time migration utility)
  const syncWithLocalStorage = useCallback(async (): Promise<void> => {
    if (!supabaseTable || !supabaseColumn || !userId) {
      throw new Error('Supabase configuration required for sync');
    }

    try {
      const stored = localStorage.getItem(localStorageKey);
      if (!stored) {
        logMigrationEvent('syncWithLocalStorage:noData');
        return;
      }

      const localData = parser(stored);

      const payload = {
        user_id: userId,
        [supabaseColumn]: localData,
      };

      const { error: supabaseError } = await supabase
        .from(supabaseTable)
        .upsert(payload as any);

      if (supabaseError) throw supabaseError;

      logMigrationEvent('syncWithLocalStorage:success');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('syncWithLocalStorage:error', { error: error.message });
      throw error;
    }
  }, [supabaseTable, supabaseColumn, userId, localStorageKey, parser]);

  // Initial data load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    phase,
    setData,
    refresh,
    syncWithLocalStorage,
  };
}
