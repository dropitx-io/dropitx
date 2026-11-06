import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/firebase/server";
import { EditorShell } from "@/components/editor-shell";
import { DashboardShell } from "@/components/dashboard-shell";
import { Wordmark } from "@/components/brand-mark";
import { loadShellProps } from "@/components/app-shell/load-shell-props";

export const metadata: Metadata = {
  title: "Markdown Editor — DropItX",
  description: "Write and preview markdown with a powerful code editor",
};

// The sheet becomes a fixed-height column: title, the split panes taking what is left, the publish bar.
const EDITOR_SHEET = "flex flex-col overflow-hidden pb-0 md:pb-0 h-[calc(100svh-48px)] md:h-[calc(100svh-56px)]";

export default async function EditorPage() {
  const session = await getSessionUser(await cookies());

  // Signed in: the editor is one of the app's screens, inside the framed shell. The editor itself needs
  // none of the shell's data, so when that data fails to load it still opens, in the plain frame.
  const shell = session
    ? await loadShellProps(session).catch((err: unknown) => {
        console.error("editor: shell data unavailable, opening without the sidebar", err);
        return null;
      })
    : null;
  if (shell) {
    return (
      <DashboardShell
        user={shell.user}
        teams={shell.teams}
        storageUsedBytes={shell.storageUsedBytes}
        sheetClassName={EDITOR_SHEET}
      >
        <EditorShell />
      </DashboardShell>
    );
  }

  // Signed out (or the shell could not load): anyone can write; publishing asks them to sign in.
  return (
    <div className="min-h-svh bg-frame font-sans text-foreground">
      <header className="flex h-12 items-center justify-between px-5 max-md:px-4">
        <Wordmark withMark href="/" className="[&_svg]:text-primary" />
        <a href="/auth/login?next=/editor" className="text-sm font-medium text-foreground underline-offset-3 hover:underline">
          Sign in
        </a>
      </header>
      <main className={`mx-2 mb-2 rounded-2xl border border-border bg-sheet px-6 pt-6 text-card-foreground max-md:mx-0 max-md:mb-0 max-md:rounded-none max-md:border-x-0 max-md:border-b-0 max-md:px-4 max-md:pt-5 ${EDITOR_SHEET}`}>
        <EditorShell />
      </main>
    </div>
  );
}
