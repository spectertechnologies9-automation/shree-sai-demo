"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCompact = () => typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches;

/** Scroll to an element or an absolute Y, through Lenis when it is running. */
export function scrollToTarget(target: string | number | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const reduced = prefersReducedMotion();
  if (lenis) {
    lenis.scrollTo(target as never, {
      offset: opts.offset ?? 0,
      immediate: opts.immediate || reduced,
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    return;
  }
  let y = 0;
  if (typeof target === "number") y = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    y = el.getBoundingClientRect().top + window.scrollY;
  }
  window.scrollTo({ top: y + (opts.offset ?? 0), behavior: reduced || opts.immediate ? "auto" : "smooth" });
}

export const ENTER_EVENT = "ssgp:enter";
