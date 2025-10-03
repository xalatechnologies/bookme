"use client";

import React from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";

interface IBookingsPageProps {
  readonly children?: never;
}

const BookingsPage = (_props: IBookingsPageProps): JSX.Element => {
  return (
    <RequireRole roles={["org-admin","facility-manager","case-worker"]}>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold">Bookinger</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Se og administrer alle bookinger i systemet.</p>
        </header>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Søk bookinger…" className="flex-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
              <select className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option>Alle statuser</option>
                <option>Ventende</option>
                <option>Godkjent</option>
                <option>Avvist</option>
              </select>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                  <div>
                    <h4 className="font-medium">Booking #{i}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lokale {i} • 15. januar 2024</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Godkjenn</button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Avvis</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
};

export default BookingsPage;
