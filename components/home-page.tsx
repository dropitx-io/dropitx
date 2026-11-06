import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { LandingFooter } from "@/components/landing-footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { LandingCli } from "@/components/landing/landing-cli";
import { LandingClosing } from "@/components/landing/landing-closing";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHow } from "@/components/landing/landing-how";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingProtect } from "@/components/landing/landing-protect";
import { LandingWays } from "@/components/landing/landing-ways";
import { showPricing } from "@/lib/feature-flags";
import { SITE_URL } from "@/lib/site-url";

/**
 * The landing page, in the design's order and alternating tones: hero with the
 * live studio, four ways in, how it works, protection, developers, pricing
 * (only when the pricing switch is on), questions and the closing band.
 */
export function HomePage() {
  const host = new URL(SITE_URL).host;
  return (
    <div className="site landing">
      <PublicNav current="/" />
      <main id="main">
        <LandingHero host={host} />
        <LandingWays host={host} />
        <LandingHow host={host} />
        <LandingProtect host={host} />
        <LandingCli host={host} />
        {showPricing() && <LandingPricing />}
        <LandingFaq />
        <LandingClosing />
      </main>
      <LandingFooter />
      <RevealOnScroll />
    </div>
  );
}
