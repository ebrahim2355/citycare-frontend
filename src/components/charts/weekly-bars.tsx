"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatShortDate } from "@/lib/format";

const config = { resolved: { label: "Resolved", color: "var(--chart-1)" } } satisfies ChartConfig;

export default function WeeklyBars({ data }: { data: { week: string; resolved: number }[] }) {
  const rows = data.map((item) => ({ ...item, label: formatShortDate(`${item.week}T12:00:00Z`) }));

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={rows} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(label) => `Week of ${label}`} />} />
        <Bar dataKey="resolved" fill="var(--color-resolved)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
