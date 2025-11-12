"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/contexts/hooks";
import { useUserProfileManagement } from "@/hooks/features/profile/useUserProfileManagement";
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
  CheckCircle
} from "lucide-react";

const UserProfile = (): JSX.Element => {
  const { t } = useTranslation('user');
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<string>("profile");

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

  const tabs = [
    { id: "profile", label: t('pages.profile.tabs.profile'), icon: User },
    { id: "security", label: t('pages.profile.tabs.security'), icon: Shield },
    { id: "preferences", label: t('pages.profile.tabs.preferences'), icon: Settings },
    { id: "privacy", label: t('pages.profile.tabs.privacy'), icon: Lock }
  ];

  const renderAccountOverview = (): JSX.Element => (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={avatarPreview || profile.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{profile.role}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
              <span>{t('pages.profile.account_overview.account_created')}: {new Date(profile.accountCreated).toLocaleDateString('nb-NO')}</span>
              <span>•</span>
              <span>{t('pages.profile.account_overview.last_active')}: {formatDate(profile.lastActive)}</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-white dark:bg-gray-800">
            {profile.subscriptionType}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileTab = (): JSX.Element => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('pages.profile.personal_info.title')}
        </h2>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? t('pages.profile.personal_info.cancel') : t('pages.profile.personal_info.edit')}
        </Button>
      </div>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <img
                src={avatarPreview || profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
              />
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t('pages.profile.personal_info.sections.personal_details')}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      {t('pages.profile.personal_info.fields.first_name')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingProfile.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      {t('pages.profile.personal_info.fields.last_name')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingProfile.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {t('pages.profile.personal_info.fields.date_of_birth')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editingProfile.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(profile.dateOfBirth).toLocaleDateString('nb-NO')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t('pages.profile.personal_info.sections.contact_info')}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      {t('pages.profile.personal_info.fields.email')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editingProfile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      {t('pages.profile.personal_info.fields.phone')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editingProfile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {t('pages.profile.personal_info.fields.address')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editingProfile.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{profile.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {t('pages.profile.personal_info.save_changes')}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {t('pages.profile.personal_info.cancel')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = (): JSX.Element => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('pages.profile.security.title')}
      </h2>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('pages.profile.security.password.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('pages.profile.security.password.current')}
            </label>
            <div className="relative">
              <Input
                type={showPassword.currentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                className="pr-10"
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

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('pages.profile.security.password.new')}
            </label>
            <div className="relative">
              <Input
                type={showPassword.newPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                className="pr-10"
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

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('pages.profile.security.password.confirm')}
            </label>
            <div className="relative">
              <Input
                type={showPassword.confirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                className="pr-10"
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

          <Button onClick={handlePasswordSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {t('pages.profile.security.password.update')}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Tofaktorautentisering (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">E-post/SMS autentisering</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Få en sikkerhetskode på e-post eller SMS ved innlogging
              </p>
            </div>
            <Button
              variant={securitySettings.twoFactorEnabled ? "outline" : "default"}
              onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
            >
              {securitySettings.twoFactorEnabled ? "Deaktiver" : "Aktiver"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Påloggingshistorikk
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Tilknyttede kontoer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Google</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ikke tilknyttet</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Tilknytt</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">M</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Microsoft</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ikke tilknyttet</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Tilknytt</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesTab = (): JSX.Element => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Preferanser og tilpasning
      </h2>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Språk og utseende
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Språk
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            >
              <option value="nb">Norsk (bokmål)</option>
              <option value="nn">Norsk (nynorsk)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Tema
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Lys", icon: Monitor },
                { value: "dark", label: "Mørk", icon: Monitor },
                { value: "system", label: "System", icon: Settings }
              ].map((theme) => {
                const Icon = theme.icon;
                return (
                  <Button
                    key={theme.value}
                    variant={preferences.theme === theme.value ? "default" : "outline"}
                    onClick={() => setPreferences(prev => ({ ...prev, theme: theme.value }))}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {theme.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Varslingsinnstillinger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email", label: "E-postvarsler", description: "Motta varsler på e-post" },
            { key: "sms", label: "SMS-varsler", description: "Motta varsler på SMS" },
            { key: "push", label: "Push-varsler", description: "Motta push-varsler i nettleseren" },
            { key: "bookingReminders", label: "Påminnelser", description: "Påminnelse dagen før booking" },
            { key: "newBookings", label: "Nye bookinger", description: "Varsle om nye bookinger" }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{notification.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{notification.description}</p>
              </div>
              <Button
                variant={preferences.notifications[notification.key as keyof typeof preferences.notifications] ? "default" : "outline"}
                size="sm"
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    [notification.key]: !prev.notifications[notification.key as keyof typeof prev.notifications]
                  }
                }))}
              >
                {preferences.notifications[notification.key as keyof typeof preferences.notifications] ? "På" : "Av"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Dashboardvisning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "compact", label: "Kompakt", description: "Mindre kort og tett layout" },
              { value: "extended", label: "Utvidet", description: "Store kort og luftig layout" }
            ].map((view) => (
              <Button
                key={view.value}
                variant={preferences.dashboardView === view.value ? "default" : "outline"}
                onClick={() => setPreferences(prev => ({ ...prev, dashboardView: view.value }))}
                className="flex flex-col items-start h-auto p-4"
              >
                <span className="font-medium">{view.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{view.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacyTab = (): JSX.Element => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Personvern og data
      </h2>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Last ned dine data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Last ned en kopi av alle dine personlige data, inkludert bookinger, kvitteringer og profilinformasjon.
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Last ned data
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Deaktiver midlertidig
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Deaktiver kontoen din midlertidig. Du kan reaktivere den når som helst ved å logge inn igjen.
          </p>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Deaktiver midlertidig
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Slett konto permanent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Når du sletter kontoen din, vil all data bli permanent fjernet.
            Dette inkluderer alle dine bookinger, favoritter og personlige opplysninger.
            Denne handlingen kan ikke angres.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Slett konto permanent
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDeleteModal = (): JSX.Element => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Slett konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Er du sikker på at du vil slette kontoen din? Alle bookinger og kvitteringer vil bli slettet permanent.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skriv inn din e-postadresse for å bekrefte: {profile.email}
            </label>
            <Input
              type="email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="amin@example.com"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== profile.email}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slett permanent
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
              className="flex-1"
            >
              Avbryt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountSummary = (): JSX.Element => (
    <Card className="mt-6 bg-gray-50 dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('pages.profile.account_summary.account_id')}</p>
            <p className="font-medium text-gray-900 dark:text-white">#{profile.accountId}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('pages.profile.account_summary.subscription_type')}</p>
            <p className="font-medium text-gray-900 dark:text-white">{profile.subscriptionType}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">{t('pages.profile.account_summary.available_features')}</p>
            <p className="font-medium text-gray-900 dark:text-white">{t('pages.profile.account_summary.standard_features')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
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

      {renderAccountOverview()}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <Card className="bg-white shadow-sm rounded-2xl">
        <CardContent className="p-8">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "preferences" && renderPreferencesTab()}
          {activeTab === "privacy" && renderPrivacyTab()}
        </CardContent>
      </Card>

      {renderAccountSummary()}

      {showDeleteModal && renderDeleteModal()}
    </div>
  );
};

export default UserProfile;
