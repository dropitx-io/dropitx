import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import type { components } from "@/lib/api-types";
import { forwardHeaders } from "@/lib/api-forward-headers";
import { OG_PALETTE, OG_SIZE } from "@/lib/og-palette";

export const runtime = "edge";

type ShareMeta = components["schemas"]["ShareMeta"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Same rule as serverApiBaseUrl (lib/server-api.ts, which cannot be imported on the edge runtime).
  const apiUrl = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL)?.trim().replace(/\/+$/, "");
  if (!apiUrl) {
    return new NextResponse("API URL is not configured", { status: 500 });
  }

  // Metadata only: this route is hit by link unfurlers and must never read content.
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/shares/${encodeURIComponent(slug)}`, {
      headers: forwardHeaders(request.headers.get("cf-connecting-ip"), null),
      cache: "no-store",
    });
  } catch (err: unknown) {
    console.error("OG image: the share metadata request failed", err);
    return new NextResponse("Upstream unavailable", { status: 502 });
  }

  // Missing, private, expired and rate-limited all look the same to a crawler.
  if (!res.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const share = (await res.json()) as ShareMeta;

  // Don't expose metadata for password-protected shares
  if (share.has_password) {
    return new NextResponse("Not found", { status: 404 });
  }

  const title = (share.title ?? share.filename ?? share.slug).slice(0, 80);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: OG_PALETTE.background,
          color: OG_PALETTE.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, letterSpacing: "-0.04em" }}>
          <div style={{ display: "flex", position: "relative", width: 34, height: 34, borderRadius: 8, backgroundColor: OG_PALETTE.ink }}>
            <div style={{ position: "absolute", left: 9, right: 9, bottom: 9, height: 5, borderRadius: 3, backgroundColor: OG_PALETTE.accent }} />
          </div>
          DropItX
        </div>
        <div style={{ display: "flex", fontSize: 60, lineHeight: 1.12, letterSpacing: "-0.03em" }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: OG_PALETTE.muted }}>
          <span>{share.view_count} views</span>
          <span>Shared with DropItX</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
