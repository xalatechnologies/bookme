"use client";

import React from "react";
import { Grid3X3, List, Map } from "lucide-react";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  readonly viewMode: "grid" | "map" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }): JSX.Element => {
  const { t } = useTranslation('common');

  const viewModes = [
    { key: "grid" as const, icon: Grid3X3, label: t('view_modes.grid') },
    { key: "list" as const, icon: List, label: t('view_modes.list') },
    { key: "map" as const, icon: Map, label: t('view_modes.map') },
  ];

  return (
    <div className="flex border border-slate-300 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-sm">
      {viewModes.map(({ key, icon: Icon, label }) => (
        <Button
          key={key}
          variant={viewMode === key ? "default" : "ghost"}
          onClick={() => setViewMode(key)}
          className={`h-10 sm:h-12 md:h-14 px-2 sm:px-3 md:px-4 rounded-none border-0 text-xs sm:text-sm md:text-base font-medium transition-all duration-200 ${
            viewMode === key
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-gray-600 hover:bg-slate-50 hover:text-slate-700'
          }`}
          aria-label={label}
          title={label}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      ))}
    </div>
  );
};
