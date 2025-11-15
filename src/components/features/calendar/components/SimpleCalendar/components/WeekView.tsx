import React from 'react';
import { useTranslation } from 'react-i18next';
import type { IBookingEvent } from '@/types/calendar';
import type { CalendarDay } from '@/hooks/features/calendar/useCalendarDateLogic';

interface WeekViewProps {
  readonly calendarDays: readonly CalendarDay[];
  readonly events: readonly IBookingEvent[];
  readonly getEventsForDate: (day: number | null, events: readonly IBookingEvent[]) => readonly IBookingEvent[];
  readonly onEventClick?: (event: IBookingEvent) => void;
  readonly onEventHover?: (event: IBookingEvent | null) => void;
  readonly onEventRightClick?: (event: IBookingEvent, position: { x: number; y: number }) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  calendarDays,
  events,
  getEventsForDate,
  onEventClick,
  onEventHover,
  onEventRightClick
}): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div className="grid gap-px bg-gray-200 dark:bg-gray-700 grid-cols-7">
      {calendarDays.map((dayInfo, index) => {
        const { date: day, isToday } = dayInfo;
        const dayEvents = getEventsForDate(day, events);

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 min-h-[100px] p-2"
          >
            {day && (
              <>
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {day}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      onMouseEnter={() => onEventHover?.(event)}
                      onMouseLeave={() => onEventHover?.(null)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onEventRightClick?.(event, { x: e.clientX, y: e.clientY });
                      }}
                      className={`text-xs p-1 rounded cursor-pointer truncate transition-colors ${
                        event.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                          : event.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      }`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {new Date(event.start).toLocaleTimeString('no-NO', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Show "more" indicator if there are more than 3 events */}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {t('common.other')} (+{dayEvents.length - 3})
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};