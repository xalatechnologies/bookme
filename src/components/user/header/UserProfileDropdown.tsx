"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Globe, ChevronDown } from "lucide-react";
import { useUserProfile } from "@/contexts/UserProfileContext";

interface IUserProfileDropdownProps {
  readonly children?: never;
}

const UserProfileDropdown = (_props: IUserProfileDropdownProps): JSX.Element => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { profile } = useUserProfile();

  const user = {
    name: `${profile.firstName} ${profile.lastName}`,
    email: profile.email,
    avatar: profile.avatar
  };

  const handleLogout = (): void => {
    // TODO: Implement user logout
    navigate("/login-selection");
    setIsOpen(false);
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
    // TODO: Implement language change
    // Language change logic will be implemented here
    setIsOpen(false);
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Åpne profilmeny"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profilbilde"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* User Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.name || "Bruker"}
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
                Min profil
              </button>
              
              <button
                onClick={handleSettings}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Innstillinger
              </button>
              
              <button
                onClick={handleLanguageChange}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Språk / Language
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logg ut
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileDropdown;
