"use client";

import { cn } from "@/lib/utils";

interface UploadProgressProps {
  percentage: number;
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
  fileName?: string;
  className?: string;
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
}

function formatEta(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function UploadProgress({
  percentage,
  speed,
  eta,
  fileName,
  className,
}: UploadProgressProps) {
  const isComplete = percentage >= 100;

  return (
    <div className={cn("space-y-2", className)}>
      {fileName && (
        <p className="text-sm font-medium truncate">{fileName}</p>
      )}

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[color,background-color,border-color,opacity,transform] duration-500 ease-out",
            isComplete
              ? "bg-success"
              : "bg-primary"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {/* Animated shimmer effect while uploading */}
        {!isComplete && percentage > 0 && (
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">{Math.round(percentage)}%</span>
        <div className="flex items-center gap-3">
          {speed !== undefined && speed > 0 && (
            <span className="tabular-nums">{formatSpeed(speed)}</span>
          )}
          {eta !== undefined && eta > 0 && !isComplete && (
            <span className="tabular-nums">{formatEta(eta)} remaining</span>
          )}
          {isComplete && (
            <span className="text-success font-medium">Complete</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook-style upload helper using XMLHttpRequest for progress tracking.
 */
export function createProgressTracker(
  onProgress: (percentage: number, speed: number, eta: number) => void
) {
  let startTime = 0;
  let lastLoaded = 0;
  let lastTime = 0;

  return {
    onStart() {
      startTime = Date.now();
      lastLoaded = 0;
      lastTime = startTime;
    },
    onProgressEvent(loaded: number, total: number) {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const recentElapsed = (now - lastTime) / 1000;

      const percentage = total > 0 ? (loaded / total) * 100 : 0;

      // Smooth speed calculation using recent window
      const recentBytes = loaded - lastLoaded;
      const speed = recentElapsed > 0 ? recentBytes / recentElapsed : 0;
      const remaining = total - loaded;
      const eta = speed > 0 ? remaining / speed : 0;

      lastLoaded = loaded;
      lastTime = now;

      onProgress(percentage, speed, eta);
    },
  };
}
