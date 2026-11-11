"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, scrollToTarget, prefersReducedMotion } from "@/lib/motion";
import { BASE } from "@/lib/base";

type Layout = "tall" | "wide" | "split" | "inset";
type Collection = { id: string; name: string; img: string; alt: string; line: string; floor: string; layout: Layout; pos?: string };

// Only what the showroom film shows on display.
const collections: Collection[] = [
  { id: "chains", name: "Gold Chains", img: "chains", alt: "A wall of gold chains above a glass counter", line: "A wall of them, floor to ceiling, in every length.", floor: "Ground floor", layout: "wide" },
  { id: "necklaces", name: "Necklaces", img: "necklaces", alt: "Gold necklaces on busts in lit stone niches", line: "From everyday strands to pieces that need a niche to themselves.", floor: "Ground floor", layout: "tall", pos: "50% 30%" },
  { id: "rings", name: "Rings", img: "rings", alt: "Trays of gold rings beneath counter glass", line: "Tray after tray beneath the glass.", floor: "Ground floor", layout: "inset" },
  { id: "earrings", name: "Earrings", img: "earrings", alt: "A wall of gold earrings on black boards", line: "Hundreds of pairs, arranged to be browsed.", floor: "Ground floor", layout: "split" },
  { id: "bangles", name: "Bangles", img: "bangles", alt: "Bangles and bracelets in a brass-framed glass case by the staircase", line: "A brass-framed island case at the foot of the stairs.", floor: "Ground floor", layout: "wide", pos: "60% 50%" },
  { id: "silver", name: "Silver", img: "silverware", alt: "Shelves of silver vessels, lamps and plates", line: "Lamps, vessels and plates, for the home and the altar.", floor: "First floor", layout: "inset" },
  { id: "diamonds", name: "Diamonds", img: "diamonds", alt: "The Diamonds wall: necklaces on black busts under gold cove lighting", line: "A gallery of its own, quieter and cooler than the rooms below.", floor: "Second floor", layout: "tall" },
  { id: "bridal", name: "Bridal", img: "bridal", alt: "Bridal gold necklace sets in a lit recess in the Bridal Section", line: "A private room for the most considered purchase of all.", floor: "Second floor", layout: "wide" },
];

const frame: Record<Layout, string> = {
  wide: "w-[78vw] md:w-[62vw]",
  tall: "w-[78vw] md:w-[34vw]",
  inset: "w-[78vw] md:w-[44vw]",
  split: "w-[78vw] md:w-[52vw]",
};
const media: Record<Layout, string> = {
  wide: "aspect-[16/10] md:h-[58vh] md:aspect-auto",
  tall: "aspect-[4/5] md:h-[72vh] md:aspect-auto",
  inset: "aspect-[4/3] md:h-[48vh] md:aspect-auto md:mt-[14vh]",
  split: "aspect-[3/2] md:h-[62vh] md:aspect-auto",
};

/**
 * Scene 04. An editorial gallery, not a product grid: the page turns sideways
 * and the eight collections on show pass like plates in a book, each cut to a
 * different proportion, each photograph drifting inside its own mask.
 */
