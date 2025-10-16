"use client";

import React, { useState } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import SystemPageLayout from "@/components/admin/layout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Link, 
  Plus, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Clock,
  ExternalLink
} from "lucide-react";

interface IIntegration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: "active" | "inactive" | "not_configured";
  readonly logo?: string;
  readonly apiKey?: string;
  readonly webhookUrl?: string;
  readonly lastTest?: string;
  readonly recentEvents: readonly {
    readonly id: string;
    readonly timestamp: string;
    readonly event: string;
    readonly status: "success" | "error" | "warning";
  }[];
}

const IntegrationsPage = (): JSX.Element => {
  const [selectedIntegration, setSelectedIntegration] = useState<IIntegration | null>(null);
  const [showNewIntegrationModal, setShowNewIntegrationModal] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // Mock data
  const integrations: readonly IIntegration[] = [
    {
      id: "1",
      name: "Microsoft Outlook",
      description: "Synkroniser bookinger med Outlook kalender",
      status: "active",
      apiKey: "outlook_1234567890abcdef",
      webhookUrl: "https://api.bookme.no/webhooks/outlook",
      lastTest: "2024-01-15T10:30:00Z",
      recentEvents: [
        { id: "1", timestamp: "2024-01-15T10:30:00Z", event: "Calendar sync", status: "success" },
        { id: "2", timestamp: "2024-01-15T09:15:00Z", event: "Webhook received", status: "success" },
        { id: "3", timestamp: "2024-01-14T16:45:00Z", event: "Authentication", status: "success" }
      ]
    },
    {
      id: "2",
      name: "BankID / ID-porten",
      description: "Autentisering og identitetsverifisering",
      status: "active",
      apiKey: "bankid_abcdef1234567890",
      webhookUrl: "https://api.bookme.no/webhooks/bankid",
      lastTest: "2024-01-14T14:20:00Z",
      recentEvents: [
        { id: "4", timestamp: "2024-01-14T14:20:00Z", event: "User login", status: "success" },
        { id: "5", timestamp: "2024-01-14T11:30:00Z", event: "Token refresh", status: "success" }
      ]
    },
    {
      id: "3",
      name: "Altinn",
      description: "Integrasjon med Altinn for offentlige tjenester",
      status: "not_configured",
      recentEvents: []
    },
    {
      id: "4",
      name: "SMS-varsling",
      description: "Send SMS-varsler til brukere",
      status: "active",
      apiKey: "sms_9876543210fedcba",
      webhookUrl: "https://api.bookme.no/webhooks/sms",
      lastTest: "2024-01-13T08:00:00Z",
      recentEvents: [
        { id: "6", timestamp: "2024-01-13T08:00:00Z", event: "SMS sent", status: "success" },
        { id: "7", timestamp: "2024-01-12T15:30:00Z", event: "SMS failed", status: "error" }
      ]
    }
  ];

  const getStatusBadge = (status: IIntegration["status"]): JSX.Element => {
    const statusConfig = {
      active: { 
        label: "Aktivert", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle
      },
      inactive: { 
        label: "Deaktivert", 
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: XCircle
      },
      not_configured: { 
        label: "Ikke konfigurert", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: AlertTriangle
      }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getEventStatusIcon = (status: "success" | "error" | "warning"): React.ComponentType<{ className?: string }> => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertTriangle
    };
    return icons[status];
  };

  const getEventStatusColor = (status: "success" | "error" | "warning"): string => {
    const colors = {
      success: "text-green-600 dark:text-green-400",
      error: "text-red-600 dark:text-red-400",
      warning: "text-yellow-600 dark:text-yellow-400"
    };
    return colors[status];
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('nb-NO');
  };

  const copyToClipboard = (text: string): void => {
    try {
      navigator.clipboard.writeText(text);
      alert('Kopiert til utklippstavle!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Kunne ikke kopiere til utklippstavle. Prøv igjen.');
    }
  };

  return (
    <RequireRole roles={["org-admin", "system-admin"]}>
      <SystemPageLayout
        title="Integrasjoner"
        description="Koble BookMe mot eksterne systemer og tjenester"
        primaryAction={{
          label: "Legg til integrasjon",
          icon: Plus,
          onClick: () => setShowNewIntegrationModal(true)
        }}
      >
        {/* Active Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card 
              key={integration.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedIntegration(integration)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Link className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      {getStatusBadge(integration.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {integration.description}
                </p>
                {integration.lastTest && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Sist testet: {formatTimestamp(integration.lastTest)}
                  </div>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIntegration(integration);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Administrer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Detail Panel */}
        {selectedIntegration && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    {selectedIntegration.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedIntegration.description}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Lukk
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Konfigurasjon</h4>
                  
                  {selectedIntegration.apiKey && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API-nøkkel
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={selectedIntegration.apiKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedIntegration.apiKey!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedIntegration.webhookUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Webhook-endepunkt
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={selectedIntegration.webhookUrl}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedIntegration.webhookUrl!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button className="w-full">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test tilkobling
                  </Button>
                </div>

                {/* Recent Events */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Siste hendelser</h4>
                  {selectedIntegration.recentEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedIntegration.recentEvents.map((event) => {
                        const StatusIcon = getEventStatusIcon(event.status);
                        return (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <StatusIcon className={`h-4 w-4 ${getEventStatusColor(event.status)}`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {event.event}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {formatTimestamp(event.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Ingen hendelser registrert</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </SystemPageLayout>
    </RequireRole>
  );
};

export default IntegrationsPage;
