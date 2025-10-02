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
}

const MobileMenu = ({
  isOpen,
  isLoggedIn,
  setLanguage,
  handleLogin,
  handleLogout,
  closeMobileMenu
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
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Min profil
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
