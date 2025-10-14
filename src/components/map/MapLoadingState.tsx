"use client";

// External imports
import React from 'react';
import { Grid3X3, List, Map, Calendar } from 'lucide-react';

// Sibling imports
import { Card } from '@/components/ui/card';

interface MapLoadingStateProps {
  readonly viewMode: "grid" | "map" | "calendar" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

export const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  viewMode,
  setViewMode
}): JSX.Element => {
  return (
    <div className="max-w-7xl mx-auto px-4 my-[12px]">
      {/* ViewHeader placeholder */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            {(['grid', 'list', 'map', 'calendar'] as const).map((mode) => {
              const Icon = mode === 'grid' ? Grid3X3 : mode === 'list' ? List : mode === 'map' ? Map : Calendar;
              return (
                <button
                  key={mode}
                  onClick={(): void => setViewMode(mode)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map loading placeholder */}
      <Card className="h-[600px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Laster kart...</h3>
          <p className="text-gray-600">Setter opp kartet og henter fasiliteter</p>
        </div>
      </Card>
    </div>
  );
};
