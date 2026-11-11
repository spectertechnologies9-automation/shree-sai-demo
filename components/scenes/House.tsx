"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { site } from "@/lib/site";
import { BASE } from "@/lib/base";

const statement =
  "A jewellery house is judged in small moments. The patience to bring out one more tray. A chair pulled up for the grandmother who came to give her opinion. Light good enough to see what you are choosing. We built the Malleshwaram showroom around those moments.";

/**
 * Scene 06. The page turns to ivory and slows down. The statement is read
 * into ink word by word as it is scrolled; nothing else moves.
 */
export default function House() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        q(".read-word"),
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: q(".read")[0], start: "top 78%", end: "bottom 45%", scrub: 0.4 } },
      );
      gsap.fromTo(q(".house-img img"), { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: q(".house-img")[0], start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(q(".house-img"), { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0% 0 0%)", ease: "power2.out", scrollTrigger: { trigger: q(".house-img")[0], start: "top 85%", end: "top 35%", scrub: 0.5 } });
      gsap.fromTo(q(".fact"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: q(".facts")[0], start: "top 82%", toggleActions: "play none none reverse" } });
      gsap.fromTo(q(".fact-rule"), { scaleX: 0 }, { scaleX: 1, stagger: 0.12, duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: q(".facts")[0], start: "top 82%", toggleActions: "play none none reverse" } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="house" data-nav="light" className="relative z-10 bg-ivory text-wine-deep">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-10 md:pb-40 md:pt-48">
        <p className="label mb-10 text-gold-dark">Our house</p>
        <p className="read font-serif text-[clamp(1.7rem,3.7vw,3.5rem)] font-light leading-[1.18]">
          <span className="sr-only">{statement}</span>
          <span aria-hidden>
            {statement.split(" ").map((w, i) => (
              <span key={i} className="read-word">
                {w}{" "}
              </span>
            ))}
          </span>
        </p>

        <div className="house-img relative mt-20 aspect-[21/9] overflow-hidden max-md:aspect-[4/3] md:mt-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE}/img/hall-1000.webp`}
            srcSet={`${BASE}/img/hall-1000.webp 1000w, ${BASE}/img/hall-2000.webp 2000w`}
            sizes="100vw"
            alt="The gold hall at Shree Sai Gold Palace, with customers seated at the counters"
            loading="lazy"
            decoding="async"
            className="h-[116%] w-full object-cover"
          />
        </div>

        <dl className="facts mt-16 grid gap-10 md:mt-24 md:grid-cols-3 md:gap-14">
          {[
            { k: "Since", v: String(site.since), d: "Jewellers in Bengaluru for over three decades." },
            { k: "Showrooms", v: "Seven", d: `Malleshwaram, with ${site.otherShowrooms.slice(0, -1).join(", ")} and ${site.otherShowrooms.at(-1)}.` },
            { k: "Open", v: "Every day", d: `${site.hours.time}, Sundays included.` },
          ].map((f) => (
            <div key={f.k} className="fact">
              <div className="fact-rule mb-6 h-px origin-left bg-wine/30" />
              <dt className="label text-gold-dark">{f.k}</dt>
              <dd className="mt-3 font-serif text-[clamp(2.6rem,4.4vw,4.2rem)] font-light leading-none text-wine">{f.v}</dd>
              <dd className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-wine-deep/70">{f.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
