"use client";

import React, { useState, useMemo } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import SystemPageLayout from "@/components/admin/layout/SystemPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Download, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Building2
} from "lucide-react";

interface IBookingStats {
  readonly total: number;
  readonly approved: number;
  readonly rejected: number;
  readonly pending: number;
  readonly weeklyChange: number;
  readonly monthlyChange: number;
}

interface IUserActivity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly actionsCount: number;
  readonly lastActive: string;
  readonly status: "active" | "inactive";
}

interface IPopularFacility {
  readonly id: string;
  readonly name: string;
  readonly bookings: number;
  readonly change: number;
}

const ReportsPage = (): JSX.Element => {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mock data
  const bookingStats: IBookingStats = {
    total: 1247,
    approved: 1156,
    rejected: 67,
    pending: 24,
    weeklyChange: 12.5,
    monthlyChange: 8.3
  };

  const userActivity: readonly IUserActivity[] = [
    {
      id: "1",
      name: "Amin Ismail",
      email: "amin@bookme.com",
      actionsCount: 156,
      lastActive: "2024-01-15T10:30:00Z",
      status: "active"
    },
    {
      id: "2",
      name: "Sarah Nilsen",
      email: "sarah@kommune.no",
      actionsCount: 89,
      lastActive: "2024-01-14T15:20:00Z",
      status: "active"
    },
    {
      id: "3",
      name: "Per Hansen",
      email: "per@kommune.no",
      actionsCount: 23,
      lastActive: "2024-01-10T09:00:00Z",
      status: "inactive"
    },
    {
      id: "4",
      name: "Eva Johansen",
      email: "eva@kommune.no",
      actionsCount: 45,
      lastActive: "2024-01-12T08:15:00Z",
      status: "active"
    }
  ];

  const popularFacilities: readonly IPopularFacility[] = [
    {
      id: "1",
      name: "Drammen Idrettshall",
      bookings: 234,
      change: 15.2
    },
    {
      id: "2",
      name: "Solberghallen",
      bookings: 189,
      change: -3.1
    },
    {
      id: "3",
      name: "Kulturhuset",
      bookings: 156,
      change: 8.7
    },
    {
      id: "4",
      name: "Møterom 1",
      bookings: 98,
      change: 22.4
    }
  ];

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return userActivity;
    return userActivity.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userActivity, searchQuery]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('nb-NO');
  };

  const getStatusBadge = (status: IUserActivity["status"]): JSX.Element => {
    const statusConfig = {
      active: { 
        label: "Aktiv", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle
      },
      inactive: { 
        label: "Inaktiv", 
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        icon: Clock
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

  const getChangeIcon = (change: number): React.ComponentType<{ className?: string }> => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const handleExportCSV = (): void => {
    // TODO: Implement CSV export
  };

  const handleExportPDF = (): void => {
    // TODO: Implement PDF export
  };

  return (
    <RequireRole roles={["org-admin", "system-admin", "facility-manager"]}>
      <SystemPageLayout
        title="Rapporter"
        description="Oversikt over aktivitet og bruk i systemet"
        searchPlaceholder="Søk brukere..."
        onSearch={setSearchQuery}
        secondaryActions={[
          {
            label: "Last ned CSV",
            icon: Download,
            onClick: handleExportCSV
          },
          {
            label: "Last ned PDF",
            icon: Download,
            onClick: handleExportPDF
          }
        ]}
      >
        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Velg datointervall</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fra dato
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Til dato
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Totalt bookinger</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookingStats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {bookingStats.monthlyChange > 0 ? '+' : ''}{bookingStats.monthlyChange}% fra forrige måned
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Godkjente</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{bookingStats.approved}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {((bookingStats.approved / bookingStats.total) * 100).toFixed(1)}% godkjenningsrate
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avviste</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{bookingStats.rejected}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {((bookingStats.rejected / bookingStats.total) * 100).toFixed(1)}% avvisningsrate
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventende</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{bookingStats.pending}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Trenger behandling
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Facilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Mest brukte lokaler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularFacilities.map((facility) => {
                const ChangeIcon = getChangeIcon(facility.change);
                return (
                  <div
                    key={facility.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {facility.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {facility.bookings} bookinger
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChangeIcon className={`h-4 w-4 ${getChangeColor(facility.change)}`} />
                      <span className={`text-sm font-medium ${getChangeColor(facility.change)}`}>
                        {facility.change > 0 ? '+' : ''}{facility.change}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Brukeraktivitet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Bruker</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Antall handlinger</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sist aktiv</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {user.actionsCount}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatDateTime(user.lastActive)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </SystemPageLayout>
    </RequireRole>
  );
};

export default ReportsPage;
