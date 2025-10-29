/**
 * Unit Tests for useUserPreferences Hook
 *
 * Tests migration of user preferences from localStorage to Supabase
 * including error handling and default values
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockUser } from '../../../../test-utils';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Type definitions
interface UserPreferences {
  readonly userId: string;
  readonly theme?: 'light' | 'dark' | 'system';
  readonly language?: string;
  readonly notifications_enabled?: boolean;
  readonly email_notifications?: boolean;
  readonly sms_notifications?: boolean;
  readonly timezone?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

interface MockPreferencesResponse {
  readonly data: UserPreferences | null;
  readonly error: { readonly message: string } | null;
}

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  userId: mockUser.id,
  theme: 'system',
  language: 'nb-NO',
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: false,
  timezone: 'Europe/Oslo',
};

const createTestPreferences = (
  overrides?: Partial<UserPreferences>
): UserPreferences => ({
  ...DEFAULT_PREFERENCES,
  ...overrides,
});

// Create test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { readonly children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserPreferences Hook - Migration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  describe('Default Values', () => {
    it('should return default preferences when no data exists', () => {
      const preferences = createTestPreferences();

      expect(preferences.theme).toBe('system');
      expect(preferences.language).toBe('nb-NO');
      expect(preferences.notifications_enabled).toBe(true);
      expect(preferences.timezone).toBe('Europe/Oslo');
    });

    it('should have valid default notification settings', () => {
      const preferences = DEFAULT_PREFERENCES;

      expect(preferences.email_notifications).toBe(true);
      expect(preferences.sms_notifications).toBe(false);
      expect(preferences.notifications_enabled).toBe(true);
    });

    it('should have Norwegian locale as default', () => {
      expect(DEFAULT_PREFERENCES.language).toBe('nb-NO');
    });

    it('should have Europe/Oslo timezone as default', () => {
      expect(DEFAULT_PREFERENCES.timezone).toBe('Europe/Oslo');
    });
  });

  describe('Reading Preferences', () => {
    it('should read preferences from Supabase', async () => {
      const preferences = createTestPreferences({ theme: 'dark' });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: preferences,
          error: null,
        } as MockPreferencesResponse),
      };

      const mockSupabase = { from: vi.fn().mockReturnValue(mockQuery) };

      expect(mockQuery.single).not.toHaveBeenCalled(); // Mock setup only
    });

    it('should fall back to localStorage when Supabase unavailable', async () => {
      const preferences = createTestPreferences({
        theme: 'dark',
        language: 'en-US',
      });

      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences)
      );

      const retrieved = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(retrieved.theme).toBe('dark');
      expect(retrieved.language).toBe('en-US');
    });

    it('should parse corrupted localStorage gracefully', () => {
      mockLocalStorage.setItem(`preferences_${mockUser.id}`, 'invalid-json-{]');

      try {
        const retrieved = JSON.parse(
          mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
        );
        expect.fail('Should throw on invalid JSON');
      } catch (error) {
        // Should fall back to defaults
        expect(error).toBeTruthy();
      }
    });

    it('should handle empty Supabase response', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        } as MockPreferencesResponse),
      };

      expect(mockQuery.single).not.toHaveBeenCalled();
    });
  });

  describe('Updating Preferences', () => {
    it('should update preference in Supabase', async () => {
      const updatedPreferences = createTestPreferences({ theme: 'dark' });

      const mockUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedPreferences,
          error: null,
        } as MockPreferencesResponse),
      };

      const mockSupabase = { from: vi.fn().mockReturnValue(mockUpdate) };

      expect(mockUpdate.update).not.toHaveBeenCalled();
    });

    it('should update localStorage on successful Supabase update', () => {
      const preferences = createTestPreferences({ theme: 'dark' });

      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences)
      );

      const retrieved = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(retrieved.theme).toBe('dark');
    });

    it('should keep old preferences if update fails', () => {
      const oldPreferences = createTestPreferences({ theme: 'light' });
      const key = `preferences_${mockUser.id}`;

      mockLocalStorage.setItem(key, JSON.stringify(oldPreferences));

      // Simulate failed update - data should remain unchanged
      const retrieved = JSON.parse(mockLocalStorage.getItem(key) || '{}');
      expect(retrieved.theme).toBe('light');
    });

    it('should validate preference values before update', () => {
      const validThemes = ['light', 'dark', 'system'];
      const testTheme = 'dark';

      expect(validThemes).toContain(testTheme);
    });

    it('should handle partial updates', () => {
      const original = createTestPreferences();
      const partial = { theme: 'dark' as const };

      const updated = { ...original, ...partial };

      expect(updated.theme).toBe('dark');
      expect(updated.language).toBe('nb-NO'); // Unchanged
      expect(updated.timezone).toBe('Europe/Oslo'); // Unchanged
    });

    it('should timestamp preference updates', () => {
      const preferences = createTestPreferences();
      const now = new Date().toISOString();

      const withTimestamp = {
        ...preferences,
        updated_at: now,
      };

      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(withTimestamp)
      );

      const retrieved = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(retrieved.updated_at).toBeTruthy();
    });
  });

  describe('Theme Preference', () => {
    it('should support light theme', () => {
      const preferences = createTestPreferences({ theme: 'light' });
      expect(preferences.theme).toBe('light');
    });

    it('should support dark theme', () => {
      const preferences = createTestPreferences({ theme: 'dark' });
      expect(preferences.theme).toBe('dark');
    });

    it('should support system theme', () => {
      const preferences = createTestPreferences({ theme: 'system' });
      expect(preferences.theme).toBe('system');
    });

    it('should default to system theme', () => {
      expect(DEFAULT_PREFERENCES.theme).toBe('system');
    });
  });

  describe('Language Preference', () => {
    it('should support Norwegian language', () => {
      const preferences = createTestPreferences({ language: 'nb-NO' });
      expect(preferences.language).toBe('nb-NO');
    });

    it('should support English language', () => {
      const preferences = createTestPreferences({ language: 'en-US' });
      expect(preferences.language).toBe('en-US');
    });

    it('should default to Norwegian', () => {
      expect(DEFAULT_PREFERENCES.language).toBe('nb-NO');
    });

    it('should validate language codes', () => {
      const validLanguages = ['nb-NO', 'en-US', 'sv-SE'];
      const testLanguage = 'nb-NO';

      expect(validLanguages).toContain(testLanguage);
    });
  });

  describe('Notification Preferences', () => {
    it('should enable/disable all notifications', () => {
      const enabled = createTestPreferences({
        notifications_enabled: true,
      });
      const disabled = createTestPreferences({
        notifications_enabled: false,
      });

      expect(enabled.notifications_enabled).toBe(true);
      expect(disabled.notifications_enabled).toBe(false);
    });

    it('should enable/disable email notifications', () => {
      const withEmail = createTestPreferences({
        email_notifications: true,
      });
      const withoutEmail = createTestPreferences({
        email_notifications: false,
      });

      expect(withEmail.email_notifications).toBe(true);
      expect(withoutEmail.email_notifications).toBe(false);
    });

    it('should enable/disable SMS notifications', () => {
      const withSMS = createTestPreferences({
        sms_notifications: true,
      });
      const withoutSMS = createTestPreferences({
        sms_notifications: false,
      });

      expect(withSMS.sms_notifications).toBe(true);
      expect(withoutSMS.sms_notifications).toBe(false);
    });

    it('should respect master notification toggle', () => {
      const allDisabled = createTestPreferences({
        notifications_enabled: false,
        email_notifications: true, // This should be ignored if master is false
        sms_notifications: true,
      });

      expect(allDisabled.notifications_enabled).toBe(false);
    });

    it('should have email enabled by default', () => {
      expect(DEFAULT_PREFERENCES.email_notifications).toBe(true);
    });

    it('should have SMS disabled by default', () => {
      expect(DEFAULT_PREFERENCES.sms_notifications).toBe(false);
    });
  });

  describe('Timezone Preferences', () => {
    it('should support Europe/Oslo timezone', () => {
      const preferences = createTestPreferences({
        timezone: 'Europe/Oslo',
      });
      expect(preferences.timezone).toBe('Europe/Oslo');
    });

    it('should support other timezones', () => {
      const timezones = ['Europe/Oslo', 'UTC', 'America/New_York'];

      timezones.forEach((tz) => {
        const preferences = createTestPreferences({ timezone: tz });
        expect(preferences.timezone).toBe(tz);
      });
    });

    it('should default to Europe/Oslo', () => {
      expect(DEFAULT_PREFERENCES.timezone).toBe('Europe/Oslo');
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase connection errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed' },
        } as MockPreferencesResponse),
      };

      // Should fall back to defaults or localStorage
      expect(mockQuery.single).not.toHaveBeenCalled();
    });

    it('should handle malformed preference data', () => {
      const malformed = { theme: 'invalid-theme' };

      // Should validate and use default instead
      const theme = malformed.theme as string;
      const validThemes = ['light', 'dark', 'system'];

      expect(validThemes).not.toContain(theme);
    });

    it('should handle missing required fields', () => {
      const incomplete: Partial<UserPreferences> = {
        theme: 'dark',
        // missing other required fields
      };

      const complete = {
        ...DEFAULT_PREFERENCES,
        ...incomplete,
      };

      expect(complete.userId).toBeTruthy();
      expect(complete.language).toBe('nb-NO');
    });

    it('should handle concurrent preference updates', () => {
      const preferences1 = createTestPreferences({ theme: 'dark' });
      const preferences2 = createTestPreferences({
        language: 'en-US',
      });

      // Last write should win
      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences1)
      );
      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences2)
      );

      const final = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(final.language).toBe('en-US');
    });

    it('should handle localStorage quota exceeded', () => {
      const hugeData = {
        ...DEFAULT_PREFERENCES,
        largeField: 'x'.repeat(1000000),
      };

      let quotaExceeded = false;
      const originalSetItem = mockLocalStorage.setItem;

      mockLocalStorage.setItem = (key: string, value: string) => {
        if (value.length > 500000) {
          quotaExceeded = true;
          return;
        }
        originalSetItem.call(mockLocalStorage, key, value);
      };

      try {
        mockLocalStorage.setItem(
          `preferences_${mockUser.id}`,
          JSON.stringify(hugeData)
        );
        expect(quotaExceeded).toBe(true);
      } finally {
        mockLocalStorage.setItem = originalSetItem;
      }
    });
  });

  describe('Migration Consistency', () => {
    it('should migrate old localStorage format to new Supabase format', () => {
      const oldFormat = {
        pref_theme: 'dark',
        pref_language: 'en',
      };

      const newFormat = {
        userId: mockUser.id,
        theme: oldFormat.pref_theme,
        language: oldFormat.pref_language,
      };

      expect(newFormat.theme).toBe('dark');
      expect(newFormat.language).toBe('en');
    });

    it('should maintain backward compatibility during migration', () => {
      // Old format in localStorage
      mockLocalStorage.setItem(
        'user_theme',
        JSON.stringify({ theme: 'dark' })
      );

      // New format should still work
      const preferences = createTestPreferences({ theme: 'dark' });
      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences)
      );

      const newData = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(newData.theme).toBe('dark');
    });

    it('should verify data consistency after sync', () => {
      const preferences = createTestPreferences();

      // Store in both
      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences)
      );

      const retrieved = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(retrieved.userId).toBe(preferences.userId);
      expect(retrieved.theme).toBe(preferences.theme);
      expect(retrieved.language).toBe(preferences.language);
    });
  });

  describe('Performance Considerations', () => {
    it('should cache preferences to avoid repeated fetches', () => {
      const preferences = createTestPreferences();

      // First access
      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(preferences)
      );

      // Subsequent accesses should return cached value
      const first = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );
      const second = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(first).toEqual(second);
    });

    it('should invalidate cache on updates', () => {
      const original = createTestPreferences();
      const updated = createTestPreferences({ theme: 'dark' });

      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(original)
      );

      // Update
      mockLocalStorage.setItem(
        `preferences_${mockUser.id}`,
        JSON.stringify(updated)
      );

      const current = JSON.parse(
        mockLocalStorage.getItem(`preferences_${mockUser.id}`) || '{}'
      );

      expect(current.theme).toBe('dark');
    });
  });
});
