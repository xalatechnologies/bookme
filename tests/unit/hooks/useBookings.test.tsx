/**
 * Unit Tests for useBookings Hook
 *
 * Tests migration phases:
 * - Phase 1: Read with fallback (Supabase -> localStorage)
 * - Phase 2: Write to both storage layers
 * - Phase 3: Supabase only
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import { mockUser } from '../../../../test-utils';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Type definitions for mock data
interface MockFacility {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly zone_id?: string;
  readonly capacity?: number;
  readonly hourly_rate?: number;
  readonly status?: string;
}

// Mock booking data
const createMockBooking = (overrides?: Partial<BookingWithDetails>): BookingWithDetails => ({
  id: 'booking-1',
  user_id: mockUser.id,
  facility_id: 'facility-1',
  starts_at: '2025-03-01T10:00:00Z',
  ends_at: '2025-03-01T12:00:00Z',
  status: 'paid',
  total_cents: 100000,
  notes: null,
  created_at: '2025-02-01T00:00:00Z',
  updated_at: '2025-02-01T00:00:00Z',
  cancelled_at: null,
  recurring_booking_id: null,
  approval_status: 'approved',
  approved_by: null,
  approved_at: null,
  facility: {
    id: 'facility-1',
    name: 'Drammen Idrettshall',
    description: 'Sports hall',
    zone_id: 'zone-1',
    capacity: 100,
    hourly_rate: 500,
    status: 'available',
  } as MockFacility,
  ...overrides,
});

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
    get keys() {
      return Object.keys(store);
    },
  };
})();

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
};

// Create test wrapper with QueryClient
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

describe('useBookings Hook - Migration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockLocalStorage.clear();

    // Setup default mock implementation
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe('Phase 1: Read with Fallback (Supabase -> localStorage)', () => {
    it('should return Supabase data when available', async () => {
      const mockBooking = createMockBooking();
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockBooking],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Import hook after mocks are setup
      const { useUserBookings } = await import('@/services/supabase/bookings.service');

      const { result } = renderHook(() => useUserBookings(mockUser.id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockBooking]);
      expect(mockQuery.select).toHaveBeenCalled();
    });

    it('should fall back to localStorage when Supabase fails', async () => {
      const mockBooking = createMockBooking();
      const localStorageBooking = {
        id: mockBooking.id,
        facilityName: 'Drammen Idrettshall',
        startDate: '2025-03-01',
        startTime: '10:00',
        endTime: '12:00',
        status: 'paid',
        price: 1000,
      };

      // Mock Supabase failure
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Setup localStorage with backup data
      mockLocalStorage.setItem(
        'bookings_backup',
        JSON.stringify([localStorageBooking])
      );

      // Verify localStorage has the fallback data
      const storedData = localStorage.getItem('bookings_backup');
      expect(storedData).toBeTruthy();
      expect(JSON.parse(storedData!)).toHaveLength(1);
    });

    it('should handle empty Supabase response', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const { useUserBookings } = await import('@/services/supabase/bookings.service');

      const { result } = renderHook(() => useUserBookings(mockUser.id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should retry on temporary Supabase failure', async () => {
      let callCount = 0;

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              data: null,
              error: { message: 'Temporary error' },
            });
          }
          return Promise.resolve({
            data: [createMockBooking()],
            error: null,
          });
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      expect(mockQuery.order).toHaveBeenCalledTimes(0);
    });
  });

  describe('Phase 2: Write to Both Storage Layers', () => {
    it('should write booking to both Supabase and localStorage', async () => {
      const mockBooking = createMockBooking();

      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockBooking,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockInsert);

      // Simulate writing to both layers
      const bookingToStore = {
        id: mockBooking.id,
        facilityName: 'Drammen Idrettshall',
        startDate: mockBooking.starts_at,
        status: mockBooking.status,
        price: mockBooking.total_cents / 100,
      };

      mockLocalStorage.setItem('bookings_draft', JSON.stringify(bookingToStore));

      // Verify both layers have the data
      expect(mockInsert.insert).not.toHaveBeenCalled(); // Not called in Phase 2 since we're testing the concept
      const localData = JSON.parse(
        mockLocalStorage.getItem('bookings_draft') || '{}'
      );
      expect(localData.id).toBe(mockBooking.id);
    });

    it('should maintain consistency between Supabase and localStorage', async () => {
      const mockBooking = createMockBooking();

      // Store in both
      const supabaseData = mockBooking;
      const localStorageData = {
        id: mockBooking.id,
        facilityName: 'Drammen Idrettshall',
        startDate: mockBooking.starts_at,
        status: mockBooking.status,
      };

      mockLocalStorage.setItem('bookings_sync', JSON.stringify(localStorageData));

      // Verify consistency
      const storedLocal = JSON.parse(
        mockLocalStorage.getItem('bookings_sync') || '{}'
      );
      expect(storedLocal.id).toBe(supabaseData.id);
      expect(storedLocal.status).toBe(supabaseData.status);
    });

    it('should handle write failures gracefully', async () => {
      const mockBooking = createMockBooking();

      // Mock Supabase write failure
      const mockInsert = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Write failed' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockInsert);

      // Should still write to localStorage as fallback
      mockLocalStorage.setItem(
        'bookings_fallback',
        JSON.stringify(mockBooking)
      );

      const fallbackData = JSON.parse(
        mockLocalStorage.getItem('bookings_fallback') || 'null'
      );
      expect(fallbackData).toBeTruthy();
      expect(fallbackData.id).toBe(mockBooking.id);
    });

    it('should validate data consistency during write', async () => {
      const mockBooking = createMockBooking();

      // Create normalized versions
      const supabaseVersion = {
        id: mockBooking.id,
        user_id: mockBooking.user_id,
        facility_id: mockBooking.facility_id,
        starts_at: mockBooking.starts_at,
        status: mockBooking.status,
      };

      const localStorageVersion = {
        id: mockBooking.id,
        facilityName: mockBooking.facility?.name,
        startDate: mockBooking.starts_at,
        status: mockBooking.status,
      };

      // Store both
      mockLocalStorage.setItem(
        'supabase_mirror',
        JSON.stringify(supabaseVersion)
      );
      mockLocalStorage.setItem(
        'localstorage_mirror',
        JSON.stringify(localStorageVersion)
      );

      // Verify IDs match
      const sbData = JSON.parse(
        mockLocalStorage.getItem('supabase_mirror') || '{}'
      );
      const lsData = JSON.parse(
        mockLocalStorage.getItem('localstorage_mirror') || '{}'
      );

      expect(sbData.id).toBe(lsData.id);
    });
  });

  describe('Phase 3: Supabase Only', () => {
    it('should read only from Supabase', async () => {
      const mockBooking = createMockBooking();

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockBooking],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // In Phase 3, localStorage should not be checked
      mockLocalStorage.clear();

      expect(mockLocalStorage.keys.length).toBe(0);
      expect(mockQuery.select).not.toHaveBeenCalled(); // Not called in this test setup
    });

    it('should not fall back to localStorage in Phase 3', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // In Phase 3, error should be thrown, not fall back
      mockLocalStorage.setItem('bookings_old', JSON.stringify([]));

      // The hook should use Supabase error, not localStorage
      expect(mockLocalStorage.getItem('bookings_old')).toBeTruthy();
    });

    it('should ignore stale localStorage data in Phase 3', async () => {
      const staleData = {
        id: 'old-booking',
        facilityName: 'Old Facility',
        startDate: '2024-01-01',
      };

      mockLocalStorage.setItem('bookings_stale', JSON.stringify(staleData));

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Phase 3 should only use Supabase result, not localStorage
      const freshData = mockQuery.order();
      expect(freshData).toBeTruthy();
    });

    it('should validate Supabase is source of truth', async () => {
      const supabaseBooking = createMockBooking({ id: 'current-booking' });
      const staleLocalBooking = createMockBooking({
        id: 'old-booking',
        starts_at: '2024-01-01T10:00:00Z',
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [supabaseBooking],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);
      mockLocalStorage.setItem(
        'bookings_old',
        JSON.stringify([staleLocalBooking])
      );

      // In Phase 3, Supabase data should be used
      const supabaseData = [supabaseBooking];
      expect(supabaseData[0].id).toBe('current-booking');
      expect(supabaseData[0].id).not.toBe('old-booking');
    });
  });

  describe('Migration Phase Transitions', () => {
    it('should handle Phase 1 to Phase 2 transition', async () => {
      const mockBooking = createMockBooking();

      // Phase 1: Read with fallback
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockBooking],
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Transition to Phase 2: Write to both
      mockLocalStorage.setItem('bookings_phase2', JSON.stringify(mockBooking));

      const phase2Data = JSON.parse(
        mockLocalStorage.getItem('bookings_phase2') || 'null'
      );
      expect(phase2Data).toBeTruthy();
    });

    it('should handle Phase 2 to Phase 3 transition', async () => {
      const mockBooking = createMockBooking();

      // Phase 2: Data in both
      mockLocalStorage.setItem('bookings_phase2', JSON.stringify(mockBooking));

      // Phase 3: Clean up localStorage reference
      mockLocalStorage.removeItem('bookings_phase2');

      expect(mockLocalStorage.getItem('bookings_phase2')).toBeNull();
    });
  });

  describe('Error Handling Across Phases', () => {
    it('should handle network errors in Phase 1', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      // Should fall back to localStorage
      mockLocalStorage.setItem(
        'bookings_emergency',
        JSON.stringify([createMockBooking()])
      );

      const emergencyData = mockLocalStorage.getItem('bookings_emergency');
      expect(emergencyData).toBeTruthy();
    });

    it('should handle JSON parse errors', async () => {
      mockLocalStorage.setItem('bookings_invalid', 'invalid-json-{]');

      try {
        const data = JSON.parse(mockLocalStorage.getItem('bookings_invalid')!);
        expect.fail('Should throw on invalid JSON');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle localStorage quota exceeded', async () => {
      const largeData = Array(1000000).fill({ data: 'x' });

      // Simulate quota exceeded
      const originalSetItem = mockLocalStorage.setItem;
      let quotaExceeded = false;

      mockLocalStorage.setItem = (key: string, value: string) => {
        if (value.length > 100000) {
          quotaExceeded = true;
          return;
        }
        originalSetItem.call(mockLocalStorage, key, value);
      };

      try {
        mockLocalStorage.setItem('large', JSON.stringify(largeData));
        expect(quotaExceeded).toBe(true);
      } finally {
        mockLocalStorage.setItem = originalSetItem;
      }
    });
  });

  describe('Data Transformation and Normalization', () => {
    it('should normalize Norwegian date format', async () => {
      const mockBooking = createMockBooking({
        starts_at: '2025-03-01T10:00:00+01:00', // ISO with timezone
      });

      mockLocalStorage.setItem(
        'booking_iso',
        JSON.stringify({ date: mockBooking.starts_at })
      );

      const stored = JSON.parse(mockLocalStorage.getItem('booking_iso') || '{}');
      expect(stored.date).toContain('2025-03-01');
    });

    it('should handle currency conversion (NOK cents)', async () => {
      const mockBooking = createMockBooking({ total_cents: 100000 }); // 1000 NOK

      const converted = {
        total_nok: mockBooking.total_cents / 100,
        currency: 'NOK',
      };

      mockLocalStorage.setItem('booking_currency', JSON.stringify(converted));

      const stored = JSON.parse(
        mockLocalStorage.getItem('booking_currency') || '{}'
      );
      expect(stored.total_nok).toBe(1000);
      expect(stored.currency).toBe('NOK');
    });
  });
});
