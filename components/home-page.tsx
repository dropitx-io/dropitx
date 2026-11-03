import { LandingFooter } from "@/components/landing-footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { stageFragments } from "@/components/landing/how-stages";
import { LandingAsk } from "@/components/landing/landing-ask";
import { LandingCli } from "@/components/landing/landing-cli";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHow } from "@/components/landing/landing-how";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { SITE_URL } from "@/lib/site-url";
import "@/components/landing/landing.css";

/**
 * The landing page: "the sentence is the layout". The product's own output,
 * a rendered page behind a short link, sits inside the headline and recurs
 * as the interface fragment in every section.
 */
export function HomePage() {
  const host = new URL(SITE_URL).host;
  return (
    <div className="landing landing-home type-page overflow-x-clip bg-background text-(length:--step-body) leading-[1.6] text-foreground">
      <LandingNav />
      <main id="main">
        <LandingHero host={host} />
        <LandingShowcase host={host} />
        <LandingHow fragments={stageFragments(host)} />
        <LandingFeatures />
        <LandingCli host={host} />
        <LandingPricing />
        <LandingFaq />
        <LandingAsk />
      </main>
      <LandingFooter />
      <RevealOnScroll />
    </div>
  );
}
