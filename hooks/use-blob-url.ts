"use client";

import { useEffect, useReducer } from "react";

interface BlobUrlState {
  objectUrl: string | null;
  failed: boolean;
}

type BlobUrlAction =
  | { type: "created"; objectUrl: string }
  | { type: "failed" };

function blobUrlReducer(_: BlobUrlState, action: BlobUrlAction): BlobUrlState {
  if (action.type === "created") return { objectUrl: action.objectUrl, failed: false };
  return { objectUrl: null, failed: true };
}

export function useBlobUrl(bytes: Uint8Array<ArrayBuffer>, mimeType: string): BlobUrlState {
  const [state, dispatch] = useReducer(blobUrlReducer, { objectUrl: null, failed: false });

  useEffect(() => {
    const objectUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    dispatch({ type: "created", objectUrl });
    return () => URL.revokeObjectURL(objectUrl);
  }, [bytes, mimeType]);

  return state;
}
