"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Appended after the number, e.g. "%". Kept as a plain string (not a
   * formatter function) so this component stays callable from Server
   * Components — functions can't cross the server/client boundary. */
  suffix?: string;
  decimals?: number;
  className?: string;
  durationSeconds?: number;
}

function formatValue(value: number, decimals: number, suffix: string): string {
  const rounded =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  return `${rounded}${suffix}`;
}

export function AnimatedNumber({
  value,
  suffix = "",
  decimals = 0,
  className,
  durationSeconds = 1.1,
}: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: durationSeconds,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = formatValue(latest, decimals, suffix);
      },
    });

    return () => controls.stop();
  }, [value, suffix, decimals, durationSeconds]);

  return (
    <span ref={spanRef} className={className}>
      {formatValue(0, decimals, suffix)}
    </span>
  );
}
