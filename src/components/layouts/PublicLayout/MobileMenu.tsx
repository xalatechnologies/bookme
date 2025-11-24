import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { X, User, Globe, Shield, LogOut } from "lucide-react";
import { useUserProfile } from "@/contexts/hooks";
import { useAuth } from "@/contexts/hooks";

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
  setLanguage: _setLanguage,
  handleLogin,
  handleLogout,
  closeMobileMenu,
}: MobileMenuProps): JSX.Element => {
  const { t } = useTranslation(['navigation', 'common']);
  const { profile } = useUserProfile();
  const { signOut, memberships } = useAuth();

  const user = {
    name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
    email: profile.email,
    avatar: profile.avatar
  };

  if (!isOpen) return <></>;

  return (
    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">{t('navigation:menu')}</span>
          <Button variant="ghost" size="sm" onClick={closeMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Shield className="mr-2 h-4 w-4" />
            {t('navigation:privacy')}
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <Globe className="mr-2 h-4 w-4" />
            {t('navigation:language')}
          </Button>

          {isLoggedIn ? (
            <>
              <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={t('common:aria.profile_image')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || t('common:labels.user')}
                    </p>
                    <p className="text-xs text-gray-500">{profile.role}</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {
                // Check if user has admin role
                const isAdmin = memberships.some(membership => 
                  membership.role === 'admin' || membership.role === 'owner'
                );
                
                if (isAdmin) {
                  window.location.href = '/admin/overview';
                } else {
                  window.location.href = '/user';
                }
                closeMobileMenu();
              }}>
                <User className="mr-2 h-4 w-4" />
Min side
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t('navigation:my_bookings')}
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                {t('navigation:rooms')}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.href = "/login-selection";
                  } catch (error) {
                    console.error('Logout failed:', error);
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('navigation:logout')}
              </Button>
            </>
          ) : (
            <PrimaryButton onClick={handleLogin} className="w-full">
              {t('navigation:login')}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;