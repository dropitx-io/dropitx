import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  assertSameOrigin,
  revokeUserSessions,
  verifySessionClaimsForLogout,
  SESSION_COOKIE,
} from "@/lib/firebase/server";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const store = await cookies();
  const uid = await verifySessionClaimsForLogout(store);
  if (uid) {
    await revokeUserSessions(uid);
  }

  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ status: "ok" });
}
