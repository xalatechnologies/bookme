"use client";

import React, { useState, useMemo } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import SystemPageLayout from "@/components/admin/layout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Filter, 
  Download,
  Edit,
  Trash2,
  Plus,
  User,
  Calendar,
  Building2,
  Settings,
  Eye
} from "lucide-react";

interface IAuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly user: string;
  readonly action: string;
  readonly object: string;
  readonly details: string;
  readonly objectType: "user" | "booking" | "facility" | "role" | "system";
}

const AuditLogPage = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [objectTypeFilter, setObjectTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Mock data
  const auditEvents: readonly IAuditEvent[] = [
    {
      id: "1",
      timestamp: "2024-01-15T10:12:00Z",
      user: "Amin Ismail",
      action: "Endret rolle",
      object: "Sarah Nilsen",
      details: "Saksbehandler → Admin",
      objectType: "user"
    },
    {
      id: "2",
      timestamp: "2024-01-15T09:45:00Z",
      user: "Sarah Nilsen",
      action: "Godkjent booking",
      object: "#245",
      details: "Drammen Idrettshall - 20.01.2024 14:00-16:00",
      objectType: "booking"
    },
    {
      id: "3",
      timestamp: "2024-01-14T22:11:00Z",
      user: "System",
      action: "Booking slettet",
      object: "#243",
      details: "Automatisk sletting (regel 7)",
      objectType: "booking"
    },
    {
      id: "4",
      timestamp: "2024-01-14T16:30:00Z",
      user: "Per Hansen",
      action: "Opprettet lokale",
      object: "Nytt møterom",
      details: "Møterom 3 - Kapasitet: 12 personer",
      objectType: "facility"
    },
    {
      id: "5",
      timestamp: "2024-01-14T14:20:00Z",
      user: "Amin Ismail",
      action: "Endret rolle",
      object: "Redaktør",
      details: "Lagt til rettighet: facilities.delete",
      objectType: "role"
    },
    {
      id: "6",
      timestamp: "2024-01-13T08:00:00Z",
      user: "System",
      action: "System vedlikehold",
      object: "Database backup",
      details: "Månedlig backup fullført",
      objectType: "system"
    }
  ];

  const filteredEvents = useMemo(() => {
    return auditEvents.filter(event => {
      const matchesSearch = !searchQuery || 
        event.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.object.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.details.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesUser = !userFilter || event.user === userFilter;
      const matchesAction = !actionFilter || event.action === actionFilter;
      const matchesObjectType = !objectTypeFilter || event.objectType === objectTypeFilter;
      const matchesDate = !dateFilter || event.timestamp.startsWith(dateFilter);
      
      return matchesSearch && matchesUser && matchesAction && matchesObjectType && matchesDate;
    });
  }, [auditEvents, searchQuery, userFilter, actionFilter, objectTypeFilter, dateFilter]);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('nb-NO');
  };

  const getActionIcon = (action: string): React.ComponentType<{ className?: string }> => {
    if (action.includes("Endret") || action.includes("Oppdatert")) return Edit;
    if (action.includes("Slettet") || action.includes("Fjernet")) return Trash2;
    if (action.includes("Opprettet") || action.includes("Lagt til")) return Plus;
    if (action.includes("Godkjent") || action.includes("Avvist")) return Eye;
    return Settings;
  };

  const getObjectTypeIcon = (objectType: IAuditEvent["objectType"]): React.ComponentType<{ className?: string }> => {
    const icons = {
      user: User,
      booking: Calendar,
      facility: Building2,
      role: Settings,
      system: Settings
    };
    return icons[objectType];
  };

  const getObjectTypeColor = (objectType: IAuditEvent["objectType"]): string => {
    const colors = {
      user: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      booking: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      facility: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      role: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      system: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    };
    return colors[objectType];
  };

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(auditEvents.map(event => event.user))).sort();
  }, [auditEvents]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditEvents.map(event => event.action))).sort();
  }, [auditEvents]);

  const handleExportCSV = (): void => {
    try {
      const csvHeaders = [
        'Tidspunkt',
        'Bruker',
        'Handling',
        'Objekt',
        'Detaljer',
        'Objekttype'
      ];
      
      const csvData = filteredEvents.map(event => [
        formatTimestamp(event.timestamp),
        event.user,
        event.action,
        event.object,
        event.details,
        event.objectType
      ]);
      
      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      alert('Audit-log eksportert til CSV!');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Kunne ikke eksportere CSV. Prøv igjen.');
    }
  };

  const handleFilter = (): void => {
    // Filter is already applied through useMemo
  };

  return (
    <RequireRole roles={["org-admin", "system-admin"]}>
      <SystemPageLayout
        title="Revisjonslogg"
        description="Spor alle viktige endringer i systemet for etterlevelse og sikkerhet"
        searchPlaceholder="Søk hendelser..."
        onSearch={setSearchQuery}
        showFilter={true}
        onFilter={handleFilter}
        secondaryActions={[
          {
            label: "Eksporter logg til CSV",
            icon: Download,
            onClick: handleExportCSV
          }
        ]}
      >
        {/* Filter Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrering</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bruker
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Alle brukere</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Handling
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Alle handlinger</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Objekttype
                </label>
                <select
                  value={objectTypeFilter}
                  onChange={(e) => setObjectTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Alle typer</option>
                  <option value="user">Bruker</option>
                  <option value="booking">Booking</option>
                  <option value="facility">Lokale</option>
                  <option value="role">Rolle</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dato
                </label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUserFilter("");
                    setActionFilter("");
                    setObjectTypeFilter("");
                    setDateFilter("");
                  }}
                  className="w-full"
                >
                  Tilbakestill
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hendelseslogg ({filteredEvents.length} hendelser)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tidspunkt</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Bruker</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Handling</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Objekt</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Detaljer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => {
                    const ActionIcon = getActionIcon(event.action);
                    const ObjectTypeIcon = getObjectTypeIcon(event.objectType);
                    
                    return (
                      <tr key={event.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {formatTimestamp(event.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                          {event.user}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <ActionIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{event.action}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <ObjectTypeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{event.object}</span>
                            <Badge className={getObjectTypeColor(event.objectType)}>
                              {event.objectType}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {event.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </SystemPageLayout>
    </RequireRole>
  );
};

export default AuditLogPage;
