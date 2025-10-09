import { useQuery } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import type { ICalendarQuery } from "@/types/calendar";

export function useCalendarEvents(q: ICalendarQuery) {
  return useQuery({
    queryKey: ["calendar", q],
    queryFn: () => calendarService.list(q),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}
