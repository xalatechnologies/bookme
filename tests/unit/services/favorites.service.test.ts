import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  favoritesService,
  useUserFavorites,
  useToggleFavorite,
  useIsFavorite,
} from '@/services/supabase/favorites.service';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Favorites Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('favoritesService.getUserFavorites', () => {
    it('should fetch user favorites with facility data', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          user_id: 'user-1',
          facility_id: 'facility-1',
          created_at: '2024-01-01T00:00:00Z',
          facility: {
            id: 'facility-1',
            name: 'Test Facility',
            description: 'Test description',
          },
        },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
      });

      const result = await favoritesService.getUserFavorites('user-1');

      expect(result).toEqual(mockFavorites);
      expect(supabase.from).toHaveBeenCalledWith('user_favorites');
    });

    it('should throw error on fetch failure', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch error' },
        }),
      });

      await expect(favoritesService.getUserFavorites('user-1')).rejects.toThrow('Fetch error');
    });
  });

  describe('favoritesService.isFavorite', () => {
    it('should return true when facility is favorited', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'fav-1' },
          error: null,
        }),
      });

      const result = await favoritesService.isFavorite('user-1', 'facility-1');

      expect(result).toBe(true);
    });

    it('should return false when facility is not favorited', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const result = await favoritesService.isFavorite('user-1', 'facility-2');

      expect(result).toBe(false);
    });
  });

  describe('favoritesService.addFavorite', () => {
    it('should add a favorite', async () => {
      const newFavorite = {
        id: 'fav-1',
        user_id: 'user-1',
        facility_id: 'facility-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newFavorite, error: null }),
      });

      const result = await favoritesService.addFavorite('user-1', 'facility-1');

      expect(result).toEqual(newFavorite);
    });

    it('should handle duplicate favorites', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Duplicate key value' },
        }),
      });

      await expect(
        favoritesService.addFavorite('user-1', 'facility-1')
      ).rejects.toThrow();
    });
  });

  describe('favoritesService.removeFavorite', () => {
    it('should remove a favorite', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      await expect(
        favoritesService.removeFavorite('user-1', 'facility-1')
      ).resolves.not.toThrow();
    });

    it('should throw error if favorite not found', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      await expect(
        favoritesService.removeFavorite('user-1', 'facility-1')
      ).rejects.toThrow('Not found');
    });
  });
});

describe('Favorites Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserFavorites', () => {
    it('should fetch user favorites', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          user_id: 'user-1',
          facility_id: 'facility-1',
          created_at: '2024-01-01T00:00:00Z',
          facility: { id: 'facility-1', name: 'Test' },
        },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
      });

      const { result } = renderHook(() => useUserFavorites('user-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFavorites);
    });
  });

  describe('useIsFavorite', () => {
    it('should check if facility is favorited', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'fav-1' },
          error: null,
        }),
      });

      const { result } = renderHook(
        () => useIsFavorite('user-1', 'facility-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(true);
    });
  });

  describe('useToggleFavorite', () => {
    it('should add favorite when not favorited', async () => {
      const newFavorite = {
        id: 'fav-1',
        user_id: 'user-1',
        facility_id: 'facility-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newFavorite, error: null }),
      });

      const { result } = renderHook(() => useToggleFavorite(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        userId: 'user-1',
        facilityId: 'facility-1',
        isFavorited: false,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should remove favorite when favorited', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { result } = renderHook(() => useToggleFavorite(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        userId: 'user-1',
        facilityId: 'facility-1',
        isFavorited: true,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
