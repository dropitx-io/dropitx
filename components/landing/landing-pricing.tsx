import Link from "next/link";
import { reveal } from "@/components/landing/reveal";
import { SIGN_UP_HREF } from "@/components/site/site-links";
import { cn } from "@/lib/utils";

const PLANS = [
  { name: "Free", price: "$0", per: "forever", features: ["10 active links", "1 GB of storage", "Basic view counts"], cta: "Start free", featured: false },
  { name: "Pro", price: "$9", per: "a month", features: ["Unlimited links", "5 GB of storage", "Full analytics with referrers", "Passwords, expiry and burn after reading"], cta: "Start Pro", featured: true },
  { name: "Team", price: "$29", per: "a month", features: ["Everything in Pro", "Shared team spaces", "Roles and invites"], cta: "Start Team", featured: false },
];

/**
 * The design's Pricing section. Rendered only when the pricing switch is on
 * (NEXT_PUBLIC_SHOW_PRICING, see lib/feature-flags.ts); off by default.
 */
export function LandingPricing() {
  return (
    <section className="sec tone-warm" id="pricing" aria-labelledby="pricing-title" data-testid="landing-pricing">
      <div className="wrap">
        <div className="section-head" data-reveal>
          <h2 className="h-section" id="pricing-title">Pricing</h2>
          <p className="lead">Start free. Upgrade when you need more links, more storage or the full picture of who is reading.</p>
        </div>
        <div className="plans">
          {PLANS.map((plan, i) => (
            <article key={plan.name} className={cn("card plan", plan.featured && "card-featured")} data-reveal style={reveal(i)}>
              <h3 className="h-title">{plan.name}</h3>
              <p className="plan-price"><span className="stat">{plan.price}</span><span>{plan.per}</span></p>
              <ul>{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <Link className={cn("btn btn-block", plan.featured ? "btn-dark" : "btn-primary")} href={SIGN_UP_HREF}>
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
