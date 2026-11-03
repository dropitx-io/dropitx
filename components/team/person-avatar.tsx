import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { initials, personHue } from "./team-format";

interface PersonAvatarProps {
  /** Stable identity the tint is derived from: a user id or an email. */
  id: string;
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  /** An invite that has not been accepted: a dashed outline instead of a tint. */
  pending?: boolean;
}

const SIZES = { sm: "size-[22px] text-[10px]", md: "size-7 text-xs", lg: "size-16 text-2xl" };

/** A person's initials on a pale tint of their own hue; the hue is identity, not data. */
export function PersonAvatar({ id, name, imageUrl, size = "md", pending }: PersonAvatarProps) {
  const box = cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold", SIZES[size]);
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- provider avatars come from arbitrary hosts
    return <img src={imageUrl} alt="" referrerPolicy="no-referrer" className={cn(box, "object-cover")} />;
  }
  if (pending) {
    return (
      <span aria-hidden="true" className={cn(box, "border border-dashed border-input text-muted-foreground")}>
        {initials(name)}
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ "--h": personHue(id) } as CSSProperties}
      className={cn(
        box,
        "bg-[hsl(var(--h)_32%_89%)] text-[hsl(var(--h)_32%_28%)] dark:bg-[hsl(var(--h)_18%_24%)] dark:text-[hsl(var(--h)_30%_82%)]",
      )}
    >
      {initials(name)}
    </span>
  );
}
