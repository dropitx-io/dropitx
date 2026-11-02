"use client";

import { cn } from "@/lib/utils";
import { getFileIcon, formatFileSize } from "@/lib/file-utils";
import { X } from "lucide-react";

export interface FileTab {
  slug: string;
  filename: string;
  mime_type: string;
  file_size: number | null;
  active?: boolean;
}

interface FileTabsProps {
  files: FileTab[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  onClose?: (slug: string) => void;
  className?: string;
}

export function FileTabs({ files, activeSlug, onSelect, onClose, className }: FileTabsProps) {
  if (files.length <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto bg-surface p-1 scrollbar-thin",
        className
      )}
    >
      {files.map((file) => {
        const isActive = file.slug === activeSlug;
        const Icon = getFileIcon(file.filename, file.mime_type);

        return (
          <button
            key={file.slug}
            type="button"
            onClick={() => onSelect(file.slug)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "group flex min-h-10 items-center gap-2 px-3 text-[15px] whitespace-nowrap transition-colors",
              isActive
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:bg-active hover:text-foreground"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="max-w-[160px] truncate">{file.filename}</span>
            {file.file_size != null && (
              <span className="text-[13px] text-muted-foreground">{formatFileSize(file.file_size)}</span>
            )}
            {onClose && files.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(file.slug);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onClose(file.slug);
                  }
                }}
                className={cn(
                  "ml-1 p-0.5 transition-colors hover:bg-destructive/10 hover:text-destructive",
                  isActive ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                )}
              >
                <X className="size-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
