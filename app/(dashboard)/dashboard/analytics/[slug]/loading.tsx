import { Bar, KpiSkeleton, TitleSkeleton } from "@/components/analytics/loading-blocks";

export default function ShareAnalyticsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading link analytics">
      <TitleSkeleton />
      <KpiSkeleton />
      <div className="mb-10 grid gap-3">
        <Bar w={120} h={16} />
        <span className="block h-[180px] rounded-lg bg-raised sm:h-[220px]" />
      </div>
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-0.5">
            <Bar w={100} h={16} />
            {[160, 130, 110, 90, 70].map((w) => (
              <div key={w} className="flex min-h-11 items-center justify-between px-3">
                <Bar w={w} />
                <Bar w={28} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
