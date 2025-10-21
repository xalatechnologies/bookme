"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  History, 
  Search, 
  Download, 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { downloadICS } from "@/utils/ics";
import type { IBookingHistoryItem } from "@/types/history";

export default function HistoryPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<string>("start_desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const query = useMemo(() => ({
    text: searchQuery || undefined,
    facilityIds: selectedFacility !== "all" ? [selectedFacility] : undefined,
    statuses: selectedStatus !== "all" ? [selectedStatus as "completed" | "cancelled"] : undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
    sort: sortBy as "start_desc" | "start_asc",
    page: 1,
    pageSize: 50
  }), [searchQuery, selectedFacility, selectedStatus, dateFrom, dateTo, sortBy]);

  // Get data from localStorage and group recurring bookings
  const data = useMemo(() => {
    try {
      const pending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const processed = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const all = [...pending, ...processed];
      
      // Group recurring bookings by parentBookingId or fallback key
      const groupedRecurring = new Map();
      const singleBookings = [];
      
      all.forEach((booking: any) => {
        const parentKey = booking.parentBookingId || 
          `${booking.facility || booking.facilityName}-${booking.purpose}-${booking.time || booking.startTime}`;
        
        if (booking.isRecurring || booking.bookingType === 'recurring') {
          if (!groupedRecurring.has(parentKey)) {
            groupedRecurring.set(parentKey, []);
          }
          groupedRecurring.get(parentKey).push(booking);
        } else {
          singleBookings.push(booking);
        }
      });
      
      // Convert single bookings to history format
      const singleHistoryItems = singleBookings.map((booking: any) => {
        // Handle different date/time formats
        let startDate, endDate;
        if (booking.startDate && booking.startTime) {
          startDate = new Date(booking.startDate + 'T' + booking.startTime).toISOString();
        } else if (booking.date && booking.time) {
          const [startTime, endTime] = booking.time.split('-');
          startDate = new Date(booking.date + 'T' + startTime).toISOString();
        } else {
          startDate = new Date().toISOString();
        }
        
        if (booking.endTime) {
          endDate = new Date(booking.startDate + 'T' + booking.endTime).toISOString();
        } else if (booking.time) {
          const [, endTime] = booking.time.split('-');
          endDate = new Date(booking.date + 'T' + endTime).toISOString();
        } else {
          endDate = new Date(startDate).toISOString();
        }
        
        // Calculate duration from booking data instead of time difference
        let durationHours = 1; // Default to 1 hour
        if (booking.duration) {
          // If duration is in minutes, convert to hours
          durationHours = typeof booking.duration === 'number' ? booking.duration / 60 : 1;
        } else if (booking.time) {
          // Calculate from time range if duration not available
          const [startTime, endTime] = booking.time.split('-');
          const [startH, startM] = startTime.split(':').map(Number);
          const [endH, endM] = endTime.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          durationHours = (endMinutes - startMinutes) / 60;
        }

        return {
          id: booking.id,
          start: startDate,
          end: endDate,
          startTime: booking.startTime || booking.time?.split('-')[0] || '09:00',
          endTime: booking.endTime || booking.time?.split('-')[1] || '10:00',
          duration: durationHours,
          facilityName: booking.facilityName || booking.facility || 'Ukjent lokale',
          status: booking.status === 'approved' ? 'confirmed' : booking.status === 'rejected' ? 'rejected' : 'pending',
          totalPriceNok: parseFloat(booking.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0'),
          bookingId: booking.id,
          purpose: booking.purpose || 'Ikke spesifisert',
          location: booking.facilityName || booking.facility || 'Ukjent lokale',
          isRecurring: false,
          // Store original date for better display
          originalDate: booking.startDate || booking.date,
          originalTime: booking.time || `${booking.startTime || '09:00'}-${booking.endTime || '10:00'}`
        };
      });
      
      // Convert recurring booking groups to history format
      const recurringHistoryItems = Array.from(groupedRecurring.entries()).map(([parentKey, bookings]) => {
        const first = bookings[0];
        const last = bookings[bookings.length - 1];
        
        // Calculate total price for all occurrences
        const totalPrice = bookings.reduce((sum, booking) => {
          return sum + parseFloat(booking.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
        }, 0);
        
        // Determine group status
        const statuses = bookings.map(b => b.status);
        const groupStatus = statuses.every(s => s === 'approved') ? 'confirmed' :
                           statuses.every(s => s === 'rejected') ? 'rejected' : 'pending';
        
        // Calculate total duration for recurring bookings
        const totalDuration = bookings.reduce((sum, booking) => {
          let durationHours = 1;
          if (booking.duration) {
            durationHours = typeof booking.duration === 'number' ? booking.duration / 60 : 1;
          } else if (booking.time) {
            const [startTime, endTime] = booking.time.split('-');
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            durationHours = (endMinutes - startMinutes) / 60;
          }
          return sum + durationHours;
        }, 0);

        return {
          id: parentKey,
          start: new Date(first.startDate || first.date).toISOString(),
          end: new Date(last.startDate || last.date).toISOString(),
          startTime: first.startTime || first.time?.split('-')[0] || '09:00',
          endTime: last.endTime || last.time?.split('-')[1] || '10:00',
          duration: totalDuration,
          facilityName: first.facilityName || first.facility || 'Ukjent lokale',
          status: groupStatus,
          totalPriceNok: totalPrice,
          bookingId: parentKey,
          purpose: first.purpose || 'Ikke spesifisert',
          location: first.facilityName || first.facility || 'Ukjent lokale',
          isRecurring: true,
          occurrenceCount: bookings.length,
          // Store original date for better display
          originalDate: first.startDate || first.date,
          originalTime: first.time || `${first.startTime || '09:00'}-${first.endTime || '10:00'}`,
          occurrences: bookings.map(booking => ({
            id: booking.id,
            date: booking.startDate || booking.date,
            time: booking.startTime || booking.time,
            status: booking.status
          }))
        };
      });
      
      // Combine single and recurring items
      const allHistoryItems = [...singleHistoryItems, ...recurringHistoryItems];
      
      return {
        items: allHistoryItems,
        total: allHistoryItems.length,
        page: 1,
        pageSize: 50,
        totalPages: 1
      };
    } catch (error) {
      console.error('Error loading history data:', error);
      return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 1 };
    }
  }, []);

  const isLoading = false; // No loading state needed for localStorage

  const facilities = useMemo(() => {
    const allBookings = [...(data?.items || [])];
    const uniqueFacilities = [...new Set(allBookings.map(booking => booking.facilityName))];
    return uniqueFacilities.filter(Boolean);
  }, [data]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!data) return { totalBookings: 0, totalHours: 0, totalSpent: 0, cancellations: 0 };
    
    const totalBookings = data.total;
    const totalHours = data.items.reduce((sum, item) => {
      // Use the duration field we calculated instead of time difference
      return sum + (item.duration || 1);
    }, 0);
    const totalSpent = data.items.reduce((sum, item) => sum + (item.totalPriceNok || 0), 0);
    const cancellations = data.items.filter(item => item.status === "rejected").length;
    
    return { totalBookings, totalHours, totalSpent, cancellations };
  }, [data]);

  const handleExportCsv = async () => {
    try {
      // Mock CSV export
      const csvContent = [
        "Dato,Tid,Lokale,Aktivitet,Varighet,Status,Sum,Faktura",
        ...(data?.items || []).map(item => [
          new Date(item.start).toLocaleDateString("nb-NO"),
          `${new Date(item.start).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}-${new Date(item.end).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`,
          item.facilityName,
          item.title,
          `${(new Date(item.end).getTime() - new Date(item.start).getTime()) / 3_600_000} t`,
          item.status,
          item.totalPriceNok ? `${item.totalPriceNok} kr` : "-",
          item.invoiceId || "-"
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookme-history-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
    }
  };

  const handleDownloadICS = (item: IBookingHistoryItem) => {
    const event = {
      id: item.id,
      facilityId: item.facilityId,
      facilityName: item.facilityName,
      title: item.title,
      start: item.start,
      end: item.end,
      status: item.status as "confirmed" | "pending" | "cancelled"
    };
    downloadICS(event);
  };

  const toggleRowExpansion = (itemId: string) => {
    setExpandedRow(expandedRow === itemId ? null : itemId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historikk
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Se alle tidligere bookinger og last ned kvitteringer
          </p>
        </div>
        <Button 
          onClick={handleExportCsv}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Eksporter CSV
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bookinger</p>
                <p className="text-2xl font-bold">{kpis.totalBookings}</p>
              </div>
              <History className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Timer brukt</p>
                <p className="text-2xl font-bold">{kpis.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sum betalt</p>
                <p className="text-2xl font-bold">{kpis.totalSpent.toLocaleString()} kr</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avlysninger</p>
                <p className="text-2xl font-bold">{kpis.cancellations}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Søk i historikk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Fra dato"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="Til dato"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>

            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Velg lokale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle lokaler</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Velg status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statuser</SelectItem>
                <SelectItem value="completed">Fullført</SelectItem>
                <SelectItem value="cancelled">Avlyst</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sorter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start_desc">Nyeste først</SelectItem>
                <SelectItem value="start_asc">Eldste først</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Bookinghistorikk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Laster historikk...</p>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ingen bookinger funnet
              </h3>
              <p className="text-gray-600 mb-4">
                Prøv å endre filter eller søkekriteriene.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Dato</th>
                    <th className="px-4 py-3 font-medium">Tid</th>
                    <th className="px-4 py-3 font-medium">Lokale</th>
                    <th className="px-4 py-3 font-medium">Aktivitet</th>
                    <th className="px-4 py-3 font-medium">Varighet</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sum</th>
                    <th className="px-4 py-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRowExpansion(item.id)}
                      >
                        <td className="px-4 py-3">
                          {item.originalDate ? 
                            new Date(item.originalDate).toLocaleDateString("nb-NO") :
                            (() => {
                              // Handle date display more carefully to avoid timezone issues
                              const dateStr = item.start.split('T')[0]; // Get YYYY-MM-DD part
                              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                // If it's a YYYY-MM-DD string, parse it as local date
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const localDate = new Date(year, month - 1, day);
                                return localDate.toLocaleDateString("nb-NO");
                              } else {
                                // Fallback to original method
                                return new Date(item.start).toLocaleDateString("nb-NO");
                              }
                            })()
                          }
                        </td>
                        <td className="px-4 py-3">
                          {item.startTime && item.endTime ? 
                            `${item.startTime} - ${item.endTime}` : 
                            `${new Date(item.start).toLocaleTimeString("nb-NO", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                            })} - ${new Date(item.end).toLocaleTimeString("nb-NO", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                            })}`
                          }
                        </td>
                        <td className="px-4 py-3">{item.facilityName}</td>
                        <td className="px-4 py-3">{item.purpose || item.title || 'Ikke spesifisert'}</td>
                        <td className="px-4 py-3">
                          {item.duration ? `${item.duration.toFixed(1)} t` : '1.0 t'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            item.status === "confirmed" 
                              ? "bg-green-100 text-green-800" 
                              : item.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }>
                            {item.status === "confirmed" ? "Bekreftet" : 
                             item.status === "rejected" ? "Avvist" : "Ventende"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {item.totalPriceNok ? `${item.totalPriceNok.toLocaleString()} kr` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadICS(item);
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            {expandedRow === item.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row Details */}
                      {expandedRow === item.id && (
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Opprettet:</span>
                                  <span className="ml-2">
                                    {new Date(item.createdAt).toLocaleDateString("nb-NO")}
                                  </span>
                                </div>
                                {item.invoiceId && (
                                  <div>
                                    <span className="text-gray-600">Faktura:</span>
                                    <span className="ml-2">{item.invoiceId}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Last ned kvittering
                                </Button>
                                <Button size="sm" variant="outline">
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Rebook
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Legg til i kalender
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
