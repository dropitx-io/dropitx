import { PublicNav } from "@/app/(content)/_ui/public-nav";
import { body, displayS, gutter, page, small, squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";

type InviteStatusVariant =
  | "not_found"
  | "already_used"
  | "declined"
  | "revoked"
  | "expired"
  | "email_mismatch"
  | "not_logged_in"
  | "invite_info";

interface InviteStatusCardProps {
  variant: InviteStatusVariant;
  message?: string;
  subMessage?: string;
  inviteEmail?: string;
  currentUserEmail?: string;
  loginUrl?: string;
  signupUrl?: string;
  children?: React.ReactNode;
}

const TITLES: Record<InviteStatusVariant, string> = {
  not_found: "Invite not found",
  already_used: "Invite already used",
  declined: "Invite declined",
  revoked: "Invite revoked",
  expired: "Invite expired",
  email_mismatch: "Wrong account",
  not_logged_in: "Join the team",
  invite_info: "Join the team",
};

/** The whole invite page: one titled state, its explanation, and the actions it allows. */
export function InviteStatusCard({
  variant,
  message,
  subMessage,
  inviteEmail,
  currentUserEmail,
  loginUrl,
  signupUrl,
  children,
}: InviteStatusCardProps) {
  return (
    <div className={page}>
      <PublicNav withAuth={false} withLinks={false} />
      <main id="main" className={cn(gutter, "flex-1 pb-[clamp(56px,7vw,112px)] pt-[clamp(40px,6vw,88px)]")}>
        <div className="grid max-w-[34em] gap-5">
          <h1 className={cn(displayS, "max-w-[7em]")}>{TITLES[variant]}</h1>
          {message && <p className={cn(body, "mt-3")}>{message}</p>}
          {inviteEmail ? (
            <p className={cn(body, "text-muted-foreground")}>
              Invite sent to <strong className="font-medium text-foreground">{inviteEmail}</strong>
              {currentUserEmail && (
                <>
                  , signed in as <strong className="font-medium text-foreground">{currentUserEmail}</strong>
                </>
              )}
            </p>
          ) : (
            currentUserEmail && (
              <p className={cn(body, "text-muted-foreground")}>
                Signed in as <strong className="font-medium text-foreground">{currentUserEmail}</strong>
              </p>
            )
          )}
          {subMessage && <p className={cn(small, "text-muted-foreground")}>{subMessage}</p>}
          {loginUrl && !signupUrl && (
            <div className="mt-3">
              <a href={loginUrl} className={squareButton()}>
                Sign in to accept
              </a>
            </div>
          )}
          {loginUrl && signupUrl && (
            <div className="mt-3 flex flex-wrap gap-3">
              <a href={loginUrl} className={squareButton()}>
                Sign in to accept
              </a>
              <a href={signupUrl} className={squareButton("quiet")}>
                Create an account
              </a>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
