"use client";

import { useEffect, useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";

interface ClerkLoadingWrapperProps {
  mode: "sign-in" | "sign-up";
  appearance?: any;
}

export default function ClerkLoadingWrapper({ mode, appearance }: ClerkLoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add a small delay to ensure Clerk components are fully initialized
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#a21caf] rounded-full animate-spin" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Loading {mode === "sign-in" ? "sign-in" : "sign-up"} form...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we prepare your secure authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {mode === "sign-in" ? (
        <SignIn appearance={appearance} />
      ) : (
        <SignUp appearance={appearance} />
      )}
    </div>
  );
} 