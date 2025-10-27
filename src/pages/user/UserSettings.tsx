"use client";

import React, { useState } from "react";
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
  Eye,
  EyeOff,
  Save,
  Key,
  Mail,
  Smartphone
} from "lucide-react";

const UserSettings = (): JSX.Element => {
  const { t } = useTranslation(['user', 'common']);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    marketingEmails: false,
    language: "no",
    timezone: "Europe/Oslo",
    showProfile: true,
    twoFactorAuth: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSettingChange = (key: string, value: boolean | string): void => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = (): void => {
    // Save settings to localStorage (in a real app, this would call an API)
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // Show success message
      alert(t('user:settings.settings_saved'));

      // In a real app, you would also:
      // 1. Call API to save to backend
      // 2. Update user context/state
      // 3. Show toast notification
      // 4. Handle errors appropriately


    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(t('user:settings.settings_save_failed'));
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
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.notifications.email')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.notifications.email_desc')}
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.notifications.sms')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.notifications.sms_desc')}
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.notifications.push')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.notifications.push_desc')}
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.notifications.booking_reminders')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.notifications.booking_reminders_desc')}
                </p>
              </div>
              <Switch
                checked={settings.bookingReminders}
                onCheckedChange={(checked) => handleSettingChange("bookingReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.notifications.marketing')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.notifications.marketing_desc')}
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
              />
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.privacy_security.show_profile')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.privacy_security.show_profile_desc')}
                </p>
              </div>
              <Switch
                checked={settings.showProfile}
                onCheckedChange={(checked) => handleSettingChange("showProfile", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('user:settings.privacy_security.two_factor')}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('user:settings.privacy_security.two_factor_desc')}
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
              />
            </div>

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
                onValueChange={(value) => handleSettingChange("language", value)}
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
                onValueChange={(value) => handleSettingChange("timezone", value)}
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
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {t('user:settings.save_settings')}
        </Button>
      </div>
    </div>
  );
};

export default UserSettings;
