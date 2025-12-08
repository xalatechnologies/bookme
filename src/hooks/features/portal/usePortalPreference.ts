/**
 * Portal Preference Hook
 * 
 * Manages user portal preferences (admin vs user portal).
 * Handles saving and loading portal preferences from the database.
 * 
 * Features:
 * - Save portal preference to database
 * - Load portal preference from database
 * - Automatic preference saving when navigating between portals
 * 
 * @module hooks/features/portal/usePortalPreference
 */

import { useCallback } from 'react';
import { usersService } from '@/services/supabase/users.service';
import type { UserProfile } from '@/services/supabase/types';

/**
 * Portal preference hook
 * 
 * @returns Object with functions to manage portal preferences
 * 
 * @example
 * ```tsx
 * const { savePortalPreference, loadPortalPreference } = usePortalPreference();
 * 
 * // Save preference when user navigates to admin portal
 * useEffect(() => {
 *   if (location.pathname.startsWith('/admin')) {
 *     savePortalPreference('admin');
 *   }
 * }, [location.pathname, savePortalPreference]);
 * ```
 */
export const usePortalPreference = () => {
  /**
   * Save user's portal preference to database
   * 
   * @param userId - User ID
   * @param portal - Portal preference ('admin' or 'user')
   * @returns Promise that resolves when preference is saved
   */
  const savePortalPreference = useCallback(async (
    userId: string,
    portal: 'admin' | 'user'
  ): Promise<UserProfile | null> => {
    try {
      const updatedProfile = await usersService.updatePreferredPortal(userId, portal);
      return updatedProfile;
    } catch (error) {
      console.error('Failed to save portal preference:', error);
      return null;
    }
  }, []);

  /**
   * Load user's portal preference from database
   * 
   * @param userId - User ID
   * @returns Promise that resolves with portal preference or null
   */
  const loadPortalPreference = useCallback(async (
    userId: string
  ): Promise<'admin' | 'user' | null> => {
    try {
      const profile = await usersService.getById(userId);
      return (profile.preferred_portal as 'admin' | 'user' | null) || null;
    } catch (error) {
      console.error('Failed to load portal preference:', error);
      return null;
    }
  }, []);

  return {
    savePortalPreference,
    loadPortalPreference,
  };
};