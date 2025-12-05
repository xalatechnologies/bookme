/**
 * Admin Profile Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for admin profile management operations.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from "@/contexts/hooks";
import { useTranslation } from 'react-i18next';
import { usersService } from '@/services/supabase/users.service';
import { supabase } from '@/lib/clients/supabase';

interface AdminProfileForm {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
}

interface ToastState {
  readonly show: boolean;
  readonly message: string;
}

interface UseAdminProfileManagementReturn {
  readonly profileForm: AdminProfileForm;
  readonly isEditingPersonalInfo: boolean;
  readonly isEditingSecurity: boolean;
  readonly avatarPreview: string | null;
  readonly toast: ToastState;
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>;
  readonly setIsEditingPersonalInfo: (value: boolean) => void;
  readonly setIsEditingSecurity: (value: boolean) => void;
  readonly handleInputChange: (field: string, value: string) => void;
  readonly handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleSavePersonalInfo: () => Promise<void>;
  readonly handleSaveSecurity: () => Promise<void>;
  readonly handleCancelPersonalInfo: () => void;
  readonly handleCancelSecurity: () => void;
  readonly showToastMessage: (message: string) => void;
}

export const useAdminProfileManagement = (): UseAdminProfileManagementReturn => {
  const { t } = useTranslation('admin');
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSyncedRef = useRef<boolean>(false);

  // State management
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState<boolean>(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });

  // Load avatar from profile (database) on initialization
  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbAvatar = (profile as any)?.avatar_url;
      if (dbAvatar) {
        setAvatarPreview(dbAvatar);
      }
    }
  }, [profile]);

  // Local editing state
  const [profileForm, setProfileForm] = useState<AdminProfileForm>({
    firstName: profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || "",
    lastName: profile?.display_name?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: ""
  });

  // Sync profileForm with profile when profile changes
  useEffect(() => {
    if (profile?.display_name || profile?.phone || user?.email) {
      // Get first and last name from display_name
      let firstName = "";
      let lastName = "";
      if (profile?.display_name) {
        const nameParts = profile.display_name.split(' ');
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(' ') || "";
      } else if (user?.email) {
        // Fallback to email prefix
        firstName = user.email.split('@')[0] || "";
      }

      // Get address from localStorage if it exists
      let address = "";
      if (user?.id) {
        const addressKey = `address_${user.id}`;
        address = localStorage.getItem(addressKey) || "";
      }

      setProfileForm({
        firstName,
        lastName,
        email: user?.email || "",
        phone: profile?.phone || "",
        address
      });
      hasSyncedRef.current = true;
    }
  }, [profile?.display_name, profile?.phone, user?.email, user?.id]);

  // Toast management
  const showToastMessage = useCallback((message: string): void => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string): void => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && user?.id) {
      // Convert file to data URL and update profile
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setAvatarPreview(dataUrl);
          
          // Save to database instead of localStorage
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('profiles')
              .update({ avatar_url: dataUrl })
              .eq('id', user.id);
            
            showToastMessage(t('pages.settings.changes_saved'));
          } catch (error) {
            console.error('Failed to save avatar:', error);
            showToastMessage(t('pages.settings.save_failed'));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }, [user?.id, showToastMessage, t]);

  // Handle save profile for personal info
  const handleSavePersonalInfo = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      // Update profile in Supabase
      const updateData: any = {
        display_name: profileForm.firstName && profileForm.lastName 
          ? `${profileForm.firstName} ${profileForm.lastName}` 
          : (profileForm.firstName || profileForm.lastName || undefined),
        phone: profileForm.phone,
        email: profileForm.email
      };

      // Save address to localStorage (since it's not in the database)
      if (profileForm.address) {
        const addressKey = `address_${user.id}`;
        localStorage.setItem(addressKey, profileForm.address);
      }

      await usersService.update(user.id, updateData);
      
      // Refresh profile data
      await refreshProfile();
      
      setIsEditingPersonalInfo(false);
      showToastMessage(t('pages.settings.changes_saved'));
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToastMessage(t('pages.settings.save_failed'));
    }
  }, [profileForm, user?.id, refreshProfile, showToastMessage, t]);

  // Handle save for security (placeholder for now)
  const handleSaveSecurity = useCallback(async (): Promise<void> => {
    // For now, just close the editing mode
    setIsEditingSecurity(false);
    showToastMessage(t('pages.settings.changes_saved'));
  }, [showToastMessage, t]);

  // Handle cancel editing for personal info
  const handleCancelPersonalInfo = useCallback((): void => {
    // Reset to original profile data
    setProfileForm({
      firstName: profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || "",
      lastName: profile?.display_name?.split(' ').slice(1).join(' ') || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      address: ""
    });
    setIsEditingPersonalInfo(false);
    
    // Restore avatar preview from profile (database)
    if (profile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbAvatar = (profile as any)?.avatar_url;
      setAvatarPreview(dbAvatar || null);
    }
    
    hasSyncedRef.current = false; // Allow sync again
  }, [profile?.display_name, profile?.phone, user?.email, profile]);

  // Handle cancel editing for security
  const handleCancelSecurity = useCallback((): void => {
    setIsEditingSecurity(false);
  }, []);

  return {
    profileForm,
    isEditingPersonalInfo,
    isEditingSecurity,
    avatarPreview,
    toast,
    fileInputRef,
    setIsEditingPersonalInfo,
    setIsEditingSecurity,
    handleInputChange,
    handleAvatarUpload,
    handleSavePersonalInfo,
    handleSaveSecurity,
    handleCancelPersonalInfo,
    handleCancelSecurity,
    showToastMessage
  };
};