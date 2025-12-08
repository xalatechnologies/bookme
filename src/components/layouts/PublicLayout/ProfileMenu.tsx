"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/hooks";
import { useUserProfile } from "@/contexts/hooks";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

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
      <Button
        variant="secondary"
        className="flex items-center gap-2 h-10 px-3 rounded-lg"
        onClick={handleLogin}
      >
        <LogOut className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          {t("actions.login")}
        </span>
      </Button>
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
      <Button
        variant="ghost"
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('common:aria.profile_menu')}
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={t('common:aria.profile_image')}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-gray-500" />
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
      </Button>

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
              <Button
                variant="ghost"
                onClick={() => {
                  // Check if user has admin/owner/staff role
                  const isStaffOrAdmin = memberships.some(membership =>
                    membership.role === 'admin' || membership.role === 'owner' || membership.role === 'staff'
                  );

                  if (isStaffOrAdmin) {
                    // Staff/Admin/Owner go to admin portal only
                    navigate('/admin/overview');
                  } else {
                    // Customers go to user portal
                    navigate('/user');
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors justify-start"
              >
                <User className="w-4 h-4" />
                Min side
              </Button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed justify-start"
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
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileMenu;