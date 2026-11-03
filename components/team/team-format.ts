/** A stable hue for a person, from their id or email: identity, not data. */
export function personHue(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % 360;
}

/** Up to two initials from a name; an email or single word gives one. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The keys that belong on a team's settings: the caller's personal keys and this team's keys. */
export function keysForTeam<T extends { team_id?: string | null }>(keys: T[], teamId: string): T[] {
  return keys.filter((k) => !k.team_id || k.team_id === teamId);
}
