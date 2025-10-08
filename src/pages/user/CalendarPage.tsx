"use client";

import React, { useMemo, useState } from "react";
import { Calendar, View, SlotInfo } from "react-big-calendar";
import { localizer } from "@/lib/calendar/localizer";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Plus,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IBookingEvent } from "@/types/calendar";

export default function CalendarPage(): JSX.Element {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const range = useMemo(() => {
    const now = date;
    switch (view) {
      case "month":
        return {
          from: startOfMonth(now).toISOString(),
          to: endOfMonth(now).toISOString()
        };
      case "week":
        return {
          from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          to: endOfWeek(now, { weekStartsOn: 1 }).toISOString()
        };
      case "day":
        return {
          from: startOfDay(now).toISOString(),
          to: endOfDay(now).toISOString()
        };
      default:
        return {
          from: startOfMonth(now).toISOString(),
          to: endOfMonth(now).toISOString()
        };
    }
  }, [date, view]);

  const query = useMemo(() => ({
    from: range.from,
    to: range.to,
    text: searchQuery || undefined,
    facilityIds: selectedFacility !== "all" ? [selectedFacility] : undefined,
    statuses: selectedStatus !== "all" ? [selectedStatus as "confirmed" | "pending" | "cancelled"] : undefined
  }), [range, searchQuery, selectedFacility, selectedStatus]);

  const { data = [], isLoading } = useCalendarEvents(query);
  const [selectedEvent, setSelectedEvent] = useState<IBookingEvent | null>(null);
  const [newSlot, setNewSlot] = useState<SlotInfo | null>(null);

  const facilities = ["Drammenshallen", "Kulturhuset", "Idrettshallen", "Svømmehallen"];

  const eventStyleGetter = (event: IBookingEvent) => {
    const base = "border rounded-sm text-xs font-medium";
    const by = {
      confirmed: "border-green-600 bg-green-50 text-green-900",
      pending: "border-yellow-600 bg-yellow-50 text-yellow-900",
      cancelled: "border-red-600 bg-red-50 text-red-900 line-through"
    }[event.status];
    return { className: `${base} ${by}` };
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleSelectEvent = (event: IBookingEvent) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = (slot: SlotInfo) => {
    setNewSlot(slot);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handlePrev = () => {
    const newDate = new Date(date);
    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    switch (view) {
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setDate(newDate);
  };

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
          onClick={() => console.log("Ny booking")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ny booking
        </Button>
      </header>

      {/* Toolbar */}
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setView("month")}
                className={view === "month" ? "bg-blue-50" : ""}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("week")}
                className={view === "week" ? "bg-blue-50" : ""}
              >
                Uke
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("day")}
                className={view === "day" ? "bg-blue-50" : ""}
              >
                Dag
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("agenda")}
                className={view === "agenda" ? "bg-blue-50" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            I dag
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <h2 className="text-lg font-semibold">
          {date.toLocaleDateString("nb-NO", { 
            year: "numeric", 
            month: "long",
            ...(view === "week" && { day: "numeric" })
          })}
        </h2>
      </div>

      {/* Calendar Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-600 rounded"></div>
          <span>Bekreftet</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-600 rounded"></div>
          <span>Ventende</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-600 rounded"></div>
          <span>Avlyst</span>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] rbc-calendar">
            <Calendar
              localizer={localizer}
              events={data}
              date={date}
              view={view}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              popup
              culture="nb"
              eventPropGetter={eventStyleGetter}
              step={60}
              timeslots={1}
              messages={{
                next: "Neste",
                previous: "Forrige",
                today: "I dag",
                month: "Måned",
                week: "Uke",
                day: "Dag",
                agenda: "Liste",
                date: "Dato",
                time: "Tid",
                event: "Booking",
                noEventsInRange: "Ingen bookinger i dette intervallet",
                showMore: (total) => `+${total} flere`
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
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

      {/* New Booking Modal */}
      {newSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ny booking</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewSlot(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dato:</span>
                  <span>{newSlot.start.toLocaleDateString("nb-NO")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tid:</span>
                  <span>
                    {newSlot.start.toLocaleTimeString("nb-NO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })} - {newSlot.end.toLocaleTimeString("nb-NO", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button size="sm" className="flex-1">
                  Opprett booking
                </Button>
                <Button variant="outline" size="sm" onClick={() => setNewSlot(null)}>
                  Avbryt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
