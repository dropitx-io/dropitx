"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, KeyRound, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HtmlViewer } from "@/components/html-viewer";
import { MarkdownViewerWrapper } from "@/components/markdown-viewer-wrapper";
import {
  importKey,
  decrypt,
  decryptWithPassword,
  getKeyFromFragment,
  clearKeyFromFragment,
} from "@/lib/crypto";

interface EncryptedContentViewerProps {
  encryptedContent: string;
  isMarkdown: boolean;
}

type DecryptState = "loading" | "need-password" | "decrypting" | "decrypted" | "error";

export function EncryptedContentViewer({
  encryptedContent,
  isMarkdown,
}: EncryptedContentViewerProps) {
  const [state, setState] = useState<DecryptState>("loading");
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tryDecrypt = useCallback(async () => {
    const fragment = getKeyFromFragment();

    if (!fragment) {
      setState("need-password");
      return;
    }

    setState("decrypting");
    try {
      let content: string;

      if (fragment.isPassword) {
        // Password-derived key: need password to derive — prompt for it
        setState("need-password");
        return;
      } else {
        // Random key: fragment is the raw key
        const key = await importKey(fragment.key);
        content = await decrypt(encryptedContent, key);
      }

      setDecryptedContent(content);
      setState("decrypted");
      clearKeyFromFragment();
    } catch {
      setError("Failed to decrypt — key may be incorrect");
      setState("error");
    }
  }, [encryptedContent]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount initialization from the URL fragment (client-only); cannot run during render without SSR mismatch
    tryDecrypt();
  }, [tryDecrypt]);

  const handlePasswordDecrypt = async () => {
    if (!password) return;
    setState("decrypting");
    setError(null);

    try {
      const content = await decryptWithPassword(encryptedContent, password);
      setDecryptedContent(content);
      setState("decrypted");
      clearKeyFromFragment();
    } catch {
      setError("Wrong password or corrupted data");
      setState("need-password");
    }
  };

  if (state === "loading" || state === "decrypting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {state === "decrypting" ? "Decrypting content..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (state === "need-password") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="flex size-12 items-center justify-center rounded-xl bg-success/10">
          <Lock className="size-6 text-success" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold">Encrypted Content</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            This content is end-to-end encrypted. Enter the decryption password to view it.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Input
            type="password"
            placeholder="Decryption password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePasswordDecrypt();
            }}
            className="h-9 text-sm"
            autoFocus
          />
          <Button
            onClick={handlePasswordDecrypt}
            disabled={!password}
            size="sm"
            className="gap-1.5"
          >
            <KeyRound className="size-3.5" />
            Decrypt
          </Button>
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Shield className="size-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null);
            setState("loading");
            tryDecrypt();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Decrypted successfully
  if (decryptedContent !== null) {
    return isMarkdown ? (
      <MarkdownViewerWrapper content={decryptedContent} />
    ) : (
      <HtmlViewer htmlContent={decryptedContent} />
    );
  }

  return null;
}
