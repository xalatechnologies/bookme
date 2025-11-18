/**
 * Avatar Service
 *
 * Manages user avatar uploads and storage.
 *
 * Features:
 * - Avatar upload to Supabase Storage
 * - Avatar URL management
 * - Avatar deletion
 *
 * @module services/supabase/avatar
 */

import { supabase } from './client';
import { handleSupabaseError } from './errors';
import type { Database } from '@/types/database';

// ============================================================================
// Extended Types
// ============================================================================

export interface AvatarUploadResult {
  readonly url: string;
  readonly path: string;
}

// ============================================================================
// Avatar Service
// ============================================================================

export class AvatarService {
  /**
   * Convert file to data URL (for localStorage storage)
   *
   * @param file - Avatar file to convert
   * @returns Data URL string
   */
  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload user avatar (simplified version that stores in localStorage)
   *
   * @param userId - User ID
   * @param file - Avatar file to upload
   * @returns Avatar URL and storage path
   */
  async uploadAvatar(userId: string, file: File): Promise<AvatarUploadResult> {
    try {
      // Convert file to data URL for localStorage storage
      const dataUrl = await this.fileToDataUrl(file);
      
      // Store in localStorage
      const storageKey = `avatar_${userId}`;
      localStorage.setItem(storageKey, dataUrl);
      
      return {
        url: dataUrl,
        path: storageKey, // Use localStorage key as path
      };
    } catch (error) {
      throw new Error('Failed to process avatar file');
    }
  }

  /**
   * Delete user avatar
   *
   * @param filePath - Path to the avatar file in storage
   * @returns True if deleted successfully
   */
  async deleteAvatar(filePath: string): Promise<boolean> {
    try {
      localStorage.removeItem(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  }

  /**
   * Get avatar URL for user
   *
   * @param userId - User ID
   * @returns Avatar URL or null if not found
   */
  async getAvatarUrl(userId: string): Promise<string | null> {
    try {
      const storageKey = `avatar_${userId}`;
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  }
}

/**
 * Singleton instance of AvatarService
 */
export const avatarService = new AvatarService();