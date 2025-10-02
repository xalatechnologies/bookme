"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Clock, Shield } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/header/Logo";
import { LanguageToggle } from "@/components/header/LanguageToggle";
import { ProfileMenu } from "@/components/header/ProfileMenu";
import MobileMenu from "@/components/header/MobileMenu";
import { GlobalSearch } from "@/components/header/GlobalSearch";
import { CartDropdown } from "@/components/header/CartDropdown";

export const GlobalHeader = (): JSX.Element => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  // Mock functions for now
  const getItemCount = (): number => 0;
  const isAuthenticated = false;
  const logout = (): void => {};

  // Function to handle login navigation
  const handleLogin = (): void => {
    navigate("/login-selection");
  };

  // Function to handle logout
  const handleLogout = (): void => {
    logout();
  };

  const itemCount = getItemCount();

  return (
    <header className="bg-white dark:bg-gray-900 py-3 shadow-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 w-full">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center gap-4">
          {/* Logo (left) */}
          <div className="flex items-center flex-shrink-0">
            <Logo />
          </div>

          {/* Global Search (center) - Hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg">
            <GlobalSearch />
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            className="md:hidden p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Right side: Privacy, Cart, Language toggle & Login/Profile */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {/* Privacy/GDPR Menu */}
            <DropdownMenu open={privacyOpen} onOpenChange={setPrivacyOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:bg-gray-100">
                  <Shield className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/personvern')}>
                  Personvern
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/cookies')}>
                  Cookies
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/tilgjengelighet')}>
                  Tilgjengelighet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected Times Icon with Dropdown */}
            <Popover open={cartOpen} onOpenChange={setCartOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="relative hover:bg-gray-100">
                  <Clock className="h-6 w-6" />
                  {itemCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full animate-pulse"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 z-50" align="end">
                <CartDropdown onClose={() => setCartOpen(false)} />
              </PopoverContent>
            </Popover>
            
            {/* Language toggle */}
            <LanguageToggle 
              language={language} 
              toggleLanguage={toggleLanguage} 
            />
            
            {/* Profile menu (login button or dropdown) */}
            <ProfileMenu 
              isLoggedIn={isAuthenticated} 
              handleLogin={handleLogin} 
              handleLogout={handleLogout}
            />
          </div>
        </div>

        {/* Mobile Search Bar - Shown only on mobile */}
        <div className="md:hidden mt-3">
          <GlobalSearch />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        isLoggedIn={isAuthenticated}
        setLanguage={(lang) => {
          if (lang === 'NO' || lang === 'EN') {
            const event = new CustomEvent('setLanguage', { detail: lang });
            window.dispatchEvent(event);
          }
        }}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        closeMobileMenu={() => setMobileMenuOpen(false)}
      />
    </header>
  );
};

export default GlobalHeader;
