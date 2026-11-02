import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { displayS, grid, gutter, page } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";

/** The page title on every auth screen: two lines at most at any width. */
export const authTitle = cn(displayS, "max-w-[6.5em]");

/** Label above a field: body size, medium weight. */
export const fieldLabel = "text-[clamp(18px,1.05rem+0.3vw,21px)] font-medium";

/**
 * The frame shared by sign in, reset password and update password: the nav,
 * the form in the left five columns, and a shared document on the right.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={page}>
      <PublicNav withAuth={false} />
      <main
        id="main"
        className={cn(gutter, grid, "flex-1 items-start pb-[clamp(56px,7vw,112px)] pt-[clamp(32px,5vw,72px)]")}
      >
        <div className="col-span-full grid gap-7 min-[861px]:col-span-5">{children}</div>
        <SharedDocument />
      </main>
    </div>
  );
}

/** One large rendered document: what a DropItX link opens to. */
function SharedDocument() {
  return (
    <figure
      data-ui
      aria-label="A document shared with DropItX"
      className="col-span-full mt-14 max-h-[520px] self-start overflow-hidden bg-card text-[15px] leading-[1.5] min-[861px]:col-span-6 min-[861px]:col-start-7 min-[861px]:mt-0 min-[861px]:max-h-[760px]"
    >
      <div className="flex items-center justify-between gap-3 bg-surface px-4 py-3 text-[13px]">
        <span className="truncate">dropitx.site/s/q3-incident-review</span>
        <span className="shrink-0">1,284 views</span>
      </div>
      <div className="px-[clamp(24px,4vw,56px)] py-10 text-[17px] leading-[1.6]">
        <p className="mb-3 text-[clamp(30px,2.8vw,40px)] leading-[1.1] tracking-[-0.02em]">Q3 incident review</p>
        <p className="mb-3.5 text-[13px] text-muted-foreground">q3-incident-review.md, shared by the payments team</p>
        <p className="mb-2.5">
          On 14 August, checkout failed for 38 minutes after the certificate on our payments proxy expired at 09:12.
          Customers saw a generic error; no card was charged twice.
        </p>
        <p className="mb-2 mt-5 text-[21px] font-medium leading-[1.25]">Timeline</p>
        <ul className="mb-3 list-disc pl-5">
          <li>09:12, the certificate expires and the error rate climbs to 31%.</li>
          <li>09:19, the on-call engineer is paged by the checkout alert.</li>
          <li>09:41, a renewed certificate is deployed by hand.</li>
          <li>09:50, the error rate is back under 0.2%.</li>
        </ul>
        <p className="mb-2 mt-5 text-[21px] font-medium leading-[1.25]">What we changed</p>
        <ul className="mb-3 list-disc pl-5">
          <li>Certificates now renew 30 days early, and a failed renewal pages the team.</li>
          <li>The proxy has a health check on every deploy.</li>
        </ul>
        <blockquote className="bg-surface px-3.5 py-2">
          Nobody did anything wrong here. The renewal job had been failing quietly since June.
        </blockquote>
      </div>
    </figure>
  );
}
