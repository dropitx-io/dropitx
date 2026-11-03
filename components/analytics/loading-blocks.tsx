/** Flat grey placeholders at the final layout's size; no pulse. */
export function Bar({ w, h = 12 }: { w: number | string; h?: number }) {
  return <span className="inline-block max-w-full rounded-sm bg-raised align-middle" style={{ width: w, height: h }} />;
}

export function TitleSkeleton() {
  return (
    <div className="mb-5 grid gap-2">
      <Bar w={160} h={30} />
      <Bar w={360} h={14} />
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4">
      {[96, 72, 72, 72].map((w, i) => (
        <div key={i} className="grid gap-1.5">
          <Bar w={88} h={14} />
          <Bar w={w} h={28} />
          <Bar w={80} />
        </div>
      ))}
    </div>
  );
}
