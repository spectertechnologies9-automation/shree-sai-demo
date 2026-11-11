"use client";

import { useEffect, useRef, useState } from "react";
import SeqCanvas, { type SeqHandle } from "../SeqCanvas";
import Hotspot from "../Hotspot";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import seq from "@/public/seq/meta.json";
import { BASE } from "@/lib/base";

const COUNT = seq.ascend.count;
const marks = seq.ascend.marks;

const stops = [
  { level: 0, name: "The staircase", line: "Dark stone treads, glass, and a rail of polished brass.", spot: { x: 38, y: 62, title: "Brass and glass", body: "An open staircase rises through the middle of the showroom, so each floor stays in view of the last. A lift stands beside it." } },
  { level: 1, name: "Silver", line: "The first floor opens onto silver, bright against charcoal shelves.", spot: { x: 60, y: 40, title: "The silver floor", body: "Vessels, lamps, plates and framed pieces, with counters and seating running the length of the room." } },
  { level: 2, name: "The diamond gallery", line: "Above it, a cooler, quieter room.", spot: { x: 62, y: 42, title: "Framed, one at a time", body: "Along the wall, single necklaces are set into deep frames, each with its own lamp and nameplate." } },
  { level: 2, name: "Diamonds", line: "The wall the gallery is named for.", spot: { x: 50, y: 50, title: "The Diamonds wall", body: "Three tiers of necklaces and earrings on black busts, washed by a line of warm cove light." } },
  { level: 2, name: "Bridal section", line: "And behind glass, a room kept for brides.", spot: { x: 50, y: 46, title: "The Bridal Section", body: "A glazed room apart from the floor, with standing mirrors, a table to sit at, and the sets shown complete." } },
];
const levels = ["Ground", "First", "Second"];

const lobbySpots = [
  { x: 44, y: 18, title: "The chandelier", body: "Tiered rings of crystal hang through the double-height entrance, visible again from the floor above.", kicker: "Overhead" },
  { x: 76, y: 60, title: "The shrine", body: "Behind the reception desk, a small shrine is dressed with fresh flowers.", kicker: "At the desk" },
  { x: 27, y: 66, title: "Carved Ganesha", body: "A dark, carved wooden Ganesha stands just inside the door, the first thing a visitor passes.", kicker: "At the threshold" },
];

