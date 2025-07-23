"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Key, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SecurityDisclaimerProps {
  className?: string;
}

export default function SecurityDisclaimer({ className }: SecurityDisclaimerProps) {
  return (
    <section className={`w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center ${className || ""}`}>
      <div className="w-full max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Important Security Notice
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Zero-Knowledge Security Warning
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Understanding the security implications of our zero-knowledge design is crucial for your data safety.
          </p>
        </div>

        {/* Main Warning Alert */}
        <Alert className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-400 text-lg font-semibold">
            Unlock Password Recovery is Impossible
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300 mt-2">
            <p className="mb-3">
              <strong>If you forget your unlock password, your data cannot be recovered.</strong> This is not a bug-it's an intentional design choice that ensures your complete privacy and security.
            </p>
            <p className="mb-3">
              We use zero-knowledge encryption, which means we never see, store, or have access to your unlock password or decrypted data. Only you can unlock your vault.
            </p>
            <p className="font-medium">
              Please store your unlock password securely!
            </p>
          </AlertDescription>
        </Alert>

        {/* Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Why Zero-Knowledge */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 shrink-0">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Why Zero-Knowledge?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Zero-knowledge encryption ensures that even if our servers are compromised, your data remains completely secure because we never have the keys to decrypt it.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Complete privacy protection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      No backdoors possible
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Protection against data breaches
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Responsibility */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 shrink-0">
                  <Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Your Responsibility
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    With great security comes great responsibility. You are the sole guardian of your unlock password.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Choose a strong, memorable password
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Store it in a secure place
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Never share it with anyone
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learn More */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Want to understand our encryption process in detail?
          </p>
          <Link 
            href="#how-it-works" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            Learn about our security implementation
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}