"use client";

import Link from "next/link";
import { StatusPage } from "@/app/(content)/_ui/status-page";
import { squareButton } from "@/app/(content)/_ui/public-styles";

export function ExpiredState() {
  return (
    <StatusPage
      title="This link has expired."
      message="Whoever shared it set an end date, and it has passed. The content has been removed."
      action={
        <Link href="/" className={squareButton()}>
          Back to DropItX
        </Link>
      }
    />
  );
}
