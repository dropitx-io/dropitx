"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDay, formatInt } from "./analytics-format";
import { niceTicks, type DailyPoint } from "./chart-data";

const TICK = { fontSize: 12, fill: "var(--muted-foreground)" };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DailyPoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-sheet px-2.5 py-1.5 text-xs text-card-foreground">
      <p className="text-muted-foreground">{formatDay(point.date)}</p>
      <p className="tabular-nums">
        {formatInt(point.views)} {point.views === 1 ? "view" : "views"}
      </p>
    </div>
  );
}

/** Views per day: one olive series, straight 2px segments, a dot only on hover, round ticks from zero. */
export function AnalyticsViewChart({ data }: { data: DailyPoint[] }) {
  const ticks = niceTicks(Math.max(0, ...data.map((d) => d.views)));

  return (
    <div className="h-[180px] w-full sm:h-[220px]" role="img" aria-label={`Views per day, ${formatDay(data[0].date)} to ${formatDay(data[data.length - 1].date)}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDay}
            axisLine={false}
            tickLine={false}
            tick={TICK}
            interval="preserveStartEnd"
            minTickGap={24}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={TICK}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            allowDecimals={false}
            width={40}
            tickFormatter={formatInt}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--grid)" }} isAnimationActive={false} />
          <Line
            type="linear"
            dataKey="views"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "var(--chart-1)", stroke: "none" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
