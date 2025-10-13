"use client";

import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface IAdminLayoutProps {
  readonly children: React.ReactNode;
}

const AdminLayout = ({ children }: IAdminLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <AdminHeader />
      <div className="flex h-[calc(100vh-73px)]">
        <AdminSidebar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;