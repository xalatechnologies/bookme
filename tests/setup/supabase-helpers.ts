import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Insert'];
type Booking = Database['public']['Tables']['bookings']['Insert'];

/**
 * Clean all test data from database
 */
export const cleanupTestData = async () => {
  const testOrgId = process.env.TEST_ORG_ID!;

  try {
    // Delete in reverse dependency order
    await supabase.from('notifications').delete().eq('org_id', testOrgId);
    await supabase.from('support_ticket_messages').delete();
    await supabase.from('support_tickets').delete().eq('org_id', testOrgId);
    await supabase.from('message_attachments').delete();
    await supabase.from('messages').delete();
    await supabase.from('message_threads').delete();
    await supabase.from('recurring_booking_occurrences').delete();
    await supabase.from('recurring_bookings').delete().eq('org_id', testOrgId);
    await supabase.from('group_booking_members').delete();
    await supabase.from('group_bookings').delete().eq('org_id', testOrgId);
    await supabase.from('additional_services').delete();
    await supabase.from('bookings').delete();
    await supabase.from('favorites').delete();
    await supabase.from('zones').delete();
    await supabase.from('facilities').delete().eq('org_id', testOrgId);

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
};

/**
 * Create test facility
 */
export const createTestFacility = async (overrides: Partial<Facility> = {}) => {
  const facility: Facility = {
    org_id: process.env.TEST_ORG_ID!,
    name: 'Test Facility',
    description: 'A test facility for E2E testing',
    address: '123 Test Street, Test City',
    type: 'sports',
    status: 'published',
    capacity: 50,
    price_per_hour: 500,
    amenities: ['WiFi', 'Parking', 'AC'],
    images: ['https://via.placeholder.com/800x600'],
    ...overrides,
  };

  const { data, error } = await supabase
    .from('facilities')
    .insert(facility)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create test booking
 */
export const createTestBooking = async (
  facilityId: string,
  userId: string,
  overrides: Partial<Booking> = {}
) => {
  const booking: Booking = {
    facility_id: facilityId,
    user_id: userId,
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // 2 hours
    status: 'confirmed',
    total_price: 1000,
    ...overrides,
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create test user
 */
export const createTestUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        org_id: process.env.TEST_ORG_ID!,
      },
    },
  });

  if (error) throw error;
  return data.user;
};

/**
 * Wait for real-time update
 */
export const waitForRealtimeUpdate = (ms = 2000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Seed test data
 */
export const seedTestData = async () => {
  console.log('🌱 Seeding test data...');

  try {
    // Create test facilities
    const facilities = await Promise.all([
      createTestFacility({
        name: 'Sports Center',
        type: 'sports',
        capacity: 100,
      }),
      createTestFacility({
        name: 'Conference Hall',
        type: 'conference',
        capacity: 50,
      }),
      createTestFacility({
        name: 'Music Studio',
        type: 'studio',
        capacity: 20,
      }),
    ]);

    console.log('✅ Test data seeded:', {
      facilities: facilities.length,
    });

    return { facilities };
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
};
