import { useState, useRef, useCallback, useEffect } from 'react';
import { useUserProfile } from "@/contexts/hooks";
import { useTranslation } from 'react-i18next';
import { avatarService } from '@/services/supabase/avatar.service';
import { usersService } from '@/services/supabase/users.service';
import { preferencesService } from '@/services/supabase/preferences.service';

interface PasswordForm {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

interface SecuritySettings {
  readonly twoFactorEnabled: boolean;
  readonly loginNotifications: boolean;
  readonly sessionTimeout: string;
}

interface NotificationPreferences {
  readonly email: boolean;
  readonly sms: boolean;
  readonly push: boolean;
  readonly bookingReminders: boolean;
  readonly newBookings: boolean;
}

interface Preferences {
  readonly language: string;
  readonly theme: string;
  readonly notifications: NotificationPreferences;
  readonly dashboardView: string;
}

interface LoginHistory {
  readonly date: string;
  readonly ip: string;
  readonly location: string;
  readonly device: string;
}

interface EditingProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly dateOfBirth: string;
}

interface ToastState {
  readonly show: boolean;
  readonly message: string;
}

interface UseUserProfileManagementReturn {
  readonly editingProfile: EditingProfile;
  readonly passwordForm: PasswordForm;
  readonly securitySettings: SecuritySettings;
  readonly preferences: Preferences;
  readonly loginHistory: readonly LoginHistory[];
  readonly isEditing: boolean;
  readonly showPassword: { readonly [key: string]: boolean };
  readonly avatarPreview: string | null;
  readonly deleteConfirmation: string;
  readonly showDeleteModal: boolean;
  readonly toast: ToastState;
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>;
  readonly setIsEditing: (value: boolean) => void;
  readonly setDeleteConfirmation: (value: string) => void;
  readonly setShowDeleteModal: (value: boolean) => void;
  readonly setSecuritySettings: React.Dispatch<React.SetStateAction<SecuritySettings>>;
  readonly setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  readonly handleInputChange: (field: string, value: string) => void;
  readonly handlePasswordChange: (field: string, value: string) => void;
  readonly handlePasswordSave: () => void;
  readonly handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleSave: () => void;
  readonly handleCancel: () => void;
  readonly handleDeleteAccount: () => void;
  readonly togglePasswordVisibility: (field: string) => void;
  readonly formatDate: (dateString: string) => string;
  readonly showToastMessage: (message: string) => void;
}

