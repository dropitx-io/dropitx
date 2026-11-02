"use client";

import { cn } from "@/lib/utils";
import { notice } from "@/app/(content)/_ui/public-styles";

interface BurnWarningBannerProps {
  className?: string;
}

export function BurnWarningBanner({ className = "" }: BurnWarningBannerProps) {
  return (
    <div role="note" className={cn(notice.warning, "grid gap-1 text-[17px] leading-[1.6]", className)}>
      <p className="font-medium">Burn after reading</p>
      <p>
        This page is deleted for good once you open it. Save anything you need first; it cannot be recovered.
      </p>
    </div>
  );
}
