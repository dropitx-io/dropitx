import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

/** Per-share summary. Counts cover the requested window except `views_today` and `views_7d`, which have their own windows. */
export type ShareAnalytics = Schemas["ShareAnalytics"];
export type ViewTimeSeriesPoint = Schemas["ViewTimeSeriesPoint"];
export type ReferrerBreakdown = Schemas["ReferrerBreakdown"];
export type GeoBreakdown = Schemas["GeoBreakdown"];
export type AnalyticsShareRef = Schemas["AnalyticsShareRef"];
export type ShareAnalyticsResponse = Schemas["ShareAnalyticsResponse"];

/** A share ranked by its views in the last 30 days. */
export type TopShare = Schemas["TopShare"];
/** Totals over all of the caller's shares: `total_views` is lifetime, `unique_views` and `shares_with_views` are last 30 days. */
export type ShareTotals = Schemas["ShareTotals"];
export type TopSharesResponse = Schemas["TopSharesResponse"];
