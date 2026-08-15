import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionCookie,
  assertSameOrigin,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from "@/lib/firebase/server";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  let idToken: string | undefined;
  try {
    const body = await req.json();
    idToken = body?.idToken;
  } catch {
    /* malformed body handled below */
  }
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const cookie = await createSessionCookie(idToken);
    const store = await cookies();
    store.set(SESSION_COOKIE, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    });
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
