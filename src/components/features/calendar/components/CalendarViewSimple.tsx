"use client";

import React from "react";

import { Card } from '@/components/ui/card';
import { ViewHeader } from "@/components/features/search/components/ViewHeader";

interface CalendarViewProps {
  readonly date?: Date;
  readonly facilityType: string;
  readonly location: string;
  readonly accessibility: string;
  readonly capacity: readonly number[];
  readonly viewMode: "grid" | "map" | "calendar" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

export const CalendarViewSimple: React.FC<CalendarViewProps> = ({
  viewMode,
  setViewMode,
}): JSX.Element => {
  return (
    <div className="max-w-7xl mx-auto px-4 my-[12px]">
      <ViewHeader 
        facilityCount={5}
        isLoading={false}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <Card className="p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Kalender Test</h3>
          <p className="text-gray-600">Enkel kalender-visning for testing</p>
          
          <div className="mt-8 grid grid-cols-7 gap-2">
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((day, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded text-center font-medium">
                {day}
              </div>
            ))}
            
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="p-2 bg-white border rounded text-center text-sm">
                {8 + i}:00
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
