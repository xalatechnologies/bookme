/**
 * AmenityGrid Component
 *
 * Reusable component for displaying amenities in a consistent grid layout.
 * Supports different color variants and icon rendering.
 */

import React from 'react';
import { 
  Wifi, 
  Car, 
  Camera, 
  Volume2, 
  CheckCircle,
  Monitor,
  Utensils,
  Coffee,
  Lock,
  ShowerHead,
  Waves,
  Users,
  Tent,
  Home,
  Wrench,
  Shield,
  Briefcase,
  Video,
  Lightbulb,
  Circle,
  Volleyball
} from 'lucide-react';
import { getAmenityIconType, type AmenityIconType } from '@/utils/facility/amenityIconUtils';
import { useAmenityTranslation } from '@/hooks/shared/useAmenityTranslation';

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
    // Technology & Media
    case 'wifi':
      return <Wifi className="h-4 w-4" />;
    case 'projector':
      return <Monitor className="h-4 w-4" />;
    case 'camera':
      return <Camera className="h-4 w-4" />;
    case 'sound':
      return <Volume2 className="h-4 w-4" />;
    case 'screen':
      return <Monitor className="h-4 w-4" />;
    case 'whiteboard':
      return <Monitor className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    
    // Facilities & Infrastructure
    case 'car':
      return <Car className="h-4 w-4" />;
    case 'toilet':
      return <Users className="h-4 w-4" />;
    case 'kitchen':
      return <Utensils className="h-4 w-4" />;
    case 'cafeteria':
      return <Coffee className="h-4 w-4" />;
    case 'locker':
      return <Lock className="h-4 w-4" />;
    case 'shower':
      return <ShowerHead className="h-4 w-4" />;
    case 'light':
      return <Lightbulb className="h-4 w-4" />;
    
    // Sports & Activities
    case 'football':
      return <Circle className="h-4 w-4" />;
    case 'basketball':
      return <Circle className="h-4 w-4" />;
    case 'volleyball':
      return <Volleyball className="h-4 w-4" />;
    case 'pool':
      return <Waves className="h-4 w-4" />;
    case 'tribune':
      return <Users className="h-4 w-4" />;
    case 'stage':
      return <Tent className="h-4 w-4" />;
    case 'grass':
      return <Home className="h-4 w-4" />;
    case 'indoor':
      return <Home className="h-4 w-4" />;
    
    // Safety & Equipment
    case 'equipment':
      return <Wrench className="h-4 w-4" />;
    case 'safety':
      return <Shield className="h-4 w-4" />;
    case 'professional':
      return <Briefcase className="h-4 w-4" />;
    
    // Default
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
  const translateAmenity = useAmenityTranslation();
  
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
            <span className="text-gray-700">{translateAmenity(item)}</span>
          </div>
        );
      })}
    </div>
  );
};