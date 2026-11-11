"use client";

import { useEffect, useRef, useState } from "react";
import Emblem from "./Emblem";
import { site } from "@/lib/site";
import { ScrollTrigger, scrollToTarget, getLenis } from "@/lib/motion";

const links = [
  { href: "#gold", label: "Showroom" },
  { href: "#craft", label: "In Detail" },
  { href: "#collections", label: "Collections" },
  { href: "#floors", label: "Three Floors" },
  { href: "#house", label: "Our House" },
];

/**
 * Fixed navigation. Its ink flips between ivory and burgundy as light and dark
 * scenes pass beneath it (sections declare data-nav="light" | "dark").
 */
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]")).map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 40px",
        end: "bottom 40px",
        onToggle: (self) => self.isActive && setTone(el.dataset.nav === "light" ? "light" : "dark"),
      }),
    );
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > window.innerHeight * 0.9);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (open) getLenis()?.stop();
    else getLenis()?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.documentElement.style.overflow = "";
    getLenis()?.start();
    requestAnimationFrame(() => scrollToTarget(href));
  };

  const ink = open ? "text-ivory" : tone === "light" ? "text-wine" : "text-ivory";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,color] duration-700 ease-palace ${ink} ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
          <a href="#arrive" onClick={go("#arrive")} className="flex items-center gap-3" aria-label={`${site.name}, back to the start`} data-cursor="link">
            <Emblem className="h-9 w-auto" />
            <span className="font-serif text-[0.95rem] uppercase leading-[1.05] tracking-[0.2em]">
              Shree Sai
              <br />
              Gold Palace
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={go(l.href)} className="label group relative py-2" data-cursor="link">
                {l.label}
                <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-palace group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#visit"
              onClick={go("#visit")}
              className="label hidden border border-current px-5 py-3 transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-ink sm:block"
              data-cursor="link"
            >
              Visit us
            </a>
            <button
              type="button"
              className="relative h-11 w-11 lg:hidden"
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`absolute left-2.5 right-2.5 h-px bg-current transition-transform duration-500 ease-palace ${open ? "top-1/2 rotate-45" : "top-[40%]"}`} />
              <span className={`absolute left-2.5 right-2.5 h-px bg-current transition-transform duration-500 ease-palace ${open ? "top-1/2 -rotate-45" : "top-[60%]"}`} />
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-wine-deep px-6 pb-8 pt-28 transition-[clip-path] duration-700 ease-palace lg:hidden ${
          open ? "[clip-path:inset(0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav aria-label="Menu" className="flex flex-col gap-1">
          {[...links, { href: "#visit", label: "Visit" }].map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={go(l.href)}
              tabIndex={open ? 0 : -1}
              className="flex items-baseline gap-4 border-b border-gold/20 py-4 font-serif text-4xl font-light text-ivory"
            >
              <span className="label text-gold">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="text-sm text-ivory/70">
          <p>{site.address.line1}</p>
          <p>{site.address.line2}</p>
          <a href={`tel:${site.phone.tel}`} tabIndex={open ? 0 : -1} className="mt-3 inline-block text-gold-light">
            {site.phone.display}
          </a>
        </div>
      </div>
    </>
  );
}
