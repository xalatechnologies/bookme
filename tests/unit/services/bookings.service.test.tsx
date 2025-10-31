import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  bookingsService,
  useUserBookings,
  useFacilityBookings,
  useCreateBooking,
  useCancelBooking,
} from '@/services/supabase/bookings.service';
import { supabase } from '@/lib/supabase';

// Type for mock Supabase response
interface MockSupabaseResponse<T> {
  readonly data: T[] | T | null;
  readonly error: { readonly message: string } | null;
}

// Type for mock booking
interface MockBooking {
  readonly id: string;
  readonly user_id: string;
  readonly facility_id: string;
  readonly status: string;
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

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

describe('Bookings Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bookingsService.getUserBookings', () => {
    it('should fetch user bookings', async () => {
      const mockBookings: MockBooking[] = [
        {
          id: '1',
          user_id: 'user-1',
          facility_id: 'facility-1',
          status: 'confirmed',
        },
        {
          id: '2',
          user_id: 'user-1',
          facility_id: 'facility-2',
          status: 'pending',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null } as MockSupabaseResponse<MockBooking>),
      });

      const result = await bookingsService.getUserBookings('user-1');

      expect(result).toEqual(mockBookings);
      expect(supabase.from).toHaveBeenCalledWith('bookings');
    });

    it('should handle errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch error' },
        } as MockSupabaseResponse<MockBooking>),
      });

      await expect(bookingsService.getUserBookings('user-1')).rejects.toThrow('Fetch error');
    });
  });

  describe('bookingsService.create', () => {
    it('should create a booking', async () => {
      interface NewBooking {
        readonly facility_id: string;
        readonly user_id: string;
        readonly start_time: string;
        readonly end_time: string;
        readonly status: 'confirmed';
        readonly total_price: number;
      }

      const newBooking: NewBooking = {
        facility_id: 'facility-1',
        user_id: 'user-1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        status: 'confirmed',
        total_price: 1000,
      };

      const createdBooking = { id: 'booking-1', ...newBooking };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdBooking, error: null }),
      });

      const result = await bookingsService.create(newBooking);

      expect(result).toEqual(createdBooking);
    });

    it('should validate time slots', async () => {
      interface InvalidBooking {
        readonly facility_id: string;
        readonly user_id: string;
        readonly start_time: string;
        readonly end_time: string;
        readonly status: 'confirmed';
        readonly total_price: number;
      }

      const invalidBooking: InvalidBooking = {
        facility_id: 'facility-1',
        user_id: 'user-1',
        start_time: '2024-01-01T12:00:00Z',
        end_time: '2024-01-01T10:00:00Z', // End before start
        status: 'confirmed',
        total_price: 1000,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid time slot' },
        }),
      });

      await expect(bookingsService.create(invalidBooking)).rejects.toThrow();
    });
  });

  describe('bookingsService.cancel', () => {
    it('should cancel a booking', async () => {
      interface CancelledBooking {
        readonly id: string;
        readonly status: string;
      }

      const cancelledBooking: CancelledBooking = {
        id: 'booking-1',
        status: 'cancelled',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: cancelledBooking, error: null }),
      });

      const result = await bookingsService.cancel('booking-1');

      expect(result.status).toBe('cancelled');
    });

    it('should not cancel past bookings', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Cannot cancel past booking' },
        }),
      });

      await expect(bookingsService.cancel('past-booking')).rejects.toThrow();
    });
  });

  describe('bookingsService.getByStatus', () => {
    it('should filter bookings by status', async () => {
      interface StatusBooking {
        readonly id: string;
        readonly status: string;
      }

      const mockBookings: StatusBooking[] = [
        { id: '1', status: 'confirmed' },
        { id: '2', status: 'confirmed' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null } as MockSupabaseResponse<StatusBooking>),
      });

      const result = await bookingsService.getByStatus('user-1', 'confirmed');

      expect(result).toEqual(mockBookings);
      expect(result.every((b: StatusBooking) => b.status === 'confirmed')).toBe(true);
    });
  });

  describe('bookingsService.checkAvailability', () => {
    it('should check facility availability', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null } as MockSupabaseResponse<unknown>),
      });

      const result = await bookingsService.checkAvailability(
        'facility-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z'
      );

      expect(result).toBe(true);
    });

    it('should detect conflicts', async () => {
      interface ConflictBooking {
        readonly id: string;
        readonly start_time: string;
      }

      const conflictingBookings: ConflictBooking[] = [
        { id: 'booking-1', start_time: '2024-01-01T11:00:00Z' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: conflictingBookings, error: null } as MockSupabaseResponse<ConflictBooking>),
      });

      const result = await bookingsService.checkAvailability(
        'facility-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z'
      );

      expect(result).toBe(false);
    });
  });
});

describe('Bookings Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserBookings', () => {
    it('should fetch user bookings', async () => {
      interface UserBooking {
        readonly id: string;
        readonly user_id: string;
      }

      const mockBookings: UserBooking[] = [
        { id: '1', user_id: 'user-1' },
        { id: '2', user_id: 'user-1' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null } as MockSupabaseResponse<UserBooking>),
      });

      const { result } = renderHook(() => useUserBookings('user-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBookings);
    });
  });

  describe('useFacilityBookings', () => {
    it('should fetch facility bookings', async () => {
      interface FacilityBooking {
        readonly id: string;
        readonly facility_id: string;
      }

      const mockBookings: FacilityBooking[] = [
        { id: '1', facility_id: 'facility-1' },
        { id: '2', facility_id: 'facility-1' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null } as MockSupabaseResponse<FacilityBooking>),
      });

      const { result } = renderHook(() => useFacilityBookings('facility-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBookings);
    });
  });

  describe('useCreateBooking', () => {
    it('should create a booking', async () => {
      interface CreateBookingInput {
        readonly facility_id: string;
        readonly user_id: string;
        readonly start_time: string;
        readonly end_time: string;
        readonly status: 'confirmed';
        readonly total_price: number;
      }

      const newBooking: CreateBookingInput = {
        facility_id: 'facility-1',
        user_id: 'user-1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        status: 'confirmed',
        total_price: 1000,
      };

      const createdBooking = { id: 'booking-1', ...newBooking };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdBooking, error: null }),
      });

      const { result } = renderHook(() => useCreateBooking(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newBooking);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(createdBooking);
    });
  });

  describe('useCancelBooking', () => {
    it('should cancel a booking', async () => {
      interface CancelledBooking {
        readonly id: string;
        readonly status: string;
      }

      const cancelledBooking: CancelledBooking = {
        id: 'booking-1',
        status: 'cancelled',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: cancelledBooking, error: null }),
      });

      const { result } = renderHook(() => useCancelBooking(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('booking-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('cancelled');
    });
  });
});
