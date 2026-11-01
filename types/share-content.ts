/** How `/api/shares/{slug}/content` encodes its `content` field. */
export type ShareContentEncoding = "utf8" | "base64";

/** The decoded-but-still-encoded content payload used by share renderers. */
export interface ShareFileContent {
  content: string;
  encoding: ShareContentEncoding;
}
