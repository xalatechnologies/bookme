"use client";

import React from "react";
import { Logo } from "@/components/header/Logo";
import SearchField from "@/components/admin/header/SearchField";
import NotificationBell from "@/components/admin/header/NotificationBell";
import ProfileDropdown from "@/components/admin/header/ProfileDropdown";

interface IAdminHeaderProps {
  readonly children?: never;
}

const AdminHeader = (_props: IAdminHeaderProps): JSX.Element => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Logo */}
      <Logo />
      
      {/* Search field in center */}
      <div className="flex-1 flex justify-center px-8">
        <SearchField />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default AdminHeader;