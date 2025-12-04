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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <UserProfileProvider>
      <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, isMobileMenuOpen, toggleMobileMenu }}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
          {/* Fixed Header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <UserHeader />
          </header>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
          )}

          {/* Sidebar - Desktop: Fixed, Mobile: Drawer */}
          <aside
            className={`
              fixed top-[73px] bottom-0 z-40 transition-transform duration-300 ease-in-out
              lg:translate-x-0
              ${
                isMobileMenuOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }
            `}
          >
            <UserSidebar onMobileMenuItemClick={closeMobileMenu} />
          </aside>

          {/* Main content - Responsive spacing */}
          <main
            className={`
              mt-[73px] flex-1 flex flex-col min-h-[calc(100vh-73px)] transition-all duration-300
              lg:${ isCollapsed ? "ml-16" : "ml-64" }
            `}
          >
            <div className="p-4 sm:p-6 overflow-hidden">
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