export interface DailyPoint {
  date: string;
  views: number;
  unique_views?: number;
}

const DAY_MS = 86_400_000;

/** Round, evenly spaced ticks from zero that cover `max`: 2 to 5 steps of 1, 2 or 5 times a power of ten, never below 1. */
export function niceTicks(max: number): number[] {
  if (max <= 2) return [0, 1, 2];
  const raw = max / 4;
  const power = 10 ** Math.max(0, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power;
  const count = Math.ceil(max / step);
  return Array.from({ length: count + 1 }, (_, i) => i * step);
}

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const msOf = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`);

/**
 * One point per UTC day, zero where the API left a day out. The span is the `days`-long window ending on
 * `today`, widened to take in any point the API returned outside it, so no view is ever dropped.
 */
export function fillDaily<T extends DailyPoint>(points: T[], days: number, today: string): DailyPoint[] {
  const byDate = new Map(points.map((p) => [p.date.slice(0, 10), p]));
  const times = points.map((p) => msOf(p.date));
  const end = Math.max(msOf(today), ...times);
  const start = Math.min(msOf(today) - (days - 1) * DAY_MS, ...times);
  const out: DailyPoint[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    const point = byDate.get(dayOf(t));
    out.push({ date: dayOf(t), views: point?.views ?? 0, unique_views: point?.unique_views ?? 0 });
  }
  return out;
}

/** The day with the most views (the earliest on a tie), or null when no day had any. */
export function busiestDay<T extends DailyPoint>(points: T[]): T | null {
  let best: T | null = null;
  for (const p of points) if (p.views > 0 && (!best || p.views > best.views)) best = p;
  return best;
}
