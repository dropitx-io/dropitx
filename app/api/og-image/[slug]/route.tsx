import { ImageResponse } from "@vercel/og";
import { NextRequest, NextResponse } from "next/server";
import type { components } from "@/lib/api-types";
import { forwardHeaders } from "@/lib/api-forward-headers";

export const runtime = "edge";

type ShareMeta = components["schemas"]["ShareMeta"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  if (!apiUrl) {
    return new NextResponse("API URL is not configured", { status: 500 });
  }

  // Metadata only: this route is hit by link unfurlers and must never read content.
  const res = await fetch(`${apiUrl}/api/shares/${encodeURIComponent(slug)}`, {
    headers: forwardHeaders(request.headers.get("cf-connecting-ip"), null),
    cache: "no-store",
  });

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
          justifyContent: "center",
          padding: "60px",
          backgroundColor: "#f7eee6",
          color: "#2b211c",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 40,
            fontSize: 20,
            color: "#766860",
          }}
        >
          <span>{share.view_count} views</span>
          <span style={{ color: "#9a5b3c" }}>DropItX</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
