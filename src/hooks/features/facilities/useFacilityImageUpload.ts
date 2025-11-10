import { useState, useCallback } from "react";
import { supabase } from "@/lib/clients/supabase";

/**
 * Facility image upload hook return type
 */
export interface UseFacilityImageUploadReturn {
  readonly uploadImage: (file: File, facilityId: string) => Promise<string | null>;
  readonly uploadImages: (files: File[], facilityId: string) => Promise<string[]>;
  readonly isUploading: boolean;
  readonly uploadProgress: number;
  readonly error: string | null;
  readonly clearError: () => void;
}

/**
 * Custom hook for uploading facility images to Supabase Storage
 *
 * Features:
 * - Upload single or multiple images to Supabase Storage
 * - Progress tracking
 * - Error handling
 * - Unique file naming
 *
 * @returns Facility image upload functions and state
 *
 * @example
 * ```tsx
 * const { uploadImages, isUploading, error } = useFacilityImageUpload();
 *
 * const handleImageUpload = async (files: File[]) => {
 *   const urls = await uploadImages(files, facilityId);
 *   if (urls.length > 0) {
 *     // Update facility with new image URLs
 *     await updateFacility({ images: [...existingImages, ...urls] });
 *   }
 * };
 * ```
 */
export const useFacilityImageUpload = (): UseFacilityImageUploadReturn => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a single image to Supabase Storage
   */
  const uploadImage = useCallback(
    async (file: File, facilityId: string): Promise<string | null> => {
      try {
        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }

        // Generate unique file name
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${facilityId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('facility-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('facility-images')
          .getPublicUrl(fileName);

        return publicUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error uploading image:', err);
        return null;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    []
  );

  /**
   * Upload multiple images to Supabase Storage
   */
  const uploadImages = useCallback(
    async (files: File[], facilityId: string): Promise<string[]> => {
      try {
        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const uploadedUrls: string[] = [];
        const errors: string[] = [];

        // Upload files sequentially to avoid overwhelming the server
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const url = await uploadImage(file, facilityId);
          
          if (url) {
            uploadedUrls.push(url);
          } else {
            errors.push(`Failed to upload ${file.name}`);
          }

          // Update progress
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }

        if (errors.length > 0) {
          setError(errors.join(', '));
        }

        return uploadedUrls;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error uploading images:', err);
        return [];
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [uploadImage]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    uploadImage,
    uploadImages,
    isUploading,
    uploadProgress,
    error,
    clearError,
  };
};