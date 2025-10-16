"use client";

import React, { useState } from "react";
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
      alert('Innstillinger lagret!');
      
      // In a real app, you would also:
      // 1. Call API to save to backend
      // 2. Update user context/state
      // 3. Show toast notification
      // 4. Handle errors appropriately
      
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Kunne ikke lagre innstillinger. Prøv igjen.');
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
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  E-post varsler
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Motta varsler på e-post
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
                  SMS varsler
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Motta varsler på SMS
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
                  Push varsler
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Motta push-varsler i nettleseren
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
                  Booking påminnelser
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Få påminnelser før bookinger
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
                  Markedsføring
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Motta markedsføring og tilbud
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
              Personvern og sikkerhet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  Vis profil offentlig
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  La andre brukere se din profil
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
                  To-faktor autentisering
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ekstra sikkerhet for kontoen
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
                onValueChange={(value) => handleSettingChange("language", value)}
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
                onValueChange={(value) => handleSettingChange("timezone", value)}
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
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Lagre innstillinger
        </Button>
      </div>
    </div>
  );
};

export default UserSettings;
