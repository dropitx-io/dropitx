export const AnalyticsEvent = {
  DOCUMENT_UPLOADED: "document_uploaded",
  CONTENT_PUBLISHED: "content_published",
  SHARE_VIEWED: "share_viewed",
  EMBED_VIEWED: "embed_viewed",
  ANALYTICS_VIEWED: "analytics_viewed",
} as const;

type EventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Product-event hook kept so call sites stay stable. No third-party analytics
 * sink is wired up; share page views are recorded by the API itself.
 */
export function trackEvent(
  name: EventName,
  props?: Record<string, string | number | boolean>,
): void {
  void name;
  void props;
}
