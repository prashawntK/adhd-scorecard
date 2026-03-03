"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  type?: "basic" | "celebration" | "milestone";
}

export function Confetti({ trigger, type = "basic" }: ConfettiProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!trigger || firedRef.current) return;
    firedRef.current = true;

    if (type === "milestone") {
      // Big celebration
      const end = Date.now() + 3000;
      const colors = ["#F97316", "#EC4899", "#F59E0B", "#22C55E", "#38BDF8"];
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } else if (type === "celebration") {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#F97316", "#22C55E", "#F59E0B"] });
    } else {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }

    return () => { firedRef.current = false; };
  }, [trigger, type]);

  return null;
}
