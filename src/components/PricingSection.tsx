"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Key, 
  Search, 
  Share2, 
  RotateCcw, 
  Clock, 
  Download, 
  Database, 
  Crown, 
  Lock, 
  Users, 
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

const planFeatures = {
  free: {
    title: "Free Plan",
    subtitle: "Perfect for getting started",
    price: "$0/month",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    features: [
      {
        title: "Up to 10 API Keys",
        description: "Store and manage up to 10 API keys with full encryption and security.",
        icon: Key
      },
      {
        title: "Zero-Knowledge Encryption",
        description: "Your API keys are encrypted client-side with AES-256. We never see your real keys.",
        icon: Shield
      },
      {
        title: "Unlock Password Protection",
        description: "Additional security layer with an unlock password that's never stored on our servers.",
        icon: Lock
      },
      {
        title: "One-Time Secure Sharing",
        description: "Create encrypted share links that expire after use or after a set time.",
        icon: Share2
      },
      {
        title: "Session Timeout Settings",
        description: "Configurable auto-lock that secures your vault when inactive.",
        icon: Clock
      },
      {
        title: "Rotation Reminders",
        description: "Set automated reminders for API key rotation with flexible scheduling.",
        icon: RotateCcw
      }
    ]
  },
  pro: {
    title: "Pro Plan",
    subtitle: "For power users and professionals",
    price: "$3/month",
    icon: Crown,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    features: [
      {
        title: "Unlimited API Keys",
        description: "Store as many API keys as you need without any limits.",
        icon: Database
      },
      {
        title: "Advanced Search & Organization",
        description: "Find and organize your API keys with powerful search, custom tags, categories, and folders.",
        icon: Search
      },
      {
        title: "Export Functionality",
        description: "Export all your API keys as an encrypted backup file for safekeeping or migration.",
        icon: Download
      },
      {
        title: "Everything in Free",
        description: "All free plan features plus unlimited storage and advanced organization tools.",
        icon: CheckCircle
      }
    ]
  },
  team: {
    title: "Team Plan",
    subtitle: "Coming soon for teams",
    price: "$10/user/month",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    comingSoon: true,
    features: [
      {
        title: "Shared Vaults",
        description: "Create shared vaults where team members can access common API keys securely.",
        icon: Users
      },
      {
        title: "Role-Based Permissions",
        description: "Control who can view, edit, or share specific API keys with granular permissions.",
        icon: Shield
      },
      {
        title: "Activity Logging",
        description: "Track who accessed which keys and when for security and compliance.",
        icon: Clock
      },
      {
        title: "Everything in Pro",
        description: "All pro plan features plus team collaboration and management tools.",
        icon: CheckCircle
      }
    ]
  }
};



export default function PricingSection() {
  return (
    <section id="pricing" className="w-full flex flex-col items-center justify-center px-4 sm:px-6 py-8 md:py-0 bg-background text-foreground md:min-h-screen min-h-[80vh]">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center h-full">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            What You Get With Each Plan
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            All plans include enterprise-grade security. Start free and upgrade when you need more.
          </motion.p>
        </div>

        {/* Three Column Layout */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch justify-center flex-1">
          {Object.entries(planFeatures).map(([planKey, plan], planIndex) => (
            <motion.div
              key={planKey}
              className="flex flex-col h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: planIndex * 0.1 }}
            >
              <Card className={`flex flex-col h-full relative ${planKey === 'team' ? 'opacity-75' : ''} ${planKey === 'pro' ? 'border-2 border-blue-500 shadow-lg' : ''}`}>
                {planKey === 'team' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Coming Soon
                    </Badge>
                  </div>
                )}
                {planKey === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {/* Plan Header */}
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto p-2 rounded-lg ${plan.bgColor} w-fit mb-3`}>
                    <plan.icon className={`h-6 w-6 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                  <CardDescription className="text-sm">{plan.subtitle}</CardDescription>
                  <div className="text-2xl font-bold mt-2">{plan.price}</div>
                </CardHeader>

                {/* Features List */}
                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature.title}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (planIndex * 0.1) + (featureIndex * 0.05) }}
                      >
                        <div className={`p-1 rounded ${plan.bgColor} flex-shrink-0 mt-0.5`}>
                          <feature.icon className={`h-3 w-3 ${plan.color}`} />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{feature.title}</span>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                
                {/* Add CTA Buttons */}
                <CardFooter className="pt-4">
                  {planKey === 'free' && (
                    <Button 
                      variant="default" 
                      className="w-full text-base font-semibold py-3 rounded-md"
                      onClick={() => window.location.href = '/sign-up'}
                    >
                      Get Started Free
                    </Button>
                  )}
                  
                  {planKey === 'pro' && (
                    <Button 
                      variant="default" 
                      className="w-full text-base font-semibold py-3 rounded-md"
                      onClick={() => window.location.href = '/dashboard?billing=true'}
                    >
                      Upgrade to Pro
                    </Button>
                  )}
                  
                  {planKey === 'team' && (
                    <div className="flex flex-col w-full">
                      <span className="text-xs text-muted-foreground mb-2 text-center w-full">
                        Team Plan is not yet available. Stay tuned!
                      </span>
                      <Button 
                        variant="outline" 
                        className="w-full text-base font-semibold py-3 rounded-md"
                        disabled
                      >
                        Coming Soon
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div 
          className="text-center mt-6 md:mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No credit card required • Upgrade anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 