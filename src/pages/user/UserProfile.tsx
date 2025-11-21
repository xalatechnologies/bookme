"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserProfile } from "@/contexts/hooks";
import { useUserProfileManagement } from "@/hooks/features/profile/useUserProfileManagement";
import { useUserPreferences } from '@/hooks/features/profile/useUserPreferences';
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Bell,
  Download,
  UserCog,
  Key,
  History,
  ShieldCheck,
  Settings,
  Monitor,
  CheckCircle,
  Sun,
  Moon,
  Monitor as MonitorIcon,
  FileText
} from "lucide-react";

const UserProfile = (): JSX.Element => {
  const { t } = useTranslation('user');
  const { profile } = useUserProfile();
  const { preferences: userPreferences, updateTheme, isLoading } = useUserPreferences(profile.accountId);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [localTheme, setLocalTheme] = useState<string>('system');

  const {
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
    formatDate
  } = useUserProfileManagement();

  // Ensure dark mode is never enabled (dark mode removed)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Clear theme preference from localStorage
    localStorage.removeItem('theme');
  }, []);

  const tabs = [
    { id: "profile", label: t('pages.profile.tabs.profile'), icon: User },
    { id: "security", label: t('pages.profile.tabs.security'), icon: Shield },
    { id: "preferences", label: t('pages.profile.tabs.preferences'), icon: Settings },
    { id: "privacy", label: t('pages.profile.tabs.privacy'), icon: Lock }
  ];

  const renderProfileTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Avatar and Personal Details */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('pages.profile.tabs.profile')}
              </h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative group mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800">
                  <img
                    src={avatarPreview || profile.avatar || undefined}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleAvatarUpload(e);
                    // Auto-save when avatar is changed
                    setTimeout(() => {
                      handleSave();
                    }, 100);
                  }}
                  className="hidden"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.role}</p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>{t('pages.profile.account_overview.account_created')}: {new Date(profile.accountCreated).toLocaleDateString('nb-NO')}</span>
                <span className="mx-1">•</span>
                <span>{t('pages.profile.account_overview.last_active')}: {formatDate(profile.lastActive)}</span>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm group">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('pages.profile.personal_info.sections.personal_details')}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setEditingSection("personal");
                  setIsEditing(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            {editingSection === "personal" && isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pages.profile.personal_info.fields.first_name')}
                  </label>
                  <Input
                    type="text"
                    value={editingProfile.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pages.profile.personal_info.fields.last_name')}
                  </label>
                  <Input
                    type="text"
                    value={editingProfile.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pages.profile.personal_info.fields.date_of_birth')}
                  </label>
                  <Input
                    type="date"
                    value={editingProfile.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => {
                      handleSave();
                      setEditingSection(null);
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {t('pages.profile.personal_info.save_changes')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg"
                    onClick={() => {
                      handleCancel();
                      setEditingSection(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                    {t('pages.profile.personal_info.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.profile.personal_info.fields.first_name')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.firstName || t('bookings.not_specified')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.profile.personal_info.fields.last_name')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.lastName || t('bookings.not_specified')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.profile.personal_info.fields.date_of_birth')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile.dateOfBirth && profile.dateOfBirth !== 'Invalid Date' ? new Date(profile.dateOfBirth).toLocaleDateString('nb-NO') : t('bookings.not_specified')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          {/* Contact Info Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm group">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('pages.profile.personal_info.sections.contact_info')}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setEditingSection("contact");
                  setIsEditing(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            {editingSection === "contact" && isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pages.profile.personal_info.fields.email')}
                  </label>
                  <Input
                    type="email"
                    value={editingProfile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-9"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pages.profile.personal_info.fields.phone')}
                  </label>
                  <Input
                    type="tel"
                    value={editingProfile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pages.profile.personal_info.fields.address')}
                  </label>
                  <Input
                    type="text"
                    value={editingProfile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => {
                      handleSave();
                      setEditingSection(null);
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {t('pages.profile.personal_info.save_changes')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg"
                    onClick={() => {
                      handleCancel();
                      setEditingSection(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                    {t('pages.profile.personal_info.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-24">{t('pages.profile.personal_info.fields.email')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.email || t('bookings.not_specified')}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-24">{t('pages.profile.personal_info.fields.phone')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.phone || t('bookings.not_specified')}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-24">{t('pages.profile.personal_info.fields.address')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{profile.address || t('bookings.not_specified')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Password Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="h-4 w-4" />
                {t('pages.profile.security.password.title')}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('pages.profile.security.password.current')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword.currentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    className="pl-10 h-9 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    autoComplete="new-password"
                    name="current-password-field"
                    id="current-password-field"
                    formNoValidate
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                  >
                    {showPassword.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('pages.profile.security.password.new')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword.newPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    className="pl-10 h-9 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    autoComplete="new-password"
                    name="new-password-field"
                    id="new-password-field"
                    formNoValidate
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPassword.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('pages.profile.security.password.confirm')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    className="pl-10 h-9 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    autoComplete="new-password"
                    name="confirm-password-field"
                    id="confirm-password-field"
                    formNoValidate
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    {showPassword.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button onClick={handlePasswordSave} className="flex items-center gap-2 h-9 rounded-lg mt-4">
              <Save className="h-4 w-4" />
              {t('pages.profile.security.password.update')}
            </Button>
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t('pages.profile.security.two_factor.title')}
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('pages.profile.security.two_factor.description')}</p>
              </div>
              <Button
                variant={securitySettings.twoFactorEnabled ? "outline" : "default"}
                size="sm"
                className="h-8 rounded-lg"
                onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              >
                {securitySettings.twoFactorEnabled ? t('pages.profile.security.two_factor.disable') : t('pages.profile.security.two_factor.enable')}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Activity & Integrations Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {t('pages.profile.activity_integrations')}
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-33 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('pages.profile.security.login_history.title')}
                </h4>
                <div className="space-y-3">
                  {loginHistory.map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{login.device}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{login.location} • {login.ip}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(login.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  {t('pages.profile.security.connected_accounts.title')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">G</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Google</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('pages.profile.security.connected_accounts.not_connected')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg">{t('pages.profile.security.connected_accounts.connect')}</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Microsoft</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('pages.profile.security.connected_accounts.not_connected')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg">{t('pages.profile.security.connected_accounts.connect')}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Language & Theme Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('pages.profile.preferences.language_theme.title')}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('pages.profile.preferences.language_theme.language')}
                </label>
                <Select value={userPreferences?.language === 'EN' ? 'en' : userPreferences?.language === 'NO' ? 'nb' : preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nb">🇳🇴 Norsk (bokmål)</SelectItem>
                    <SelectItem value="nn">🇳🇴 Norsk (nynorsk)</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('pages.profile.preferences.language_theme.theme')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: t('pages.profile.preferences.language_theme.theme_light'), icon: Sun },
                    { value: "dark", label: t('pages.profile.preferences.language_theme.theme_dark'), icon: Moon },
                    { value: "system", label: t('pages.profile.preferences.language_theme.theme_system'), icon: MonitorIcon }
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <Button
                        key={theme.value}
                        variant={(userPreferences?.theme || preferences.theme) === theme.value ? "default" : "outline"}
                        size="sm"
                        onClick={async () => {
                          setPreferences(prev => ({ ...prev, theme: theme.value }));
                          setLocalTheme(theme.value);
                          // Also update theme in the database
                          if (profile.accountId) {
                            await updateTheme(theme.value as 'light' | 'dark' | 'system');
                          }
                        }}
                        className="flex flex-col items-center gap-1 h-14 rounded-lg"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{theme.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('pages.profile.preferences.notifications.title')}
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { key: "email", label: t('pages.profile.preferences.notifications.email'), description: t('pages.profile.preferences.notifications.email_desc') },
                { key: "sms", label: t('pages.profile.preferences.notifications.sms'), description: t('pages.profile.preferences.notifications.sms_desc') },
                { key: "push", label: t('pages.profile.preferences.notifications.push'), description: t('pages.profile.preferences.notifications.push_desc') },
                { key: "bookingReminders", label: t('pages.profile.preferences.notifications.reminders'), description: t('pages.profile.preferences.notifications.reminders_desc') },
                { key: "newBookings", label: t('pages.profile.preferences.notifications.new_bookings'), description: t('pages.profile.preferences.notifications.new_bookings_desc') }
              ].map((notification) => (
                <div key={notification.key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Button
                      variant={preferences.notifications[notification.key as keyof typeof preferences.notifications] ? "default" : "outline"}
                      size="sm"
                      className="h-8 rounded-full w-16 mr-3"
                      onClick={() => setPreferences(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [notification.key]: !prev.notifications[notification.key as keyof typeof prev.notifications]
                        }
                      }))}
                    >
                      {preferences.notifications[notification.key as keyof typeof preferences.notifications] ? t('pages.profile.preferences.notifications.on') : t('pages.profile.preferences.notifications.off')}
                    </Button>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{notification.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{notification.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm group">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t('pages.profile.privacy.data_download.title')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {t('pages.profile.privacy.data_download.description')}
          </p>
          <Button variant="outline" className="flex items-center gap-2 h-9 rounded-lg">
            <Download className="h-4 w-4" />
            {t('pages.profile.privacy.data_download.button')}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition-all duration-200 hover:border-blue-300 hover:shadow-sm group">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('pages.profile.privacy.deactivate.title')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {t('pages.profile.privacy.deactivate.description')}
          </p>
          <Button variant="outline" className="flex items-center gap-2 h-9 rounded-lg">
            <Clock className="h-4 w-4" />
            {t('pages.profile.privacy.deactivate.button')}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-300 dark:border-red-700 p-5 transition-all duration-200 hover:border-red-400 hover:shadow-sm group">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('pages.profile.privacy.delete_account.title')}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 opacity-85">
            {t('pages.profile.privacy.delete_account.description')}
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 h-9 rounded-lg px-4 w-full"
          >
            <Trash2 className="h-4 w-4" />
            {t('pages.profile.privacy.delete_account.button')}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDeleteModal = (): JSX.Element => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {t('pages.profile.privacy.delete_account.modal_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('pages.profile.privacy.delete_account.modal_description')}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('pages.profile.privacy.delete_account.confirm_label')}: {profile.email}
            </label>
            <Input
              type="email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="amin@example.com"
              className="h-9"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== profile.email}
              className="flex-1 h-9 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('pages.profile.privacy.delete_account.confirm_button')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
              className="flex-1 h-9 rounded-lg"
            >
              {t('pages.profile.personal_info.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300">{toast.message}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('pages.profile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pages.profile.subtitle')}
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-4 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "preferences" && renderPreferencesTab()}
        {activeTab === "privacy" && renderPrivacyTab()}
      </div>

      {showDeleteModal && renderDeleteModal()}
    </div>
  );
};

export default UserProfile;