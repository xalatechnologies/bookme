"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zone } from "@/types/booking";
import { useCalendarGrid } from "@/hooks/features/calendar/useCalendarGrid";

interface ReadOnlyCalendarProps {
  readonly facilityId?: string;
  readonly facilityName: string;
  readonly zones: readonly Zone[];
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
}

export const ReadOnlyCalendar: React.FC<ReadOnlyCalendarProps> = ({
  facilityName,
  zones,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00"
}) => {
  const { t } = useTranslation();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || "");

  const { state, actions } = useCalendarGrid({
    openingHoursStart,
    openingHoursEnd
  });

  const { calendarWeek, timeSlots } = state;
  const { handlePreviousWeek, handleNextWeek } = actions;

  if (!zones || zones.length === 0) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen soner tilgjengelig for denne fasiliteten.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Kalender - {facilityName}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {format(calendarWeek.startDate, "d. MMM", { locale: nb })} - {format(calendarWeek.endDate, "d. MMM yyyy", { locale: nb })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('calendar:navigation.previous_week')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                {t('calendar:navigation.next_week')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zone Selector */}
      {zones.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              {zones.map((zone) => (
                <Button
                  key={zone.id}
                  variant={selectedZoneId === zone.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedZoneId(zone.id)}
                >
                  {zone.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 text-center font-medium text-gray-500 dark:text-gray-400"></div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.monday').substring(0, 3)}</div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.tuesday').substring(0, 3)}</div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.wednesday').substring(0, 3)}</div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.thursday').substring(0, 3)}</div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.friday').substring(0, 3)}</div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.saturday').substring(0, 3)}</div>
              <div className="p-3 text-center font-medium text-gray-900 dark:text-white">{t('common:time.weekdays.sunday').substring(0, 3)}</div>
            </div>

            {/* Time Slots */}
            {timeSlots.map((timeSlot) => {
              const hour = parseInt(timeSlot.split(':')[0]);
              return (
                <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                    {timeSlot.split('-')[0]}
                  </div>
                  {calendarWeek.days.map((day, dayIndex) => {
                    const isWeekend = day.isWeekend;
                    const isPast = day.isPast;

                    // Simple availability logic - you can customize this
                    const isAvailable = !isPast && (!isWeekend || hour >= 9);
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`p-3 text-center text-sm ${
                          isPast
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            : isWeekend
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                            : isAvailable
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {isPast ? 'Fortid' : isWeekend ? 'Helg' : isAvailable ? 'Ledig' : 'Opptatt'}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Ledig</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Opptatt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Helg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Fortid</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
