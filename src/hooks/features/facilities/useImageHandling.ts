import { useState, useRef, useCallback } from "react";

/**
 * Image validation error types
 */
export interface ImageValidationError {
  readonly file: string;
  readonly error: string;
}

/**
 * Image handling hook return type
 */
export interface UseImageHandlingReturn {
  readonly images: string[];
  readonly draggedIndex: number | null;
  readonly validationErrors: ImageValidationError[];
  readonly isUploading: boolean;
  readonly fileInputRef: React.RefObject<HTMLInputElement>;
  readonly handleAddImage: () => void;
  readonly handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleRemoveImage: (index: number) => void;
  readonly handleDragStart: (index: number) => void;
  readonly handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly handleDrop: (dropIndex: number) => void;
  readonly setImages: React.Dispatch<React.SetStateAction<string[]>>;
  readonly clearValidationErrors: () => void;
}

/**
 * Image handling configuration
 */
export interface ImageHandlingConfig {
  readonly maxFileSize?: number; // in bytes, default 5MB
  readonly allowedFormats?: string[]; // default ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  readonly maxImages?: number; // default 10
  readonly initialImages?: string[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<ImageHandlingConfig, 'initialImages'>> = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxImages: 10,
};

/**
 * Custom hook for handling image upload, preview, validation, and reordering
 *
 * Features:
 * - Multiple image upload with FileReader API
 * - Image format validation (JPEG, PNG, GIF, WebP)
 * - File size validation (default 5MB max)
 * - Drag-and-drop reordering
 * - Image removal
 * - Upload state management
 * - Validation error tracking
 *
 * @param config - Image handling configuration
 * @returns Image handling functions and state
 *
 * @example
 * ```tsx
 * const {
 *   images,
 *   handleAddImage,
 *   handleFileChange,
 *   handleRemoveImage,
 *   fileInputRef,
 * } = useImageHandling({
 *   initialImages: facility.images,
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxImages: 5,
 * });
 * ```
 */
export const useImageHandling = (
  config: ImageHandlingConfig = {}
): UseImageHandlingReturn => {
  const {
    maxFileSize = DEFAULT_CONFIG.maxFileSize,
    allowedFormats = DEFAULT_CONFIG.allowedFormats,
    maxImages = DEFAULT_CONFIG.maxImages,
    initialImages = [],
  } = config;

  const [images, setImages] = useState<string[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<ImageValidationError[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate a single file
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize) {
        const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        return `File size exceeds ${sizeMB}MB limit`;
      }

      // Check file format
      if (!allowedFormats.includes(file.type)) {
        const formatsStr = allowedFormats
          .map((format) => format.split('/')[1].toUpperCase())
          .join(', ');
        return `Invalid format. Allowed: ${formatsStr}`;
      }

      return null;
    },
    [maxFileSize, allowedFormats]
  );

  /**
   * Trigger file input click
   */
  const handleAddImage = useCallback((): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Handle file selection and validation
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Clear previous validation errors
      setValidationErrors([]);

      // Check if adding these files would exceed max images
      if (images.length + files.length > maxImages) {
        setValidationErrors([
          {
            file: 'multiple',
            error: `Maximum ${maxImages} images allowed`,
          },
        ]);
        return;
      }

      setIsUploading(true);

      const newImages: string[] = [];
      const errors: ImageValidationError[] = [];
      let processedCount = 0;

      // Process each file
      Array.from(files).forEach((file) => {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          errors.push({
            file: file.name,
            error: validationError,
          });
          processedCount++;

          // If all files processed, update state
          if (processedCount === files.length) {
            setValidationErrors(errors);
            setIsUploading(false);
          }
          return;
        }

        // Read file as data URL
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>): void => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
          }

          processedCount++;

          // If all files have been processed
          if (processedCount === files.length) {
            // Update images state with all new images
            if (newImages.length > 0) {
              setImages((prev) => [...prev, ...newImages]);
            }

            // Update validation errors if any
            if (errors.length > 0) {
              setValidationErrors(errors);
            }

            setIsUploading(false);

            // Reset file input
            if (e.target) {
              e.target.value = '';
            }
          }
        };

        reader.onerror = (): void => {
          errors.push({
            file: file.name,
            error: 'Failed to read file',
          });
          processedCount++;

          if (processedCount === files.length) {
            setValidationErrors(errors);
            setIsUploading(false);
          }
        };

        reader.readAsDataURL(file);
      });
    },
    [images.length, maxImages, validateFile]
  );

  /**
   * Handle removing an image by index
   */
  const handleRemoveImage = useCallback((index: number): void => {
    setImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  /**
   * Handle drag start for reordering
   */
  const handleDragStart = useCallback((index: number): void => {
    setDraggedIndex(index);
  }, []);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  }, []);

  /**
   * Handle drop event for reordering
   */
  const handleDrop = useCallback(
    (dropIndex: number): void => {
      if (draggedIndex === null) return;

      setImages((prev) => {
        const updated = [...prev];
        const draggedImage = updated[draggedIndex];

        // Remove the dragged image
        updated.splice(draggedIndex, 1);
        // Insert it at the new position
        updated.splice(dropIndex, 0, draggedImage);

        return updated;
      });

      setDraggedIndex(null);
    },
    [draggedIndex]
  );

  /**
   * Clear all validation errors
   */
  const clearValidationErrors = useCallback((): void => {
    setValidationErrors([]);
  }, []);

  return {
    images,
    draggedIndex,
    validationErrors,
    isUploading,
    fileInputRef,
    handleAddImage,
    handleFileChange,
    handleRemoveImage,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setImages,
    clearValidationErrors,
  };
};
