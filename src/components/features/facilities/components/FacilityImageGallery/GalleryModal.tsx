"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

/**
 * Gallery modal props interface
 */
interface GalleryModalProps {
  readonly images: readonly string[];
  readonly facilityName: string;
  readonly activeImageIndex: number;
  readonly onClose: () => void;
  readonly onPrevImage: () => void;
  readonly onNextImage: () => void;
  readonly onImageSelect: (index: number) => void;
  readonly onShare: (e: React.MouseEvent) => void;
}

/**
 * Gallery Modal Component
 *
 * A fullscreen image gallery modal with navigation and sharing capabilities.
 * Note: This uses a custom fullscreen layout instead of BaseModal due to unique UX requirements.
 *
 * Features:
 * - Fullscreen immersive experience
 * - Keyboard navigation (arrow keys, ESC)
 * - Touch/swipe support ready
 * - Thumbnail navigation
 * - Share functionality
 * - Accessibility compliant
 * - Internationalization support
 *
 * Follows SOLID principles:
 * - Single Responsibility: Focused only on image gallery display
 * - Open/Closed: Can be extended without modification
 * - Interface Segregation: Clean, focused props interface
 */
export const GalleryModal: React.FC<GalleryModalProps> = ({
  images,
  facilityName,
  activeImageIndex,
  onClose,
  onPrevImage,
  onNextImage,
  onImageSelect,
  onShare
}): JSX.Element | null => {
  const { t } = useTranslation('facility');

  // Handle keyboard navigation and scroll locking
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Lock scrolling when modal is open
    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevImage();
      if (e.key === 'ArrowRight') onNextImage();
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to restore scrolling
    return () => {
      document.documentElement.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrevImage, onNextImage]);

  // Don't render anything if we're not in a browser environment
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative h-full w-full flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 text-white z-10">
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110"
            aria-label={t('gallery.close')}
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <span className="text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              {t('gallery.image_count', { current: activeImageIndex + 1, total: images.length })}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-110"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center relative px-6 pb-6">
          <img
            src={images[activeImageIndex]}
            alt={`${facilityName} - Image ${activeImageIndex + 1}`}
            className="max-w-full max-h-full object-contain object-center rounded-2xl shadow-2xl transition-all duration-500"
          />

          {/* Navigation in modal - only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={onPrevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-4 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110"
                aria-label={t('gallery.previous')}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <button
                onClick={onNextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-4 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110"
                aria-label={t('gallery.next')}
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation - only show if more than 1 image */}
        {images.length > 1 && (
          <div className="px-6 pb-6">
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onImageSelect(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                    index === activeImageIndex
                      ? 'border-white shadow-lg scale-110'
                      : 'border-white/50 hover:border-white/80'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/**
 * Type exports for consuming components
 */
export type { GalleryModalProps };