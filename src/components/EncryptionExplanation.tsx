"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, KeyRound, Shield, Eye, XCircle, ArrowDown, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const securityLayers = [
  {
    icon: Globe,
    title: "Painless Sign-Ins",
    desc: "Google/GitHub/Slack login-no new accounts to remember.",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    bullets: [
      "Single sign-on",
      "OAuth 2.0",
      "No password fatigue"
    ]
  },
  {
    icon: KeyRound,
    title: "Unlock Password",
    desc: "Only you know it. It's never stored or sent.",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    bullets: [
      "Client-side only",
      "Zero-knowledge",
      "Never transmitted"
    ]
  },
  {
    icon: Shield,
    title: "On-Device Encryption",
    desc: "Your keys are encrypted before they leave your device.",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    bullets: [
      "AES-256 encryption",
      "Local encryption",
      "Secure transmission"
    ]
  },
  {
    icon: Eye,
    title: "Zero-Knowledge",
    desc: "We can't see or access your secrets-ever.",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
    bullets: [
      "Encrypted storage",
      "Complete privacy"
    ]
  }
];

export default function EncryptionExplanation() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      label: "Your Original API Key",
      dotColor: "bg-blue-500",
      labelColor: "text-blue-500",
      value: "sk–1234567890abcdef",
      description: "This is your real API key. It never leaves your device in this form.",
    },
    {
      label: "Encrypted in Your Browser",
      dotColor: "bg-green-500",
      labelColor: "text-green-500",
      value: "aBcDeFgHiJkLmNoPqRsTuVwXyZ123456==",
      description: "Your API key is encrypted on-device instantly in your browser using your unlock password. Only you can decrypt it.",
    },
    {
      label: "What We Store (Encrypted Only)",
      dotColor: "bg-orange-500",
      labelColor: "text-orange-500",
      value: '{ "encryptedData": "n55BQ3dH6wn7uQhJNiSMF3eXag==" "iv": "1a2b3c4d5e6f7g8h" }',
      description: "We store only the encrypted version, along with the IV. The real key is never saved or seen by us.",
    },
  ];

  function handleNextStep() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  }

  return (
    <section className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background scroll-mt-20" id="how-it-works">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How We Keep Your Keys Secure
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your API keys are protected with multiple layers of security, so only you can access them. We never see your secrets. You stay in control-always.
          </motion.p>
        </div>

        {/* How It Works Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Encryption Process Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">How It Works</h3>
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {steps.slice(0, step + 1).map((s, idx) => {
                      const isLast = idx === step;
                      return (
                        <motion.div
                          key={s.label}
                          initial={isLast ? { opacity: 0, y: -20 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${s.dotColor}`} />
                            <span className={`text-xs font-semibold ${s.labelColor} uppercase tracking-wide`}>
                              {s.label}
                            </span>
                          </div>
                          <pre className="bg-muted rounded-lg px-3 py-2 text-sm font-mono overflow-x-auto">
                            {s.value}
                          </pre>
                          <p className="text-xs text-muted-foreground">{s.description}</p>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {step < steps.length - 1 && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handleNextStep}
                        className="group focus:outline-none"
                        aria-label="Show next step"
                      >
                        <ArrowDown className="w-6 h-6 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-primary animate-bounce" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* What We Do/Don't See Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                {/* What happens for you */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-green-700 dark:text-green-400">What happens for you:</h4>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Your keys are encrypted before they ever leave your device",
                      "Only you know your unlock password, we cant recovery it for you",
                      "We store only an encrypted representation of the data, never your real keys",
                      "You have full control: unlock, share, or delete anytime"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border my-4" />

                {/* What we never see */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <h4 className="text-lg font-bold text-red-700 dark:text-red-400">What we never see:</h4>
                  </div>
                  <ul className="space-y-2">
                    {[
                      "Your Unlock password",
                      "Your unencrypted API/.env file secrets",
                      "Your encryption keys",
                      "Your decryption process"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Layers */}
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">Security Layers</h3>
          <p className="text-lg text-muted-foreground">Multiple layers of protection ensure your API keys remain secure at every step</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityLayers.map((layer, index) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-start mb-3">
                    <Badge variant="outline" className="text-xs">
                      Layer {index + 1}
                    </Badge>
                  </div>

                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${layer.bgColor} mb-4`}>
                    <layer.icon className={`w-6 h-6 ${layer.color}`} />
                  </div>

                  <h4 className="text-lg font-bold mb-2">{layer.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{layer.desc}</p>

                  <ul className="space-y-1">
                    {layer.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${layer.color.replace('text-', 'bg-')}`} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 