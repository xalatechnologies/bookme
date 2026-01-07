import { useState } from "react";
import { format, startOfWeek, addWeeks, subWeeks, addDays, getWeek } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Activity {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  organizer: string;
  description: string;
  type: "reserved" | "booked";
}

// Mock data for activities
const generateMockActivities = (weekStart: Date): Activity[] => {
  const activities: Activity[] = [];
  
  // Wednesday activities
  const wed = addDays(weekStart, 2);
  activities.push(
    {
      id: "1",
      date: wed,
      startTime: "08:00",
      endTime: "17:00",
      organizer: "Kommunen",
      description: "Reservert skole/SFO",
      type: "reserved",
    },
    {
      id: "2",
      date: wed,
      startTime: "17:00",
      endTime: "18:00",
      organizer: "Stoppen Sportsklubb",
      description: "Allidrett og futsal. G2016",
      type: "booked",
    },
    {
      id: "3",
      date: wed,
      startTime: "18:00",
      endTime: "19:00",
      organizer: "Stoppen Sportsklubb",
      description: "Lek med og uten ball, allidrett og futsal. J2016",
      type: "booked",
    },
    {
      id: "4",
      date: wed,
      startTime: "20:00",
      endTime: "21:00",
      organizer: "Anne Huseby Linneberg",
      description: "Trening, voksne",
      type: "booked",
    }
  );

  // Thursday activities
  const thu = addDays(weekStart, 3);
  activities.push(
    {
      id: "5",
      date: thu,
      startTime: "08:00",
      endTime: "17:00",
      organizer: "Kommunen",
      description: "Reservert skole/SFO",
      type: "reserved",
    },
    {
      id: "6",
      date: thu,
      startTime: "17:00",
      endTime: "18:00",
      organizer: "Stoppen Sportsklubb",
      description: "Futsal grunnmotoriske ferdigheter, G2015",
      type: "booked",
    },
    {
      id: "7",
      date: thu,
      startTime: "18:00",
      endTime: "19:00",
      organizer: "Stoppen Sportsklubb",
      description: "Futsal og grunnmotoriske ferdigheter, G2015",
      type: "booked",
    }
  );

  return activities;
};

export function ActivityCalendar() {
  const [weekStart, setWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  
  const activities = generateMockActivities(weekStart);
  const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const dateKey = format(activity.date, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const handlePreviousWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  return (
    <div className="space-y-6">
      {/* Week selector */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <span className="text-sm text-muted-foreground">Velg uke</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Select value={weekNumber.toString()}>
            <SelectTrigger className="w-[280px]">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  UKE {weekNumber} / {format(weekStart, "yyyy")} ({format(weekStart, "dd.MM")} - {format(weekEnd, "dd.MM")})
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                <SelectItem key={week} value={week.toString()}>
                  Uke {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Activities list */}
      <div className="space-y-4">
        {Object.entries(groupedActivities).map(([dateKey, dayActivities]) => {
          const date = new Date(dateKey);
          return (
            <Card key={dateKey} className="overflow-hidden">
              <div className="bg-primary/5 border-b border-border px-4 py-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {format(date, "EEEE", { locale: nb })}
                  <span className="text-muted-foreground font-normal">
                    {format(date, "dd.MM.yyyy")}
                  </span>
                </h3>
              </div>
              <CardContent className="p-0 divide-y divide-border">
                {dayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Time */}
                    <div className="flex-shrink-0 w-24">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {activity.startTime}
                      </div>
                      <div className="text-xs text-muted-foreground ml-5">
                        - {activity.endTime}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                          {activity.organizer}
                        </span>
                        {activity.type === "reserved" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--slot-reserved))]/20 text-[hsl(var(--slot-reserved))]">
                            Reservert
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {Object.keys(groupedActivities).length === 0 && (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Ingen aktiviteter denne uken
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
