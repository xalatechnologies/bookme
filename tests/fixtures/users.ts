import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

/**
 * Sample users for E2E and integration tests
 */
export const sampleUsers: User[] = [
  {
    id: 'fixture-user-1',
    email: 'e2e.test.user@drammen.kommune.no',
    role: 'user',
    full_name: 'E2E Test User',
    phone: '+4712345678',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    preferences: {
      language: 'no',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      theme: 'light',
    },
    last_login: '2025-01-27T08:00:00Z',
  },
  {
    id: 'fixture-user-2',
    email: 'e2e.another.user@drammen.kommune.no',
    role: 'user',
    full_name: 'E2E Another User',
    phone: '+4787654321',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    avatar_url: null,
    preferences: {
      language: 'no',
      notifications: {
        email: true,
        push: false,
        sms: true,
      },
      theme: 'dark',
    },
    last_login: '2025-01-26T10:00:00Z',
  },
  {
    id: 'fixture-user-3',
    email: 'e2e.event.organizer@drammen.kommune.no',
    role: 'user',
    full_name: 'E2E Event Organizer',
    phone: '+4711111111',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    avatar_url: null,
    preferences: {
      language: 'no',
      notifications: {
        email: true,
        push: true,
        sms: true,
      },
      theme: 'light',
    },
    last_login: '2025-01-25T14:00:00Z',
  },
  {
    id: 'fixture-user-4',
    email: 'e2e.group.admin@drammen.kommune.no',
    role: 'user',
    full_name: 'E2E Group Administrator',
    phone: '+4722222222',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
    avatar_url: null,
    preferences: {
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      theme: 'light',
    },
    last_login: '2025-01-24T16:00:00Z',
  },
  {
    id: 'fixture-admin-1',
    email: 'e2e.admin@drammen.kommune.no',
    role: 'admin',
    full_name: 'E2E Admin User',
    phone: '+4700000000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    preferences: {
      language: 'no',
      notifications: {
        email: true,
        push: true,
        sms: true,
      },
      theme: 'light',
    },
    last_login: '2025-01-27T07:00:00Z',
  },
  {
    id: 'fixture-admin-2',
    email: 'e2e.super.admin@drammen.kommune.no',
    role: 'admin',
    full_name: 'E2E Super Admin',
    phone: '+4799999999',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    avatar_url: null,
    preferences: {
      language: 'no',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      theme: 'dark',
    },
    last_login: '2025-01-27T06:00:00Z',
  },
];

/**
 * Test credentials for E2E auth tests
 * NOTE: These should match test data in Supabase test database
 */
export const testCredentials = {
  validUser: {
    email: 'e2e.test.user@drammen.kommune.no',
    password: 'TestPassword123!',
  },
  validAdmin: {
    email: 'e2e.admin@drammen.kommune.no',
    password: 'AdminPassword123!',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!',
  },
  newUser: {
    email: 'new.user@drammen.kommune.no',
    password: 'NewPassword123!',
    fullName: 'New Test User',
    phone: '+4733333333',
  },
};

/**
 * User roles for testing role-based access
 */
export const userRoles = {
  user: 'fixture-user-1',
  admin: 'fixture-admin-1',
  superAdmin: 'fixture-admin-2',
};
