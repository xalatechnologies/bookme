/**
 * useDraftBooking Hook
 *
 * Manages draft booking state with auto-save functionality and
 * storage migration support. Useful for multi-step booking forms
 * where users might leave and come back.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { IStoredBooking } from '@/utils/localStorageTypes';
import {
  getMigrationPhase,
  type MigrationPhase,
  MigrationError,
} from '@/utils/storageMigration';

/**
 * Draft booking with metadata
 */
interface DraftBookingData {
  readonly draft: Partial<IStoredBooking>;
  readonly sessionId: string;
  readonly lastSaved: string;
  readonly expiresAt: string;
}

/**
 * Return type for useDraftBooking hook
 */
interface UseDraftBookingReturn {
  readonly draft: Partial<IStoredBooking> | null;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: Error | null;
  readonly hasDraft: boolean;
  readonly lastSaved: Date | null;
  readonly saveDraft: (data: Partial<IStoredBooking>) => Promise<void>;
  readonly clearDraft: () => Promise<void>;
  readonly refetch: () => Promise<void>;
}

/**
 * Default draft expiration (7 days)
 */
const DRAFT_EXPIRATION_DAYS = 7;

/**
 * Auto-save debounce delay (3 seconds)
 */
const AUTO_SAVE_DELAY_MS = 3000;

/**
 * Get draft key for localStorage
 */
const getDraftKey = (userId: string, bookingId?: string): string => {
  return bookingId
    ? `draft_booking_${userId}_${bookingId}`
    : `draft_booking_${userId}`;
};

/**
 * Load draft from localStorage
 */
const loadFromLocalStorage = (
  userId: string,
  bookingId?: string
): DraftBookingData | null => {
  try {
    const key = getDraftKey(userId, bookingId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as DraftBookingData;

    // Check if draft has expired
    const expiresAt = new Date(parsed.expiresAt);
    if (expiresAt < new Date()) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error);
    return null;
  }
};

/**
 * Save draft to localStorage
 */
const saveToLocalStorage = (
  userId: string,
  draft: Partial<IStoredBooking>,
  sessionId: string,
  bookingId?: string
): void => {
  try {
    const key = getDraftKey(userId, bookingId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DRAFT_EXPIRATION_DAYS);

    const data: DraftBookingData = {
      draft,
      sessionId,
      lastSaved: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error);
  }
};

/**
 * Clear draft from localStorage
 */
