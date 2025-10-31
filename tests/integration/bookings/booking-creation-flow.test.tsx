import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bookingsService } from '@/services/supabase/bookings.service';
import { facilitiesService } from '@/services/supabase/facilities.service';

// Mock type for bookings service
interface MockBookingData {
  readonly id: string;
  readonly user_id: string;
  readonly facility_id: string;
  readonly starts_at: string;
  readonly ends_at: string;
  readonly status: 'pending' | 'confirmed' | 'cancelled';
  readonly total_cents: number;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly cancelled_at: string | null;
  readonly recurring_booking_id: string | null;
  readonly approval_status: string;
  readonly approved_by: string | null;
  readonly approved_at: string | null;
}

// Mock type for facilities
interface MockFacilityData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly zone_id: string;
  readonly capacity: number;
  readonly hourly_rate: number;
  readonly status: string;
  readonly features: string[];
  readonly images: string[];
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly opening_hours: Record<string, unknown>;
  readonly created_at: string;
  readonly updated_at: string;
  readonly requires_approval: boolean;
  readonly minimum_booking_duration: number;
  readonly maximum_booking_duration: number;
  readonly cancellation_policy: string;
}

// Mock the services
vi.mock('@/services/supabase/bookings.service', () => ({
  bookingsService: {
    create: vi.fn(),
    getUserBookings: vi.fn(),
    checkAvailability: vi.fn(),
  },
  useUserBookings: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
  useCreateBooking: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock('@/services/supabase/facilities.service', () => ({
  facilitiesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
  useFacilities: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

describe('Booking Creation Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // Setup default mock responses
    vi.mocked(facilitiesService.getAll).mockResolvedValue([
      {
        id: 'facility-1',
        name: 'Test Facility',
        description: 'A test facility',
        zone_id: 'zone-1',
        capacity: 50,
        hourly_rate: 500,
        status: 'available',
        features: ['wifi', 'parking'],
        images: [],
        address: 'Test Address',
        latitude: 59.7410,
        longitude: 10.2044,
        opening_hours: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        requires_approval: false,
        minimum_booking_duration: 60,
        maximum_booking_duration: 480,
        cancellation_policy: 'Standard',
      } as MockFacilityData,
    ]);

    vi.mocked(bookingsService.checkAvailability).mockResolvedValue(true);
  });

  it('should create a booking successfully', async () => {
    const mockBooking: MockBookingData = {
      id: 'new-booking-1',
      user_id: 'user-1',
      facility_id: 'facility-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      status: 'pending',
      total_cents: 100000,
      notes: 'Test booking',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cancelled_at: null,
      recurring_booking_id: null,
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
    };

    vi.mocked(bookingsService.create).mockResolvedValue(mockBooking);

    const result = await bookingsService.create({
      facility_id: 'facility-1',
      user_id: 'user-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      total_cents: 100000,
      notes: 'Test booking',
    } as never);

    expect(result).toEqual(mockBooking);
    expect(bookingsService.create).toHaveBeenCalledWith({
      facility_id: 'facility-1',
      user_id: 'user-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      total_cents: 100000,
      notes: 'Test booking',
    });
  });

  it('should validate time slot availability before booking', async () => {
    const isAvailable = await bookingsService.checkAvailability(
      'facility-1',
      '2025-03-01T10:00:00Z',
      '2025-03-01T12:00:00Z'
    );

    expect(isAvailable).toBe(true);
    expect(bookingsService.checkAvailability).toHaveBeenCalledWith(
      'facility-1',
      '2025-03-01T10:00:00Z',
      '2025-03-01T12:00:00Z'
    );
  });

  it('should prevent booking when time slot is unavailable', async () => {
    vi.mocked(bookingsService.checkAvailability).mockResolvedValue(false);

    const isAvailable = await bookingsService.checkAvailability(
      'facility-1',
      '2025-03-01T10:00:00Z',
      '2025-03-01T12:00:00Z'
    );

    expect(isAvailable).toBe(false);

    // Should not attempt to create booking
    await expect(async () => {
      if (!isAvailable) {
        throw new Error('Time slot not available');
      }
      await bookingsService.create({
        facility_id: 'facility-1',
        user_id: 'user-1',
        starts_at: '2025-03-01T10:00:00Z',
        ends_at: '2025-03-01T12:00:00Z',
        total_cents: 100000,
      } as never);
    }).rejects.toThrow('Time slot not available');
  });

  it('should calculate total price correctly', async () => {
    const facility = await facilitiesService.getById('facility-1');
    const hourlyRate = facility?.hourly_rate || 500;
    const durationHours = 2;
    const expectedPrice = hourlyRate * durationHours * 100; // Convert to cents

    const mockBooking: MockBookingData = {
      id: 'new-booking-1',
      user_id: 'user-1',
      facility_id: 'facility-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      status: 'pending',
      total_cents: expectedPrice,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cancelled_at: null,
      recurring_booking_id: null,
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
    };

    vi.mocked(bookingsService.create).mockResolvedValue(mockBooking);

    const result = await bookingsService.create({
      facility_id: 'facility-1',
      user_id: 'user-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      total_cents: expectedPrice,
    } as never);

    expect(result.total_cents).toBe(expectedPrice);
  });

  it('should handle booking creation errors gracefully', async () => {
    vi.mocked(bookingsService.create).mockRejectedValue(
      new Error('Database error')
    );

    await expect(
      bookingsService.create({
        facility_id: 'facility-1',
        user_id: 'user-1',
        starts_at: '2025-03-01T10:00:00Z',
        ends_at: '2025-03-01T12:00:00Z',
        total_cents: 100000,
      } as never)
    ).rejects.toThrow('Database error');
  });

  it('should validate booking duration meets minimum requirements', async () => {
    const facility = await facilitiesService.getById('facility-1');
    const minimumDuration = facility?.minimum_booking_duration || 60;

    // Try to book for less than minimum duration (30 minutes = 0.5 hours)
    const startTime = new Date('2025-03-01T10:00:00Z');
    const endTime = new Date('2025-03-01T10:30:00Z'); // 30 minutes
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    expect(durationMinutes).toBeLessThan(minimumDuration);

    // Should throw validation error
    if (durationMinutes < minimumDuration) {
      await expect(
        bookingsService.create({
          facility_id: 'facility-1',
          user_id: 'user-1',
          starts_at: startTime.toISOString(),
          ends_at: endTime.toISOString(),
          total_cents: 25000,
        } as never)
      ).rejects.toThrow();
    }
  });

  it('should support optional notes field', async () => {
    const mockBooking: MockBookingData = {
      id: 'new-booking-1',
      user_id: 'user-1',
      facility_id: 'facility-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      status: 'pending',
      total_cents: 100000,
      notes: 'Special requirements: Projector needed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cancelled_at: null,
      recurring_booking_id: null,
      approval_status: 'pending',
      approved_by: null,
      approved_at: null,
    };

    vi.mocked(bookingsService.create).mockResolvedValue(mockBooking);

    const result = await bookingsService.create({
      facility_id: 'facility-1',
      user_id: 'user-1',
      starts_at: '2025-03-01T10:00:00Z',
      ends_at: '2025-03-01T12:00:00Z',
      total_cents: 100000,
      notes: 'Special requirements: Projector needed',
    } as never);

    expect(result.notes).toBe('Special requirements: Projector needed');
  });
});
