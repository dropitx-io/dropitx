import { PublicNav } from "@/app/(content)/_ui/public-nav";

/** The page title on every auth screen (sized by `.auth-form h1` in site.css). */
export const authTitle = "rise";

/**
 * The frame shared by sign in, reset password and update password (the
 * design's login.html): the nav, the form column on the left and a rendered
 * document on the right, which drops below the form under 900px.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <PublicNav withAuth={false} skipTo="#main" />
      <main id="main" className="wrap auth">
        <div className="auth-form">{children}</div>
        <SharedDocument />
      </main>
    </div>
  );
}

/** One rendered document: what a DropItX link opens to. Illustration only. */
function SharedDocument() {
  return (
    <figure className="card-featured auth-doc rise" style={{ "--i": 3 } as React.CSSProperties}>
      <div className="paper">
        <div className="urlbar">
          <span className="url">dropitx.site/s/<b>q3-incident-review</b></span>
          <span className="badge">1,284 views</span>
        </div>
        <div className="doc">
          <p className="doc-h1">Q3 incident review</p>
          <p className="doc-meta">q3-incident-review.md, shared by the payments team</p>
          <p>
            On 14 August, checkout failed for 38 minutes after the certificate on our payments proxy expired at 09:12.
            Customers saw a generic error; no card was charged twice.
          </p>
          <p className="doc-h2">Timeline</p>
          <ul>
            <li>09:12, the certificate expires and the error rate climbs to 31%.</li>
            <li>09:19, the on-call engineer is paged by the checkout alert.</li>
            <li>09:41, a renewed certificate is deployed by hand.</li>
            <li>09:50, the error rate is back under 0.2%.</li>
          </ul>
          <p className="doc-h2">What we changed</p>
          <ul>
            <li>Certificates now renew 30 days early, and a failed renewal pages the team.</li>
            <li>The proxy has a health check on every deploy.</li>
          </ul>
          <blockquote>Nobody did anything wrong here. The renewal job had been failing quietly since June.</blockquote>
        </div>
      </div>
      <figcaption className="sr-only">A document shared with DropItX.</figcaption>
    </figure>
  );
}
