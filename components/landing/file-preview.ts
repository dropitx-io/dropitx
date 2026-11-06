/**
 * Turning a local file into studio text, in the browser. Nothing is uploaded:
 * the file is read with the File API and shown in the preview only.
 */

export const MAX_FILE_BYTES = 50 * 1048576;
export const ACCEPT = ".md,.markdown,.html,.htm,.txt,text/markdown,text/html,text/plain";

export type FileKind = "markdown" | "html" | "other";

export function fileKind(name: string): FileKind {
  if (/\.(md|markdown|txt)$/i.test(name)) return "markdown";
  if (/\.html?$/i.test(name)) return "html";
  return "other";
}

/** A readable outline of an HTML file as Markdown: title, headings, paragraphs and list items. */
export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const lines: string[] = [];
  const title = doc.querySelector("h1") ?? doc.querySelector("title");
  if (title?.textContent?.trim()) lines.push(`# ${title.textContent.trim()}`, "");
  doc.querySelectorAll("h2, h3, p, li").forEach((node) => {
    const text = (node.textContent ?? "").trim().replace(/\s+/g, " ");
    if (!text) return;
    if (node.tagName === "LI") lines.push(`- ${text}`);
    else if (node.tagName === "P") lines.push(text, "");
    else lines.push(`## ${text}`, "");
  });
  return lines.join("\n");
}

export type FileResult =
  | { ok: true; text: string; kind: "markdown" | "html" }
  | { ok: false; message: string };

/** Reads a dropped or picked file for the preview, or explains why it will not render as a page. */
export async function readFileForPreview(file: File, formatSize: (n: number) => string): Promise<FileResult> {
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: `${file.name} is ${formatSize(file.size)}; the limit is 50 MB per file.` };
  }
  const kind = fileKind(file.name);
  if (kind === "other") {
    return {
      ok: false,
      message: `${file.name} would be shared as a file to download. Only Markdown and HTML render as pages.`,
    };
  }
  try {
    const raw = await file.text();
    return { ok: true, kind, text: kind === "html" ? htmlToMarkdown(raw) : raw };
  } catch (err: unknown) {
    console.error("Reading the file for the preview failed", err);
    return { ok: false, message: `${file.name} could not be read. Try another file.` };
  }
}
