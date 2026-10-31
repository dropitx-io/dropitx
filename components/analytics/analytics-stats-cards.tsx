"use client";

import { Eye, Users, Calendar, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import type { ShareAnalytics } from "@/types/analytics";

interface AnalyticsStatsCardsProps {
  analytics: ShareAnalytics;
  days: number;
}

export function AnalyticsStatsCards({ analytics, days }: AnalyticsStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-4">
      <StatCard icon={Eye} value={analytics.total_views.toLocaleString()} label={`Views (last ${days} days)`} />
      <StatCard icon={Users} value={analytics.unique_views.toLocaleString()} label={`Unique Visitors (last ${days} days)`} />
      <StatCard icon={Calendar} value={analytics.views_today.toLocaleString()} label="Views Today (UTC)" />
      <StatCard icon={TrendingUp} value={analytics.avg_daily_views.toLocaleString()} label={`Avg Daily (last ${days} days)`} />
    </div>
  );
}
