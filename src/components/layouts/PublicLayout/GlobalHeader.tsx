"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, ShoppingCart } from "lucide-react";

import { useLanguage } from "@/contexts/hooks";
import { useCart } from "@/contexts/hooks";

import { useAuth } from "@/contexts/hooks";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Logo } from "@/components/layouts/PublicLayout/Logo";
import { LanguageToggle } from "@/components/layouts/PublicLayout/LanguageToggle";
import { ProfileMenu } from "@/components/layouts/PublicLayout/ProfileMenu";
import MobileMenu from "@/components/layouts/PublicLayout/MobileMenu";
import { GlobalSearch } from "@/components/features/search/components/GlobalSearch";
import { CartDropdown } from "@/components/layouts/PublicLayout/CartDropdown";

export const GlobalHeader = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  // Get auth state from AuthContext
  const { user, signOut } = useAuth();

  // Get cart data
  const { itemCount } = useCart();


  // Use actual auth state instead of route-based detection
  const isAuthenticated = !!user;



  // Store the user's last portal when they navigate to admin or user areas
  useEffect(() => {
    if (isAuthenticated) {
      if (location.pathname.startsWith("/admin")) {
        localStorage.setItem("lastPortal", "admin");
      } else if (location.pathname.startsWith("/user")) {
        localStorage.setItem("lastPortal", "user");
      }
    }
  }, [isAuthenticated, location.pathname]);

  const logout = (): void => {
    try {
      // Use the proper signOut function from AuthContext
      signOut().catch((error) => {
        console.error("❌ Admin logout failed:", error);
      });

      // Clear the last portal preference
      localStorage.removeItem("lastPortal");

      // Show logout confirmation
      alert(t("messages.logout_success"));

      // Navigate to home page with a special state to prevent redirection
      navigate("/", { state: { justLoggedOut: true } });
    } catch (error) {
      console.error("Global logout failed:", error);
      alert(t("messages.logout_failed"));
      // Still navigate to home page even if logout fails
      navigate("/", { state: { justLoggedOut: true } });
    }
  };

  // Function to handle login navigation
  const handleLogin = (): void => {
    navigate("/login-selection");
  };

  // Function to handle logout
  const handleLogout = (): void => {
    logout();
  };

  return (
    <header className="bg-white py-3 shadow-md sticky top-0 z-50 border-b border-gray-200 w-full">
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
            aria-label={t("aria.mobile_menu")}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Right side: Cart, Language toggle & Login/Profile */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {/* Cart Icon with Dropdown */}
            <Popover open={cartOpen} onOpenChange={setCartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative hover:bg-gray-100 cursor-pointer"
                  onClick={() => setCartOpen(!cartOpen)}
                  aria-label={t("aria.cart")}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full animate-pulse">
                      {itemCount > 99 ? "99+" : itemCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 z-[9999]" align="end">
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
          if (lang === "NO" || lang === "EN") {
            const event = new CustomEvent("setLanguage", { detail: lang });
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
