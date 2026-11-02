import { Bar, KpiSkeleton, TitleSkeleton } from "@/components/analytics/loading-blocks";

export default function AnalyticsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading analytics">
      <TitleSkeleton />
      <KpiSkeleton />
      <div className="max-w-3xl">
        <Bar w={120} h={16} />
        <div className="mt-6 grid gap-0.5">
          {[180, 150, 130, 110, 90].map((w) => (
            <div key={w} className="flex min-h-11 items-center justify-between px-3">
              <Bar w={w} />
              <Bar w={28} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
