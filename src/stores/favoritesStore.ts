"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { supabase } from '@/lib/clients/supabase';

/**
 * Interface for a favorite facility
 * Contains all necessary information to display and manage favorites
 */
interface IFavoriteFacility {
  readonly id: string;
  readonly facilityId: string; // Reference to the actual facility
  readonly addedAt: string; // ISO date string
  readonly lastVisited?: string; // ISO date string
  readonly usageCount: number; // How many times user has viewed this facility
  readonly notes?: string; // User's personal notes about this facility
}

/**
 * Interface for the favorites store
 * Manages user's favorite facilities with full CRUD operations
 */
interface IFavoritesStore {
  readonly favorites: readonly IFavoriteFacility[];
  readonly userId: string | null;
  readonly setUserId: (userId: string | null) => void;
  readonly addFavorite: (facilityId: string) => Promise<void>;
  readonly removeFavorite: (facilityId: string) => Promise<void>;
  readonly toggleFavorite: (facilityId: string) => Promise<void>;
  readonly isFavorite: (facilityId: string) => boolean;
  readonly getFavoriteById: (facilityId: string) => IFavoriteFacility | undefined;
  readonly updateFavorite: (facilityId: string, updates: Partial<IFavoriteFacility>) => void;
  readonly incrementUsage: (facilityId: string) => void;
  readonly updateLastVisited: (facilityId: string) => void;
  readonly clearAllFavorites: () => void;
  readonly getFavoritesCount: () => number;
  readonly loadFavorites: (userId: string) => Promise<void>;
}

/**
 * Favorites store using Zustand with persistence
 * 
 * Features:
 * - Add/remove favorites with toggle functionality
 * - Track usage count and last visited date
 * - Persist favorites to localStorage
 * - Type-safe operations with readonly interfaces
 * - DevTools support for debugging
 * 
 * Usage:
 * - Use addFavorite() to add a facility to favorites
 * - Use removeFavorite() to remove a facility from favorites
 * - Use toggleFavorite() to toggle favorite status
 * - Use isFavorite() to check if a facility is favorited
 * - Use incrementUsage() when user views a facility
 * - Use updateLastVisited() when user visits a facility
 */
export const useFavoritesStore = create<IFavoritesStore>()(
  devtools(
    persist(
      (set, get) => ({
        favorites: [],
        userId: null,

        /**
         * Set the current user ID
         */
        setUserId: (userId: string | null): void => {
          set({ userId });
        },

        /**
         * Load favorites from the database for the current user
         */
        loadFavorites: async (userId: string): Promise<void> => {
          try {
            // Load favorites from database
            const { data, error } = await supabase
              .from('favorites')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Convert to our local format
            const favorites: IFavoriteFacility[] = data.map(fav => ({
              id: `${fav.user_id}-${fav.facility_id}`, // Create a unique ID
              facilityId: fav.facility_id,
              addedAt: fav.created_at,
              usageCount: 0, // We don't track this in the database
            }));
            
            set({ favorites, userId });
          } catch (error) {
            console.error('Error loading favorites:', error);
            set({ favorites: [], userId });
          }
        },

        /**
         * Add a facility to favorites
         * Creates a new favorite entry with current timestamp
         */
        addFavorite: async (facilityId: string): Promise<void> => {
          const userId = get().userId;
          if (!userId) {
            console.warn('Cannot add favorite: No user logged in');
            return;
          }

          try {
            // Add to database
            const { error } = await supabase
              .from('favorites')
              .insert({
                user_id: userId,
                facility_id: facilityId,
                created_at: new Date().toISOString()
              });

            if (error) throw error;
            
            // Update local state
            const existingFavorite = get().favorites.find(fav => fav.facilityId === facilityId);
            
            if (existingFavorite) {
              return;
            }

            const newFavorite: IFavoriteFacility = {
              id: `${userId}-${facilityId}`,
              facilityId,
              addedAt: new Date().toISOString(),
              usageCount: 0,
            };

            set((state) => ({
              favorites: [...state.favorites, newFavorite],
            }));
          } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
          }
        },

        /**
         * Remove a facility from favorites
         * Completely removes the favorite entry
         */
        removeFavorite: async (facilityId: string): Promise<void> => {
          const userId = get().userId;
          if (!userId) {
            console.warn('Cannot remove favorite: No user logged in');
            return;
          }

          try {
            // Remove from database
            const { error } = await supabase
              .from('favorites')
              .delete()
              .eq('user_id', userId)
              .eq('facility_id', facilityId);

            if (error) throw error;
            
            // Update local state
            set((state) => ({
              favorites: state.favorites.filter(fav => fav.facilityId !== facilityId),
            }));
          } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
          }
        },

        /**
         * Toggle favorite status for a facility
         * Adds if not favorited, removes if already favorited
         */
        toggleFavorite: async (facilityId: string): Promise<void> => {
          const userId = get().userId;
          if (!userId) {
            console.warn('Cannot toggle favorite: No user logged in');
            return;
          }

          const isCurrentlyFavorite = get().isFavorite(facilityId);
          
          if (isCurrentlyFavorite) {
            await get().removeFavorite(facilityId);
          } else {
            await get().addFavorite(facilityId);
          }
        },

        /**
         * Check if a facility is favorited
         * Returns true if facility exists in favorites
         */
        isFavorite: (facilityId: string): boolean => {
          return get().favorites.some(fav => fav.facilityId === facilityId);
        },

        /**
         * Get favorite entry by facility ID
         * Returns the favorite entry or undefined if not found
         */
        getFavoriteById: (facilityId: string): IFavoriteFacility | undefined => {
          return get().favorites.find(fav => fav.facilityId === facilityId);
        },

        /**
         * Update a favorite entry
         * Allows updating notes, usage count, etc.
         */
        updateFavorite: (facilityId: string, updates: Partial<IFavoriteFacility>): void => {
          set((state) => ({
            favorites: state.favorites.map(fav =>
              fav.facilityId === facilityId
                ? { ...fav, ...updates }
                : fav
            ),
          }));
        },

        /**
         * Increment usage count for a facility
         * Called when user views a facility
         */
        incrementUsage: (facilityId: string): void => {
          const favorite = get().getFavoriteById(facilityId);
          if (favorite) {
            get().updateFavorite(facilityId, {
              usageCount: favorite.usageCount + 1,
            });
          }
        },

        /**
         * Update last visited date for a facility
         * Called when user visits a facility
         */
        updateLastVisited: (facilityId: string): void => {
          get().updateFavorite(facilityId, {
            lastVisited: new Date().toISOString(),
          });
        },

        /**
         * Clear all favorites
         * Removes all favorite entries
         */
        clearAllFavorites: (): void => {
          set({ favorites: [], userId: null });
        },

        /**
         * Get total number of favorites
         * Returns count of favorite facilities
         */
        getFavoritesCount: (): number => {
          return get().favorites.length;
        },
      }),
      {
        name: "favorites-store", // localStorage key
        version: 1, // Version for migration if needed
        partialize: (state) => ({ 
          favorites: state.favorites,
          userId: state.userId
        }), // Only persist favorites and userId
      }
    ),
    {
      name: "favorites-store", // DevTools name
    }
  )
);

export type { IFavoriteFacility, IFavoritesStore };