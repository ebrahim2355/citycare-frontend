"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const config = { count: { label: "Ratings", color: "var(--chart-2)" } } satisfies ChartConfig;

export default function RatingBars({ data }: { data: { rating: number; count: number }[] }) {
  const rows = [...data].sort((a, b) => b.rating - a.rating).map((item) => ({ ...item, label: `${item.rating} ★` }));

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 32 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={44} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={6} barSize={22}>
          <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
