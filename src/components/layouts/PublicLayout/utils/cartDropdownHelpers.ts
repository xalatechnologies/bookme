import { format, parseISO } from "date-fns";
import { nb, enUS } from "date-fns/locale";

/**
 * Format time slot for display
 *
 * @param slot - Time slot object
 * @param locale - Date locale (nb or enUS)
 * @param invalidDateLabel - Label to show for invalid dates
 * @returns Formatted string
 */
export const formatTimeSlot = (
  slot: { date: string | Date; timeSlot: string },
  locale: typeof nb | typeof enUS,
  invalidDateLabel: string
): string => {
  try {
    const dateObj = typeof slot.date === 'string' ? parseISO(slot.date) : slot.date;
    const date = format(dateObj, "dd. MMM", { locale });
    const time = slot.timeSlot.split('-')[0];
    return `${date} ${time}`;
  } catch {
    return invalidDateLabel;
  }
};

/**
 * Format time duration
 *
 * @param duration - Duration in minutes
 * @param hourLabel - Label for single hour
 * @param hoursLabel - Label for multiple hours
 * @returns Formatted duration string
 */
export const formatDuration = (
  duration: number,
  hourLabel: string,
  hoursLabel: string
): string => {
  const hours = duration / 60;
  return hours === 1 ? hourLabel : hoursLabel;
};
