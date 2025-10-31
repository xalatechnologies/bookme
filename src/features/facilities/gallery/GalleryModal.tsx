"use client";

import React from "react";
import { ArrowLeft, ArrowRight, X, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

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

export const GalleryModal: React.FC<GalleryModalProps> = ({ 
  images, 
  facilityName, 
  activeImageIndex, 
  onClose, 
  onPrevImage, 
  onNextImage, 
  onImageSelect,
  onShare 
}): JSX.Element => {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col backdrop-blur-sm">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 text-white">
        <button
          onClick={onClose}
          className="p-3 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <span className="text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
            {activeImageIndex + 1} / {images.length}
          </span>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-105"
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
              aria-label="Previous image"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button
              onClick={onNextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-4 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110"
              aria-label="Next image"
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
                  alt={`${facilityName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
