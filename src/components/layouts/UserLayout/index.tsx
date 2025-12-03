"use client";

import React, { useState } from "react";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import { UserProfileProvider } from "@/contexts/hooks";
import { SidebarContext } from "./useSidebar";
import { useSidebar } from "./useSidebar";

interface IUserLayoutProps {
  readonly children: React.ReactNode;
}

const UserLayout = ({ children }: IUserLayoutProps): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <UserProfileProvider>
      <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {/* Fixed Header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <UserHeader />
          </header>

          {/* Fixed Sidebar */}
          <aside className="fixed top-[73px] left-0 bottom-0 z-40">
            <UserSidebar />
          </aside>

          {/* Main content with proper spacing */}
          <main className={`mt-[73px] flex-1 flex flex-col min-h-[calc(100vh-73px)] transition-all duration-300 ${
            isCollapsed ? "ml-16" : "ml-64"
          }`}>
            <div className="p-6 overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </SidebarContext.Provider>
    </UserProfileProvider>
  );
};

export default UserLayout;
export { useSidebar };