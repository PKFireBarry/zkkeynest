"use client";
import React, { useEffect, useRef, useState } from "react";

interface TimerProps {
  target: number;
  duration?: number; // ms
  suffix?: string;
  colorClass?: string;
  label: string;
  trigger?: number | string;
}

const Timer: React.FC<TimerProps> = ({
  target,
  duration = 1200,
  suffix = "",
  colorClass = "",
  label,
  trigger = 0,
}) => {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    setValue(0);
    start.current = null;
    function animate(ts: number) {
      if (start.current === null) start.current = ts;
      const elapsed = ts - start.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(progress * target);
      setValue(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    }
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, trigger]);

  return (
    <div className="flex flex-col items-center" aria-live="polite">
      <span className={`text-3xl font-bold ${colorClass}`}>{value}{suffix}</span>
      <span className={`text-xs ${colorClass} mt-1`}>{label}</span>
    </div>
  );
};

export default Timer; 