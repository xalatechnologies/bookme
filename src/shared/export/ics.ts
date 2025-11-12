import type { IBookingEvent } from "@/types/calendar";

export function bookingToICS(e: IBookingEvent): string {
  const dt = (s: string) => s.replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Booknor//NO",
    "BEGIN:VEVENT",
    `UID:${e.id}@booknor`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(e.start)}`,
    `DTEND:${dt(e.end)}`,
    `SUMMARY:${e.title} - ${e.facilityName}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

export function downloadICS(booking: IBookingEvent): void {
  const icsContent = bookingToICS(booking);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `booking-${booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
