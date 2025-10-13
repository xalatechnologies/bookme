"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MobileBookingPanelProps {
  readonly facilityName: string;
  readonly facilityId: string;
  readonly capacity: number;
  readonly area: string;
  readonly openingHours: string;
}

export const MobileBookingPanel: React.FC<MobileBookingPanelProps> = ({
  facilityName,
  facilityId,
  capacity,
  area,
  openingHours
}): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
      {/* Collapsed Header */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left p-0 h-auto"
        >
          <div>
            <h3 className="font-semibold text-gray-900">{facilityName}</h3>
            <p className="text-sm text-gray-600">Se booking alternativer</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="max-h-[70vh] overflow-y-auto border-t bg-gray-50">
          <div className="p-4">
            {/* Placeholder for PersistentBookingSidebar - will be implemented later */}
            <div className="space-y-4">
              <div className="text-center text-gray-600">
                <p>Booking funksjonalitet kommer snart...</p>
                <p className="text-sm mt-2">Kapasitet: {capacity} | Areal: {area} m²</p>
                <p className="text-sm">Åpningstider: {openingHours}</p>
              </div>
              <Button className="w-full" disabled>
                Book nå (kommer snart)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};