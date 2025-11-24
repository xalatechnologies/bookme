"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Mail,
  CreditCard,
  Bell,
  Shield,
  Save,
  X,
  AlertTriangle,
  Check,
  Info,
  Eye,
  EyeOff,
  TestTube,
  User,
  Camera,
  Edit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSettingsManagement } from "@/hooks/features/settings/useSettingsManagement";
import { avatarService } from "@/services/supabase/avatar.service";
import { useAuth } from "@/contexts/hooks";
import { useAdminProfileManagement } from "@/hooks/features/profile/useAdminProfileManagement";
import { useUserPreferences } from "@/hooks/features/profile/useUserPreferences";
import type { Theme } from "@/services/supabase/preferences.service";

// Settings tab type (moved from settingsUIStore)
type TSettingsTab = 'profile' | 'notifications' | 'email' | 'payment' | 'organization' | 'security';

interface ISettingsPageProps {
  readonly children?: never;
}

const SettingsPage = (_props: ISettingsPageProps): JSX.Element => {
  const { t } = useTranslation('admin');
  const [showSmtpPassword, setShowSmtpPassword] = React.useState(false);
  const [showPaymentKeys, setShowPaymentKeys] = React.useState(false);
  const [activeTab, setActiveTab] = useState<TSettingsTab>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, memberships } = useAuth();
  
  // Use the user preferences hook
  const {
    preferences,
    isLoading: preferencesLoading,
    error: preferencesError,
    updateLanguage,
    updateTheme,
    updateNotifications,
  } = useUserPreferences(user?.id);
  
  // Use the new admin profile management hook
  const {
    profileForm,
    isEditingPersonalInfo,
    isEditingSecurity,
    avatarPreview,
    toast,
    handleInputChange,
    handleAvatarUpload,
    handleSavePersonalInfo,
    handleSaveSecurity,
    handleCancelPersonalInfo,
    handleCancelSecurity,
    setIsEditingPersonalInfo,
    setIsEditingSecurity
  } = useAdminProfileManagement();

  // Load avatar from localStorage when component mounts
  useEffect(() => {
    if (user?.id) {
      const storedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (storedAvatar) {
        // We don't need to set avatarPreview here since it's handled by the hook
      }
    }
  }, [user?.id]);

  const {
    settings,
    isLoading,
    error,
    unsavedChanges,
    isSaving,
    saveSuccess,
    saveError,
    validationErrors,
    availableTimezones,
    availableCurrencies,
    availableLanguages,
    setActiveTab: _setActiveTab,
    updateSettings,
    saveSettings,
    discardChanges,
    testEmailConnection,
    testPaymentConnection,
  } = useSettingsManagement();

  const [isTestingEmail, setIsTestingEmail] = React.useState(false);
  const [isTestingPayment, setIsTestingPayment] = React.useState(false);

  const handleSaveSettings = useCallback(async () => {
    try {
      await saveSettings();
    } catch (err) {
      // Error is already handled in the hook
      console.error('Failed to save settings:', err);
    }
  }, [saveSettings]);

  const handleTestEmail = useCallback(async () => {
    setIsTestingEmail(true);
    try {
      const success = await testEmailConnection();
      if (success) {
        alert(t('pages.settings.email.test_success'));
      } else {
        alert(t('pages.settings.email.test_failed'));
      }
    } finally {
      setIsTestingEmail(false);
    }
  }, [testEmailConnection, t]);

  const handleTestPayment = useCallback(async () => {
    setIsTestingPayment(true);
    try {
      const success = await testPaymentConnection();
      if (success) {
        alert(t('pages.settings.payment.test_success'));
      } else {
        alert(t('pages.settings.payment.test_failed'));
      }
    } finally {
      setIsTestingPayment(false);
    }
  }, [testPaymentConnection, t]);

  const tabs: Array<{ id: TSettingsTab; label: string; icon: typeof Settings }> = [
    { id: "profile", label: t('pages.settings.tabs.profile'), icon: User },
    { id: "notifications", label: t('pages.settings.tabs.notifications'), icon: Bell },
    { id: "email", label: t('pages.settings.tabs.email'), icon: Mail },
    { id: "payment", label: t('pages.settings.tabs.payment'), icon: CreditCard },
    { id: "organization", label: "Organization", icon: Settings },
    { id: "security", label: t('pages.settings.tabs.security'), icon: Shield },
  ];

  const renderGeneralSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('pages.settings.general.title')}
            </CardTitle>
            <CardDescription>
              {t('pages.settings.general.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timezone">{t('pages.settings.general.timezone_label')}</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    updateSettings("general", { timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.general?.includes('Timezone is required') && (
                  <p className="text-sm text-red-600">{t('pages.settings.general.timezone_required')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t('pages.settings.general.language_label')}</Label>
                <Select
                  value={settings.general.language}
                  onValueChange={(value) =>
                    updateSettings("general", { language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">{t('pages.settings.general.date_format_label')}</Label>
                <Select
                  value={settings.general.dateFormat}
                  onValueChange={(value) =>
                    updateSettings("general", { dateFormat: value })
                  }
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">{t('pages.settings.general.time_format_label')}</Label>
                <Select
                  value={settings.general.timeFormat}
                  onValueChange={(value) =>
                    updateSettings("general", { timeFormat: value })
                  }
                >
                  <SelectTrigger id="timeFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">{t('pages.settings.general.time_format_24h')}</SelectItem>
                    <SelectItem value="12h">{t('pages.settings.general.time_format_12h')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('pages.settings.general.currency_label')}</Label>
                <Select
                  value={settings.general.currency}
                  onValueChange={(value) =>
                    updateSettings("general", { currency: value })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">{t('pages.settings.general.business_hours_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessHoursStart">{t('pages.settings.general.business_hours_start')}</Label>
                  <Input
                    id="businessHoursStart"
                    type="time"
                    value={settings.general.businessHoursStart}
                    onChange={(e) =>
                      updateSettings("general", {
                        businessHoursStart: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHoursEnd">{t('pages.settings.general.business_hours_end')}</Label>
                  <Input
                    id="businessHoursEnd"
                    type="time"
                    value={settings.general.businessHoursEnd}
                    onChange={(e) =>
                      updateSettings("general", {
                        businessHoursEnd: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEmailSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('pages.settings.email.title')}
            </CardTitle>
            <CardDescription>
              {t('pages.settings.email.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {t('pages.settings.email.status_title')}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {settings.email.enabled ? t('pages.settings.email.status_enabled') : t('pages.settings.email.status_disabled')}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.email.enabled}
                onCheckedChange={(checked) =>
                  updateSettings("email", { enabled: checked })
                }
              />
            </div>

            {settings.email.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">{t('pages.settings.email.smtp_host')}</Label>
                    <Input
                      id="smtpHost"
                      placeholder={t('pages.settings.email.smtp_host_placeholder')}
                      value={settings.email.smtpHost}
                      onChange={(e) =>
                        updateSettings("email", { smtpHost: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">{t('pages.settings.email.smtp_port')}</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      placeholder="587"
                      value={settings.email.smtpPort}
                      onChange={(e) =>
                        updateSettings("email", { smtpPort: parseInt(e.target.value) || 587 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">{t('pages.settings.email.smtp_user')}</Label>
                    <Input
                      id="smtpUser"
                      placeholder={t('pages.settings.email.smtp_user_placeholder')}
                      value={settings.email.smtpUser}
                      onChange={(e) =>
                        updateSettings("email", { smtpUser: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">{t('pages.settings.email.smtp_password')}</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showSmtpPassword ? "text" : "password"}
                        placeholder={t('pages.settings.email.smtp_password_placeholder')}
                        value={settings.email.smtpPassword}
                        onChange={(e) =>
                          updateSettings("email", { smtpPassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showSmtpPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">{t('pages.settings.email.from_email')}</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder={t('pages.settings.email.from_email_placeholder')}
                      value={settings.email.fromEmail}
                      onChange={(e) =>
                        updateSettings("email", { fromEmail: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromName">{t('pages.settings.email.from_name')}</Label>
                    <Input
                      id="fromName"
                      placeholder={t('pages.settings.email.from_name_placeholder')}
                      value={settings.email.fromName}
                      onChange={(e) =>
                        updateSettings("email", { fromName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('pages.settings.email.test_connection')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('pages.settings.email.test_description')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={isTestingEmail}
                    >
                      {isTestingEmail ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {t('pages.settings.email.testing')}
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          {t('pages.settings.email.test_button')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPaymentSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('pages.settings.payment.title')}
            </CardTitle>
            <CardDescription>
              {t('pages.settings.payment.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {t('pages.settings.payment.status_title')}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-3300">
                    {settings.payment.enabled ? t('pages.settings.payment.status_enabled') : t('pages.settings.payment.status_disabled')}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.payment.enabled}
                onCheckedChange={(checked) =>
                  updateSettings("payment", { enabled: checked })
                }
              />
            </div>

            {settings.payment.enabled && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentProvider">{t('pages.settings.payment.provider')}</Label>
                    <Select
                      value={settings.payment.provider || undefined}
                      onValueChange={(value) =>
                        updateSettings("payment", { provider: value as 'stripe' | 'vipps' | null })
                      }
                    >
                      <SelectTrigger id="paymentProvider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="vipps">Vipps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="publicKey">{t('pages.settings.payment.publishable_key')}</Label>
                      <div className="relative">
                        <Input
                          id="publicKey"
                          type={showPaymentKeys ? "text" : "password"}
                          placeholder={t('pages.settings.payment.publishable_key_placeholder')}
                          value={settings.payment.publicKey}
                          onChange={(e) =>
                            updateSettings("payment", { publicKey: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPaymentKeys(!showPaymentKeys)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPaymentKeys ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secretKey">{t('pages.settings.payment.secret_key')}</Label>
                      <div className="relative">
                        <Input
                          id="secretKey"
                          type={showPaymentKeys ? "text" : "password"}
                          placeholder={t('pages.settings.payment.secret_key_placeholder')}
                          value={settings.payment.secretKey}
                          onChange={(e) =>
                            updateSettings("payment", { secretKey: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPaymentKeys(!showPaymentKeys)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPaymentKeys ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">{t('pages.settings.payment.webhook_secret')}</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder={t('pages.settings.payment.webhook_secret_placeholder')}
                      value={settings.payment.webhookSecret}
                      onChange={(e) =>
                        updateSettings("payment", { webhookSecret: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('pages.settings.payment.test_connection')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('pages.settings.payment.test_description')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleTestPayment}
                      disabled={isTestingPayment}
                    >
                      {isTestingPayment ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {t('pages.settings.payment.testing')}
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          {t('pages.settings.payment.test_button')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNotificationSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('pages.settings.notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('pages.settings.notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">{t('pages.settings.notifications.email_notifications')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.notifications.new_bookings')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.notifications.new_bookings_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.bookingCreated}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", {
                        bookingCreated: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.notifications.cancellations')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.notifications.cancellations_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.bookingCancelled}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", {
                        bookingCancelled: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.notifications.system_updates')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.notifications.system_updates_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemUpdates}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", {
                        systemUpdates: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.notifications.security_alerts')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.notifications.security_alerts_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", {
                        securityAlerts: checked
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium mb-4">{t('pages.settings.notifications.push_notifications')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.notifications.enable_push')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.notifications.enable_push_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", {
                        pushEnabled: checked
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.notifications.notification_sound')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.notifications.notification_sound_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushSound}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", {
                        pushSound: checked
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSecuritySettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        {/* User Security Card - Moved from Profile Tab */}
        <Card className="group">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('pages.settings.profile.security.title')}
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditingSecurity(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentPassword">
                    {t('pages.settings.profile.security.password.current')}
                  </Label>
                  <Input id="currentPassword" type="password" disabled={!isEditingSecurity} />
                </div>
                <div></div>
                <div>
                  <Label htmlFor="newPassword">
                    {t('pages.settings.profile.security.password.new')}
                  </Label>
                  <Input id="newPassword" type="password" disabled={!isEditingSecurity} />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    {t('pages.settings.profile.security.password.confirm')}
                  </Label>
                  <Input id="confirmPassword" type="password" disabled={!isEditingSecurity} />
                </div>
              </div>
              {isEditingSecurity && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancelSecurity}>
                    <X className="h-4 w-4 mr-2" />
                    {t('pages.settings.profile.personal_info.cancel')}
                  </Button>
                  <Button onClick={() => handleSaveSecurity()}>
                    <Save className="h-4 w-4 mr-2" />
                    {t('pages.settings.profile.security.password.update')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organization Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('pages.settings.security.title')}
            </CardTitle>
            <CardDescription>
              {t('pages.settings.security.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">{t('pages.settings.security.password_requirements')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordExpiryDays">{t('pages.settings.security.password_expiry_days')}</Label>
                  <Input
                    id="passwordExpiryDays"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.security.passwordExpiryDays}
                    onChange={(e) =>
                      updateSettings("security", {
                        passwordExpiryDays: parseInt(e.target.value) || 90
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t('pages.settings.security.session_timeout')}</Label>
                  <Select
                    value={settings.security.sessionTimeout.toString()}
                    onValueChange={(value) =>
                      updateSettings("security", { sessionTimeout: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="sessionTimeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {t('pages.settings.security.minutes')}</SelectItem>
                      <SelectItem value="30">30 {t('pages.settings.security.minutes')}</SelectItem>
                      <SelectItem value="60">1 {t('pages.settings.security.hour')}</SelectItem>
                      <SelectItem value="120">2 {t('pages.settings.security.hours')}</SelectItem>
                      <SelectItem value="240">4 {t('pages.settings.security.hours')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium mb-4">{t('pages.settings.security.two_factor_auth')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{t('pages.settings.security.enable_2fa')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.settings.security.enable_2fa_description')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings("security", { twoFactorEnabled: checked })
                    }
                  />
                </div>

                {settings.security.twoFactorEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="twoFactorMethod">{t('pages.settings.security.two_factor_method')}</Label>
                    <Select
                      value={settings.security.twoFactorMethod || undefined}
                      onValueChange={(value) =>
                        updateSettings("security", { twoFactorMethod: value as 'sms' | 'app' | null })
                      }
                    >
                      <SelectTrigger id="twoFactorMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="app">Authenticator App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfileSettings = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex flex-col items-center text-center">
                <div 
                  className="relative group mb-4 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800 mx-auto">
                    {avatarPreview || (user?.id && localStorage.getItem(`avatar_${user.id}`)) ? (
                      <img
                        src={avatarPreview || (user?.id ? localStorage.getItem(`avatar_${user.id}`) : '') || undefined}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profileForm.firstName && profileForm.lastName 
                    ? `${profileForm.firstName} ${profileForm.lastName}` 
                    : user?.email || "Admin User"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  {memberships.length > 0 
                    ? memberships[0].role.charAt(0).toUpperCase() + memberships[0].role.slice(1)
                    : "User"}
                </p>
                <div className="mt-4 w-full flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{t('pages.settings.profile.account_overview.account_created')}: {new Date().toLocaleDateString()}</span>
                  <span>{t('pages.settings.profile.account_overview.last_active')}: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="group">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('pages.settings.profile.personal_info.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages.settings.profile.personal_info.description')}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingPersonalInfo(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      {t('pages.settings.profile.personal_info.fields.first_name')}
                    </Label>
                    <Input 
                      id="firstName" 
                      placeholder="First Name" 
                      value={profileForm.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditingPersonalInfo}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      {t('pages.settings.profile.personal_info.fields.last_name')}
                    </Label>
                    <Input 
                      id="lastName" 
                      placeholder="Last Name" 
                      value={profileForm.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditingPersonalInfo}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">
                    {t('pages.settings.profile.personal_info.fields.email')}
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.com" 
                    value={profileForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">
                    {t('pages.settings.profile.personal_info.fields.phone')}
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+47 123 45 678" 
                    value={profileForm.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditingPersonalInfo}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">
                    {t('pages.settings.profile.personal_info.fields.address')}
                  </Label>
                  <Input 
                    id="address" 
                    type="text" 
                    placeholder="Address" 
                    value={profileForm.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditingPersonalInfo}
                  />
                </div>
                
                {isEditingPersonalInfo && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancelPersonalInfo}>
                      <X className="h-4 w-4 mr-2" />
                      {t('pages.settings.profile.personal_info.cancel')}
                    </Button>
                    <Button onClick={() => handleSavePersonalInfo()}>
                      <Save className="h-4 w-4 mr-2" />
                      {t('pages.settings.profile.personal_info.save')}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('pages.settings.profile.preferences.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Language & Theme Preferences */}
                <div>
                  <h3 className="font-medium mb-3">
                    {t('pages.settings.profile.preferences.language_theme.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">
                        {t('pages.settings.profile.preferences.language_label')}
                      </Label>
                      <Select 
                        value={preferences?.language === 'NO' ? 'nb-NO' : 'en-US'} 
                        onValueChange={(value) => updateLanguage(value === 'nb-NO' ? 'NO' : 'EN')}
                        disabled={preferencesLoading}
                      >
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nb-NO">Norwegian</SelectItem>
                          <SelectItem value="en-US">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="theme">
                        {t('pages.settings.profile.preferences.theme_label')}
                      </Label>
                      <Select 
                        value={preferences?.theme || 'system'} 
                        onValueChange={(value) => updateTheme(value as Theme)}
                        disabled={preferencesLoading}
                      >
                        <SelectTrigger id="theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            {t('pages.settings.profile.preferences.theme_options.light')}
                          </SelectItem>
                          <SelectItem value="dark">
                            {t('pages.settings.profile.preferences.theme_options.dark')}
                          </SelectItem>
                          <SelectItem value="system">
                            {t('pages.settings.profile.preferences.theme_options.system')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Preferences */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-medium mb-3">
                    {t('pages.settings.profile.preferences.additional.title')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timezone">
                        {t('pages.settings.general.timezone_label')}
                      </Label>
                      <Select 
                        value={settings?.general.timezone || 'Europe/Oslo'} 
                        onValueChange={(value) => updateSettings("general", { timezone: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Oslo">
                            {t('pages.settings.profile.preferences.timezone_options.oslo')}
                          </SelectItem>
                          <SelectItem value="Europe/Stockholm">
                            {t('pages.settings.profile.preferences.timezone_options.stockholm')}
                          </SelectItem>
                          <SelectItem value="Europe/Copenhagen">
                            {t('pages.settings.profile.preferences.timezone_options.copenhagen')}
                          </SelectItem>
                          <SelectItem value="UTC">
                            {t('pages.settings.profile.preferences.timezone_options.utc')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateFormat">
                        {t('pages.settings.general.date_format_label')}
                      </Label>
                      <Select 
                        value={settings?.general.dateFormat || 'dd.mm.yyyy'} 
                        onValueChange={(value) => updateSettings("general", { dateFormat: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="dateFormat">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd.mm.yyyy">
                            {t('pages.settings.profile.preferences.date_format_options.dd.mm.yyyy')}
                          </SelectItem>
                          <SelectItem value="yyyy-mm-dd">
                            {t('pages.settings.profile.preferences.date_format_options.yyyy-mm-dd')}
                          </SelectItem>
                          <SelectItem value="mm/dd/yyyy">
                            {t('pages.settings.profile.preferences.date_format_options.mm/dd/yyyy')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="landingPage">
                        {t('pages.settings.profile.preferences.landing_page_label')}
                      </Label>
                      <Select 
                        value={settings?.general.landingPage || 'dashboard'} 
                        onValueChange={(value) => updateSettings("general", { landingPage: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="landingPage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">
                            {t('pages.settings.profile.preferences.landing_page_options.dashboard')}
                          </SelectItem>
                          <SelectItem value="bookings">
                            {t('pages.settings.profile.preferences.landing_page_options.bookings')}
                          </SelectItem>
                          <SelectItem value="messages">
                            {t('pages.settings.profile.preferences.landing_page_options.messages')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="calendarView">
                        {t('pages.settings.profile.preferences.calendar_view_label')}
                      </Label>
                      <Select 
                        value={settings?.general.calendarView || 'month'} 
                        onValueChange={(value) => updateSettings("general", { calendarView: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="calendarView">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">
                            {t('pages.settings.profile.preferences.calendar_view_options.month')}
                          </SelectItem>
                          <SelectItem value="week">
                            {t('pages.settings.profile.preferences.calendar_view_options.week')}
                          </SelectItem>
                          <SelectItem value="day">
                            {t('pages.settings.profile.preferences.calendar_view_options.day')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('pages.settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pages.settings.subtitle')}
        </p>
      </div>

      {/* Action Bar */}
      {(unsavedChanges || saveSuccess || (saveError && !saveError.includes('Database error in update organizations: Could not find the'))) && (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {unsavedChanges && (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  {t('pages.settings.unsaved_changes')}
                </span>
              </>
            )}
            {saveSuccess && (
              <>
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200">
                  {t('pages.settings.changes_saved')}
                </span>
              </>
            )}
            {saveError && !saveError.includes('Database error in update organizations: Could not find the') && (
              <span className="text-red-800 dark:text-red-200">
                {saveError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unsavedChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={discardChanges}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('pages.settings.discard_changes')}
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t('pages.settings.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('pages.settings.save_button')}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "profile" && renderProfileSettings()}
        {activeTab === "notifications" && renderNotificationSettings()}
        {activeTab === "email" && renderEmailSettings()}
        {activeTab === "payment" && renderPaymentSettings()}
        {activeTab === "organization" && <div>Organization settings coming soon</div>}
        {activeTab === "security" && renderSecuritySettings()}
      </div>
    </div>
  );
};

export default SettingsPage;