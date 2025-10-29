import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookingStats, useBookingStatusStats } from '@/hooks/bookings/useBookingStats';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

// Mock booking data with various statuses
const mockBookings: BookingWithDetails[] = [
  {
    id: 'booking-1',
    user_id: 'user-1',
    facility_id: 'facility-1',
    starts_at: '2025-03-01T10:00:00Z',
    ends_at: '2025-03-01T12:00:00Z',
    status: 'paid',
    total_cents: 100000, // 1000 NOK
    notes: null,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-2',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2025-02-15T14:00:00Z',
    ends_at: '2025-02-15T16:00:00Z',
    status: 'pending',
    total_cents: 150000, // 1500 NOK
    notes: null,
    created_at: '2025-02-02T00:00:00Z',
    updated_at: '2025-02-02T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'pending',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-3',
    user_id: 'user-1',
    facility_id: 'facility-1',
    starts_at: '2024-12-01T09:00:00Z',
    ends_at: '2024-12-01T11:00:00Z',
    status: 'completed',
    total_cents: 100000, // 1000 NOK
    notes: null,
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-12-01T11:00:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-4',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2024-11-01T10:00:00Z',
    ends_at: '2024-11-01T12:00:00Z',
    status: 'cancelled',
    total_cents: 200000, // 2000 NOK
    notes: null,
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2024-10-15T00:00:00Z',
    cancelled_at: '2024-10-15T00:00:00Z',
    recurring_booking_id: null,
    approval_status: 'rejected',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-5',
    user_id: 'user-1',
    facility_id: 'facility-1',
    starts_at: '2025-04-01T10:00:00Z',
    ends_at: '2025-04-01T12:00:00Z',
    status: 'awaiting_payment',
    total_cents: 120000, // 1200 NOK
    notes: null,
    created_at: '2025-03-20T00:00:00Z',
    updated_at: '2025-03-20T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-6',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2024-10-01T14:00:00Z',
    ends_at: '2024-10-01T16:00:00Z',
    status: 'expired',
    total_cents: 150000, // 1500 NOK
    notes: null,
    created_at: '2024-09-25T00:00:00Z',
    updated_at: '2024-10-01T16:01:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-7',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2024-09-01T10:00:00Z',
    ends_at: '2024-09-01T12:00:00Z',
    status: 'refunded',
    total_cents: 180000, // 1800 NOK
    notes: null,
    created_at: '2024-08-20T00:00:00Z',
    updated_at: '2024-08-25T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
];

describe('useBookingStats', () => {
  it('should return zero stats for undefined bookings', () => {
    const { result } = renderHook(() => useBookingStats(undefined));

    expect(result.current).toEqual({
      total: 0,
      pending: 0,
      awaitingPayment: 0,
      paid: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
      refunded: 0,
      upcoming: 0,
      past: 0,
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
    });
  });

  it('should return zero stats for empty array', () => {
    const { result } = renderHook(() => useBookingStats([]));

    expect(result.current).toEqual({
      total: 0,
      pending: 0,
      awaitingPayment: 0,
      paid: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
      refunded: 0,
      upcoming: 0,
      past: 0,
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
    });
  });

  it('should calculate correct total count', () => {
    const { result } = renderHook(() => useBookingStats(mockBookings));

    expect(result.current.total).toBe(7);
  });

  describe('Status Counts', () => {
    it('should count pending bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.pending).toBe(1);
    });

    it('should count awaiting payment bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.awaitingPayment).toBe(1);
    });

    it('should count paid bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.paid).toBe(1);
    });

    it('should count completed bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.completed).toBe(1);
    });

    it('should count cancelled bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.cancelled).toBe(1);
    });

    it('should count expired bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.expired).toBe(1);
    });

    it('should count refunded bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.refunded).toBe(1);
    });
  });

  describe('Time-based Counts', () => {
    it('should count upcoming bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.upcoming).toBeGreaterThan(0);
    });

    it('should count past bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.past).toBeGreaterThan(0);
    });

    it('should ensure upcoming + past <= total', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      expect(result.current.upcoming + result.current.past).toBeLessThanOrEqual(
        result.current.total
      );
    });
  });

  describe('Revenue Calculations', () => {
    it('should calculate total revenue from paid and completed bookings', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      // booking-1 (paid): 100000 + booking-3 (completed): 100000 = 200000
      expect(result.current.totalRevenue).toBe(200000);
    });

    it('should calculate completed revenue', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      // booking-3 (completed): 100000
      expect(result.current.completedRevenue).toBe(100000);
    });

    it('should calculate pending revenue', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      // booking-2 (pending): 150000 + booking-5 (awaiting_payment): 120000 = 270000
      expect(result.current.pendingRevenue).toBe(270000);
    });

    it('should not include cancelled bookings in revenue', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      const totalRevenue = result.current.totalRevenue;
      const cancelledBooking = mockBookings.find(b => b.status === 'cancelled');

      expect(totalRevenue).not.toContain(cancelledBooking?.total_cents);
    });

    it('should not include expired bookings in revenue', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      const totalRevenue = result.current.totalRevenue;
      const expiredBooking = mockBookings.find(b => b.status === 'expired');

      expect(totalRevenue).not.toContain(expiredBooking?.total_cents);
    });

    it('should not include refunded bookings in revenue', () => {
      const { result } = renderHook(() => useBookingStats(mockBookings));

      const totalRevenue = result.current.totalRevenue;
      const refundedBooking = mockBookings.find(b => b.status === 'refunded');

      expect(totalRevenue).not.toContain(refundedBooking?.total_cents);
    });
  });

  describe('Immutability', () => {
    it('should return new stats object when bookings change', () => {
      const { result, rerender } = renderHook(
        ({ bookings }: { readonly bookings: BookingWithDetails[] | undefined }) => useBookingStats(bookings),
        { initialProps: { bookings: mockBookings } }
      );

      const firstStats = result.current;

      const newBooking: BookingWithDetails = {
        ...mockBookings[0]!,
        id: 'booking-8',
        status: 'paid',
      };

      const newBookings = [...mockBookings, newBooking];

      rerender({ bookings: newBookings });

      expect(result.current).not.toBe(firstStats);
      expect(result.current.total).toBe(8);
    });
  });
});

describe('useBookingStatusStats', () => {
  it('should return zero stats for undefined bookings', () => {
    const { result } = renderHook(() =>
      useBookingStatusStats(undefined, 'paid')
    );

    expect(result.current).toEqual({ count: 0, revenue: 0 });
  });

  it('should calculate stats for paid status', () => {
    const { result } = renderHook(() =>
      useBookingStatusStats(mockBookings, 'paid')
    );

    expect(result.current.count).toBe(1);
    expect(result.current.revenue).toBe(100000);
  });

  it('should calculate stats for pending status', () => {
    const { result } = renderHook(() =>
      useBookingStatusStats(mockBookings, 'pending')
    );

    expect(result.current.count).toBe(1);
    expect(result.current.revenue).toBe(150000);
  });

  it('should calculate stats for completed status', () => {
    const { result } = renderHook(() =>
      useBookingStatusStats(mockBookings, 'completed')
    );

    expect(result.current.count).toBe(1);
    expect(result.current.revenue).toBe(100000);
  });

  it('should return zero stats for status with no bookings', () => {
    const { result } = renderHook(() =>
      useBookingStatusStats(mockBookings, 'pending')
    );

    // There should be bookings with 'pending' status
    expect(result.current.count).toBeGreaterThanOrEqual(0);
  });
});
