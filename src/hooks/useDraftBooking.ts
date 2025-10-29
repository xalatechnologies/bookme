/**
 * Draft Booking Hook with Migration Support
 * Phase-aware hook for managing draft bookings across localStorage and Supabase
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database, DraftBooking } from '@/types/supabase/database.types';
import type { IStoredBooking } from '@/utils/localStorageTypes';
import {
  getCurrentMigrationPhase,
  MIGRATION_PHASES,
  type MigrationPhase,
  logMigrationEvent,
} from '@/config/migrationConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

const AUTO_SAVE_DEBOUNCE_MS = 500;

export interface UseDraftBookingOptions {
  readonly userId?: string;
  readonly draftId?: string;
  readonly sessionId?: string;
  readonly autoSave?: boolean;
}

export interface UseDraftBookingReturn {
  readonly draft: Partial<IStoredBooking> | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly hasDraft: boolean;
  readonly phase: MigrationPhase;
  readonly saveDraft: (data: Partial<IStoredBooking>) => Promise<void>;
  readonly updateDraft: (updates: Partial<IStoredBooking>) => void;
  readonly clearDraft: () => Promise<void>;
  readonly convertToBooking: () => Promise<string | null>;
}

/**
 * Phase-aware draft booking hook with auto-save
 */
