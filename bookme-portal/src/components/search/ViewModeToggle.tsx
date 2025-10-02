"use client";

import React from "react";
import { Grid3X3, List, Map, Calendar } from "lucide-react";

import { useTranslation } from "@/i18n";

import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  readonly viewMode: "grid" | "map" | "calendar" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }): JSX.Element => {
  const { t } = useTranslation();

  const viewModes = [
    { key: "grid" as const, icon: Grid3X3, label: "Rutenett visning" },
    { key: "list" as const, icon: List, label: "Liste visning" },
    { key: "map" as const, icon: Map, label: "Kart" },
    { key: "calendar" as const, icon: Calendar, label: "Kalender" },
  ];

  return (
    <div className="flex border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
      {viewModes.map(({ key, icon: Icon, label }) => (
        <Button
          key={key}
          variant={viewMode === key ? "default" : "ghost"}
          onClick={() => setViewMode(key)}
          className={`h-14 px-4 rounded-none border-0 text-base font-medium transition-all duration-200 ${
            viewMode === key
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-gray-600 hover:bg-slate-50 hover:text-slate-700'
          }`}
          aria-label={label}
          title={label}
        >
          <Icon className="h-5 w-5" />
        </Button>
      ))}
    </div>
  );
};

