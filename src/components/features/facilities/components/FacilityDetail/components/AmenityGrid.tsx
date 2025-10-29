/**
 * AmenityGrid Component
 *
 * Reusable component for displaying amenities in a consistent grid layout.
 * Supports different color variants and icon rendering.
 */

import React from 'react';
import { Wifi, Car, Camera, Volume2, CheckCircle } from 'lucide-react';
import { getAmenityIconType, type AmenityIconType } from '@/utils/facility/amenityIconUtils';

interface AmenityGridProps {
  readonly items: readonly string[];
  readonly variant?: 'default' | 'blue' | 'green';
  readonly emptyMessage?: string;
}

/**
 * Get the CSS classes for a specific variant
 */
const getVariantClasses = (variant: 'default' | 'blue' | 'green'): { readonly container: string; readonly icon: string } => {
  switch (variant) {
    case 'blue':
      return {
        container: 'bg-blue-50',
        icon: 'text-blue-600'
      };
    case 'green':
      return {
        container: 'bg-green-50',
        icon: 'text-green-600'
      };
    case 'default':
    default:
      return {
        container: 'bg-gray-50',
        icon: 'text-green-500'
      };
  }
};

/**
 * Get the icon JSX element based on icon type
 */
const getIconElement = (iconType: AmenityIconType): JSX.Element => {
  switch (iconType) {
    case 'wifi':
      return <Wifi className="h-4 w-4" />;
    case 'car':
      return <Car className="h-4 w-4" />;
    case 'camera':
      return <Camera className="h-4 w-4" />;
    case 'volume':
      return <Volume2 className="h-4 w-4" />;
    case 'check':
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

/**
 * Renders a grid of amenities with icons and labels
 */
export const AmenityGrid: React.FC<AmenityGridProps> = ({
  items,
  variant = 'default',
  emptyMessage
}): JSX.Element | null => {
  // If no items and no empty message, don't render anything
  if (items.length === 0 && !emptyMessage) {
    return null;
  }

  // If no items but there's an empty message, show it
  if (items.length === 0 && emptyMessage) {
    return (
      <p className="text-gray-600">{emptyMessage}</p>
    );
  }

  const classes = getVariantClasses(variant);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, index) => {
        const iconType = getAmenityIconType(item);
        return (
          <div
            key={index}
            className={`flex items-center p-3 ${classes.container} rounded-lg`}
          >
            <div className={`${classes.icon} mr-3`}>
              {getIconElement(iconType)}
            </div>
            <span className="text-gray-700">{item}</span>
          </div>
        );
      })}
    </div>
  );
};
