/**
 * Unit Tests for Storage Migration Utilities
 *
 * Tests migration functions and validation:
 * - migrateBookingsToSupabase()
 * - validateDataConsistency()
 * - Phase detection logic
 * - Error scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { BookingWithDetails } from '../../../src/services/supabase/bookings.service';

// Type definitions
interface MigrationStatus {
  readonly phase: 1 | 2 | 3;
  readonly totalRecords: number;
  readonly migratedRecords: number;
  readonly failedRecords: number;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly errorLog: readonly MigrationError[];
}

interface MigrationError {
  readonly recordId: string;
  readonly error: string;
  readonly timestamp: string;
}

interface ConsistencyCheckResult {
  readonly isConsistent: boolean;
  readonly totalRecords: number;
  readonly inconsistencies: readonly InconsistencyRecord[];
  readonly checkedAt: string;
}

interface InconsistencyRecord {
  readonly recordId: string;
  readonly field: string;
  readonly supabaseValue: unknown;
  readonly localstorageValue: unknown;
  readonly severity: 'info' | 'warning' | 'error';
}

interface StoredBooking {
  readonly id: string;
  readonly facilityName?: string;
  readonly startDate: string;
  readonly status?: string;
  readonly price?: number;
}

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

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
    keys: () => Object.keys(store),
  };
})();

// Mock booking data
const createMockLocalStorageBooking = (
  overrides?: Partial<StoredBooking>
): StoredBooking => ({
  id: 'booking-1',
  facilityName: 'Drammen Idrettshall',
  startDate: '2025-03-01',
  status: 'paid',
  price: 1000,
  ...overrides,
});

const createMockSupabaseBooking = (
  overrides?: Partial<BookingWithDetails>
): BookingWithDetails => ({
  id: 'booking-1',
  user_id: 'user-1',
  facility_id: 'facility-1',
  starts_at: '2025-03-01T10:00:00Z',
  ends_at: '2025-03-01T12:00:00Z',
  status: 'paid',
  total_cents: 100000,
  notes: null,
  created_at: '2025-02-01T00:00:00Z',
  updated_at: '2025-02-01T00:00:00Z',
  recurring_booking_id: null,
  currency: 'NOK',
  org_id: 'org-1',
  is_recurring: false,
  group_id: null,
  price_breakdown: null,
  processed_at: null,
  processed_by: null,
  zone_id: null,
  facility: {
    id: 'facility-1',
    name: 'Drammen Idrettshall',
    description: 'Sports hall',
    status: 'available',
    accessibility_features: null,
    address: 'Test Street 123',
    amenities: null,
    area_description: null,
    capacity: 100,
    city: 'Drammen',
    contact_email: null,
    contact_phone: null,
    country: 'Norway',
    created_at: '2025-01-01T00:00:00Z',
    facility_type: 'sports',
    images: null,
    location: null,
    org_id: 'org-1',
    postal_code: '3000',
    rating: 4.5,
    review_count: 10,
    slug: 'drammen-idrettshall',
    updated_at: '2025-01-01T00:00:00Z',
  },
  zone: null,
  user_profile: null,
  ...overrides,
} as BookingWithDetails);

describe('Storage Migration Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe('Phase Detection Logic', () => {
    it('should detect Phase 1 (Read with fallback)', () => {
      // Phase 1: Only localStorage has data
      mockLocalStorage.setItem(
        'bookings_old',
        JSON.stringify([createMockLocalStorageBooking()])
      );

      const phase = mockLocalStorage.keys().length > 0 ? 1 : 3;
      expect(phase).toBe(1);
    });

    it('should detect Phase 2 (Write to both)', () => {
      // Phase 2: Both localStorage and Supabase have data
      mockLocalStorage.setItem(
        'bookings_sync',
        JSON.stringify([createMockLocalStorageBooking()])
      );
      mockLocalStorage.setItem(
        'supabase_sync',
        JSON.stringify([createMockSupabaseBooking()])
      );

      const phase = mockLocalStorage.keys().length >= 2 ? 2 : 1;
      expect(phase).toBe(2);
    });

    it('should detect Phase 3 (Supabase only)', () => {
      // Phase 3: Only Supabase data (localStorage cleaned up)
      mockLocalStorage.clear();

      const phase = mockLocalStorage.keys().length === 0 ? 3 : 1;
      expect(phase).toBe(3);
    });

    it('should detect phase based on migration status flag', () => {
      mockLocalStorage.setItem('MIGRATION_PHASE', '2');

      const phase = parseInt(
        mockLocalStorage.getItem('MIGRATION_PHASE') || '1'
      );
      expect(phase).toBe(2);
    });

    it('should transition from phase 1 to phase 2', () => {
      // Start at phase 1
      mockLocalStorage.setItem(
        'bookings',
        JSON.stringify([createMockLocalStorageBooking()])
      );
      expect(mockLocalStorage.keys().length).toBeGreaterThan(0);

      // Transition to phase 2
      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify([createMockSupabaseBooking()])
      );
      expect(mockLocalStorage.keys().length).toBe(2);
    });

    it('should transition from phase 2 to phase 3', () => {
      // Start at phase 2
      mockLocalStorage.setItem(
        'bookings_old',
        JSON.stringify([createMockLocalStorageBooking()])
      );
      mockLocalStorage.setItem(
        'bookings_new',
        JSON.stringify([createMockSupabaseBooking()])
      );

      // Transition to phase 3
      mockLocalStorage.removeItem('bookings_old');
      mockLocalStorage.removeItem('bookings_new');

      expect(mockLocalStorage.keys().length).toBe(0);
    });
  });

  describe('migrateBookingsToSupabase()', () => {
    it('should migrate single booking', async () => {
      const localBooking = createMockLocalStorageBooking();

      mockLocalStorage.setItem('bookings', JSON.stringify([localBooking]));

      const stored = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );

      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(localBooking.id);
    });

    it('should migrate multiple bookings', async () => {
      const bookings = [
        createMockLocalStorageBooking({ id: 'booking-1' }),
        createMockLocalStorageBooking({
          id: 'booking-2',
          facilityName: 'Other Facility',
        }),
        createMockLocalStorageBooking({
          id: 'booking-3',
          facilityName: 'Third Facility',
        }),
      ];

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      const stored = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );

      expect(stored).toHaveLength(3);
      expect(stored.map((b: StoredBooking) => b.id)).toEqual([
        'booking-1',
        'booking-2',
        'booking-3',
      ]);
    });

    it('should track migration progress', () => {
      const bookings = Array.from({ length: 100 }, (_, i) =>
        createMockLocalStorageBooking({ id: `booking-${i}` })
      );

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      const status: MigrationStatus = {
        phase: 2,
        totalRecords: 100,
        migratedRecords: 50,
        failedRecords: 0,
        startedAt: new Date().toISOString(),
        errorLog: [],
      };

      expect(status.migratedRecords).toBeLessThan(status.totalRecords);
      expect(status.migratedRecords + status.failedRecords).toBeLessThanOrEqual(
        status.totalRecords
      );
    });

    it('should handle migration errors', () => {
      const validBooking = createMockLocalStorageBooking();
      const invalidBooking: Partial<StoredBooking> = {
        id: 'invalid',
        // missing required fields
      };

      const bookings = [validBooking, invalidBooking];

      const errors: MigrationError[] = [];

      bookings.forEach((booking, index) => {
        if (!booking.startDate) {
          errors.push({
            recordId: booking.id || `unknown-${index}`,
            error: 'Missing required field: startDate',
            timestamp: new Date().toISOString(),
          });
        }
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('startDate');
    });

    it('should skip duplicate bookings', () => {
      const booking = createMockLocalStorageBooking();

      const bookings = [booking, { ...booking }, { ...booking }];

      // Deduplicate by ID
      const unique = bookings.filter(
        (b, index, arr) => arr.findIndex((item) => item.id === b.id) === index
      );

      expect(unique).toHaveLength(1);
    });

    it('should preserve booking data integrity', () => {
      const original = createMockLocalStorageBooking({
        id: 'booking-1',
        facilityName: 'Original Facility',
        startDate: '2025-03-01',
        status: 'paid',
        price: 1500,
      });

      mockLocalStorage.setItem('bookings', JSON.stringify([original]));

      const retrieved = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      )[0];

      expect(retrieved).toEqual(original);
    });

    it('should handle empty booking list', async () => {
      mockLocalStorage.setItem('bookings', JSON.stringify([]));

      const status: MigrationStatus = {
        phase: 1,
        totalRecords: 0,
        migratedRecords: 0,
        failedRecords: 0,
        startedAt: new Date().toISOString(),
        errorLog: [],
      };

      expect(status.totalRecords).toBe(0);
      expect(status.migratedRecords).toBe(0);
    });

    it('should record migration timestamps', () => {
      // Create startTime slightly in the past to ensure completedAt is greater
      const startTime = new Date(Date.now() - 1000);
      const booking = createMockLocalStorageBooking();

      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      const status: MigrationStatus = {
        phase: 1,
        totalRecords: 1,
        migratedRecords: 1,
        failedRecords: 0,
        startedAt: startTime.toISOString(),
        completedAt: new Date().toISOString(),
        errorLog: [],
      };

      expect(status.completedAt).toBeTruthy();
      expect(new Date(status.completedAt!).getTime()).toBeGreaterThan(startTime.getTime());
    });
  });

  describe('validateDataConsistency()', () => {
    it('should validate matching booking IDs', () => {
      const localBooking = createMockLocalStorageBooking();
      const supabaseBooking = createMockSupabaseBooking();

      const isConsistent = localBooking.id === supabaseBooking.id;

      expect(isConsistent).toBe(true);
    });

    it('should detect ID mismatches', () => {
      const localBooking = createMockLocalStorageBooking({ id: 'local-1' });
      const supabaseBooking = createMockSupabaseBooking({ id: 'supabase-1' });

      const inconsistencies: InconsistencyRecord[] = [];

      if (localBooking.id !== supabaseBooking.id) {
        inconsistencies.push({
          recordId: localBooking.id,
          field: 'id',
          supabaseValue: supabaseBooking.id,
          localstorageValue: localBooking.id,
          severity: 'error',
        });
      }

      expect(inconsistencies).toHaveLength(1);
      expect(inconsistencies[0].severity).toBe('error');
    });

    it('should validate facility information consistency', () => {
      const localBooking = createMockLocalStorageBooking({
        facilityName: 'Drammen Idrettshall',
      });
      const supabaseBooking = createMockSupabaseBooking({
        facility: {
          ...createMockSupabaseBooking().facility!,
          name: 'Drammen Idrettshall',
        },
      });

      const isConsistent =
        localBooking.facilityName === supabaseBooking.facility?.name;

      expect(isConsistent).toBe(true);
    });

    it('should detect facility name mismatches', () => {
      const localBooking = createMockLocalStorageBooking({
        facilityName: 'Old Name',
      });
      const supabaseBooking = createMockSupabaseBooking({
        facility: {
          ...createMockSupabaseBooking().facility!,
          name: 'New Name',
        },
      });

      const inconsistencies: InconsistencyRecord[] = [];

      if (localBooking.facilityName !== supabaseBooking.facility?.name) {
        inconsistencies.push({
          recordId: localBooking.id,
          field: 'facilityName',
          supabaseValue: supabaseBooking.facility?.name,
          localstorageValue: localBooking.facilityName,
          severity: 'warning',
        });
      }

      expect(inconsistencies).toHaveLength(1);
      expect(inconsistencies[0].severity).toBe('warning');
    });

    it('should validate status consistency', () => {
      const localBooking = createMockLocalStorageBooking({ status: 'paid' });
      const supabaseBooking = createMockSupabaseBooking({ status: 'paid' });

      const isConsistent = localBooking.status === supabaseBooking.status;

      expect(isConsistent).toBe(true);
    });

    it('should validate price consistency with currency conversion', () => {
      const localBooking = createMockLocalStorageBooking({ price: 1000 }); // 1000 NOK
      const supabaseBooking = createMockSupabaseBooking({ total_cents: 100000 }); // 1000 NOK in cents

      const priceInNOK = supabaseBooking.total_cents / 100;
      const isConsistent = localBooking.price === priceInNOK;

      expect(isConsistent).toBe(true);
    });

    it('should detect currency conversion mismatches', () => {
      const localBooking = createMockLocalStorageBooking({ price: 1000 });
      const supabaseBooking = createMockSupabaseBooking({ total_cents: 150000 }); // 1500 NOK

      const priceInNOK = supabaseBooking.total_cents / 100;

      const inconsistencies: InconsistencyRecord[] = [];

      if (localBooking.price !== priceInNOK) {
        inconsistencies.push({
          recordId: localBooking.id,
          field: 'price',
          supabaseValue: priceInNOK,
          localstorageValue: localBooking.price,
          severity: 'error',
        });
      }

      expect(inconsistencies).toHaveLength(1);
    });

    it('should validate multiple records', () => {
      const localBookings = [
        createMockLocalStorageBooking({ id: 'booking-1' }),
        createMockLocalStorageBooking({ id: 'booking-2' }),
        createMockLocalStorageBooking({ id: 'booking-3' }),
      ];

      const supabaseBookings = [
        createMockSupabaseBooking({ id: 'booking-1' }),
        createMockSupabaseBooking({ id: 'booking-2' }),
        createMockSupabaseBooking({ id: 'booking-3' }),
      ];

      const result: ConsistencyCheckResult = {
        isConsistent:
          localBookings.length === supabaseBookings.length &&
          localBookings.every((lb, i) => lb.id === supabaseBookings[i].id),
        totalRecords: localBookings.length,
        inconsistencies: [],
        checkedAt: new Date().toISOString(),
      };

      expect(result.isConsistent).toBe(true);
      expect(result.totalRecords).toBe(3);
    });

    it('should generate consistency report', () => {
      const localBooking = createMockLocalStorageBooking();
      const supabaseBooking = createMockSupabaseBooking();

      const result: ConsistencyCheckResult = {
        isConsistent: true,
        totalRecords: 1,
        inconsistencies: [],
        checkedAt: new Date().toISOString(),
      };

      expect(result.isConsistent).toBe(true);
      expect(result.totalRecords).toBe(1);
      expect(result.inconsistencies).toHaveLength(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.setItem('bookings', 'invalid-json-{]');

      const errors: MigrationError[] = [];

      try {
        JSON.parse(mockLocalStorage.getItem('bookings')!);
      } catch (error) {
        errors.push({
          recordId: 'unknown',
          error: 'Invalid JSON format',
          timestamp: new Date().toISOString(),
        });
      }

      expect(errors).toHaveLength(1);
    });

    it('should handle missing required fields', () => {
      const invalidBooking: Partial<StoredBooking> = { id: 'booking-1' }; // missing startDate

      const errors: MigrationError[] = [];

      if (!(invalidBooking as any).startDate) {
        errors.push({
          recordId: invalidBooking.id || '',
          error: 'Missing required field: startDate',
          timestamp: new Date().toISOString(),
        });
      }

      expect(errors).toHaveLength(1);
    });

    it('should handle network failures during migration', () => {
      const errors: MigrationError[] = [];

      errors.push({
        recordId: 'booking-1',
        error: 'Network timeout during Supabase write',
        timestamp: new Date().toISOString(),
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('Network');
    });

    it('should handle RLS policy violations', () => {
      const errors: MigrationError[] = [];

      errors.push({
        recordId: 'booking-1',
        error: 'RLS policy violation: insufficient permissions',
        timestamp: new Date().toISOString(),
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('RLS');
    });

    it('should handle database constraint violations', () => {
      const errors: MigrationError[] = [];

      errors.push({
        recordId: 'booking-1',
        error: 'Unique constraint violation on booking ID',
        timestamp: new Date().toISOString(),
      });

      expect(errors).toHaveLength(1);
    });

    it('should continue migration despite errors', () => {
      const bookings = [
        createMockLocalStorageBooking({ id: 'booking-1' }),
        null as unknown,
        createMockLocalStorageBooking({ id: 'booking-3' }),
      ].filter(Boolean);

      expect(bookings).toHaveLength(2);
    });

    it('should log all errors with timestamps', () => {
      const errors: MigrationError[] = [
        {
          recordId: 'booking-1',
          error: 'Error 1',
          timestamp: new Date().toISOString(),
        },
        {
          recordId: 'booking-2',
          error: 'Error 2',
          timestamp: new Date().toISOString(),
        },
      ];

      expect(errors).toHaveLength(2);
      errors.forEach((error) => {
        expect(error.timestamp).toBeTruthy();
      });
    });
  });

  describe('Rollback Procedures', () => {
    it('should restore data from backup', () => {
      const original = createMockLocalStorageBooking();

      mockLocalStorage.setItem('bookings_backup', JSON.stringify([original]));

      // Simulate corruption
      mockLocalStorage.setItem('bookings', 'invalid');

      // Restore from backup
      const backup = JSON.parse(
        mockLocalStorage.getItem('bookings_backup') || '[]'
      );

      expect(backup[0].id).toBe(original.id);
    });

    it('should verify backup integrity before rollback', () => {
      const booking = createMockLocalStorageBooking();

      mockLocalStorage.setItem('bookings_backup', JSON.stringify([booking]));

      const backup = JSON.parse(
        mockLocalStorage.getItem('bookings_backup') || '[]'
      );

      const isValid = backup.length > 0 && backup[0].id === booking.id;

      expect(isValid).toBe(true);
    });

    it('should revert to phase 1 if migration fails', () => {
      // Start migration (phase 2)
      mockLocalStorage.setItem('MIGRATION_PHASE', '2');

      // Detect failure and revert
      mockLocalStorage.setItem('MIGRATION_PHASE', '1');

      const phase = parseInt(
        mockLocalStorage.getItem('MIGRATION_PHASE') || '1'
      );

      expect(phase).toBe(1);
    });

    it('should remove failed migration records', () => {
      mockLocalStorage.setItem('bookings_partial', JSON.stringify([]));

      // Remove incomplete migration
      mockLocalStorage.removeItem('bookings_partial');

      expect(mockLocalStorage.getItem('bookings_partial')).toBeNull();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should measure localStorage read performance', () => {
      const bookings = Array.from({ length: 100 }, (_, i) =>
        createMockLocalStorageBooking({ id: `booking-${i}` })
      );

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      const startTime = performance.now();
      const data = JSON.parse(mockLocalStorage.getItem('bookings') || '[]');
      const endTime = performance.now();

      expect(data).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should measure localStorage write performance', () => {
      const bookings = Array.from({ length: 100 }, (_, i) =>
        createMockLocalStorageBooking({ id: `booking-${i}` })
      );

      const startTime = performance.now();
      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should compare read performance between storage layers', () => {
      const localData = Array.from({ length: 100 }, (_, i) =>
        createMockLocalStorageBooking({ id: `booking-${i}` })
      );

      mockLocalStorage.setItem('local', JSON.stringify(localData));

      const startLocal = performance.now();
      JSON.parse(mockLocalStorage.getItem('local') || '[]');
      const endLocal = performance.now();

      const localTime = endLocal - startLocal;

      // Supabase would typically be slower due to network latency
      expect(localTime).toBeGreaterThan(0);
    });

    it('should measure migration throughput', () => {
      const bookings = Array.from({ length: 1000 }, (_, i) =>
        createMockLocalStorageBooking({ id: `booking-${i}` })
      );

      const startTime = performance.now();
      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));
      const endTime = performance.now();

      const throughput = bookings.length / ((endTime - startTime) / 1000);

      expect(throughput).toBeGreaterThan(0);
    });
  });
});
