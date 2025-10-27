"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/header/Logo";
import { LanguageToggle } from "@/components/header/LanguageToggle";
import SearchField from "@/components/admin/header/SearchField";
import NotificationBell from "@/components/admin/header/NotificationBell";
import ProfileDropdown from "@/components/admin/header/ProfileDropdown";

interface IAdminHeaderProps {
  readonly children?: never;
}

const AdminHeader = (_props: IAdminHeaderProps): JSX.Element => {
  const { t } = useTranslation('navigation');
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Skip to content link */}
      <a href="#main-content" className="skip-to-content">
        {t('skip_to_content')}
      </a>
      
      {/* Logo */}
      <div className="w-40">
        <Logo />
      </div>
      
      {/* Search field in center */}
      <div className="flex-1 flex justify-center px-4 md:px-12">
        <SearchField />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 min-w-fit justify-end">
        <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default AdminHeader;