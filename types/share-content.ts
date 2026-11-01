/** How `/api/shares/{slug}/content` encodes its `content` field. */
export type ShareContentEncoding = "utf8" | "base64";

export interface ShareFilePayload {
  content: string;
  encoding: ShareContentEncoding;
}
