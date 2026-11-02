import Link from "next/link";
import { CreateTeamForm } from "@/components/create-team-form";
import { TitleRow } from "@/components/analytics/title-row";

export default function NewTeamPage() {
  return (
    <>
      <TitleRow
        crumb={
          <>
            <Link href="/dashboard/teams" className="hover:text-card-foreground hover:underline hover:underline-offset-[3px]">
              Teams
            </Link>
            <span aria-hidden="true">/</span>
            <span>New</span>
          </>
        }
        title="Create team"
        finding="You become its owner. Invite people once it exists."
      />
      <CreateTeamForm />
    </>
  );
}
