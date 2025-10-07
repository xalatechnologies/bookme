"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { X, Trash2, Calendar, Clock } from "lucide-react";
import { ISelectedSlotsDisplayProps } from "./types";

/**
 * Selected slots display component
 * 
 * Shows all selected time slots in a organized list with
 * options to remove individual slots or clear all selections.
 * 
 * Features:
 * - List of selected time slots
 * - Individual slot removal
 * - Clear all functionality
 * - Responsive design
 * - Loading state support
 * 
 * @param props - Selected slots display props
 */
export const SelectedSlotsDisplay: React.FC<ISelectedSlotsDisplayProps> = ({
  selectedSlots,
  onRemoveSlot,
  onClearAll,
  isLoading = false,
}) => {
  /**
   * Format time slot for display
   * 
   * @param slot - Selected time slot
   * @returns Formatted string for display
   */
  const formatTimeSlot = (slot: ISelectedTimeSlot): string => {
    const date = format(slot.date, "dd. MMM", { locale: nb });
    const time = slot.timeSlot.split('-')[0]; // Get start time
    return `${date} kl. ${time}`;
  };

  /**
   * Get duration text for display
   * 
   * @param duration - Duration in hours
   * @returns Formatted duration text
   */
  const getDurationText = (duration: number): string => {
    if (duration === 1) return "1 time";
    return `${duration} timer`;
  };

  /**
   * Get price text for display
   * 
   * @param slot - Selected time slot
   * @returns Formatted price text
   */
  const getPriceText = (slot: ISelectedTimeSlot): string => {
    const totalPrice = slot.pricePerHour * slot.duration;
    return `${totalPrice} kr`;
  };

  if (selectedSlots.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Valgte tidspunkter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Ingen tidspunkter valgt
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Velg tidspunkter i kalenderen for å se dem her
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Valgte tidspunkter ({selectedSlots.length})
          </CardTitle>
          {selectedSlots.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Fjern alle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {formatTimeSlot(slot)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getDurationText(slot.duration)}
                  </Badge>
                  <span className="text-xs text-blue-700">
                    {getPriceText(slot)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveSlot(slot.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 p-1 h-8 w-8"
                aria-label={`Fjern ${formatTimeSlot(slot)}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Totalt antall timer:</span>
            <span className="font-medium text-gray-900">
              {selectedSlots.reduce((total, slot) => total + slot.duration, 0)} timer
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">Totalpris:</span>
            <span className="font-semibold text-gray-900">
              {selectedSlots.reduce((total, slot) => total + (slot.pricePerHour * slot.duration), 0)} kr
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedSlotsDisplay;
