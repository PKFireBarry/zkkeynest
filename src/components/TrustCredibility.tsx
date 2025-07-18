"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface TrustedService {
  name: string;
  description: string;
  icon: React.ReactNode;
  useCase: string;
  category: 'password-manager' | 'messaging' | 'browser' | 'email' | 'finance';
}

const trustedServices: TrustedService[] = [
  {
    name: "1Password",
    description: "Industry-leading password manager trusted by millions",
    icon: <Image className="w-9 h-9" src="https://cdn.worldvectorlogo.com/logos/1password-2.svg" alt="1Password" width={24} height={24} />,
    useCase: "Same zero-knowledge encryption approach for sensitive password protection",
    category: 'password-manager'
  },
  {
    name: "Signal",
    description: "End-to-end encrypted messaging used by security professionals",
    icon: <Image className="w-9 h-9 rounded-full" src="https://cdn.worldvectorlogo.com/logos/signal-logo-1.svg" alt="Signal" width={24} height={24} />,
    useCase: "Client-side encryption ensures only you can decrypt your messages",
    category: 'messaging'
  },
  {
    name: "ProtonMail",
    description: "Encrypted email service protecting millions of users",
    icon: <Image className="w-9 h-9 bg-white rounded-full" src="https://cdn.worldvectorlogo.com/logos/protonmail-logo.svg" alt="1Password" width={24} height={24} />,
    useCase: "Zero-access encryption - even they can't read your emails",
    category: 'email'
  },
  {
    name: "Major Banks",
    description: "Financial institutions using AES encryption for transactions",
    icon: <Image className="w-9 h-9 bg-white rounded-full" src="https://cdn.worldvectorlogo.com/logos/ally-bank.svg" alt="Ally" width={24} height={24} />,
    useCase: "Same AES-GCM encryption standard protecting your financial data",
    category: 'finance'
  }
];

export default function TrustCredibility() {
  return (
    <section id="trust" className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
             These Tools Trust the Same Standards
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            We use the same encryption methods as the services you already trust. 
          </p>
        </div>

        {/* Trusted Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trustedServices.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {service.icon}
                    </div>
                    <h3 className="font-bold text-lg">{service.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {service.description}
                  </p>
                  <div className="text-sm font-medium text-primary">
                    {service.useCase}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Technical Explanation */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Technical Details
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-4">AES-GCM Encryption Standard</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">What We Use:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>AES-256-GCM:</strong> Widely used in military and government applications for securing sensitive data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>Client-side key derivation:</strong> Your password never leaves your device</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>PBKDF2:</strong> Industry-standard key stretching</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Same As:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>BitLocker, IBM Security Guardium, and Keeper Security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Healthcare data protection (HIPAA)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Financial transaction security</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-sm font-medium text-center">
                  <span className="text-primary">Industry-standard, battle-tested encryption</span> — 
                  not experimental or homebrew crypto
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}