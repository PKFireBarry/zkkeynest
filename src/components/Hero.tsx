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
        {/* Product Hunt Embed & Loom Video Link */}
        <div className="flex flex-col items-center w-full mb-6">
          {/* Product Hunt Badge */}
          <a
            href="https://www.producthunt.com/products/zkkeynest-zero-knowledge-key-storage?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-zkkeynest-zero-knowledge-key-storage"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex justify-center"
            aria-label="View zKkeynest on Product Hunt"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=997222&theme=light&t=1753385173378"
              alt="zKkeynest — Zero Knowledge Key Storage | Product Hunt"
              style={{ width: 250, height: 54, maxWidth: '100%' }}
              width={250}
              height={54}
            />
          </a>
          {/* Loom Demo Video Link */}
          <a
            href="https://www.loom.com/share/f09b795dde2e4676970a7923226d83cd?sid=f94257b5-782e-40dd-8366-0cda9ee2390b"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
            aria-label="Watch demo video on Loom"
          >
            <button
              className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white font-semibold shadow-lg hover:scale-105 transition-transform text-base sm:text-lg"
              type="button"
            >
              🎥 Watch Demo Video
            </button>
          </a>
        </div>
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
            Secure API Key Manager for Developers<br />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">
              Zero-Knowledge Encryption
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
            Find any API key in under 2 minutes with secure zero-knowledge encryption. Share API key secrets with others in seconds with secure one-time use links.
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