"use client";

import React from "react";
import { useLanguage } from "@/contexts/hooks";
import { Logo } from "@/components/layouts/PublicLayout/Logo";
import { LanguageToggle } from "@/components/layouts/PublicLayout/LanguageToggle";
// ThemeToggle removed - dark mode disabled
import UserSearchField from "@/components/features/search/components/UserSearchField";
import UserNotificationBell from "@/components/layouts/UserLayout/UserNotificationBell";
import UserProfileDropdown from "@/components/layouts/UserLayout/UserProfileDropdown";

interface IUserHeaderProps {
  readonly children?: never;
}

const UserHeader = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: IUserHeaderProps
): JSX.Element => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      {/* Logo */}
      <Logo />

      {/* Search field in center */}
      <div className="flex-1 flex justify-center px-8">
        <UserSearchField />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
        <UserNotificationBell />
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default UserHeader;