const clearFromLocalStorage = (userId: string, bookingId?: string): void => {
  try {
    const key = getDraftKey(userId, bookingId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear draft from localStorage:', error);
  }
};

/**
 * Hook to manage draft bookings with auto-save
 *
 * @param userId - The current user ID
 * @param bookingId - Optional booking ID for editing existing bookings
 * @param autoSave - Whether to enable auto-save (default: true)
 * @param autoSaveDelay - Auto-save debounce delay in ms (default: 3000)
 *
 * @example
 * ```typescript
 * const {
 *   draft,
 *   hasDraft,
 *   saveDraft,
 *   clearDraft
 * } = useDraftBooking(userId, undefined, true);
 *
 * // Save draft manually
 * const handleSave = async (formData: Partial<IStoredBooking>) => {
 *   await saveDraft(formData);
 * };
 *
 * // Clear draft on submission
 * const handleSubmit = async () => {
 *   // ... submit booking
 *   await clearDraft();
 * };
 *
 * // Auto-save is handled automatically
 * ```
 */
export const useDraftBooking = (
  userId: string | null,
  bookingId?: string,
  autoSave: boolean = true,
  autoSaveDelay: number = AUTO_SAVE_DELAY_MS
): UseDraftBookingReturn => {
  const [draft, setDraft] = useState<Partial<IStoredBooking> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random()}`);
  const phase = getMigrationPhase();

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDraftRef = useRef<Partial<IStoredBooking> | null>(null);

  /**
   * Fetch draft based on current migration phase
   */
  const fetchDraft = useCallback(async (): Promise<void> => {
    if (!userId) {
      setDraft(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedDraft: DraftBookingData | null = null;

      // Phase 1: Try Supabase first, fallback to localStorage
      if (phase === 'fallback') {
        try {
          const query = supabase
            .from('draft_bookings')
            .select('*')
            .eq('user_id', userId);

          if (bookingId) {
            query.eq('booking_id', bookingId);
          } else {
            query.is('booking_id', null);
          }

          const { data, error: supabaseError } = await query
            .order('last_saved', { ascending: false })
            .limit(1)
            .single();

          if (!supabaseError && data) {
            fetchedDraft = {
              draft: data.draft_data as Partial<IStoredBooking>,
              sessionId: data.session_id,
              lastSaved: data.last_saved,
              expiresAt: data.expires_at,
            };
          } else {
            // Fallback to localStorage
            fetchedDraft = loadFromLocalStorage(userId, bookingId);
          }
        } catch (supabaseError) {
          console.error('Supabase fetch failed, using localStorage:', supabaseError);
          fetchedDraft = loadFromLocalStorage(userId, bookingId);
        }
      }

      // Phase 2 & 3: Read from Supabase (with fallback in phase 2)
      if (phase === 'dual-write' || phase === 'supabase-only') {
        try {
          const query = supabase
            .from('draft_bookings')
            .select('*')
            .eq('user_id', userId);

          if (bookingId) {
            query.eq('booking_id', bookingId);
          } else {
            query.is('booking_id', null);
          }

          const { data, error: supabaseError } = await query
            .order('last_saved', { ascending: false })
            .limit(1)
            .single();

          if (supabaseError && supabaseError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned", which is fine
            throw supabaseError;
          }

          if (data) {
            fetchedDraft = {
              draft: data.draft_data as Partial<IStoredBooking>,
              sessionId: data.session_id,
              lastSaved: data.last_saved,
              expiresAt: data.expires_at,
            };
          }
        } catch (supabaseError) {
          // Only fallback in phase 2
          if (phase === 'dual-write') {
            console.error('Supabase fetch failed, using localStorage:', supabaseError);
            fetchedDraft = loadFromLocalStorage(userId, bookingId);
          } else if (phase === 'supabase-only') {
            // In supabase-only mode, no draft is okay
            fetchedDraft = null;
          } else {
            throw supabaseError;
          }
        }
      }

      if (fetchedDraft) {
        setDraft(fetchedDraft.draft);
        setLastSaved(new Date(fetchedDraft.lastSaved));
      } else {
        setDraft(null);
        setLastSaved(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to fetch draft: ${errorMessage}`));
      console.error('Error fetching draft:', err);
      setDraft(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, bookingId, phase]);

  /**
   * Save draft with phase-aware storage
   */
  const saveDraft = useCallback(
    async (data: Partial<IStoredBooking>): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to save draft');
      }

      setError(null);
      setIsSaving(true);

      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + DRAFT_EXPIRATION_DAYS);

        // Phase 1: Write to localStorage only
        if (phase === 'fallback') {
          saveToLocalStorage(userId, data, sessionId, bookingId);
          setDraft(data);
          setLastSaved(new Date());
        }

        // Phase 2: Write to both
        if (phase === 'dual-write') {
          // Write to localStorage
          saveToLocalStorage(userId, data, sessionId, bookingId);

          // Write to Supabase
          const { error: supabaseError } = await supabase
            .from('draft_bookings')
            .upsert({
              user_id: userId,
              booking_id: bookingId || null,
              session_id: sessionId,
              draft_data: data as unknown as Record<string, unknown>,
              last_saved: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            });

          if (supabaseError) {
            throw new MigrationError(
              'Failed to save draft to Supabase',
              phase,
              'save_draft',
              supabaseError
            );
          }

          setDraft(data);
          setLastSaved(new Date());
        }

        // Phase 3: Write to Supabase only
        if (phase === 'supabase-only') {
          const { error: supabaseError } = await supabase
            .from('draft_bookings')
            .upsert({
              user_id: userId,
              booking_id: bookingId || null,
              session_id: sessionId,
              draft_data: data as unknown as Record<string, unknown>,
              last_saved: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            });

          if (supabaseError) {
            throw new MigrationError(
              'Failed to save draft to Supabase',
              phase,
              'save_draft',
              supabaseError
            );
          }

          setDraft(data);
          setLastSaved(new Date());
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Failed to save draft: ${errorMessage}`));
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, bookingId, sessionId, phase]
  );

  /**
   * Clear draft
   */
  const clearDraft = useCallback(async (): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required to clear draft');
    }

    setError(null);

    try {
      // Phase 1: Clear from localStorage only
      if (phase === 'fallback') {
        clearFromLocalStorage(userId, bookingId);
        setDraft(null);
        setLastSaved(null);
      }

      // Phase 2: Clear from both
      if (phase === 'dual-write') {
        // Clear from localStorage
        clearFromLocalStorage(userId, bookingId);

        // Clear from Supabase
        const query = supabase
          .from('draft_bookings')
          .delete()
          .eq('user_id', userId);

        if (bookingId) {
          query.eq('booking_id', bookingId);
        } else {
          query.is('booking_id', null);
        }

        const { error: supabaseError } = await query;

        if (supabaseError) {
          throw new MigrationError(
            'Failed to clear draft from Supabase',
            phase,
            'clear_draft',
            supabaseError
          );
        }

        setDraft(null);
        setLastSaved(null);
      }

      // Phase 3: Clear from Supabase only
      if (phase === 'supabase-only') {
        const query = supabase
          .from('draft_bookings')
          .delete()
          .eq('user_id', userId);

        if (bookingId) {
          query.eq('booking_id', bookingId);
        } else {
          query.is('booking_id', null);
        }

        const { error: supabaseError } = await query;

        if (supabaseError) {
          throw new MigrationError(
            'Failed to clear draft from Supabase',
            phase,
            'clear_draft',
            supabaseError
          );
        }

        setDraft(null);
        setLastSaved(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to clear draft: ${errorMessage}`));
      throw err;
    }
  }, [userId, bookingId, phase]);

  /**
   * Auto-save handler with debounce
   */
  useEffect(() => {
    if (!autoSave || !pendingDraftRef.current) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (pendingDraftRef.current) {
        saveDraft(pendingDraftRef.current);
        pendingDraftRef.current = null;
      }
    }, autoSaveDelay);

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [draft, autoSave, autoSaveDelay, saveDraft]);

  /**
   * Update pending draft for auto-save
   */
  useEffect(() => {
    if (draft && autoSave) {
      pendingDraftRef.current = draft;
    }
  }, [draft, autoSave]);

  /**
   * Fetch draft on mount
   */
  useEffect(() => {
    if (userId) {
      fetchDraft();
    }
  }, [userId, bookingId, fetchDraft]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    draft,
    isLoading,
    isSaving,
    error,
    hasDraft: draft !== null,
    lastSaved,
    saveDraft,
    clearDraft,
    refetch: fetchDraft,
  };
};

/**
 * Export type for external use
 */
export type { UseDraftBookingReturn };