export default function Collections() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 821px)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance() * 0.62}`,
          pin: true,
          scrub: prefersReducedMotion() ? true : 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const panels = tr.querySelectorAll<HTMLElement>(".col-panel");
            const centre = self.progress * distance() + window.innerWidth / 2;
            let i = 0;
            panels.forEach((p, k) => { if (p.offsetLeft <= centre) i = k; });
            setActive((prev) => (prev === i ? prev : i));
          },
        },
      });
      trigger.current = tween.scrollTrigger ?? null;

      tr.querySelectorAll<HTMLElement>(".col-panel").forEach((panel, i) => {
        const img = panel.querySelector(".col-img");
        const name = panel.querySelector(".col-name");
        const st = { trigger: panel, containerAnimation: tween, start: "left right", end: "right left", scrub: true };
        // photograph slides inside its mask; alternate panels drift on a different axis
        gsap.fromTo(img, i % 2 ? { yPercent: -7, scale: 1.16 } : { xPercent: -8, scale: 1.16 }, { ...(i % 2 ? { yPercent: 7 } : { xPercent: 8 }), ease: "none", scrollTrigger: st });
        gsap.fromTo(name, { xPercent: 22 }, { xPercent: -22, ease: "none", scrollTrigger: st });
        gsap.fromTo(
          panel.querySelector(".col-mask"),
          { clipPath: i % 2 ? "inset(0 0 100% 0)" : "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0% 0)", ease: "power2.out", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 95%", end: "left 45%", scrub: true } },
        );
      });
      return () => { trigger.current = null; };
    });

    mm.add("(max-width: 820px)", () => {
      tr.querySelectorAll<HTMLElement>(".col-panel").forEach((panel, i) => {
        gsap.fromTo(
          panel.querySelector(".col-mask"),
          { clipPath: i % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0%)", ease: "power2.out", scrollTrigger: { trigger: panel, start: "top 88%", end: "top 45%", scrub: 0.4 } },
        );
        gsap.fromTo(panel.querySelector(".col-img"), { yPercent: -6, scale: 1.14 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true } });
        ScrollTrigger.create({ trigger: panel, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setActive(i) });
      });
    });

    return () => mm.revert();
  }, []);

  const jump = (i: number) => {
    const panel = track.current?.querySelectorAll<HTMLElement>(".col-panel")[i];
    if (!panel) return;
    const st = trigger.current;
    if (st && track.current) {
      const distance = track.current.scrollWidth - window.innerWidth;
      const x = Math.min(distance, Math.max(0, panel.offsetLeft - (window.innerWidth - panel.offsetWidth) / 2));
      scrollToTarget(st.start + (x / distance) * (st.end - st.start));
    } else {
      scrollToTarget(panel, { offset: -90 });
    }
  };

  return (
    <section ref={root} id="collections" data-nav="light" className="relative z-10 overflow-x-clip bg-ivory text-wine-deep">
      <div className="relative md:flex md:h-screen md:items-center md:overflow-hidden">
        <div ref={track} className="flex flex-col gap-20 px-5 pb-24 pt-28 md:h-full md:w-max md:flex-row md:items-center md:gap-[9vw] md:px-0 md:pb-16 md:pl-[8vw] md:pr-[14vw] md:pt-24 will-change-transform">
          <header className="shrink-0 md:w-[34vw]">
            <p className="label mb-6 text-gold-dark">The collections</p>
            <h2 className="font-serif text-[clamp(3rem,6.2vw,6.6rem)] font-light leading-[0.92]">
              Eight rooms
              <br />
              <span className="italic text-wine">of one house.</span>
            </h2>
            <p className="mt-8 max-w-sm text-[0.95rem] leading-relaxed text-wine-deep/70">
              What you will find on display at Malleshwaram, in the order the showroom reveals it. Designs change with the seasons; the best way to see today's is in person.
            </p>
          </header>

          {collections.map((c, i) => (
            <article key={c.id} id={`collection-${c.id}`} className={`col-panel relative shrink-0 ${frame[c.layout]}`}>
              <p aria-hidden className="col-name pointer-events-none absolute -top-[0.62em] left-0 z-10 whitespace-nowrap font-serif text-[clamp(3.4rem,9vw,9.5rem)] font-light leading-none text-wine mix-blend-multiply max-md:-top-[0.5em] max-md:text-[17vw]">
                {c.name}
              </p>
              <div className={`col-mask relative overflow-hidden ${media[c.layout]}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${BASE}/img/${c.img}-1000.webp`}
                  srcSet={`${BASE}/img/${c.img}-1000.webp 1000w, ${BASE}/img/${c.img}-2000.webp 2000w`}
                  sizes="(max-width: 820px) 80vw, 60vw"
                  alt={c.alt}
                  loading="lazy"
                  decoding="async"
                  className="col-img h-full w-full object-cover"
                  style={{ objectPosition: c.pos ?? "50% 50%" }}
                />
              </div>
              <div className={`mt-5 flex items-start justify-between gap-6 ${c.layout === "split" ? "md:flex-row-reverse md:text-right" : ""}`}>
                <div>
                  <h3 className="font-serif text-3xl font-normal">{c.name}</h3>
                  <p className="mt-2 max-w-xs text-[0.92rem] leading-relaxed text-wine-deep/70">{c.line}</p>
                </div>
                <p className="label shrink-0 pt-2 text-gold-dark">
                  {String(i + 1).padStart(2, "0")} · {c.floor}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* category navigation */}
        <nav aria-label="Collections" className="no-scrollbar sticky bottom-0 z-20 flex gap-6 overflow-x-auto border-t border-wine/15 bg-ivory/90 px-5 py-4 backdrop-blur md:absolute md:inset-x-0 md:bottom-0 md:justify-center md:gap-9 md:border-0 md:bg-transparent md:py-6 md:backdrop-blur-none">
          {collections.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jump(i)}
              aria-current={active === i ? "true" : undefined}
              data-cursor="link"
              className={`label relative shrink-0 py-2 transition-colors duration-500 ${active === i ? "text-wine" : "text-wine-deep/45 hover:text-wine"}`}
            >
              {c.name}
              <span className={`absolute inset-x-0 bottom-0 h-px origin-left bg-gold-dark transition-transform duration-500 ease-palace ${active === i ? "scale-x-100" : "scale-x-0"}`} />
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
