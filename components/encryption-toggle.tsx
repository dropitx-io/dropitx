"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ShieldOff, KeyRound, Loader2 } from "lucide-react";
import { generateRandomKey, deriveKeyFromPassword, exportKey, setKeyInFragment } from "@/lib/crypto";

export interface EncryptionState {
  enabled: boolean;
  key: CryptoKey | null;
  keyString: string; // base64url exported key
  isPasswordMode: boolean;
}

interface EncryptionToggleProps {
  onStateChange: (state: EncryptionState) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function EncryptionToggle({
  onStateChange,
  disabled = false,
  compact = false,
}: EncryptionToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [ready, setReady] = useState(false);

  const handleToggle = useCallback(async () => {
    if (enabled) {
      // Disable encryption
      setEnabled(false);
      setReady(false);
      setPassword("");
      setConfirmPassword("");
      setIsPasswordMode(false);
      onStateChange({ enabled: false, key: null, keyString: "", isPasswordMode: false });
      return;
    }
    setEnabled(true);
  }, [enabled, onStateChange]);

  const handleGenerateRandom = useCallback(async () => {
    setGenerating(true);
    try {
      const key = await generateRandomKey();
      const keyString = await exportKey(key);
      setKeyInFragment(keyString, false);
      setReady(true);
      onStateChange({ enabled: true, key, keyString, isPasswordMode: false });
    } catch {
      setPasswordError("Failed to generate encryption key");
    } finally {
      setGenerating(false);
    }
  }, [onStateChange]);

  const handleSetPassword = useCallback(async () => {
    setPasswordError(null);

    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length < 4) {
      setPasswordError("Password must be at least 4 characters");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setGenerating(true);
    try {
      const { key, salt } = await deriveKeyFromPassword(password);
      const keyString = await exportKey(key);
      // Store the salt+key info for later retrieval
      const saltBase64 = btoa(String.fromCharCode(...salt));
      setKeyInFragment(saltBase64 + "." + keyString, true);
      setReady(true);
      onStateChange({ enabled: true, key, keyString, isPasswordMode: true });
    } catch {
      setPasswordError("Failed to derive encryption key");
    } finally {
      setGenerating(false);
    }
  }, [password, confirmPassword, onStateChange]);

  // Auto-generate random key when toggled on in random mode
  useEffect(() => {
    if (enabled && !isPasswordMode && !ready && !generating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacts to the parent-controlled `enabled` prop by starting async key generation (WebCrypto); no event handler exists to move this to
      handleGenerateRandom();
    }
  }, [enabled, isPasswordMode, ready, generating, handleGenerateRandom]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg"
          onClick={handleToggle}
          disabled={disabled}
          title={enabled ? "Disable encryption" : "Enable E2E encryption"}
        >
          {enabled ? (
            <Shield className="size-4 text-success" />
          ) : (
            <ShieldOff className="size-4 text-muted-foreground" />
          )}
        </Button>
        {enabled && ready && (
          <span className="text-xs text-success font-medium">E2E</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Shield className="size-4 text-success" />
          ) : (
            <ShieldOff className="size-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">End-to-End Encryption</span>
        </div>
        <Button
          variant={enabled ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          disabled={disabled}
          className="h-7 text-xs"
        >
          {enabled ? "Enabled" : "Enable"}
        </Button>
      </div>

      {enabled && !ready && (
        <div className="space-y-3 rounded-lg border border-border/60 p-3">
          <div className="flex gap-2">
            <Button
              variant={!isPasswordMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPasswordMode(false)}
              className="flex-1 h-8 text-xs"
            >
              <KeyRound className="size-3 mr-1.5" />
              Random Key
            </Button>
            <Button
              variant={isPasswordMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPasswordMode(true)}
              className="flex-1 h-8 text-xs"
            >
              Password
            </Button>
          </div>

          {isPasswordMode ? (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Encryption password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={generating}
                className="h-8 text-sm"
                autoComplete="new-password"
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={generating}
                className="h-8 text-sm"
                autoComplete="new-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetPassword();
                }}
              />
              <Button
                size="sm"
                onClick={handleSetPassword}
                disabled={generating || !password}
                className="w-full h-8 text-xs"
              >
                {generating ? (
                  <Loader2 className="size-3 animate-spin mr-1.5" />
                ) : (
                  <KeyRound className="size-3 mr-1.5" />
                )}
                Set Password
              </Button>
              {passwordError && (
                <p className="text-xs text-destructive">{passwordError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              {generating ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Generating key...
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleGenerateRandom}
                  className="h-8 text-xs"
                >
                  <KeyRound className="size-3 mr-1.5" />
                  Generate Random Key
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {enabled && ready && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-3">
          <p className="text-xs text-success">
            Content will be encrypted before upload. The decryption key is in
            the URL fragment (#key=...) and never sent to the server.
            Share the full URL including the key part.
          </p>
        </div>
      )}
    </div>
  );
}
