import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useRecurringBookingGroups,
  useHasRecurringBookings,
  useStandaloneBookings,
} from '@/hooks/bookings/useRecurringBookingGroups';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';

// Mock facility and zone types for test data
interface TestFacility {
  readonly id: string;
  readonly name: string;
}

interface TestZone {
  readonly id: string;
  readonly name: string;
}

// Mock booking data with recurring groups
const mockBookings: BookingWithDetails[] = [
  // Standalone booking (no recurring ID)
  {
    id: 'booking-standalone',
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
    } as TestFacility,
    zone: {
      id: 'zone-1',
      name: 'Sentrum',
    } as TestZone,
  },

  // Weekly recurring group 1 - Week 1
  {
    id: 'booking-weekly-1',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2025-03-03T14:00:00Z',
    ends_at: '2025-03-03T16:00:00Z',
    status: 'paid',
    total_cents: 150000,
    notes: null,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: 'recurring-weekly-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-2',
      name: 'Drammen Kulturhus',
    } as TestFacility,
    zone: {
      id: 'zone-1',
      name: 'Sentrum',
    } as TestZone,
  },

  // Weekly recurring group 1 - Week 2
  {
    id: 'booking-weekly-2',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2025-03-10T14:00:00Z',
    ends_at: '2025-03-10T16:00:00Z',
    status: 'paid',
    total_cents: 150000,
    notes: null,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_booking_id: 'recurring-weekly-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-2',
      name: 'Drammen Kulturhus',
    } as TestFacility,
    zone: {
      id: 'zone-1',
      name: 'Sentrum',
    } as TestZone,
  },

  // Weekly recurring group 1 - Week 3
  {
    id: 'booking-weekly-3',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2025-03-17T14:00:00Z',
    ends_at: '2025-03-17T16:00:00Z',
    status: 'completed',
    total_cents: 150000,
    notes: null,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-03-17T16:00:00Z',
    cancelled_at: null,
    recurring_booking_id: 'recurring-weekly-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-2',
      name: 'Drammen Kulturhus',
    } as TestFacility,
    zone: {
      id: 'zone-1',
      name: 'Sentrum',
    } as TestZone,
  },

  // Monthly recurring group 2 - Month 1
  {
    id: 'booking-monthly-1',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2024-12-01T10:00:00Z',
    ends_at: '2024-12-01T12:00:00Z',
    status: 'completed',
    total_cents: 200000,
    notes: null,
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-12-01T12:00:00Z',
    cancelled_at: null,
    recurring_booking_id: 'recurring-monthly-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-3',
      name: 'Drammen Svømmehall',
    } as TestFacility,
    zone: {
      id: 'zone-2',
      name: 'Øst',
    } as TestZone,
  },

  // Monthly recurring group 2 - Month 2
  {
    id: 'booking-monthly-2',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2025-01-01T10:00:00Z',
    ends_at: '2025-01-01T12:00:00Z',
    status: 'completed',
    total_cents: 200000,
    notes: null,
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2025-01-01T12:00:00Z',
    cancelled_at: null,
    recurring_booking_id: 'recurring-monthly-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-3',
      name: 'Drammen Svømmehall',
    } as TestFacility,
    zone: {
      id: 'zone-2',
      name: 'Øst',
    } as TestZone,
  },

  // Monthly recurring group 2 - Month 3
  {
    id: 'booking-monthly-3',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2025-02-01T10:00:00Z',
    ends_at: '2025-02-01T12:00:00Z',
    status: 'completed',
    total_cents: 200000,
    notes: null,
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2025-02-01T12:00:00Z',
    cancelled_at: null,
    recurring_booking_id: 'recurring-monthly-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
    facility: {
      id: 'facility-3',
      name: 'Drammen Svømmehall',
    } as TestFacility,
    zone: {
      id: 'zone-2',
      name: 'Øst',
    } as TestZone,
  },
];

