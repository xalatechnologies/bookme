import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

/**
 * Sample facilities for E2E and integration tests
 */
export const sampleFacilities: Facility[] = [
  {
    id: 'fixture-facility-1',
    name: 'E2E Test Idrettshall',
    description: 'Modern sports hall for E2E testing with excellent facilities and equipment',
    zone_id: 'fixture-zone-1',
    capacity: 100,
    hourly_rate: 500,
    status: 'available',
    features: ['wifi', 'parking', 'accessible', 'changing_rooms', 'showers'],
    images: [
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    ],
    address: 'E2E Testveien 1, 3000 Drammen',
    latitude: 59.7410,
    longitude: 10.2044,
    opening_hours: {
      monday: '08:00-22:00',
      tuesday: '08:00-22:00',
      wednesday: '08:00-22:00',
      thursday: '08:00-22:00',
      friday: '08:00-22:00',
      saturday: '09:00-18:00',
      sunday: '10:00-16:00',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: false,
    minimum_booking_duration: 60,
    maximum_booking_duration: 480,
    cancellation_policy: 'Free cancellation up to 24 hours before booking start time',
  },
  {
    id: 'fixture-facility-2',
    name: 'E2E Test Kulturhus',
    description: 'Cultural center for events, meetings, and performances requiring approval',
    zone_id: 'fixture-zone-1',
    capacity: 200,
    hourly_rate: 750,
    status: 'available',
    features: ['wifi', 'projector', 'sound_system', 'stage', 'kitchen', 'accessible'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    ],
    address: 'E2E Kulturveien 2, 3000 Drammen',
    latitude: 59.7420,
    longitude: 10.2054,
    opening_hours: {
      monday: '09:00-21:00',
      tuesday: '09:00-21:00',
      wednesday: '09:00-21:00',
      thursday: '09:00-21:00',
      friday: '09:00-23:00',
      saturday: '10:00-23:00',
      sunday: 'closed',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: true,
    minimum_booking_duration: 120,
    maximum_booking_duration: 360,
    cancellation_policy: 'No refund within 48 hours. 50% refund between 48-72 hours.',
  },
  {
    id: 'fixture-facility-3',
    name: 'E2E Test Svømmehall',
    description: 'Public swimming pool with lanes for training and recreation',
    zone_id: 'fixture-zone-2',
    capacity: 50,
    hourly_rate: 300,
    status: 'available',
    features: ['changing_rooms', 'lockers', 'accessible', 'showers', 'lifeguard'],
    images: [
      'https://images.unsplash.com/photo-1519499772922-0b9a6f707e78',
    ],
    address: 'E2E Svømmeveien 3, 3000 Drammen',
    latitude: 59.7430,
    longitude: 10.2064,
    opening_hours: {
      monday: '06:00-20:00',
      tuesday: '06:00-20:00',
      wednesday: '06:00-20:00',
      thursday: '06:00-20:00',
      friday: '06:00-20:00',
      saturday: '08:00-18:00',
      sunday: '08:00-18:00',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: false,
    minimum_booking_duration: 30,
    maximum_booking_duration: 120,
    cancellation_policy: 'Free cancellation up to 12 hours before booking start time',
  },
  {
    id: 'fixture-facility-4',
    name: 'E2E Test Fotballbane',
    description: 'Outdoor football field with artificial turf',
    zone_id: 'fixture-zone-1',
    capacity: 50,
    hourly_rate: 400,
    status: 'available',
    features: ['parking', 'changing_rooms', 'floodlights'],
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6',
    ],
    address: 'E2E Fotballveien 4, 3000 Drammen',
    latitude: 59.7440,
    longitude: 10.2074,
    opening_hours: {
      monday: '08:00-22:00',
      tuesday: '08:00-22:00',
      wednesday: '08:00-22:00',
      thursday: '08:00-22:00',
      friday: '08:00-22:00',
      saturday: '08:00-20:00',
      sunday: '09:00-19:00',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: false,
    minimum_booking_duration: 90,
    maximum_booking_duration: 240,
    cancellation_policy: 'Free cancellation up to 24 hours before booking start time',
  },
  {
    id: 'fixture-facility-5',
    name: 'E2E Test Møterom',
    description: 'Small meeting room for up to 20 people',
    zone_id: 'fixture-zone-3',
    capacity: 20,
    hourly_rate: 200,
    status: 'available',
    features: ['wifi', 'projector', 'whiteboard', 'video_conferencing'],
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    ],
    address: 'E2E Møteveien 5, 3000 Drammen',
    latitude: 59.7450,
    longitude: 10.2084,
    opening_hours: {
      monday: '07:00-20:00',
      tuesday: '07:00-20:00',
      wednesday: '07:00-20:00',
      thursday: '07:00-20:00',
      friday: '07:00-18:00',
      saturday: 'closed',
      sunday: 'closed',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    requires_approval: false,
    minimum_booking_duration: 60,
    maximum_booking_duration: 480,
    cancellation_policy: 'Free cancellation up to 2 hours before booking start time',
  },
];

/**
 * Facility search test data
 */
export const facilitySearchData = {
  queries: [
    { query: 'idrettshall', expectedResults: ['fixture-facility-1'] },
    { query: 'kulturhus', expectedResults: ['fixture-facility-2'] },
    { query: 'svømmehall', expectedResults: ['fixture-facility-3'] },
    { query: 'fotball', expectedResults: ['fixture-facility-4'] },
    { query: 'møte', expectedResults: ['fixture-facility-5'] },
    { query: 'wifi', expectedResults: ['fixture-facility-1', 'fixture-facility-2', 'fixture-facility-5'] },
  ],
};

/**
 * Facility filter test data
 */
export const facilityFilterData = {
  byCapacity: {
    min: 100,
    expectedResults: ['fixture-facility-1', 'fixture-facility-2'],
  },
  byPrice: {
    max: 500,
    expectedResults: ['fixture-facility-1', 'fixture-facility-3', 'fixture-facility-4', 'fixture-facility-5'],
  },
  byFeature: {
    feature: 'accessible',
    expectedResults: ['fixture-facility-1', 'fixture-facility-2', 'fixture-facility-3'],
  },
  byApprovalRequired: {
    requiresApproval: true,
    expectedResults: ['fixture-facility-2'],
  },
};
