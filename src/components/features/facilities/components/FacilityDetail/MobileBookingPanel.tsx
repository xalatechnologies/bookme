"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
   
  facilityId: _facilityId,
  capacity,
  area,
  openingHours
}): JSX.Element => {
  const { t } = useTranslation(['facility']);
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
            <p className="text-sm text-gray-600">{t('facility:mobile_panel.see_booking_options')}</p>
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
                <p>{t('facility:mobile_panel.booking_coming_soon')}</p>
                <p className="text-sm mt-2">{t('facility:mobile_panel.capacity_area', { capacity, area })}</p>
                <p className="text-sm">{t('facility:mobile_panel.opening_hours_label', { hours: openingHours })}</p>
              </div>
              <Button className="w-full" disabled>
                {t('facility:mobile_panel.book_now_coming_soon')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};