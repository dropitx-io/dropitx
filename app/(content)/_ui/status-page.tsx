import { LandingFooter } from "@/components/landing-footer";
import { PublicNav } from "./public-nav";
import { body, displayS, gutter, page } from "./public-styles";
import { cn } from "@/lib/utils";

interface StatusPageProps {
  title: string;
  message: string;
  /** The way forward: a link or a button. */
  action: React.ReactNode;
}

/** A full page for a single state (not found, an error, a link that is gone): title, one sentence, one action. */
export function StatusPage({ title, message, action }: StatusPageProps) {
  return (
    <div className={page}>
      <PublicNav />
      <main id="main" className={cn(gutter, "pb-20 pt-12 max-[600px]:pt-8")}>
        <div className="stagger-in grid max-w-[34em] gap-5">
          <h1 className={cn(displayS, "max-w-[12em]")}>{title}</h1>
          <p className={cn(body, "text-fg-2")}>{message}</p>
          <div className="mt-2">{action}</div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
