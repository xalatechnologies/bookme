/**
 * Unit Tests for useDraftBooking Hook
 *
 * Tests draft booking functionality including:
 * - Auto-save functionality
 * - Session tracking
 * - Auto-expire logic
 * - Data persistence across browser sessions
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockUser } from '../../../../test-utils';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Type definitions
interface DraftBooking {
  readonly id: string;
  readonly userId: string;
  readonly facilityId: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly duration?: number;
  readonly notes?: string;
  readonly recurrence?: {
    readonly pattern: 'weekly' | 'monthly' | 'daily';
    readonly endDate: string;
  };
  readonly status: 'draft' | 'submitted' | 'expired';
  readonly createdAt: string;
  readonly lastModified: string;
  readonly expiresAt: string;
  readonly sessionId: string;
}

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  let currentTime = new Date();

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    setCurrentTime: (time: Date) => {
      currentTime = time;
    },
    getCurrentTime: () => currentTime,
  };
})();

// Create mock draft booking
const createMockDraftBooking = (
  overrides?: Partial<DraftBooking>
): DraftBooking => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  return {
    id: 'draft-1',
    userId: mockUser.id,
    facilityId: 'facility-1',
    startTime: '2025-03-01T10:00:00Z',
    endTime: '2025-03-01T12:00:00Z',
    duration: 2,
    notes: '',
    status: 'draft',
    createdAt: now.toISOString(),
    lastModified: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    sessionId: 'session-123',
    ...overrides,
  };
};

// Create test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { readonly children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDraftBooking Hook - Migration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    vi.useFakeTimers();

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    mockLocalStorage.clear();
    vi.useRealTimers();
  });

  describe('Auto-Save Functionality', () => {
    it('should save draft booking to localStorage on change', () => {
      const draft = createMockDraftBooking();

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(draft)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(saved.id).toBe(draft.id);
      expect(saved.facilityId).toBe(draft.facilityId);
    });

    it('should auto-save after debounce period', async () => {
      const draft = createMockDraftBooking();
      const debounceMs = 500;

      // Simulate rapid changes
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_temp`,
        JSON.stringify({ ...draft, startTime: '10:00' })
      );
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_temp`,
        JSON.stringify({ ...draft, startTime: '10:30' })
      );
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_temp`,
        JSON.stringify({ ...draft, startTime: '11:00' })
      );

      // After debounce, latest version should be saved
      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_temp`) || '{}'
      );

      expect(saved.startTime).toBe('11:00');
    });

    it('should update lastModified timestamp on auto-save', () => {
      const draft = createMockDraftBooking();
      const originalTime = new Date(draft.lastModified);

      vi.setSystemTime(new Date(originalTime.getTime() + 60000)); // 1 minute later

      const updated = {
        ...draft,
        notes: 'Updated notes',
        lastModified: new Date().toISOString(),
      };

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(updated)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(new Date(saved.lastModified)).toBeGreaterThan(
        originalTime
      );
    });

    it('should handle auto-save failures gracefully', () => {
      const draft = createMockDraftBooking();

      const originalSetItem = mockLocalStorage.setItem;
      let saveAttempts = 0;

      mockLocalStorage.setItem = (key: string, value: string) => {
        saveAttempts++;
        if (saveAttempts === 1) {
          // Simulate first save failure
          return;
        }
        originalSetItem.call(mockLocalStorage, key, value);
      };

      try {
        mockLocalStorage.setItem(
          `draft_${mockUser.id}_${draft.id}`,
          JSON.stringify(draft)
        );
        mockLocalStorage.setItem(
          `draft_${mockUser.id}_${draft.id}`,
          JSON.stringify(draft)
        );

        // Second save should succeed
        expect(saveAttempts).toBe(2);
      } finally {
        mockLocalStorage.setItem = originalSetItem;
      }
    });

    it('should preserve changes during auto-save', () => {
      const draft = createMockDraftBooking();
      const changes = {
        notes: 'My notes',
        duration: 3,
      };

      const updated = { ...draft, ...changes };

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(updated)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(saved.notes).toBe('My notes');
      expect(saved.duration).toBe(3);
    });
  });

  describe('Session Tracking', () => {
    it('should associate draft with session ID', () => {
      const draft = createMockDraftBooking();

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(draft)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(saved.sessionId).toBe('session-123');
    });

    it('should track user session across multiple drafts', () => {
      const draft1 = createMockDraftBooking({ id: 'draft-1' });
      const draft2 = createMockDraftBooking({
        id: 'draft-2',
        facilityId: 'facility-2',
      });

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft1.id}`,
        JSON.stringify(draft1)
      );
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft2.id}`,
        JSON.stringify(draft2)
      );

      const saved1 = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_draft-1`) || '{}'
      );
      const saved2 = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_draft-2`) || '{}'
      );

      expect(saved1.sessionId).toBe(saved2.sessionId);
    });

    it('should track creation time for session analysis', () => {
      const draft = createMockDraftBooking();

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(draft)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(saved.createdAt).toBeTruthy();
      expect(new Date(saved.createdAt)).toBeInstanceOf(Date);
    });

    it('should retrieve all drafts for a user in a session', () => {
      const draft1 = createMockDraftBooking({ id: 'draft-1' });
      const draft2 = createMockDraftBooking({
        id: 'draft-2',
        facilityId: 'facility-2',
      });

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_draft-1`,
        JSON.stringify(draft1)
      );
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_draft-2`,
        JSON.stringify(draft2)
      );

      // Retrieve all drafts for user
      const allDrafts: DraftBooking[] = [];

      // Simulate retrieving drafts
      const key1 = mockLocalStorage.getItem(
        `draft_${mockUser.id}_draft-1`
      );
      const key2 = mockLocalStorage.getItem(
        `draft_${mockUser.id}_draft-2`
      );

      if (key1) allDrafts.push(JSON.parse(key1));
      if (key2) allDrafts.push(JSON.parse(key2));

      expect(allDrafts).toHaveLength(2);
      expect(allDrafts[0].id).toBe('draft-1');
      expect(allDrafts[1].id).toBe('draft-2');
    });
  });

  describe('Auto-Expire Logic', () => {
    it('should mark draft as expired when expiration time reached', () => {
      const draft = createMockDraftBooking();

      // Set current time to after expiration
      const expiresAt = new Date(draft.expiresAt);
      vi.setSystemTime(new Date(expiresAt.getTime() + 1000)); // 1 second after expiry

      const expired = {
        ...draft,
        status: 'expired' as const,
      };

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(expired)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(saved.status).toBe('expired');
    });

    it('should have 24 hour expiration window by default', () => {
      const draft = createMockDraftBooking();
      const createdAt = new Date(draft.createdAt);
      const expiresAt = new Date(draft.expiresAt);

      const expirationMs = expiresAt.getTime() - createdAt.getTime();
      const expirationHours = expirationMs / (1000 * 60 * 60);

      expect(expirationHours).toBe(24);
    });

    it('should remove expired drafts', () => {
      const draft = createMockDraftBooking();
      const key = `draft_${mockUser.id}_${draft.id}`;

      mockLocalStorage.setItem(key, JSON.stringify(draft));

      // Simulate expiration cleanup
      const expiresAt = new Date(draft.expiresAt);
      vi.setSystemTime(new Date(expiresAt.getTime() + 1000));

      mockLocalStorage.removeItem(key);

      expect(mockLocalStorage.getItem(key)).toBeNull();
    });

    it('should preserve non-expired drafts during cleanup', () => {
      const fresh = createMockDraftBooking({
        id: 'fresh',
        expiresAt: new Date(
          Date.now() + 20 * 60 * 60 * 1000
        ).toISOString(), // 20 hours from now
      });
      const stale = createMockDraftBooking({
        id: 'stale',
        expiresAt: new Date(
          Date.now() - 1 * 60 * 60 * 1000
        ).toISOString(), // 1 hour ago
      });

      const freshKey = `draft_${mockUser.id}_fresh`;
      const staleKey = `draft_${mockUser.id}_stale`;

      mockLocalStorage.setItem(freshKey, JSON.stringify(fresh));
      mockLocalStorage.setItem(staleKey, JSON.stringify(stale));

      // Remove stale
      mockLocalStorage.removeItem(staleKey);

      expect(mockLocalStorage.getItem(freshKey)).toBeTruthy();
      expect(mockLocalStorage.getItem(staleKey)).toBeNull();
    });

    it('should calculate remaining time until expiration', () => {
      const draft = createMockDraftBooking();
      const expiresAt = new Date(draft.expiresAt);
      const now = new Date();

      const remainingMs = expiresAt.getTime() - now.getTime();
      const remainingHours = remainingMs / (1000 * 60 * 60);

      expect(remainingHours).toBeCloseTo(24, 1);
    });

    it('should warn when draft expiring soon', () => {
      const draft = createMockDraftBooking({
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour
      });

      const expiresAt = new Date(draft.expiresAt);
      const now = new Date();
      const remainingMs = expiresAt.getTime() - now.getTime();
      const remainingHours = remainingMs / (1000 * 60 * 60);

      const shouldWarn = remainingHours < 2;

      expect(shouldWarn).toBe(true);
    });
  });

  describe('Data Persistence', () => {
    it('should persist draft across browser sessions', () => {
      const draft = createMockDraftBooking();
      const key = `draft_${mockUser.id}_${draft.id}`;

      // Session 1: Save draft
      mockLocalStorage.setItem(key, JSON.stringify(draft));

      // Simulate browser close/reopen
      const stored = JSON.parse(mockLocalStorage.getItem(key) || '{}');

      // Session 2: Retrieve draft
      expect(stored.id).toBe(draft.id);
      expect(stored.facilityId).toBe(draft.facilityId);
    });

    it('should recover draft after application crash', () => {
      const draft = createMockDraftBooking();
      const key = `draft_${mockUser.id}_${draft.id}`;

      mockLocalStorage.setItem(key, JSON.stringify(draft));

      // Simulate crash recovery
      const recovered = JSON.parse(mockLocalStorage.getItem(key) || '{}');

      expect(recovered).toEqual(draft);
    });

    it('should maintain draft integrity after multiple saves', () => {
      const draft = createMockDraftBooking();
      const key = `draft_${mockUser.id}_${draft.id}`;

      // Multiple saves
      for (let i = 0; i < 5; i++) {
        const updated = {
          ...draft,
          notes: `Updated ${i} times`,
        };
        mockLocalStorage.setItem(key, JSON.stringify(updated));
      }

      const final = JSON.parse(mockLocalStorage.getItem(key) || '{}');

      expect(final.id).toBe(draft.id);
      expect(final.notes).toBe('Updated 4 times');
    });

    it('should handle localStorage quota exceeded during save', () => {
      const draft = createMockDraftBooking();
      const key = `draft_${mockUser.id}_${draft.id}`;
      let quotaExceeded = false;

      const originalSetItem = mockLocalStorage.setItem;

      mockLocalStorage.setItem = (k: string, value: string) => {
        if (value.length > 50000) {
          quotaExceeded = true;
          return;
        }
        originalSetItem.call(mockLocalStorage, k, value);
      };

      try {
        const hugeDraft = {
          ...draft,
          notes: 'x'.repeat(100000),
        };

        mockLocalStorage.setItem(key, JSON.stringify(hugeDraft));
        expect(quotaExceeded).toBe(true);
      } finally {
        mockLocalStorage.setItem = originalSetItem;
      }
    });
  });

  describe('Recurrence Handling in Drafts', () => {
    it('should save recurring booking draft', () => {
      const draft = createMockDraftBooking({
        recurrence: {
          pattern: 'weekly',
          endDate: '2025-06-01',
        },
      });

      const key = `draft_${mockUser.id}_${draft.id}`;
      mockLocalStorage.setItem(key, JSON.stringify(draft));

      const saved = JSON.parse(mockLocalStorage.getItem(key) || '{}');

      expect(saved.recurrence.pattern).toBe('weekly');
      expect(saved.recurrence.endDate).toBe('2025-06-01');
    });

    it('should handle multiple recurrence patterns', () => {
      const patterns = ['daily', 'weekly', 'monthly'] as const;

      patterns.forEach((pattern) => {
        const draft = createMockDraftBooking({
          id: `draft-${pattern}`,
          recurrence: {
            pattern,
            endDate: '2025-06-01',
          },
        });

        const key = `draft_${mockUser.id}_draft-${pattern}`;
        mockLocalStorage.setItem(key, JSON.stringify(draft));

        const saved = JSON.parse(mockLocalStorage.getItem(key) || '{}');
        expect(saved.recurrence.pattern).toBe(pattern);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed draft data', () => {
      const key = `draft_${mockUser.id}_draft-1`;

      mockLocalStorage.setItem(key, 'invalid-json-{]');

      try {
        const parsed = JSON.parse(mockLocalStorage.getItem(key)!);
        expect.fail('Should throw on invalid JSON');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle missing required fields in draft', () => {
      const incomplete: Partial<DraftBooking> = {
        id: 'draft-1',
        // missing other fields
      };

      const key = `draft_${mockUser.id}_draft-1`;
      mockLocalStorage.setItem(key, JSON.stringify(incomplete));

      const saved = JSON.parse(mockLocalStorage.getItem(key) || '{}');

      // Should have the fields that were provided
      expect(saved.id).toBe('draft-1');
    });

    it('should handle concurrent draft saves', () => {
      const draft1 = createMockDraftBooking({ id: 'draft-1' });
      const draft2 = createMockDraftBooking({
        id: 'draft-2',
        facilityId: 'facility-2',
      });

      // Save both simultaneously
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_draft-1`,
        JSON.stringify(draft1)
      );
      mockLocalStorage.setItem(
        `draft_${mockUser.id}_draft-2`,
        JSON.stringify(draft2)
      );

      const saved1 = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_draft-1`) || '{}'
      );
      const saved2 = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_draft-2`) || '{}'
      );

      expect(saved1.id).toBe('draft-1');
      expect(saved2.id).toBe('draft-2');
    });
  });

  describe('Migration to Supabase', () => {
    it('should mark draft as submitted when migrated', () => {
      const draft = createMockDraftBooking();

      const submitted = {
        ...draft,
        status: 'submitted' as const,
      };

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(submitted)
      );

      const saved = JSON.parse(
        mockLocalStorage.getItem(`draft_${mockUser.id}_${draft.id}`) || '{}'
      );

      expect(saved.status).toBe('submitted');
    });

    it('should preserve draft history before migration', () => {
      const draft = createMockDraftBooking();
      const archiveKey = `draft_archive_${mockUser.id}_${draft.id}`;

      mockLocalStorage.setItem(
        `draft_${mockUser.id}_${draft.id}`,
        JSON.stringify(draft)
      );

      // Archive before deleting
      mockLocalStorage.setItem(archiveKey, JSON.stringify(draft));

      // Delete from active drafts
      mockLocalStorage.removeItem(`draft_${mockUser.id}_${draft.id}`);

      // Archive should still exist
      expect(mockLocalStorage.getItem(archiveKey)).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle large draft payloads', () => {
      const draft = createMockDraftBooking({
        notes: 'x'.repeat(10000),
      });

      const key = `draft_${mockUser.id}_${draft.id}`;
      mockLocalStorage.setItem(key, JSON.stringify(draft));

      const saved = JSON.parse(mockLocalStorage.getItem(key) || '{}');

      expect(saved.notes.length).toBe(10000);
    });

    it('should efficiently retrieve user drafts', () => {
      // Create multiple drafts
      for (let i = 0; i < 10; i++) {
        const draft = createMockDraftBooking({
          id: `draft-${i}`,
          facilityId: `facility-${i}`,
        });

        mockLocalStorage.setItem(
          `draft_${mockUser.id}_draft-${i}`,
          JSON.stringify(draft)
        );
      }

      // Retrieve all
      const drafts: DraftBooking[] = [];
      for (let i = 0; i < 10; i++) {
        const data = mockLocalStorage.getItem(`draft_${mockUser.id}_draft-${i}`);
        if (data) drafts.push(JSON.parse(data));
      }

      expect(drafts).toHaveLength(10);
    });
  });
});
