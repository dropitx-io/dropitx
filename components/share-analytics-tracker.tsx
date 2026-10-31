"use client";

import { useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/api-client";

interface ShareAnalyticsTrackerProps {
  slug: string;
}

/**
 * Records one page view with the API. Sends only the slug, the client's referrer
 * and whether the page is framed; the API derives visitor, country and referrer
 * source itself. Does not change view_count: the content read does.
 */
export function ShareAnalyticsTracker({ slug }: ShareAnalyticsTrackerProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    fetch(getApiUrl("/api/analytics/track"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        referrer: document.referrer || null,
        is_embed: window.parent !== window,
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never break UX
    });
  }, [slug]);

  return null;
}
