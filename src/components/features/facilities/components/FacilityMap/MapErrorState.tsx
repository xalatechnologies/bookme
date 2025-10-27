"use client";

// External imports
import React from 'react';
import { Grid3X3, List, Map, Calendar } from 'lucide-react';

// Sibling imports
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MapErrorStateProps {
  readonly viewMode: "grid" | "map" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
  readonly error: string;
  readonly onRetry: () => void;
}

export const MapErrorState: React.FC<MapErrorStateProps> = ({
  viewMode,
  setViewMode,
  error,
  onRetry
}): JSX.Element => {
  return (
    <div className="max-w-7xl mx-auto px-4 my-[12px]">
      {/* ViewHeader placeholder */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Kart ikke tilgjengelig</h2>
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

      {/* Error state */}
      <Card className="h-[600px] flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Kunne ikke laste kart</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={onRetry} className="w-full">
              Prøv igjen
            </Button>
            <Button 
              variant="outline" 
              onClick={(): void => setViewMode('grid')}
              className="w-full"
            >
              Gå til rutenettvisning
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
