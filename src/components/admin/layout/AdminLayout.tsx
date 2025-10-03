"use client";

import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface IAdminLayoutProps {
  readonly children: React.ReactNode;
}

const AdminLayout = ({ children }: IAdminLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <AdminHeader />
      <div className="grid grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r border-gray-200 dark:border-gray-700">
          <AdminSidebar />
        </aside>
        <main className="p-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;