"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { User, LogIn } from "lucide-react";

import { useTranslation } from "@/i18n";

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
  const { t } = useTranslation();

  if (!isLoggedIn) {
    return (
      <Button 
        variant="outline" 
        className="flex items-center gap-1 h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        onClick={handleLogin}
      >
        <LogIn className="w-4 h-4" />
        <span>{t('common.actions.login', {}, 'Logg inn')}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-10 px-3 bg-gray-100 hover:bg-gray-200">
          <User className="h-5 w-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">
            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Bruker'}
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
        <DropdownMenuItem onClick={() => navigate("/user/profile")}>
          {t('common.navigation.profile', {}, 'Profil')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/user/bookings")}>
          Mine bookinger
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/user/facilities")}>
          Lokaler
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          {t('common.actions.logout', {}, 'Logg ut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
