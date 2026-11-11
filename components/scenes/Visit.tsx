"use client";

import { useEffect, useRef } from "react";
import Emblem from "../Emblem";
import Split from "../Split";
import { gsap, prefersReducedMotion, scrollToTarget } from "@/lib/motion";
import { site, whatsappUrl } from "@/lib/site";
import { BASE } from "@/lib/base";

/**
 * Scene 07. The film's last shot, looking down the brass stairwell, plays
 * quietly behind the invitation. The clip loads and plays only while visible.
 */
export default function Visit() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el) return;
    const q = gsap.utils.selector(el);

    let io: IntersectionObserver | null = null;
    if (v && !prefersReducedMotion()) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!v.src) v.src = v.dataset.src!;
            v.play().catch(() => undefined); // autoplay refused: the poster stays, which is fine
          } else v.pause();
        },
        { rootMargin: "25% 0px" },
      );
      io.observe(v);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(q(".visit-bg"), { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true } });
      gsap.fromTo(
        q(".visit-name .split-char"),
        { opacity: 0, filter: "blur(12px)", yPercent: 30 },
        { opacity: 1, filter: "blur(0px)", yPercent: 0, stagger: { each: 0.03, from: "center" }, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: q(".visit-name")[0], start: "top 80%", toggleActions: "play none none reverse" } },
      );
      gsap.fromTo(q(".visit-line"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power3.inOut", scrollTrigger: { trigger: q(".visit-name")[0], start: "top 75%", toggleActions: "play none none reverse" } });
      gsap.fromTo(q(".visit-item"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: q(".visit-grid")[0], start: "top 85%", toggleActions: "play none none reverse" } });
    }, el);

    return () => {
      io?.disconnect();
      ctx.revert();
    };
  }, []);

  const action = "label group relative flex items-center justify-between gap-6 border border-gold/60 px-6 py-5 text-ivory transition-colors duration-500 hover:border-gold-light hover:bg-gold-light hover:text-ink";

  return (
    <section ref={root} id="visit" data-nav="dark" className="relative z-10 overflow-hidden bg-ink">
      <div className="visit-bg absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BASE}/img/stairwell-1000.webp)` }}>
        <video ref={video} data-src={`${BASE}/video/stairwell.mp4`} poster={`${BASE}/img/stairwell-1000.webp`} muted loop playsInline preload="none" aria-hidden tabIndex={-1} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(33,4,11,0.82) 0%, rgba(9,8,7,0.72) 45%, rgba(9,8,7,0.94) 100%)" }} />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-10 pt-32 md:px-10 md:pt-40">
        <div className="text-center">
          <Emblem className="mx-auto h-16 w-auto text-gold-light" />
          <h2 className="visit-name gold-chars mt-8 font-serif text-[clamp(2.4rem,8.4vw,8.5rem)] font-light uppercase leading-[0.95] tracking-[0.05em]">
            <span className="block"><Split text="Shree Sai" /></span>
            <span className="block"><Split text="Gold Palace" /></span>
          </h2>
          <div className="visit-line hairline mx-auto mt-9 w-48" />
          <p className="mt-8 font-serif text-[clamp(1.3rem,2.4vw,2.1rem)] font-light italic text-ivory">Discover the collection. Experience the craftsmanship.</p>
        </div>

        <div className="visit-grid mt-16 grid gap-12 md:mt-24 md:grid-cols-2 md:gap-x-20 md:gap-y-12">
          <address className="visit-item not-italic">
            <p className="label mb-4 text-gold">The showroom</p>
            <p className="font-serif text-2xl font-light leading-snug text-ivory">
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
          </address>

          <div className="visit-item">
            <p className="label mb-4 text-gold">Hours</p>
            <p className="font-serif text-2xl font-light leading-snug text-ivory">
              {site.hours.time}
              <br />
              <span className="text-ivory/70">{site.hours.days}</span>
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ivory/60">
              Toll-free{" "}
              <a href={`tel:${site.tollFree.tel}`} className="border-b border-gold/50 text-ivory hover:text-gold-light">{site.tollFree.display}</a>
              <br />
              <a href={`mailto:${site.email}`} className="border-b border-gold/50 text-ivory hover:text-gold-light">{site.email}</a>
            </p>
          </div>

          <div className="visit-item flex flex-col gap-3 md:col-span-2 md:flex-row [&>a]:md:flex-1">
            <a href={`tel:${site.phone.tel}`} className={action} data-cursor="link">
              <span>Call the showroom</span>
              <span className="tracking-[0.12em]">{site.phone.display}</span>
            </a>
            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={action} data-cursor="link">
                <span>WhatsApp</span>
                <span aria-hidden>↗</span>
              </a>
            ) : null}
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={action} data-cursor="link">
              <span>Directions in Google Maps</span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        <footer className="mt-20 border-t border-gold/25 pt-7 text-xs leading-relaxed text-ivory/50 md:mt-28">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl">
              Also in {site.otherShowrooms.slice(0, -1).join(", ")} and {site.otherShowrooms.at(-1)}.{" "}
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="border-b border-gold/40 text-ivory/75 hover:text-gold-light">saigoldpalace.com</a>
            </p>
            <button type="button" onClick={() => scrollToTarget(0)} className="label self-start border-b border-gold/40 pb-1 text-ivory/75 hover:text-gold-light md:self-auto" data-cursor="link">
              Back to the entrance ↑
            </button>
          </div>
          <p className="mt-6">
            © {new Date().getFullYear()} {site.name}. {site.credit}.
          </p>
        </footer>
      </div>
    </section>
  );
}
