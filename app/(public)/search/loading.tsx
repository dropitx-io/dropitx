import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { displayS, gutter, page } from "@/app/(content)/_ui/public-styles";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SearchLoading() {
  return (
    <div className={page}>
      <PublicNav current="/search" />
      <main id="main" className={cn(gutter, "flex-1 pb-[clamp(56px,7vw,112px)] pt-[clamp(32px,5vw,72px)]")}>
        <h1 className={cn(displayS, "max-w-[8em]")}>Search shared pages</h1>
        <Skeleton className="mt-[clamp(32px,4vw,56px)] h-[56px] w-full max-w-[40em] rounded-none" />
        <div role="status" aria-label="Loading results" className="mt-[clamp(40px,5vw,72px)] grid max-w-[46em] gap-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid gap-3">
              <Skeleton className="h-8 w-1/2 rounded-none" />
              <Skeleton className="h-5 w-full rounded-none" />
              <Skeleton className="h-4 w-1/3 rounded-none" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
