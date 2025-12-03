/**
 * Avatar Service
 *
 * Manages user avatar uploads and storage.
 *
 * Features:
 * - Avatar upload to Supabase Storage with localStorage fallback
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
   * Upload user avatar to Supabase Storage with localStorage fallback
   *
   * @param userId - User ID
   * @param file - Avatar file to upload
   * @returns Avatar URL and storage path
   */
  async uploadAvatar(userId: string, file: File): Promise<AvatarUploadResult> {
    try {
      // First, try to upload to Supabase Storage
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `avatars/${userId}.${fileExtension}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing avatar
        });

      if (!uploadError && data) {
        // Successfully uploaded to Supabase Storage
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        return {
          url: publicUrl,
          path: fileName
        };
      }
    } catch (error) {
      console.warn('Failed to upload to Supabase Storage, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
      const dataUrl = await this.fileToDataUrl(file);
      const storageKey = `avatar_${userId}`;
      localStorage.setItem(storageKey, dataUrl);
      
      return {
        url: dataUrl,
        path: storageKey, // Use localStorage key as path
      };
    } catch (error) {
      console.error('Error processing avatar file:', error);
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
      // Try to delete from Supabase Storage first
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (!error) {
        return true;
      }
    } catch (error) {
      console.warn('Failed to delete from Supabase Storage:', error);
    }

    // Fallback to localStorage
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
      // Try to get from Supabase Storage first
      const { data, error } = await supabase.storage
        .from('avatars')
        .list('avatars', {
          search: userId
        });

      if (!error && data && data.length > 0) {
        const fileName = data[0].name;
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        return publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get avatar from Supabase Storage:', error);
    }

    // Fallback to localStorage
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