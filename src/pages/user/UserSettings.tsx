"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell,
  Globe,
  Shield,
  Save,
  Key,
  Mail,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useUserSettingsManagement } from "@/hooks/features/settings/useUserSettingsManagement";

const UserSettings = (): JSX.Element => {
  const { t } = useTranslation(['user', 'common']);
  const {
    settings,
    isSaving,
    saveError,
    saveSuccess,
    updateSetting,
    saveSettings,
  } = useUserSettingsManagement();

  const handleSave = async (): Promise<void> => {
    try {
      await saveSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('user:settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('user:settings.subtitle')}
        </p>
      </div>

      {/* Status Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            {t('user:settings.settings_saved')}
          </p>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-300">
            {saveError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('user:settings.notifications.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingToggle
              label={t('user:settings.notifications.email')}
              description={t('user:settings.notifications.email_desc')}
              checked={settings.emailNotifications}
              onChange={(checked) => updateSetting('emailNotifications', checked)}
            />

            <SettingToggle
              label={t('user:settings.notifications.sms')}
              description={t('user:settings.notifications.sms_desc')}
              checked={settings.smsNotifications}
              onChange={(checked) => updateSetting('smsNotifications', checked)}
            />

            <SettingToggle
              label={t('user:settings.notifications.push')}
              description={t('user:settings.notifications.push_desc')}
              checked={settings.pushNotifications}
              onChange={(checked) => updateSetting('pushNotifications', checked)}
            />

            <SettingToggle
              label={t('user:settings.notifications.booking_reminders')}
              description={t('user:settings.notifications.booking_reminders_desc')}
              checked={settings.bookingReminders}
              onChange={(checked) => updateSetting('bookingReminders', checked)}
            />

            <SettingToggle
              label={t('user:settings.notifications.marketing')}
              description={t('user:settings.notifications.marketing_desc')}
              checked={settings.marketingEmails}
              onChange={(checked) => updateSetting('marketingEmails', checked)}
            />
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('user:settings.privacy_security.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingToggle
              label={t('user:settings.privacy_security.show_profile')}
              description={t('user:settings.privacy_security.show_profile_desc')}
              checked={settings.showProfile}
              onChange={(checked) => updateSetting('showProfile', checked)}
            />

            <SettingToggle
              label={t('user:settings.privacy_security.two_factor')}
              description={t('user:settings.privacy_security.two_factor_desc')}
              checked={settings.twoFactorAuth}
              onChange={(checked) => updateSetting('twoFactorAuth', checked)}
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Key className="h-4 w-4" />
                {t('user:settings.privacy_security.change_password')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('user:settings.language_region.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('user:settings.language_region.language')}
              </Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting('language', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">{t('user:settings.language_region.languages.no')}</SelectItem>
                  <SelectItem value="en">{t('user:settings.language_region.languages.en')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('user:settings.language_region.timezone')}
              </Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => updateSetting('timezone', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Oslo">{t('user:settings.language_region.timezones.oslo')}</SelectItem>
                  <SelectItem value="Europe/Stockholm">{t('user:settings.language_region.timezones.stockholm')}</SelectItem>
                  <SelectItem value="Europe/Copenhagen">{t('user:settings.language_region.timezones.copenhagen')}</SelectItem>
                  <SelectItem value="UTC">{t('user:settings.language_region.timezones.utc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('user:settings.account_actions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('user:settings.account_actions.change_email')}
            </Button>

            <Button variant="outline" className="w-full flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              {t('user:settings.account_actions.change_phone')}
            </Button>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="destructive" className="w-full">
                {t('user:settings.account_actions.delete_account')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? t('common:saving') : t('user:settings.save_settings')}
        </Button>
      </div>
    </div>
  );
};

interface SettingToggleProps {
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

/**
 * Reusable toggle setting component for notification and privacy settings
 */
const SettingToggle = ({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps): JSX.Element => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </Label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
};

export default UserSettings;
