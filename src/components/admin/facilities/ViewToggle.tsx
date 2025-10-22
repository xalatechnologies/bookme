"use client";

import React from "react";
import { Grid3X3, List, Map } from "lucide-react";

type TView = "grid" | "list" | "map";

interface IViewToggleProps {
  readonly currentView: TView;
  readonly onViewChange: (view: TView) => void;
}

const ViewToggle = ({ currentView, onViewChange }: IViewToggleProps): JSX.Element => {
  const views: readonly { id: TView; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { id: "grid", icon: Grid3X3, label: "Rutenett visning" },
    { id: "list", icon: List, label: "Liste visning" },
    { id: "map", icon: Map, label: "Kart" }
  ];

  return (
    <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      {views.map((view) => {
        const IconComponent = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`px-3 py-2 rounded-none border-0 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            aria-label={view.label}
            title={view.label}
          >
            <IconComponent className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;