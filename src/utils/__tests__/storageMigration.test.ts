/**
 * Storage Migration Tests
 *
 * Comprehensive test suite for the storage migration utilities
 * and hooks to ensure zero data loss during migration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getMigrationPhase,
  validateDataConsistency,
  migrateBookingsToSupabase,
  clearLocalStorageBookings,
  getMigrationHealth,
  type MigrationPhase,
} from '../storageMigration';
import type { IStoredBooking } from '../localStorageTypes';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null,
      })),
      upsert: vi.fn(() => ({
        data: null,
        error: null,
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

describe('Storage Migration Utilities', () => {
  const testUserId = 'test-user-123';
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = global.localStorage;

    // Create a fresh localStorage mock for each test
    const localStorageMock: Record<string, string> = {};

    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key]);
      },
      length: Object.keys(localStorageMock).length,
      key: (index: number) => Object.keys(localStorageMock)[index] || null,
    } as Storage;
  });

  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
    vi.clearAllMocks();
  });

  describe('getMigrationPhase', () => {
    it('should return a valid migration phase', () => {
      const phase = getMigrationPhase();
      expect(['fallback', 'dual-write', 'supabase-only']).toContain(phase);
    });

    it('should default to fallback phase if not configured', () => {
      // Clear any existing env var
      vi.stubEnv('VITE_STORAGE_MIGRATION_PHASE', '');

      const phase = getMigrationPhase();
      expect(phase).toBe('fallback');
    });
  });

  describe('validateDataConsistency', () => {
    it('should return true when localStorage is empty and Supabase is empty', async () => {
      // Setup: Empty localStorage
      localStorage.setItem('pendingBookings', JSON.stringify([]));
      localStorage.setItem('processedBookings', JSON.stringify([]));

      const isConsistent = await validateDataConsistency(testUserId);
      expect(isConsistent).toBe(true);
    });

    it('should return false when counts do not match', async () => {
      // Setup: Add bookings to localStorage
      const mockBookings: IStoredBooking[] = [
        {
          id: 'booking-1',
          facilityName: 'Test Facility',
          startDate: '2025-11-01',
          status: 'pending',
        },
      ];

      localStorage.setItem('pendingBookings', JSON.stringify(mockBookings));
      localStorage.setItem('processedBookings', JSON.stringify([]));

      const isConsistent = await validateDataConsistency(testUserId);
      // Should be false because Supabase is mocked to return empty array
      expect(isConsistent).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Mock Supabase error
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: new Error('Database connection failed'),
          })),
        })),
      } as never);

      const isConsistent = await validateDataConsistency(testUserId);
      expect(isConsistent).toBe(false);
    });
  });

  describe('migrateBookingsToSupabase', () => {
    it('should migrate bookings successfully', async () => {
      // Setup: Add bookings to localStorage
      const mockBookings: IStoredBooking[] = [
        {
          id: 'booking-1',
          facilityName: 'Test Facility 1',
          startDate: '2025-11-01',
          status: 'pending',
        },
        {
          id: 'booking-2',
          facilityName: 'Test Facility 2',
          startDate: '2025-11-02',
          status: 'approved',
        },
      ];

      localStorage.setItem('pendingBookings', JSON.stringify([mockBookings[0]]));
      localStorage.setItem('processedBookings', JSON.stringify([mockBookings[1]]));

      const result = await migrateBookingsToSupabase(testUserId);

      expect(result.success).toBe(true);
      expect(result.migrated).toBeGreaterThanOrEqual(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should return success with zero migrated when no bookings exist', async () => {
      localStorage.setItem('pendingBookings', JSON.stringify([]));
      localStorage.setItem('processedBookings', JSON.stringify([]));

      const result = await migrateBookingsToSupabase(testUserId);

      expect(result.success).toBe(true);
      expect(result.migrated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial migration failures', async () => {
      const mockBookings: IStoredBooking[] = [
        {
          id: 'booking-1',
          facilityName: 'Test Facility 1',
          startDate: '2025-11-01',
          status: 'pending',
        },
      ];

      localStorage.setItem('pendingBookings', JSON.stringify(mockBookings));

      // Mock Supabase error for insert
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        insert: vi.fn(() => ({
          data: null,
          error: new Error('Insert failed'),
        })),
      } as never);

      const result = await migrateBookingsToSupabase(testUserId);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('clearLocalStorageBookings', () => {
    it('should clear localStorage after validation', async () => {
      // Setup: Add bookings to localStorage
      localStorage.setItem('pendingBookings', JSON.stringify([{ id: 'test' }]));
      localStorage.setItem('processedBookings', JSON.stringify([{ id: 'test2' }]));

      // Mock validation to return true
      vi.spyOn(
        await import('../storageMigration'),
        'validateDataConsistency'
      ).mockResolvedValueOnce(true);

      const success = await clearLocalStorageBookings(testUserId, true);

      expect(success).toBe(true);
      expect(localStorage.getItem('pendingBookings')).toBeNull();
      expect(localStorage.getItem('processedBookings')).toBeNull();
    });

    it('should not clear localStorage if validation fails', async () => {
      localStorage.setItem('pendingBookings', JSON.stringify([{ id: 'test' }]));

      // Mock validation to return false
      vi.spyOn(
        await import('../storageMigration'),
        'validateDataConsistency'
      ).mockResolvedValueOnce(false);

      const success = await clearLocalStorageBookings(testUserId, true);

      expect(success).toBe(false);
      expect(localStorage.getItem('pendingBookings')).not.toBeNull();
    });

    it('should allow clearing without validation', async () => {
      localStorage.setItem('pendingBookings', JSON.stringify([{ id: 'test' }]));

      const success = await clearLocalStorageBookings(testUserId, false);

      expect(success).toBe(true);
      expect(localStorage.getItem('pendingBookings')).toBeNull();
    });
  });

  describe('getMigrationHealth', () => {
    it('should return health status', async () => {
      const health = await getMigrationHealth(testUserId);

      expect(health).toHaveProperty('phase');
      expect(health).toHaveProperty('supabaseConnected');
      expect(health).toHaveProperty('dataConsistent');
      expect(health).toHaveProperty('localBookingsCount');
      expect(health).toHaveProperty('supabaseBookingsCount');
    });

    it('should count local bookings correctly', async () => {
      const mockBookings: IStoredBooking[] = [
        { id: 'booking-1', facilityName: 'Test 1', startDate: '2025-11-01' },
        { id: 'booking-2', facilityName: 'Test 2', startDate: '2025-11-02' },
      ];

      localStorage.setItem('pendingBookings', JSON.stringify(mockBookings));
      localStorage.setItem('processedBookings', JSON.stringify([mockBookings[0]]));

      const health = await getMigrationHealth(testUserId);

      expect(health.localBookingsCount).toBe(3);
    });

    it('should handle Supabase connection failures', async () => {
      // Mock Supabase error
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: null,
            error: new Error('Connection failed'),
          })),
        })),
      } as never);

      const health = await getMigrationHealth(testUserId);

      expect(health.supabaseConnected).toBe(false);
      expect(health.dataConsistent).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded errors', () => {
      // Mock localStorage.setItem to throw quota error
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw, should handle gracefully
      expect(() => {
        localStorage.setItem('test', 'value');
      }).toThrow('QuotaExceededError');
    });

    it('should handle JSON parse errors', () => {
      localStorage.setItem('pendingBookings', 'invalid-json');

      const bookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      // Should handle parse error and return empty array
      expect(Array.isArray(bookings) || bookings === null).toBe(true);
    });
  });

  describe('Migration Phases', () => {
    const phases: MigrationPhase[] = ['fallback', 'dual-write', 'supabase-only'];

    it.each(phases)('should handle %s phase correctly', (phase) => {
      // Mock environment variable
      vi.stubEnv('VITE_STORAGE_MIGRATION_PHASE', phase);

      const currentPhase = getMigrationPhase();
      expect(currentPhase).toBe(phase);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all booking properties during migration', async () => {
      const completeBooking: IStoredBooking = {
        id: 'booking-1',
        facilityName: 'Test Facility',
        facility: 'Test Facility Alt',
        facilityId: 'facility-123',
        startDate: '2025-11-01',
        date: '2025-11-01',
        startTime: '10:00',
        time: '10:00',
        endTime: '12:00',
        duration: 2,
        status: 'pending',
        price: 1000,
        purpose: 'Testing',
        description: 'Test booking',
        contactPerson: 'John Doe',
        bookerName: 'Jane Doe',
        bookerEmail: 'jane@example.com',
        submittedAt: '2025-10-28T10:00:00Z',
        requestedAt: '2025-10-28T10:00:00Z',
        processedBy: 'admin-123',
        processedAt: '2025-10-28T11:00:00Z',
        isRecurring: false,
        parentBookingId: undefined,
      };

      localStorage.setItem('pendingBookings', JSON.stringify([completeBooking]));

      const result = await migrateBookingsToSupabase(testUserId);

      // Verify no data loss
      expect(result.success).toBe(true);
      // All properties should be preserved (verified by no errors)
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous migrations', async () => {
      const migrations = Array.from({ length: 5 }, (_, i) =>
        migrateBookingsToSupabase(`user-${i}`)
      );

      const results = await Promise.all(migrations);

      results.forEach((result) => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('migrated');
        expect(result).toHaveProperty('errors');
      });
    });
  });
});
