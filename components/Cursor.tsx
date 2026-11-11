"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/** Desktop-only cursor: a gold ring that trails the pointer and opens over interactive things. */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion() || !ring.current || !dot.current) return;
    document.documentElement.classList.add("has-cursor");

    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08 });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([ring.current, dot.current], { x: e.clientX, y: e.clientY });
        gsap.to([ring.current, dot.current], { opacity: 1, duration: 0.4 });
      }
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
      const hit = (e.target as HTMLElement | null)?.closest?.("a, button, [data-cursor]");
      ring.current?.classList.toggle("is-active", !!hit);
    };
    const leave = () => {
      shown = false;
      gsap.to([ring.current, dot.current], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={ring}
        className="absolute -ml-[18px] -mt-[18px] h-9 w-9 rounded-full border border-gold-light opacity-0 transition-[width,height,margin,background-color] duration-500 ease-palace [&.is-active]:-ml-[30px] [&.is-active]:-mt-[30px] [&.is-active]:h-[60px] [&.is-active]:w-[60px] [&.is-active]:bg-gold-light/10"
      />
      <div ref={dot} className="absolute -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-gold-light opacity-0" />
    </div>
  );
}
