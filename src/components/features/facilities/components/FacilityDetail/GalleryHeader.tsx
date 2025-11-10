"use client";

import React, { useState } from "react";
import { MapPin, Heart, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFacilityTypeTranslation } from "@/hooks/shared/useFacilityTypeTranslation";
import { GalleryModal } from "@/components/features/facilities/components/FacilityImageGallery/GalleryModal";

interface GalleryHeaderProps {
  title: string;
  venueType: string; // The raw type value
  address: string;
  images: string[];
  isFavorited: boolean;
  onShare: () => void;
  onToggleFavorite: () => void;
}

export default function GalleryHeader({
  title,
  venueType,
  address,
  images,
  isFavorited,
  onShare,
  onToggleFavorite,
}: GalleryHeaderProps): JSX.Element {
  const { t } = useTranslation('common');
  const translateFacilityType = useFacilityTypeTranslation();
  const [showModal, setShowModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Function to handle opening lightbox
  const handleOpenLightbox = (index: number): void => {
    setActiveImageIndex(index);
    setShowModal(true);
  };

  // Function to close modal
  const handleCloseModal = (): void => {
    setShowModal(false);
  };

  // Function to go to previous image
  const handlePrevImage = (): void => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Function to go to next image
  const handleNextImage = (): void => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  // Function to select image
  const handleImageSelect = (index: number): void => {
    setActiveImageIndex(index);
  };

  // Function to handle share in modal
  const handleModalShare = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
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
          // Silent fail
        }
      }
    }
  };

  // Function to render thumbnails based on image count
  const renderThumbnails = () => {
    if (images.length === 1) {
      return null;
    } else if (images.length === 2) {
      return (
        <div 
          className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:opacity-90"
          onClick={() => handleOpenLightbox(1)}
        >
          <img
            src={images[1]}
            alt={`${title} thumbnail`}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      );
    } else if (images.length === 3) {
      return (
        <>
          <div 
            className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:opacity-90"
            onClick={() => handleOpenLightbox(1)}
          >
            <img
              src={images[1]}
              alt={`${title} thumbnail 2`}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div 
            className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:opacity-90"
            onClick={() => handleOpenLightbox(2)}
          >
            <img
              src={images[2]}
              alt={`${title} thumbnail 3`}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </>
      );
    } else if (images.length >= 4) {
      return (
        <>
          <div 
            className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:opacity-90"
            onClick={() => handleOpenLightbox(1)}
          >
            <img
              src={images[1]}
              alt={`${title} thumbnail 2`}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div 
            className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:opacity-90"
            onClick={() => handleOpenLightbox(2)}
          >
            <img
              src={images[2]}
              alt={`${title} thumbnail 3`}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div 
            className="flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-md cursor-pointer hover:opacity-90"
            onClick={() => handleOpenLightbox(3)}
          >
            {/* Background image */}
            <img
              src={images[3]}
              alt={`${title} additional images`}
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            {/* +X text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                +{images.length - 3}
              </span>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <section className="container mx-auto px-4 md:px-6 max-w-7xl">
      {/* Galleri */}
      <div className="grid grid-cols-[3fr_1fr] gap-4 md:gap-6 items-stretch h-[min(60vh,720px)] md:h-[70vh] mb-8 md:mb-10">
        <div className="relative h-full w-full rounded-2xl overflow-hidden">
          <img
            src={images[0]}
            alt={title}
            className="h-full w-full object-cover"
            onClick={() => handleOpenLightbox(0)}
          />
        </div>

        <aside className="min-h-0 h-full overflow-y-auto flex flex-col gap-4 pr-1">
          {renderThumbnails()}
        </aside>
      </div>

      {/* Badge, Title, and Actions */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* Type Badge - only render if type is not empty */}
            {venueType && (
              <Badge variant="outline" className="bg-[#1e3a8a] bg-opacity-10 text-[#1e3a8a] border-[#1e3a8a]">
                {translateFacilityType(venueType)}
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          
          {/* Address */}
          <div className="flex items-center text-gray-600 mt-3">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{address}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFavorite}
            className={`px-3 py-2 h-auto transition-all duration-200 hover:scale-105 ${
              isFavorited
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">
              {isFavorited ? t('actions.like') : t('actions.like')}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="px-3 py-2 h-auto bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 hover:scale-105"
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {t('actions.share')}
            </span>
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <GalleryModal
          images={images}
          facilityName={title}
          activeImageIndex={activeImageIndex}
          onClose={handleCloseModal}
          onPrevImage={handlePrevImage}
          onNextImage={handleNextImage}
          onImageSelect={handleImageSelect}
          onShare={handleModalShare}
        />
      )}
    </section>
  );
}