"use client";

import { useSyncExternalStore } from "react";
import { InviteNotificationBell } from "@/components/invite-notification-bell";

/** Matches the shell's md breakpoint, where the desktop top bar replaces the phone bar. */
const DESKTOP = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const isDesktop = () => window.matchMedia(DESKTOP).matches;
// The bell needs the signed-in browser user anyway, so nothing renders on the server.
const onServer = () => null;

/**
 * The shell has a desktop and a phone top bar, one hidden by CSS. Mounting the bell in only the
 * visible one keeps the invitations from being fetched (and re-fetched on focus) twice.
 */
export function InviteBellSlot({ viewport }: { viewport: "desktop" | "phone" }) {
  const desktop = useSyncExternalStore<boolean | null>(subscribe, isDesktop, onServer);
  if (desktop === null || desktop !== (viewport === "desktop")) return null;
  return <InviteNotificationBell />;
}
