"use client";

import React, { useState, createContext, useContext } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface IAdminLayoutProps {
  readonly children: React.ReactNode;
}

interface ISidebarContext {
  readonly isCollapsed: boolean;
  readonly toggleCollapse: () => void;
}

const SidebarContext = createContext<ISidebarContext | undefined>(undefined);

export const useSidebar = (): ISidebarContext => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

const AdminLayout = ({ children }: IAdminLayoutProps): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <AdminHeader />
        </header>
        
        {/* Fixed Sidebar */}
        <aside className="fixed top-[73px] left-0 bottom-0 z-40">
          <AdminSidebar />
        </aside>
        
        {/* Main content with proper spacing */}
        <main className={`mt-[73px] flex-1 flex flex-col min-h-[calc(100vh-73px)] transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default AdminLayout;