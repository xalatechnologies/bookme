import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];

/**
 * Sample bookings for E2E and integration tests
 */
export const sampleBookings: Booking[] = [
  {
    id: 'fixture-booking-1',
    user_id: 'fixture-user-1',
    facility_id: 'fixture-facility-1',
    starts_at: '2025-03-01T10:00:00+01:00',
    ends_at: '2025-03-01T12:00:00+01:00',
    status: 'paid',
    total_price: 1000,
    notes: 'E2E test booking - confirmed',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: null,
    approval_status: 'approved',
    approved_by: 'fixture-admin-1',
    approved_at: '2025-02-01T01:00:00Z',
  },
  {
    id: 'fixture-booking-2',
    user_id: 'fixture-user-1',
    facility_id: 'fixture-facility-2',
    starts_at: '2025-03-05T14:00:00+01:00',
    ends_at: '2025-03-05T16:00:00+01:00',
    status: 'pending',
    total_price: 1500,
    notes: 'E2E test booking - pending payment',
    created_at: '2025-02-02T00:00:00Z',
    updated_at: '2025-02-02T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: null,
    approval_status: 'pending',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'fixture-booking-3',
    user_id: 'fixture-user-2',
    facility_id: 'fixture-facility-1',
    starts_at: '2025-03-10T09:00:00+01:00',
    ends_at: '2025-03-10T11:00:00+01:00',
    status: 'cancelled',
    total_price: 1000,
    notes: 'E2E test booking - cancelled',
    created_at: '2025-02-03T00:00:00Z',
    updated_at: '2025-02-04T00:00:00Z',
    cancelled_at: '2025-02-04T00:00:00Z',
    recurring_group_id: null,
    approval_status: 'approved',
    approved_by: 'fixture-admin-1',
    approved_at: '2025-02-03T01:00:00Z',
  },
  {
    id: 'fixture-booking-recurring-1',
    user_id: 'fixture-user-1',
    facility_id: 'fixture-facility-3',
    starts_at: '2025-03-01T10:00:00+01:00',
    ends_at: '2025-03-01T12:00:00+01:00',
    status: 'paid',
    total_price: 2000,
    notes: 'Recurring booking - Week 1',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: 'fixture-recurring-group-1',
    approval_status: 'approved',
    approved_by: 'fixture-admin-1',
    approved_at: '2025-02-01T01:00:00Z',
  },
  {
    id: 'fixture-booking-recurring-2',
    user_id: 'fixture-user-1',
    facility_id: 'fixture-facility-3',
    starts_at: '2025-03-08T10:00:00+01:00',
    ends_at: '2025-03-08T12:00:00+01:00',
    status: 'paid',
    total_price: 2000,
    notes: 'Recurring booking - Week 2',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: 'fixture-recurring-group-1',
    approval_status: 'approved',
    approved_by: 'fixture-admin-1',
    approved_at: '2025-02-01T01:00:00Z',
  },
  {
    id: 'fixture-booking-recurring-3',
    user_id: 'fixture-user-1',
    facility_id: 'fixture-facility-3',
    starts_at: '2025-03-15T10:00:00+01:00',
    ends_at: '2025-03-15T12:00:00+01:00',
    status: 'paid',
    total_price: 2000,
    notes: 'Recurring booking - Week 3',
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: 'fixture-recurring-group-1',
    approval_status: 'approved',
    approved_by: 'fixture-admin-1',
    approved_at: '2025-02-01T01:00:00Z',
  },
];

/**
 * Sample pending approval bookings for admin E2E tests
 */
export const pendingApprovalBookings: Booking[] = [
  {
    id: 'fixture-booking-approval-1',
    user_id: 'fixture-user-3',
    facility_id: 'fixture-facility-2',
    starts_at: '2025-03-20T10:00:00+01:00',
    ends_at: '2025-03-20T14:00:00+01:00',
    status: 'pending',
    total_price: 3000,
    notes: 'Large event requiring approval',
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: null,
    approval_status: 'pending',
    approved_by: null,
    approved_at: null,
  },
  {
    id: 'fixture-booking-approval-2',
    user_id: 'fixture-user-4',
    facility_id: 'fixture-facility-2',
    starts_at: '2025-03-25T15:00:00+01:00',
    ends_at: '2025-03-25T18:00:00+01:00',
    status: 'pending',
    total_price: 2250,
    notes: 'Cultural event',
    created_at: '2025-02-11T00:00:00Z',
    updated_at: '2025-02-11T00:00:00Z',
    cancelled_at: null,
    recurring_group_id: null,
    approval_status: 'pending',
    approved_by: null,
    approved_at: null,
  },
];

/**
 * Booking creation data for E2E tests
 */
export const newBookingData = {
  facilityId: 'fixture-facility-1',
  date: '2025-03-30',
  startTime: '10:00',
  endTime: '12:00',
  notes: 'E2E test - new booking creation',
  expectedPrice: 1000,
};

/**
 * Booking update data for E2E tests
 */
export const bookingUpdateData = {
  bookingId: 'fixture-booking-1',
  newNotes: 'Updated notes via E2E test',
  newStartTime: '11:00',
  newEndTime: '13:00',
};
