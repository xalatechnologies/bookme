"use client";

// External libraries
import React from "react";

// Internal libraries/utilities
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types
import { IAvailabilityLegendProps } from "./types";

/**
 * Availability legend component for calendar
 * 
 * Displays a legend explaining the different colors and statuses
 * used in the calendar grid. Helps users understand what each
 * color represents.
 * 
 * Features:
 * - Color-coded status explanations
 * - Holiday and conflict information
 * - Responsive design
 * - Accessibility support
 * 
 * @param props - Availability legend props
 */
export const AvailabilityLegend: React.FC<IAvailabilityLegendProps> = ({
  showConflictInfo = true,
  showHolidayInfo = true,
}) => {
  const legendItems = [
    {
      status: "available" as const,
      label: "Ledig",
      description: "Tilgjengelig for booking",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    {
      status: "booked" as const,
      label: "Opptatt",
      description: "Allerede booket",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    {
      status: "selected" as const,
      label: "Valgt",
      description: "Du har valgt dette tidspunktet",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      status: "unavailable" as const,
      label: "Ikke tilgjengelig",
      description: "Ikke tilgjengelig (helg, ferie, fortid)",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
  ];

  if (showConflictInfo) {
    legendItems.push({
      status: "conflict" as const,
      label: "Konflikt",
      description: "Har konflikt med andre bookinger",
      className: "bg-orange-100 text-orange-800 border-orange-200",
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <div className="h-2 w-2 bg-gray-400 rounded-full" />
          Forklaring av farger
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-3">
          {legendItems.map((item) => (
            <Badge 
              key={item.status}
              className={`${item.className} text-xs font-medium`}
            >
              {item.label}
            </Badge>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 flex flex-wrap gap-4">
            <span>• Klikk på ledige tidspunkter for å velge dem</span>
            <span>• Du kan velge flere tidspunkter samtidig ved å dra og slippe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityLegend;
