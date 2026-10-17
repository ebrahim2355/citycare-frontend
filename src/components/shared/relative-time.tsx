import { formatDateTime, formatRelative } from "@/lib/format";

export function RelativeTime({ value, prefix }: { value: string; prefix?: string }) {
  return (
    <time dateTime={value} title={formatDateTime(value)} suppressHydrationWarning>
      {prefix ? `${prefix} ${formatRelative(value)}` : formatRelative(value)}
    </time>
  );
}
