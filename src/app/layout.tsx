import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { VaultProvider } from "@/contexts/VaultContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zKkeynest - Secure API Key Management",
  description: "Store and manage your API keys securely with zero-knowledge encryption",
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
        </head>
        <body className={`${inter.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <VaultProvider>
              {children}
              <Toaster />
              <PerformanceDashboard />
            </VaultProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