/** Scene 05. Up through the building by its staircase, then a still moment in the lobby with points of interest. */
export default function Floors() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<SeqHandle>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const [lobbyLive, setLobbyLive] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      const climb = q(".climb")[0];
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
        scrollTrigger: { trigger: climb, start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.9 },
      });
      ScrollTrigger.create({ trigger: climb, start: "top 30%", end: "bottom 70%", onToggle: (s) => setLive(s.isActive) });

      // the frame itself rises: picture slides in from below inside a fixed window
      gsap.fromTo(q(".climb-frame"), { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: climb, start: "top 60%", end: "top top", scrub: true } });

      // Lobby still: the image opens as a circle from the chandelier, then drifts
      const lobby = q(".lobby")[0];
      gsap.fromTo(q(".lobby-img"), { clipPath: "circle(8% at 44% 18%)" }, { clipPath: "circle(120% at 44% 18%)", ease: "power1.inOut", scrollTrigger: { trigger: lobby, start: "top 75%", end: "top 5%", scrub: 0.6 } });
      gsap.fromTo(q(".lobby-img img"), { scale: 1.12, yPercent: -3 }, { scale: 1, yPercent: 3, ease: "none", scrollTrigger: { trigger: lobby, start: "top bottom", end: "bottom top", scrub: true } });
      ScrollTrigger.create({ trigger: lobby, start: "top 35%", end: "bottom 40%", onToggle: (s) => setLobbyLive(s.isActive) });
    }, el);
    return () => ctx.revert();
  }, []);

  const level = stops[active].level;

  return (
    <section ref={root} id="floors" data-nav="dark" className="relative z-10 bg-wine-deep">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:px-10 md:pt-44">
        <p className="label mb-6 text-gold">The building</p>
        <h2 className="max-w-3xl font-serif text-[clamp(2.6rem,6vw,6rem)] font-light leading-[0.95] text-ivory">
          Three floors, <span className="italic gold-text">one staircase.</span>
        </h2>
      </div>

      <div className="climb relative h-[380vh] max-md:h-[330vh]">
        <div className="stage sticky top-0 overflow-hidden">
          <div className="climb-frame absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BASE}/img/stairs-1000.webp)` }}>
            <SeqCanvas ref={canvas} name="ascend" count={COUNT} className="h-full w-full" alt="Climbing the staircase from the gold hall to the silver floor, the diamond gallery and the bridal section" />
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(9,8,7,0.7) 0%, rgba(9,8,7,0) 40%), linear-gradient(0deg, rgba(9,8,7,0.75) 0%, rgba(9,8,7,0) 38%)" }} />
          </div>

          {/* lift-style floor indicator */}
          <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col-reverse items-end gap-5 md:right-[13rem]" aria-label={`${levels[level]} floor`} role="status">
            {levels.map((l, i) => (
              <div key={l} className={`flex items-center gap-4 transition-opacity duration-500 ${level === i ? "opacity-100" : "opacity-35"}`}>
                <span className="label text-ivory max-md:hidden">{l} floor</span>
                <span className={`grid place-items-center border font-serif transition-all duration-700 ease-palace ${level === i ? "h-14 w-14 border-gold-light bg-wine/70 text-2xl text-gold-light" : "h-9 w-9 border-ivory/40 text-base text-ivory"}`}>
                  {i === 0 ? "G" : i}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-[10%] left-5 right-24 md:left-10 md:max-w-md">
            {stops.map((s, i) => (
              <div
                key={s.name}
                aria-hidden={active !== i}
                className={`transition-[opacity,transform] duration-700 ease-palace ${i === 0 ? "relative" : "absolute inset-x-0 bottom-0"} ${
                  active === i ? "translate-y-0 opacity-100" : i < active ? "-translate-y-8 opacity-0" : "translate-y-8 opacity-0"
                }`}
              >
                <p className="label mb-3 text-gold-light">{s.name}</p>
                <p className="font-serif text-[clamp(1.5rem,2.6vw,2.4rem)] font-light leading-[1.12] text-ivory">{s.line}</p>
              </div>
            ))}
          </div>

          {stops.map((s, i) => (
            <Hotspot key={s.name} {...s.spot} kicker={s.name} active={live && active === i} className={`transition-opacity duration-500 ${live && active === i ? "opacity-100" : "pointer-events-none opacity-0"}`} />
          ))}
        </div>
      </div>

      {/* A still moment, with points of interest */}
      <div className="lobby relative px-5 py-24 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-7xl items-end gap-10 md:grid-cols-[1fr_2.4fr]">
          <div>
            <p className="label mb-5 text-gold">Before you leave</p>
            <h3 className="font-serif text-[clamp(2rem,3.6vw,3.6rem)] font-light leading-none text-ivory">Look again at the lobby.</h3>
            <p className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-ivory/65">Three details most visitors pass on the way in. Select a marker to read about each.</p>
          </div>
          <div className="lobby-img relative aspect-[16/10] overflow-hidden max-md:aspect-[4/5]" style={{ clipPath: "circle(8% at 44% 18%)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE}/img/lobby-1000.webp`} srcSet={`${BASE}/img/lobby-1000.webp 1000w, ${BASE}/img/lobby-2000.webp 2000w`} sizes="(max-width: 820px) 100vw, 70vw" alt="The double-height lobby with its crystal chandelier, reception desk and shrine" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
            {lobbySpots.map((s) => (
              <Hotspot key={s.title} {...s} active={lobbyLive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
