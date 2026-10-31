/**
 * Path as it may appear in an error message or log line: no query string or
 * fragment, and the invite token segment replaced, because an invite token is a
 * credential and must not reach server logs.
 */
export function redactApiPath(path: string): string {
  return path
    .split(/[?#]/, 1)[0]
    .replace(/(\/?api\/invites\/)[^/]+/, "$1:token");
}
