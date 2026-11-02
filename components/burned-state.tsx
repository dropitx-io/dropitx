"use client";

import Link from "next/link";
import { StatusPage } from "@/app/(content)/_ui/status-page";
import { squareButton } from "@/app/(content)/_ui/public-styles";

export function BurnedState() {
  return (
    <StatusPage
      title="Burned after reading."
      message="This page was set to delete itself once it was read, and it has been. It cannot be recovered."
      action={
        <Link href="/" className={squareButton()}>
          Back to DropItX
        </Link>
      }
    />
  );
}
