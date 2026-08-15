import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/server";
import { getSessionUser } from "@/lib/firebase/server";
import Link from "next/link";
import { Users, Plus, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeamRole } from "@/types/team";

interface TeamWithRole {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  plan: string;
  created_at: string;
  role: TeamRole;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TeamsPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("team_members")
    .select("role, teams(id, name, slug, created_by, plan, created_at)")
    .eq("user_id", user.uid);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teams: TeamWithRole[] = ((memberships ?? []) as any[]).map((m) => {
    const t = Array.isArray(m.teams) ? m.teams[0] : m.teams;
    return {
      id: t?.id ?? "",
      name: t?.name ?? "",
      slug: t?.slug ?? "",
      created_by: t?.created_by ?? "",
      plan: t?.plan ?? "free",
      created_at: t?.created_at ?? "",
      role: m.role as TeamRole,
    };
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Teams</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Collaborate with others on shared drops.
          </p>
        </div>
        <Link
          href="/dashboard/teams/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="size-3.5" />
          Create Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card py-16 text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-lg border border-border">
            <Users className="size-5 text-muted-foreground" />
          </span>
          <p className="font-semibold">No teams yet</p>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Create a team to collaborate with others on shared drops.
          </p>
          <Link href="/dashboard/teams/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="size-3.5" />
            Create Team
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/dashboard/teams/${team.slug}`}
              className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <div className="flex items-center gap-2.5">
                <Users className="size-5 shrink-0 text-primary" />
                <p className="flex-1 truncate font-medium">{team.name}</p>
                <span className="rounded border border-border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {team.role}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Created {formatDate(team.created_at)}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 font-semibold uppercase">
                  {team.plan}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

