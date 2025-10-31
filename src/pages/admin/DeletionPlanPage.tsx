"use client";

import React, { useState } from "react";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import SystemPageLayout from "@/components/layouts/AdminLayout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Settings, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  XCircle,
  Calendar,
  Shield,
  FileText,
  User,
  Database
} from "lucide-react";

interface IDeletionRule {
  readonly id: string;
  readonly dataType: string;
  readonly rule: string;
  readonly isActive: boolean;
  readonly description: string;
}

interface IScheduledDeletion {
  readonly id: string;
  readonly dataType: string;
  readonly count: number;
  readonly scheduledDate: string;
  readonly description: string;
}

interface ISecurityLog {
  readonly id: string;
  readonly timestamp: string;
  readonly user: string;
  readonly action: string;
  readonly details: string;
}

const DeletionPlanPage = (): JSX.Element => {
  const [showManualDeletionModal, setShowManualDeletionModal] = useState<boolean>(false);
  const [confirmationText, setConfirmationText] = useState<string>("");
  const [selectedDataType, setSelectedDataType] = useState<string>("");

  // Mock data
  const deletionRules: readonly IDeletionRule[] = [
    {
      id: "1",
      dataType: "Bookinger",
      rule: "Automatisk sletting etter 3 år",
      isActive: true,
      description: "Alle bookinger som er eldre enn 3 år slettes automatisk"
    },
    {
      id: "2",
      dataType: "Brukere",
      rule: "Slett inaktive etter 12 mnd",
      isActive: true,
      description: "Brukere som ikke har logget inn på 12 måneder slettes"
    },
    {
      id: "3",
      dataType: "Logger",
      rule: "Oppbevares i 6 mnd",
      isActive: true,
      description: "Systemlogger og audit logs oppbevares i 6 måneder"
    },
    {
      id: "4",
      dataType: "Backup-filer",
      rule: "Slett etter 1 år",
      isActive: false,
      description: "Gamle backup-filer slettes etter 1 år"
    }
  ];

  const scheduledDeletions: readonly IScheduledDeletion[] = [
    {
      id: "1",
      dataType: "Bookinger",
      count: 1247,
      scheduledDate: "2024-02-15T00:00:00Z",
      description: "Bookinger fra 2021 og tidligere"
    },
    {
      id: "2",
      dataType: "Brukere",
      count: 23,
      scheduledDate: "2024-01-25T00:00:00Z",
      description: "Inaktive brukere (ikke logget inn siden januar 2023)"
    },
    {
      id: "3",
      dataType: "Logger",
      count: 15678,
      scheduledDate: "2024-01-20T00:00:00Z",
      description: "Systemlogger fra juli 2023"
    }
  ];

  const securityLog: readonly ISecurityLog[] = [
    {
      id: "1",
      timestamp: "2024-01-15T10:30:00Z",
      user: "Amin Ismail",
      action: "Endret slettingsregel",
      details: "Bookinger: 3 år → 2 år"
    },
    {
      id: "2",
      timestamp: "2024-01-10T14:20:00Z",
      user: "System",
      action: "Automatisk sletting utført",
      details: "Slettet 89 gamle bookinger"
    },
    {
      id: "3",
      timestamp: "2024-01-05T09:15:00Z",
      user: "Sarah Nilsen",
      action: "Manuell sletting",
      details: "Slettet 5 test-brukere"
    }
  ];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('nb-NO');
  };

  const getDataTypeIcon = (dataType: string): React.ComponentType<{ className?: string }> => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      "Bookinger": Calendar,
      "Brukere": User,
      "Logger": FileText,
      "Backup-filer": Database
    };
    return icons[dataType] || Database;
  };

  const getDaysUntilDeletion = (scheduledDate: string): number => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diffTime = scheduled.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days: number): string => {
    if (days <= 7) return "text-red-600 dark:text-red-400";
    if (days <= 30) return "text-orange-600 dark:text-orange-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const handleManualDeletion = (): void => {
    if (confirmationText === "SLETT" && selectedDataType) {
      try {
        // Simulate manual deletion based on data type
        let deletedCount = 0;
        let dataTypeName = "";
        
        switch (selectedDataType) {
          case "bookings":
            dataTypeName = "bookinger";
            deletedCount = Math.floor(Math.random() * 50) + 10; // Simulate 10-60 deleted items
            break;
          case "users":
            dataTypeName = "brukere";
            deletedCount = Math.floor(Math.random() * 10) + 1; // Simulate 1-11 deleted items
            break;
          case "logs":
            dataTypeName = "logger";
            deletedCount = Math.floor(Math.random() * 1000) + 100; // Simulate 100-1100 deleted items
            break;
          default:
            alert('Ugyldig datatype valgt');
            return;
        }
        
        // Log the deletion action
        const deletionLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          user: "Current Admin",
          action: "Manuell sletting",
          details: `Slettet ${deletedCount} ${dataTypeName}`
        };
        
        // Save to localStorage (simulating backend)
        const existingLogs = JSON.parse(localStorage.getItem('deletionLogs') || '[]');
        existingLogs.unshift(deletionLog);
        localStorage.setItem('deletionLogs', JSON.stringify(existingLogs));
        
        alert(`Slettet ${deletedCount} ${dataTypeName} permanent!`);
        setShowManualDeletionModal(false);
        setConfirmationText("");
        setSelectedDataType("");
      } catch (error) {
        console.error('Failed to perform manual deletion:', error);
        alert('Kunne ikke utføre sletting. Prøv igjen.');
      }
    }
  };

  return (
    <RequireRole roles={["org-admin", "system-admin"]}>
      <SystemPageLayout
        title="Sletteplan"
        description="Automatiser og dokumenter sletting av gamle data for GDPR og vedlikehold"
        primaryAction={{
          label: "Slett nå",
          icon: Trash2,
          onClick: () => setShowManualDeletionModal(true)
        }}
      >
        {/* Deletion Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Regler for sletting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Datatype</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Regel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Aktiv</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {deletionRules.map((rule) => {
                    const DataTypeIcon = getDataTypeIcon(rule.dataType);
                    
                    return (
                      <tr key={rule.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <DataTypeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{rule.dataType}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">{rule.rule}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{rule.description}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={rule.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}>
                            {rule.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktiv
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inaktiv
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4 mr-1" />
                            Rediger
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Deletions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Kommende slettinger (neste 30 dager)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledDeletions.map((deletion) => {
                const DataTypeIcon = getDataTypeIcon(deletion.dataType);
                const daysUntil = getDaysUntilDeletion(deletion.scheduledDate);
                
                return (
                  <div
                    key={deletion.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <DataTypeIcon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {deletion.dataType}
                          </h4>
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            {deletion.count} elementer
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deletion.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getUrgencyColor(daysUntil)}`}>
                        {formatDate(deletion.scheduledDate)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {daysUntil > 0 ? `${daysUntil} dager igjen` : "I dag"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Security Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sikkerhetslogg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action} - {log.user}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {log.details}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDateTime(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Deletion Modal */}
        {showManualDeletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Manuell sletting
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowManualDeletionModal(false)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Velg datatype
                    </label>
                    <select
                      value={selectedDataType}
                      onChange={(e) => setSelectedDataType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Velg datatype...</option>
                      <option value="bookings">Bookinger</option>
                      <option value="users">Brukere</option>
                      <option value="logs">Logger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Skriv 'SLETT' for å bekrefte
                    </label>
                    <Input
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="SLETT"
                    />
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-800 dark:text-red-300">
                        Dette er en permanent handling som ikke kan angres.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowManualDeletionModal(false)}>
                    Avbryt
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleManualDeletion}
                    disabled={confirmationText !== "SLETT" || !selectedDataType}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Slett permanent
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SystemPageLayout>
    </RequireRole>
  );
};

export default DeletionPlanPage;
