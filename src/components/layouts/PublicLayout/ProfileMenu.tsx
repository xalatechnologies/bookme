"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/hooks";
import { useUserProfile } from "@/contexts/hooks";
import { toast } from "react-toastify";

interface ProfileMenuProps {
  readonly isLoggedIn: boolean;
  readonly handleLogin: () => void;
  readonly handleLogout: () => void;
  readonly userProfile?: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isLoggedIn,
  handleLogin,

}): JSX.Element => {
  const { t } = useTranslation(['common', 'navigation']);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const { profile } = useUserProfile();
  const { signOut, memberships } = useAuth();

  const user = {
    name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
    email: profile.email,
    avatar: profile.avatar
  };

  if (!isLoggedIn) {
    return (
      <button
        className="flex items-center gap-2 h-10 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        onClick={handleLogin}
      >
        <LogOut className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          {t("actions.login")}
        </span>
      </button>
    );
  }

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
    } catch (
    _error: unknown
    ) {
      console.error('❌ Logout failed:', _error);
      toast.error(t('common:messages.logout_failed'));
      setIsLoggingOut(false);
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
                onClick={() => {
                  // Check if user has admin role
                  const isAdmin = memberships.some(membership =>
                    membership.role === 'admin' || membership.role === 'owner'
                  );

                  if (isAdmin) {
                    navigate('/admin/overview');
                  } else {
                    navigate('/user');
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Min side
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

export default ProfileMenu;