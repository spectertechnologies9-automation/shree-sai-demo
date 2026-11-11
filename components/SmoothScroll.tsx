"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, setLenis, prefersReducedMotion } from "@/lib/motion";

/**
 * One scroll engine for the whole page: Lenis smooths the wheel on desktop,
 * GSAP's ticker drives it, ScrollTrigger reads from it. Touch devices and
 * reduced-motion visitors keep native scrolling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Scenes register their triggers at different moments (the 3D scene waits
    // for a capability check), so put them back in page order and re-measure
    // once everything has mounted and again when the webfonts settle.
    const settle = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    const settleTimer = window.setTimeout(settle, 400);
    document.fonts?.ready.then(settle).catch(() => undefined);

    if (prefersReducedMotion() || coarse) {
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => {
        window.clearTimeout(settleTimer);
        window.removeEventListener("load", refresh);
      };
    }

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 1, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
