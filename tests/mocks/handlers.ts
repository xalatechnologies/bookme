import { http, HttpResponse } from 'msw';
import { mockBookings, mockFacilities, mockUsers, mockMessages, mockNotifications } from './data';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';

/**
 * MSW handlers for mocking Supabase REST API
 */
export const handlers = [
  // ==================== BOOKINGS ====================
  http.get(`${SUPABASE_URL}/rest/v1/bookings`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const facilityId = url.searchParams.get('facility_id');
    const status = url.searchParams.get('status');

    let filtered = mockBookings;

    if (userId) {
      filtered = filtered.filter(b => b.user_id === userId);
    }
    if (facilityId) {
      filtered = filtered.filter(b => b.facility_id === facilityId);
    }
    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }

    return HttpResponse.json(filtered);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/bookings`, async ({ request }) => {
    const newBooking = await request.json();
    const createdBooking = {
      id: `booking-${Date.now()}`,
      ...newBooking,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(createdBooking, { status: 201 });
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/bookings`, async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const updates = await request.json();

    const updatedBooking = {
      ...mockBookings[0],
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(updatedBooking);
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/bookings`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    return HttpResponse.json({ id }, { status: 204 });
  }),

  // ==================== FACILITIES ====================
  http.get(`${SUPABASE_URL}/rest/v1/facilities`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('name');
    const zoneId = url.searchParams.get('zone_id');

    let filtered = mockFacilities;

    if (search) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (zoneId) {
      filtered = filtered.filter(f => f.zone_id === zoneId);
    }

    return HttpResponse.json(filtered);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/facilities/:id`, ({ params }) => {
    const facility = mockFacilities.find(f => f.id === params.id);
    if (!facility) {
      return HttpResponse.json({ error: 'Facility not found' }, { status: 404 });
    }
    return HttpResponse.json(facility);
  }),

  // ==================== USERS ====================
  http.get(`${SUPABASE_URL}/rest/v1/users`, () => {
    return HttpResponse.json(mockUsers);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/users/:id`, ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // ==================== FAVORITES ====================
  http.get(`${SUPABASE_URL}/rest/v1/favorites`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    return HttpResponse.json([
      {
        id: 'fav-1',
        user_id: userId,
        facility_id: 'facility-1',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/favorites`, async ({ request }) => {
    const favorite = await request.json();
    return HttpResponse.json({
      id: `fav-${Date.now()}`,
      ...favorite,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/favorites`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    return HttpResponse.json({ id }, { status: 204 });
  }),

  // ==================== MESSAGES ====================
  http.get(`${SUPABASE_URL}/rest/v1/messages`, ({ request }) => {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('booking_id');

    let filtered = mockMessages;
    if (bookingId) {
      filtered = filtered.filter(m => m.booking_id === bookingId);
    }

    return HttpResponse.json(filtered);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/messages`, async ({ request }) => {
    const message = await request.json();
    return HttpResponse.json({
      id: `msg-${Date.now()}`,
      ...message,
      created_at: new Date().toISOString(),
      read: false,
    }, { status: 201 });
  }),

  // ==================== NOTIFICATIONS ====================
  http.get(`${SUPABASE_URL}/rest/v1/notifications`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    let filtered = mockNotifications;
    if (userId) {
      filtered = filtered.filter(n => n.user_id === userId);
    }

    return HttpResponse.json(filtered);
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/notifications`, async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const updates = await request.json();

    return HttpResponse.json({
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }),

  // ==================== GROUPS ====================
  http.get(`${SUPABASE_URL}/rest/v1/groups`, () => {
    return HttpResponse.json([
      {
        id: 'group-1',
        name: 'Test Group',
        description: 'A test group',
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/groups`, async ({ request }) => {
    const group = await request.json();
    return HttpResponse.json({
      id: `group-${Date.now()}`,
      ...group,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  // ==================== SUPPORT TICKETS ====================
  http.get(`${SUPABASE_URL}/rest/v1/support_tickets`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    return HttpResponse.json([
      {
        id: 'ticket-1',
        user_id: userId,
        subject: 'Test Ticket',
        description: 'Test description',
        status: 'open',
        priority: 'medium',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/support_tickets`, async ({ request }) => {
    const ticket = await request.json();
    return HttpResponse.json({
      id: `ticket-${Date.now()}`,
      ...ticket,
      status: 'open',
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  // ==================== AUTH ====================
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'user-1',
        email: body.email,
        role: 'user',
      },
    });
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({ success: true });
  }),
];
