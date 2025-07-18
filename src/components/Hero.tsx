"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OldWayCardAnimated from "./OldWayCardAnimated";
import ZKKeynestWayCardAnimated from "./ZKKeynestWayCardAnimated";

import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section id="hero" className="w-full min-h-screen flex flex-col items-center justify-center bg-background px-4 sm:px-6 py-8 sm:py-12 pt-20 sm:pt-24">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
        {/* Hero Content */}
        <motion.div
          className="flex flex-col items-center max-w-4xl w-full gap-6 text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="font-medium">
            <span className="text-xs">Think 1password but for developers</span>
          </Badge>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Your API keys,<br />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">
              organized & secure
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
            Find any API key in 2 minutes or less with secure zero-knowledge encryption. Share API keys secrets with others in seconds with secure one-time use links.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg px-8 py-3 text-base font-semibold">
              <Link href="/sign-in">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-3 text-base font-semibold">
              <Link href="#how-it-works">View Demo</Link>
            </Button>
          </div>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <OldWayCardAnimated />
          <ZKKeynestWayCardAnimated />
        </div>
      </div>
    </section>
  );
};

export default Hero; 