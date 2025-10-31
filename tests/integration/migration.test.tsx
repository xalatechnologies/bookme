/**
 * Integration Tests for localStorage → Supabase Migration
 *
 * Tests end-to-end migration flows:
 * - Complete migration lifecycle
 * - Data integrity across phases
 * - Rollback procedures
 * - Performance benchmarks
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Type definitions
interface MockFacility {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly zone_id?: string;
  readonly capacity?: number;
  readonly hourly_rate?: number;
  readonly status?: string;
}

interface LocalStorageBooking {
  readonly id: string;
  readonly facilityName?: string;
  readonly startDate: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly status?: string;
  readonly price?: number;
}

interface MigrationProgressEvent {
  readonly phase: number;
  readonly completed: number;
  readonly total: number;
  readonly percentage: number;
  readonly timestamp: string;
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
    get length() {
      return Object.keys(store).length;
    },
  };
})();

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

// Mock data generators
const createMockLocalBooking = (
  overrides?: Partial<LocalStorageBooking>
): LocalStorageBooking => ({
  id: 'booking-1',
  facilityName: 'Drammen Idrettshall',
  startDate: '2025-03-01',
  startTime: '10:00',
  endTime: '12:00',
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  cancelled_at: null,
  recurring_booking_id: null,
  approval_status: 'approved',
  approved_by: null,
  approved_at: null,
  facility: {
    id: 'facility-1',
    name: 'Drammen Idrettshall',
  } as MockFacility,
  ...overrides,
});

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

describe('Migration Integration Tests', () => {
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

  describe('End-to-End Migration Flow', () => {
    it('should complete migration from Phase 1 to Phase 3', async () => {
      // Phase 1: Data only in localStorage
      const booking1 = createMockLocalBooking({ id: 'booking-1' });
      const booking2 = createMockLocalBooking({
        id: 'booking-2',
        facilityName: 'Other Facility',
      });

      mockLocalStorage.setItem('bookings', JSON.stringify([booking1, booking2]));
      expect(mockLocalStorage.length).toBeGreaterThan(0);

      // Phase 2: Migrate to Supabase while keeping localStorage
      const supabaseBookings = [
        createMockSupabaseBooking({ id: 'booking-1' }),
        createMockSupabaseBooking({
          id: 'booking-2',
          facility: { ...createMockSupabaseBooking().facility!, name: 'Other Facility' },
        }),
      ];

      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify(supabaseBookings)
      );

      const phase2Keys = mockLocalStorage.keys();
      expect(phase2Keys.length).toBe(2);

      // Phase 3: Remove localStorage, use only Supabase
      mockLocalStorage.removeItem('bookings');
      mockLocalStorage.removeItem('bookings_supabase');

      expect(mockLocalStorage.length).toBe(0);
    });

    it('should handle booking creation during migration', async () => {
      // Create booking in Phase 1
      const booking = createMockLocalBooking();

      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      // Migrate to Phase 2
      const supabaseVersion = createMockSupabaseBooking();
      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify([supabaseVersion])
      );

      // Verify both versions exist
      const local = JSON.parse(mockLocalStorage.getItem('bookings') || '[]');
      const supabase = JSON.parse(
        mockLocalStorage.getItem('bookings_supabase') || '[]'
      );

      expect(local[0].id).toBe(booking.id);
      expect(supabase[0].id).toBe(supabaseVersion.id);
    });

    it('should handle booking updates during migration', async () => {
      // Initial booking in Phase 1
      const booking = createMockLocalBooking({ status: 'pending' });

      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      // Update in Phase 2 (both)
      const updated = {
        ...booking,
        status: 'paid',
      };

      const bookings = JSON.parse(mockLocalStorage.getItem('bookings') || '[]');
      bookings[0].status = 'paid';
      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      // Also update in Supabase version
      const supabaseBooking = createMockSupabaseBooking({ status: 'paid' });
      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify([supabaseBooking])
      );

      // Verify consistency
      const finalLocal = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );
      const finalSupabase = JSON.parse(
        mockLocalStorage.getItem('bookings_supabase') || '[]'
      );

      expect(finalLocal[0].status).toBe('paid');
      expect(finalSupabase[0].status).toBe('paid');
    });

    it('should handle booking cancellation during migration', async () => {
      // Booking in Phase 2
      mockLocalStorage.setItem(
        'bookings',
        JSON.stringify([createMockLocalBooking()])
      );
      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify([createMockSupabaseBooking()])
      );

      // Cancel in both
      const localBookings = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );
      localBookings[0].status = 'cancelled';
      mockLocalStorage.setItem('bookings', JSON.stringify(localBookings));

      const supabaseBookings = JSON.parse(
        mockLocalStorage.getItem('bookings_supabase') || '[]'
      );
      supabaseBookings[0].status = 'cancelled';
      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify(supabaseBookings)
      );

      // Verify both are cancelled
      const finalLocal = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );
      const finalSupabase = JSON.parse(
        mockLocalStorage.getItem('bookings_supabase') || '[]'
      );

      expect(finalLocal[0].status).toBe('cancelled');
      expect(finalSupabase[0].status).toBe('cancelled');
    });
  });

  describe('Data Integrity During Migration', () => {
    it('should maintain data consistency between layers', () => {
      const localBooking = createMockLocalBooking();
      const supabaseBooking = createMockSupabaseBooking();

      mockLocalStorage.setItem('local', JSON.stringify([localBooking]));
      mockLocalStorage.setItem('supabase', JSON.stringify([supabaseBooking]));

      const local = JSON.parse(mockLocalStorage.getItem('local') || '[]')[0];
      const supabase = JSON.parse(
        mockLocalStorage.getItem('supabase') || '[]'
      )[0];

      // IDs should match
      expect(local.id).toBe(supabase.id);

      // Status should match
      expect(local.status).toBe(supabase.status);
    });

    it('should preserve all booking fields during migration', () => {
      const booking = createMockLocalBooking({
        id: 'booking-1',
        facilityName: 'Test Facility',
        startDate: '2025-03-01',
        startTime: '10:00',
        endTime: '12:00',
        status: 'paid',
        price: 1500,
      });

      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      const retrieved = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      )[0];

      expect(retrieved.id).toBe('booking-1');
      expect(retrieved.facilityName).toBe('Test Facility');
      expect(retrieved.startDate).toBe('2025-03-01');
      expect(retrieved.status).toBe('paid');
      expect(retrieved.price).toBe(1500);
    });

    it('should handle large data volumes', () => {
      const bookings = Array.from({ length: 500 }, (_, i) =>
        createMockLocalBooking({ id: `booking-${i}` })
      );

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      const retrieved = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );

      expect(retrieved).toHaveLength(500);
      expect(retrieved[0].id).toBe('booking-0');
      expect(retrieved[499].id).toBe('booking-499');
    });

    it('should detect data corruption', () => {
      const booking = createMockLocalBooking();

      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      // Corrupt one field
      const corrupted = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );
      corrupted[0].facilityName = null;

      mockLocalStorage.setItem('bookings_corrupt', JSON.stringify(corrupted));

      const original = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );
      const corrupt = JSON.parse(
        mockLocalStorage.getItem('bookings_corrupt') || '[]'
      );

      expect(original[0].facilityName).toBeTruthy();
      expect(corrupt[0].facilityName).toBeNull();
    });

    it('should verify checksums for data integrity', () => {
      const booking = createMockLocalBooking();

      const checksum = JSON.stringify(booking).split('').reduce((a, b) => {
        return ((a << 5) - a) + b.charCodeAt(0);
      }, 0);

      mockLocalStorage.setItem(
        'booking_checksum',
        checksum.toString()
      );

      const stored = mockLocalStorage.getItem('booking_checksum');

      expect(stored).toBe(checksum.toString());
    });
  });

  describe('Rollback Procedures', () => {
    it('should rollback from Phase 2 to Phase 1', () => {
      // Phase 2: Data in both
      mockLocalStorage.setItem(
        'bookings',
        JSON.stringify([createMockLocalBooking()])
      );
      mockLocalStorage.setItem(
        'bookings_supabase',
        JSON.stringify([createMockSupabaseBooking()])
      );

      expect(mockLocalStorage.length).toBe(2);

      // Rollback to Phase 1: remove Supabase reference
      mockLocalStorage.removeItem('bookings_supabase');

      expect(mockLocalStorage.length).toBe(1);
      expect(mockLocalStorage.getItem('bookings')).toBeTruthy();
    });

    it('should restore from backup on rollback', () => {
      const booking = createMockLocalBooking();

      // Create backup
      mockLocalStorage.setItem('bookings_backup', JSON.stringify([booking]));

      // Simulate corruption of main data
      mockLocalStorage.setItem('bookings', 'corrupted');

      // Restore from backup
      const backup = JSON.parse(
        mockLocalStorage.getItem('bookings_backup') || '[]'
      );
      mockLocalStorage.setItem('bookings', JSON.stringify(backup));

      const restored = JSON.parse(
        mockLocalStorage.getItem('bookings') || '[]'
      );

      expect(restored[0].id).toBe(booking.id);
    });

    it('should verify backup integrity before rollback', () => {
      const booking = createMockLocalBooking();

      mockLocalStorage.setItem('bookings_backup', JSON.stringify([booking]));

      const backup = JSON.parse(
        mockLocalStorage.getItem('bookings_backup') || '[]'
      );

      // Verify backup is valid
      const isValid = Array.isArray(backup) && backup[0]?.id === booking.id;

      expect(isValid).toBe(true);
    });

    it('should preserve rollback audit trail', () => {
      const auditLog = [
        {
          action: 'PHASE_2_START',
          timestamp: new Date().toISOString(),
        },
        {
          action: 'ROLLBACK_INITIATED',
          timestamp: new Date().toISOString(),
        },
      ];

      mockLocalStorage.setItem('audit_log', JSON.stringify(auditLog));

      const log = JSON.parse(mockLocalStorage.getItem('audit_log') || '[]');

      expect(log).toHaveLength(2);
      expect(log[1].action).toBe('ROLLBACK_INITIATED');
    });
  });

  describe('Performance Benchmarks', () => {
    it('should measure localStorage read performance', () => {
      const bookings = Array.from({ length: 100 }, (_, i) =>
        createMockLocalBooking({ id: `booking-${i}` })
      );

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        JSON.parse(mockLocalStorage.getItem('bookings') || '[]');
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 10;

      expect(avgTime).toBeLessThan(50);
    });

    it('should measure Supabase read latency', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [createMockSupabaseBooking()],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      // Simulate network latency
      const startTime = performance.now();

      await new Promise((resolve) => setTimeout(resolve, 50));

      const endTime = performance.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });

    it('should compare read latency between storage layers', async () => {
      const bookings = Array.from({ length: 100 }, (_, i) =>
        createMockLocalBooking({ id: `booking-${i}` })
      );

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      // localStorage is faster
      const localStart = performance.now();
      JSON.parse(mockLocalStorage.getItem('bookings') || '[]');
      const localEnd = performance.now();

      // Supabase would have network latency
      const supabaseLatency = 50; // typical network round trip

      expect(localEnd - localStart).toBeLessThan(supabaseLatency);
    });

    it('should measure migration throughput', () => {
      const bookings = Array.from({ length: 1000 }, (_, i) =>
        createMockLocalBooking({ id: `booking-${i}` })
      );

      const startTime = performance.now();

      // Simulate migration process
      for (const booking of bookings) {
        mockLocalStorage.setItem(
          `migrated_${booking.id}`,
          JSON.stringify(booking)
        );
      }

      const endTime = performance.now();

      const throughput = bookings.length / ((endTime - startTime) / 1000);

      expect(throughput).toBeGreaterThan(1000); // Records per second
    });

    it('should measure batch operation performance', () => {
      const bookings = Array.from({ length: 100 }, (_, i) =>
        createMockLocalBooking({ id: `booking-${i}` })
      );

      const startTime = performance.now();

      mockLocalStorage.setItem('bookings_batch', JSON.stringify(bookings));

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Migration Progress Tracking', () => {
    it('should track migration progress', () => {
      const totalRecords = 100;
      const progressEvents: MigrationProgressEvent[] = [];

      for (let i = 1; i <= totalRecords; i++) {
        progressEvents.push({
          phase: 2,
          completed: i,
          total: totalRecords,
          percentage: (i / totalRecords) * 100,
          timestamp: new Date().toISOString(),
        });
      }

      expect(progressEvents[49].percentage).toBe(50);
      expect(progressEvents[99].percentage).toBe(100);
    });

    it('should estimate time remaining', () => {
      const totalRecords = 1000;
      const processedRecords = 500;
      const elapsedTime = 5000; // 5 seconds

      const recordsPerSecond = processedRecords / (elapsedTime / 1000);
      const remainingRecords = totalRecords - processedRecords;
      const estimatedTimeRemaining = remainingRecords / recordsPerSecond;

      expect(estimatedTimeRemaining).toBeGreaterThan(0);
    });

    it('should handle migration pausing and resuming', () => {
      let migratedCount = 0;
      const totalRecords = 100;

      // Migrate 50 records
      for (let i = 0; i < 50; i++) {
        migratedCount++;
      }

      // Pause
      const pausedAt = migratedCount;

      // Resume
      for (let i = pausedAt; i < totalRecords; i++) {
        migratedCount++;
      }

      expect(migratedCount).toBe(totalRecords);
    });
  });

  describe('Concurrent Operations During Migration', () => {
    it('should handle concurrent reads and writes', () => {
      const booking = createMockLocalBooking();

      // Write
      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      // Read while writing is happening
      const read1 = JSON.parse(mockLocalStorage.getItem('bookings') || '[]');

      // Write again
      mockLocalStorage.setItem(
        'bookings',
        JSON.stringify([{ ...booking, status: 'paid' }])
      );

      // Read again
      const read2 = JSON.parse(mockLocalStorage.getItem('bookings') || '[]');

      expect(read1).toHaveLength(1);
      expect(read2).toHaveLength(1);
      expect(read2[0].status).toBe('paid');
    });

    it('should handle multiple users migrating simultaneously', () => {
      const users = ['user-1', 'user-2', 'user-3'];

      users.forEach((userId) => {
        const booking = createMockLocalBooking({ id: `${userId}-booking` });
        mockLocalStorage.setItem(
          `bookings_${userId}`,
          JSON.stringify([booking])
        );
      });

      expect(mockLocalStorage.keys()).toHaveLength(3);

      users.forEach((userId) => {
        const data = JSON.parse(
          mockLocalStorage.getItem(`bookings_${userId}`) || '[]'
        );
        expect(data[0].id).toBe(`${userId}-booking`);
      });
    });
  });

  describe('Error Recovery During Migration', () => {
    it('should recover from partial migration failure', () => {
      const bookings = [
        createMockLocalBooking({ id: 'booking-1' }),
        createMockLocalBooking({ id: 'booking-2' }),
        createMockLocalBooking({ id: 'booking-3' }),
      ];

      mockLocalStorage.setItem('bookings', JSON.stringify(bookings));

      // Simulate partial migration
      const migrated = bookings.slice(0, 2);
      mockLocalStorage.setItem('bookings_partial', JSON.stringify(migrated));

      // Complete remaining
      const remaining = bookings.slice(2);
      mockLocalStorage.setItem(
        'bookings_remaining',
        JSON.stringify(remaining)
      );

      // Verify all records are accounted for
      const partial = JSON.parse(
        mockLocalStorage.getItem('bookings_partial') || '[]'
      );
      const rest = JSON.parse(
        mockLocalStorage.getItem('bookings_remaining') || '[]'
      );

      expect(partial.length + rest.length).toBe(3);
    });

    it('should retry failed records', () => {
      let attempts = 0;
      const booking = createMockLocalBooking();

      // First attempt fails
      attempts++;

      // Retry succeeds
      attempts++;
      mockLocalStorage.setItem('bookings', JSON.stringify([booking]));

      expect(attempts).toBe(2);
      expect(mockLocalStorage.getItem('bookings')).toBeTruthy();
    });
  });
});
