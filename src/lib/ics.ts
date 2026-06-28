import type { PollSlot } from "./types";

function toIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateIcs(
  slot: PollSlot,
  title: string,
  location: string | null,
  durationMin: number,
): string {
  const time = slot.time || "12:00";
  const start = new Date(slot.date + "T" + time);
  const end =
    slot.endDate && slot.endDate !== slot.date
      ? new Date(slot.endDate + "T23:59:59")
      : new Date(start.getTime() + durationMin * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Overlap//EN",
    "BEGIN:VEVENT",
    `UID:${slot.id}-${Date.now()}@overlap`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title || "Event"}`,
    `LOCATION:${location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(
  slot: PollSlot,
  title: string,
  location: string | null,
  durationMin: number,
): void {
  const ics = generateIcs(slot, title, location, durationMin);
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download =
    (title || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
