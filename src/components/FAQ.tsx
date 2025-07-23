"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Shield, Key, DollarSign, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: 'security' | 'features' | 'pricing' | 'technical';
}

const categoryConfig = {
  security: {
    id: 'security',
    name: 'Security',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  features: {
    id: 'features',
    name: 'Features',
    icon: Key,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950'
  },
  pricing: {
    id: 'pricing',
    name: 'Pricing',
    icon: DollarSign,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    icon: Settings,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  }
};

const faqData: FAQItem[] = [
  {
    question: "How secure is zKkeynest compared to storing API keys in environment files?",
    answer: "zKkeynest uses AES-256 encryption with zero-knowledge architecture, meaning your API keys are encrypted on your device before being stored. Unlike .env files which are stored in plain text, your keys are protected even if our servers are compromised. We never see your unencrypted keys.",
    category: 'security'
  },
  {
    question: "Can I share API keys securely with my team members?",
    answer: "Yes! zKkeynest offers one-time secure sharing links that expire after viewing or after a set time. The shared keys are encrypted end-to-end, so only the intended recipient can decrypt them. This is much safer than sharing keys via Slack, email, or other messaging platforms.",
    category: 'features'
  },
  {
    question: "What happens if I forget my unlock password?",
    answer: "Due to our zero-knowledge encryption, we cannot recover your unlock password. However, you can reset your vault (which will delete all stored keys) and start fresh. We recommend keeping a secure backup of your most critical keys using our export feature.",
    category: 'security'
  },
  {
    question: "How does zKkeynest compare to password managers like 1Password or LastPass?",
    answer: "While password managers are great for general credentials, zKkeynest is built specifically for developers' API key workflows. We offer features like rotation reminders, copy-safe views, drag-and-drop .env integration, and developer-focused organization that general password managers don't provide.",
    category: 'features'
  },
  {
    question: "Is there a free tier? What are the limitations?",
    answer: "Yes! Our free tier includes up to 10 API keys with full zero-knowledge encryption, secure sharing, rotation reminders, and all security features. The Pro plan ($3/month) offers unlimited keys, advanced search, export functionality, and enhanced organization tools.",
    category: 'pricing'
  },
  {
    question: "What encryption standards does zKkeynest use?",
    answer: "We use AES-256-GCM encryption with PBKDF2 key derivation, the same standards used by major banks, government agencies, and security-focused companies like Signal and ProtonMail. All encryption happens client-side in your browser.",
    category: 'technical'
  },
  {
    question: "How do rotation reminders work?",
    answer: "You can set custom rotation schedules for each API key (weekly, monthly, quarterly, etc.). zKkeynest will send you notifications when it's time to rotate keys, helping you maintain good security hygiene without manual tracking.",
    category: 'features'
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="faq" className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Everything you need to know about secure API key management with zKkeynest
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {faqData.map((faq, index) => {
              const category = categoryConfig[faq.category];
              const IconComponent = category.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: [0.04, 0.62, 0.23, 0.98]
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <Card className="">
                    <CardContent className="p-0">
                      {/* Category Badge */}
                      <div className="px-6 pt-6 pb-3">
                        <Badge
                          variant="secondary"
                          className={`${category.bgColor} ${category.color} border-0 font-semibold text-xs px-3 py-1.5`}
                        >
                          <IconComponent className="w-3.5 h-3.5 mr-1.5" />
                          {category.name}
                        </Badge>
                      </div>

                      {/* Question Button */}
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full px-6 pb-5 text-left flex items-start justify-between hover:bg-muted/30 transition-colors duration-200 group"
                      >
                        <h3 className="font-bold text-lg sm:text-xl pr-6 leading-tight group-hover:text-primary transition-colors duration-200 text-foreground">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0 mt-1">
                          {openItems.includes(index) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                          )}
                        </div>
                      </button>

                      {/* Answer Content */}
                      <AnimatePresence mode="wait">
                        {openItems.includes(index) && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                              y: -10
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                              y: 0
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                              y: -10
                            }}
                            transition={{
                              duration: 0.5,
                              ease: [0.04, 0.62, 0.23, 0.98],
                              opacity: { duration: 0.3 },
                              y: { duration: 0.4 }
                            }}
                            className="overflow-hidden"
                          >
                            <motion.div
                              className="px-6 pb-6 pt-3 border-t border-border/30 mx-6"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.3 }}
                            >
                              <div className="pt-3">
                                <motion.p
                                  className="text-muted-foreground leading-relaxed text-base sm:text-lg"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.25, duration: 0.4 }}
                                >
                                  {faq.answer}
                                </motion.p>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="dariongeorge0719@gmail.com"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}