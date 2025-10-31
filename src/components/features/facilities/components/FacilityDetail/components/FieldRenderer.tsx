/**
 * FieldRenderer Component
 *
 * Reusable component for rendering facility field information with consistent formatting.
 * Handles different field types (text, number, boolean, array) with appropriate icons and units.
 */

import React from 'react';
import { Users, MapPin } from 'lucide-react';
import type { FieldConfig } from '@/utils/facility/fieldMappingUtils';
import {
  getFieldValue,
  getFieldIconType,
  getFieldUnit,
  getFieldLabel,
  formatFieldValue,
  type FieldValueContext,
  type FieldIconType
} from '@/utils/facility/fieldMappingUtils';
import { useTranslation } from '@/i18n';

interface FieldRendererProps {
  readonly field: FieldConfig;
  readonly capacity?: number;
  readonly area?: string;
}

/**
 * Get the icon JSX element based on icon type
 */
const getIconElement = (iconType: FieldIconType): JSX.Element => {
  switch (iconType) {
    case 'users':
      return <Users className="h-5 w-5 text-gray-400 mr-3" />;
    case 'mapPin':
      return <MapPin className="h-5 w-5 text-gray-400 mr-3" />;
    case 'money':
      return <span className="text-gray-400 mr-3">💰</span>;
    case 'star':
      return <span className="text-yellow-500 mr-3">★</span>;
    case 'document':
      return <span className="text-gray-400 mr-3">📝</span>;
    case 'building':
      return <span className="text-gray-400 mr-3">🏢</span>;
    case 'accessibility':
      return <span className="text-blue-500 mr-3">♿</span>;
    case 'parking':
      return <span className="text-gray-400 mr-3">🚗</span>;
    case 'wifi':
      return <span className="text-gray-400 mr-3">📶</span>;
    case 'projector':
      return <span className="text-gray-400 mr-3">📽️</span>;
    case 'whiteboard':
      return <span className="text-gray-400 mr-3">📋</span>;
    case 'sound':
      return <span className="text-gray-400 mr-3">🔊</span>;
    case 'snowflake':
      return <span className="text-blue-400 mr-3">❄️</span>;
    case 'fire':
      return <span className="text-orange-400 mr-3">🔥</span>;
    case 'sun':
      return <span className="text-yellow-400 mr-3">☀️</span>;
    case 'window':
      return <span className="text-gray-400 mr-3">🪟</span>;
    case 'door':
      return <span className="text-gray-400 mr-3">🚪</span>;
    case 'ruler':
      return <span className="text-gray-400 mr-3">📏</span>;
    case 'palette':
      return <span className="text-gray-400 mr-3">🎨</span>;
    case 'brush':
      return <span className="text-gray-400 mr-3">🖌️</span>;
    default:
      return <span className="text-gray-400 mr-3">📋</span>;
  }
};

/**
 * Renders a single facility field with icon, label, and formatted value
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  capacity,
  area
}): JSX.Element => {
  const { t } = useTranslation();

  const context: FieldValueContext = {
    capacity,
    area,
    t
  };

  const value = getFieldValue(field, context);
  const iconType = getFieldIconType(field.key);
  const unit = getFieldUnit(field.key, t);
  const label = getFieldLabel(field, t);

  return (
    <div className="flex items-center">
      {getIconElement(iconType)}
      <div>
        <span className="font-medium">{label}:</span>
        <span className="ml-2 text-gray-600">
          {formatFieldValue(value, unit)}
        </span>
      </div>
    </div>
  );
};
