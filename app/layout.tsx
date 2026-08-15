import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { VercelAnalytics } from "@/components/vercel-analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      style={{ ["--font-display" as string]: "var(--font-sans)" }}
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
        <VercelAnalytics />
      </body>
    </html>
  );
}
