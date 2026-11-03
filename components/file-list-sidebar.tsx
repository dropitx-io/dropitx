"use client";

import { cn } from "@/lib/utils";
import { getFileIcon, formatFileSize, getFileTypeLabel } from "@/lib/file-utils";

export interface FileEntry {
  slug: string;
  filename: string;
  mime_type: string;
  file_size: number | null;
  download_count?: number;
  max_downloads?: number | null;
}

interface FileListSidebarProps {
  files: FileEntry[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  className?: string;
}

export function FileListSidebar({ files, activeSlug, onSelect, className }: FileListSidebarProps) {
  if (files.length <= 1) return null;

  return (
    <div className={cn("w-64 shrink-0 overflow-y-auto bg-surface", className)}>
      <div className="p-3">
        <p className="mb-2 px-2 text-[14px] text-muted-foreground">{files.length} files</p>
        <div className="grid gap-1">
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
                  "flex w-full items-start gap-2.5 p-2.5 text-left transition-colors",
                  isActive ? "bg-background" : "hover:bg-active"
                )}
              >
                <Icon
                  className={cn("mt-1 size-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")}
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[15px]", isActive ? "font-medium text-foreground" : "text-foreground/80")}>
                    {file.filename}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {getFileTypeLabel(file.filename, file.mime_type)}
                    {file.file_size != null && <>, {formatFileSize(file.file_size)}</>}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
