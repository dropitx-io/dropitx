"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import type { ViewTimeSeriesPoint } from "@/types/analytics";

const CHART_COLORS = {
  primary: 'oklch(0.655 0.222 47)',
  emerald: 'oklch(0.55 0.17 160)',
  blue: 'oklch(0.60 0.15 200)',
  amber: 'oklch(0.705 0.162 60)',
  zinc: 'oklch(0.55 0.02 47)',
};

const CHART_COLORS_DARK = {
  primary: 'oklch(0.72 0.18 47)',
  emerald: 'oklch(0.7 0.17 160)',
  blue: 'oklch(0.65 0.15 200)',
  amber: 'oklch(0.82 0.14 80)',
  zinc: 'oklch(0.65 0.02 47)',
};

interface AnalyticsViewChartProps {
  data: ViewTimeSeriesPoint[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover p-3 text-sm">
      <p className="font-medium mb-1">{label ? formatDateLabel(label) : ""}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name === "views" ? "Total" : "Unique"}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function AnalyticsViewChart({ data }: AnalyticsViewChartProps) {
  const isDark = useTheme().theme === "dark";
  const colors = isDark ? CHART_COLORS_DARK : CHART_COLORS;

  // Show every 3rd label to avoid overlap
  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            interval={tickInterval}
            className="text-muted-foreground text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis className="text-muted-foreground text-xs" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="views"
            stroke={colors.primary}
            fill={colors.primary}
            fillOpacity={0.1}
            name="views"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="unique_views"
            stroke={colors.zinc}
            fill="none"
            name="unique_views"
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
