"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

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
  readonly addFavorite: (facilityId: string) => void;
  readonly removeFavorite: (facilityId: string) => void;
  readonly toggleFavorite: (facilityId: string) => void;
  readonly isFavorite: (facilityId: string) => boolean;
  readonly getFavoriteById: (facilityId: string) => IFavoriteFacility | undefined;
  readonly updateFavorite: (facilityId: string, updates: Partial<IFavoriteFacility>) => void;
  readonly incrementUsage: (facilityId: string) => void;
  readonly updateLastVisited: (facilityId: string) => void;
  readonly clearAllFavorites: () => void;
  readonly getFavoritesCount: () => number;
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

        /**
         * Add a facility to favorites
         * Creates a new favorite entry with current timestamp
         */
        addFavorite: (facilityId: string): void => {
          const existingFavorite = get().favorites.find(fav => fav.facilityId === facilityId);
          
          if (existingFavorite) {
            return;
          }

          const newFavorite: IFavoriteFacility = {
            id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            facilityId,
            addedAt: new Date().toISOString(),
            usageCount: 0,
          };

          set((state) => ({
            favorites: [...state.favorites, newFavorite],
          }));

        },

        /**
         * Remove a facility from favorites
         * Completely removes the favorite entry
         */
        removeFavorite: (facilityId: string): void => {
          set((state) => ({
            favorites: state.favorites.filter(fav => fav.facilityId !== facilityId),
          }));

        },

        /**
         * Toggle favorite status for a facility
         * Adds if not favorited, removes if already favorited
         */
        toggleFavorite: (facilityId: string): void => {
          const isCurrentlyFavorite = get().isFavorite(facilityId);
          
          if (isCurrentlyFavorite) {
            get().removeFavorite(facilityId);
          } else {
            get().addFavorite(facilityId);
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
          set({ favorites: [] });
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
      }
    ),
    {
      name: "favorites-store", // DevTools name
    }
  )
);

export type { IFavoriteFacility, IFavoritesStore };
