"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatShortDate } from "@/lib/format";

const config = {
  created: { label: "New reports", color: "var(--chart-3)" },
  resolved: { label: "Resolved", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function TrendArea({ data }: { data: { date: string; created: number; resolved: number }[] }) {
  const rows = data.map((item) => ({ ...item, label: formatShortDate(`${item.date}T12:00:00Z`) }));

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <AreaChart data={rows} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fill-created" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fill-resolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-resolved)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-resolved)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Area dataKey="created" type="monotone" stroke="var(--color-created)" fill="url(#fill-created)" strokeWidth={2} />
        <Area dataKey="resolved" type="monotone" stroke="var(--color-resolved)" fill="url(#fill-resolved)" strokeWidth={2} />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
