"use client";

import React from "react";
import { Grid3x3, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface GalleryGridProps {
  readonly images: readonly string[];
  readonly facilityName: string;
  readonly onImageClick: (index: number) => void;
  readonly onShowAllClick: () => void;
  readonly activeImageIndex?: number;
  readonly onPrevImage?: () => void;
  readonly onNextImage?: () => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  images, 
  facilityName, 
  onImageClick, 
  onShowAllClick,
  activeImageIndex = 0,
  onPrevImage,
  onNextImage
}): JSX.Element => {
  return (
    <div className="hidden md:block h-96 w-full relative cursor-pointer rounded-2xl overflow-hidden shadow-xl group" onClick={() => onImageClick(0)}>
      <img 
        src={images[activeImageIndex]} 
        alt={`${facilityName} - Main view`}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Navigation arrows - only show if more than 1 image */}
      {images.length > 1 && onPrevImage && onNextImage && (
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPrevImage();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNextImage();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      
      {/* Show all photos button - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute top-6 right-6">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/95 hover:bg-white text-gray-900 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/20 rounded-lg hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onShowAllClick();
            }}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Show all {images.length} photos
          </Button>
        </div>
      )}

      {/* Thumbnail navigation - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onImageClick(index);
              }}
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-110 ${
                index === activeImageIndex 
                  ? 'border-white shadow-lg scale-110' 
                  : 'border-white/50 hover:border-white/80'
              }`}
            >
              <img 
                src={image} 
                alt={`${facilityName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 5 && (
            <div className="flex items-center justify-center w-16 h-12 bg-black/30 backdrop-blur-sm rounded-lg border-2 border-white/50">
              <span className="text-white text-xs font-medium">
                +{images.length - 5}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
