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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Bookings Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bookingsService.getUserBookings', () => {
    it('should fetch user bookings', async () => {
      const mockBookings = [
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

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
      });

      const result = await bookingsService.getUserBookings('user-1');

      expect(result).toEqual(mockBookings);
      expect(supabase.from).toHaveBeenCalledWith('bookings');
    });

    it('should handle errors', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch error' },
        }),
      });

      await expect(bookingsService.getUserBookings('user-1')).rejects.toThrow('Fetch error');
    });
  });

  describe('bookingsService.create', () => {
    it('should create a booking', async () => {
      const newBooking = {
        facility_id: 'facility-1',
        user_id: 'user-1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        status: 'confirmed' as const,
        total_price: 1000,
      };

      const createdBooking = { id: 'booking-1', ...newBooking };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdBooking, error: null }),
      });

      const result = await bookingsService.create(newBooking);

      expect(result).toEqual(createdBooking);
    });

    it('should validate time slots', async () => {
      const invalidBooking = {
        facility_id: 'facility-1',
        user_id: 'user-1',
        start_time: '2024-01-01T12:00:00Z',
        end_time: '2024-01-01T10:00:00Z', // End before start
        status: 'confirmed' as const,
        total_price: 1000,
      };

      (supabase.from as any).mockReturnValue({
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
      const cancelledBooking = {
        id: 'booking-1',
        status: 'cancelled',
      };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: cancelledBooking, error: null }),
      });

      const result = await bookingsService.cancel('booking-1');

      expect(result.status).toBe('cancelled');
    });

    it('should not cancel past bookings', async () => {
      (supabase.from as any).mockReturnValue({
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
      const mockBookings = [
        { id: '1', status: 'confirmed' },
        { id: '2', status: 'confirmed' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
      });

      const result = await bookingsService.getByStatus('user-1', 'confirmed');

      expect(result).toEqual(mockBookings);
      expect(result.every(b => b.status === 'confirmed')).toBe(true);
    });
  });

  describe('bookingsService.checkAvailability', () => {
    it('should check facility availability', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await bookingsService.checkAvailability(
        'facility-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z'
      );

      expect(result).toBe(true);
    });

    it('should detect conflicts', async () => {
      const conflictingBookings = [
        { id: 'booking-1', start_time: '2024-01-01T11:00:00Z' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: conflictingBookings, error: null }),
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
      const mockBookings = [
        { id: '1', user_id: 'user-1' },
        { id: '2', user_id: 'user-1' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
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
      const mockBookings = [
        { id: '1', facility_id: 'facility-1' },
        { id: '2', facility_id: 'facility-1' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
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
      const newBooking = {
        facility_id: 'facility-1',
        user_id: 'user-1',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        status: 'confirmed' as const,
        total_price: 1000,
      };

      const createdBooking = { id: 'booking-1', ...newBooking };

      (supabase.from as any).mockReturnValue({
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
      const cancelledBooking = {
        id: 'booking-1',
        status: 'cancelled',
      };

      (supabase.from as any).mockReturnValue({
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
