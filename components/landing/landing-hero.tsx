import Link from "next/link";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { SIGN_UP_HREF } from "@/components/site/site-links";

/**
 * "Drop a file. Get a link." with the live studio (the product's own
 * rendered page) right under the headline. "Upload a file" opens the file
 * picker once script runs; without script it goes to sign-up.
 */
export function LandingHero({ host }: { host: string }) {
  return (
    <section className="sec hero" aria-labelledby="hero-title">
      <div className="wrap">
        <h1 className="h-hero rise" id="hero-title">Drop a file. Get a link.</h1>
        <p className="lead rise" style={{ "--i": 1 } as React.CSSProperties}>
          DropItX turns a Markdown or HTML file into a rendered page behind a short link, with a password, an expiry
          date or burn after reading when you need one.
        </p>
        <div className="hero-actions rise" style={{ "--i": 2 } as React.CSSProperties}>
          <Link className="btn btn-dark btn-lg" href={SIGN_UP_HREF} data-upload data-testid="landing-hero-upload">
            Upload a file <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
          <Link className="btn btn-primary btn-lg" href="/editor" data-testid="landing-hero-editor">
            Open the editor
          </Link>
        </div>
        <LandingShowcase host={host} />
      </div>
    </section>
  );
}
