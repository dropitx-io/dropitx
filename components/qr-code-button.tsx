"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, Download, Copy, Check, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api-client";
import { SITE_URL } from "@/lib/site-url";

interface QrCodeButtonProps {
  slug: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
}

export function QrCodeButton({
  slug,
  variant = "outline",
  size = "icon-sm",
}: QrCodeButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const qrUrl = getApiUrl(`/api/qr/${slug}`);
  const shareUrl = `${SITE_URL}/s/${slug}`;

  const handleCopy = async () => {
    try {
      const resp = await fetch(qrUrl);
      const blob = await resp.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy share URL instead
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `dropitx-qr-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} title="Show QR code">
          <QrCode className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to open the share link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-56 rounded-lg border bg-white p-3">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <img
              src={qrUrl}
              alt={`QR code for ${slug}`}
              className="size-full"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono text-center break-all px-4">
            {shareUrl}
          </p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 gap-1.5" onClick={handleCopy}>
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied!" : "Copy image"}
            </Button>
            <Button variant="outline" className="flex-1 gap-1.5" onClick={handleDownload}>
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
