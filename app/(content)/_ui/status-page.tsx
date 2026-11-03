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
      <main id="main" className={cn(gutter, "flex-1 pb-[clamp(56px,7vw,112px)] pt-[clamp(40px,6vw,88px)]")}>
        <div className="stagger-in grid max-w-[34em] gap-6">
          <h1 className={cn(displayS, "max-w-[7em]")}>{title}</h1>
          <p className={body}>{message}</p>
          <div className="mt-2">{action}</div>
        </div>
      </main>
    </div>
  );
}
