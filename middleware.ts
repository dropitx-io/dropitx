import { NextResponse, type NextRequest } from "next/server";

const securityHeaders: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-xss-protection": "1; mode=block",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const SESSION_COOKIE = "session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Gate protected routes on session-cookie presence. This is a cheap check —
  // full verification happens via verifySessionCookie in server components.
  if (pathname.startsWith("/dashboard") && !request.cookies.get(SESSION_COOKIE)?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "strict-transport-security",
      "max-age=31536000; includeSubDomains",
    );
  }
  return response;
}

export const config = {
  matcher: [
    // Skip static assets and OG image generation
    "/((?!_next/static|_next/image|favicon.ico|api/og-image).*)",
  ],
};
