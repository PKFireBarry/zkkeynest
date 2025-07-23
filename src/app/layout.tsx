import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { VaultProvider } from "@/contexts/VaultContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import StructuredData from "@/components/StructuredData";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zKkeynest - Secure API Key Management for Developers | Zero-Knowledge Encryption",
  description: "Find any API key in under 2 minutes with secure zero-knowledge encryption. Share API key secrets with others in seconds with secure one-time use links. Free tier available.",
  keywords: "API key management, developer tools, zero-knowledge encryption, secure API storage, API key sharing, developer security, password manager for developers, API key vault",
  authors: [{ name: "zKkeynest" }],
  creator: "zKkeynest",
  publisher: "zKkeynest",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zkkeynest.com",
    title: "zKkeynest - Secure API Key Management for Developers",
    description: "Find any API key in under 2 minutes with secure zero-knowledge encryption. Share API key secrets with others in seconds with secure one-time use links.",
    siteName: "zKkeynest",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "zKkeynest - Secure API Key Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "zKkeynest - Secure API Key Management for Developers",
    description: "Find any API key in under 2 minutes with secure zero-knowledge encryption. Share API key secrets with others in seconds.",
    images: ["/logo.png"],
    creator: "@zkkeynest",
  },
  alternates: {
    canonical: "https://zkkeynest.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" type="image/png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#6366f1" />
        </head>
        <body className={`${inter.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <VaultProvider>
              {children}
              <Toaster />
              <PerformanceDashboard />
              <StructuredData />
            </VaultProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
