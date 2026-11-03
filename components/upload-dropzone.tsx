"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";
import { apiErrorDetail, authFetch } from "@/lib/api-client";

export interface UploadResult {
  slug: string;
  url: string;
  filename: string;
  deleteToken: string;
}

export type UploadState = "idle" | "uploading" | "success" | "error";

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

/**
 * Publishes one dropped or chosen file through `POST /api/upload`. The caller spreads
 * `getRootProps` over the area that takes a drop and calls `open` from its Upload button;
 * clicking the area itself does nothing, so rows inside it stay clickable.
 */
export function useUploadDropzone(onUploadSuccess: (result: UploadResult) => void) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setState("uploading");
      setErrorMessage("");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await authFetch("/api/upload", { method: "POST", body: formData });
        if (!response.ok) {
          setState("error");
          setErrorMessage(await apiErrorDetail(response, "Upload failed."));
          return;
        }
        const data = (await response.json()) as UploadResult;
        setState("success");
        trackEvent(AnalyticsEvent.DOCUMENT_UPLOADED, {
          type: file.name.split(".").pop() || "unknown",
          size_kb: Math.round(file.size / 1024),
        });
        onUploadSuccess(data);
      } catch {
        setState("error");
        setErrorMessage("Network error. Please try again.");
      }
    },
    [onUploadSuccess],
  );

  const dropzone = useDropzone({
    onDropAccepted: (files) => {
      if (files[0]) void upload(files[0]);
    },
    onDropRejected: () => {
      setState("error");
      setErrorMessage("File too large. Maximum size is 500 MB.");
    },
    maxSize: MAX_UPLOAD_BYTES,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: state === "uploading",
  });

  const reset = useCallback(() => {
    setState("idle");
    setErrorMessage("");
    setFileName(null);
  }, []);

  return {
    getRootProps: dropzone.getRootProps,
    getInputProps: dropzone.getInputProps,
    open: dropzone.open,
    isDragActive: dropzone.isDragActive,
    state,
    errorMessage,
    fileName,
    reset,
  };
}