export function useDraftBooking(options: UseDraftBookingOptions = {}): UseDraftBookingReturn {
  const { userId, draftId, sessionId, autoSave = true } = options;

  const [draft, setDraft] = useState<Partial<IStoredBooking> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [phase] = useState<MigrationPhase>(getCurrentMigrationPhase());

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Read draft based on phase
  const readDraft = useCallback(async (): Promise<Partial<IStoredBooking> | null> => {
    logMigrationEvent('readDraft', { phase, userId, draftId });

    try {
      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY: {
          // Phase 0: Only localStorage
          const stored = localStorage.getItem('draftBooking');
          return stored ? JSON.parse(stored) : null;
        }

        case MIGRATION_PHASES.READ_FALLBACK: {
          // Phase 1: Try Supabase, fallback to localStorage
          if (userId || sessionId) {
            try {
              const query = supabase
                .from('draft_bookings')
                .select('*')
                .eq('draft_status', 'in_progress');

              if (draftId) {
                query.eq('id', draftId);
              } else if (userId) {
                query.eq('user_id', userId);
              } else if (sessionId) {
                query.eq('session_id', sessionId);
              }

              const { data: supabaseData, error: supabaseError } = await query.single();

              if (supabaseError && supabaseError.code !== 'PGRST116') {
                throw supabaseError;
              }

              if (supabaseData) {
                logMigrationEvent('readDraft:supabase', { success: true });
                return mapSupabaseToDraft(supabaseData);
              }
            } catch (supabaseError) {
              logMigrationEvent('readDraft:supabase:fallback', { error: supabaseError });
            }
          }

          // Fallback to localStorage
          const stored = localStorage.getItem('draftBooking');
          return stored ? JSON.parse(stored) : null;
        }

        case MIGRATION_PHASES.WRITE_BOTH:
        case MIGRATION_PHASES.SUPABASE_ONLY: {
          // Phase 2 & 3: Read from Supabase
          if (userId || sessionId) {
            const query = supabase
              .from('draft_bookings')
              .select('*')
              .eq('draft_status', 'in_progress');

            if (draftId) {
              query.eq('id', draftId);
            } else if (userId) {
              query.eq('user_id', userId);
            } else if (sessionId) {
              query.eq('session_id', sessionId);
            }

            const { data: supabaseData, error: supabaseError } = await query.single();

            if (supabaseError && supabaseError.code !== 'PGRST116') {
              throw supabaseError;
            }

            if (supabaseData) {
              return mapSupabaseToDraft(supabaseData);
            }
          }

          // Phase 2: Fallback to localStorage
          if (phase === MIGRATION_PHASES.WRITE_BOTH) {
            const stored = localStorage.getItem('draftBooking');
            return stored ? JSON.parse(stored) : null;
          }

          return null;
        }

        default:
          return null;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('readDraft:error', { error: error.message });
      throw error;
    }
  }, [phase, userId, draftId, sessionId]);

  // Write draft based on phase
  const writeDraft = useCallback(async (data: Partial<IStoredBooking>): Promise<void> => {
    logMigrationEvent('writeDraft', { phase });

    try {
      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY:
        case MIGRATION_PHASES.READ_FALLBACK: {
          // Phase 0 & 1: Write to localStorage
          localStorage.setItem('draftBooking', JSON.stringify(data));
          break;
        }

        case MIGRATION_PHASES.WRITE_BOTH: {
          // Phase 2: Write to both
          localStorage.setItem('draftBooking', JSON.stringify(data));

          if (userId || sessionId) {
            const { error: supabaseError } = await supabase
              .from('draft_bookings')
              .upsert(mapDraftToSupabase(data, userId, sessionId, draftId));

            if (supabaseError) throw supabaseError;
          }
          break;
        }

        case MIGRATION_PHASES.SUPABASE_ONLY: {
          // Phase 3: Only Supabase
          if (userId || sessionId) {
            const { error: supabaseError } = await supabase
              .from('draft_bookings')
              .upsert(mapDraftToSupabase(data, userId, sessionId, draftId));

            if (supabaseError) throw supabaseError;
          }
          break;
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logMigrationEvent('writeDraft:error', { error: error.message });
      throw error;
    }
  }, [phase, userId, sessionId, draftId]);

  // Public methods
  const saveDraft = useCallback(async (data: Partial<IStoredBooking>): Promise<void> => {
    try {
      setError(null);
      await writeDraft(data);
      setDraft(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [writeDraft]);

  const updateDraft = useCallback((updates: Partial<IStoredBooking>): void => {
    setDraft(prev => {
      const updated = prev ? { ...prev, ...updates } : updates;

      // Auto-save with debounce
      if (autoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
          writeDraft(updated).catch(err => {
            console.error('Auto-save failed:', err);
          });
        }, AUTO_SAVE_DEBOUNCE_MS);
      }

      return updated;
    });
  }, [autoSave, writeDraft]);

  const clearDraft = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      switch (phase) {
        case MIGRATION_PHASES.LOCALSTORAGE_ONLY:
        case MIGRATION_PHASES.READ_FALLBACK: {
          localStorage.removeItem('draftBooking');
          break;
        }

        case MIGRATION_PHASES.WRITE_BOTH: {
          localStorage.removeItem('draftBooking');

          if (draftId) {
            await supabase
              .from('draft_bookings')
              .update({ draft_status: 'abandoned' })
              .eq('id', draftId);
          }
          break;
        }

        case MIGRATION_PHASES.SUPABASE_ONLY: {
          if (draftId) {
            await supabase
              .from('draft_bookings')
              .update({ draft_status: 'abandoned' })
              .eq('id', draftId);
          }
          break;
        }
      }

      setDraft(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [phase, draftId]);

  const convertToBooking = useCallback(async (): Promise<string | null> => {
    if (!draft || !draftId) {
      throw new Error('No draft to convert');
    }

    try {
      // Call Supabase function to convert draft to booking
      const { data, error: rpcError } = await supabase
        .rpc('convert_draft_to_booking', { p_draft_id: draftId });

      if (rpcError) throw rpcError;

      // Clear draft after successful conversion
      await clearDraft();

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [draft, draftId, clearDraft]);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await readDraft();
      setDraft(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [readDraft]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    draft,
    isLoading,
    error,
    hasDraft: draft !== null,
    phase,
    saveDraft,
    updateDraft,
    clearDraft,
    convertToBooking,
  };
}

// Mapping functions
function mapSupabaseToDraft(row: DraftBooking): Partial<IStoredBooking> {
  return {
    id: row.id,
    facilityId: row.facility_id || undefined,
    facilityName: row.facility_name || undefined,
    facilityType: row.facility_type || undefined,
    bookingType: row.booking_type,
    bookingDate: row.booking_date || undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    startDateTime: row.start_datetime || undefined,
    endDateTime: row.end_datetime || undefined,
    participantCount: row.participant_count || undefined,
    participantNames: row.participant_names || undefined,
    totalPrice: row.total_price?.toString(),
    purpose: row.purpose || undefined,
    specialRequirements: row.special_requirements || undefined,
    contactEmail: row.contact_email || undefined,
    contactPhone: row.contact_phone || undefined,
  };
}

function mapDraftToSupabase(
  draft: Partial<IStoredBooking>,
  userId?: string,
  sessionId?: string,
  draftId?: string
): any {
  return {
    ...(draftId && { id: draftId }),
    user_id: userId || null,
    session_id: sessionId || null,
    facility_id: draft.facilityId || null,
    facility_name: draft.facilityName || null,
    facility_type: draft.facilityType || null,
    booking_type: draft.bookingType || 'single',
    booking_date: draft.bookingDate || null,
    start_time: draft.startTime || null,
    end_time: draft.endTime || null,
    start_datetime: draft.startDateTime || null,
    end_datetime: draft.endDateTime || null,
    participant_count: draft.participantCount || null,
    participant_names: draft.participantNames || null,
    total_price: draft.totalPrice ? parseFloat(draft.totalPrice.replace(/[^0-9.]/g, '')) : null,
    purpose: draft.purpose || null,
    special_requirements: draft.specialRequirements || null,
    contact_email: draft.contactEmail || null,
    contact_phone: draft.contactPhone || null,
    form_data: draft,
    draft_status: 'in_progress',
  };
}
