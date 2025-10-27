"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { User, Settings, LogOut, Globe, ChevronDown } from "lucide-react";

interface IProfileDropdownProps {
  readonly children?: never;
}

const ProfileDropdown = (_props: IProfileDropdownProps): JSX.Element => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingOut) return; // Prevent double-click

    console.log('🔴 Admin logout button clicked');
    setIsLoggingOut(true);
    setIsOpen(false); // Close dropdown immediately

    try {
      console.log('🔄 Calling signOut...');
      await signOut();
      console.log('✅ SignOut successful');
      toast.success('Du er nå logget ut!');
      navigate("/login-selection");
    } catch (error) {
      console.error('❌ Admin logout failed:', error);
      toast.error('Kunne ikke logge ut. Prøv igjen.');
      setIsLoggingOut(false);
    }
  };

  const handleSettings = (): void => {
    navigate('/admin/settings');
    setIsOpen(false);
  };

  const handleLanguageChange = (): void => {
    try {
      // Get current language from localStorage
      const currentLanguage = localStorage.getItem('adminLanguage') || 'no';
      
      // Toggle between Norwegian and English
      const newLanguage = currentLanguage === 'no' ? 'en' : 'no';
      
      // Save new language preference
      localStorage.setItem('adminLanguage', newLanguage);
      
      // Show language change confirmation
      const languageName = newLanguage === 'no' ? 'Norsk' : 'English';
      alert(`Språk endret til ${languageName}!`);
      
      // Trigger a custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('adminLanguageChanged', {
        detail: { language: newLanguage }
      }));
      
      setIsOpen(false);
    } catch (error) {
      console.error('Admin language change failed:', error);
      alert('Kunne ikke endre språk. Prøv igjen.');
    }
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  // Get user name from profile or email
  const userName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email || "Admin";

  const userEmail = user?.email || "";
  const userAvatar = profile?.avatar_url || "";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Åpne profilmeny"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <img
              src={userAvatar}
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
            {userName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {userEmail}
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
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    Logger ut...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Logg ut
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
