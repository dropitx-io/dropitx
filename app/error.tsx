"use client";

import { StatusPage } from "@/app/(content)/_ui/status-page";
import { squareButton } from "@/app/(content)/_ui/public-styles";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <StatusPage
      title="Something went wrong."
      message="The page hit an error while loading. Try again; if it keeps happening, come back in a few minutes."
      action={
        <button type="button" onClick={reset} className={squareButton()}>
          Try again
        </button>
      }
    />
  );
}
