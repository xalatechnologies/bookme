import React from 'react';
import { useTranslation } from 'react-i18next';
import type { IBookingEvent } from '@/types/calendar';

interface DayViewProps {
  readonly currentDate: Date;
  readonly events: readonly IBookingEvent[];
  readonly onEventClick?: (event: IBookingEvent) => void;
  readonly onEventHover?: (event: IBookingEvent | null) => void;
  readonly onEventRightClick?: (event: IBookingEvent, position: { x: number; y: number }) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onEventHover,
  onEventRightClick
}): JSX.Element => {
  const { i18n } = useTranslation('common');

  // Filter events for the current day
  const getDayEvents = (hour: number): readonly IBookingEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Use local date components to avoid timezone issues
      const eventYear = eventStart.getFullYear();
      const eventMonth = String(eventStart.getMonth() + 1).padStart(2, '0');
      const eventDay = String(eventStart.getDate()).padStart(2, '0');
      const eventDate = `${eventYear}-${eventMonth}-${eventDay}`;

      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      const currentDay = String(currentDate.getDate()).padStart(2, '0');
      const currentDateString = `${currentYear}-${currentMonth}-${currentDay}`;

      // Check if event is on the current date
      if (eventDate !== currentDateString) return false;

      // Check if this hour is within the event's time range
      const eventStartHour = eventStart.getHours();
      const eventEndHour = eventEnd.getHours();

      return hour >= eventStartHour && hour < eventEndHour;
    });
  };

  // Get the current locale based on i18n language
  const getCurrentLocale = (): string => {
    return i18n.language === 'no' ? 'nb-NO' : 'en-US';
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Time slots for day view */}
      <div className="max-h-96 overflow-y-auto">
        {Array.from({ length: 24 }, (_, hour) => {
          const timeString = `${hour.toString().padStart(2, '0')}:00`;
          const hourEvents = getDayEvents(hour);

          return (
            <div
              key={hour}
              className="flex border-b border-gray-100 dark:border-gray-700"
            >
              <div className="w-20 p-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                {timeString}
              </div>
              <div className="flex-1 p-3 min-h-[60px] relative">
                {hourEvents.map((event) => {
                  const eventStart = new Date(event.start);
                  const eventEnd = new Date(event.end);
                  const eventStartHour = eventStart.getHours();
                  const eventEndHour = eventEnd.getHours();
                  const durationHours = eventEndHour - eventStartHour;

                  // Only show the event on its starting hour to avoid duplicates
                  const isEventStartHour = eventStartHour === hour;

                  if (!isEventStartHour) return null;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      onMouseEnter={() => onEventHover?.(event)}
                      onMouseLeave={() => onEventHover?.(null)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEventRightClick?.(event, { x: e.clientX, y: e.clientY });
                      }}
                      className="text-sm p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 mb-1 transition-colors absolute left-0 right-0 z-10"
                      style={{
                        backgroundColor:
                          event.status === 'confirmed'
                            ? '#dcfce7'
                            : event.status === 'pending'
                            ? '#fef3c7'
                            : '#fecaca',
                        borderLeft: `3px solid ${
                          event.status === 'confirmed'
                            ? '#16a34a'
                            : event.status === 'pending'
                            ? '#d97706'
                            : '#dc2626'
                        }`,
                        height: `${Math.max(60, durationHours * 60)}px`,
                        top: '12px'
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">
                        {new Date(event.start).toLocaleTimeString(getCurrentLocale(), {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}{' '}
                        -{' '}
                        {new Date(event.end).toLocaleTimeString(getCurrentLocale(), {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {event.facilityName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};