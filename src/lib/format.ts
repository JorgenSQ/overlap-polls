export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d + "T00:00");
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateRange(
  date: string | null | undefined,
  endDate?: string | null,
): string {
  if (!date) return "—";
  if (!endDate || endDate === date) return fmtDate(date);
  return `${fmtDate(date)} – ${fmtDate(endDate)}`;
}

export function fmtTime(t: string | null | undefined): string {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = ((h + 11) % 12) + 1;
  return hh + (m ? ":" + String(m).padStart(2, "0") : "") + " " + ap;
}

export function avatarColor(index: number): string {
  const colors = [
    "#E85A3C",
    "#4F9D69",
    "#3E78C2",
    "#5B8FD4",
    "#D4952F",
    "#2BB0A6",
    "#D6597B",
  ];
  return colors[index % colors.length];
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function pollUrl(id: string, path: "" | "share" | "results" = ""): string {
  const base = getAppUrl();
  if (path === "") return `${base}/p/${id}`;
  return `${base}/p/${id}/${path}`;
}
