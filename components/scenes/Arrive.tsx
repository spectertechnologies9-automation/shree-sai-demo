"use client";

import { useEffect, useRef } from "react";
import SeqCanvas, { type SeqHandle } from "../SeqCanvas";
import Split from "../Split";
import { gsap, ENTER_EVENT, prefersReducedMotion, isCompact } from "@/lib/motion";
import seq from "@/public/seq/meta.json";
import { BASE } from "@/lib/base";

const COUNT = seq.arrive.count;
// where each shot starts, as a fraction of the scene
const at = (i: number) => seq.arrive.marks[i] / (COUNT - 1);

const ARCH = "inset(16% 31% 0% 31% round 50vw 50vw 0 0)";
const ARCH_COMPACT = "inset(27% 13% 0% 13% round 50vw 50vw 0 0)";

/**
 * Scene 01. The fascia lettering is seen through a palace arch; scrolling
 * opens the arch to the full frame and walks the visitor from Sampige Road,
 * up the steps, through the glass doors and under the chandelier.
 */
export default function Arrive() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<SeqHandle>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      // Entrance of the title once the opening doors part
      const intro = gsap.timeline({ paused: true });
      if (reduced) {
        gsap.set(q(".hero-fade"), { opacity: 1 });
      } else {
        intro
          .fromTo(q(".hero-title .split-char"), { yPercent: 120 }, { yPercent: 0, duration: 1.3, stagger: 0.025, ease: "power4.out" }, 0.25)
          .fromTo(q(".hero-fade"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power2.out" }, 0.9)
          .fromTo(q(".hero-arch"), { scale: 1.12 }, { scale: 1, duration: 2.2, ease: "power3.out" }, 0);
      }
      const play = () => intro.play();
      window.addEventListener(ENTER_EVENT, play, { once: true });

      // Frame scrubbing
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => canvas.current?.set(state.p),
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.9 },
      });

      // Choreography
      gsap.set(q(".beat-2 .split-word"), { yPercent: 110 });
      gsap.set(q(".beat-1, .beat-3a, .beat-3b, .beat-5"), { opacity: 0 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: reduced ? true : 1 },
      });

      // 0 → .14 : the arch opens into the full frame, the title parts
      tl.fromTo(
        q(".hero-arch"),
        { clipPath: isCompact() ? ARCH_COMPACT : ARCH },
        { clipPath: "inset(0% 0% 0% 0% round 0vw 0vw 0 0)", duration: 0.14, ease: "power2.inOut" },
        0,
      )
        .to(q(".hero-title-l"), { xPercent: -60, opacity: 0, duration: 0.1 }, 0)
        .to(q(".hero-title-r"), { xPercent: 60, opacity: 0, duration: 0.1 }, 0)
        .to(q(".hero-meta"), { opacity: 0, duration: 0.05 }, 0)
        .fromTo(q(".hero-shade"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.05);

      // Beat 1 — the address, letter-spacing settling like a sign being read
      tl.fromTo(q(".beat-1"), { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.32em", duration: 0.05 }, 0.1)
        .to(q(".beat-1"), { opacity: 0, duration: 0.03 }, at(1) - 0.02);

      // Beat 2 — facade: a line unmasks from below
      tl.fromTo(q(".beat-2 .split-word"), { yPercent: 110 }, { yPercent: 0, duration: 0.05, stagger: 0.006, ease: "power2.out" }, at(1) + 0.02)
        .to(q(".beat-2"), { opacity: 0, duration: 0.03 }, at(2) - 0.03);

      // Beat 3 — doors: two words slide apart like the glass
      tl.fromTo(q(".beat-3a"), { xPercent: 40, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.05, ease: "power2.out" }, at(2) + 0.01)
        .fromTo(q(".beat-3b"), { xPercent: -40, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.05, ease: "power2.out" }, at(2) + 0.01)
        .to(q(".beat-3a"), { xPercent: -30, opacity: 0, duration: 0.04 }, at(3) - 0.04)
        .to(q(".beat-3b"), { xPercent: 30, opacity: 0, duration: 0.04 }, at(3) - 0.04);

      // Beat 4 — lobby: copy wipes in from the left edge
      tl.fromTo(q(".beat-4"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.06, ease: "power2.out" }, at(3) + 0.02)
        .to(q(".beat-4"), { opacity: 0, duration: 0.03 }, at(4) - 0.03);

      // Beat 5 — chandelier: the line descends with the light
      tl.fromTo(q(".beat-5"), { opacity: 0, yPercent: -60 }, { opacity: 1, yPercent: 0, duration: 0.06, ease: "power2.out" }, at(4) + 0.02)
        .to(q(".hero-shade"), { opacity: 0.55, duration: 0.08 }, 0.9)
        .to(q(".scroll-cue"), { opacity: 0, duration: 0.03 }, 0.04);

      return () => window.removeEventListener(ENTER_EVENT, play);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="arrive" data-nav="dark" className="relative h-[400vh] bg-wine-deep max-md:h-[340vh]">
      <div className="stage sticky top-0 overflow-hidden">
        {/* burgundy field behind the arch */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 100%, #4A0C1B 0%, #380713 38%, #21040B 100%)" }} />

        <div
          className="hero-arch absolute inset-0 bg-cover bg-center will-change-[clip-path] [clip-path:inset(27%_13%_0%_13%_round_50vw_50vw_0_0)] md:[clip-path:inset(16%_31%_0%_31%_round_50vw_50vw_0_0)]"
          style={{ backgroundImage: `url(${BASE}/img/sign-1000.webp)` }}
        >
          <SeqCanvas
            ref={canvas}
            name="arrive"
            count={COUNT}
            eager
            className="h-full w-full"
            alt="Walking from Sampige Road through the glass doors of Shree Sai Gold Palace into its double-height lobby"
          />
          <div className="hero-shade pointer-events-none absolute inset-0 opacity-0" style={{ background: "linear-gradient(90deg, rgba(9,8,7,0.62) 0%, rgba(9,8,7,0.18) 45%, rgba(9,8,7,0) 65%), linear-gradient(180deg, rgba(9,8,7,0.55) 0%, rgba(9,8,7,0.1) 30%, rgba(9,8,7,0.1) 55%, rgba(9,8,7,0.78) 100%)" }} />
        </div>

        {/* Title, split either side of the arch */}
        <h1 className="hero-title pointer-events-none absolute inset-x-0 top-[38%] flex -translate-y-1/2 items-center justify-between pl-[4vw] pr-[8vw] font-serif font-light uppercase leading-[0.9] text-ivory max-md:top-[12%] max-md:translate-y-0 max-md:flex-col max-md:gap-1 max-md:px-4">
          <span className="sr-only">Shree Sai Gold Palace</span>
          <span aria-hidden className="hero-title-l split-line text-[clamp(2rem,5.3vw,6.2rem)] tracking-[0.02em] max-md:text-[13vw]">
            <Split text="Shree Sai" />
          </span>
          <span aria-hidden className="hero-title-r split-line gold-chars text-[clamp(2rem,5.3vw,6.2rem)] tracking-[0.02em] max-md:text-[13vw]">
            <Split text="Gold Palace" />
          </span>
        </h1>

        <div className="hero-meta pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-8 md:px-10 md:pb-10">
          <p className="hero-fade label max-w-[11rem] leading-relaxed text-ivory/80 opacity-0">
            Sampige Road
            <br />
            Malleshwaram, Bengaluru
          </p>
          <p className="hero-fade max-w-[19rem] pr-[4vw] text-right font-serif text-lg italic leading-snug text-gold-light opacity-0 max-md:hidden">
            Gold, diamonds, bridal and silver, on three floors.
          </p>
        </div>

        <div className="scroll-cue hero-fade pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 opacity-0 md:bottom-10">
          <span className="label text-ivory">Scroll to explore</span>
          <span className="relative block h-10 w-px overflow-hidden bg-ivory/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gold-light" />
          </span>
        </div>

        {/* Beats */}
        <p className="beat-1 label pointer-events-none absolute bottom-[14%] left-1/2 w-max max-w-[90vw] -translate-x-1/2 text-center text-ivory opacity-0">
          #340 · 11th Cross · Sampige Road
        </p>

        <p className="beat-2 pointer-events-none absolute left-[6vw] top-[22%] whitespace-nowrap font-serif text-[clamp(1.9rem,4.6vw,4.6rem)] font-light leading-[1.04] text-ivory [text-shadow:0_2px_30px_rgba(9,8,7,0.55)]">
          <span className="split-line"><Split by="word" text="Under the old trees" /></span>
          <span className="split-line italic text-gold-light"><Split by="word" text="of Malleshwaram." /></span>
        </p>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-[3vw] font-serif text-[clamp(3rem,11vw,11rem)] font-light uppercase leading-none tracking-[0.04em] [text-shadow:0_4px_50px_rgba(9,8,7,0.6)]">
          <span className="beat-3a text-ivory opacity-0">Step</span>
          <span className="beat-3b gold-text opacity-0">Inside</span>
        </div>

        <div className="beat-4 pointer-events-none absolute bottom-[12%] left-[6vw] max-w-md" style={{ clipPath: "inset(0 100% 0 0)" }}>
          <p className="label mb-4 text-gold-light">The lobby</p>
          <p className="font-serif text-[clamp(1.6rem,3vw,2.8rem)] font-light leading-[1.1] text-ivory">
            Ivory marble, walnut, and a ceiling two storeys high.
          </p>
        </div>

        <p className="beat-5 pointer-events-none absolute inset-x-0 bottom-[16%] px-6 text-center font-serif text-[clamp(1.8rem,4.2vw,4rem)] font-light italic leading-tight text-ivory opacity-0">
          Light, held in rings of crystal.
        </p>
      </div>
    </section>
  );
}
