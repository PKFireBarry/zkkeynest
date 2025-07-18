"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface OldWayCardAnimatedProps {
  onCycleComplete?: () => void;
}

const EMAILS = [
  "work@email.com",
  "personal@email.com",
  "sideproject@email.com",
  "notes.txt",
  "api_keys.docx",
  "random-notes.md",
];

const FRUSTRATED_MESSAGES = [
  "Not here... trying next...",
  "Nope, not this one either...",
  "Still can't find it...",
  "Maybe it's in my notes?",
  "Ugh, where did I save it?",
  "I'm so frustrated!",
];

export default function OldWayCardAnimated({ onCycleComplete }: OldWayCardAnimatedProps) {
  const [index, setIndex] = useState(0);
  const [frustration, setFrustration] = useState(0);
  const [showFrustrated, setShowFrustrated] = useState(false);
  const [timer, setTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < EMAILS.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setIndex(0);
        setFrustration((f) => (f + 1) % FRUSTRATED_MESSAGES.length);
        setShowFrustrated(true);
        setCycleCount(c => c + 1);
        setTimeout(() => setShowFrustrated(false), 1200);
        if (onCycleComplete) onCycleComplete();
      }
    }, 900);
    return () => clearInterval(interval);
  }, [index, onCycleComplete]);

  // Timer animation - resets each cycle
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    
    if (index === 0 && cycleCount > 0) {
      // Reset timer at start of new cycle
      setTimer(0);
    }
    
    // Animate timer during the cycle
    timerInterval = setInterval(() => {
      setTimer(prev => {
        const target = 20; // Always target 20 minutes per cycle
        const increment = target / (EMAILS.length * 900 / 150); // Smooth animation over cycle duration
        if (prev < target) {
          return Math.min(prev + increment, target);
        }
        return target;
      });
    }, 150);
    
    return () => clearInterval(timerInterval);
  }, [index, cycleCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              The Old Way
            </Badge>
          </div>
          
          <div className="space-y-4 mb-6">
            {/* Animated Search Box */}
            <div className="w-full flex items-center justify-center bg-background border rounded-lg px-3 py-2 min-h-[40px] transition-all duration-300">
              <span className="text-red-600 text-sm font-mono">{EMAILS[index]}</span>
            </div>
            
            {/* Frustration Message */}
            <div className="w-full flex items-center justify-center min-h-[40px] px-3 py-2">
              <span className="text-red-600 text-sm font-medium text-center transition-all duration-300">
                {showFrustrated ? FRUSTRATED_MESSAGES[frustration] : ""}
              </span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-2xl font-bold">{timer.toFixed(1)}</span>
              <span className="text-sm">min</span>
            </div>
            <p className="text-xs text-red-500">Time wasted per key</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 