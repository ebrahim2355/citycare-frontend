"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { STATUS_CHART_COLORS, STATUS_META } from "@/lib/complaint-meta";
import { formatNumber } from "@/lib/format";
import type { ComplaintStatus, StatusCounts } from "@/types";

const config = Object.fromEntries(
  (Object.keys(STATUS_META) as ComplaintStatus[]).map((status) => [
    status,
    { label: STATUS_META[status].label, color: STATUS_CHART_COLORS[status] },
  ])
) satisfies ChartConfig;

export default function StatusDonut({ counts, centerLabel = "reports" }: { counts: StatusCounts; centerLabel?: string }) {
  const data = (Object.keys(counts) as ComplaintStatus[])
    .filter((status) => counts[status] > 0)
    .map((status) => ({ status, label: STATUS_META[status].label, value: counts[status], fill: STATUS_CHART_COLORS[status] }));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
      <ChartContainer config={config} className="mx-auto aspect-auto h-[220px] w-full max-w-[220px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="status" hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="status" innerRadius={64} outerRadius={100} strokeWidth={3} paddingAngle={1}>
            {data.map((item) => (
              <Cell key={item.status} fill={item.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) {
                  return null;
                }

                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                      {formatNumber(total)}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                      {centerLabel}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="grid gap-2 text-sm">
        {data.map((item) => (
          <li key={item.status} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} aria-hidden />
              {item.label}
            </span>
            <span className="font-medium tabular-nums">{formatNumber(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
