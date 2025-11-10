"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { User, LogIn, Shield } from "lucide-react";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  handleLogout,
  userProfile
}): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { memberships } = useAuth();
  
  // Check if user has admin role in any organization
  const isAdmin = memberships.some(membership => 
    membership.role === 'admin' || membership.role === 'owner'
  );

  if (!isLoggedIn) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-1 h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        onClick={handleLogin}
      >
        <LogIn className="w-4 h-4" />
        <span>{t("actions.login")}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-10 px-3 bg-gray-100 hover:bg-gray-200">
          <User className="h-5 w-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">
            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : t("labels.user")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userProfile && (
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-xs text-gray-500">{userProfile.email}</p>
          </div>
        )}
        {isAdmin ? (
          <>
            <DropdownMenuItem onClick={() => navigate("/admin/overview")}>
              <Shield className="w-4 h-4 mr-2" />
              Admin Portal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/facilities")}>
              Facilities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/bookings")}>
              Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              {t("common.logout")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate("/user/profile")}>
              {t("common.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/user/bookings")}>
              Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/user/facilities")}>
              Facilities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              {t("common.logout")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;