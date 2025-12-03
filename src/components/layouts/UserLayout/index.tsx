"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import { UserProfileProvider, useAuth } from "@/contexts/hooks";
import { SidebarContext } from "./useSidebar";
import { useSidebar } from "./useSidebar";
import { getRecommendedPath } from "@/utils/navigation";
import type { OrgRole } from "@/constants/roles";

interface IUserLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * UserLayout Component
 * 
 * Primary layout for CUSTOMER role in the /user routes.
 * Provides:
 * - Customer-focused navigation sidebar
 * - Header with user profile
 * - Responsive collapsible sidebar
 * - Optional role-based redirect suggestions
 * 
 * Note: While primarily designed for CUSTOMER role, other roles CAN access
 * /user routes. However, OWNER/ADMIN/STAFF are encouraged to use their
 * dedicated admin areas for better workflow.
 */
const UserLayout = ({ children }: IUserLayoutProps): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showRoleNotice, setShowRoleNotice] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if user should be using a different area
  useEffect(() => {
    if (user?.role) {
      const userRole = user.role as OrgRole;
      const recommendedPath = getRecommendedPath(userRole);
      
      // Show notice if admin/staff are using user area
      // (They CAN use it, but their dedicated area is recommended)
      if (
        (userRole === 'owner' || 
         userRole === 'admin' || 
         userRole === 'case_handler' || 
         userRole === 'editor' || 
         userRole === 'staff') &&
        recommendedPath !== '/user'
      ) {
        setShowRoleNotice(true);
      }
    }
  }, [user]);

  const handleGoToRecommendedArea = (): void => {
    if (user?.role) {
      const recommendedPath = getRecommendedPath(user.role as OrgRole);
      navigate(recommendedPath);
    }
  };

  return (
    <UserProfileProvider>
      <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {/* Optional role notice for non-customer users */}
          {showRoleNotice && (
            <div className="fixed top-[73px] left-0 right-0 z-50 bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
              <p className="text-sm text-blue-800">
                <strong>Tips:</strong> Du har tilgang til adminpanelet. Klikk her for å gå til ditt anbefalte område.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleGoToRecommendedArea}
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 underline"
                >
                  Gå til adminpanel
                </button>
                <button
                  onClick={() => setShowRoleNotice(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

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
          } ${showRoleNotice ? 'pt-12' : ''}`}>
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