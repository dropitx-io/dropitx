import Link from "next/link";
import { body, displayS, landingButton, reveal, textLink } from "@/components/landing/landing-styles";
import { cn } from "@/lib/utils";

/** One plan said as a sentence; the other two follow in plain prose. */
export function LandingPricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="price-title"
      className="mt-(--section-gap) bg-surface px-(--m) py-[clamp(72px,9vw,140px)]"
    >
      <h2 id="price-title" data-reveal className={displayS}>
        Pro is{" "}
        <span className="mx-[0.04em] inline-block bg-primary px-[0.15em] leading-[0.95] text-primary-foreground">$9</span>{" "}
        a month.
      </h2>
      <div className="mt-16 grid grid-cols-12 items-end gap-x-(--gutter) gap-y-7 max-[760px]:mt-8 max-[760px]:grid-cols-4">
        <p data-reveal style={reveal(1)} className={cn(body, "col-span-6 max-[760px]:col-span-full")}>
          Unlimited links, 5 GB of storage, full analytics with referrers, and passwords, expiry and burn after
          reading on every link.
        </p>
        <div
          data-reveal
          style={reveal(2)}
          className="col-span-3 col-start-10 justify-self-end max-[760px]:col-span-full max-[760px]:col-start-1 max-[760px]:justify-self-stretch"
        >
          <Link href="/dashboard" className={cn(landingButton(), "max-[760px]:w-full")}>
            Start Pro
          </Link>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-12 gap-x-(--gutter) gap-y-3 max-[760px]:grid-cols-4">
        <p data-reveal style={reveal(3)} className={cn(body, "col-span-6 max-w-[30em] max-[760px]:col-span-full")}>
          <Link href="/dashboard" className={textLink}>
            Free
          </Link>{" "}
          costs nothing: 10 active links, 1 GB of storage and basic view counts.
        </p>
        <p data-reveal style={reveal(4)} className={cn(body, "col-span-6 max-w-[30em] max-[760px]:col-span-full")}>
          <Link href="/dashboard" className={textLink}>
            Team
          </Link>{" "}
          is $29 a month: everything in Pro, plus shared team spaces with roles and invites.
        </p>
      </div>
    </section>
  );
}
