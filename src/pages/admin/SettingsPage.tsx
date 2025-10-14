"use client";

import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Key, 
  Save,
  Check,
  AlertTriangle,
  Info,
  Camera,
  X,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ISettingsPageProps {
  readonly children?: never;
}

const SettingsPage = (_props: ISettingsPageProps): JSX.Element => {
  const { user, updateUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showSaveMessage, setShowSaveMessage] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>(user?.avatar || "");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  // Initialize form data from user context
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSave = (): void => {
    // Update user context with new data
    updateUser({
      name: `${firstName} ${lastName}`.trim(),
      email: email,
      avatar: avatar
    });
    
    setHasUnsavedChanges(false);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleAvatarUpload = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setAvatar(result);
          setHasUnsavedChanges(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveAvatar = (): void => {
    setAvatar("");
    setHasUnsavedChanges(true);
  };

  const handleInputChange = (field: string, value: string): void => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "bio":
        setBio(value);
        break;
    }
    setHasUnsavedChanges(true);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "notifications", label: "Varsler", icon: Bell },
    { id: "security", label: "Sikkerhet", icon: Shield },
    { id: "appearance", label: "Utseende", icon: Palette },
    { id: "general", label: "Generelt", icon: Settings },
    { id: "integrations", label: "Integrasjoner", icon: Globe },
    { id: "data", label: "Data", icon: Database },
    { id: "api", label: "API", icon: Key }
  ];

  const renderProfileSettings = (): JSX.Element => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profilinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatar ? (
                <div className="relative group">
                  <img
                    src={avatar}
                    alt="Profilbilde"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Profilbilde
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last opp et profilbilde for å gjøre kontoen din mer personlig
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleAvatarUpload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {avatar ? "Endre bilde" : "Last opp bilde"}
                </Button>
                {avatar && (
                  <Button
                    onClick={handleRemoveAvatar}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                    Fjern
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Fornavn</Label>
                <Input 
                  id="firstName" 
                  value={firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Etternavn</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="email">E-post</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                value={phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+47 123 45 678"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="bio">Biografi</Label>
              <Textarea 
                id="bio" 
                placeholder="Beskriv deg selv..."
                value={bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roller og tilganger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium">System Administrator</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full tilgang til alle funksjoner</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                Aktiv
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">Organisasjon Administrator</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrer organisasjonsdata</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                Aktiv
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = (): JSX.Element => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            E-post varsler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nye bookinger</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Få varsel når nye bookinger opprettes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Avbestillinger</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Få varsel når bookinger avbestilles</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System oppdateringer</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Få varsel om system vedlikehold</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sikkerhetsvarsler</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Få varsel om sikkerhetshendelser</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push varsler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aktiver push varsler</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Motta varsler i nettleseren</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lyd på varsler</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spill lyd når du får varsler</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = (): JSX.Element => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Passord og autentisering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Nåværende passord</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="newPassword">Nytt passord</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Bekreft nytt passord</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button variant="outline" size="sm">
            Endre passord
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>To-faktor autentisering</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS autentisering</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Motta kode via SMS</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">App autentisering</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bruk autentiseringsapp</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktive økter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium">Nåværende økt</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chrome på macOS • Oslo, Norge</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                Aktiv
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">Safari på iPhone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sist aktiv: 2 timer siden</p>
              </div>
              <Button variant="outline" size="sm">
                Avslutt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSettings = (): JSX.Element => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema og utseende
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Tema</Label>
            <Select defaultValue="system">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Lyst</SelectItem>
                <SelectItem value="dark">Mørkt</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language">Språk</Label>
            <Select defaultValue="no">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Norsk</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Kompakt visning</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mindre avstander og padding</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Animasjoner</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktiver overganger og animasjoner</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sidebar kollapsert</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start med kollapsert sidebar</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Kompakt header</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mindre header med færre elementer</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGeneralSettings = (): JSX.Element => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Generelle innstillinger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Tidssone</Label>
            <Select defaultValue="europe/oslo">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="europe/oslo">Europa/Oslo (GMT+1)</SelectItem>
                <SelectItem value="europe/london">Europa/London (GMT+0)</SelectItem>
                <SelectItem value="america/new_york">Amerika/New York (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateFormat">Datoformat</Label>
            <Select defaultValue="dd.mm.yyyy">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timeFormat">Tidsformat</Label>
            <Select defaultValue="24h">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24-timer (14:30)</SelectItem>
                <SelectItem value="12h">12-timer (2:30 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System informasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Versjon</p>
              <p className="text-gray-600 dark:text-gray-400">1.0.0</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Sist oppdatert</p>
              <p className="text-gray-600 dark:text-gray-400">15. januar 2024</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Database versjon</p>
              <p className="text-gray-600 dark:text-gray-400">v2.1.3</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Node.js versjon</p>
              <p className="text-gray-600 dark:text-gray-400">v18.17.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = (): JSX.Element => {
    switch (activeTab) {
      case "profile":
        return renderProfileSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "appearance":
        return renderAppearanceSettings();
      case "general":
        return renderGeneralSettings();
      case "integrations":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integrasjoner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Integrasjoner kommer snart</p>
              </div>
            </CardContent>
          </Card>
        );
      case "data":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data håndtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Data håndtering kommer snart</p>
              </div>
            </CardContent>
          </Card>
        );
      case "api":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API nøkler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">API nøkler kommer snart</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Innstillinger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administrer konto, sikkerhet og systeminnstillinger
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Ulagrede endringer</span>
            </div>
          )}
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Lagre endringer
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {showSaveMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            Endringer lagret!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
