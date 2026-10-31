import "server-only";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE } from "@/lib/firebase/server";
import { forwardHeaders } from "@/lib/api-forward-headers";

export { forwardHeaders };

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown, path?: string) {
    super(`API request failed with status ${status}${path ? ` for ${path}` : ""}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export type ServerApiInit = RequestInit & {
  /** "session" (default) sends the session cookie as a bearer when present; "none" never authenticates. */
  auth?: "session" | "none";
};

function apiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is required for server-side API calls.");
  }
  return url.replace(/\/+$/, "");
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Server-side fetch to the FastAPI backend.
 * Forwards the visitor's `cf-connecting-ip`, and the session cookie as a bearer
 * when one exists. Throws `ApiError` on any non-2xx response.
 */
export async function serverApiFetch<T>(
  path: string,
  init: ServerApiInit = {},
): Promise<T> {
  if (!path.startsWith("/")) {
    throw new Error(`serverApiFetch path must start with "/", got "${path}"`);
  }
  const { auth = "session", headers: initHeaders, cache, ...rest } = init;

  const ip = (await headers()).get("cf-connecting-ip");
  const bearer =
    auth === "session" ? ((await cookies()).get(SESSION_COOKIE)?.value ?? null) : null;

  const merged = new Headers(initHeaders);
  for (const [name, value] of Object.entries(forwardHeaders(ip, bearer))) {
    merged.set(name, value);
  }

  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...rest,
    headers: merged,
    cache: cache ?? "no-store",
  });

  if (!res.ok) throw new ApiError(res.status, await parseBody(res), path);
  if (res.status === 204) return undefined as T;
  return (await parseBody(res)) as T;
}

/** Like `serverApiFetch`, but a 404 resolves to `null`. Every other error is rethrown. */
export async function serverApiFetchOrNull<T>(
  path: string,
  init?: ServerApiInit,
): Promise<T | null> {
  try {
    return await serverApiFetch<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
