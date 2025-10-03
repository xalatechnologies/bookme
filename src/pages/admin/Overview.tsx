"use client";

import React from "react";

interface IOverviewProps {
  readonly children?: never;
}

const Overview = (_props: IOverviewProps): JSX.Element => {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Oversikt</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Velkommen til BookMe Admin-dashbordet. Her finner du en rask oversikt over systemet.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold">Totalt antall lokaler</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Antall aktive lokaler i systemet.</p>
          <p className="text-4xl font-bold mt-2">124</p>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold">Nye bookinger i dag</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Antall bookinger mottatt i dag.</p>
          <p className="text-4xl font-bold mt-2">18</p>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold">Ventende godkjenninger</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Antall bookinger som krever godkjenning.</p>
          <p className="text-4xl font-bold mt-2">5</p>
        </div>
        <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold">Aktive brukere</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Antall unike brukere logget inn siste 24 timer.</p>
          <p className="text-4xl font-bold mt-2">78</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;