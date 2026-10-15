const TIME_ZONE = "Asia/Dhaka";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
const shortDateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
});
const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

export const formatDate = (value: string | Date | null | undefined) => (value ? dateFormat.format(toDate(value)) : "—");

export const formatShortDate = (value: string | Date | null | undefined) => (value ? shortDateFormat.format(toDate(value)) : "—");

export const formatDateTime = (value: string | Date | null | undefined) => (value ? dateTimeFormat.format(toDate(value)) : "—");

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export const formatRelative = (value: string | Date | null | undefined, now = Date.now()) => {
  if (!value) {
    return "—";
  }

  const seconds = Math.round((toDate(value).getTime() - now) / 1000);

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }

  return "just now";
};

export const formatMoney = (amount: string | number | null | undefined, currency = "usd") => {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );
};

export const formatNumber = (value: number | null | undefined) => new Intl.NumberFormat("en-US").format(value ?? 0);

export const formatHours = (hours: number | null | undefined) => {
  if (hours === null || hours === undefined) {
    return "—";
  }

  if (hours < 1) {
    return `${Math.max(1, Math.round(hours * 60))} min`;
  }

  if (hours < 48) {
    return `${Number(hours.toFixed(1))} h`;
  }

  const days = Math.floor(hours / 24);
  const rest = Math.round(hours % 24);

  return rest ? `${days}d ${rest}h` : `${days} days`;
};

export const formatSla = (hours: number) => (hours % 24 === 0 ? `${hours / 24} day${hours === 24 ? "" : "s"}` : `${hours} hours`);

export const formatBytes = (bytes: number | null | undefined) => {
  if (!bytes) {
    return "—";
  }

  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const pluralize = (count: number, word: string, plural = `${word}s`) => `${formatNumber(count)} ${count === 1 ? word : plural}`;

export const humanize = (value: string) => value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
