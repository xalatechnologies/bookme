"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/hooks";
import { toast } from "react-toastify";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

interface IProfileDropdownProps {
  readonly children?: never;
}

const ProfileDropdown = (
   
  _props: IProfileDropdownProps
): JSX.Element => {
  const { t } = useTranslation(['common', 'navigation']);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingOut) return; // Prevent double-click

    setIsLoggingOut(true);
    setIsOpen(false); // Close dropdown immediately

    try {
      await signOut();
      toast.success(t('messages.success.logout', 'Du er nå logget ut!'));
      navigate("/login-selection");
    } catch (
    _error: unknown
    ) {
      console.error('❌ Admin logout failed:', _error);
      toast.error(t('messages.error.logout', 'Kunne ikke logge ut. Prøv igjen.'));
      setIsLoggingOut(false);
    }
  };

  const handleSettings = (): void => {
    navigate('/admin/settings');
    setIsOpen(false);
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  // Get user name from profile or email
  const userName = profile?.display_name
    ? profile.display_name
    : user?.email || "Admin";



  // Get avatar from localStorage (similar to user profile)
  const userAvatar = user?.id
    ? (localStorage.getItem(`avatar_${user.id}`) || "")
    : "";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('common:aria.profile_menu')}
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={t('common:aria.profile_image')}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>

        {/* User Info - Only show name, not email */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {userName}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
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
                onClick={handleSettings}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('navigation:settings')}
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

export default ProfileDropdown;
