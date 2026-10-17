"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

const format = (value: number, decimals: number, prefix: string, suffix: string) =>
  `${prefix}${value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const box = element.getBoundingClientRect();

    if (box.top < window.innerHeight && box.bottom > 0) {
      return;
    }

    let frame = 0;
    element.textContent = format(0, decimals, prefix, suffix);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - progress) ** 3;

          element.textContent = format(value * eased, decimals, prefix, suffix);

          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = format(value, decimals, prefix, suffix);
    };
  }, [value, decimals, prefix, suffix, duration]);

  return (
    <span key={value} ref={ref} className={cn("tabular-nums", className)}>
      {format(value, decimals, prefix, suffix)}
    </span>
  );
}
