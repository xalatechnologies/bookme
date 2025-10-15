"use client";

import React, { useState } from "react";

import { GalleryGrid } from "./gallery/GalleryGrid";
import { MobileGallery } from "./gallery/MobileGallery";
import { GalleryModal } from "./gallery/GalleryModal";

interface AirBnbStyleGalleryProps {
  readonly images: readonly string[];
  readonly facilityName: string;
}

export const AirBnbStyleGallery: React.FC<AirBnbStyleGalleryProps> = ({ 
  images, 
  facilityName 
}): JSX.Element => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const nextImage = (): void => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (): void => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index?: number): void => {
    if (typeof index === 'number') {
      setActiveImageIndex(index);
    }
    setShowModal(true);
  };

  const closeModal = (): void => setShowModal(false);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!showModal) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleShare = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: facilityName,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      // Handle share cancellation or other errors silently
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {
        }
      }
    }
  };

  return (
    <>
      {/* Desktop Gallery */}
      <GalleryGrid
        images={images}
        facilityName={facilityName}
        activeImageIndex={activeImageIndex}
        onImageClick={openModal}
        onShowAllClick={() => openModal(0)}
        onPrevImage={prevImage}
        onNextImage={nextImage}
      />

      {/* Mobile Gallery */}
      <MobileGallery
        images={images}
        facilityName={facilityName}
        activeImageIndex={activeImageIndex}
        onImageClick={() => openModal(0)}
        onPrevImage={prevImage}
        onNextImage={nextImage}
        onShowAllClick={() => openModal(0)}
        onThumbnailClick={setActiveImageIndex}
      />

      {/* Modal */}
      {showModal && (
        <GalleryModal
          images={images}
          facilityName={facilityName}
          activeImageIndex={activeImageIndex}
          onClose={closeModal}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onImageSelect={setActiveImageIndex}
          onShare={handleShare}
        />
      )}
    </>
  );
};