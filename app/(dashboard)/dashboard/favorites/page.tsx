import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/server";
import { AccountNotProvisionedError, getFavorites } from "@/lib/dashboard-data";
import { AccountSetupState } from "@/components/account-setup-state";
import { LinksTable } from "@/components/links/links-table";
import { formatShortDate, personalLinkRows } from "@/components/links/link-rows";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore);

  if (!user) redirect("/auth/login");

  let shares: Awaited<ReturnType<typeof getFavorites>>;
  try {
    shares = await getFavorites();
  } catch (err) {
    if (err instanceof AccountNotProvisionedError) return <AccountSetupState />;
    throw err;
  }

  // The API lists favorites most recently saved first.
  const lastSaved = shares[0] ? formatShortDate(shares[0].favorited_at) : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-card-foreground max-sm:text-[22px]">Favorites</h1>
      {lastSaved ? (
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {shares.length.toLocaleString("en")} saved {shares.length === 1 ? "link" : "links"}, the last one on {lastSaved}.
        </p>
      ) : (
        <div className="mb-5" />
      )}

      {shares.length === 0 ? (
        <p className="rounded-lg border border-dashed border-input px-3 py-2 text-sm text-muted-foreground">
          No favorites yet. Bookmark a page from its share view to keep it here.
        </p>
      ) : (
        <LinksTable rows={personalLinkRows(shares)} />
      )}
    </div>
  );
}