export const useUserProfileManagement = (): UseUserProfileManagementReturn => {
  const { t } = useTranslation('user');
  const { profile, updateProfile } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSyncedRef = useRef<boolean>(false);

  // State management
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });

  // Local editing state - only update context when saving
  const [editingProfile, setEditingProfile] = useState<EditingProfile>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    dateOfBirth: profile.dateOfBirth
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "24"
  });

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    language: "nb",
    theme: "system",
    notifications: {
      email: true,
      sms: false,
      push: true,
      bookingReminders: true,
      newBookings: true
    },
    dashboardView: "extended"
  });

  // Login history mock data
  const [loginHistory] = useState<readonly LoginHistory[]>([
    {
      date: "2024-01-20T14:30:00Z",
      ip: "192.168.1.1",
      location: "Drammen, Norge",
      device: "Chrome på Windows"
    },
    {
      date: "2024-01-19T09:15:00Z",
      ip: "192.168.1.1",
      location: "Drammen, Norge",
      device: "Safari på iPhone"
    },
    {
      date: "2024-01-18T16:45:00Z",
      ip: "10.0.0.5",
      location: "Oslo, Norge",
      device: "Chrome på Mac"
    }
  ]);

  // Load theme preference from database when component mounts
  useEffect(() => {
    const loadPreferences = async () => {
      if (profile.accountId) {
        try {
          // Try to get theme from database using the preferences service
          // This will fallback to localStorage if the database columns don't exist
          const theme = await preferencesService.getThemePreference(profile.accountId);
          if (theme && (theme === 'light' || theme === 'dark' || theme === 'system')) {
            setPreferences(prev => ({
              ...prev,
              theme
            }));
          } else {
            // Fallback to localStorage
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
              setPreferences(prev => ({
                ...prev,
                theme: savedTheme
              }));
            }
            
            // Also check user-specific storage
            const userSpecificTheme = localStorage.getItem(`theme_${profile.accountId}`);
            if (userSpecificTheme && (userSpecificTheme === 'light' || userSpecificTheme === 'dark' || userSpecificTheme === 'system')) {
              setPreferences(prev => ({
                ...prev,
                theme: userSpecificTheme
              }));
            }
          }
        } catch (error) {
          // Fallback to localStorage if there's any error
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
            setPreferences(prev => ({
              ...prev,
              theme: savedTheme
            }));
          }
          
          // Also check user-specific storage
          const userSpecificTheme = localStorage.getItem(`theme_${profile.accountId}`);
          if (userSpecificTheme && (userSpecificTheme === 'light' || userSpecificTheme === 'dark' || userSpecificTheme === 'system')) {
            setPreferences(prev => ({
              ...prev,
              theme: userSpecificTheme
            }));
          }
        }
      }
    };
    
    loadPreferences();
  }, [profile.accountId]);

  // Sync editingProfile with profile only once when profile is loaded
  useEffect(() => {
    if (!hasSyncedRef.current && profile.firstName) {
      setEditingProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth
      });
      hasSyncedRef.current = true;
    }
  }, [profile.firstName, profile.lastName, profile.email, profile.phone, profile.address, profile.dateOfBirth]);

  // Toast management
  const showToastMessage = useCallback((message: string): void => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string): void => {
    setEditingProfile(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle password changes
  const handlePasswordChange = useCallback((field: string, value: string): void => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle save profile
  const handleSave = useCallback((): void => {
    // Update context with all changes
    const updates: Record<string, string> = { ...editingProfile };
    if (avatarPreview) {
      updates.avatar = avatarPreview;
      setAvatarPreview(null);
    }

    updateProfile(updates);
    setIsEditing(false);
    showToastMessage(t('pages.profile.personal_info.changes_saved'));
  }, [editingProfile, avatarPreview, updateProfile, showToastMessage, t]);

  // Handle cancel editing
  const handleCancel = useCallback((): void => {
    // Reset to original profile data
    setEditingProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      dateOfBirth: profile.dateOfBirth
    });
    setIsEditing(false);
    setAvatarPreview(null);
    hasSyncedRef.current = false; // Allow sync again
  }, [profile]);

  // Handle password save with validation
  const handlePasswordSave = useCallback((): void => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToastMessage(t('pages.profile.security.password.mismatch'));
      return;
    }

    // In a real app, this would call an API to update the password
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showToastMessage(t('pages.profile.security.password.updated'));
  }, [passwordForm, showToastMessage, t]);

  // Handle avatar upload
  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && profile.accountId) {
      // Convert file to data URL and update profile
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setAvatarPreview(dataUrl);
          updateProfile({ avatar: dataUrl });
          showToastMessage(t('pages.profile.personal_info.changes_saved'));
        }
      };
      reader.readAsDataURL(file);
    }
  }, [profile.accountId, updateProfile, showToastMessage, t]);

  // Handle delete account with GDPR logic
  const handleDeleteAccount = useCallback((): void => {
    if (deleteConfirmation !== profile.email) {
      showToastMessage(t('pages.profile.privacy.delete_account.email_mismatch'));
      return;
    }

    // GDPR-compliant account deletion
    if (window.confirm(t('pages.profile.privacy.delete_account.confirm_final'))) {
      // In a real app, this would call an API to:
      // 1. Anonymize all personal data
      // 2. Delete all bookings and associated data
      // 3. Remove user from all systems
      // 4. Send confirmation email
      // 5. Log the deletion for audit purposes

      // Simulate API call
      setTimeout(() => {
        showToastMessage(t('pages.profile.privacy.delete_account.success'));
        setShowDeleteModal(false);
        setDeleteConfirmation("");

        // In a real app, redirect to logout or landing page
        // navigate('/logout');
      }, 1000);
    }
  }, [deleteConfirmation, profile.email, showToastMessage, t]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((field: string): void => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t('pages.profile.time.yesterday');
    if (diffDays < 7) return t('pages.profile.time.days_ago', { count: diffDays });
    if (diffDays < 30) return t('pages.profile.time.weeks_ago', { count: Math.ceil(diffDays / 7) });

    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [t]);

  return {
    editingProfile,
    passwordForm,
    securitySettings,
    preferences,
    loginHistory,
    isEditing,
    showPassword,
    avatarPreview,
    deleteConfirmation,
    showDeleteModal,
    toast,
    fileInputRef,
    setIsEditing,
    setDeleteConfirmation,
    setShowDeleteModal,
    setSecuritySettings,
    setPreferences,
    handleInputChange,
    handlePasswordChange,
    handlePasswordSave,
    handleAvatarUpload,
    handleSave,
    handleCancel,
    handleDeleteAccount,
    togglePasswordVisibility,
    formatDate,
    showToastMessage
  };
};
