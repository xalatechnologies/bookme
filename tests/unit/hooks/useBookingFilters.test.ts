import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookingFilters } from '@/hooks/bookings/useBookingFilters';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

// Mock booking data
const mockBookings: BookingWithDetails[] = [
  {
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
    } as any,
  },
  {
    id: 'booking-2',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2025-02-15T14:00:00Z',
    ends_at: '2025-02-15T16:00:00Z',
    status: 'pending',
    total_cents: 150000,
    notes: null,
    created_at: '2025-02-02T00:00:00Z',
    updated_at: '2025-02-02T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: null,
    approval_status: 'pending',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-2',
      name: 'Drammen Kulturhus',
      description: 'Cultural center',
      zone_id: 'zone-1',
      capacity: 200,
      hourly_rate: 750,
      status: 'available',
    } as any,
  },
  {
    id: 'booking-3',
    user_id: 'user-1',
    facility_id: 'facility-1',
    starts_at: '2024-12-01T09:00:00Z',
    ends_at: '2024-12-01T11:00:00Z',
    status: 'completed',
    total_cents: 100000,
    notes: null,
    created_at: '2024-11-15T00:00:00Z',
    updated_at: '2024-12-01T11:00:00Z',
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
    } as any,
  },
  {
    id: 'booking-4',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2025-04-01T10:00:00Z',
    ends_at: '2025-04-01T12:00:00Z',
    status: 'cancelled',
    total_cents: 200000,
    notes: null,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-15T00:00:00Z',
    cancelled_at: '2025-03-15T00:00:00Z',
    recurring_booking_id: null,
    approval_status: 'rejected',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-3',
      name: 'Drammen Svømmehall',
      description: 'Swimming pool',
      zone_id: 'zone-2',
      capacity: 50,
      hourly_rate: 300,
      status: 'available',
    } as any,
  },
];

describe('useBookingFilters', () => {
  it('should return all bookings when no filters applied', () => {
    const { result } = renderHook(() =>
      useBookingFilters(mockBookings, {})
    );

    expect(result.current).toHaveLength(4);
  });

  it('should return empty array when bookings is undefined', () => {
    const { result } = renderHook(() =>
      useBookingFilters(undefined, {})
    );

    expect(result.current).toEqual([]);
  });

  describe('Status Filter', () => {
    it('should filter by paid status', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { status: 'paid' })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].status).toBe('paid');
    });

    it('should filter by pending status', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { status: 'pending' })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].status).toBe('pending');
    });

    it('should filter by completed status', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { status: 'completed' })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].status).toBe('completed');
    });

    it('should return all when status is "all"', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { status: 'all' })
      );

      expect(result.current).toHaveLength(4);
    });
  });

  describe('Facility Filter', () => {
    it('should filter by facility ID', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { facilityId: 'facility-1' })
      );

      expect(result.current).toHaveLength(2);
      expect(result.current.every(b => b.facility_id === 'facility-1')).toBe(true);
    });

    it('should return empty array for non-existent facility', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { facilityId: 'non-existent' })
      );

      expect(result.current).toHaveLength(0);
    });
  });

  describe('Date Range Filter', () => {
    it('should filter upcoming bookings', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { dateRange: 'upcoming' })
      );

      const now = new Date();
      result.current.forEach(booking => {
        expect(new Date(booking.starts_at) >= now).toBe(true);
      });
    });

    it('should filter past bookings', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { dateRange: 'past' })
      );

      const now = new Date();
      result.current.forEach(booking => {
        expect(new Date(booking.ends_at) < now).toBe(true);
      });
    });

    it('should return all when dateRange is "all"', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { dateRange: 'all' })
      );

      expect(result.current).toHaveLength(4);
    });
  });

  describe('Search Filter', () => {
    it('should filter by facility name', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { search: 'Drammen' })
      );

      expect(result.current.length).toBeGreaterThan(0);
      result.current.forEach(booking => {
        expect(
          booking.facility?.name?.toLowerCase().includes('drammen')
        ).toBe(true);
      });
    });

    it('should filter by booking ID', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { search: 'booking-1' })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].id).toBe('booking-1');
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { search: 'DRAMMEN' })
      );

      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should return empty array when no match', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { search: 'nonexistent' })
      );

      expect(result.current).toHaveLength(0);
    });
  });

  describe('Sorting', () => {
    it('should sort by date ascending', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { sortBy: 'date-asc' })
      );

      const dates = result.current.map(b => new Date(b.starts_at).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
    });

    it('should sort by date descending', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { sortBy: 'date-desc' })
      );

      const dates = result.current.map(b => new Date(b.starts_at).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    });

    it('should sort by price ascending', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { sortBy: 'price-asc' })
      );

      const prices = result.current.map(b => b.total_cents);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('should sort by price descending', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { sortBy: 'price-desc' })
      );

      const prices = result.current.map(b => b.total_cents);
      const sorted = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sorted);
    });

    it('should sort by created date', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, { sortBy: 'created' })
      );

      const dates = result.current.map(b => new Date(b.created_at).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters together', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, {
          status: 'paid',
          facilityId: 'facility-1',
          sortBy: 'date-desc',
        })
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].status).toBe('paid');
      expect(result.current[0].facility_id).toBe('facility-1');
    });

    it('should filter and sort correctly', () => {
      const { result } = renderHook(() =>
        useBookingFilters(mockBookings, {
          dateRange: 'upcoming',
          sortBy: 'date-asc',
        })
      );

      const now = new Date();
      result.current.forEach(booking => {
        expect(new Date(booking.starts_at) >= now).toBe(true);
      });

      const dates = result.current.map(b => new Date(b.starts_at).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
    });
  });
});
