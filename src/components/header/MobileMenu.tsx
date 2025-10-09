import React from "react";
import { Button } from "@/components/ui/button";
import { X, User, Globe, Shield } from "lucide-react";

interface MobileMenuProps {
  readonly isOpen: boolean;
  readonly isLoggedIn: boolean;
  readonly setLanguage: (lang: string) => void;
  readonly handleLogin: () => void;
  readonly handleLogout: () => void;
  readonly closeMobileMenu: () => void;
  readonly userProfile?: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
}

const MobileMenu = ({
  isOpen,
  isLoggedIn,
  setLanguage,
  handleLogin,
  handleLogout,
  closeMobileMenu,
  userProfile
}: MobileMenuProps): JSX.Element => {
  if (!isOpen) return <></>;

  return (
    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Meny</span>
          <Button variant="ghost" size="sm" onClick={closeMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="mr-2 h-4 w-4" />
            Personvern
          </Button>
          
          <Button variant="ghost" className="w-full justify-start">
            <Globe className="mr-2 h-4 w-4" />
            Språk
          </Button>
          
          {isLoggedIn ? (
            <>
              {userProfile && (
                <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile.firstName} {userProfile.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{userProfile.email}</p>
                </div>
              )}
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Min profil
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Mine bookinger
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Lokaler
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                Logg ut
              </Button>
            </>
          ) : (
            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Logg inn
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
