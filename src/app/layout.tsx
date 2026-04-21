import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "TraceGuard AI - Protect Your Digital Content",
  description: "AI-powered platform that protects digital images with invisible watermarks and fingerprints. Detect unauthorized use instantly.",
  keywords: ["TraceGuard", "AI", "Image Protection", "Watermark", "Fingerprinting", "PWA"],
  authors: [{ name: "TraceGuard AI Team" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "TraceGuard AI",
    description: "Protect your digital content with AI-powered watermarking and fingerprinting",
    type: "website",
    images: ["/logo.png"],
    siteName: "TraceGuard AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TraceGuard AI",
    description: "Protect your digital content with AI-powered watermarking and fingerprinting",
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TraceGuard AI",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "TraceGuard AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
