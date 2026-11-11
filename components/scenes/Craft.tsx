"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Split from "../Split";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { BASE } from "@/lib/base";

export type Piece = { src: string; small: string; aspect: number; where: string; title: string; body: string };

// Four frames lifted straight from the showroom film. Captions describe only what the camera shows.
const pieces: Piece[] = [
  {
    src: BASE + "/img/macro-busts-1600.webp",
    small: BASE + "/img/macro-busts-800.webp",
    aspect: 1.587,
    where: "First floor",
    title: "Row on row",
    body: "Stone-set necklaces with their matching earrings, each on its own bust, shelved like a library.",
  },
  {
    src: BASE + "/img/macro-heritage-1200.webp",
    small: BASE + "/img/macro-heritage-700.webp",
    aspect: 0.71,
    where: "Ground floor",
    title: "A niche of its own",
    body: "A long beaded necklace and pendant, given an alcove, a lamp and the house name beneath it.",
  },
  {
    src: BASE + "/img/macro-niche-1400.webp",
    small: BASE + "/img/macro-niche-800.webp",
    aspect: 0.936,
    where: "Second floor",
    title: "Set against stone",
    body: "In the diamond gallery, single pieces are framed in dark veined stone and lit from directly above.",
  },
  {
    src: BASE + "/img/macro-bridal-1600.webp",
    small: BASE + "/img/macro-bridal-800.webp",
    aspect: 1.587,
    where: "Bridal section",
    title: "The bridal window",
    body: "Full gold sets, shown together the way they are worn together, glowing in a single lit recess.",
  },
];

const CraftStage = dynamic(() => import("./CraftStage"), { ssr: false });

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Scene 03. The room goes dark and the camera travels, in real 3D, past four
 * pieces photographed in the showroom. A lamp follows the pointer across the
 * metal. Phones, reduced-motion and non-WebGL browsers get the same four
 * pieces as a lit, stacked sequence.
 */
export default function Craft() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [mode, setMode] = useState<"pending" | "3d" | "flat">("pending");
  const [near, setNear] = useState(false);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 820px)").matches;
    setMode(!compact && !prefersReducedMotion() && canWebGL() ? "3d" : "flat");
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || mode === "pending") return;
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      // Title: letters rise out of the dark as the scene takes over
      gsap.fromTo(
        q(".craft-title .split-char"),
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.02, ease: "power3.out", scrollTrigger: { trigger: q(".craft-intro")[0], start: "top 70%", end: "top 20%", scrub: 0.6 } },
      );

      if (mode === "3d") {
        ScrollTrigger.create({ trigger: el, start: "top 150%", end: "bottom -50%", onToggle: (s) => s.isActive && setNear(true) });
        ScrollTrigger.create({ trigger: q(".craft-track")[0], start: "top bottom", end: "bottom top", onToggle: (s) => setRunning(s.isActive) });
        ScrollTrigger.create({
          trigger: q(".craft-track")[0],
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => {
            progress.current = s.progress;
            const i = Math.round(s.progress * (pieces.length - 1));
            setActive((prev) => (prev === i ? prev : i));
          },
        });
      } else {
        // Flat mode: each photograph opens from a slit of light
        q(".flat-piece").forEach((item) => {
          gsap.fromTo(
            item.querySelector(".flat-img"),
            { clipPath: "inset(46% 0 46% 0)", filter: "brightness(1.6)" },
            { clipPath: "inset(0% 0 0% 0)", filter: "brightness(1)", ease: "power2.out", scrollTrigger: { trigger: item, start: "top 85%", end: "top 35%", scrub: 0.5 } },
          );
        });
      }
    }, el);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section ref={root} id="craft" data-nav="dark" className="grain relative z-10 bg-[#0b0506]">
      <div className="craft-intro mx-auto flex min-h-[55vh] max-w-5xl flex-col items-center justify-center px-6 pb-10 pt-32 text-center">
        <p className="label mb-6 text-gold">In detail</p>
        <h2 className="craft-title font-serif text-[clamp(2.6rem,7vw,6.5rem)] font-light leading-[0.95] text-ivory">
          <span className="split-line"><Split text="Stay with one piece" /></span>
          <span className="split-line italic gold-chars"><Split text="a little longer." /></span>
        </h2>
        <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-ivory/65">
          Four moments from the showroom floor, as the camera found them. Nothing here is staged for the screen.
        </p>
      </div>

      {mode === "3d" ? (
        <div className="craft-track relative h-[300vh]">
          <div className="stage sticky top-0 overflow-hidden">
            <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 50%, #2a0810 0%, #0b0506 75%)" }} />
            {near ? <div className="absolute inset-0"><CraftStage pieces={pieces} progress={progress} running={running} /></div> : null}

            {pieces.map((p, i) => (
              <div
                key={p.src}
                aria-hidden={active !== i}
                className={`pointer-events-none absolute top-1/2 w-[min(22rem,30vw)] -translate-y-1/2 transition-[opacity,transform] duration-700 ease-palace ${
                  i % 2 === 0 ? "left-[7vw]" : "right-[9vw]"
                } ${active === i ? "translate-x-0 opacity-100 delay-200" : `${i % 2 === 0 ? "-translate-x-6" : "translate-x-6"} opacity-0`}`}
              >
                <p className="label mb-4 text-gold">
                  {String(i + 1).padStart(2, "0")} — {p.where}
                </p>
                <h3 className="font-serif text-[clamp(2rem,3.4vw,3.4rem)] font-light leading-none text-ivory">{p.title}</h3>
                <div className="hairline my-5 w-24" />
                <p className="text-[0.95rem] leading-relaxed text-ivory/70">{p.body}</p>
              </div>
            ))}
            <p className="label pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/40">Move the pointer to move the light</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-24 px-5 pb-28 pt-6 md:mx-auto md:max-w-3xl">
          {pieces.map((p, i) => (
            <figure key={p.src} className="flat-piece">
              <div className="flat-img relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.small} alt={`${p.title}: ${p.body}`} loading="lazy" decoding="async" className="w-full" style={{ aspectRatio: p.aspect }} />
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_40px_#0b0506]" />
              </div>
              <figcaption className="mt-6">
                <p className="label mb-3 text-gold">
                  {String(i + 1).padStart(2, "0")} — {p.where}
                </p>
                <h3 className="font-serif text-4xl font-light text-ivory">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory/70">{p.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
