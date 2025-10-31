/**
 * Favorites Service
 *
 * Handles user favorites (saved facilities) with Supabase backend.
 * Replaces localStorage-based favorites with server-side persistence.
 *
 * Features:
 * - Type-safe favorite operations
 * - React Query integration
 * - Optimistic updates for instant UI feedback
 * - User-scoped favorites
 */

import { supabase } from '@/lib/clients/supabase';
import type { Database } from '@/types/database';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';

// Type aliases
type Favorite = Database['public']['Tables']['user_favorites']['Row'];
type FavoriteInsert = Database['public']['Tables']['user_favorites']['Insert'];
type Facility = Database['public']['Tables']['facilities']['Row'];

/**
 * Favorite with facility data
 */
export interface FavoriteWithFacility extends Favorite {
  readonly facility: Facility;
}

/**
 * Query keys
 */
export const favoriteKeys = {
  all: ['favorites'] as const,
  user: (userId: string) => [...favoriteKeys.all, 'user', userId] as const,
  isFavorite: (userId: string, facilityId: string) => [
    ...favoriteKeys.user(userId),
    'check',
    facilityId,
  ] as const,
};

// ============================================================================
// Service Functions
// ============================================================================

export const favoritesService = {
  /**
   * Fetch all favorites for a user
   */
  async getUserFavorites(userId: string): Promise<FavoriteWithFacility[]> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        facility:facilities (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FavoriteWithFacility[];
  },

  /**
   * Check if a facility is favorited by user
   */
  async isFavorite(userId: string, facilityId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },

  /**
   * Add a facility to favorites
   */
  async add(userId: string, facilityId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        facility_id: facilityId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove a facility from favorites
   */
  async remove(userId: string, facilityId: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('facility_id', facilityId);

    if (error) throw error;
  },

  /**
   * Toggle favorite status
   */
  async toggle(userId: string, facilityId: string): Promise<boolean> {
    const isFav = await this.isFavorite(userId, facilityId);

    if (isFav) {
      await this.remove(userId, facilityId);
      return false;
    } else {
      await this.add(userId, facilityId);
      return true;
    }
  },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch user's favorites
 *
 * @example
 * ```tsx
 * function MyFavorites() {
 *   const { user } = useAuth();
 *   const { data: favorites, isLoading } = useFavorites(user?.id!);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <div>
 *       <h2>My Favorites</h2>
 *       {favorites?.map(fav => (
 *         <FacilityCard key={fav.id} facility={fav.facility} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useFavorites = (
  userId: string,
  enabled = true
): UseQueryResult<FavoriteWithFacility[], Error> => {
  return useQuery({
    queryKey: favoriteKeys.user(userId),
    queryFn: () => favoritesService.getUserFavorites(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to check if a facility is favorited
 *
 * @example
 * ```tsx
 * function FavoriteButton({ facilityId }: { facilityId: string }) {
 *   const { user } = useAuth();
 *   const { data: isFavorite, isLoading } = useIsFavorite(user?.id!, facilityId);
 *
 *   return (
 *     <button disabled={isLoading}>
 *       {isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useIsFavorite = (
  userId: string,
  facilityId: string,
  enabled = true
): UseQueryResult<boolean, Error> => {
  return useQuery({
    queryKey: favoriteKeys.isFavorite(userId, facilityId),
    queryFn: () => favoritesService.isFavorite(userId, facilityId),
    enabled: !!userId && !!facilityId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to add a favorite
 *
 * Uses optimistic updates for instant UI feedback
 */
export const useAddFavorite = (): UseMutationResult<
  Favorite,
  Error,
  { userId: string; facilityId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, facilityId }) => favoritesService.add(userId, facilityId),
    onMutate: async ({ userId, facilityId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: favoriteKeys.user(userId) });

      // Optimistically update cache
      queryClient.setQueryData(
        favoriteKeys.isFavorite(userId, facilityId),
        true
      );
    },
    onSuccess: (_, { userId }) => {
      // Invalidate favorites list to refetch with facility data
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(userId) });
    },
    onError: (_, { userId, facilityId }) => {
      // Revert optimistic update on error
      queryClient.setQueryData(
        favoriteKeys.isFavorite(userId, facilityId),
        false
      );
    },
  });
};

/**
 * Hook to remove a favorite
 *
 * Uses optimistic updates for instant UI feedback
 */
export const useRemoveFavorite = (): UseMutationResult<
  void,
  Error,
  { userId: string; facilityId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, facilityId }) => favoritesService.remove(userId, facilityId),
    onMutate: async ({ userId, facilityId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: favoriteKeys.user(userId) });

      // Optimistically update cache
      queryClient.setQueryData(
        favoriteKeys.isFavorite(userId, facilityId),
        false
      );
    },
    onSuccess: (_, { userId }) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(userId) });
    },
    onError: (_, { userId, facilityId }) => {
      // Revert optimistic update on error
      queryClient.setQueryData(
        favoriteKeys.isFavorite(userId, facilityId),
        true
      );
    },
  });
};

/**
 * Hook to toggle favorite status
 *
 * Convenience hook that combines add and remove with optimistic updates
 *
 * @example
 * ```tsx
 * function FavoriteButton({ facilityId }: { facilityId: string }) {
 *   const { user } = useAuth();
 *   const { data: isFavorite } = useIsFavorite(user?.id!, facilityId);
 *   const toggleFavorite = useToggleFavorite();
 *
 *   const handleClick = () => {
 *     toggleFavorite.mutate({
 *       userId: user!.id,
 *       facilityId,
 *     });
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleClick}
 *       disabled={toggleFavorite.isPending}
 *       className={isFavorite ? 'text-red-500' : 'text-gray-400'}
 *     >
 *       {isFavorite ? '❤️' : '🤍'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useToggleFavorite = (): UseMutationResult<
  boolean,
  Error,
  { userId: string; facilityId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, facilityId }) => favoritesService.toggle(userId, facilityId),
    onMutate: async ({ userId, facilityId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: favoriteKeys.user(userId) });

      // Get current state
      const currentState = queryClient.getQueryData<boolean>(
        favoriteKeys.isFavorite(userId, facilityId)
      ) ?? false;

      // Optimistically toggle
      queryClient.setQueryData(
        favoriteKeys.isFavorite(userId, facilityId),
        !currentState
      );

      return { previousState: currentState };
    },
    onSuccess: (_, { userId }) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(userId) });
    },
    onError: (_, { userId, facilityId }, context) => {
      // Revert optimistic update on error
      if (context?.previousState !== undefined) {
        queryClient.setQueryData(
          favoriteKeys.isFavorite(userId, facilityId),
          context.previousState
        );
      }
    },
  });
};
