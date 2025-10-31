"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MobileGalleryProps {
  readonly images: readonly string[];
  readonly facilityName: string;
  readonly activeImageIndex: number;
  readonly onImageClick: () => void;
  readonly onPrevImage: () => void;
  readonly onNextImage: () => void;
  readonly onShowAllClick: () => void;
  readonly onThumbnailClick: (index: number) => void;
}

export const MobileGallery: React.FC<MobileGalleryProps> = ({ 
  images, 
  facilityName, 
  activeImageIndex, 
  onImageClick, 
  onPrevImage, 
  onNextImage, 
  onShowAllClick,
  onThumbnailClick 
}): JSX.Element => {
  return (
    <div className="md:hidden h-64 relative cursor-pointer w-full rounded-2xl overflow-hidden shadow-xl" onClick={onImageClick}>
      <img 
        src={images[activeImageIndex]} 
        alt={`${facilityName} - Image ${activeImageIndex + 1}`}
        className="w-full h-full object-cover object-center transition-transform duration-500"
      />
      
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      
      {/* Mobile navigation - only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPrevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      
      {/* Mobile show all button - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/95 hover:bg-white text-gray-900 shadow-xl backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-300 hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onShowAllClick();
            }}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            {images.length}
          </Button>
        </div>
      )}
      
      {/* Mobile thumbnail indicator - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onThumbnailClick(index);
              }}
              className={`w-12 h-9 rounded-md overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                index === activeImageIndex 
                  ? 'border-white shadow-lg scale-110' 
                  : 'border-white/60 hover:border-white/80'
              }`}
            >
              <img 
                src={image} 
                alt={`${facilityName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 4 && (
            <div className="flex items-center justify-center w-12 h-9 bg-black/30 backdrop-blur-sm rounded-md border-2 border-white/60">
              <span className="text-white text-xs font-medium">
                +{images.length - 4}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
