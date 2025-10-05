"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  ToggleLeft,
  ToggleRight,
  Save,
  TestTube
} from "lucide-react";

interface INotificationPreference {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly email: boolean;
  readonly sms: boolean;
  readonly push: boolean;
  readonly category: "booking" | "system" | "marketing";
}

interface INotificationTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: "email" | "sms";
  readonly enabled: boolean;
  readonly lastSent?: string;
}

const UserNotifications = (): JSX.Element => {
  const [preferences, setPreferences] = useState<readonly INotificationPreference[]>([
    {
      id: "1",
      title: "Booking bekreftet",
      description: "Få beskjed når din booking er bekreftet",
      email: true,
      sms: false,
      push: true,
      category: "booking"
    },
    {
      id: "2",
      title: "Booking avlyst",
      description: "Få beskjed hvis din booking blir avlyst",
      email: true,
      sms: true,
      push: true,
      category: "booking"
    },
    {
      id: "3",
      title: "Påminnelse om booking",
      description: "Få påminnelse 24 timer før din booking",
      email: true,
      sms: false,
      push: true,
      category: "booking"
    },
    {
      id: "4",
      title: "System vedlikehold",
      description: "Få beskjed om planlagt vedlikehold",
      email: true,
      sms: false,
      push: false,
      category: "system"
    },
    {
      id: "5",
      title: "Nye lokaler",
      description: "Få beskjed om nye lokaler i ditt område",
      email: false,
      sms: false,
      push: false,
      category: "marketing"
    },
    {
      id: "6",
      title: "Spesielle tilbud",
      description: "Få beskjed om spesielle tilbud og rabatter",
      email: false,
      sms: false,
      push: false,
      category: "marketing"
    }
  ]);

  const [templates, setTemplates] = useState<readonly INotificationTemplate[]>([
    {
      id: "1",
      title: "Booking bekreftet",
      description: "Din booking for {facility} er bekreftet for {date} kl. {time}",
      type: "email",
      enabled: true,
      lastSent: "2024-01-20T14:30:00Z"
    },
    {
      id: "2",
      title: "Påminnelse om booking",
      description: "Husk at du har en booking i morgen kl. {time} på {facility}",
      type: "sms",
      enabled: true,
      lastSent: "2024-01-19T18:00:00Z"
    }
  ]);

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const togglePreference = (preferenceId: string, channel: "email" | "sms" | "push"): void => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === preferenceId 
          ? { ...pref, [channel]: !pref[channel] }
          : pref
      )
    );
    setHasChanges(true);
  };

  const toggleTemplate = (templateId: string): void => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, enabled: !template.enabled }
          : template
      )
    );
    setHasChanges(true);
  };

  const saveChanges = (): void => {
    // TODO: Implement save to backend
    setHasChanges(false);
  };

  const testNotification = (templateId: string): void => {
    // TODO: Implement test notification
  };

  const getCategoryIcon = (category: INotificationPreference["category"]): JSX.Element => {
    const icons = {
      booking: CheckCircle,
      system: AlertTriangle,
      marketing: Info
    };
    const Icon = icons[category];
    return <Icon className="h-5 w-5" />;
  };

  const getCategoryColor = (category: INotificationPreference["category"]): string => {
    const colors = {
      booking: "text-green-600 dark:text-green-400",
      system: "text-orange-600 dark:text-orange-400",
      marketing: "text-blue-600 dark:text-blue-400"
    };
    return colors[category];
  };

  const getCategoryLabel = (category: INotificationPreference["category"]): string => {
    const labels = {
      booking: "Booking",
      system: "System",
      marketing: "Markedsføring"
    };
    return labels[category];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, INotificationPreference[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Varsler & preferanser
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administrer hvordan du vil motta varsler og meldinger
          </p>
        </div>
        
        {hasChanges && (
          <Button onClick={saveChanges} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Lagre endringer
          </Button>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-6">
        {Object.entries(groupedPreferences).map(([category, prefs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(category as INotificationPreference["category"])}
                <span className={getCategoryColor(category as INotificationPreference["category"])}>
                  {getCategoryLabel(category as INotificationPreference["category"])}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefs.map((preference) => (
                <div key={preference.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {preference.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {preference.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <button
                        onClick={() => togglePreference(preference.id, "email")}
                        className="flex items-center"
                      >
                        {preference.email ? (
                          <ToggleRight className="h-6 w-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <button
                        onClick={() => togglePreference(preference.id, "sms")}
                        className="flex items-center"
                      >
                        {preference.sms ? (
                          <ToggleRight className="h-6 w-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <button
                        onClick={() => togglePreference(preference.id, "push")}
                        className="flex items-center"
                      >
                        {preference.push ? (
                          <ToggleRight className="h-6 w-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Varselmaler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {template.title}
                  </h3>
                  <Badge variant={template.type === "email" ? "default" : "secondary"}>
                    {template.type === "email" ? "E-post" : "SMS"}
                  </Badge>
                  {template.enabled ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Aktiv
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Deaktivert
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {template.description}
                </p>
                {template.lastSent && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Sist sendt: {formatDate(template.lastSent)}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testNotification(template.id)}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <button
                  onClick={() => toggleTemplate(template.id)}
                  className="flex items-center"
                >
                  {template.enabled ? (
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-postadresse
              </label>
              <input
                type="email"
                value="amin@example.com"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefonnummer
              </label>
              <input
                type="tel"
                value="+47 123 45 678"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              />
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For å endre kontaktinformasjon, gå til{" "}
              <a href="/user/profile" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Profil & innstillinger
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserNotifications;
