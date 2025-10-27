import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Facility = Database['public']['Tables']['facilities']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

/**
 * Mock bookings for testing
 */
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    user_id: 'user-1',
    facility_id: 'facility-1',
    starts_at: '2025-02-01T10:00:00Z',
    ends_at: '2025-02-01T12:00:00Z',
    status: 'paid',
    total_price: 1000,
    notes: 'Test booking 1',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-2',
    user_id: 'user-1',
    facility_id: 'facility-2',
    starts_at: '2025-02-02T14:00:00Z',
    ends_at: '2025-02-02T16:00:00Z',
    status: 'pending',
    total_price: 1500,
    notes: 'Test booking 2',
    created_at: '2025-01-16T00:00:00Z',
    updated_at: '2025-01-16T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: null,
    approval_status: 'pending',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-3',
    user_id: 'user-2',
    facility_id: 'facility-1',
    starts_at: '2025-02-03T09:00:00Z',
    ends_at: '2025-02-03T11:00:00Z',
    status: 'cancelled',
    total_price: 1000,
    notes: 'Cancelled booking',
    created_at: '2025-01-17T00:00:00Z',
    updated_at: '2025-01-18T00:00:00Z',
    cancelled_at: '2025-01-18T00:00:00Z',
    recurring_group_id: null,
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'booking-4',
    user_id: 'user-1',
    facility_id: 'facility-3',
    starts_at: '2025-02-05T10:00:00Z',
    ends_at: '2025-02-05T12:00:00Z',
    status: 'paid',
    total_price: 2000,
    notes: 'Recurring booking',
    created_at: '2025-01-19T00:00:00Z',
    updated_at: '2025-01-19T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: 'group-1',
    approval_status: 'approved',
    approved_by: null,
    approved_at: null,
  },
];

/**
 * Mock facilities for testing
 */
export const mockFacilities: Facility[] = [
  {
    id: 'facility-1',
    name: 'Drammen Idrettshall',
    description: 'Modern sports hall with excellent facilities',
    zone_id: 'zone-1',
    capacity: 100,
    hourly_rate: 500,
    status: 'available',
    features: ['wifi', 'parking', 'accessible'],
    images: ['https://example.com/image1.jpg'],
    address: 'Idrettsveien 1, 3000 Drammen',
    latitude: 59.7410,
    longitude: 10.2044,
    opening_hours: { monday: '08:00-22:00', tuesday: '08:00-22:00' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: false,
    minimum_booking_duration: 60,
    maximum_booking_duration: 480,
    cancellation_policy: 'Free cancellation up to 24 hours before',
  },
  {
    id: 'facility-2',
    name: 'Drammen Kulturhus',
    description: 'Cultural center for events and meetings',
    zone_id: 'zone-1',
    capacity: 200,
    hourly_rate: 750,
    status: 'available',
    features: ['wifi', 'projector', 'sound_system'],
    images: ['https://example.com/image2.jpg'],
    address: 'Kulturveien 2, 3000 Drammen',
    latitude: 59.7420,
    longitude: 10.2054,
    opening_hours: { monday: '09:00-21:00', tuesday: '09:00-21:00' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: true,
    minimum_booking_duration: 120,
    maximum_booking_duration: 360,
    cancellation_policy: 'No refund within 48 hours',
  },
  {
    id: 'facility-3',
    name: 'Drammen Svømmehall',
    description: 'Public swimming pool',
    zone_id: 'zone-2',
    capacity: 50,
    hourly_rate: 300,
    status: 'available',
    features: ['changing_rooms', 'lockers', 'accessible'],
    images: ['https://example.com/image3.jpg'],
    address: 'Svømmeveien 3, 3000 Drammen',
    latitude: 59.7430,
    longitude: 10.2064,
    opening_hours: { monday: '06:00-20:00', tuesday: '06:00-20:00' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: false,
    minimum_booking_duration: 30,
    maximum_booking_duration: 120,
    cancellation_policy: 'Free cancellation up to 12 hours before',
  },
];

/**
 * Mock users for testing
 */
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'test.user@drammen.kommune.no',
    role: 'user',
    full_name: 'Test User',
    phone: '+4712345678',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    preferences: null,
    last_login: '2025-01-27T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'another.user@drammen.kommune.no',
    role: 'user',
    full_name: 'Another User',
    phone: '+4787654321',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    avatar_url: null,
    preferences: null,
    last_login: '2025-01-26T00:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@drammen.kommune.no',
    role: 'admin',
    full_name: 'Admin User',
    phone: '+4700000000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    preferences: null,
    last_login: '2025-01-27T00:00:00Z',
  },
];

/**
 * Mock messages for testing
 */
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    booking_id: 'booking-1',
    sender_id: 'user-1',
    receiver_id: 'admin-1',
    content: 'Test message content',
    read: false,
    created_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'msg-2',
    booking_id: 'booking-1',
    sender_id: 'admin-1',
    receiver_id: 'user-1',
    content: 'Reply message content',
    read: true,
    created_at: '2025-01-20T10:30:00Z',
  },
];

/**
 * Mock notifications for testing
 */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your booking has been confirmed',
    read: false,
    data: { booking_id: 'booking-1' },
    created_at: '2025-01-20T12:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    type: 'reminder',
    title: 'Booking Reminder',
    message: 'Your booking is tomorrow',
    read: true,
    data: { booking_id: 'booking-1' },
    created_at: '2025-01-31T12:00:00Z',
  },
];

/**
 * Factory function to create a mock booking
 */
export const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
  id: `booking-${Date.now()}`,
  user_id: 'user-1',
  facility_id: 'facility-1',
  starts_at: '2025-02-10T10:00:00Z',
  ends_at: '2025-02-10T12:00:00Z',
  status: 'pending',
  total_price: 1000,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  cancelled_at: null,
  recurring_group_id: null,
  approval_status: 'pending',
  approved_by: null,
  approved_at: null,
  ...overrides,
});

/**
 * Factory function to create a mock facility
 */
export const createMockFacility = (overrides?: Partial<Facility>): Facility => ({
  id: `facility-${Date.now()}`,
  name: 'Test Facility',
  description: 'A test facility',
  zone_id: 'zone-1',
  capacity: 50,
  hourly_rate: 500,
  status: 'available',
  features: ['wifi'],
  images: [],
  address: 'Test Address',
  latitude: 59.7410,
  longitude: 10.2044,
  opening_hours: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  requires_approval: false,
  minimum_booking_duration: 60,
  maximum_booking_duration: 480,
  cancellation_policy: 'Standard policy',
  ...overrides,
});
