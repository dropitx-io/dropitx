import type { Metadata, Viewport } from "next";
import "@fontsource-variable/roboto";
import "@fontsource-variable/roboto-mono";
import { AuthProvider } from "@/components/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Fonts ship inside the build (Fontsource), so builds and page loads never fetch from Google Fonts.
const fontVariables = {
  "--font-sans": '"Roboto Variable", ui-sans-serif, system-ui, sans-serif',
  "--font-mono": '"Roboto Mono Variable", ui-monospace, SFMono-Regular, monospace',
  "--font-display": "var(--font-sans)",
} as React.CSSProperties;

export const metadata: Metadata = {
  title: "DropItX",
  description: "Instant file drops, shareable links.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={fontVariables}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
