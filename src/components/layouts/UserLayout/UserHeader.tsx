"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useLanguage } from "@/contexts/hooks";
import { Logo } from "@/components/layouts/PublicLayout/Logo";
import { LanguageToggle } from "@/components/layouts/PublicLayout/LanguageToggle";
// ThemeToggle removed - dark mode disabled
import UserSearchField from "@/components/features/search/components/UserSearchField";
import UserNotificationBell from "@/components/layouts/UserLayout/UserNotificationBell";
import UserProfileDropdown from "@/components/layouts/UserLayout/UserProfileDropdown";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./useSidebar";

interface IUserHeaderProps {
  readonly children?: never;
}

const UserHeader = (
   
  _props: IUserHeaderProps
): JSX.Element => {
  const { language, toggleLanguage } = useLanguage();
  const { toggleMobileMenu } = useSidebar();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={toggleMobileMenu}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Logo */}
      <div className="hidden lg:block">
        <Logo />
      </div>

      {/* Search field in center - hidden on mobile, shown on tablet+ */}
      <div className="hidden md:flex flex-1 justify-center px-8">
        <UserSearchField />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
        </div>
        <UserNotificationBell />
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default UserHeader;