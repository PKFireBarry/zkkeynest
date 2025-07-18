"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Search } from "lucide-react";
import { motion } from "framer-motion";

interface ZKKeynestWayCardAnimatedProps {
  onCycleComplete?: () => void;
}

const OPTIONS = [
  { name: "Gemini", key: "gm-...5678" },
  { name: "Claude", key: "cl-...abcd" },
  { name: "Apify", key: "ap-...4321" },
  { name: "AgentQL", key: "aq-...9999" },
  { name: "Serper", key: "sp-...7777" },
];

export default function ZKKeynestWayCardAnimated({ onCycleComplete }: ZKKeynestWayCardAnimatedProps) {
  const [optionIndex, setOptionIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showCaret, setShowCaret] = useState(true);
  const [timer, setTimer] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Reset typed and showResult when option changes
  useEffect(() => {
    setTyped("");
    setShowResult(false);
  }, [optionIndex]);

  // Typing animation
  useEffect(() => {
    if (typed.length < OPTIONS[optionIndex].name.length) {
      const timeout = setTimeout(() => {
        setTyped(OPTIONS[optionIndex].name.slice(0, typed.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else if (!showResult) {
      // Show result after typing is done
      const timeout = setTimeout(() => setShowResult(true), 600);
      return () => clearTimeout(timeout);
    }
  }, [typed, optionIndex, showResult]);

  // Loop to next option after showing result
  useEffect(() => {
    if (showResult) {
      const nextTimeout = setTimeout(() => {
        setOptionIndex((i) => (i + 1) % OPTIONS.length);
        setCycleCount(c => c + 1);
        if (onCycleComplete) onCycleComplete();
      }, 2200);
      return () => clearTimeout(nextTimeout);
    }
  }, [showResult, onCycleComplete]);

  // Blinking caret animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCaret((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Timer animation - resets each cycle
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (optionIndex === 0 && cycleCount > 0 && typed === "") {
      // Reset timer at start of new cycle
      setTimer(0);
    }

    // Animate timer during the cycle
    timerInterval = setInterval(() => {
      setTimer(prev => {
        const target = 1; // Always target 1 minute per cycle
        const cycleDuration = (OPTIONS[optionIndex].name.length * 100) + 600 + 2200; // Total cycle time
        const increment = target / (cycleDuration / 120); // Smooth animation over cycle duration
        if (prev < target) {
          return Math.min(prev + increment, target);
        }
        return target;
      });
    }, 120);

    return () => clearInterval(timerInterval);
  }, [optionIndex, typed, cycleCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              The zKkeynest Way
            </Badge>
          </div>

          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="w-full flex items-center bg-background border rounded-lg px-3 py-2 gap-2 min-h-[40px] transition-all duration-300">
              <Search className="w-4 h-4 text-blue-500" />
              <span className="text-foreground text-sm font-mono flex items-center" aria-label="API key search input">
                {typed}
                <span
                  className={`inline-block w-0.5 h-4 ml-1 ${showCaret ? 'bg-foreground' : 'bg-transparent'} transition-colors duration-300`}
                  aria-hidden="true"
                />
              </span>
            </div>

            {/* Result Box - Always present to maintain consistent sizing */}
            <div className="w-full flex items-center bg-background border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 gap-2 min-h-[40px] justify-between">
              {showResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex items-center justify-between h-5"
                >
                  <span className="text-green-600 text-sm font-mono flex-shrink-0 leading-5">{OPTIONS[optionIndex].key}</span>
                  <span className="text-lg flex-shrink-0 leading-5" aria-label="party popper" role="img">🎉</span>
                </motion.div>
              ) : (
                <div className="w-full h-5 flex-shrink-0"></div>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-2xl font-bold">{timer.toFixed(1)}</span>
              <span className="text-sm">min</span>
            </div>
            <p className="text-xs text-green-500">Time to find with zKkeynest</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 