import {
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  LucideIcon,
} from "lucide-react";

/**
 * Returns a lucide icon component for the given file name / MIME type.
 */
export function getFileIcon(filename: string, mimeType?: string): LucideIcon {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const mime = mimeType?.toLowerCase() ?? "";

  // Images
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff"].includes(ext) ||
    mime.startsWith("image/")
  ) {
    return FileImage;
  }
  // Video
  if (
    ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv"].includes(ext) ||
    mime.startsWith("video/")
  ) {
    return FileVideo;
  }
  // Audio
  if (
    ["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext) ||
    mime.startsWith("audio/")
  ) {
    return FileAudio;
  }
  // Archives
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(ext) || mime.includes("zip") || mime.includes("compressed")) {
    return FileArchive;
  }
  // Spreadsheets
  if (["xlsx", "xls", "csv", "ods"].includes(ext) || mime.includes("spreadsheet") || mime.includes("csv")) {
    return FileSpreadsheet;
  }
  // Presentations
  if (["pptx", "ppt", "key", "odp"].includes(ext) || mime.includes("presentation")) {
    return Presentation;
  }
  // PDF
  if (ext === "pdf" || mime === "application/pdf") {
    return FileText;
  }
  // Markdown
  if (["md", "markdown"].includes(ext) || mime === "text/markdown") {
    return FileText;
  }
  // HTML
  if (["html", "htm"].includes(ext) || mime === "text/html") {
    return FileCode;
  }
  // Text / code
  if (
    ["txt", "json", "xml", "yaml", "yml", "toml", "ini", "cfg", "conf", "log", "js", "ts", "jsx", "tsx", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp", "sh", "bash", "sql"].includes(ext) ||
    mime.startsWith("text/")
  ) {
    return FileCode;
  }
  // Documents
  if (["docx", "doc", "odt", "rtf"].includes(ext) || mime.includes("word") || mime.includes("document")) {
    return FileText;
  }

  return File;
}

/**
 * Get human-readable file type label
 */
export function getFileTypeLabel(filename: string, mimeType?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const mime = mimeType?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext) || mime.startsWith("image/")) return "Image";
  if (["mp4", "webm", "mov", "avi"].includes(ext) || mime.startsWith("video/")) return "Video";
  if (["mp3", "wav", "flac", "aac"].includes(ext) || mime.startsWith("audio/")) return "Audio";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "Archive";
  if (["xlsx", "xls", "csv"].includes(ext)) return "Spreadsheet";
  if (["pptx", "ppt"].includes(ext)) return "Presentation";
  if (ext === "pdf" || mime === "application/pdf") return "PDF";
  if (["md", "markdown"].includes(ext)) return "Markdown";
  if (["html", "htm"].includes(ext)) return "HTML";
  if (["docx", "doc"].includes(ext)) return "Document";
  if (ext) return ext.toUpperCase();
  return "File";
}

export function getShortFileTypeLabel(filename?: string | null, mimeType?: string | null): string {
  const dot = filename?.lastIndexOf(".") ?? -1;
  const ext = dot > 0 ? filename!.slice(dot + 1).toLowerCase() : "";
  if (ext === "md" || ext === "markdown") return "Markdown";
  if (ext === "html" || ext === "htm") return "HTML";
  if (ext === "txt") return "Text";
  if (ext) return ext.toUpperCase();

  const mime = mimeType?.toLowerCase() ?? "";
  if (!mime || mime === "application/octet-stream") return "File";
  if (mime === "text/markdown") return "Markdown";
  if (mime === "text/html") return "HTML";
  if (mime === "text/plain") return "Text";

  const subtype = mime.split("/")[1]?.split("+")[0];
  return subtype ? subtype.toUpperCase() : "File";
}

/**
 * Get a color class for the file type badge
 */
export function getFileTypeColor(filename: string, mimeType?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const mime = mimeType?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) || mime.startsWith("image/")) return "bg-pink-500/10 text-pink-600 border-pink-500/20";
  if (["mp4", "webm", "mov"].includes(ext) || mime.startsWith("video/")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
  if (["mp3", "wav", "flac"].includes(ext) || mime.startsWith("audio/")) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  if (["zip", "rar", "7z"].includes(ext)) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
  if (ext === "pdf" || mime === "application/pdf") return "bg-red-500/10 text-red-600 border-red-500/20";
  if (["xlsx", "xls", "csv"].includes(ext)) return "bg-success/10 text-success border-success/20";
  return "bg-muted text-muted-foreground";
}

/**
 * Format bytes to human-readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Max file size limits per MIME category
 */
export function getMaxFileSize(mimeType?: string): number {
  const mime = mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("video/") || mime.startsWith("audio/")) return 500 * 1024 * 1024; // 500MB
  if (mime.startsWith("image/")) return 50 * 1024 * 1024; // 50MB
  return 50 * 1024 * 1024; // 50MB default
}

/**
 * Whether the file can be previewed inline
 */
export function canPreview(filename: string, mimeType?: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const mime = mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return true;
  if (ext === "pdf" || mime === "application/pdf") return true;
  return false;
}

/**
 * Whether the file can be rendered as content (text/html/md)
 */
export function isRenderableText(mimeType?: string): boolean {
  const mime = mimeType?.toLowerCase() ?? "";
  return mime === "text/html" || mime === "text/markdown" || mime.startsWith("text/");
}
