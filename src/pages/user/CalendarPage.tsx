"use client";

import React, { useMemo, useState } from "react";
import { SimpleCalendar } from "@/components/calendar/SimpleCalendar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IBookingEvent } from "@/types/calendar";

export default function CalendarPage(): JSX.Element {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<IBookingEvent | null>(null);

  const range = useMemo(() => {
    return {
      from: startOfMonth(currentDate).toISOString(),
      to: endOfMonth(currentDate).toISOString()
    };
  }, [currentDate]);

  const query = useMemo(() => ({
    from: range.from,
    to: range.to,
    text: searchQuery || undefined,
    facilityIds: selectedFacility !== "all" ? [selectedFacility] : undefined,
    statuses: selectedStatus !== "all" ? [selectedStatus as "confirmed" | "pending" | "cancelled"] : undefined
  }), [range, searchQuery, selectedFacility, selectedStatus]);

  const { data = [], isLoading } = useCalendarEvents(query);

  const facilities = ["Drammenshallen", "Kulturhuset", "Idrettshallen", "Svømmehallen"];

  const handleEventClick = (event: IBookingEvent) => {
    setSelectedEvent(event);
  };

  const handleNewBooking = () => {
    console.log("Ny booking");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Laster kalender...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kalender
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Se og administrer kommende bookinger
          </p>
        </div>
        <Button 
          onClick={handleNewBooking}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ny booking
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Søk i bookinger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <SelectItem value="confirmed">Bekreftet</SelectItem>
                <SelectItem value="pending">Ventende</SelectItem>
                <SelectItem value="cancelled">Avlyst</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <SimpleCalendar
        events={data}
        onEventClick={handleEventClick}
        className="w-full"
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lokale:</span>
                  <span>{selectedEvent.facilityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dato:</span>
                  <span>{new Date(selectedEvent.start).toLocaleDateString("nb-NO")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tid:</span>
                  <span>
                    {new Date(selectedEvent.start).toLocaleTimeString("nb-NO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })} - {new Date(selectedEvent.end).toLocaleTimeString("nb-NO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={
                    selectedEvent.status === "confirmed" ? "bg-green-100 text-green-800" :
                    selectedEvent.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {selectedEvent.status === "confirmed" ? "Bekreftet" :
                     selectedEvent.status === "pending" ? "Ventende" : "Avlyst"}
                  </Badge>
                </div>
                {selectedEvent.priceNok && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pris:</span>
                    <span className="font-medium">{selectedEvent.priceNok} kr</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button size="sm" className="flex-1">
                  Se detaljer
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Endre
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Avlys
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}