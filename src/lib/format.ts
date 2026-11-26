// The department runs on Pakistan Standard Time (UTC+5, no daylight saving). Event times entered
// by admins are interpreted in this zone, and all dates are displayed in it.
export const APP_TIME_ZONE = "Asia/Karachi";
const APP_UTC_OFFSET = "+05:00";

export function toUtcDate(date: string, time: string) {
  return new Date(`${date}T${time}:00${APP_UTC_OFFSET}`);
}

/** Splits a stored date into the yyyy-mm-dd / hh:mm values used by date & time inputs. */
export function toLocalInputs(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatEventParts(d: Date) {
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIME_ZONE, ...o }).format(d);
  return {
    month: f({ month: "short" }).toUpperCase(),
    day: f({ day: "numeric" }),
    weekday: f({ weekday: "long" }),
    time: f({ hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function timeAgo(d: Date, now = new Date()) {
  const seconds = Math.round((d.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), "day");
  return new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIME_ZONE, day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
