import Link from "next/link";
import { SIGN_UP_HREF } from "@/components/site/site-links";

/** The closing band: "Upload a file, or write one", with the same two actions as the hero. */
export function LandingClosing() {
  return (
    <section className="sec tone-warm closing" id="start" aria-labelledby="start-title">
      <div className="wrap" data-reveal>
        <h2 className="h-section" id="start-title">Upload a file, or write one</h2>
        <p className="lead">Either way you get a page and a short link, and you can change its options or delete it whenever you like.</p>
        <div className="hero-actions">
          <Link className="btn btn-dark btn-lg" href={SIGN_UP_HREF} data-upload data-testid="landing-closing-upload">
            Upload a file <span className="arrow" aria-hidden="true">&rarr;</span>
          </Link>
          <Link className="btn btn-primary btn-lg" href="/editor" data-testid="landing-closing-editor">
            Open the editor
          </Link>
        </div>
      </div>
    </section>
  );
}
