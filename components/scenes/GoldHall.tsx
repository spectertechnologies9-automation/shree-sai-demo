"use client";

import { useEffect, useRef, useState } from "react";
import SeqCanvas, { type SeqHandle } from "../SeqCanvas";
import Hotspot from "../Hotspot";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import seq from "@/public/seq/meta.json";
import { BASE } from "@/lib/base";

const COUNT = seq.gold.count;
const marks = seq.gold.marks;

// What the camera actually passes on the ground floor, in order.
const stops = [
  {
    name: "The Gold Hall",
    word: "Gold",
    line: "One long room, counters on both sides, a chair at every one.",
    spot: { x: 52, y: 50, title: "A seat at the counter", body: "Every counter is lined with chairs. Sit, ask to see a piece out of its case, and take the time a decision like this deserves." },
  },
  {
    name: "Chains",
    word: "Chains",
    line: "Hung by length, row above row, the whole height of the wall.",
    spot: { x: 66, y: 36, title: "The chain wall", body: "Gold chains displayed in full view rather than in drawers, so lengths and patterns can be compared side by side." },
  },
  {
    name: "Rings",
    word: "Rings",
    line: "Trays under glass, lit from above, close enough to study.",
    spot: { x: 44, y: 56, title: "Under glass", body: "Finger rings are laid out in trays beneath the counter glass. Ask, and a tray comes up to the counter." },
  },
  {
    name: "Necklaces",
    word: "Necklaces",
    line: "Each of the larger sets is given a niche and a lamp of its own.",
    spot: { x: 50, y: 34, title: "The lit niches", body: "Statement necklaces stand on busts in dark stone alcoves, each under its own lamp, set apart from the main wall." },
  },
  {
    name: "Earrings",
    word: "Earrings",
    line: "Pairs by the hundred, arranged so the eye can travel.",
    spot: { x: 58, y: 44, title: "The earring wall", body: "Studs, drops and jhumka-style pairs are carded and arranged across a full wall of black display boards." },
  },
];

/** Scene 02. The ground-floor gold hall, shot by shot, with an index that keeps place. */
export default function GoldHall() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<SeqHandle>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => {
          canvas.current?.set(state.p);
          const frame = state.p * (COUNT - 1);
          let i = 0;
          for (let k = 0; k < marks.length; k++) if (frame >= marks[k] - 1) i = k;
          setActive((prev) => (prev === i ? prev : i));
        },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.9 },
      });

      ScrollTrigger.create({
        trigger: el,
        start: "top 30%",
        end: "bottom 70%",
        onToggle: (self) => setLive(self.isActive),
      });

      // Giant word drifts sideways with the walk
      gsap.fromTo(q(".gold-word"), { xPercent: 8 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 1 } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="gold" data-nav="dark" className="relative z-10 h-[400vh] max-md:h-[340vh]">
      <div className="gold-stage stage sticky top-0 overflow-hidden bg-ink shadow-[0_-40px_80px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BASE}/img/hall-1000.webp)` }}>
          <SeqCanvas ref={canvas} name="gold" count={COUNT} className="h-full w-full" alt="The ground-floor gold hall: chains, rings, necklaces and earrings on display" />
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(9,8,7,0.78) 0%, rgba(9,8,7,0.25) 38%, rgba(9,8,7,0) 60%), linear-gradient(0deg, rgba(9,8,7,0.7) 0%, rgba(9,8,7,0) 35%)" }} />

        {/* outlined word, one per stop */}
        <div className="gold-word pointer-events-none absolute inset-x-0 bottom-[4%] overflow-hidden whitespace-nowrap text-center font-serif text-[22vw] font-light uppercase leading-[0.8] max-md:bottom-[30%]">
          {stops.map((s, i) => (
            <span
              key={s.word}
              aria-hidden
              className={`absolute inset-x-0 bottom-0 transition-[opacity,transform] duration-700 ease-palace [-webkit-text-stroke:1px_rgba(227,199,141,0.55)] text-transparent ${
                active === i ? "translate-y-0 opacity-100" : i < active ? "-translate-y-[30%] opacity-0" : "translate-y-[30%] opacity-0"
              }`}
            >
              {s.word}
            </span>
          ))}
          <span className="invisible">Necklaces</span>
        </div>

        {/* index */}
        <div className="absolute left-5 top-[22%] md:left-10 md:top-[26%]">
          <p className="label mb-6 text-gold-light">Ground floor</p>
          <ol className="flex flex-col gap-2 max-md:hidden">
            {stops.map((s, i) => (
              <li key={s.name} className={`flex items-baseline gap-4 font-serif text-2xl font-light transition-[opacity,transform,color] duration-500 ease-palace ${active === i ? "translate-x-3 text-ivory opacity-100" : "text-ivory opacity-35"}`}>
                <span className="label w-6 text-gold">{String(i + 1).padStart(2, "0")}</span>
                {s.name}
              </li>
            ))}
          </ol>
          <p className="label text-ivory md:hidden">
            <span className="text-gold">{String(active + 1).padStart(2, "0")}</span> / 05 · {stops[active].name}
          </p>
        </div>

        {/* line of copy for the current stop */}
        <div className="absolute bottom-[9%] left-5 right-5 md:bottom-[30%] md:left-10 md:right-auto md:max-w-sm">
          {stops.map((s, i) => (
            <p
              key={s.name}
              aria-hidden={active !== i}
              className={`font-serif text-[clamp(1.35rem,2.1vw,1.9rem)] font-light leading-snug text-ivory transition-[opacity,clip-path] duration-700 ease-palace ${
                i === 0 ? "relative" : "absolute inset-x-0 bottom-0"
              } ${active === i ? "opacity-100 [clip-path:inset(0)]" : "opacity-0 [clip-path:inset(0_0_100%_0)]"}`}
            >
              {s.line}
            </p>
          ))}
        </div>

        {stops.map((s, i) => (
          <Hotspot
            key={s.name}
            {...s.spot}
            kicker={s.name}
            active={live && active === i}
            className={`transition-opacity duration-500 ${live && active === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          />
        ))}
      </div>
    </section>
  );
}
