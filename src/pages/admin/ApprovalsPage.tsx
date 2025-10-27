"use client";

import React from "react";
import { RequireRole } from "@/components/features/auth/components/RequireRole";

interface IApprovalsPageProps {
  readonly children?: never;
}

const ApprovalsPage = (_props: IApprovalsPageProps): JSX.Element => {
  return (
    <RequireRole roles={["org-admin","approver"]}>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold">Godkjenninger</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Administrer godkjenninger og arbeidsflyter.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="text-sm font-semibold">Ventende godkjenninger</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="text-sm font-semibold">Godkjent i dag</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
          </div>
          <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="text-sm font-semibold">Avvist i dag</h3>
            <p className="text-2xl font-bold text-red-600">2</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Arbeidsflyt</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                  <div>
                    <h4 className="font-medium">Arbeidsflyt {i}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Beskrivelse av arbeidsflyt</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Rediger</button>
                    <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Deaktiver</button>
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

export default ApprovalsPage;
