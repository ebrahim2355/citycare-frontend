"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DepartmentStats } from "@/types";

const config = {
  open: { label: "Open", color: "var(--chart-2)" },
  overdue: { label: "Overdue", color: "var(--chart-5)" },
  resolved: { label: "Resolved", color: "var(--chart-1)" },
} satisfies ChartConfig;

const shortName = (name: string) => name.split(" ")[0] ?? name;

export default function DepartmentBars({ data }: { data: DepartmentStats[] }) {
  const rows = data.map((department) => ({ ...department, label: shortName(department.name) }));

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={rows} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_label, payload) => (payload?.[0]?.payload as DepartmentStats | undefined)?.name ?? ""}
            />
          }
        />
        <Bar dataKey="open" fill="var(--color-open)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="overdue" fill="var(--color-overdue)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="resolved" fill="var(--color-resolved)" radius={[4, 4, 0, 0]} />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}
