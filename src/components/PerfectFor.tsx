"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PerfectFor() {
  return (
    <section id="perfect-for" className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background">
      <div className="w-full max-w-6xl">
        {/* Why zKkeynest Section */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Why Make zKkeynest?
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We're building a secure, no-friction API key vault for developers and small teams. Starting with solo devs scraping together free-tier access to build products, we scale into team workflows where API keys are a core but messy part of the stack. There's no cheap clean solution for lightweight, encrypted key sharing today—and we're solving that.
          </motion.p>
        </div>

        {/* Problem & Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-700 dark:text-red-400">The Problem</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-red-700 dark:text-red-400">Storing API keys unsafely</strong> in chat logs or emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-red-700 dark:text-red-400">Forgetting which API key</strong> belongs to which account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-red-700 dark:text-red-400">Constantly logging in/out</strong> of different accounts to retrieve keys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-red-700 dark:text-red-400">Lack of a cheap, secure way</strong> to share keys with team members</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Our Solution</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-green-700 dark:text-green-400">Zero-knowledge encryption:</strong> All encryption/decryption happens client-side</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-green-700 dark:text-green-400">99% Uptime:</strong> Data hosted on Google Cloud servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-green-700 dark:text-green-400">Social login:</strong> Google/GitHub authentication for frictionless access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-green-700 dark:text-green-400">Unlock password protection:</strong> Additional security layer for viewing keys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-green-700 dark:text-green-400">One-time sharing:</strong> Secure, encrypted links that expire after use</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Perfect For Section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">Perfect For</h3>
          <p className="text-lg text-muted-foreground">Different developers, same problem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solo Developers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 14l-6 4.5 2.5-7.5-6-4.5h7.5L12 2z" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Solo Developers</h4>
                <p className="text-sm text-muted-foreground mb-4">"The account juggler's dream"</p>
                <ul className="space-y-2 text-sm mb-6 flex-grow">
                  <li>- Youre a freelancer that needs to have clients share secrets</li>
                  <li>- You use more then one computer for development</li>
                  <li>- You're tired of logging in/out constantly of accounts to swap free tier keys</li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm rounded-lg px-3 py-2 font-medium mt-auto">
                  Solution: Store all keys in one place
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Small Teams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 dark:bg-green-950 mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle cx="8" cy="9" r="2" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="16" cy="9" r="2" stroke="#22c55e" strokeWidth="2" />
                    <path d="M4 19c0-2 2-4 6-4s6 2 6 4" stroke="#22c55e" strokeWidth="2" />
                    <path d="M14 19c0-1 1-2 3-2s3 1 3 2" stroke="#22c55e" strokeWidth="2" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Small Teams</h4>
                <p className="text-sm text-muted-foreground mb-4">"No more risky Slack messages"</p>
                <ul className="space-y-2 text-sm mb-6 flex-grow">
                  <li>- You need to share API keys with teammates securely</li>
                  <li>- Managing client API keys across multiple projects simultaneousl/</li>
                  <li>- Secure handoff of credentials when team members rotate between projects</li>
                </ul>
                <div className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm rounded-lg px-3 py-2 font-medium mt-auto">
                  Solution: Secure sharing in seconds
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Startups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950 mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" stroke="#a21caf" strokeWidth="2" />
                    <rect x="9" y="9" width="1.5" height="1.5" fill="#a21caf" />
                    <rect x="13.5" y="9" width="1.5" height="1.5" fill="#a21caf" />
                    <rect x="9" y="13.5" width="1.5" height="1.5" fill="#a21caf" />
                    <rect x="13.5" y="13.5" width="1.5" height="1.5" fill="#a21caf" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Startups</h4>
                <p className="text-sm text-muted-foreground mb-4">"Enterprise security without enterprise complexity"</p>
                <ul className="space-y-2 text-sm mb-6 flex-grow">
                  <li>- Sharing AWS/GCP credentials between founder-CTO and first engineering hire</li>
                  <li>- Coordinating web, mobile, and desktop app credentials across different development teams</li>
                  <li>- Managing customer integration keys across sales, support, and engineering teams securely</li>
                </ul>
                <div className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-sm rounded-lg px-3 py-2 font-medium mt-auto">
                  Solution: Simple setup, always secure
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 