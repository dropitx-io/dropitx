import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/eb-garamond";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import "@fontsource-variable/jetbrains-mono";
import { AuthProvider } from "@/components/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/*
  Three open-source faces, self-hosted through Fontsource so no page load or
  build fetches a third-party font host:
  - display (headings, UI labels, buttons): Inter
  - body (reading text): EB Garamond, with its italic for emphasis
  - mono (code, slugs, keys): JetBrains Mono
  --font-sans and --font-serif stay as aliases so existing font-sans / font-serif
  classes resolve to the display and body faces.
*/
const DISPLAY = '"Inter Variable", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif';
const BODY = '"EB Garamond Variable", "Iowan Old Style", "Palatino Linotype", Georgia, Cambria, "Times New Roman", serif';
const MONO = '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

const fontVariables = {
  "--font-display": DISPLAY,
  "--font-body": BODY,
  "--font-mono": MONO,
  "--font-sans": DISPLAY,
  "--font-serif": BODY,
} as React.CSSProperties;

export const metadata: Metadata = {
  title: "DropItX",
  description: "Drop a file, get a link: Markdown and HTML files as pages behind short links.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#f2f1ed",
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
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