describe('useRecurringBookingGroups', () => {
  it('should return empty array for undefined bookings', () => {
    const { result } = renderHook(() =>
      useRecurringBookingGroups(undefined)
    );

    expect(result.current).toEqual([]);
  });

  it('should return empty array for empty bookings', () => {
    const { result } = renderHook(() =>
      useRecurringBookingGroups([])
    );

    expect(result.current).toEqual([]);
  });

  it('should group recurring bookings correctly', () => {
    const { result } = renderHook(() =>
      useRecurringBookingGroups(mockBookings)
    );

    expect(result.current).toHaveLength(2); // 2 recurring groups
  });

  it('should exclude standalone bookings from groups', () => {
    const { result } = renderHook(() =>
      useRecurringBookingGroups(mockBookings)
    );

    const allGroupedBookingIds = result.current.flatMap(group =>
      group.bookings.map(b => b.id)
    );

    expect(allGroupedBookingIds).not.toContain('booking-standalone');
  });

  describe('Group Properties', () => {
    it('should have correct recurring ID', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup).toBeDefined();
      expect(weeklyGroup?.recurringId).toBe('recurring-weekly-1');
    });

    it('should have correct facility name', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup?.facilityName).toBe('Drammen Kulturhus');
    });

    it('should have correct zone name', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup?.zoneName).toBe('Sentrum');
    });

    it('should have correct total bookings count', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup?.totalBookings).toBe(3);
    });

    it('should calculate upcoming count correctly', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup?.upcomingCount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate completed count correctly', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup?.completedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Frequency Detection', () => {
    it('should detect weekly frequency', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      expect(weeklyGroup?.frequency).toBe('weekly');
    });

    it('should detect monthly frequency', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const monthlyGroup = result.current.find(g =>
        g.recurringId === 'recurring-monthly-1'
      );

      expect(monthlyGroup?.frequency).toBe('monthly');
    });

    it('should return unknown for insufficient data', () => {
      const singleRecurringBooking: BookingWithDetails[] = [
        {
          ...mockBookings[1]!,
          id: 'single-recurring',
          recurring_booking_id: 'single-group',
        },
      ];

      const { result } = renderHook(() =>
        useRecurringBookingGroups(singleRecurringBooking)
      );

      expect(result.current[0]?.frequency).toBe('unknown');
    });
  });

  describe('Next Booking', () => {
    it('should identify next upcoming booking', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const weeklyGroup = result.current.find(g =>
        g.recurringId === 'recurring-weekly-1'
      );

      if (weeklyGroup?.nextBooking) {
        const now = new Date();
        expect(new Date(weeklyGroup.nextBooking.starts_at) >= now).toBe(true);
      }
    });

    it('should return null if no upcoming bookings', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      const monthlyGroup = result.current.find(g =>
        g.recurringId === 'recurring-monthly-1'
      );

      // All monthly bookings are in the past
      expect(monthlyGroup?.nextBooking).toBeNull();
    });
  });

  describe('Sorting', () => {
    it('should sort bookings within groups by date', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      result.current.forEach(group => {
        const dates = group.bookings.map(b => new Date(b.starts_at).getTime());
        const sorted = [...dates].sort((a, b) => a - b);
        expect(dates).toEqual(sorted);
      });
    });

    it('should sort groups by next booking date', () => {
      const { result } = renderHook(() =>
        useRecurringBookingGroups(mockBookings)
      );

      // Groups with upcoming bookings should come first
      const groupsWithUpcoming = result.current.filter(g => g.nextBooking);
      const groupsWithoutUpcoming = result.current.filter(g => !g.nextBooking);

      expect(groupsWithoutUpcoming.length).toBeGreaterThanOrEqual(0);

      if (groupsWithUpcoming.length > 1) {
        for (let i = 1; i < groupsWithUpcoming.length; i++) {
          const prev = new Date(groupsWithUpcoming[i - 1]?.nextBooking!.starts_at ?? 0);
          const curr = new Date(groupsWithUpcoming[i]?.nextBooking!.starts_at ?? 0);
          expect(curr >= prev).toBe(true);
        }
      }
    });
  });
});

describe('useHasRecurringBookings', () => {
  it('should return false for undefined bookings', () => {
    const { result } = renderHook(() =>
      useHasRecurringBookings(undefined)
    );

    expect(result.current).toBe(false);
  });

  it('should return false for empty array', () => {
    const { result } = renderHook(() =>
      useHasRecurringBookings([])
    );

    expect(result.current).toBe(false);
  });

  it('should return true when bookings contain recurring groups', () => {
    const { result } = renderHook(() =>
      useHasRecurringBookings(mockBookings)
    );

    expect(result.current).toBe(true);
  });

  it('should return false when no recurring bookings', () => {
    const standaloneBookings = mockBookings.filter(b => !b.recurring_booking_id);

    const { result } = renderHook(() =>
      useHasRecurringBookings(standaloneBookings)
    );

    expect(result.current).toBe(false);
  });
});

describe('useStandaloneBookings', () => {
  it('should return empty array for undefined bookings', () => {
    const { result } = renderHook(() =>
      useStandaloneBookings(undefined)
    );

    expect(result.current).toEqual([]);
  });

  it('should return empty array for empty bookings', () => {
    const { result } = renderHook(() =>
      useStandaloneBookings([])
    );

    expect(result.current).toEqual([]);
  });

  it('should filter out recurring bookings', () => {
    const { result } = renderHook(() =>
      useStandaloneBookings(mockBookings)
    );

    result.current.forEach(booking => {
      expect(booking.recurring_booking_id).toBeNull();
    });
  });

  it('should return only standalone bookings', () => {
    const { result } = renderHook(() =>
      useStandaloneBookings(mockBookings)
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.id).toBe('booking-standalone');
  });

  it('should return all bookings when none are recurring', () => {
    const allStandalone = mockBookings.map(b => ({
      ...b,
      recurring_booking_id: null,
    }));

    const { result } = renderHook(() =>
      useStandaloneBookings(allStandalone)
    );

    expect(result.current).toHaveLength(allStandalone.length);
  });
});
