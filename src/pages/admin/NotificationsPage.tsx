"use client";

import React, { useState, useMemo } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import SystemPageLayout from "@/components/admin/layout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Mail, 
  Settings, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Eye,
  EyeOff
} from "lucide-react";

interface ISystemEvent {
  readonly id: string;
  readonly name: string;
  readonly type: "info" | "warning" | "error" | "success";
  readonly channel: "email" | "dashboard" | "sms";
  readonly isActive: boolean;
  readonly description: string;
}

interface IEmailTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly recipient: string;
  readonly content: string;
}

interface INotificationPreference {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isEnabled: boolean;
}

const NotificationsPage = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Mock data
  const systemEvents: readonly ISystemEvent[] = [
    {
      id: "1",
      name: "Ny booking mottatt",
      type: "info",
      channel: "email",
      isActive: true,
      description: "Send e-post når en ny booking blir mottatt"
    },
    {
      id: "2",
      name: "Godkjent booking",
      type: "success",
      channel: "email",
      isActive: true,
      description: "Send bekreftelse når en booking blir godkjent"
    },
    {
      id: "3",
      name: "Feil i synkronisering",
      type: "error",
      channel: "dashboard",
      isActive: false,
      description: "Viser feilmelding på dashboard ved synkroniseringsproblemer"
    },
    {
      id: "4",
      name: "System vedlikehold",
      type: "warning",
      channel: "email",
      isActive: true,
      description: "Varsle om planlagt system vedlikehold"
    }
  ];

  const emailTemplates: readonly IEmailTemplate[] = [
    {
      id: "1",
      title: "Booking bekreftelse",
      description: "E-post sendt til brukere når booking blir godkjent",
      recipient: "Bruker",
      content: "Din booking for {{facility}} den {{date}} er godkjent."
    },
    {
      id: "2",
      title: "Booking avvist",
      description: "E-post sendt til brukere når booking blir avvist",
      recipient: "Bruker",
      content: "Din booking for {{facility}} den {{date}} er dessverre avvist."
    }
  ];

  const notificationPreferences: readonly INotificationPreference[] = [
    {
      id: "1",
      name: "Bookingoppdateringer",
      description: "Få varsler om nye, godkjente eller avviste bookinger",
      isEnabled: true
    },
    {
      id: "2",
      name: "Systemfeil",
      description: "Få varsler om systemfeil og tekniske problemer",
      isEnabled: true
    },
    {
      id: "3",
      name: "Nye brukere",
      description: "Få varsler når nye brukere registrerer seg",
      isEnabled: false
    }
  ];

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return systemEvents;
    return systemEvents.filter(event =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [systemEvents, searchQuery]);

  const getEventTypeIcon = (type: ISystemEvent["type"]): React.ComponentType<{ className?: string }> => {
    const icons = {
      info: Info,
      warning: AlertTriangle,
      error: XCircle,
      success: CheckCircle
    };
    return icons[type];
  };

  const getEventTypeColor = (type: ISystemEvent["type"]): string => {
    const colors = {
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    };
    return colors[type];
  };

  const getChannelIcon = (channel: ISystemEvent["channel"]): React.ComponentType<{ className?: string }> => {
    const icons = {
      email: Mail,
      dashboard: Eye,
      sms: Bell
    };
    return icons[channel];
  };

  const handleToggleEvent = (eventId: string): void => {
    try {
      // Simulate saving to backend/localStorage
      const events = JSON.parse(localStorage.getItem('systemEvents') || '[]');
      const updatedEvents = events.map((event: ISystemEvent) => 
        event.id === eventId ? { ...event, isActive: !event.isActive } : event
      );
      localStorage.setItem('systemEvents', JSON.stringify(updatedEvents));
      
      const event = systemEvents.find(e => e.id === eventId);
      if (event) {
        alert(`Systemhendelse "${event.name}" ${!event.isActive ? 'aktivert' : 'deaktivert'}!`);
      }
    } catch (error) {
      console.error('Failed to toggle event:', error);
      alert('Kunne ikke endre systemhendelse. Prøv igjen.');
    }
  };

  const handleTogglePreference = (preferenceId: string): void => {
    try {
      // Simulate saving to backend/localStorage
      const preferences = JSON.parse(localStorage.getItem('notificationPreferences') || '[]');
      const updatedPreferences = preferences.map((pref: INotificationPreference) => 
        pref.id === preferenceId ? { ...pref, isEnabled: !pref.isEnabled } : pref
      );
      localStorage.setItem('notificationPreferences', JSON.stringify(updatedPreferences));
      
      const preference = notificationPreferences.find(p => p.id === preferenceId);
      if (preference) {
        alert(`Varselpreferanse "${preference.name}" ${!preference.isEnabled ? 'aktivert' : 'deaktivert'}!`);
      }
    } catch (error) {
      console.error('Failed to toggle preference:', error);
      alert('Kunne ikke endre varselpreferanse. Prøv igjen.');
    }
  };

  return (
    <RequireRole roles={["org-admin", "system-admin"]}>
      <SystemPageLayout
        title="Varsler"
        description="Administrer varsler, e-postmaler og systemhendelser"
        searchPlaceholder="Søk hendelser..."
        onSearch={setSearchQuery}
        primaryAction={{
          label: "Rediger e-postmaler",
          icon: Mail,
          onClick: () => setShowEmailModal(true)
        }}
      >
        {/* System Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Systemhendelser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => {
                const TypeIcon = getEventTypeIcon(event.type);
                const ChannelIcon = getChannelIcon(event.channel);
                
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <TypeIcon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {event.name}
                          </h4>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <ChannelIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {event.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={event.isActive}
                          onCheckedChange={() => handleToggleEvent(event.id)}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {event.isActive ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Rediger
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-postmaler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {template.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      <strong>Mottaker:</strong> {template.recipient}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Rediger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Mine varselpreferanser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationPreferences.map((preference) => (
                <div
                  key={preference.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {preference.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {preference.description}
                    </p>
                  </div>
                  <Switch
                    checked={preference.isEnabled}
                    onCheckedChange={() => handleTogglePreference(preference.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </SystemPageLayout>
    </RequireRole>
  );
};

export default NotificationsPage;
