"use client";

import React from "react";
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
  AlertCircle
} from "lucide-react";
import { useUserSettingsManagement } from "@/hooks/features/settings/useUserSettingsManagement";

const UserSettings = (): JSX.Element => {
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
          Innstillinger
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administrer dine kontoinnstillinger og preferanser
        </p>
      </div>

      {/* Status Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Innstillinger lagret!
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
              Varsler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingToggle
              label="E-post varsler"
              description="Motta varsler på e-post"
              checked={settings.emailNotifications}
              onChange={(checked) => updateSetting('emailNotifications', checked)}
            />

            <SettingToggle
              label="SMS varsler"
              description="Motta varsler på SMS"
              checked={settings.smsNotifications}
              onChange={(checked) => updateSetting('smsNotifications', checked)}
            />

            <SettingToggle
              label="Push varsler"
              description="Motta push-varsler i nettleseren"
              checked={settings.pushNotifications}
              onChange={(checked) => updateSetting('pushNotifications', checked)}
            />

            <SettingToggle
              label="Booking påminnelser"
              description="Få påminnelser før bookinger"
              checked={settings.bookingReminders}
              onChange={(checked) => updateSetting('bookingReminders', checked)}
            />

            <SettingToggle
              label="Markedsføring"
              description="Motta markedsføring og tilbud"
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
              Personvern og sikkerhet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SettingToggle
              label="Vis profil offentlig"
              description="La andre brukere se din profil"
              checked={settings.showProfile}
              onChange={(checked) => updateSetting('showProfile', checked)}
            />

            <SettingToggle
              label="To-faktor autentisering"
              description="Ekstra sikkerhet for kontoen"
              checked={settings.twoFactorAuth}
              onChange={(checked) => updateSetting('twoFactorAuth', checked)}
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Key className="h-4 w-4" />
                Endre passord
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Språk og region
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Språk
              </Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSetting('language', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Norsk</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                Tidssone
              </Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => updateSetting('timezone', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Oslo">Europe/Oslo (Norge)</SelectItem>
                  <SelectItem value="Europe/Stockholm">Europe/Stockholm (Sverige)</SelectItem>
                  <SelectItem value="Europe/Copenhagen">Europe/Copenhagen (Danmark)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Kontohandlinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Endre e-postadresse
            </Button>

            <Button variant="outline" className="w-full flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Endre telefonnummer
            </Button>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="destructive" className="w-full">
                Slett konto
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
          {isSaving ? 'Lagrer...' : 'Lagre innstillinger'}
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