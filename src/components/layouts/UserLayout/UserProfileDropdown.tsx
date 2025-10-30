"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Settings, LogOut, Globe, ChevronDown } from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

interface IUserProfileDropdownProps {
  readonly children?: never;
}

const UserProfileDropdown = (_props: IUserProfileDropdownProps): JSX.Element => {
  const { t } = useTranslation(['common', 'navigation']);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const { profile } = useUserProfile();
  const { signOut } = useAuth();

  const user = {
    name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
    email: profile.email,
    avatar: profile.avatar
  };

  const handleLogout = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingOut) return; // Prevent double-click

    setIsLoggingOut(true);
    setIsOpen(false); // Close dropdown immediately

    try {
      await signOut();
      toast.success(t('common:messages.logout_success'));
      navigate("/login-selection");
    } catch (error) {
      console.error('❌ Logout failed:', error);
      toast.error(t('common:messages.logout_failed'));
      setIsLoggingOut(false);
    }
  };

  const handleSettings = (): void => {
    navigate('/user/profile');
    setIsOpen(false);
  };

  const handleProfile = (): void => {
    navigate('/user/profile');
    setIsOpen(false);
  };

  const handleLanguageChange = (): void => {
    try {
      // Get current language from localStorage
      const currentLanguage = localStorage.getItem('userLanguage') || 'no';
      
      // Toggle between Norwegian and English
      const newLanguage = currentLanguage === 'no' ? 'en' : 'no';
      
      // Save new language preference
      localStorage.setItem('userLanguage', newLanguage);
      
      // Show language change confirmation
      const languageName = newLanguage === 'no' ? 'Norsk' : 'English';
      toast.success(t('common:messages.language_changed', { language: languageName }));
      
      // Trigger a custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: newLanguage }
      }));
      
      setIsOpen(false);
    } catch (error) {
      console.error('Language change failed:', error);
      toast.error(t('common:messages.language_change_failed'));
    }
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('common:aria.profile_menu')}
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={t('common:aria.profile_image')}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.name || t('common:labels.user')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email || "user@bookme.no"}
          </p>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleProfile}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-4 h-4" />
                {t('navigation:my_profile')}
              </button>

              <button
                onClick={handleSettings}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('navigation:settings')}
              </button>

              <button
                onClick={handleLanguageChange}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {t('navigation:language')}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    {t('common:actions.processing')}
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    {t('navigation:logout')}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileDropdown;
