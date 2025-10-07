"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Repeat } from 'lucide-react';
import type { BookingType } from '@/types/booking';

interface BookingTypeSelectorProps {
  readonly selectedType: BookingType;
  readonly onTypeChange: (type: BookingType) => void;
  readonly disabled?: boolean;
}

/**
 * BookingTypeSelector Component
 * 
 * Allows users to select between one-time and recurring booking types.
 * Provides clear visual distinction between the two options with icons and descriptions.
 * 
 * Features:
 * - Visual selection between one-time and recurring bookings
 * - Clear descriptions for each booking type
 * - Disabled state support
 * - Accessible design with proper ARIA labels
 * 
 * Usage:
 * - Use selectedType to control the current selection
 * - Use onTypeChange to handle selection changes
 * - Use disabled to prevent interaction when needed
 */
export function BookingTypeSelector({ 
  selectedType, 
  onTypeChange, 
  disabled = false 
}: BookingTypeSelectorProps): JSX.Element {
  const types = [
    { 
      id: 'one-time' as BookingType, 
      label: 'Enkelt booking', 
      description: 'Én gang booking',
      icon: Calendar
    },
    { 
      id: 'recurring' as BookingType, 
      label: 'Gjentakende booking', 
      description: 'Fast tid som gjentas',
      icon: Repeat
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Bookingtype
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {types.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <Button
                key={type.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => !disabled && onTypeChange(type.id)}
                disabled={disabled}
                className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                    : 'hover:bg-gray-50 border-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-pressed={isSelected}
                aria-label={`Velg ${type.label}`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                <div className="text-center">
                  <span className={`font-medium block ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {type.label}
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                    {type.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Additional information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Enkelt booking:</strong> Book et spesifikt tidspunkt for en enkelt gang.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Gjentakende booking:</strong> Book samme tidspunkt som gjentas over tid (ukentlig, månedlig, etc.).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
