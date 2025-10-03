"use client";

import React, { useState } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";

type TView = "list" | "grid" | "map" | "calendar";

interface IFacilitiesPageProps {
  readonly children?: never;
}

const FacilitiesPage = (_props: IFacilitiesPageProps): JSX.Element => {
  const [view, setView] = useState<TView>("grid");

  return (
    <RequireRole roles={["org-admin","facility-manager"]}>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold">Lokaler</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Administrer lokaler, soner og tilgjengelighet.</p>
        </header>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input type="text" placeholder="Søk lokaler…" className="w-full sm:w-auto rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 rounded text-sm ${view === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
              onClick={() => setView("grid")}
            >
              Rutenett
            </button>
            <button
              className={`px-3 py-2 rounded text-sm ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
              onClick={() => setView("list")}
            >
              Liste
            </button>
            <button
              className={`px-3 py-2 rounded text-sm ${view === "map" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
              onClick={() => setView("map")}
            >
              Kart
            </button>
            <button
              className={`px-3 py-2 rounded text-sm ${view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}
              onClick={() => setView("calendar")}
            >
              Kalender
            </button>
            <button className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Nytt lokale</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="text-sm font-semibold">Lokale {i}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kort beskrivelse</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Kapasitet: 40 • Soner: 2</p>
            </div>
          ))}
        </div>
      </div>
    </RequireRole>
  );
};

export default FacilitiesPage;