"use client";

import { useEffect, useRef, useState } from "react";
import Emblem from "./Emblem";
import Split from "./Split";
import { gsap, getLenis, prefersReducedMotion, ENTER_EVENT } from "@/lib/motion";

/**
 * Scene 00. Black warms to burgundy, a gold line is drawn, the emblem is
 * traced, the name assembles, light crosses the metal, and the doors part.
 * It holds only as long as the first frames of the showroom take to arrive.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    document.body.dataset.locked = "true";
    window.scrollTo(0, 0);
    getLenis()?.stop();

    const leave = (fast = false) => {
      if (finished.current) return;
      finished.current = true;
      tl.kill();
      delete document.body.dataset.locked;
      getLenis()?.start();
      window.dispatchEvent(new Event(ENTER_EVENT));
      gsap.set(el.querySelector(".pre-skip"), { autoAlpha: 0 });
      el.style.pointerEvents = "none";
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(el.querySelector(".pre-inner"), { opacity: 0, scale: 1.06, duration: fast ? 0.25 : 0.7, ease: "power2.in" })
        .to(el.querySelector(".pre-left"), { xPercent: -100, duration: fast ? 0.5 : 1.2, ease: "power4.inOut" }, "-=0.15")
        .to(el.querySelector(".pre-right"), { xPercent: 100, duration: fast ? 0.5 : 1.2, ease: "power4.inOut" }, "<");
    };

    const skip = () => leave(true);
    el.querySelector(".pre-skip")?.addEventListener("click", skip);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (prefersReducedMotion()) {
      gsap.set(el.querySelector(".pre-sub"), { opacity: 1 });
      gsap.set(el.querySelectorAll(".emblem-stroke"), { strokeDashoffset: 0 });
      tl.to({}, { duration: 0.9, onComplete: () => leave(true) });
    } else {
      tl.fromTo(el.querySelector(".pre-glow"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.6, ease: "sine.out" })
        .fromTo(el.querySelector(".pre-line"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.25)
        .fromTo(
          el.querySelectorAll(".emblem-stroke"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.5, stagger: 0.09, ease: "power2.inOut" },
          0.45,
        )
        .fromTo(
          el.querySelectorAll(".pre-name .split-char"),
          { yPercent: 110, rotate: 4 },
          { yPercent: 0, rotate: 0, duration: 0.95, stagger: 0.028 },
          1.15,
        )
        .fromTo(el.querySelector(".pre-sub"), { opacity: 0, letterSpacing: "0.9em" }, { opacity: 1, letterSpacing: "0.5em", duration: 1.1 }, 1.7)
        .fromTo(
          el.querySelector(".pre-name"),
          { backgroundPosition: "130% 0" },
          { backgroundPosition: "-30% 0", duration: 1.5, ease: "sine.inOut" },
          2.05,
        )
        .to({}, { duration: 0.25, onComplete: () => leave(false) });
    }

    // Never hold the visitor hostage if something stalls.
    const failsafe = window.setTimeout(() => leave(true), 7000);

    return () => {
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", onKey);
      tl.kill();
      delete document.body.dataset.locked;
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] text-gold-light" aria-label="Opening" role="dialog" aria-modal="true">
      <div className="pre-left absolute inset-y-0 left-0 w-[50.5%] bg-[#150308]" />
      <div className="pre-right absolute inset-y-0 right-0 w-[50.5%] bg-[#150308]" />
      <div className="pre-inner absolute inset-0 flex flex-col items-center justify-center px-6">
        <div
          className="pre-glow pointer-events-none absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(120,24,44,0.75) 0%, rgba(56,7,19,0.55) 38%, transparent 70%)" }}
        />
        <Emblem draw className="relative h-20 w-auto text-gold-light md:h-24 [&_.emblem-stroke]:[stroke-dasharray:1] [&_.emblem-stroke]:[stroke-dashoffset:1]" />
        <div className="pre-line hairline relative mt-7 w-40 origin-center md:w-56" />
        <p className="pre-name gold-text relative mt-7 text-center font-serif text-[clamp(1.9rem,6vw,4.4rem)] font-light uppercase leading-none tracking-[0.14em]">
          <span className="split-line">
            <Split text="Shree Sai" />
          </span>
          <span className="split-line mt-2">
            <Split text="Gold Palace" />
          </span>
        </p>
        <p className="pre-sub label relative mt-6 text-gold opacity-0">Malleshwaram · Bengaluru</p>
      </div>
      <button
        type="button"
        className="pre-skip label absolute bottom-7 right-7 border-b border-gold/50 pb-1 text-ivory/70 transition-colors hover:text-gold-light"
      >
        Skip intro
      </button>
    </div>
  );
}
