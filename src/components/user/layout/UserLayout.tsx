"use client";

import React from "react";
import UserHeader from "./UserHeader";
import UserSidebar from "./UserSidebar";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

interface IUserLayoutProps {
  readonly children: React.ReactNode;
}

const UserLayout = ({ children }: IUserLayoutProps): JSX.Element => {
  return (
    <UserProfileProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <UserHeader />
        <div className="flex h-[calc(100vh-73px)]">
          <UserSidebar />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </UserProfileProvider>
  );
};

export default UserLayout;
